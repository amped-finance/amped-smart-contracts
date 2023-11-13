// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";

import "./interfaces/IRewardTracker.sol";
import "../tokens/interfaces/IMintable.sol";
import "../tokens/interfaces/IWETH.sol";
import "../core/interfaces/IAlpManager.sol";
import "../access/Governable.sol";

contract RewardRouter is ReentrancyGuard, Governable {
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

    event StakeAmp(address account, uint256 amount);
    event UnstakeAmp(address account, uint256 amount);

    event StakeAlp(address account, uint256 amount);
    event UnstakeAlp(address account, uint256 amount);

    receive() external payable {
        require(msg.sender == weth, "Router: invalid sender");
    }

    struct initParams {
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
        _unstakeAmp(msg.sender, amp, _amount);
    }

    function unstakeEsAmp(uint256 _amount) external nonReentrant {
        _unstakeAmp(msg.sender, esAmp, _amount);
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

    function batchCompoundForAccounts(address[] memory _accounts) external nonReentrant onlyGov {
        for (uint256 i = 0; i < _accounts.length; i++) {
            _compound(_accounts[i]);
        }
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

        emit StakeAmp(_account, _amount);
    }

    function _unstakeAmp(address _account, address _token, uint256 _amount) private {
        require(_amount > 0, "RewardRouter: invalid _amount");

        uint256 balance = IRewardTracker(stakedAmpTracker).stakedAmounts(_account);

        IRewardTracker(feeAmpTracker).unstakeForAccount(_account, bonusAmpTracker, _amount, _account);
        IRewardTracker(bonusAmpTracker).unstakeForAccount(_account, stakedAmpTracker, _amount, _account);
        IRewardTracker(stakedAmpTracker).unstakeForAccount(_account, _token, _amount, _account);

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

        emit UnstakeAmp(_account, _amount);
    }
}
