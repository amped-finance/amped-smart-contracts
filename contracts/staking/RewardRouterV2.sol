// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";

import "./interfaces/IRewardTracker.sol";
import "./interfaces/IVester.sol";
import "../tokens/interfaces/IMintable.sol";
import "../tokens/interfaces/IWETH.sol";
import "../core/interfaces/IAlpManager.sol";
import "../access/Governable.sol";

contract RewardRouterV2 is ReentrancyGuard, Governable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using Address for address payable;

    bool public isInitialized;

    address public weth;

    address public amp;
    address public esAmp;
    address public bnAmp;

    address public alp; // AMP Liquidity Provider token

    address public stakedAmpTracker;
    address public bonusAmpTracker;
    address public feeAmpTracker;

    address public stakedAlpTracker;
    address public feeAlpTracker;

    address public alpManager;

    address public ampVester;
    address public alpVester;

    mapping (address => address) public pendingReceivers;

    event StakeAmp(address account, address token, uint256 amount);
    event UnstakeAmp(address account, address token, uint256 amount);

    event StakeAlp(address account, uint256 amount);
    event UnstakeAlp(address account, uint256 amount);

    receive() external payable {
        require(msg.sender == weth, "Router: invalid sender");
    }

    struct initParams{
        address _weth;
        address _amp;
        address _esAmp;
        address _bnAmp;
        address _alp;
        address _stakedAmpTracker;
        address _bonusAmpTracker;
        address _feeAmpTracker;
        address _feeAlpTracker;
        address _stakedAlpTracker;
        address _alpManager;
        address _ampVester;
        address _alpVester;
    }

    function initialize(initParams memory params) external onlyGov {
        require(!isInitialized, "RewardRouter: already initialized");
        isInitialized = true;

        weth = params._weth;

        amp = params._amp;
        esAmp = params._esAmp;
        bnAmp = params._bnAmp;

        alp = params._alp;

        stakedAmpTracker = params._stakedAmpTracker;
        bonusAmpTracker = params._bonusAmpTracker;
        feeAmpTracker = params._feeAmpTracker;

        feeAlpTracker = params._feeAlpTracker;
        stakedAlpTracker = params._stakedAlpTracker;

        alpManager = params._alpManager;

        ampVester = params._ampVester;
        alpVester = params._alpVester;
    }

    // to help users who accidentally send their tokens to this contract
    function withdrawToken(address _token, address _account, uint256 _amount) external onlyGov {
        IERC20(_token).safeTransfer(_account, _amount);
    }

    function batchStakeAmpForAccount(address[] memory _accounts, uint256[] memory _amounts) external nonReentrant onlyGov {
        address _amp = amp;
        for (uint256 i = 0; i < _accounts.length; i++) {
            _stakeAmp(msg.sender, _accounts[i], _amp, _amounts[i]);
        }
    }

    function stakeAmpForAccount(address _account, uint256 _amount) external nonReentrant onlyGov {
        _stakeAmp(msg.sender, _account, amp, _amount);
    }

    function stakeAmp(uint256 _amount) external nonReentrant {
        _stakeAmp(msg.sender, msg.sender, amp, _amount);
    }

    function stakeEsAmp(uint256 _amount) external nonReentrant {
        _stakeAmp(msg.sender, msg.sender, esAmp, _amount);
    }

    function unstakeAmp(uint256 _amount) external nonReentrant {
        _unstakeAmp(msg.sender, amp, _amount, true);
    }

    function unstakeEsAmp(uint256 _amount) external nonReentrant {
        _unstakeAmp(msg.sender, esAmp, _amount, true);
    }

    function mintAndStakeAlp(address _token, uint256 _amount, uint256 _minUsdg, uint256 _minAlp) external nonReentrant returns (uint256) {
        require(_amount > 0, "RewardRouter: invalid _amount");

        address account = msg.sender;
        uint256 alpAmount = IAlpManager(alpManager).addLiquidityForAccount(account, account, _token, _amount, _minUsdg, _minAlp);
        IRewardTracker(feeAlpTracker).stakeForAccount(account, account, alp, alpAmount);
        IRewardTracker(stakedAlpTracker).stakeForAccount(account, account, feeAlpTracker, alpAmount);

        emit StakeAlp(account, alpAmount);

        return alpAmount;
    }

    function mintAndStakeAlpETH(uint256 _minUsdg, uint256 _minAlp) external payable nonReentrant returns (uint256) {
        require(msg.value > 0, "RewardRouter: invalid msg.value");

        IWETH(weth).deposit{value: msg.value}();
        IERC20(weth).approve(alpManager, msg.value);

        address account = msg.sender;
        uint256 alpAmount = IAlpManager(alpManager).addLiquidityForAccount(address(this), account, weth, msg.value, _minUsdg, _minAlp);

        IRewardTracker(feeAlpTracker).stakeForAccount(account, account, alp, alpAmount);
        IRewardTracker(stakedAlpTracker).stakeForAccount(account, account, feeAlpTracker, alpAmount);

        emit StakeAlp(account, alpAmount);

        return alpAmount;
    }

    function unstakeAndRedeemAlp(address _tokenOut, uint256 _alpAmount, uint256 _minOut, address _receiver) external nonReentrant returns (uint256) {
        require(_alpAmount > 0, "RewardRouter: invalid _alpAmount");

        address account = msg.sender;
        IRewardTracker(stakedAlpTracker).unstakeForAccount(account, feeAlpTracker, _alpAmount, account);
        IRewardTracker(feeAlpTracker).unstakeForAccount(account, alp, _alpAmount, account);
        uint256 amountOut = IAlpManager(alpManager).removeLiquidityForAccount(account, _tokenOut, _alpAmount, _minOut, _receiver);

        emit UnstakeAlp(account, _alpAmount);

        return amountOut;
    }

    function unstakeAndRedeemAlpETH(uint256 _alpAmount, uint256 _minOut, address payable _receiver) external nonReentrant returns (uint256) {
        require(_alpAmount > 0, "RewardRouter: invalid _alpAmount");

        address account = msg.sender;
        IRewardTracker(stakedAlpTracker).unstakeForAccount(account, feeAlpTracker, _alpAmount, account);
        IRewardTracker(feeAlpTracker).unstakeForAccount(account, alp, _alpAmount, account);
        uint256 amountOut = IAlpManager(alpManager).removeLiquidityForAccount(account, weth, _alpAmount, _minOut, address(this));

        IWETH(weth).withdraw(amountOut);

        _receiver.sendValue(amountOut);

        emit UnstakeAlp(account, _alpAmount);

        return amountOut;
    }

    function claim() external nonReentrant {
        address account = msg.sender;

        IRewardTracker(feeAmpTracker).claimForAccount(account, account);
        IRewardTracker(feeAlpTracker).claimForAccount(account, account);

        IRewardTracker(stakedAmpTracker).claimForAccount(account, account);
        IRewardTracker(stakedAlpTracker).claimForAccount(account, account);
    }

    function claimEsAmp() external nonReentrant {
        address account = msg.sender;

        IRewardTracker(stakedAmpTracker).claimForAccount(account, account);
        IRewardTracker(stakedAlpTracker).claimForAccount(account, account);
    }

    function claimFees() external nonReentrant {
        address account = msg.sender;

        IRewardTracker(feeAmpTracker).claimForAccount(account, account);
        IRewardTracker(feeAlpTracker).claimForAccount(account, account);
    }

    function compound() external nonReentrant {
        _compound(msg.sender);
    }

    function compoundForAccount(address _account) external nonReentrant onlyGov {
        _compound(_account);
    }

    function handleRewards(
        bool _shouldClaimAmp,
        bool _shouldStakeAmp,
        bool _shouldClaimEsAmp,
        bool _shouldStakeEsAmp,
        bool _shouldStakeMultiplierPoints,
        bool _shouldClaimWeth,
        bool _shouldConvertWethToEth
    ) external nonReentrant {
        address account = msg.sender;

        uint256 ampAmount = 0;
        if (_shouldClaimAmp) {
            uint256 ampAmount0 = IVester(ampVester).claimForAccount(account, account);
            uint256 ampAmount1 = IVester(alpVester).claimForAccount(account, account);
            ampAmount = ampAmount0.add(ampAmount1);
        }

        if (_shouldStakeAmp && ampAmount > 0) {
            _stakeAmp(account, account, amp, ampAmount);
        }

        uint256 esAmpAmount = 0;
        if (_shouldClaimEsAmp) {
            uint256 esAmpAmount0 = IRewardTracker(stakedAmpTracker).claimForAccount(account, account);
            uint256 esAmpAmount1 = IRewardTracker(stakedAlpTracker).claimForAccount(account, account);
            esAmpAmount = esAmpAmount0.add(esAmpAmount1);
        }

        if (_shouldStakeEsAmp && esAmpAmount > 0) {
            _stakeAmp(account, account, esAmp, esAmpAmount);
        }

        if (_shouldStakeMultiplierPoints) {
            uint256 bnAmpAmount = IRewardTracker(bonusAmpTracker).claimForAccount(account, account);
            if (bnAmpAmount > 0) {
                IRewardTracker(feeAmpTracker).stakeForAccount(account, account, bnAmp, bnAmpAmount);
            }
        }

        if (_shouldClaimWeth) {
            if (_shouldConvertWethToEth) {
                uint256 weth0 = IRewardTracker(feeAmpTracker).claimForAccount(account, address(this));
                uint256 weth1 = IRewardTracker(feeAlpTracker).claimForAccount(account, address(this));

                uint256 wethAmount = weth0.add(weth1);
                IWETH(weth).withdraw(wethAmount);

                payable(account).sendValue(wethAmount);
            } else {
                IRewardTracker(feeAmpTracker).claimForAccount(account, account);
                IRewardTracker(feeAlpTracker).claimForAccount(account, account);
            }
        }
    }

    function batchCompoundForAccounts(address[] memory _accounts) external nonReentrant onlyGov {
        for (uint256 i = 0; i < _accounts.length; i++) {
            _compound(_accounts[i]);
        }
    }

    function signalTransfer(address _receiver) external nonReentrant {
        require(IERC20(ampVester).balanceOf(msg.sender) == 0, "RewardRouter: sender has vested tokens");
        require(IERC20(alpVester).balanceOf(msg.sender) == 0, "RewardRouter: sender has vested tokens");

        _validateReceiver(_receiver);
        pendingReceivers[msg.sender] = _receiver;
    }

    function acceptTransfer(address _sender) external nonReentrant {
        require(IERC20(ampVester).balanceOf(_sender) == 0, "RewardRouter: sender has vested tokens");
        require(IERC20(alpVester).balanceOf(_sender) == 0, "RewardRouter: sender has vested tokens");

        address receiver = msg.sender;
        require(pendingReceivers[_sender] == receiver, "RewardRouter: transfer not signalled");
        delete pendingReceivers[_sender];

        _validateReceiver(receiver);
        _compound(_sender);

        uint256 stakedAmp = IRewardTracker(stakedAmpTracker).depositBalances(_sender, amp);
        if (stakedAmp > 0) {
            _unstakeAmp(_sender, amp, stakedAmp, false);
            _stakeAmp(_sender, receiver, amp, stakedAmp);
        }

        uint256 stakedEsAmp = IRewardTracker(stakedAmpTracker).depositBalances(_sender, esAmp);
        if (stakedEsAmp > 0) {
            _unstakeAmp(_sender, esAmp, stakedEsAmp, false);
            _stakeAmp(_sender, receiver, esAmp, stakedEsAmp);
        }

        uint256 stakedBnAmp = IRewardTracker(feeAmpTracker).depositBalances(_sender, bnAmp);
        if (stakedBnAmp > 0) {
            IRewardTracker(feeAmpTracker).unstakeForAccount(_sender, bnAmp, stakedBnAmp, _sender);
            IRewardTracker(feeAmpTracker).stakeForAccount(_sender, receiver, bnAmp, stakedBnAmp);
        }

        uint256 esAmpBalance = IERC20(esAmp).balanceOf(_sender);
        if (esAmpBalance > 0) {
            IERC20(esAmp).transferFrom(_sender, receiver, esAmpBalance);
        }

        uint256 alpAmount = IRewardTracker(feeAlpTracker).depositBalances(_sender, alp);
        if (alpAmount > 0) {
            IRewardTracker(stakedAlpTracker).unstakeForAccount(_sender, feeAlpTracker, alpAmount, _sender);
            IRewardTracker(feeAlpTracker).unstakeForAccount(_sender, alp, alpAmount, _sender);

            IRewardTracker(feeAlpTracker).stakeForAccount(_sender, receiver, alp, alpAmount);
            IRewardTracker(stakedAlpTracker).stakeForAccount(receiver, receiver, feeAlpTracker, alpAmount);
        }

        IVester(ampVester).transferStakeValues(_sender, receiver);
        IVester(alpVester).transferStakeValues(_sender, receiver);
    }

    function _validateReceiver(address _receiver) private view {
        require(IRewardTracker(stakedAmpTracker).averageStakedAmounts(_receiver) == 0, "RewardRouter: stakedAmpTracker.averageStakedAmounts > 0");
        require(IRewardTracker(stakedAmpTracker).cumulativeRewards(_receiver) == 0, "RewardRouter: stakedAmpTracker.cumulativeRewards > 0");

        require(IRewardTracker(bonusAmpTracker).averageStakedAmounts(_receiver) == 0, "RewardRouter: bonusAmpTracker.averageStakedAmounts > 0");
        require(IRewardTracker(bonusAmpTracker).cumulativeRewards(_receiver) == 0, "RewardRouter: bonusAmpTracker.cumulativeRewards > 0");

        require(IRewardTracker(feeAmpTracker).averageStakedAmounts(_receiver) == 0, "RewardRouter: feeAmpTracker.averageStakedAmounts > 0");
        require(IRewardTracker(feeAmpTracker).cumulativeRewards(_receiver) == 0, "RewardRouter: feeAmpTracker.cumulativeRewards > 0");

        require(IVester(ampVester).transferredAverageStakedAmounts(_receiver) == 0, "RewardRouter: ampVester.transferredAverageStakedAmounts > 0");
        require(IVester(ampVester).transferredCumulativeRewards(_receiver) == 0, "RewardRouter: ampVester.transferredCumulativeRewards > 0");

        require(IRewardTracker(stakedAlpTracker).averageStakedAmounts(_receiver) == 0, "RewardRouter: stakedAlpTracker.averageStakedAmounts > 0");
        require(IRewardTracker(stakedAlpTracker).cumulativeRewards(_receiver) == 0, "RewardRouter: stakedAlpTracker.cumulativeRewards > 0");

        require(IRewardTracker(feeAlpTracker).averageStakedAmounts(_receiver) == 0, "RewardRouter: feeAlpTracker.averageStakedAmounts > 0");
        require(IRewardTracker(feeAlpTracker).cumulativeRewards(_receiver) == 0, "RewardRouter: feeAlpTracker.cumulativeRewards > 0");

        require(IVester(alpVester).transferredAverageStakedAmounts(_receiver) == 0, "RewardRouter: ampVester.transferredAverageStakedAmounts > 0");
        require(IVester(alpVester).transferredCumulativeRewards(_receiver) == 0, "RewardRouter: ampVester.transferredCumulativeRewards > 0");

        require(IERC20(ampVester).balanceOf(_receiver) == 0, "RewardRouter: ampVester.balance > 0");
        require(IERC20(alpVester).balanceOf(_receiver) == 0, "RewardRouter: alpVester.balance > 0");
    }

    function _compound(address _account) private {
        _compoundAmp(_account);
        _compoundAlp(_account);
    }

    function _compoundAmp(address _account) private {
        uint256 esAmpAmount = IRewardTracker(stakedAmpTracker).claimForAccount(_account, _account);
        if (esAmpAmount > 0) {
            _stakeAmp(_account, _account, esAmp, esAmpAmount);
        }

        uint256 bnAmpAmount = IRewardTracker(bonusAmpTracker).claimForAccount(_account, _account);
        if (bnAmpAmount > 0) {
            IRewardTracker(feeAmpTracker).stakeForAccount(_account, _account, bnAmp, bnAmpAmount);
        }
    }

    function _compoundAlp(address _account) private {
        uint256 esAmpAmount = IRewardTracker(stakedAlpTracker).claimForAccount(_account, _account);
        if (esAmpAmount > 0) {
            _stakeAmp(_account, _account, esAmp, esAmpAmount);
        }
    }

    function _stakeAmp(address _fundingAccount, address _account, address _token, uint256 _amount) private {
        require(_amount > 0, "RewardRouter: invalid _amount");

        IRewardTracker(stakedAmpTracker).stakeForAccount(_fundingAccount, _account, _token, _amount);
        IRewardTracker(bonusAmpTracker).stakeForAccount(_account, _account, stakedAmpTracker, _amount);
        IRewardTracker(feeAmpTracker).stakeForAccount(_account, _account, bonusAmpTracker, _amount);

        emit StakeAmp(_account, _token, _amount);
    }

    function _unstakeAmp(address _account, address _token, uint256 _amount, bool _shouldReduceBnAmp) private {
        require(_amount > 0, "RewardRouter: invalid _amount");

        uint256 balance = IRewardTracker(stakedAmpTracker).stakedAmounts(_account);

        IRewardTracker(feeAmpTracker).unstakeForAccount(_account, bonusAmpTracker, _amount, _account);
        IRewardTracker(bonusAmpTracker).unstakeForAccount(_account, stakedAmpTracker, _amount, _account);
        IRewardTracker(stakedAmpTracker).unstakeForAccount(_account, _token, _amount, _account);

        if (_shouldReduceBnAmp) {
            uint256 bnAmpAmount = IRewardTracker(bonusAmpTracker).claimForAccount(_account, _account);
            if (bnAmpAmount > 0) {
                IRewardTracker(feeAmpTracker).stakeForAccount(_account, _account, bnAmp, bnAmpAmount);
            }

            uint256 stakedBnAmp = IRewardTracker(feeAmpTracker).depositBalances(_account, bnAmp);
            if (stakedBnAmp > 0) {
                uint256 reductionAmount = stakedBnAmp.mul(_amount).div(balance);
                IRewardTracker(feeAmpTracker).unstakeForAccount(_account, bnAmp, reductionAmount, _account);
                IMintable(bnAmp).burn(_account, reductionAmount);
            }
        }

        emit UnstakeAmp(_account, _token, _amount);
    }
}
