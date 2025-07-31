# Timelock Integration Guide for AmpedStakingRouter

## Overview

Yes, the existing protocol Timelock is sufficient for securing AmpedStakingRouter governance. The current Timelock contract provides all necessary features for implementing delayed governance actions, preventing immediate malicious changes.

## Key Benefits of Using Existing Timelock

1. **Battle-tested**: Already deployed and securing other protocol components
2. **Consistent governance**: Same delay and process across all protocol contracts
3. **No additional deployment**: Saves gas and reduces complexity
4. **Unified admin control**: Single point of governance for entire protocol

## Integration Steps

### 1. Deploy AmpedStakingRouterV2Timelock

Use the extended version that implements `ITimelockTarget`:

```solidity
// Deploy
AmpedStakingRouterV2Timelock router = new AmpedStakingRouterV2Timelock();

// Initialize with Timelock as gov
router.initialize(
    ampedToken,
    ampToken,
    rewardRouter,
    swapRouter,
    weth
);

// Transfer governance to Timelock
router.setGov(timelockAddress);
```

### 2. Configure Timelock Permissions

The Timelock admin (ideally a multi-sig) must be set:

```solidity
// Current admin should be a multi-sig wallet
timelock.admin() // Should return multi-sig address
```

### 3. Governance Operations Flow

All critical operations now require the two-step timelock process:

#### Example: Changing Swap Router

**Step 1: Signal the change**
```solidity
// Admin (multi-sig) signals the governance transfer
bytes32 action = timelock.signalSetGov(
    address(router),      // target
    newSwapRouter        // new gov address
);
```

**Step 2: Wait for buffer period**
```solidity
// Default buffer is set in constructor, typically 24-48 hours
uint256 buffer = timelock.buffer();
```

**Step 3: Execute after delay**
```solidity
// After buffer period passes
timelock.setGov(
    address(router),
    newSwapRouter
);
```

### 4. Emergency Actions

For true emergencies, the Timelock admin can:
- Cancel pending actions via `cancelAction(bytes32 _action)`
- Adjust buffer time (though this itself requires timelock)

## Security Considerations

### ✅ Advantages of Existing Timelock

1. **Proven Security**: The contract is already protecting critical protocol functions
2. **Consistent Delays**: Same buffer period for all governance actions
3. **Action Transparency**: All pending actions are visible on-chain
4. **No Additional Trust**: Users already trust this timelock for other protocol components

### ⚠️ Important Requirements

1. **Multi-sig Admin**: The Timelock's admin MUST be a multi-signature wallet
2. **Appropriate Buffer**: Current buffer should be at least 24 hours (recommend 48 hours)
3. **Monitoring**: Set up monitoring for `SignalPendingAction` events

## Implementation Example

Here's how to make AmpedStakingRouter changes through Timelock:

### Updating Critical Parameters

```javascript
// Using ethers.js
const timelock = new ethers.Contract(timelockAddress, timelockABI, signer);
const router = new ethers.Contract(routerAddress, routerABI, signer);

// 1. Signal parameter change (e.g., updating minAmountOut)
// First, create a custom function in router that can be called by gov
// Then signal it through timelock

// For now, governance functions go through setGov pattern
// Additional parameter updates would need custom timelock functions
```

### Monitoring Pending Actions

```javascript
// Listen for pending actions
timelock.on("SignalPendingAction", (action) => {
    console.log("New pending action:", action);
    // Alert administrators
});

// Check if action can be executed
const pendingTimestamp = await timelock.pendingActions(action);
const currentTime = Math.floor(Date.now() / 1000);
if (pendingTimestamp > 0 && pendingTimestamp < currentTime) {
    console.log("Action ready to execute");
}
```

## Recommended Configuration

For AmpedStakingRouter with existing Timelock:

1. **Buffer Period**: 48 hours (gives users time to exit if they disagree)
2. **Admin**: 3-of-5 or 4-of-7 multi-sig wallet
3. **Monitoring**: 
   - Alert on all `SignalSetGov` events
   - Track pending actions
   - Monitor admin changes

## Migration Path

### From Current AmpedStakingRouter to Timelock-Controlled Version

1. **Deploy new router** with timelock support
2. **Pause old router** (if pausable)
3. **Signal migration** through timelock
4. **Wait buffer period**
5. **Execute migration**
6. **Update all integrations** to point to new router

## Comparison: Existing vs New Timelock

| Feature | Existing Timelock | New Timelock |
|---------|------------------|--------------|
| Buffer period | ✅ Configurable (up to 5 days) | Would be same |
| Multi-sig support | ✅ If admin is multi-sig | Would need setup |
| Battle-tested | ✅ Already in production | ❌ New code |
| Integration effort | ✅ Minimal | ❌ More complex |
| Consistency | ✅ Same delays as other contracts | ❌ Different delays |

## Conclusion

The existing Timelock contract is **sufficient and recommended** for securing AmpedStakingRouter. It provides:

1. **Time delays** for all critical operations
2. **Transparency** through on-chain signals
3. **Consistency** with other protocol governance
4. **Battle-tested** security

The only requirement is ensuring the Timelock's admin is a secure multi-signature wallet, not a single EOA.

## Next Steps

1. ✅ Use existing Timelock contract
2. ✅ Ensure Timelock admin is multi-sig
3. ✅ Deploy AmpedStakingRouterV2Timelock
4. ✅ Transfer router governance to Timelock
5. ✅ Set up monitoring for timelock actions
6. ✅ Document all governance procedures