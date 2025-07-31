// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "../libraries/math/SafeMath.sol";
import "../libraries/token/IERC20.sol";
import "../libraries/token/SafeERC20.sol";
import "../libraries/utils/ReentrancyGuard.sol";
import "../libraries/utils/Address.sol";
import "../access/Governable.sol";
import "./interfaces/IRewardRouterV2Extended.sol";
import "./interfaces/IRewardTracker.sol";
import "../core/interfaces/IGlpManager.sol";
import "../tokens/interfaces/IWETH.sol";
import "../peripherals/interfaces/ITimelockTarget.sol";

interface ISwapRouter {
    function swap(address tokenIn, address tokenOut, uint256 amountIn) external returns (uint256);
    function getAmountOut(address tokenIn, address tokenOut, uint256 amountIn) external view returns (uint256);
}

contract AmpedStakingRouter is ReentrancyGuard, Governable, ITimelockTarget {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using Address for address payable;

    // EIP-712 Domain
    bytes32 public constant DOMAIN_TYPEHASH = keccak256(
        "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
    );
    bytes32 public constant STAKE_TYPEHASH = keccak256(
        "Stake(address account,uint256 amount,uint256 nonce,uint256 deadline)"
    );
    bytes32 public constant UNSTAKE_TYPEHASH = keccak256(
        "Unstake(address account,uint256 amount,uint256 nonce,uint256 deadline)"
    );
    
    bytes32 public DOMAIN_SEPARATOR;
    mapping(address => uint256) public nonces;

    address public ampedToken;
    address public ampToken;
    address public rewardRouter;
    address public swapRouter;
    address public weth;
    
    // Reward tracker addresses
    address public stakedGmxTracker;
    address public bonusGmxTracker;
    address public feeGmxTracker;
    
    bool public isInitialized;
    bool public swapEnabled = true;
    bool public paused = false;
    
    uint256 public minAmountOut = 9500; // 95% minimum, can be adjusted by governance
    uint256 public constant BASIS_POINTS = 10000;
    
    mapping(address => bool) public isHandler;
    
    // Reserve management for direct 1:1 swaps
    mapping(address => uint256) public minReserveRatio;
    mapping(address => uint256) public totalDeposited;
    
    event StakeAmped(address indexed account, uint256 ampedAmount, uint256 ampAmount);
    event UnstakeAmped(address indexed account, uint256 ampAmount, uint256 ampedAmount);
    event MintAndStakeGlp(address indexed account, address token, uint256 amount, uint256 minUsdg, uint256 minGlp, uint256 glpAmount);
    event SwapEnabledSet(bool enabled);
    event MinAmountOutSet(uint256 minAmountOut);
    event HandlerSet(address handler, bool isActive);
    event Paused(address account);
    event Unpaused(address account);
    event Initialized(address ampedToken, address ampToken, address rewardRouter, address swapRouter, address weth);
    event RewardTrackersSet(address stakedGmxTracker, address bonusGmxTracker, address feeGmxTracker);
    event TokenWithdrawn(address token, address account, uint256 amount);
    event MinReserveRatioSet(address token, uint256 ratio);
    event ReserveDeposited(address token, uint256 amount);
    event ReserveWithdrawn(address token, uint256 amount);
    event GovSet(address indexed oldGov, address indexed newGov);
    event SwapRouterSet(address indexed oldSwapRouter, address indexed newSwapRouter);
    event RewardRouterSet(address indexed oldRewardRouter, address indexed newRewardRouter);
    event WethSet(address indexed oldWeth, address indexed newWeth);
    
    modifier onlyHandler() {
        require(isHandler[msg.sender] || msg.sender == gov, "AmpedStakingRouter: forbidden");
        _;
    }
    
    modifier whenNotPaused() {
        require(!paused, "AmpedStakingRouter: paused");
        _;
    }
    
    function initialize(
        address _ampedToken,
        address _ampToken,
        address _rewardRouter,
        address _swapRouter,
        address _weth
    ) external onlyGov {
        require(!isInitialized, "AmpedStakingRouter: already initialized");
        require(_ampedToken != address(0), "AmpedStakingRouter: zero address");
        require(_ampToken != address(0), "AmpedStakingRouter: zero address");
        require(_rewardRouter != address(0), "AmpedStakingRouter: zero address");
        require(_swapRouter != address(0), "AmpedStakingRouter: zero address");
        require(_weth != address(0), "AmpedStakingRouter: zero address");
        
        isInitialized = true;
        
        ampedToken = _ampedToken;
        ampToken = _ampToken;
        rewardRouter = _rewardRouter;
        swapRouter = _swapRouter;
        weth = _weth;
        
        // Initialize EIP-712 domain separator
        uint256 chainId;
        assembly {
            chainId := chainid()
        }
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                DOMAIN_TYPEHASH,
                keccak256(bytes("AmpedStakingRouter")),
                keccak256(bytes("1")),
                chainId,
                address(this)
            )
        );
        
        emit Initialized(_ampedToken, _ampToken, _rewardRouter, _swapRouter, _weth);
    }
    
    function setRewardTrackers(
        address _stakedGmxTracker,
        address _bonusGmxTracker,
        address _feeGmxTracker
    ) external onlyGov {
        stakedGmxTracker = _stakedGmxTracker;
        bonusGmxTracker = _bonusGmxTracker;
        feeGmxTracker = _feeGmxTracker;
        
        emit RewardTrackersSet(_stakedGmxTracker, _bonusGmxTracker, _feeGmxTracker);
    }
    
    function setHandler(address _handler, bool _isActive) external onlyGov {
        isHandler[_handler] = _isActive;
        emit HandlerSet(_handler, _isActive);
    }
    
    function setSwapEnabled(bool _enabled) external onlyGov {
        swapEnabled = _enabled;
        emit SwapEnabledSet(_enabled);
    }
    
    function setMinAmountOut(uint256 _minAmountOut) external onlyGov {
        require(_minAmountOut <= BASIS_POINTS, "AmpedStakingRouter: invalid minAmountOut");
        minAmountOut = _minAmountOut;
        emit MinAmountOutSet(_minAmountOut);
    }
    
    function setMinReserveRatio(address _token, uint256 _ratio) external onlyGov {
        require(_ratio <= BASIS_POINTS, "AmpedStakingRouter: invalid ratio");
        minReserveRatio[_token] = _ratio;
        emit MinReserveRatioSet(_token, _ratio);
    }
    
    function setSwapRouter(address _swapRouter) external onlyGov {
        require(_swapRouter != address(0), "Invalid swapRouter address");
        emit SwapRouterSet(swapRouter, _swapRouter);
        swapRouter = _swapRouter;
    }
    
    function setRewardRouter(address _rewardRouter) external onlyGov {
        require(_rewardRouter != address(0), "Invalid rewardRouter address");
        emit RewardRouterSet(rewardRouter, _rewardRouter);
        rewardRouter = _rewardRouter;
    }
    
    function setWeth(address _weth) external onlyGov {
        require(_weth != address(0), "Invalid WETH address");
        emit WethSet(weth, _weth);
        weth = _weth;
    }
    
    function pause() external onlyGov {
        paused = true;
        emit Paused(msg.sender);
    }
    
    function unpause() external onlyGov {
        paused = false;
        emit Unpaused(msg.sender);
    }

    function setGov(address _gov) external override(Governable, ITimelockTarget) onlyGov {
        require(_gov != address(0), "Invalid gov address");
        emit GovSet(gov, _gov);
        gov = _gov;
    }
    
    function stakeAmped(uint256 _amount) external nonReentrant whenNotPaused returns (uint256) {
        return _stakeAmped(msg.sender, _amount);
    }
    
    function stakeAmpedForAccount(
        address _account,
        uint256 _amount,
        uint256 _deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external nonReentrant whenNotPaused returns (uint256) {
        require(block.timestamp <= _deadline, "AmpedStakingRouter: expired signature");
        
        bytes32 structHash = keccak256(
            abi.encode(
                STAKE_TYPEHASH,
                _account,
                _amount,
                nonces[_account]++,
                _deadline
            )
        );
        
        bytes32 digest = keccak256(
            abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash)
        );
        
        address signer = ecrecover(digest, v, r, s);
        require(signer == _account, "AmpedStakingRouter: invalid signature");
        
        return _stakeAmped(_account, _amount);
    }
    
    function _stakeAmped(address _account, uint256 _amount) private returns (uint256) {
        require(_amount > 0, "AmpedStakingRouter: invalid amount");
        
        // Transfer AMPED from user
        IERC20(ampedToken).safeTransferFrom(_account, address(this), _amount);
        totalDeposited[ampedToken] = totalDeposited[ampedToken].add(_amount);
        
        uint256 ampAmount;
        
        if (swapEnabled && swapRouter != address(0)) {
            // Get expected output amount
            uint256 expectedOut = ISwapRouter(swapRouter).getAmountOut(ampedToken, ampToken, _amount);
            uint256 minOut = _amount.mul(minAmountOut).div(BASIS_POINTS);
            require(expectedOut >= minOut, "AmpedStakingRouter: insufficient output amount");
            
            // Safely handle approval to avoid race conditions
            uint256 currentAllowance = IERC20(ampedToken).allowance(address(this), swapRouter);
            if (currentAllowance > 0) {
                IERC20(ampedToken).safeApprove(swapRouter, 0);
            }
            IERC20(ampedToken).safeApprove(swapRouter, _amount);
            
            // Perform swap
            ampAmount = ISwapRouter(swapRouter).swap(ampedToken, ampToken, _amount);
            require(ampAmount >= minOut, "AmpedStakingRouter: slippage exceeded");
        } else {
            // Direct 1:1 conversion if swap is disabled
            _validateReserves(ampToken);
            require(IERC20(ampToken).balanceOf(address(this)) >= _amount, "Insufficient AMP balance");
            ampAmount = _amount;
            
            uint256 newBalance = IERC20(ampToken).balanceOf(address(this)).sub(ampAmount);
            if (totalDeposited[ampToken] > newBalance) {
                totalDeposited[ampToken] = newBalance;
            }
        }
        
        // Approve for first stake
        uint256 currentAllowance = IERC20(ampToken).allowance(address(this), stakedGmxTracker);
        if (currentAllowance > 0) IERC20(ampToken).safeApprove(stakedGmxTracker, 0);
        IERC20(ampToken).safeApprove(stakedGmxTracker, ampAmount);

        // Step 1: Stake AMP into stakedGmxTracker (pulls from this, mints sAMP to _account)
        IRewardTracker(stakedGmxTracker).stakeForAccount(address(this), _account, ampToken, ampAmount);

        // Step 2: As handler, transfer sAMP from _account to this (no user approval needed)
        IERC20(stakedGmxTracker).transferFrom(_account, address(this), ampAmount);

        // Approve for next stake
        currentAllowance = IERC20(stakedGmxTracker).allowance(address(this), bonusGmxTracker);
        if (currentAllowance > 0) IERC20(stakedGmxTracker).safeApprove(bonusGmxTracker, 0);
        IERC20(stakedGmxTracker).safeApprove(bonusGmxTracker, ampAmount);

        // Step 3: Stake sAMP into bonusGmxTracker (mints bnAMP to _account)
        IRewardTracker(bonusGmxTracker).stakeForAccount(address(this), _account, stakedGmxTracker, ampAmount);

        // Step 4: Transfer bnAMP from _account to this
        IERC20(bonusGmxTracker).transferFrom(_account, address(this), ampAmount);

        // Approve for final stake
        currentAllowance = IERC20(bonusGmxTracker).allowance(address(this), feeGmxTracker);
        if (currentAllowance > 0) IERC20(bonusGmxTracker).safeApprove(feeGmxTracker, 0);
        IERC20(bonusGmxTracker).safeApprove(feeGmxTracker, ampAmount);

        // Step 5: Stake bnAMP into feeGmxTracker (mints fAMP to _account)
        IRewardTracker(feeGmxTracker).stakeForAccount(address(this), _account, bonusGmxTracker, ampAmount);
        
        emit StakeAmped(_account, _amount, ampAmount);
        
        return ampAmount;
    }
    
    function unstakeAmped(uint256 _amount) external nonReentrant returns (uint256) {
        return _unstakeAmped(msg.sender, _amount);
    }
    
    function unstakeAmpedForAccount(
        address _account,
        uint256 _amount,
        uint256 _deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external nonReentrant whenNotPaused returns (uint256) {
        require(block.timestamp <= _deadline, "AmpedStakingRouter: expired signature");
        
        bytes32 structHash = keccak256(
            abi.encode(
                UNSTAKE_TYPEHASH,
                _account,
                _amount,
                nonces[_account]++,
                _deadline
            )
        );
        
        bytes32 digest = keccak256(
            abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash)
        );
        
        address signer = ecrecover(digest, v, r, s);
        require(signer == _account, "AmpedStakingRouter: invalid signature");
        
        return _unstakeAmped(_account, _amount);
    }
    
    function _unstakeAmped(address _account, uint256 _amount) private returns (uint256) {
        require(_amount > 0, "AmpedStakingRouter: invalid amount");

        // Unstake from all trackers in reverse order, transferring tokens to this router
        _unstakeFromTrackers(_account, _amount);
        totalDeposited[ampToken] = totalDeposited[ampToken].add(_amount);

        uint256 ampedAmount;
        if (swapEnabled && swapRouter != address(0)) {
            uint256 expectedOut = ISwapRouter(swapRouter).getAmountOut(ampToken, ampedToken, _amount);
            uint256 minOut = _amount.mul(minAmountOut).div(BASIS_POINTS);
            require(expectedOut >= minOut, "AmpedStakingRouter: insufficient output amount");

            uint256 currentAllowance = IERC20(ampToken).allowance(address(this), swapRouter);
            if (currentAllowance > 0) {
                IERC20(ampToken).safeApprove(swapRouter, 0);
            }
            IERC20(ampToken).safeApprove(swapRouter, _amount);
            
            ampedAmount = ISwapRouter(swapRouter).swap(ampToken, ampedToken, _amount);
            require(ampedAmount >= minOut, "AmpedStakingRouter: slippage exceeded");
        } else {
            // Direct 1:1 conversion if swap is disabled
            _validateReserves(ampedToken);
            require(IERC20(ampedToken).balanceOf(address(this)) >= _amount, "Insufficient AMPED balance");
            ampedAmount = _amount;
        }

        // Transfer AMPED to user
        IERC20(ampedToken).safeTransfer(_account, ampedAmount);
        
        uint256 newBalance = IERC20(ampedToken).balanceOf(address(this));
        if (totalDeposited[ampedToken] > newBalance) {
            totalDeposited[ampedToken] = newBalance;
        }

        emit UnstakeAmped(_account, _amount, ampedAmount);

        return ampedAmount;
    }

    function _unstakeFromTrackers(address _account, uint256 _amount) private {
        // Step 1: Unstake from feeGmxTracker, send bnAMP to _account
        IRewardTracker(feeGmxTracker).unstakeForAccount(_account, bonusGmxTracker, _amount, _account);

        // Step 2: Unstake from bonusGmxTracker, send sAMP to _account
        IRewardTracker(bonusGmxTracker).unstakeForAccount(_account, stakedGmxTracker, _amount, _account);

        // Step 3: Unstake from stakedGmxTracker, send AMP to this
        IRewardTracker(stakedGmxTracker).unstakeForAccount(_account, ampToken, _amount, address(this));
    }
    
    function _validateReserves(address _token) private view {
        uint256 balance = IERC20(_token).balanceOf(address(this));
        uint256 minRequired = totalDeposited[_token].mul(minReserveRatio[_token]).div(BASIS_POINTS);
        require(balance >= minRequired, "AmpedStakingRouter: insufficient reserves");
    }

    function depositTokens(address _token, uint256 _amount) external onlyGov {
        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);
        totalDeposited[_token] = totalDeposited[_token].add(_amount);
        emit ReserveDeposited(_token, _amount);
    }
    
    function mintAndStakeGlp(
        address _token,
        uint256 _amount,
        uint256 _minUsdg,
        uint256 _minGlp
    ) external nonReentrant whenNotPaused returns (uint256) {
        return _mintAndStakeGlp(msg.sender, _token, _amount, _minUsdg, _minGlp);
    }
    
    function mintAndStakeGlpETH(uint256 _minUsdg, uint256 _minGlp) external payable nonReentrant whenNotPaused returns (uint256) {
        require(msg.value > 0, "AmpedStakingRouter: invalid msg.value");
        
        IWETH(weth).deposit{value: msg.value}();
        IERC20(weth).approve(rewardRouter, msg.value);
        
        return _mintAndStakeGlp(msg.sender, weth, msg.value, _minUsdg, _minGlp);
    }
    
    function _mintAndStakeGlp(
        address _account,
        address _token,
        uint256 _amount,
        uint256 _minUsdg,
        uint256 _minGlp
    ) private returns (uint256) {
        require(_amount > 0, "AmpedStakingRouter: invalid amount");
        
        address tokenIn = _token;
        uint256 amountIn = _amount;

        // If token is AMPED, swap to WETH first
        if (tokenIn == ampedToken) {
            require(swapEnabled && swapRouter != address(0), "AmpedStakingRouter: swap disabled");
            
            IERC20(ampedToken).safeTransferFrom(_account, address(this), amountIn);
            
            uint256 expectedOut = ISwapRouter(swapRouter).getAmountOut(ampedToken, weth, amountIn);
            uint256 minOut = amountIn.mul(minAmountOut).div(BASIS_POINTS);
            require(expectedOut >= minOut, "AmpedStakingRouter: insufficient output for WETH swap");

            IERC20(ampedToken).safeApprove(swapRouter, amountIn);
            uint256 wethAmount = ISwapRouter(swapRouter).swap(ampedToken, weth, amountIn);
            
            tokenIn = weth;
            amountIn = wethAmount;
        }
        
        // Transfer token from user (if not swapped from AMPED)
        if (_token != ampedToken) {
            IERC20(tokenIn).safeTransferFrom(_account, address(this), amountIn);
        }
        
        // Safely handle approval to avoid race conditions
        uint256 currentAllowance = IERC20(tokenIn).allowance(address(this), rewardRouter);
        if (currentAllowance > 0) {
            IERC20(tokenIn).safeApprove(rewardRouter, 0);
        }
        IERC20(tokenIn).safeApprove(rewardRouter, amountIn);
        
        // Mint and stake GLP through RewardRouter
        uint256 glpAmount = IRewardRouterV2Extended(rewardRouter).mintAndStakeGlp(
            tokenIn,
            amountIn,
            _minUsdg,
            _minGlp
        );
        
        emit MintAndStakeGlp(_account, _token, _amount, _minUsdg, _minGlp, glpAmount);
        
        return glpAmount;
    }
    
    // Emergency withdrawal function - implements ITimelockTarget
    function withdrawToken(address _token, address _account, uint256 _amount) external override onlyGov {
        // Check reserves before withdrawal
        if (minReserveRatio[_token] > 0) {
            uint256 balanceAfter = IERC20(_token).balanceOf(address(this)).sub(_amount);
            uint256 minRequired = totalDeposited[_token].mul(minReserveRatio[_token]).div(BASIS_POINTS);
            require(balanceAfter >= minRequired, "AmpedStakingRouter: withdrawal would break minimum reserves");
        }
        
        IERC20(_token).safeTransfer(_account, _amount);
        
        // Update total deposited if withdrawing reduces it below current balance
        uint256 currentBalance = IERC20(_token).balanceOf(address(this));
        if (totalDeposited[_token] > currentBalance) {
            totalDeposited[_token] = currentBalance;
        }
        
        emit ReserveWithdrawn(_token, _amount);
    }
    
    receive() external payable {
        require(msg.sender == weth, "AmpedStakingRouter: invalid sender");
    }
}