# Amped Protocol Fix Plan (Updated)

## Executive Summary

The Amped Protocol contracts (AmpedSwapRouter and AmpedStakingRouter) contain critical architectural flaws that prevent them from functioning as intended. This updated document incorporates feedback from the security audit, correcting inaccuracies in the staking refactor (e.g., method signatures and ERC20 handling), ensuring alignment with the actual RewardTracker implementation (which is ERC20-based with handler privileges for seamless chaining). We have also enhanced code examples, added handler setup requirements, and expanded testing for chaining mechanics.

**Current Status**: CRITICAL - Contracts will fail in production without fixes
**Estimated Timeline**: 2-4 weeks for complete refactoring
**Risk Level**: High - Total protocol failure without fixes
**Key Changes in This Version**: Accurate staking/unstaking code examples based on RewardTracker mechanics; explicit handler setup; no coverage of external exploits as per confirmation that vulnerable components are disabled.

## Critical Issues Overview

### 1. Fundamental Architecture Misunderstanding
The contracts misunderstand how GMX V1 reward trackers work:
- **Current (Wrong)**: Assumes direct staking without proper ERC20 receipt handling or approvals
- **Correct (GMX V1)**: Trackers are ERC20 tokens; staking mints receipts to users, requiring handler-privileged transfers for chaining without user approvals

### 2. Oracle Validation Conflicts
- **Issue**: Enforces price oracle validation for 1:1 AMP/AMPED swaps
- **Impact**: Valid swaps fail if oracle prices deviate from exact 1:1

### 3. Staking Chain Failure
- **Issue**: Missing handler-privileged transfers for ERC20 receipts between trackers
- **Impact**: Staking transactions will revert after first tracker due to approval issues

### 4. Unstaking Approval Requirements
- **Issue**: Requires users to pre-approve router for AMP tokens
- **Impact**: Breaks "seamless" user experience

## Detailed Fix Plan

### Phase 1: SwapRouter Fixes (Immediate)

#### Fix 1.1: Remove Oracle Validation for AMP/AMPED Pairs ✅
**Status**: Completed
```solidity
// In _validatePriceWithOracle function
// Skip oracle validation for AMP/AMPED pairs (always 1:1)
if ((_tokenIn == ampedToken && _tokenOut == ampToken) || 
    (_tokenIn == ampToken && _tokenOut == ampedToken)) {
    return;
}
```
**Rationale**: AMP/AMPED are always 1:1 by design. Oracle validation adds unnecessary complexity and potential failure points.

#### Fix 1.2: Handle Direct 1:1 Swaps When Disabled
**Current Issue**: When `swapEnabled=false` or no external DEX, swaps revert entirely
**Required Fix**: Add fallback logic for 1:1 conversion using contract-held liquidity
```solidity
if (!useExternalDex || dexRouter == address(0)) {
    // Direct 1:1 swap for AMP/AMPED pairs
    if (_tokenIn == ampedToken && _tokenOut == ampToken) {
        // Ensure sufficient liquidity in contract
        require(IERC20(ampToken).balanceOf(address(this)) >= _amountIn, "Insufficient AMP balance");
        return _amountIn; // 1:1 ratio, transfer from contract reserves
    } else if (_tokenIn == ampToken && _tokenOut == ampedToken) {
        require(IERC20(ampedToken).balanceOf(address(this)) >= _amountIn, "Insufficient AMPED balance");
        return _amountIn; // 1:1 ratio
    }
    revert("Unsupported pair for internal swap");
}
```
**Rationale**: Users should always be able to convert between AMP/AMPED even if external swaps are disabled. Use contract reserves for transfers.

### Phase 2: StakingRouter Critical Refactor

#### Fix 2.1: Redesign Staking Chain Architecture
**Current Issue**: Code attempts improper staking calls without handling ERC20 receipts or approvals
**GMX V1 Pattern**: 
- Trackers are ERC20 tokens; staking mints receipt tokens (e.g., sAMP) to the user.
- For chaining, use router as handler on trackers to transfer receipts without user approvals (via special `transferFrom` logic).
- Sequence: Stake into first tracker (mints to user), handler-transfer receipt to router, approve and stake into next.

**Prerequisites**: 
- Set StakingRouter as handler on all trackers post-deployment: `rewardTracker.setHandler(stakingRouter.address, true)` for each (stakedGmxTracker, bonusGmxTracker, feeGmxTracker).

**Required Changes** (in `_stakeAmped`):
```solidity
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
```
**Rationale**: Aligns with ERC20-based trackers. Handler privilege allows seamless receipt transfers. Ensures positions and rewards are credited directly to the user.

