// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "../libraries/math/SafeMath.sol";
import "../libraries/token/SafeERC20.sol";
import "../libraries/utils/ReentrancyGuard.sol";
import "../tokens/interfaces/IWETH.sol";
import "./interfaces/IRewardRouterV2Extended.sol";
import "./interfaces/IRewardTracker.sol";
import "../core/interfaces/IGlpManager.sol";

/**
 * @title YieldBearingALPVault
 * @notice EIP-4626 compliant vault that holds fsALP on behalf of users
 * @dev Only accepts ETH/native token deposits
 */
contract YieldBearingALPVault is ReentrancyGuard {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    string public constant name = "Yield Bearing ALP";
    string public constant symbol = "yALP";
    uint8 public constant decimals = 18;

    IRewardRouterV2Extended public immutable rewardRouter;
    IRewardTracker public immutable fsAlp;
    IGlpManager public immutable glpManager;
    IWETH public immutable weth;
    IERC20 public immutable esAmp;
    
    address public keeper;
    address public gov;
    
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    // Events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Deposit(address indexed sender, address indexed owner, uint256 assets, uint256 shares);
    event Withdraw(
        address indexed sender,
        address indexed receiver,
        address indexed owner,
        uint256 assets,
        uint256 shares
    );

    modifier onlyGov() {
        require(msg.sender == gov, "YieldBearingALP: forbidden");
        _;
    }

    constructor(
        address _rewardRouter,
        address _fsAlp,
        address _glpManager,
        address _weth,
        address _esAmp
    ) public {
        rewardRouter = IRewardRouterV2Extended(_rewardRouter);
        fsAlp = IRewardTracker(_fsAlp);
        glpManager = IGlpManager(_glpManager);
        weth = IWETH(_weth);
        esAmp = IERC20(_esAmp);
        
        gov = msg.sender;
        keeper = msg.sender;
    }

    // ========== DEPOSIT FUNCTION ==========

    /**
     * @notice Deposit ETH and receive yALP
     * @param _minUsdg Minimum USDG to accept (slippage protection)
     * @param _minGlp Minimum GLP to accept (slippage protection)
     * @param _receiver Address to receive yALP tokens
     * @return shares Amount of yALP minted
     */
    function depositETH(
        uint256 _minUsdg,
        uint256 _minGlp,
        address _receiver
    ) external payable nonReentrant returns (uint256 shares) {
        require(msg.value > 0, "YieldBearingALP: zero value");
        require(_receiver != address(0), "YieldBearingALP: zero receiver");
        
        // Get current fsALP balance
        uint256 fsAlpBefore = totalAssets();
        
        // Mint and stake GLP with ETH - vault receives fsALP
        rewardRouter.mintAndStakeGlpETH{value: msg.value}(_minUsdg, _minGlp);
        
        // Calculate how much fsALP we received
        uint256 fsAlpAfter = totalAssets();
        uint256 fsAlpReceived = fsAlpAfter.sub(fsAlpBefore);
        require(fsAlpReceived > 0, "YieldBearingALP: no fsALP received");
        
        // Calculate shares to mint based on the state BEFORE the deposit
        if (totalSupply == 0) {
            shares = fsAlpReceived;
        } else {
            shares = fsAlpReceived.mul(totalSupply).div(fsAlpBefore);
        }
        
        // Mint yALP to receiver
        totalSupply = totalSupply.add(shares);
        balanceOf[_receiver] = balanceOf[_receiver].add(shares);
        
        emit Transfer(address(0), _receiver, shares);
        emit Deposit(msg.sender, _receiver, fsAlpReceived, shares);
    }

    // ========== WITHDRAW FUNCTION ==========

    /**
     * @notice Withdraw yALP and receive ETH
     * @param _shares Amount of yALP to burn
     * @param _minOut Minimum ETH to receive (slippage protection)
     * @param _receiver Address to receive ETH
     * @return amountOut Amount of ETH received
     */
    function withdrawETH(
        uint256 _shares,
        uint256 _minOut,
        address payable _receiver
    ) external nonReentrant returns (uint256 amountOut) {
        require(_shares > 0, "YieldBearingALP: zero shares");
        require(_shares <= balanceOf[msg.sender], "YieldBearingALP: insufficient shares");
        require(_receiver != address(0), "YieldBearingALP: zero receiver");
        
        // Calculate fsALP amount to unstake
        uint256 fsAlpAmount = convertToAssets(_shares);
        
        // Burn yALP shares
        totalSupply = totalSupply.sub(_shares);
        balanceOf[msg.sender] = balanceOf[msg.sender].sub(_shares);
        
        // Unstake and redeem GLP for ETH
        amountOut = rewardRouter.unstakeAndRedeemGlpETH(fsAlpAmount, _minOut, _receiver);
        
        emit Transfer(msg.sender, address(0), _shares);
        emit Withdraw(msg.sender, _receiver, msg.sender, fsAlpAmount, _shares);
    }

    // ========== VIEW FUNCTIONS ==========

    /**
     * @notice Total amount of fsALP managed by the vault
     */
    function totalAssets() public view returns (uint256) {
        return fsAlp.stakedAmounts(address(this));
    }

    /**
     * @notice Convert yALP shares to fsALP assets
     */
    function convertToAssets(uint256 shares) public view returns (uint256) {
        if (totalSupply == 0) return shares;
        return shares.mul(totalAssets()).div(totalSupply);
    }

    /**
     * @notice Convert fsALP assets to yALP shares
     */
    function convertToShares(uint256 assets) public view returns (uint256) {
        uint256 supply = totalSupply;
        if (supply == 0) return assets;
        return assets.mul(supply).div(totalAssets());
    }

    // ========== COMPOUND FUNCTION ==========

    /**
     * @notice Compound WETH rewards by buying more ALP
     * @dev Can be called by anyone to benefit all vault users
     */
    function compound() external nonReentrant {
        // Claim all rewards
        rewardRouter.claim();
        
        uint256 wethBalance = IERC20(address(weth)).balanceOf(address(this));
        if (wethBalance == 0) return;

        // Approve and buy more ALP with WETH
        IERC20(address(weth)).safeApprove(address(rewardRouter), wethBalance);
        
        // Use low-level call to get price for slippage protection
        (bool success, bytes memory data) = address(glpManager).staticcall(
            abi.encodeWithSignature("getPrice(bool)", false)
        );
        require(success, "Failed to get GLP price");
        uint256 glpPrice = abi.decode(data, (uint256));
        
        uint256 expectedGlp = wethBalance.mul(10 ** 30).div(glpPrice);
        uint256 minGlp = expectedGlp.mul(99).div(100); // 1% slippage
        
        rewardRouter.mintAndStakeGlp(
            address(weth),
            wethBalance,
            0, // minUsdg
            minGlp
        );
    }

    // ========== ERC20 FUNCTIONS ==========

    function transfer(address recipient, uint256 amount) external returns (bool) {
        _transfer(msg.sender, recipient, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool) {
        uint256 currentAllowance = allowance[sender][msg.sender];
        require(currentAllowance >= amount, "YieldBearingALP: insufficient allowance");
        
        if (currentAllowance != type(uint256).max) {
            allowance[sender][msg.sender] = currentAllowance.sub(amount);
        }
        
        _transfer(sender, recipient, amount);
        return true;
    }

    function _transfer(address sender, address recipient, uint256 amount) internal {
        require(sender != address(0), "YieldBearingALP: transfer from zero");
        require(recipient != address(0), "YieldBearingALP: transfer to zero");
        require(amount <= balanceOf[sender], "YieldBearingALP: insufficient balance");
        
        balanceOf[sender] = balanceOf[sender].sub(amount);
        balanceOf[recipient] = balanceOf[recipient].add(amount);
        
        emit Transfer(sender, recipient, amount);
    }

    // ========== ADMIN FUNCTIONS ==========

    function setKeeper(address _keeper) external onlyGov {
        keeper = _keeper;
    }

    function setGov(address _gov) external onlyGov {
        gov = _gov;
    }

    /**
     * @notice Recover tokens sent by mistake (except fsALP)
     * @param _token Token to recover
     * @param _amount Amount to recover
     * @param _receiver Address to receive tokens
     */
    function recoverToken(address _token, uint256 _amount, address _receiver) external onlyGov {
        require(_token != address(fsAlp), "YieldBearingALP: cannot recover fsALP");
        IERC20(_token).safeTransfer(_receiver, _amount);
    }

    receive() external payable {}
}