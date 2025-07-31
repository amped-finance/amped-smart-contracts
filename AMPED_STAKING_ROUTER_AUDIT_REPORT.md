# AmpedStakingRouter Security Audit Report

## Executive Summary
The AmpedStakingRouter contract facilitates staking of AMPED tokens by converting them to AMP tokens and managing the staking process through multiple reward trackers. This audit identifies several critical and high-severity vulnerabilities that should be addressed before deployment.

## Critical Vulnerabilities

### 1. **Centralization Risk with Emergency Withdrawal Function**
**Severity**: Critical  
**Location**: `withdrawToken()` function (lines 274-276)

The `withdrawToken` function allows the governance address to withdraw any token from the contract without restrictions:
```solidity
function withdrawToken(address _token, address _account, uint256 _amount) external onlyGov {
    IERC20(_token).safeTransfer(_account, _amount);
}
```

**Impact**: Complete loss of user funds if governance key is compromised.

**Recommendation**: 
- Implement a timelock mechanism
- Add withdrawal limits
- Consider multi-signature requirements
- Emit events for transparency

### 2. **Incomplete Implementation in Swap Disabled Mode**
**Severity**: Critical  
**Location**: Lines 134 and 210

The contract reverts when `swapEnabled` is false, making the contract unusable:
```solidity
revert("AmpedStakingRouter: swap disabled");
```

**Impact**: Contract becomes completely non-functional when swaps are disabled.

**Recommendation**: Implement alternative logic for direct AMP/AMPED conversion when swaps are disabled.

## High Severity Issues

### 3. **Approval Race Condition**
**Severity**: High  
**Location**: Multiple locations (lines 123-124, 138-139, 200-201, 256-257)

The pattern of setting approval to 0 then to the desired amount is correct but could be more efficient:
```solidity
IERC20(ampedToken).safeApprove(swapRouter, 0);
IERC20(ampedToken).safeApprove(swapRouter, _amount);
```

**Recommendation**: Consider using `safeIncreaseAllowance` or implement a more efficient approval pattern.

### 4. **Missing Validation of External Contract Addresses**
**Severity**: High  
**Location**: `initialize()` and `setRewardTrackers()` functions

No validation that provided addresses are contracts:
```solidity
ampedToken = _ampedToken;
ampToken = _ampToken;
rewardRouter = _rewardRouter;
```

**Impact**: Could lead to loss of funds if incorrect addresses are set.

**Recommendation**: Add contract existence checks using `Address.isContract()`.

### 5. **Inconsistent Access Control in mintAndStakeGlp**
**Severity**: High  
**Location**: `_mintAndStakeGlp()` function (lines 236-271)

The function mints GLP for `msg.sender` rather than the specified `_account`:
```solidity
uint256 glpAmount = IRewardRouterV2Extended(rewardRouter).mintAndStakeGlp(
    _token,
    _amount,
    _minUsdg,
    _minGlp
);
```

**Impact**: Handler contracts cannot mint GLP on behalf of users.

**Recommendation**: Ensure the reward router supports account-specific minting or document this limitation.

## Medium Severity Issues

### 6. **Potential Reentrancy in Native ETH Handling**
**Severity**: Medium  
**Location**: `mintAndStakeGlpETH()` and `receive()` functions

While `nonReentrant` modifier is used, the contract accepts ETH which could be exploited:
```solidity
receive() external payable {
    require(msg.sender == weth, "AmpedStakingRouter: invalid sender");
}
```

**Recommendation**: Consider additional checks or removing the receive function if not strictly necessary.

### 7. **Lack of Slippage Protection Customization**
**Severity**: Medium  
**Location**: `minAmountOut` state variable

The global `minAmountOut` of 95% may not be suitable for all market conditions.

**Recommendation**: Allow users to specify custom slippage tolerance per transaction.

### 8. **Missing Event Emissions**
**Severity**: Medium  
**Location**: `initialize()` and `setRewardTrackers()` functions

Critical state changes lack event emissions.

**Recommendation**: Add events for all governance actions and state changes.

## Low Severity Issues

### 9. **Inefficient Token Transfer Pattern**
**Severity**: Low  
**Location**: `_unstakeAmped()` function (line 189)

The contract transfers AMP from user to itself before swapping:
```solidity
IERC20(ampToken).safeTransferFrom(_account, address(this), _amount);
```

**Recommendation**: Consider allowing direct transfer from user to swap router.

### 10. **Hardcoded Error Messages**
**Severity**: Low  
**Location**: Throughout the contract

Error messages are hardcoded strings consuming unnecessary gas.

**Recommendation**: Consider using custom errors (Solidity 0.8.4+) or error codes.

## Informational Findings

### 11. **Outdated Solidity Version**
The contract uses Solidity 0.6.12, which lacks modern safety features.

**Recommendation**: Upgrade to Solidity 0.8.x for built-in overflow protection and custom errors.

### 12. **Missing NatSpec Documentation**
The contract lacks comprehensive documentation.

**Recommendation**: Add NatSpec comments for all public functions.

### 13. **Gas Optimizations**
- Consider caching frequently accessed state variables
- Batch operations where possible
- Use `unchecked` blocks for safe arithmetic (after upgrading Solidity)

## Security Best Practices Checklist
- ✅ Reentrancy protection implemented
- ✅ SafeERC20 used for token transfers  
- ✅ Access control on sensitive functions
- ❌ Input validation incomplete
- ❌ Emergency pause mechanism missing
- ❌ Timelock for governance actions missing
- ✅ SafeMath used for arithmetic (though outdated with newer Solidity)

## Recommendations Summary
1. **Immediate**: Fix the swap disabled revert issue
2. **Immediate**: Add contract existence validation
3. **High Priority**: Implement timelock for emergency withdrawal
4. **High Priority**: Fix the mintAndStakeGlp account mismatch
5. **Medium Priority**: Upgrade to latest Solidity version
6. **Medium Priority**: Add comprehensive event logging
7. **Low Priority**: Optimize gas usage and add documentation

## Conclusion
The AmpedStakingRouter contract contains several critical issues that must be addressed before mainnet deployment. The centralization risks and incomplete implementations pose significant threats to user funds. With the recommended fixes implemented, the contract would provide a more secure foundation for the AMPED staking ecosystem.

---
*Note: This audit is based on static analysis. A comprehensive audit should include dynamic testing, formal verification, and review of the entire protocol ecosystem.*