#### Fix 2.2: Fix Unstaking Flow
**Current Issue**: Router tries to pull AMP from user after unstaking, requiring approval
**Required Fix**: Unstake directly to router in reverse order (fee → bonus → staked), so router receives tokens for swapping
```solidity
// In _unstakeAmped

// Step 1: Unstake from feeGmxTracker (burns fAMP from _account, sends bnAMP to this)
IRewardTracker(feeGmxTracker).unstakeForAccount(_account, bonusGmxTracker, _amount, address(this));

// Step 2: Unstake from bonusGmxTracker (burns bnAMP from _account, sends sAMP to this)
IRewardTracker(bonusGmxTracker).unstakeForAccount(_account, stakedGmxTracker, _amount, address(this));

// Step 3: Unstake from stakedGmxTracker (burns sAMP from _account, sends AMP to this)
IRewardTracker(stakedGmxTracker).unstakeForAccount(_account, ampToken, _amount, address(this));

// Now router has AMP, proceed with swap to AMPED and transfer to _account
```
**Rationale**: Burns are internal (no approvals needed); directing outputs to router makes it seamless.

#### Fix 2.3: Add Internal 1:1 Conversion
**Issue**: StakingRouter reverts if swapEnabled=false
**Fix**: Add direct conversion logic using contract reserves
```solidity
if (!swapEnabled || swapRouter == address(0)) {
    if (tokenIn == ampedToken && tokenOut == ampToken) {
        // Direct 1:1 conversion
        require(IERC20(ampToken).balanceOf(address(this)) >= _amount, "Insufficient AMP balance");
        ampAmount = _amount;
        // Transfer AMP from reserves to continue staking
    } else if (tokenIn == ampToken && tokenOut == ampedToken) {
        // Similar for unstake
    }
}
```

### Phase 3: Testing & Validation

#### Test 3.1: Reward Tracker Integration
- Deploy test contracts mimicking GMX V1 trackers
- Verify internal balance updates and ERC20 mint/burn
- Test full staking chain, including handler transfers

#### Test 3.2: End-to-End Flow Testing
1. User approves AMPED to StakingRouter
2. StakeAmped: AMPED → AMP → Staked in trackers (verify positions credited to user)
3. Earn rewards over time (simulate distributor)
4. UnstakeAmped: Unstake → AMP → AMPED
5. Verify no additional approvals needed beyond initial

#### Test 3.3: Edge Cases
- Test with swapEnabled=false (using internal 1:1)
- Test with zero oracle prices (ensure bypass works)
- Test with maximum amounts
- Test pause/unpause scenarios
- Test chaining failures (e.g., without handler set) and recoveries

### Phase 4: Security Considerations

#### Risk 4.1: Reentrancy in New Flow
- Maintain nonReentrant modifiers on all external-call functions
- Follow checks-effects-interactions pattern strictly
- Test for reentrancy in handler transfers and staking calls

#### Risk 4.2: Token Approval Management
- Minimize approval requirements (handler bypasses for receipts)
- Consider EIP-2612 permits for any remaining user approvals
- Clear documentation on required approvals (e.g., initial AMPED only)

#### Risk 4.3: Handler Privilege Management
- Document risks of handler role (e.g., potential for abuse if compromised)
- Use multisig/timelock for setting handlers
- Add emergency revoke function for handlers

#### Risk 4.4: Migration Path
- If any users have existing positions, provide migration tools
- Implement emergency withdrawal functions with timelock
- Maintain backward compatibility where possible

### Phase 5: Additional Hardening and Consistency Fixes

The following fixes are prioritized to ensure consistency, prevent potential fund drainage or misbehavior, and align the contracts with the "always 1:1" principle for AMP pairs.

#### Fix 5.1 (Critical): Force Internal 1:1 for AMP Pairs in `SwapRouter.swap`
**Issue**: Currently, if `useExternalDex = true`, AMP pairs may incorrectly attempt an external swap. This can lead to reverts if no path is defined or bypass the intended 1:1 swap ratio. This conflicts with the contract's intention and the `getAmountOut` behavior.
**Required Fix**: In the `swap` function, an `isAmpPair` check must be added to enforce the direct 1:1 logic for AMP pairs, regardless of the `useExternalDex` setting.
```solidity
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
```
**Impact if Unfixed**: Reverts for all AMP/AMPED swaps when the external DEX is enabled, breaking core functionality.

