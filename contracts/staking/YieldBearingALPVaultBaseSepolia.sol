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
 * @title YieldBearingALPVaultBaseSepolia
 * @notice EIP-4626 compliant tokenized vault for Amped's ALP tokens on Base Sepolia
 * @dev Wraps ALP tokens into yield-bearing yALP tokens that auto-compound rewards
 * @author Amped Finance
 */
contract YieldBearingALPVaultBaseSepolia is ReentrancyGuard {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    // ========== STATE VARIABLES ==========
    
    IRewardRouterV2Extended public immutable rewardRouter;
    IERC20 public immutable fsAlp; // fee + staked ALP
    IGlpManager public immutable glpManager;
    IWETH public immutable weth; // WETH on Base
    IERC20 public immutable esAmp;
    
    // ERC20 state
    string public constant name = "Yield Bearing ALP (Base Sepolia)";
    string public constant symbol = "yALP.bs";
    uint8 public constant decimals = 18;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    // Admin state
    address public gov;
    address public keeper;
    
    // Compound tracking
    uint256 public totalCompoundedRewards;
    
    // Deposit tracking - removed as we rely on GLP Manager's cooldown
    // mapping(address => uint256) public lastDeposit;
    
    // Events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Deposit(address indexed sender, address indexed owner, uint256 assets, uint256 shares);
    event Withdraw(address indexed sender, address indexed receiver, address indexed owner, uint256 assets, uint256 shares);
    event Compound(uint256 wethAmount, uint256 alpGained);
    
    // ========== CONSTRUCTOR ==========
    
    constructor(
        address _rewardRouter,
        address _fsAlp,
        address _glpManager,
        address _weth,
        address _esAmp
    ) public {
        rewardRouter = IRewardRouterV2Extended(_rewardRouter);
        fsAlp = IERC20(_fsAlp);
        glpManager = IGlpManager(_glpManager);
        weth = IWETH(_weth);
        esAmp = IERC20(_esAmp);
        gov = msg.sender;
        keeper = msg.sender; // Initially set deployer as keeper
    }
    
    // ========== MODIFIERS ==========
    
    modifier onlyGov() {
        require(msg.sender == gov, "YieldBearingALP: forbidden");
        _;
    }
    
    modifier onlyKeeper() {
        require(msg.sender == keeper, "YieldBearingALP: only keeper");
        _;
    }
    
    // ========== VIEW FUNCTIONS ==========
    
    function totalAssets() public view returns (uint256) {
        return fsAlp.balanceOf(address(this));
    }
    
    function convertToShares(uint256 assets) public view returns (uint256) {
        uint256 supply = totalSupply;
        return supply == 0 ? 0 : assets.mul(supply).div(totalAssets());
    }
    
    function convertToAssets(uint256 shares) public view returns (uint256) {
        uint256 supply = totalSupply;
        return supply == 0 ? 0 : shares.mul(totalAssets()).div(supply);
    }
    
    
    function previewMint(uint256 shares) public view returns (uint256) {
        uint256 supply = totalSupply;
        return supply == 0 ? shares : shares.mul(totalAssets()).add(supply.sub(1)).div(supply);
    }
    
    function previewWithdraw(uint256 assets) public view returns (uint256) {
        uint256 supply = totalSupply;
        return supply == 0 ? assets : assets.mul(supply).add(totalAssets().sub(1)).div(totalAssets());
    }
    
    function previewRedeem(uint256 shares) public view returns (uint256) {
        return convertToAssets(shares);
    }
    
    function maxDeposit(address) public pure returns (uint256) {
        return uint256(-1);
    }
    
    function maxMint(address) public pure returns (uint256) {
        return uint256(-1);
    }
    
    function maxWithdraw(address owner) public view returns (uint256) {
        return convertToAssets(balanceOf[owner]);
    }
    
    function maxRedeem(address owner) public view returns (uint256) {
        return balanceOf[owner];
    }
    
    function asset() public view returns (address) {
        return address(fsAlp);
    }
    
    // ========== AUM FUNCTION ==========
    
    function getAum(bool maximise) public view returns (uint256) {
        return glpManager.getAumInUsdg(maximise);
    }
    
    // ========== COOLDOWN FUNCTIONS ==========
    // Removed - relying on GLP Manager's cooldown mechanism instead
    
    // ========== DEPOSIT FUNCTIONS ==========
    
    function depositS(uint256 minUsdg, uint256 minGlp) external payable nonReentrant returns (uint256 shares) {
        require(msg.value > 0, "YieldBearingALP: zero amount");
        
        // Get the current fsALP balance before minting
        uint256 fsAlpBefore = fsAlp.balanceOf(address(this));
        
        // Mint and stake GLP through reward router
        uint256 fsAlpReceived = rewardRouter.mintAndStakeGlpETH{value: msg.value}(minUsdg, minGlp);
        require(fsAlpReceived > 0, "YieldBearingALP: mint failed");
        
        // Calculate shares to mint based on the state BEFORE the deposit
        if (totalSupply == 0) {
            shares = fsAlpReceived;
        } else {
            shares = fsAlpReceived.mul(totalSupply).div(fsAlpBefore);
        }
        
        // Mint shares
        require(shares > 0, "YieldBearingALP: zero shares");
        totalSupply = totalSupply.add(shares);
        balanceOf[msg.sender] = balanceOf[msg.sender].add(shares);
        
        // Cooldown is now handled by GLP Manager
        
        emit Transfer(address(0), msg.sender, shares);
        emit Deposit(msg.sender, msg.sender, fsAlpReceived, shares);
    }
    
    // ========== WITHDRAW FUNCTIONS ==========
    
    function withdrawS(uint256 shares, uint256 minOut, address receiver) external nonReentrant returns (uint256 amountOut) {
        require(shares > 0, "YieldBearingALP: zero shares");
        require(shares <= balanceOf[msg.sender], "YieldBearingALP: insufficient balance");
        require(receiver != address(0), "YieldBearingALP: zero receiver");
        
        // Cooldown check removed - GLP Manager handles this
        
        // Calculate assets to withdraw
        uint256 assets = convertToAssets(shares);
        require(assets > 0, "YieldBearingALP: zero assets");
        
        // Burn shares
        totalSupply = totalSupply.sub(shares);
        balanceOf[msg.sender] = balanceOf[msg.sender].sub(shares);
        
        emit Transfer(msg.sender, address(0), shares);
        
        // Unstake and redeem to ETH through reward router
        amountOut = rewardRouter.unstakeAndRedeemGlpETH(assets, minOut, payable(receiver));
        require(amountOut > 0, "YieldBearingALP: redeem failed");
        
        emit Withdraw(msg.sender, receiver, msg.sender, assets, shares);
    }
    
    // ========== COMPOUND FUNCTION ==========
    
    function compound() external nonReentrant onlyKeeper {
        // Claim all rewards (WETH and esAMP)
        rewardRouter.claim();
        
        // Get WETH balance
        uint256 wethBalance = IERC20(address(weth)).balanceOf(address(this));
        require(wethBalance > 0, "YieldBearingALP: no rewards");
        
        // Convert WETH to native ETH by withdrawing
        weth.withdraw(wethBalance);
        
        // Mint and stake more GLP with the ETH
        uint256 alpReceived = rewardRouter.mintAndStakeGlpETH{value: wethBalance}(0, 0);
        require(alpReceived > 0, "YieldBearingALP: compound failed");
        
        // Track compounded rewards
        totalCompoundedRewards = totalCompoundedRewards.add(alpReceived);
        
        // Note: compound does not update any user's cooldown as it doesn't affect individual positions
        
        emit Compound(wethBalance, alpReceived);
    }
    
    // ========== ERC20 FUNCTIONS ==========
    
    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }
    
    function transfer(address recipient, uint256 amount) external returns (bool) {
        _transfer(msg.sender, recipient, amount);
        return true;
    }
    
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool) {
        uint256 currentAllowance = allowance[sender][msg.sender];
        require(currentAllowance >= amount, "YieldBearingALP: insufficient allowance");
        
        if (currentAllowance != uint256(-1)) {
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

    function setGov(address _gov) external onlyGov {
        gov = _gov;
    }
    
    function setKeeper(address _keeper) external onlyGov {
        keeper = _keeper;
    }

    function recoverToken(address _token, uint256 _amount, address _receiver) external onlyGov {
        require(
            _token != address(fsAlp) && 
            _token != address(weth) && 
            _token != address(esAmp), 
            "YieldBearingALP: cannot recover core vault tokens"
        );
        IERC20(_token).safeTransfer(_receiver, _amount);
    }

    receive() external payable {}
} 