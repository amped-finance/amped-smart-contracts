# AMP Staking and esAMP Conversion Guide

## Overview

This guide explains how AMP token holders can earn esAMP rewards through staking and the process of converting esAMP tokens to AMP tokens through vesting.

## Table of Contents

1. [AMP Staking System](#amp-staking-system)
2. [Earning esAMP Rewards](#earning-esamp-rewards)
3. [The 3-Tier Staking System](#the-3-tier-staking-system)
4. [esAMP to AMP Conversion Process](#esamp-to-amp-conversion-process)
5. [Vesting Details](#vesting-details)
6. [Key Contract Addresses](#key-contract-addresses)
7. [Step-by-Step Guides](#step-by-step-guides)
8. [Important Considerations](#important-considerations)

## AMP Staking System

When you stake AMP tokens, you participate in a sophisticated 3-tier reward system that provides multiple benefits:

1. **esAMP Rewards**: Earned through StakedGmxTracker
2. **Multiplier Points (MP)**: Earned through BonusGmxTracker
3. **Fee Rewards (WETH)**: Earned through FeeGmxTracker

## Earning esAMP Rewards

### How AMP Stakers Receive esAMP

As an AMP staker, you are eligible to receive esAMP rewards through the following process:

1. **Stake AMP**: When you stake AMP tokens via the RewardRouter
2. **Automatic Tracking**: Your staked AMP is tracked by StakedGmxTracker
3. **esAMP Distribution**: The StakedGmxTracker distributes esAMP rewards based on:
   - Your staked amount
   - Total staked supply
   - Distribution rate (set by admin)

### Reward Flow Diagram

```
AMP Token → Stake via RewardRouter → StakedGmxTracker
                                           ↓
                                    Earns esAMP rewards
                                           ↓
                                    Claim via RewardRouter
```

## The 3-Tier Staking System

### Tier 1: StakedGmxTracker
- **Accepts**: AMP and esAMP tokens
- **Rewards**: esAMP tokens
- **Purpose**: Primary staking layer for earning esAMP

### Tier 2: BonusGmxTracker
- **Accepts**: StakedGmxTracker tokens
- **Rewards**: Multiplier Points (MP)
- **Purpose**: Boost your rewards potential

### Tier 3: FeeGmxTracker
- **Accepts**: BonusGmxTracker tokens
- **Rewards**: WETH (platform fees)
- **Purpose**: Share in protocol revenue

## esAMP to AMP Conversion Process

### Overview

The conversion from esAMP to AMP involves a vesting process through Vester contracts:

1. **Deposit esAMP**: Into VesterGMX contract
2. **Vesting Period**: 365 days (1 year)
3. **Linear Release**: AMP tokens are released linearly over the vesting period
4. **Burn Mechanism**: esAMP is burned as AMP is released

### Detailed Conversion Steps

#### Step 1: Check Your esAMP Balance

```javascript
// Check esAMP balance
const esAMP = await contractAt("Token", "0xe5AF4c03F23af85AC6732F2dE3afAed3dD712080");
const balance = await esAMP.balanceOf(yourAddress);
console.log("esAMP Balance:", ethers.utils.formatEther(balance));
```

#### Step 2: Deposit esAMP into Vester

```javascript
// Deposit esAMP for vesting
const vesterGMX = await contractAt("Vester", "0xD7AdEac4c635F6e220945513f7a1a2adAdeB5257");

// Approve esAMP transfer
await esAMP.approve(vesterGMX.address, amount);

// Deposit into vester
await vesterGMX.deposit(amount);
```

#### Step 3: Monitor Vesting Progress

```javascript
// Check vesting status
const vestedAmount = await vesterGMX.getVestedAmount(yourAddress);
const claimableAmount = await vesterGMX.claimable(yourAddress);

console.log("Total Vested:", ethers.utils.formatEther(vestedAmount));
console.log("Claimable Now:", ethers.utils.formatEther(claimableAmount));
```

#### Step 4: Claim Vested AMP

```javascript
// Claim available AMP tokens
await vesterGMX.claim();
// AMP tokens are sent to your wallet
```

## Vesting Details

### Key Parameters

- **Vesting Duration**: 365 days (immutable)
- **Vesting Type**: Linear release
- **Early Exit**: Possible with `withdraw()` function
- **Paired Tokens**: May require AMP/ALP pairing for maximum vesting

### Vesting Formula

```
Daily Vesting Rate = Total esAMP Deposited / 365
Claimable Amount = (Days Elapsed × Daily Vesting Rate)
```

### Important Notes on Vesting

1. **Burning Process**: 
   - esAMP is burned when updating vesting progress
   - This happens automatically during claims
   - The burn reduces esAMP supply permanently

2. **Maximum Vestable Amount**:
   - Based on your reward history
   - Calculated from cumulative rewards earned
   - Prevents gaming the system

3. **Pair Token Requirements**:
   - May need to pair with AMP/ALP tokens
   - Ratio based on average staked amounts
   - Ensures commitment to the protocol

## Key Contract Addresses (Base Sepolia)

| Contract | Address | Purpose |
|----------|---------|---------|
| AMP Token | `[To be deployed]` | Governance token |
| esAMP Token | `0xe5AF4c03F23af85AC6732F2dE3afAed3dD712080` | Escrowed AMP |
| VesterGMX | `0xD7AdEac4c635F6e220945513f7a1a2adAdeB5257` | Vests esAMP for AMP stakers |
| VesterGLP | `0x7989dD3a14959D7fD65612E6669B7d61D62F5899` | Vests esAMP for ALP stakers |
| StakedGmxTracker | `0xD7bD53F40F33721B05C8192B365952151af24e4C` | Tracks staked AMP |
| RewardRouter | `[Check deployment files]` | Main staking interface |

## Step-by-Step Guides

### Guide 1: Start Earning esAMP as an AMP Staker

1. **Get AMP Tokens**
   - Purchase AMP from exchanges
   - Or receive from other holders

2. **Stake AMP**
   ```javascript
   // Via RewardRouter
   await rewardRouter.stakeGmx(ampAmount);
   ```

3. **Compound Rewards** (Optional)
   ```javascript
   // Auto-stake earned esAMP
   await rewardRouter.compound();
   ```

4. **Monitor Earnings**
   ```javascript
   const claimable = await stakedGmxTracker.claimable(yourAddress);
   console.log("Claimable esAMP:", ethers.utils.formatEther(claimable));
   ```

### Guide 2: Convert esAMP to AMP

1. **Check Requirements**
   ```javascript
   // Check if you need pair tokens
   const vester = await contractAt("Vester", vesterAddress);
   const pairAmount = await vester.getPairAmount(yourAddress, esAmpAmount);
   ```

2. **Prepare Tokens**
   - Ensure you have required esAMP
   - Obtain pair tokens if needed

3. **Start Vesting**
   ```javascript
   // Approve and deposit
   await esAMP.approve(vester.address, amount);
   await vester.deposit(amount);
   ```

4. **Claim Periodically**
   ```javascript
   // Claim vested AMP (can be done anytime)
   await vester.claim();
   ```

5. **Or Exit Early**
   ```javascript
   // Withdraw all (stops vesting, returns unvested esAMP)
   await vester.withdraw();
   ```

## Important Considerations

### For AMP Stakers

1. **Staking Benefits**:
   - Earn esAMP continuously
   - Receive multiplier points
   - Share in protocol fees (WETH)

2. **No Direct esAMP Trading**:
   - esAMP has transfer restrictions
   - Must be vested to become tradeable AMP
   - Designed to reward long-term holders

3. **Compounding Strategy**:
   - Can stake earned esAMP for more rewards
   - Creates compounding effect
   - Increases your protocol share

### For Vesting Process

1. **Time Commitment**:
   - 1-year lock for full conversion
   - Linear release provides flexibility
   - Can exit early but forfeit unvested portion

2. **Vester Minter Rights**:
   - Vesters have minter rights on esAMP
   - Used for governance/emergency functions
   - Normal operation only burns esAMP

3. **Tax Considerations**:
   - Vesting may have tax implications
   - Consult tax professionals
   - Track your vesting events

### Security Notes

1. **Private Transfer Mode**:
   - esAMP has restricted transfers
   - Only whitelisted handlers can move tokens
   - Protects against unauthorized transfers

2. **Handler Requirements**:
   - RewardRouter is whitelisted handler
   - Vester contracts are whitelisted
   - Direct transfers between users blocked

## Troubleshooting

### Common Issues

1. **"Cannot stake AMP"**
   - Check AMP balance
   - Approve RewardRouter
   - Ensure not in private staking mode

2. **"Cannot claim esAMP"**
   - Wait for rewards to accrue
   - Check if claiming is enabled
   - Verify you have staked tokens

3. **"Vesting deposit failed"**
   - Check esAMP balance
   - Approve Vester contract
   - Verify pair token requirements

4. **"Max vestable exceeded"**
   - Based on your earning history
   - Cannot vest more than earned
   - Check your maximum vestable amount

## Summary

The AMP staking and esAMP conversion system creates a sustainable token economy:

- **Stakers earn esAMP**: Rewards for supporting the protocol
- **1-year vesting**: Ensures long-term alignment
- **Multiple reward streams**: esAMP, MP, and WETH
- **Compounding options**: Grow your position over time

This system rewards patient, long-term participants while maintaining protocol stability through the vesting mechanism.

---

Last Updated: January 2025