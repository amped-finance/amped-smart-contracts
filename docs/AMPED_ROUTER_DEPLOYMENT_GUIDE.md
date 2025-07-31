# AMPED Router Deployment Guide

This guide provides detailed instructions for deploying the AMPED token swap and staking routers on multiple networks including Base Sepolia and Sonic.

## Overview

The AMPED router system consists of three main contracts:

1. **AmpedSwapRouter**: Handles swaps between AMPED and AMP tokens
2. **AmpedStakingRouter**: Manages staking of AMPED tokens (converts to AMP and stakes)
3. **AmpedRewardsRouter**: Handles reward claims and distributions

## Prerequisites

### Required Addresses

#### Base Sepolia
- **AMPED Token**: `0xAFf9B4Daa4dC69D0a40A6bF4955AD2A5F6Bec05C`
- **AMP Token**: `0xd1Af6E098F7ee3282578862C3285F754D0128a6f`

#### Sonic
- **AMPED Token**: To be deployed (see token deployment guide)
- **AMP Token**: `0xAc611438AE5F3953DeDB47c2ea8d6650D601C1B4` (GMX token on Sonic)
- **Wrapped Sonic (WS)**: `0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38` (Native wrapped token, not WETH)

### Required Tools

- Node.js (v14 or higher)
- Hardhat configured for your target network
- Access to a funded deployer wallet
- Native tokens for gas fees (Base Sepolia ETH or Sonic S tokens)

## Step 1: Environment Setup

1. Clone the repository and install dependencies:
```bash
cd amped-smart-contracts
npm install
```

2. Configure your `.env` file:

For Base Sepolia:
```env
BASESEPOLIA_RPC_URL=https://sepolia.base.org
PRIVATE_KEY=your_deployer_private_key
ETHERSCAN_API_KEY=your_basescan_api_key
```

For Sonic:
```env
SONIC_RPC=https://rpc.soniclabs.com
SONIC_DEPLOY_KEY=your_deployer_private_key
SONIC_API_KEY=your_sonicscan_api_key
```

3. Ensure your deployer wallet has sufficient native tokens for deployment:
   - Base Sepolia: approximately 0.1 ETH
   - Sonic: approximately 10 S tokens

## Step 2: Deploy Router Contracts

### For Base Sepolia:
```bash
npx hardhat run scripts/staking/deployAmpedRoutersBaseSepolia.js --network basesepolia
```

### For Sonic:
```bash
# First, ensure AMPED token is deployed and set the address
export AMPED_TOKEN_ADDRESS=0x... # Your deployed AMPED token address
export AMP_TOKEN_ADDRESS=0xAc611438AE5F3953DeDB47c2ea8d6650D601C1B4 # GMX token on Sonic

npx hardhat run scripts/staking/deployAmpedRouters.js --network sonic
```

This will deploy and initialize:
- AmpedSwapRouter
- AmpedStakingRouter  
- AmpedRewardsRouter

The script will output the deployed contract addresses and save a deployment log.

## Step 3: Post-Deployment Configuration

After deployment, you MUST complete these configuration steps for the system to function:

### 3.1 Fund the Swap Router

The SwapRouter needs AMP tokens to facilitate AMPED -> AMP swaps:

```javascript
// Connect to deployed contracts
const ampToken = await ethers.getContractAt("IERC20", "0xd1Af6E098F7ee3282578862C3285F754D0128a6f");
const swapRouter = await ethers.getContractAt("AmpedSwapRouter", "DEPLOYED_SWAP_ROUTER_ADDRESS");

// Fund with AMP tokens (example: 10,000 AMP)
const amount = ethers.utils.parseEther("10000");
await ampToken.approve(swapRouter.address, amount);
await swapRouter.depositTokens(ampToken.address, amount);
```

### 3.2 Configure Reward Tracker Permissions

The StakingRouter needs handler permissions on the reward trackers for both staking and unstaking.

**This step is now AUTOMATED in the deployment scripts (`deployAmpedRouters.js` and `deployAmpedRoutersBaseSepolia.js`).** The scripts will automatically set the deployed `AmpedStakingRouter` as a handler on the required reward trackers.