#### Fix 5.2 (High): Add/Update Reserve Tracking in `SwapRouter` Direct Swaps
**Issue**: Direct 1:1 swaps implicitly add the input token to the contract's reserves but do not increment `totalDeposited[_tokenIn]`. When the output token is sent, there is no corresponding adjustment if `totalDeposited[_tokenOut]` exceeds the new, lower balance. This breaks the accuracy of `_validateReserves` over time.
**Required Fix**: Update the `totalDeposited` mapping during direct swaps to accurately reflect reserve changes.
```solidity
// After receiving tokenIn and before validating reserves
totalDeposited[_tokenIn] = totalDeposited[_tokenIn].add(_amountIn);

// After transferring tokenOut
uint256 newBalanceOut = IERC20(_tokenOut).balanceOf(address(this));
if (totalDeposited[_tokenOut] > newBalanceOut) {
    totalDeposited[_tokenOut] = newBalanceOut;
}
```
**Impact if Unfixed**: Reserve mismanagement, allowing withdrawals below the intended minimum reserve ratio and creating a potential insolvency risk.

#### Fix 5.3 (High): Add Reserve Management to `StakingRouter` for Direct Mode
**Issue**: The `StakingRouter`'s direct conversion mode uses the contract's token balances as implicit reserves but lacks the explicit reserve management system found in the `SwapRouter` (e.g., `totalDeposited`, `minReserveRatio`, and validation functions). This prevents governance from properly tracking or managing these reserves and could lead to the router's funds being drained.
**Required Fix**: Mirror the reserve management system from `SwapRouter` into `StakingRouter`.
1.  Add `minReserveRatio` and `totalDeposited` mappings.
2.  Add `gov`-only functions for `depositTokens`/`withdrawTokens` and to set ratios.
3.  Implement a `_validateReserves` function.
4.  In the direct staking and unstaking logic, update `totalDeposited` and call `_validateReserves` before completing the operation.
**Impact if Unfixed**: Potential for complete drainage of the `StakingRouter`'s token reserves when in direct conversion mode, and inconsistent behavior compared to the `SwapRouter`.

#### Fix 5.4 (Medium): Implement GLP Minting for AMPED
**Issue**: The `mintAndStakeGlp` function currently reverts with "not yet implemented" when `ampedToken` is used as the input.
**Required Fix**: In `_mintAndStakeGlp`, if the input `_token` is `ampedToken`, it should first be swapped to a GLP-accepted token (e.g., WETH) via the `swapRouter` before proceeding with the rest of the GLP minting logic.
**Impact if Unfixed**: The GLP minting feature remains incomplete for AMPED holders. This does not affect core staking functionality.

#### Fix 5.5 (Low): Remove Unused `_swapInternal` in `SwapRouter`
**Issue**: The `_swapInternal` function in `AmpedSwapRouter` is defined but never called, as its logic has been moved inline into the main `swap` function. This constitutes dead code.
**Required Fix**: Delete the entire `_swapInternal` function to reduce contract bloat.
**Impact if Unfixed**: Minor contract bloat with no functional impact.

## Implementation Priority

1. **CRITICAL (Week 1)**:
   - SwapRouter oracle fix ✅
   - SwapRouter disabled swap handling
   - Set up handlers on trackers
   - Research/confirm tracker interfaces (if needed)

2. **HIGH (Week 2-3)**:
   - Redesign staking chain with ERC20 handling
   - Fix unstaking flow
   - Add internal conversions

3. **TESTING (Week 3-4)**:
   - Deploy to testnet
   - Full integration testing, including chaining
   - Edge case validation

4. **AUDIT (Week 4+)**:
   - Professional security audit focusing on chaining and handlers
   - Fix any findings
   - Final deployment preparation

## Success Criteria

1. **Functional Requirements**:
   - Users can stake AMPED and receive staking credit/rewards directly
   - Users can unstake and receive AMPED back
   - No manual approval steps except initial AMPED approval
   - Works with swapEnabled=true or false
   - Seamless chaining without reverts

2. **Security Requirements**:
   - No reentrancy vulnerabilities
   - No approval race conditions
   - Proper access controls (e.g., handlers secured)
   - Emergency pause functionality works

3. **Performance Requirements**:
   - Gas costs comparable to direct GMX interaction
   - No unnecessary token transfers
   - Efficient approval management

## Conclusion

The current contracts have fundamental architectural flaws that make them non-functional. The fixes outlined above are not optional enhancements but critical requirements for basic functionality, now aligned with the ERC20-based tracker mechanics.

**Key Takeaway**: The staking router must be completely redesigned to handle ERC20 receipts via handler privileges. This is a significant refactor, not a minor patch.

**Recommendation**: Do not deploy current contracts. Implement all fixes and conduct thorough testing before any mainnet deployment.