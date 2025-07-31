# Manual Configuration Guide for AMPED System

This guide provides step-by-step instructions for configuring the AMPED system using Sonicscan's contract interface with Frame signer.

## Prerequisites
- All contracts deployed (AMPED token, routers)
- Frame wallet connected with governance/admin account
- Contract addresses noted

## Configuration Steps via Sonicscan

### Step 1: Configure Handler Permissions on RewardTrackers

You need to make the `AmpedStakingRouter` a handler on all three RewardTrackers.

#### 1.1 StakedGmxTracker
1. Go to Sonicscan: `https://sonicscan.org/address/<StakedGmxTracker_Address>`
2. Click "Contract" → "Write Contract"
3. Connect Frame wallet
4. Find `setHandler` function
5. Enter parameters:
   - `_handler`: `<AmpedStakingRouter_Address>`
   - `_isActive`: `true`
6. Click "Write" and sign with Frame

#### 1.2 BonusGmxTracker
1. Go to Sonicscan: `https://sonicscan.org/address/<BonusGmxTracker_Address>`
2. Click "Contract" → "Write Contract"
3. Find `setHandler` function
4. Enter parameters:
   - `_handler`: `<AmpedStakingRouter_Address>`
   - `_isActive`: `true`
5. Click "Write" and sign with Frame

#### 1.3 FeeGmxTracker
1. Go to Sonicscan: `https://sonicscan.org/address/<FeeGmxTracker_Address>`
2. Click "Contract" → "Write Contract"
3. Find `setHandler` function
4. Enter parameters:
   - `_handler`: `<AmpedStakingRouter_Address>`
   - `_isActive`: `true`
5. Click "Write" and sign with Frame

### Step 2: Register AMP as Deposit Token

Register AMP token on StakedGmxTracker:

1. Go to Sonicscan: `https://sonicscan.org/address/<StakedGmxTracker_Address>`
2. Click "Contract" → "Write Contract"
3. Find `setDepositToken` function (or similar - might be named differently)
4. Enter parameters:
   - `_token`: `<AMP_Token_Address>`
   - `_isDepositToken`: `true`
5. Click "Write" and sign with Frame

**Note**: If this function doesn't exist, check if AMP is already registered by reading `isDepositToken(AMP_address)`

### Step 3: Configure SwapRouter

#### 3.1 Set Swap Ratio
1. Go to Sonicscan: `https://sonicscan.org/address/<AmpedSwapRouter_Address>`
2. Click "Contract" → "Write Contract"
3. Find `setSwapRatio` function
4. Enter parameter:
   - `_ratio`: `10000` (this means 1:1 ratio)
5. Click "Write" and sign with Frame

#### 3.2 Fund SwapRouter with Tokens

**For AMP tokens (after bridging):**
1. Go to AMP token contract on Sonicscan
2. Click "Contract" → "Write Contract"
3. Find `transfer` function
4. Enter parameters:
   - `recipient`: `<AmpedSwapRouter_Address>`
   - `amount`: Amount in wei (e.g., `1000000000000000000000000` for 1M tokens)
5. Click "Write" and sign with Frame

**For AMPED tokens:**
1. Go to AMPED token contract on Sonicscan
2. Click "Contract" → "Write Contract"
3. Find `transfer` function
4. Enter parameters:
   - `recipient`: `<AmpedSwapRouter_Address>`
   - `amount`: Amount in wei (e.g., `1000000000000000000000000` for 1M tokens)
5. Click "Write" and sign with Frame

### Step 4: Configure Reward Trackers on Routers

#### 4.1 Set trackers on AmpedStakingRouter
1. Go to Sonicscan: `https://sonicscan.org/address/<AmpedStakingRouter_Address>`
2. Click "Contract" → "Write Contract"
3. Find `setRewardTrackers` function
4. Enter parameters:
   - `_stakedGmxTracker`: `<StakedGmxTracker_Address>`
   - `_bonusGmxTracker`: `<BonusGmxTracker_Address>`
   - `_feeGmxTracker`: `<FeeGmxTracker_Address>`
5. Click "Write" and sign with Frame

#### 4.2 Set trackers on AmpedRewardsRouter
1. Go to Sonicscan: `https://sonicscan.org/address/<AmpedRewardsRouter_Address>`
2. Click "Contract" → "Write Contract"
3. Find `setRewardTrackers` function
4. Enter all 7 parameters (get addresses from sonic-deployment.json):
   - `_gmxVester`: `<GmxVester_Address>`
   - `_glpVester`: `<GlpVester_Address>`
   - `_stakedGmxTracker`: `<StakedGmxTracker_Address>`
   - `_bonusGmxTracker`: `<BonusGmxTracker_Address>`
   - `_feeGmxTracker`: `<FeeGmxTracker_Address>`
   - `_stakedGlpTracker`: `<StakedGlpTracker_Address>`
   - `_feeGlpTracker`: `<FeeGlpTracker_Address>`
5. Click "Write" and sign with Frame

## Verification Steps

After configuration, verify everything is set correctly:

### 1. Check Handler Status
On each RewardTracker contract, use "Read Contract":
- Call `isHandler(<AmpedStakingRouter_Address>)`
- Should return `true`

### 2. Check Deposit Token Status
On StakedGmxTracker, use "Read Contract":
- Call `isDepositToken(<AMP_Token_Address>)`
- Should return `true`

### 3. Check SwapRouter Configuration
On AmpedSwapRouter, use "Read Contract":
- Call `swapRatio()`
- Should return `10000`
- Call `balanceOf` on both AMP and AMPED tokens with SwapRouter address
- Should show your deposited amounts

### 4. Check Router Configuration
On both routers, verify tracker addresses are set by reading:
- `stakedGmxTracker()`
- `bonusGmxTracker()`
- `feeGmxTracker()`

## Contract Addresses Needed

From your deployment:
- `AmpedToken`: [From AMPED deployment]
- `AmpedSwapRouter`: [From router deployment]
- `AmpedStakingRouter`: [From router deployment]
- `AmpedRewardsRouter`: [From router deployment]

From sonic-deployment.json:
- `StakedGmxTracker`: [From deployment file]
- `BonusGmxTracker`: [From deployment file]
- `FeeGmxTracker`: [From deployment file]
- `StakedGlpTracker`: [From deployment file]
- `FeeGlpTracker`: [From deployment file]
- `GmxVester`: [From deployment file]
- `GlpVester`: [From deployment file]

Existing token:
- `AMP`: [Your existing AMP token address]

## Common Issues

1. **"Ownable: caller is not the owner"**
   - Make sure you're connected with the admin/governance wallet

2. **"RewardTracker: forbidden"**
   - Handler permissions not set correctly
   - Verify isHandler returns true

3. **Transaction fails with no error**
   - Check gas settings in Frame
   - Verify contract addresses are correct

## Testing After Configuration

1. Try a small AMPED → AMP swap
2. Try staking AMPED through StakingRouter
3. Check that staking balance appears under your address (not router address)
4. Test claiming rewards

Remember to test with small amounts first!