You only need to perform the following steps manually if you did not use the deployment script or if the automatic configuration failed.

#### Base Sepolia:
```javascript
// Get reward tracker contracts
const stakedGmxTracker = await ethers.getContractAt("RewardTracker", "0xD7bD53F40F33721B05C8192B365952151af24e4C");
const bonusGmxTracker = await ethers.getContractAt("RewardTracker", "0x3A2144E63bF7d7cAF0Dc72384f8b35dC721EAB23");
const feeGmxTracker = await ethers.getContractAt("RewardTracker", "0x695eEF2bAC515Ae4dca16cbe3eC09162CB2b94DE");
```

#### Sonic:
```javascript
// Get reward tracker contracts from sonic deployment
const stakedGmxTracker = await ethers.getContractAt("RewardTracker", "0xCe0a0e2BbA0F2168DD614b1414CfE707c13aa081");
const bonusGmxTracker = await ethers.getContractAt("RewardTracker", "0x2E2367F1EB40bFB1553E7503C8011D151286a5d3");
const feeGmxTracker = await ethers.getContractAt("RewardTracker", "0x765d548229169E14b397c8c87FF7E8a64f36F469");

// Set StakingRouter as handler on all trackers (AUTOMATED IN DEPLOYMENT SCRIPT)
// await stakedGmxTracker.setHandler("DEPLOYED_STAKING_ROUTER_ADDRESS", true);
// await bonusGmxTracker.setHandler("DEPLOYED_STAKING_ROUTER_ADDRESS", true);
// await feeGmxTracker.setHandler("DEPLOYED_STAKING_ROUTER_ADDRESS", true);

// IMPORTANT: You must still manually disable private modes to allow unstaking through handlers
await stakedGmxTracker.setInPrivateStakingMode(false);
await bonusGmxTracker.setInPrivateStakingMode(false);
await feeGmxTracker.setInPrivateStakingMode(false);

// Allow unstaking through handlers
await stakedGmxTracker.setInPrivateClaimingMode(false);
await bonusGmxTracker.setInPrivateClaimingMode(false);
await feeGmxTracker.setInPrivateClaimingMode(false);
```

### 3.3 Register AMP as Deposit Token

If not already done, register AMP token on the staked tracker:

#### Base Sepolia:
```javascript
await stakedGmxTracker.setDepositToken("0xd1Af6E098F7ee3282578862C3285F754D0128a6f", true);
```

#### Sonic:
```javascript
await stakedGmxTracker.setDepositToken("0xAc611438AE5F3953DeDB47c2ea8d6650D601C1B4", true);
```

### 3.4 Configure Swap Ratio

Set the AMPED to AMP conversion ratio (10000 = 1:1):

```javascript
await swapRouter.setSwapRatio(10000); // 1:1 ratio
```

## Step 4: Contract Verification

The deployment script automatically attempts to verify contracts. If automatic verification fails, you have two options:

### Option A: Use the Standalone Verification Script

For Base Sepolia:
```bash
# Set the deployed contract addresses
export AMPED_SWAP_ROUTER=0x... # Your deployed swap router address
export AMPED_STAKING_ROUTER=0x... # Your deployed staking router address
export AMPED_REWARDS_ROUTER=0x... # Your deployed rewards router address

# Run the verification script
npx hardhat run scripts/staking/verifyAmpedRoutersBaseSepolia.js --network basesepolia
```

For Sonic:
```bash
# Contract verification on Sonic uses the standard hardhat verify command
# The deployment script will attempt automatic verification
```

### Option B: Manual Verification

```bash
# Replace 'network' with basesepolia or sonic
# Verify AmpedSwapRouter
npx hardhat verify --network [network] DEPLOYED_SWAP_ROUTER_ADDRESS

# Verify AmpedStakingRouter  
npx hardhat verify --network [network] DEPLOYED_STAKING_ROUTER_ADDRESS

# Verify AmpedRewardsRouter
npx hardhat verify --network [network] DEPLOYED_REWARDS_ROUTER_ADDRESS
```

### Verification Troubleshooting

