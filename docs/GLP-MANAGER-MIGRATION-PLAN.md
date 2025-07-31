# GLP Manager Migration Plan - GMX V1 Re-entrancy Fix

## Overview
This document outlines the migration plan to deploy a new GlpManager contract with re-entrancy protection while maintaining yALP vault functionality. The migration addresses the July 2025 GMX V1 exploit that resulted in $40M+ losses.

## Key Findings
- **Root Cause**: Re-entrancy vulnerability in GlpManager allowing atomic mint/redeem cycles
- **Solution**: Deploy new GlpManager with cooldown + handler whitelist
- **Critical Dependency**: RewardRouterV2 has immutable reference to old GlpManager
- **Impact**: Must redeploy RewardRouterV2 (minimal state, only `pendingReceivers` mapping)

## Migration Components

### 1. New GlpManager Contract
Deploy modified GlpManager with:
```solidity
// In _removeLiquidity function
if (!isHandler[_account]) {
    require(lastAddedAt[_account].add(cooldownDuration) <= block.timestamp, "GlpManager: cooldown duration not yet passed");
}
```

### 2. Contract Dependencies to Update
| Contract | Update Required | Method | Impact |
|----------|----------------|--------|--------|
| GLP Token | Change minter | `setMinter(address, bool)` | Critical - enables new GlpManager |
| USDG Token | Update vault | `addVault()`/`removeVault()` | Critical - enables USDG operations |
| RewardRouterV2 | Redeploy | New deployment | Required - immutable reference |
| yALP Vault | Whitelist | `setHandler()` on new GlpManager | Critical - maintains functionality |

### 3. Contracts Requiring No Changes
- Vault (no direct GlpManager reference)
- OrderBook
- PositionRouter
- Existing ALP tokens remain valid

## Pre-Migration Checklist

- [ ] Deploy new GlpManager to Sonic testnet
- [ ] Deploy new RewardRouterV2 with new GlpManager address
- [ ] Test cooldown enforcement for regular users
- [ ] Test yALP vault exemption via handler whitelist
- [ ] Prepare multisig transactions for atomic migration
- [ ] Announce 2-hour maintenance window to users
- [ ] Update frontend code with new RewardRouterV2 address
- [ ] Prepare user communication about re-approvals needed

## Migration Sequence

### Phase 1: Deploy New Contracts (Pre-maintenance)
```bash
# Deploy contracts but don't activate yet
1. Deploy NewGlpManager with cooldown = 7200 (2 hours)
2. Deploy NewRewardRouterV2 pointing to NewGlpManager
3. Verify all contracts on explorer
```

### Phase 2: Atomic Migration (During maintenance)
Execute these transactions in sequence via multisig:

```solidity
// Transaction 1: Disable old system
GLP.setMinter(0x4DE729B85dDB172F1bb775882f355bA25764E430, false);  // old GlpManager
USDG.removeVault(0x4DE729B85dDB172F1bb775882f355bA25764E430);     // old GlpManager

// Transaction 2: Enable new system
GLP.setMinter(NEW_GLP_MANAGER_ADDRESS, true);
USDG.addVault(NEW_GLP_MANAGER_ADDRESS);

// Transaction 3: Configure handlers
NewGlpManager.setHandler(YALP_VAULT_ADDRESS, true);  // Exempt yALP from cooldown
NewGlpManager.setHandler(NEW_REWARD_ROUTER_ADDRESS, true);  // If needed
```

### Phase 3: Post-Migration
1. Update frontend to use new RewardRouterV2 address
2. Verify all core functions work:
   - Regular user GLP minting (with cooldown)
   - yALP deposits/withdrawals (no cooldown)
   - Reward claiming
3. Monitor for any issues
4. Announce completion

## Risk Mitigation

### Rollback Plan
If critical issues arise:
```solidity
// Emergency rollback
GLP.setMinter(0x4DE729B85dDB172F1bb775882f355bA25764E430, true);   // Re-enable old
USDG.addVault(0x4DE729B85dDB172F1bb775882f355bA25764E430);
GLP.setMinter(NEW_GLP_MANAGER_ADDRESS, false);  // Disable new
USDG.removeVault(NEW_GLP_MANAGER_ADDRESS);
```

### Edge Cases Considered
1. **Partial Migration Failure**: Use multisig to ensure atomic execution
2. **User Approvals**: Clear communication about new RewardRouter approvals
3. **Handler Security**: Ensure only trusted contracts are whitelisted
4. **Cooldown Bypass**: yALP vault must implement proper access controls

## Testing Requirements

### Mainnet Fork Testing
1. Fork Sonic mainnet
2. Execute full migration sequence
3. Test scenarios:
   - Regular user mint/redeem with cooldown
   - yALP vault operations without cooldown
   - Attempt re-entrancy attack on new contracts
   - Verify old RewardRouter fails gracefully

### Security Considerations
- Audit new GlpManager cooldown logic
- Verify handler whitelist cannot be exploited
- Ensure no other contracts have immutable GlpManager references
- Test against known exploit patterns

## Communication Plan

### Pre-Migration (T-24 hours)
- Announce maintenance window
- Explain security upgrade necessity
- Warn about new approvals needed

### During Migration
- Display maintenance page
- Update status on social channels

### Post-Migration
- Announce completion
- Provide approval instructions
- Share new contract addresses

## Contract Addresses

### Current (Sonic)
- GLP: 0x6fbaeE8bEf2e8f5c34A08BdD4A4AB777Bd3f6764
- USDG: 0x8846d38481f8e3F9a7dDCBE1DFf0981dB2bC04A3
- GlpManager: 0x4DE729B85dDB172F1bb775882f355bA25764E430
- RewardRouterV2: 0xE72A2d5B3b09c88D4E8Cc60e74BD438d7168e80F
- yALP Vault: [TO BE FILLED]

### New (To be deployed)
- NewGlpManager: [TO BE FILLED]
- NewRewardRouterV2: [TO BE FILLED]

## Success Criteria
- [ ] No funds lost during migration
- [ ] yALP vault continues functioning without cooldown
- [ ] Regular users subject to 2-hour cooldown
- [ ] No successful re-entrancy attacks possible
- [ ] All user funds accessible post-migration

## Timeline
- **Day 1**: Deploy and test on testnet
- **Day 2**: Deploy to mainnet (inactive)
- **Day 3**: Execute migration during low-activity period
- **Day 4**: Monitor and address any issues

---

**Note**: This migration is critical for protocol security. While it requires redeploying RewardRouterV2, the impact is manageable as it holds minimal state. The key benefit is protecting against catastrophic losses while maintaining composability for integrated protocols like yALP.