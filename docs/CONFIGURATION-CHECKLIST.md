# AMPED System Configuration Checklist

Use this checklist to track your configuration progress. Check off each item as you complete it.

## Pre-Configuration
- [ ] AMPED token deployed
- [ ] AmpedSwapRouter deployed
- [ ] AmpedStakingRouter deployed
- [ ] AmpedRewardsRouter deployed
- [ ] AMP tokens bridged to Sonic
- [ ] Frame wallet connected with admin account

## Handler Permissions
- [ ] StakedGmxTracker.setHandler(AmpedStakingRouter, true)
- [ ] BonusGmxTracker.setHandler(AmpedStakingRouter, true)
- [ ] FeeGmxTracker.setHandler(AmpedStakingRouter, true)

## Token Registration
- [ ] StakedGmxTracker.setDepositToken(AMP_address, true)

## SwapRouter Configuration
- [ ] AmpedSwapRouter.setSwapRatio(10000)
- [ ] Transfer AMP tokens to SwapRouter
- [ ] Transfer AMPED tokens to SwapRouter

## Router Configuration
- [ ] AmpedStakingRouter.setRewardTrackers(staked, bonus, fee)
- [ ] AmpedRewardsRouter.setRewardTrackers(all 7 addresses)

## Verification
- [ ] StakedGmxTracker.isHandler(AmpedStakingRouter) returns true
- [ ] BonusGmxTracker.isHandler(AmpedStakingRouter) returns true
- [ ] FeeGmxTracker.isHandler(AmpedStakingRouter) returns true
- [ ] StakedGmxTracker.isDepositToken(AMP) returns true
- [ ] AmpedSwapRouter.swapRatio() returns 10000
- [ ] SwapRouter has AMP balance
- [ ] SwapRouter has AMPED balance

## Testing
- [ ] Test AMPED → AMP swap (small amount)
- [ ] Test staking AMPED
- [ ] Verify staking balance shows under user address
- [ ] Test claiming rewards
- [ ] Test AMP → AMPED conversion on rewards

## Notes Section
_Use this space to note any issues or important addresses:_

```
AmpedStakingRouter: 
AmpedSwapRouter: 
AmpedRewardsRouter: 
Issues encountered:
```