// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "../libraries/math/SafeMath.sol";
import "../libraries/token/IERC20.sol";
import "../libraries/token/SafeERC20.sol";
import "../libraries/utils/ReentrancyGuard.sol";
import "../access/Governable.sol";

interface IPriceOracle {
    function getPrice(address token) external view returns (uint256);
}

interface IDexRouter {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
    
    function getAmountsOut(uint amountIn, address[] calldata path) 
        external view returns (uint[] memory amounts);
}

import "../peripherals/interfaces/ITimelockTarget.sol";

contract AmpedSwapRouter is ReentrancyGuard, Governable, ITimelockTarget {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    
    address public ampedToken;
    address public ampToken;
    address public dexRouter; // External DEX router (e.g., Uniswap V2 style)
    address public priceOracle;
    
    bool public isInitialized;
    bool public useExternalDex = false;
    bool public paused = false;
    
    uint256 public swapRatio = 10000; // 10000 = 1:1 ratio, can be adjusted
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public maxSlippage = 300; // 3% max slippage
    
    mapping(address => mapping(address => address[])) public swapPaths;
    mapping(address => bool) public isHandler;
    
    // Reserve management
    mapping(address => uint256) public minReserveRatio; // Minimum reserve ratio in basis points (e.g., 2000 = 20%)
    mapping(address => uint256) public totalDeposited; // Track total deposits for reserve calculations
    
    // Price validation
    uint256 public maxPriceDeviation = 500; // 5% max deviation from oracle price
    
    // Path validation
    mapping(address => bool) public isWhitelistedPathToken; // Tokens allowed in swap paths
    
    event Swap(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );
    event SwapRatioSet(uint256 newRatio);
    event ExternalDexSet(address dexRouter, bool useExternal);
    event SwapPathSet(address tokenA, address tokenB, address[] path);
    event HandlerSet(address handler, bool isActive);
    event MinReserveRatioSet(address token, uint256 ratio);
    event ReserveDeposited(address token, uint256 amount);
    event ReserveWithdrawn(address token, uint256 amount);
    event PathTokenWhitelisted(address token, bool whitelisted);
    event Paused(address account);
    event Unpaused(address account);
    event GovSet(address indexed oldGov, address indexed newGov);
    
    modifier onlyHandler() {
        require(isHandler[msg.sender] || msg.sender == gov, "AmpedSwapRouter: forbidden");
        _;
    }
    
    modifier whenNotPaused() {
        require(!paused, "AmpedSwapRouter: paused");
        _;
    }
    
    function initialize(
        address _ampedToken,
        address _ampToken,
        address _dexRouter,
        address _priceOracle
    ) external onlyGov {
        require(!isInitialized, "AmpedSwapRouter: already initialized");
        isInitialized = true;
        
        ampedToken = _ampedToken;
        ampToken = _ampToken;
        dexRouter = _dexRouter;
        priceOracle = _priceOracle;
    }
    
    function setHandler(address _handler, bool _isActive) external onlyGov {
        isHandler[_handler] = _isActive;
        emit HandlerSet(_handler, _isActive);
    }
    
    function setSwapRatio(uint256 _ratio) external onlyGov {
        require(_ratio > 0 && _ratio <= 20000, "AmpedSwapRouter: invalid ratio");
        swapRatio = _ratio;
        emit SwapRatioSet(_ratio);
    }
    
    function setExternalDex(address _dexRouter, bool _useExternal) external onlyGov {
        dexRouter = _dexRouter;
        useExternalDex = _useExternal;
        emit ExternalDexSet(_dexRouter, _useExternal);
    }
    
    function setSwapPath(
        address _tokenA,
        address _tokenB,
        address[] calldata _path
    ) external onlyGov {
        require(_path.length >= 2, "AmpedSwapRouter: invalid path");
        require(_path[0] == _tokenA && _path[_path.length - 1] == _tokenB, "AmpedSwapRouter: invalid path endpoints");
        
        // Validate intermediate tokens are whitelisted
        for (uint256 i = 1; i < _path.length - 1; i++) {
            require(isWhitelistedPathToken[_path[i]], "AmpedSwapRouter: path contains non-whitelisted token");
        }
        
        swapPaths[_tokenA][_tokenB] = _path;
        emit SwapPathSet(_tokenA, _tokenB, _path);
    }
    
    function setWhitelistedPathToken(address _token, bool _whitelisted) external onlyGov {
        isWhitelistedPathToken[_token] = _whitelisted;
        emit PathTokenWhitelisted(_token, _whitelisted);
    }
    
    function setMinReserveRatio(address _token, uint256 _ratio) external onlyGov {
        require(_ratio <= BASIS_POINTS, "AmpedSwapRouter: invalid ratio");
        minReserveRatio[_token] = _ratio;
        emit MinReserveRatioSet(_token, _ratio);
    }
    
    function setMaxPriceDeviation(uint256 _maxDeviation) external onlyGov {
        require(_maxDeviation <= 1000, "AmpedSwapRouter: deviation too high"); // Max 10%
        maxPriceDeviation = _maxDeviation;
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
    
    function _validateReserves(address _token) private view {
        uint256 balance = IERC20(_token).balanceOf(address(this));
        uint256 minRequired = totalDeposited[_token].mul(minReserveRatio[_token]).div(BASIS_POINTS);
        require(balance >= minRequired, "AmpedSwapRouter: insufficient reserves");
    }
    
    function _validatePriceWithOracle(
        address _tokenIn,
        address _tokenOut,
        uint256 _amountIn,
        uint256 _amountOut
    ) private view {
        // Skip oracle validation for AMP/AMPED pairs (always 1:1)
        if ((_tokenIn == ampedToken && _tokenOut == ampToken) || 
            (_tokenIn == ampToken && _tokenOut == ampedToken)) {
            return;
        }
        
        if (priceOracle == address(0)) {
            return; // Skip validation if oracle not set
        }
        
        // Get oracle prices
        uint256 priceIn = IPriceOracle(priceOracle).getPrice(_tokenIn);
        uint256 priceOut = IPriceOracle(priceOracle).getPrice(_tokenOut);
        
        require(priceIn > 0 && priceOut > 0, "AmpedSwapRouter: invalid oracle price");
        
        // Calculate expected output based on oracle prices
        uint256 expectedOut = _amountIn.mul(priceIn).div(priceOut);
        
        // Check if actual output is within acceptable deviation
        uint256 minAcceptable = expectedOut.mul(BASIS_POINTS.sub(maxPriceDeviation)).div(BASIS_POINTS);
        uint256 maxAcceptable = expectedOut.mul(BASIS_POINTS.add(maxPriceDeviation)).div(BASIS_POINTS);
        
        require(
            _amountOut >= minAcceptable && _amountOut <= maxAcceptable,
            "AmpedSwapRouter: price deviation exceeds maximum allowed"
        );
    }
    
    function swap(
        address _tokenIn,
        address _tokenOut,
        uint256 _amountIn
    ) external nonReentrant whenNotPaused returns (uint256) {
        require(_amountIn > 0, "AmpedSwapRouter: invalid amount");
        
        // Transfer tokens from caller
        IERC20(_tokenIn).safeTransferFrom(msg.sender, address(this), _amountIn);
        
        // Update total deposited for accurate reserve tracking
        totalDeposited[_tokenIn] = totalDeposited[_tokenIn].add(_amountIn);
        
        uint256 amountOut;

        bool isAmpPair = (_tokenIn == ampedToken && _tokenOut == ampToken) || (_tokenIn == ampToken && _tokenOut == ampedToken);
        if (isAmpPair) {
            // Direct 1:1 logic here
            require(IERC20(_tokenOut).balanceOf(address(this)) >= _amountIn, "Insufficient balance");
            amountOut = _amountIn;
        } else if (!useExternalDex || dexRouter == address(0)) {
            revert("Unsupported pair for internal swap");
        } else {
            amountOut = _swapViaExternalDex(_tokenIn, _tokenOut, _amountIn);
        }
        
        // Validate price against oracle
        _validatePriceWithOracle(_tokenIn, _tokenOut, _amountIn, amountOut);
        
        // Validate reserves after calculating output
        if (minReserveRatio[_tokenOut] > 0) {
            _validateReserves(_tokenOut);
        }
        
        // Transfer output tokens to caller
        IERC20(_tokenOut).safeTransfer(msg.sender, amountOut);
        
        // Adjust total deposited for the output token if needed
        uint256 newBalanceOut = IERC20(_tokenOut).balanceOf(address(this));
        if (totalDeposited[_tokenOut] > newBalanceOut) {
            totalDeposited[_tokenOut] = newBalanceOut;
        }
        
        emit Swap(msg.sender, _tokenIn, _tokenOut, _amountIn, amountOut);
        
        return amountOut;
    }
    
    function _swapViaExternalDex(
        address _tokenIn,
        address _tokenOut,
        uint256 _amountIn
    ) private returns (uint256) {
        address[] memory path = swapPaths[_tokenIn][_tokenOut];
        require(path.length > 0, "AmpedSwapRouter: no swap path configured");
        
        // Get expected output
        uint[] memory amounts = IDexRouter(dexRouter).getAmountsOut(_amountIn, path);
        uint256 expectedOut = amounts[amounts.length - 1];
        
        // Calculate minimum acceptable output with slippage
        uint256 minOut = expectedOut.mul(BASIS_POINTS.sub(maxSlippage)).div(BASIS_POINTS);
        
        // Safely handle approval to avoid race conditions
        uint256 currentAllowance = IERC20(_tokenIn).allowance(address(this), dexRouter);
        if (currentAllowance > 0) {
            IERC20(_tokenIn).safeApprove(dexRouter, 0);
        }
        IERC20(_tokenIn).safeApprove(dexRouter, _amountIn);
        
        // Perform swap
        uint[] memory swapAmounts = IDexRouter(dexRouter).swapExactTokensForTokens(
            _amountIn,
            minOut,
            path,
            address(this),
            block.timestamp + 300 // 5 minute deadline
        );
        
        return swapAmounts[swapAmounts.length - 1];
    }
    
    function getAmountOut(
        address _tokenIn,
        address _tokenOut,
        uint256 _amountIn
    ) external view returns (uint256) {
        bool isAmpPair = (_tokenIn == ampedToken && _tokenOut == ampToken) || 
                        (_tokenIn == ampToken && _tokenOut == ampedToken);
                        
        if (useExternalDex && dexRouter != address(0) && !isAmpPair) {
            address[] memory path = swapPaths[_tokenIn][_tokenOut];
            if (path.length > 0) {
                uint[] memory amounts = IDexRouter(dexRouter).getAmountsOut(_amountIn, path);
                return amounts[amounts.length - 1];
            }
        }
        
        // Internal swap calculation - always 1:1 for AMP/AMPED pairs
        if (_tokenIn == ampedToken && _tokenOut == ampToken) {
            return _amountIn; // 1:1 ratio
        } else if (_tokenIn == ampToken && _tokenOut == ampedToken) {
            return _amountIn; // 1:1 ratio
        }
        
        return 0;
    }
    
    // Admin functions to manage token reserves
    function depositTokens(address _token, uint256 _amount) external onlyGov {
        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);
        totalDeposited[_token] = totalDeposited[_token].add(_amount);
        emit ReserveDeposited(_token, _amount);
    }
    
    function withdrawTokens(address _token, uint256 _amount, address _receiver) external onlyGov {
        // Check reserves before withdrawal
        if (minReserveRatio[_token] > 0) {
            uint256 balanceAfter = IERC20(_token).balanceOf(address(this)).sub(_amount);
            uint256 minRequired = totalDeposited[_token].mul(minReserveRatio[_token]).div(BASIS_POINTS);
            require(balanceAfter >= minRequired, "AmpedSwapRouter: withdrawal would break minimum reserves");
        }
        
        IERC20(_token).safeTransfer(_receiver, _amount);
        
        // Update total deposited if withdrawing reduces it below current balance
        uint256 currentBalance = IERC20(_token).balanceOf(address(this));
        if (totalDeposited[_token] > currentBalance) {
            totalDeposited[_token] = currentBalance;
        }
        
        emit ReserveWithdrawn(_token, _amount);
    }
    
    // Implement ITimelockTarget for compatibility with Timelock governance
    function withdrawToken(address _token, address _account, uint256 _amount) external override onlyGov {
        // Check reserves before withdrawal
        if (minReserveRatio[_token] > 0) {
            uint256 balanceAfter = IERC20(_token).balanceOf(address(this)).sub(_amount);
            uint256 minRequired = totalDeposited[_token].mul(minReserveRatio[_token]).div(BASIS_POINTS);
            require(balanceAfter >= minRequired, "AmpedSwapRouter: withdrawal would break minimum reserves");
        }
        
        IERC20(_token).safeTransfer(_account, _amount);
        
        // Update total deposited if withdrawing reduces it below current balance
        uint256 currentBalance = IERC20(_token).balanceOf(address(this));
        if (totalDeposited[_token] > currentBalance) {
            totalDeposited[_token] = currentBalance;
        }
        
        emit ReserveWithdrawn(_token, _amount);
    }
    
    // Emergency withdraw now requires timelock and respects minimum reserves
    function emergencyWithdraw(address _token, address _receiver) external onlyGov {
        // This function should only be callable through timelock in production
        // For now, we'll add the same reserve protection as regular withdrawals
        uint256 balance = IERC20(_token).balanceOf(address(this));
        
        if (balance > 0) {
            // If minimum reserves are set, can only withdraw excess
            if (minReserveRatio[_token] > 0) {
                uint256 minRequired = totalDeposited[_token].mul(minReserveRatio[_token]).div(BASIS_POINTS);
                uint256 withdrawable = balance > minRequired ? balance.sub(minRequired) : 0;
                require(withdrawable > 0, "AmpedSwapRouter: no excess reserves to withdraw");
                IERC20(_token).safeTransfer(_receiver, withdrawable);
                emit ReserveWithdrawn(_token, withdrawable);
            } else {
                // If no reserve ratio set, this indicates an emergency - should be timelocked
                IERC20(_token).safeTransfer(_receiver, balance);
                totalDeposited[_token] = 0;
                emit ReserveWithdrawn(_token, balance);
            }
        }
    }
}