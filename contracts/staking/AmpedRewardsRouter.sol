// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "../libraries/math/SafeMath.sol";
import "../libraries/token/IERC20.sol";
import "../libraries/token/SafeERC20.sol";
import "../libraries/utils/ReentrancyGuard.sol";
import "../libraries/utils/Address.sol";
import "../access/Governable.sol";
import "./interfaces/IRewardRouterV2.sol";
import "./interfaces/IRewardTracker.sol";
import "./interfaces/IVester.sol";
import "../tokens/interfaces/IWETH.sol";

interface ISwapRouter {
    function swap(address tokenIn, address tokenOut, uint256 amountIn) external returns (uint256);
    function getAmountOut(address tokenIn, address tokenOut, uint256 amountIn) external view returns (uint256);
}

contract AmpedRewardsRouter is ReentrancyGuard, Governable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using Address for address payable;

    struct ClaimableRewards {
        uint256 gmxAmount;
        uint256 esGmxAmount;
        uint256 wethAmount;
    }

    bool public isInitialized;
    bool public swapEnabled = true;
    
    address public ampedToken;
    address public ampToken;
    address public esAmpToken;
    address public weth;
    
    address public rewardRouter;
    address public swapRouter;
    
    address public gmxVester;
    address public glpVester;
    
    address public stakedGmxTracker;
    address public bonusGmxTracker;
    address public feeGmxTracker;
    address public stakedGlpTracker;
    address public feeGlpTracker;
    
    uint256 public minAmountOut = 9500; // 95% minimum slippage protection
    uint256 public constant BASIS_POINTS = 10000;
    
    mapping(address => bool) public isHandler;
    
    event RewardsClaimed(
        address indexed account,
        uint256 gmxAmount,
        uint256 esGmxAmount,
        uint256 wethAmount,
        uint256 ampedReceived
    );
    event SwapEnabledSet(bool enabled);
    event MinAmountOutSet(uint256 minAmountOut);
    event HandlerSet(address handler, bool isActive);
    
    modifier onlyHandler() {
        require(isHandler[msg.sender] || msg.sender == gov, "AmpedRewardsRouter: forbidden");
        _;
    }
    
    function initialize(
        address _ampedToken,
        address _ampToken,
        address _esAmpToken,
        address _weth,
        address _rewardRouter,
        address _swapRouter
    ) external onlyGov {
        require(!isInitialized, "AmpedRewardsRouter: already initialized");
        isInitialized = true;
        
        ampedToken = _ampedToken;
        ampToken = _ampToken;
        esAmpToken = _esAmpToken;
        weth = _weth;
        rewardRouter = _rewardRouter;
        swapRouter = _swapRouter;
    }
    
    function setRewardTrackers(
        address _gmxVester,
        address _glpVester,
        address _stakedGmxTracker,
        address _bonusGmxTracker,
        address _feeGmxTracker,
        address _stakedGlpTracker,
        address _feeGlpTracker
    ) external onlyGov {
        gmxVester = _gmxVester;
        glpVester = _glpVester;
        stakedGmxTracker = _stakedGmxTracker;
        bonusGmxTracker = _bonusGmxTracker;
        feeGmxTracker = _feeGmxTracker;
        stakedGlpTracker = _stakedGlpTracker;
        feeGlpTracker = _feeGlpTracker;
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
        require(_minAmountOut <= BASIS_POINTS, "AmpedRewardsRouter: invalid minAmountOut");
        minAmountOut = _minAmountOut;
        emit MinAmountOutSet(_minAmountOut);
    }
    
    function claimAllRewards(
        bool _claimGmx,
        bool _claimEsGmx,
        bool _claimWeth,
        bool _convertToAmped
    ) external nonReentrant returns (uint256) {
        return _claimRewards(msg.sender, _claimGmx, _claimEsGmx, _claimWeth, _convertToAmped);
    }
    
    function claimAllRewardsForAccount(
        address _account,
        bool _claimGmx,
        bool _claimEsGmx,
        bool _claimWeth,
        bool _convertToAmped
    ) external nonReentrant onlyHandler returns (uint256) {
        return _claimRewards(_account, _claimGmx, _claimEsGmx, _claimWeth, _convertToAmped);
    }
    
    function _claimRewards(
        address _account,
        bool _claimGmx,
        bool _claimEsGmx,
        bool _claimWeth,
        bool _convertToAmped
    ) private returns (uint256) {
        ClaimableRewards memory rewards;
        
        // Claim GMX/AMP from vesters
        if (_claimGmx) {
            uint256 gmxAmount0 = IVester(gmxVester).claimForAccount(_account, address(this));
            uint256 gmxAmount1 = IVester(glpVester).claimForAccount(_account, address(this));
            rewards.gmxAmount = gmxAmount0.add(gmxAmount1);
        }
        
        // Claim esGMX/esAMP from reward trackers
        if (_claimEsGmx) {
            uint256 esGmxAmount0 = IRewardTracker(stakedGmxTracker).claimForAccount(_account, address(this));
            uint256 esGmxAmount1 = IRewardTracker(stakedGlpTracker).claimForAccount(_account, address(this));
            rewards.esGmxAmount = esGmxAmount0.add(esGmxAmount1);
        }
        
        // Claim WETH fees
        if (_claimWeth) {
            uint256 weth0 = IRewardTracker(feeGmxTracker).claimForAccount(_account, address(this));
            uint256 weth1 = IRewardTracker(feeGlpTracker).claimForAccount(_account, address(this));
            rewards.wethAmount = weth0.add(weth1);
        }
        
        uint256 totalAmpedReceived = 0;
        
        // Convert rewards to AMPED if requested
        if (_convertToAmped && swapEnabled && swapRouter != address(0)) {
            // Convert AMP to AMPED
            if (rewards.gmxAmount > 0) {
                uint256 ampedFromGmx = _swapToAmped(ampToken, rewards.gmxAmount);
                totalAmpedReceived = totalAmpedReceived.add(ampedFromGmx);
            }
            
            // Handle esAMP - these typically can't be swapped directly
            // Transfer esAMP to user as-is
            if (rewards.esGmxAmount > 0) {
                IERC20(esAmpToken).safeTransfer(_account, rewards.esGmxAmount);
            }
            
            // Convert WETH to AMPED if requested
            if (rewards.wethAmount > 0) {
                uint256 ampedFromWeth = _swapToAmped(weth, rewards.wethAmount);
                totalAmpedReceived = totalAmpedReceived.add(ampedFromWeth);
            }
            
            // Transfer total AMPED to user
            if (totalAmpedReceived > 0) {
                IERC20(ampedToken).safeTransfer(_account, totalAmpedReceived);
            }
        } else {
            // Transfer rewards as-is without conversion
            if (rewards.gmxAmount > 0) {
                IERC20(ampToken).safeTransfer(_account, rewards.gmxAmount);
            }
            if (rewards.esGmxAmount > 0) {
                IERC20(esAmpToken).safeTransfer(_account, rewards.esGmxAmount);
            }
            if (rewards.wethAmount > 0) {
                IERC20(weth).safeTransfer(_account, rewards.wethAmount);
            }
        }
        
        emit RewardsClaimed(
            _account,
            rewards.gmxAmount,
            rewards.esGmxAmount,
            rewards.wethAmount,
            totalAmpedReceived
        );
        
        return totalAmpedReceived;
    }
    
    function _swapToAmped(address _tokenIn, uint256 _amountIn) private returns (uint256) {
        if (_amountIn == 0) {
            return 0;
        }
        
        // Get expected output
        uint256 expectedOut = ISwapRouter(swapRouter).getAmountOut(_tokenIn, ampedToken, _amountIn);
        uint256 minOut = _amountIn.mul(minAmountOut).div(BASIS_POINTS);
        
        // For AMP to AMPED, we might expect 1:1 or close to it
        if (_tokenIn == ampToken) {
            minOut = _amountIn.mul(minAmountOut).div(BASIS_POINTS);
        }
        
        require(expectedOut >= minOut, "AmpedRewardsRouter: insufficient output amount");
        
        // Approve swap router
        IERC20(_tokenIn).safeApprove(swapRouter, 0);
        IERC20(_tokenIn).safeApprove(swapRouter, _amountIn);
        
        // Perform swap
        uint256 ampedAmount = ISwapRouter(swapRouter).swap(_tokenIn, ampedToken, _amountIn);
        require(ampedAmount >= minOut, "AmpedRewardsRouter: slippage exceeded");
        
        return ampedAmount;
    }
    
    // View functions to check claimable rewards
    function getClaimableRewards(address _account) external view returns (
        uint256 claimableGmx,
        uint256 claimableEsGmx,
        uint256 claimableWeth
    ) {
        claimableGmx = IVester(gmxVester).claimable(_account).add(
            IVester(glpVester).claimable(_account)
        );
        
        claimableEsGmx = IRewardTracker(stakedGmxTracker).claimable(_account).add(
            IRewardTracker(stakedGlpTracker).claimable(_account)
        );
        
        claimableWeth = IRewardTracker(feeGmxTracker).claimable(_account).add(
            IRewardTracker(feeGlpTracker).claimable(_account)
        );
    }
    
    // Emergency withdrawal
    function withdrawToken(address _token, address _account, uint256 _amount) external onlyGov {
        IERC20(_token).safeTransfer(_account, _amount);
    }
    
    receive() external payable {
        require(msg.sender == weth, "AmpedRewardsRouter: invalid sender");
    }
}