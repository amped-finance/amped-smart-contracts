# Fee Distribution Guide

## Overview

The `updateRewards.js` script manages the distribution of protocol fees (WETH/native tokens) to stakers. Unlike esAMP rewards which are governance tokens, this system distributes actual trading fees collected by the protocol to AMP and ALP stakers.

**Key Difference from esAMP Rewards:**
- **Fee Distribution**: Distributes WETH/native tokens from protocol fees
- **esAMP Distribution**: Distributes esAMP governance tokens as staking rewards

## Table of Contents

1. [How Fee Distribution Works](#how-fee-distribution-works)
2. [Prerequisites](#prerequisites)
3. [Key Contracts](#key-contracts)
4. [Configuration](#configuration)
5. [Step-by-Step Process](#step-by-step-process)
6. [Funding Process](#funding-process)
7. [Running the Script](#running-the-script)
8. [Verification](#verification)
9. [Monitoring](#monitoring)
10. [Troubleshooting](#troubleshooting)
11. [Network-Specific Details](#network-specific-details)

## How Fee Distribution Works

1. **Fee Collection**: Trading fees are collected in the Vault contract in various tokens
2. **Fee Conversion**: Fees are converted to WETH (or native token) through the fee collection process
3. **Distribution Setup**: Admin transfers WETH to reward distributors
4. **Rate Configuration**: `updateRewards.js` sets the distribution rate (tokens per second)
5. **User Claims**: Users claim accumulated fees through the RewardRouter

## Prerequisites

1. **Admin Access**: Must be admin of the reward distributors
2. **Frame Wallet**: Required for transaction signing
3. **WETH Balance**: Sufficient WETH to fund distributors
4. **Network Access**: Connected to target network
5. **Gas Tokens**: ETH for transaction fees

## Key Contracts

### Base Sepolia

| Contract | Address | Purpose |
|----------|---------|---------|
| WETH (Reward Token) | `0x4200000000000000000000000000000000000006` | Fee distribution token |
| RewardTrackerStakedBonusFeeGMX | `0x695eEF2bAC515Ae4dca16cbe3eC09162CB2b94DE` | Tracks AMP stakers for fees |
| RewardDistributorStakedBonusFeeGMX | `0x858582784429ED061607bD3EAEE4b5c4162f8D23` | Distributes WETH to AMP stakers |
| RewardTrackerFeeGLP | `0x11b6F82A6d7838A423ee623a477cefC8FF2D63EB` | Tracks ALP stakers for fees |
| RewardDistributorFeeGLP | `0xBb1Dda7f5053CD8d0984c9c3831FE14259bD3371` | Distributes WETH to ALP stakers |

### Sonic

| Contract | Address | Purpose |
|----------|---------|---------|
| WS (Reward Token) | `0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38` | Fee distribution token |
| RewardTrackerStakedBonusFeeGMX | `0x765d548229169E14b397c8c87FF7E8a64f36F469` | Tracks AMP stakers |
| RewardTrackerFeeGLP | `0xF3d911F81c4A630e755B42C90942e278019709A7` | Tracks ALP stakers |

## Configuration

### Weekly Distribution Amounts

Edit the transfer amounts in `updateRewards.js` for your network:

```javascript
// Base Sepolia Configuration
async function getBaseSepoliaValues(signer) {
  const rewardTrackerArr = [
    {
      name: "feeGmxTracker",
      address: "0x695eEF2bAC515Ae4dca16cbe3eC09162CB2b94DE",
      transferAmount: "0.001" // Weekly WETH for AMP stakers
    },
    {
      name: "feeGlpTracker", 
      address: "0x11b6F82A6d7838A423ee623a477cefC8FF2D63EB",
      transferAmount: "0.01" // Weekly WETH for ALP stakers
    }
  ]
  // ...
}
```

## Step-by-Step Process

### Step 1: Collect Protocol Fees

Before distributing fees, ensure fees have been collected from the Vault:

```javascript
// scripts/core/collectFees.js (example)
const vault = await contractAt("Vault", VAULT_ADDRESS);
const weth = await contractAt("Token", WETH_ADDRESS);

// Withdraw fees from vault
await vault.withdrawFees(weth.address, receiver);
```

### Step 2: Check Current Distribution Status

```bash
# Set network
export HARDHAT_NETWORK=basesepolia

# Create verification script
cat > scripts/staking/checkFeeDistribution.js << 'EOF'
const { contractAt } = require("../shared/helpers");
const { ethers } = require("hardhat");

async function main() {
    const weth = await contractAt("Token", "0x4200000000000000000000000000000000000006");
    
    const distributors = [
        {
            name: "AMP Stakers Fee Distributor",
            address: "0x858582784429ED061607bD3EAEE4b5c4162f8D23"
        },
        {
            name: "ALP Stakers Fee Distributor",
            address: "0xBb1Dda7f5053CD8d0984c9c3831FE14259bD3371"
        }
    ];
    
    console.log("=== Fee Distribution Status ===\n");
    
    for (const dist of distributors) {
        const balance = await weth.balanceOf(dist.address);
        const distributor = await contractAt("RewardDistributor", dist.address);
        const tokensPerInterval = await distributor.tokensPerInterval();
        
        console.log(`${dist.name}:`);
        console.log(`  Balance: ${ethers.utils.formatEther(balance)} WETH`);
        console.log(`  Tokens/Second: ${tokensPerInterval}`);
        console.log(`  WETH/Day: ${ethers.utils.formatEther(tokensPerInterval.mul(86400))}`);
        console.log(`  WETH/Week: ${ethers.utils.formatEther(tokensPerInterval.mul(604800))}`);
        
        if (balance.gt(0) && tokensPerInterval.gt(0)) {
            const daysRemaining = balance.div(tokensPerInterval).div(86400);
            console.log(`  Days Remaining: ${daysRemaining}`);
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
EOF

npx hardhat run scripts/staking/checkFeeDistribution.js --network basesepolia
```

### Step 3: Configure Distribution Amounts

Edit `scripts/staking/updateRewards.js`:

```javascript
// Find your network's configuration function
async function getBaseSepoliaValues(signer) {
  // ...
  const rewardTrackerArr = [
    {
      name: "feeGmxTracker",
      address: "0x695eEF2bAC515Ae4dca16cbe3eC09162CB2b94DE",
      transferAmount: "0.001" // Set weekly WETH amount for AMP stakers
    },
    {
      name: "feeGlpTracker", 
      address: "0x11b6F82A6d7838A423ee623a477cefC8FF2D63EB",
      transferAmount: "0.01" // Set weekly WETH amount for ALP stakers
    }
  ]
  // ...
}
```

### Step 4: Run the Update Script

The script will:
1. Transfer WETH to distributors (if transferAmount > 0)
2. Update the distribution rate

```bash
# Ensure Frame wallet is running
# Run the script
npx hardhat run scripts/staking/updateRewards.js --network basesepolia
```

## Funding Process

The `updateRewards.js` script handles funding automatically based on the `transferAmount` configured for each distributor. However, you can also fund manually:

### Manual Funding Option

```javascript
// scripts/staking/fundFeeDistributors.js
const { contractAt, sendTxn } = require("../shared/helpers");
const { ethers } = require("hardhat");

async function main() {
    const weth = await contractAt("Token", "0x4200000000000000000000000000000000000006");
    
    // Check your balance
    const signer = await ethers.getSigner();
    const balance = await weth.balanceOf(signer.address);
    console.log("Your WETH balance:", ethers.utils.formatEther(balance));
    
    // Fund distributors
    const distributions = [
        {
            name: "AMP Fee Distributor",
            address: "0x858582784429ED061607bD3EAEE4b5c4162f8D23",
            amount: ethers.utils.parseEther("0.1") // 0.1 WETH
        },
        {
            name: "ALP Fee Distributor",
            address: "0xBb1Dda7f5053CD8d0984c9c3831FE14259bD3371",
            amount: ethers.utils.parseEther("1.0") // 1.0 WETH
        }
    ];
    
    for (const dist of distributions) {
        await sendTxn(
            weth.transfer(dist.address, dist.amount),
            `Transfer ${ethers.utils.formatEther(dist.amount)} WETH to ${dist.name}`
        );
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
```

## Running the Script

### Complete Process Flow

1. **Ensure Frame is Running**
   ```bash
   # Frame must be running and unlocked
   ```

2. **Set Network**
   ```bash
   export HARDHAT_NETWORK=basesepolia
   ```

3. **Run Update Script**
   ```bash
   npx hardhat run scripts/staking/updateRewards.js --network basesepolia
   ```

### What Happens During Execution

1. **Initialization Check**: If distributor's `lastDistributionTime` is 0, it gets initialized
2. **Token Transfer**: WETH is transferred from signer to distributor (if amount > 0)
3. **Rate Update**: `tokensPerInterval` is updated based on weekly amount / (7 * 24 * 60 * 60)
4. **Confirmation**: Transaction hashes and results are displayed

## Verification

### Create Comprehensive Verification Script

```javascript
// scripts/staking/verifyFeeDistribution.js
const { contractAt } = require("../shared/helpers");
const { ethers } = require("hardhat");

async function main() {
    const weth = await contractAt("Token", "0x4200000000000000000000000000000000000006");
    const rewardRouter = await contractAt("RewardRouterV2", "0xB4dcD1F9AC7577b01B78e3253cB68a538B11aFAe");
    
    console.log("=== Fee Distribution System Verification ===\n");
    
    // Check distributors
    const configs = [
        {
            name: "AMP Stakers",
            tracker: "0x695eEF2bAC515Ae4dca16cbe3eC09162CB2b94DE",
            distributor: "0x858582784429ED061607bD3EAEE4b5c4162f8D23"
        },
        {
            name: "ALP Stakers",
            tracker: "0x11b6F82A6d7838A423ee623a477cefC8FF2D63EB",
            distributor: "0xBb1Dda7f5053CD8d0984c9c3831FE14259bD3371"
        }
    ];
    
    for (const config of configs) {
        console.log(`${config.name}:`);
        
        const tracker = await contractAt("RewardTracker", config.tracker);
        const distributor = await contractAt("RewardDistributor", config.distributor);
        
        // Basic info
        const balance = await weth.balanceOf(config.distributor);
        const tokensPerInterval = await distributor.tokensPerInterval();
        const lastDistTime = await distributor.lastDistributionTime();
        const totalSupply = await tracker.totalSupply();
        
        console.log(`  Tracker: ${config.tracker}`);
        console.log(`  Distributor: ${config.distributor}`);
        console.log(`  WETH Balance: ${ethers.utils.formatEther(balance)}`);
        console.log(`  Total Staked: ${ethers.utils.formatEther(totalSupply)}`);
        console.log(`  Distribution Rate: ${tokensPerInterval} wei/second`);
        console.log(`  Daily: ${ethers.utils.formatEther(tokensPerInterval.mul(86400))} WETH`);
        console.log(`  Weekly: ${ethers.utils.formatEther(tokensPerInterval.mul(604800))} WETH`);
        console.log(`  Last Distribution: ${new Date(lastDistTime * 1000).toLocaleString()}`);
        
        // Calculate runway
        if (balance.gt(0) && tokensPerInterval.gt(0)) {
            const secondsRemaining = balance.div(tokensPerInterval);
            const daysRemaining = secondsRemaining.div(86400);
            console.log(`  Days of Fees Remaining: ${daysRemaining}`);
        }
        
        // Check if properly connected
        const trackerDistributor = await tracker.distributor();
        console.log(`  Properly Connected: ${trackerDistributor.toLowerCase() === config.distributor.toLowerCase() ? "✅" : "❌"}`);
        
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

## Monitoring

### Automated Monitoring Script

```javascript
// scripts/staking/monitorFeeDistribution.js
const { contractAt } = require("../shared/helpers");
const { ethers } = require("hardhat");
const { WebClient } = require('@slack/web-api'); // Optional: for alerts

const CRITICAL_DAYS = 3;
const WARNING_DAYS = 7;

async function main() {
    const weth = await contractAt("Token", "0x4200000000000000000000000000000000000006");
    
    const distributors = [
        {
            name: "AMP Fee Distributor",
            address: "0x858582784429ED061607bD3EAEE4b5c4162f8D23",
            minBalance: ethers.utils.parseEther("0.01") // Minimum 0.01 WETH
        },
        {
            name: "ALP Fee Distributor",
            address: "0xBb1Dda7f5053CD8d0984c9c3831FE14259bD3371",
            minBalance: ethers.utils.parseEther("0.1") // Minimum 0.1 WETH
        }
    ];
    
    const alerts = [];
    
    for (const dist of distributors) {
        const balance = await weth.balanceOf(dist.address);
        const distributor = await contractAt("RewardDistributor", dist.address);
        const tokensPerInterval = await distributor.tokensPerInterval();
        
        // Check balance
        if (balance.lt(dist.minBalance)) {
            alerts.push({
                level: "CRITICAL",
                message: `${dist.name} balance is below minimum: ${ethers.utils.formatEther(balance)} WETH`
            });
        }
        
        // Check runway
        if (tokensPerInterval.gt(0) && balance.gt(0)) {
            const daysRemaining = balance.div(tokensPerInterval).div(86400);
            
            if (daysRemaining.lte(CRITICAL_DAYS)) {
                alerts.push({
                    level: "CRITICAL",
                    message: `${dist.name} has only ${daysRemaining} days of fees remaining!`
                });
            } else if (daysRemaining.lte(WARNING_DAYS)) {
                alerts.push({
                    level: "WARNING",
                    message: `${dist.name} has ${daysRemaining} days of fees remaining`
                });
            }
        }
    }
    
    // Output results
    if (alerts.length > 0) {
        console.log("⚠️  ALERTS DETECTED:\n");
        alerts.forEach(alert => {
            console.log(`[${alert.level}] ${alert.message}`);
        });
        
        // Optional: Send alerts (email, Slack, etc.)
        // await sendAlerts(alerts);
    } else {
        console.log("✅ All fee distributors are healthy");
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
```

### Setting Up Cron Job

```bash
# Add to crontab for daily monitoring
0 9 * * * cd /path/to/project && npx hardhat run scripts/staking/monitorFeeDistribution.js --network basesepolia >> /var/log/fee-distribution.log 2>&1
```

## Troubleshooting

### Common Issues

#### Issue: "RewardDistributor: invalid lastDistributionTime"
**Solution**: The distributor hasn't been initialized. The updateRewards script handles this automatically.

#### Issue: "RewardDistributor: forbidden"
**Solution**: Ensure your signer address is the admin of the distributor contract.

#### Issue: Insufficient WETH Balance
**Solution**: 
1. Check your WETH balance
2. Wrap ETH if needed: `weth.deposit({value: ethers.utils.parseEther("1.0")})`
3. Or collect fees from the vault first

#### Issue: Users Not Receiving Fees
**Checklist**:
1. Verify distributor has WETH balance
2. Check tokensPerInterval is set correctly
3. Ensure users have staked tokens
4. Verify reward tracker is connected to distributor
5. Check that users are claiming through RewardRouter

## Network-Specific Details

### Base Sepolia
- Uses WETH as fee token
- Lower transfer amounts for testnet
- Gas prices typically lower than mainnet

### Sonic
- Uses WS (Wrapped Sonic) as fee token
- High weekly distribution (37,800 WS for ALP stakers)
- Custom gas settings may be required

### Base Mainnet
- Uses WETH as fee token
- Production amounts based on actual fee collection
- Monitor gas prices for optimal execution

## Best Practices

1. **Regular Monitoring**
   - Check distributor balances daily
   - Set up automated alerts
   - Track fee collection vs distribution rates

2. **Funding Strategy**
   - Maintain 2-4 weeks of buffer
   - Fund before running empty
   - Consider auto-funding mechanisms

3. **Rate Adjustments**
   - Review distribution rates weekly
   - Adjust based on fee collection
   - Consider staker participation

4. **Security**
   - Use multisig for admin functions
   - Secure Frame wallet properly
   - Audit distribution amounts before execution

## Integration with Fee Collection

### Complete Fee Flow

1. **Trading Fees Generated** → Collected in Vault
2. **Fee Collection** → Admin withdraws fees as WETH
3. **Distribution Setup** → Admin funds distributors with WETH
4. **Rate Configuration** → updateRewards.js sets distribution rate
5. **User Claims** → Stakers claim through RewardRouter

### Fee Collection Script Example

```javascript
// scripts/core/collectAndDistributeFees.js
const { contractAt, sendTxn } = require("../shared/helpers");

async function main() {
    const vault = await contractAt("Vault", VAULT_ADDRESS);
    const weth = await contractAt("Token", WETH_ADDRESS);
    const signer = await ethers.getSigner();
    
    // Collect fees from vault
    const feeAmount = await vault.feeReserves(weth.address);
    console.log("Fees available:", ethers.utils.formatEther(feeAmount));
    
    if (feeAmount.gt(0)) {
        await sendTxn(
            vault.withdrawFees(weth.address, signer.address, feeAmount),
            "Withdraw fees from vault"
        );
        
        // Now run updateRewards.js to distribute
        console.log("Fees collected. Run updateRewards.js to distribute.");
    }
}
```

---

Last Updated: January 2025