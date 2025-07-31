# esAMP Rewards Distribution Guide

## Overview

The `updateEsGmxRewards.js` script configures reward distribution rates for esAMP tokens on the Amped protocol. This guide covers the complete process of setting up and operating the rewards distribution system on the Sonic network.

**Important**: The script only sets distribution rates - you must separately fund the distributor contracts with esAMP tokens for users to receive rewards.

## How esAMP Token Distribution Works

### Token Flow

1. **Minting/Supply**: esAMP tokens are minted by authorized minters (treasury/governance)
2. **Distribution**: Admin transfers esAMP to reward distributors
3. **Earning**: Users earn esAMP by staking AMP or ALP tokens
4. **Claiming**: Users claim esAMP rewards through RewardRouter
5. **Vesting**: Users can vest esAMP through Vester contracts to receive AMP tokens
   - Vester contracts BURN esAMP during the vesting process
   - Users receive AMP tokens after the vesting period

### Important Notes on Vester Contracts

- **VesterGMX** (0x945f2677E5CCB4eeb98E16a3Eb416e1d0dcc0610): Vests esAMP → AMP for staked AMP
- **VesterGLP** (0x931d5560D236e0780FD872331e28D7598E0DeDcc): Vests esAMP → AMP for staked ALP
- Both contracts have **minter rights** on esAMP (granted during deployment)
- They burn esAMP when converting to AMP during the vesting process
- While they have minter rights, the Vester contract code doesn't directly mint esAMP
- esAMP minting must be done through separate governance actions or by authorized addresses

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Whitelist Requirements](#whitelist-requirements)
3. [Key Contracts](#key-contracts)
4. [Step-by-Step Setup](#step-by-step-setup)
5. [Funding Distributors](#funding-distributors)
6. [Running the Update Script](#running-the-update-script)
7. [Verification](#verification)
8. [Monitoring and Maintenance](#monitoring-and-maintenance)
9. [Troubleshooting](#troubleshooting)
10. [Security Considerations](#security-considerations)

## Prerequisites

Before operating the rewards system, ensure you have:

1. **Admin Access**: You must be the admin of the RewardDistributor contracts
2. **Handler Whitelist**: Your admin address must be whitelisted as a handler for esAMP transfers (see [Important: Whitelist Requirements](#whitelist-requirements))
3. **esAMP Tokens**: Sufficient esAMP tokens to fund the distributors
   - Option A: Mint esAMP if you have minter rights on the esAMP contract
   - Option B: Use existing esAMP from treasury/reserves
4. **Network Access**: Connected to the Sonic network
5. **Gas Tokens**: Native tokens (ETH) for transaction fees
6. **Hardhat Environment**: Properly configured with network settings

**Note on Vester Contracts**: VesterGMX and VesterGLP were granted minter rights on esAMP during deployment. However, the Vester contract code doesn't directly mint esAMP - it only burns esAMP when users vest it into AMP tokens. The minter rights may be for future governance actions or emergency functions.

## Whitelist Requirements

### Important: esAMP Transfer Restrictions

The esAMP token has `inPrivateTransferMode` enabled, which means only whitelisted handlers can transfer tokens. This is a security feature to prevent unauthorized token movements.

**Before you can fund distributors, you must:**

1. **Check if your address is whitelisted**:
```javascript
const esAMP = await contractAt("Token", "0x1ab02347D787A144a7fBC934a9B96420d46e9eD8");
const isHandler = await esAMP.isHandler(yourAddress);
console.log("Is Handler:", isHandler);
```

2. **Get whitelisted (requires governance)**:
```javascript
// Only governance can execute this
await esAMP.setHandler(adminAddress, true);
```

3. **Verify whitelist status** before attempting transfers:
```javascript
// scripts/staking/checkWhitelistStatus.js
const { contractAt } = require("../shared/helpers");
const { ethers } = require("hardhat");

async function main() {
    const esAMP = await contractAt("Token", "0x1ab02347D787A144a7fBC934a9B96420d46e9eD8");
    const signer = await ethers.getSigner();
    
    console.log("=== esAMP Whitelist Status ===");
    console.log("Your Address:", signer.address);
    console.log("Is Handler:", await esAMP.isHandler(signer.address));
    console.log("Private Transfer Mode:", await esAMP.inPrivateTransferMode());
    console.log("Governor:", await esAMP.gov());
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
```

**Common Error**: If you see `BaseToken: msg.sender not whitelisted`, your address needs to be added as a handler.

## Key Contracts

### Sonic Network Addresses

| Contract | Address | Purpose |
|----------|---------|---------|
| esAMP Token | `0x1ab02347D787A144a7fBC934a9B96420d46e9eD8` | Reward token |
| RewardTrackerStakedGMX | `0xCe0a0e2BbA0F2168DD614b1414CfE707c13aa081` | Tracks staked AMP |
| RewardDistributorStakedGMX | `0xD24c217230DAf4036E290133861EfF4B9aDB2b27` | Distributes rewards to AMP stakers |
| RewardTrackerFeeStakedGLP | `0xB895e3DBFB37A4Cc6b4FB50B1cf903608e942FF9` | Tracks staked ALP |
| RewardDistributorFeeStakedGLP | `0x2a7663A3e6961dC43bEcbF752DcC9798C1c22a6A` | Distributes rewards to ALP stakers |

## Step-by-Step Setup

### Step 1: Check Current Configuration

First, verify the current state of the reward system:

```bash
# Set your network
export HARDHAT_NETWORK=sonic

# Temporarily set shouldSendTxn = false in the script to run read-only
npx hardhat run scripts/staking/updateEsGmxRewards.js --network sonic
```

This will show:
- Current tokens per interval for each distributor
- Network configuration
- Contract addresses being used

### Step 2: Calculate Required esAMP Tokens

Based on your reward configuration:

| Distributor | Monthly Rewards | Recommended Initial Funding |
|-------------|----------------|---------------------------|
| ALP Stakers | 1000 esAMP | 3000-6000 esAMP (3-6 months) |
| AMP Stakers | 0 esAMP | Fund if enabling AMP rewards |

**Formula**: `Required Tokens = Monthly Amount × Number of Months`

### Step 3: Prepare Funding Script

Create `scripts/staking/fundEsAMPDistributors.js`:

```javascript
const { contractAt, sendTxn } = require("../shared/helpers");
const { ethers } = require("hardhat");

async function main() {
    const signer = await ethers.getSigner();
    const esAMP = await contractAt("Token", "0x1ab02347D787A144a7fBC934a9B96420d46e9eD8");
    
    // Configuration
    const distributions = [
        {
            name: "ALP Stakers Distributor",
            address: "0x2a7663A3e6961dC43bEcbF752DcC9798C1c22a6A",
            monthlyAmount: "1000",
            monthsToFund: 3
        },
        {
            name: "AMP Stakers Distributor", 
            address: "0xD24c217230DAf4036E290133861EfF4B9aDB2b27",
            monthlyAmount: "0",
            monthsToFund: 3
        }
    ];
    
    console.log("Signer address:", signer.address);
    console.log("Current esAMP balance:", ethers.utils.formatEther(await esAMP.balanceOf(signer.address)));
    
    for (const dist of distributions) {
        const amount = ethers.utils.parseEther((parseFloat(dist.monthlyAmount) * dist.monthsToFund).toString());
        if (amount.gt(0)) {
            const currentBalance = await esAMP.balanceOf(dist.address);
            console.log(`\n${dist.name}:`);
            console.log(`  Address: ${dist.address}`);
            console.log(`  Current Balance: ${ethers.utils.formatEther(currentBalance)} esAMP`);
            console.log(`  Funding Amount: ${ethers.utils.formatEther(amount)} esAMP`);
            
            await sendTxn(
                esAMP.transfer(dist.address, amount),
                `Transfer ${ethers.utils.formatEther(amount)} esAMP to ${dist.name}`
            );
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
```

## Funding Distributors

### Minting esAMP Tokens (If Needed)

If you need to mint esAMP tokens first:

```javascript
// scripts/staking/mintEsAMP.js
const { contractAt, sendTxn } = require("../shared/helpers");
const { ethers } = require("hardhat");

async function main() {
    const esAMP = await contractAt("Token", "0x1ab02347D787A144a7fBC934a9B96420d46e9eD8");
    
    // Check if you have minter rights
    const signer = await ethers.getSigner();
    const isMinter = await esAMP.isMinter(signer.address);
    
    if (!isMinter) {
        console.error("ERROR: Your address does not have minter rights on esAMP");
        console.log("Contact governance to grant minter rights to:", signer.address);
        console.log("\nCurrent minters with rights:");
        console.log("- VesterGMX: 0x945f2677E5CCB4eeb98E16a3Eb416e1d0dcc0610");
        console.log("- VesterGLP: 0x931d5560D236e0780FD872331e28D7598E0DeDcc");
        console.log("- Check for additional minters on-chain");
        return;
    }
    
    // Mint esAMP tokens
    const amountToMint = ethers.utils.parseEther("10000"); // 10,000 esAMP
    
    await sendTxn(
        esAMP.mint(signer.address, amountToMint),
        `Mint ${ethers.utils.formatEther(amountToMint)} esAMP`
    );
    
    console.log("Minted esAMP. New balance:", ethers.utils.formatEther(await esAMP.balanceOf(signer.address)));
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
```

### Option 1: Use the Funding Script

```bash
npx hardhat run scripts/staking/fundEsAMPDistributors.js --network sonic
```

### Option 2: Manual Transfer via Console

```bash
npx hardhat console --network sonic
```

```javascript
const esAMP = await ethers.getContractAt("Token", "0x1ab02347D787A144a7fBC934a9B96420d46e9eD8");

// Fund ALP distributor
await esAMP.transfer(
    "0x2a7663A3e6961dC43bEcbF752DcC9798C1c22a6A", 
    ethers.utils.parseEther("3000")
);

// Fund AMP distributor (if needed)
await esAMP.transfer(
    "0xD24c217230DAf4036E290133861EfF4B9aDB2b27", 
    ethers.utils.parseEther("0")
);
```

## Running the Update Script

After funding the distributors, configure the reward rates:

### 1. Configure Reward Amounts

Edit `scripts/staking/updateEsGmxRewards.js`:

```javascript
// Line 17 - Set monthly rewards for Sonic
const monthlyEsGmxForGlpOnSonic = expandDecimals(toInt("1000"), 18) // Adjust as needed
```

### 2. Run the Script

```bash
# Ensure shouldSendTxn = true in the script
npx hardhat run scripts/staking/updateEsGmxRewards.js --network sonic
```

The script will:
1. Initialize distributors if needed (set `lastDistributionTime`)
2. Calculate and set `tokensPerInterval` based on monthly amounts
3. Display current and new distribution rates

## Verification

Create `scripts/staking/verifyEsAMPRewards.js`:

```javascript
const { contractAt } = require("../shared/helpers");
const { ethers } = require("hardhat");

async function main() {
    const esAMP = await contractAt("Token", "0x1ab02347D787A144a7fBC934a9B96420d46e9eD8");
    
    const distributors = [
        {
            name: "ALP Stakers",
            tracker: "0xB895e3DBFB37A4Cc6b4FB50B1cf903608e942FF9",
            distributor: "0x2a7663A3e6961dC43bEcbF752DcC9798C1c22a6A"
        },
        {
            name: "AMP Stakers",
            tracker: "0xCe0a0e2BbA0F2168DD614b1414CfE707c13aa081",
            distributor: "0xD24c217230DAf4036E290133861EfF4B9aDB2b27"
        }
    ];
    
    console.log("=== esAMP Rewards Verification ===\n");
    
    for (const config of distributors) {
        console.log(`${config.name}:`);
        
        const distributor = await contractAt("RewardDistributor", config.distributor);
        const tracker = await contractAt("RewardTracker", config.tracker);
        
        const balance = await esAMP.balanceOf(config.distributor);
        const tokensPerInterval = await distributor.tokensPerInterval();
        const lastDistTime = await distributor.lastDistributionTime();
        const totalStaked = await tracker.totalSupply();
        
        console.log(`  Distributor Balance: ${ethers.utils.formatEther(balance)} esAMP`);
        console.log(`  Tokens Per Interval: ${tokensPerInterval.toString()}`);
        console.log(`  Per Day: ${ethers.utils.formatEther(tokensPerInterval.mul(86400))} esAMP`);
        console.log(`  Per Month: ${ethers.utils.formatEther(tokensPerInterval.mul(86400 * 30))} esAMP`);
        console.log(`  Last Distribution: ${new Date(lastDistTime.toNumber() * 1000).toLocaleString()}`);
        console.log(`  Total Staked: ${ethers.utils.formatEther(totalStaked)}`);
        
        if (balance.gt(0) && tokensPerInterval.gt(0)) {
            const daysRemaining = balance.div(tokensPerInterval).div(86400);
            console.log(`  Days of Rewards Remaining: ${daysRemaining.toString()}`);
        }
        console.log();
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
```

Run verification:
```bash
npx hardhat run scripts/staking/verifyEsAMPRewards.js --network sonic
```

## Monitoring and Maintenance

### Regular Tasks

1. **Weekly**: Check distributor balances
2. **Monthly**: Review distribution rates and adjust if needed
3. **Before Empty**: Refill distributors (set up alerts)

### Monitoring Script

Create an automated monitoring script that alerts when balances are low:

```javascript
// scripts/staking/monitorEsAMPDistributors.js
const { contractAt } = require("../shared/helpers");
const { ethers } = require("hardhat");

const DAYS_WARNING_THRESHOLD = 7; // Alert when less than 7 days remaining

async function main() {
    const esAMP = await contractAt("Token", "0x1ab02347D787A144a7fBC934a9B96420d46e9eD8");
    
    const distributors = [
        {
            name: "ALP Stakers",
            distributor: "0x2a7663A3e6961dC43bEcbF752DcC9798C1c22a6A"
        },
        {
            name: "AMP Stakers",
            distributor: "0xD24c217230DAf4036E290133861EfF4B9aDB2b27"
        }
    ];
    
    let alertsNeeded = false;
    
    for (const config of distributors) {
        const distributor = await contractAt("RewardDistributor", config.distributor);
        const balance = await esAMP.balanceOf(config.distributor);
        const tokensPerInterval = await distributor.tokensPerInterval();
        
        if (tokensPerInterval.gt(0)) {
            const secondsRemaining = balance.div(tokensPerInterval);
            const daysRemaining = secondsRemaining.div(86400);
            
            if (daysRemaining.lte(DAYS_WARNING_THRESHOLD)) {
                console.log(`⚠️  ALERT: ${config.name} distributor has only ${daysRemaining} days of rewards remaining!`);
                alertsNeeded = true;
            }
        }
    }
    
    if (!alertsNeeded) {
        console.log("✅ All distributors have sufficient balance");
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
```

## Troubleshooting

### Common Issues and Solutions

#### Issue: "BaseToken: msg.sender not whitelisted"
**Solution**: Your address needs to be whitelisted as a handler for esAMP transfers.
1. Check if you're whitelisted: `await esAMP.isHandler(yourAddress)`
2. Get governance to whitelist you: `await esAMP.setHandler(yourAddress, true)`
3. Verify private transfer mode is enabled: `await esAMP.inPrivateTransferMode()`

#### Issue: "RewardDistributor: invalid lastDistributionTime"
**Solution**: The distributor needs initialization. The script handles this automatically on first run.

#### Issue: Users can't claim rewards
**Checklist**:
1. Verify distributor has esAMP balance: `esAMP.balanceOf(distributorAddress)`
2. Check tokensPerInterval is set: `distributor.tokensPerInterval()`
3. Ensure users have staked tokens: `rewardTracker.balanceOf(userAddress)`
4. Verify reward tracker is properly connected to distributor

#### Issue: Rewards distributing too fast/slow
**Solution**: 
1. Adjust monthly amounts in the script
2. Re-run to update tokensPerInterval
3. Verify calculation: `monthlyAmount / (28 * 24 * 60 * 60) = tokensPerInterval`

#### Issue: Transaction fails with gas error
**Solution**:
1. Increase gas limit in the script
2. Check network congestion
3. Ensure sufficient ETH for gas

## Security Considerations

### Best Practices

1. **Admin Key Security**
   - Use hardware wallet for admin keys
   - Consider multisig for admin functions
   - Never share or expose private keys

2. **Distribution Management**
   - Set up monitoring alerts
   - Maintain buffer in distributors
   - Document all configuration changes

3. **Testing Protocol**
   - Always test on testnet first
   - Start with small amounts
   - Verify each step before proceeding

4. **Access Control**
   - Regularly audit admin permissions
   - Use time delays for critical changes
   - Implement emergency pause mechanisms

### Emergency Procedures

If issues arise:
1. Admin can update tokensPerInterval to 0 to pause distribution
2. Admin can withdraw mistakenly sent tokens from distributors
3. Keep emergency contact information updated

## Additional Resources

- [Amped Protocol Documentation](https://docs.amped.finance)
- [Smart Contract Repository](https://github.com/amped-finance/amped-smart-contracts)
- [Discord Support Channel](https://discord.gg/amped)

---

Last Updated: January 2025