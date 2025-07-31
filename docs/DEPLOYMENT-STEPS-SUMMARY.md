# AMPED System Deployment Steps Summary

## Deployment Options

### Option A: Cross-Chain Deployment (Ethereum → Sonic)
**Recommended for production**
- Deploy AMPED on Ethereum mainnet first
- Bridge to Sonic via LayerZero OFT
- Enables cross-chain governance

See: `ETHEREUM-TO-SONIC-DEPLOYMENT-GUIDE.md`

### Option B: Direct Sonic Deployment
**For testing or Sonic-only deployment**
- Deploy directly on Sonic
- No cross-chain functionality initially

## Prerequisites
- AMP token address (existing token that will be bridged)
- Access to deployment networks with gas tokens
- Deployment wallet with appropriate permissions

## Direct Sonic Deployment Steps

### 1. Deploy AMPED Token
```bash
npx hardhat run scripts/tokens/deployAmpedToken.js --network sonic
```
Note the AMPED token address.

### 2. Set Environment Variables
```bash
export AMPED_TOKEN_ADDRESS=<amped_token_from_step_1>
export AMP_TOKEN_ADDRESS=<existing_amp_token_address>
```

### 3. Deploy Router Contracts
```bash
npx hardhat run scripts/staking/deployAmpedRouters.js --network sonic
```
This deploys:
- AmpedSwapRouter
- AmpedStakingRouter
- AmpedRewardsRouter

### 4. Configure the System

**Option A: Using Script (if you have direct wallet access)**
```bash
export SWAP_ROUTER_ADDRESS=<swap_router_from_step_3>
export STAKING_ROUTER_ADDRESS=<staking_router_from_step_3>
export REWARDS_ROUTER_ADDRESS=<rewards_router_from_step_3>

npx hardhat run scripts/staking/configureAmpedSystem.js --network sonic
```

**Option B: Manual Configuration via Sonicscan (recommended for Frame signer)**

Follow the detailed steps in:
- `docs/MANUAL-CONFIGURATION-GUIDE.md` - Step-by-step instructions
- `docs/CONFIGURATION-CHECKLIST.md` - Checklist to track progress

The configuration will:
- Set StakingRouter as handler on all RewardTrackers
- Register AMP as a deposit token on StakedGmxTracker
- Configure swap ratio on SwapRouter
- Set reward tracker addresses on routers

### 5. Manual Steps Required

#### Fund SwapRouter with Tokens:
1. Bridge AMP tokens from source chain to Sonic
2. Transfer AMP tokens to SwapRouter address
3. Transfer some AMPED tokens to SwapRouter for reverse swaps

#### Verify Configuration (done by configureAmpedSystem.js):
- ✅ StakingRouter is set as handler on all RewardTrackers
- ✅ AMP is registered as a deposit token on StakedGmxTracker
- ✅ Swap ratio is set correctly (10000 = 1:1)
- ✅ All handler permissions are verified

### 6. Testing
1. Test AMPED → AMP swap
2. Test staking AMPED (should convert to AMP and stake)
3. Test claiming rewards (should receive AMPED)
4. Monitor liquidity levels in SwapRouter

## Important Addresses to Note
- AMPED Token: `<will be shown after deployment>`
- AMP Token: `<existing token address>`
- SwapRouter: `<will be shown after deployment>`
- StakingRouter: `<will be shown after deployment>`
- RewardsRouter: `<will be shown after deployment>`

## Handler Permissions Detail
The `configureAmpedSystem.js` script automatically sets:
- `StakingRouter` as handler on `StakedGmxTracker`
- `StakingRouter` as handler on `BonusGmxTracker`  
- `StakingRouter` as handler on `FeeGmxTracker`

This allows the StakingRouter to call `stakeForAccount()` on behalf of users.

## Troubleshooting
- If staking fails: Check handler permissions using `isHandler(stakingRouter.address)`
- If swaps fail: Check token balances in SwapRouter
- If rewards fail: Verify RewardsRouter configuration
- If "forbidden" errors: Ensure all handler permissions are set correctly