If verification fails:
1. Ensure the correct API key is set in your `.env` file:
   - Base Sepolia: `ETHERSCAN_API_KEY`
   - Sonic: `SONIC_API_KEY`
2. Wait 1-2 minutes after deployment before verifying
3. Check if contracts are already verified on the respective block explorer:
   - Base Sepolia: https://sepolia.basescan.org
   - Sonic: https://sonicscan.org
4. For Base Sepolia, make sure you're using the correct API endpoint
5. For Sonic, ensure the explorer API is available and functioning

## Step 5: Testing

Before enabling for users, test all flows with small amounts:

### Test AMPED -> AMP Swap
```javascript
// Approve AMPED tokens
await ampedToken.approve(swapRouter.address, testAmount);

// Perform swap
await swapRouter.swap(ampedToken.address, ampToken.address, testAmount);
```

### Test AMPED Staking
```javascript
// Approve AMPED tokens
await ampedToken.approve(stakingRouter.address, testAmount);

// Stake AMPED (will convert to AMP and stake)
await stakingRouter.stakeAmped(testAmount);
```

### Test AMPED Unstaking
```javascript
// Unstake and receive AMPED back
// Note: This will unstake AMP and convert back to AMPED
await stakingRouter.unstakeAmped(testAmount);
```

### Test Reward Claims
```javascript
// Claim rewards through RewardsRouter
await rewardsRouter.claimRewards();
```

## Security Considerations

1. **Initial Configuration**: Ensure all handler permissions are set correctly before funding contracts
2. **Liquidity Management**: Monitor AMP token balance in SwapRouter to ensure sufficient liquidity
3. **Access Control**: Transfer ownership of routers to a multisig wallet after deployment
4. **Swap Ratio**: The swap ratio can be adjusted by governance - ensure proper controls
5. **Testing**: Thoroughly test all functions on testnet before mainnet deployment

## Contract Architecture

### AmpedSwapRouter
- Handles AMPED <-> AMP token swaps
- Configurable swap ratio (default 1:1)
- Can integrate with external DEX if needed
- Requires AMP token liquidity to function

### AmpedStakingRouter
- Accepts AMPED tokens from users for staking
- Swaps AMPED to AMP via SwapRouter
- Stakes AMP tokens through the reward tracker system
- Handles the three-tier staking process (staked, bonus, fee trackers)
- Unstakes AMP tokens and converts back to AMPED for users
- Provides convenient one-transaction staking and unstaking

### AmpedRewardsRouter
- Manages reward claims for AMPED stakers
- Handles conversion of rewards if needed
- Integrates with vesting contracts

## Troubleshooting

### Common Issues

1. **"insufficient AMP balance"**: SwapRouter needs more AMP tokens
2. **"forbidden"**: Handler permissions not set on reward trackers
3. **"invalid deposit token"**: AMP token not registered on reward tracker
4. **"slippage exceeded"**: Adjust minAmountOut in StakingRouter

### Support

For issues or questions:
- Check contract events for detailed error information
- Verify all permissions and balances
- Ensure proper initialization of all contracts

## Network-Specific Considerations

### Sonic Network
1. **Gas Optimization**: Sonic has extremely low gas fees, allowing for more frequent operations
2. **Block Time**: Sonic has faster block times (~1 second), enabling quicker transaction confirmations
3. **Native Token**: Uses S (Sonic) tokens instead of ETH for gas
4. **Bridge Requirements**: AMPED tokens may need to be bridged to Sonic using LayerZero or other cross-chain protocols
5. **Reward Tracker Addresses**: Use the Sonic-specific reward tracker addresses from the deployment file
6. **Explorer**: Verify contracts on https://sonicscan.org

### Base Sepolia
1. **Testnet Environment**: This is a test network, ensure adequate test ETH
2. **Faucets**: Use Base Sepolia faucets for test ETH
3. **Explorer**: Verify contracts on https://sepolia.basescan.org

## Maintenance

Regular maintenance tasks:
- Monitor AMP token balance in SwapRouter
- Check for pending rewards distributions
- Review and adjust swap ratios if needed
- Monitor gas costs and optimize if necessary
- For Sonic: Monitor bridge liquidity if using cross-chain AMPED tokens