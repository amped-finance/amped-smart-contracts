# AMPED Token Deployment and Integration Guide

## Overview

This guide covers the deployment and configuration of the AMPED token ecosystem, which includes:
- **AMPED Token**: ERC20 token with LayerZero OFT support and governance capabilities
- **AmpedSwapRouter**: Handles AMPED<->AMP token swaps
- **AmpedStakingRouter**: Enables users to stake AMPED (converts to AMP and stakes automatically)
- **AmpedRewardsRouter**: Converts AMP rewards back to AMPED for users

## Architecture

```
User -> AMPED Token -> AmpedStakingRouter -> SwapRouter -> AMP -> RewardRouterV2 -> Staking
                                                  ^
                                                  |
User <- AMPED Token <- AmpedRewardsRouter <- SwapRouter <- AMP <- Rewards (esAMP, WS fees)
```

## Pre-Deployment Checklist

1. **Network Configuration**
   - Ensure Sonic network (Chain ID: 146) is configured in hardhat.config.js
   - Have sufficient S tokens for gas fees
   - Access to deployment wallet
   - Frame wallet running and connected (for lz:oapp:wire command)

2. **Required Addresses**
   - LayerZero V2 Endpoint on Sonic: `0x1a44076050125825900e736c501f859c50fE728c`
   - Existing AMP token address (already deployed, will be bridged)
   - RewardRouterV2 address
   - All reward tracker addresses

3. **Environment Setup**
   ```bash
   export AMPED_TOKEN_ADDRESS=<deployed_amped_token_address>
   export AMP_TOKEN_ADDRESS=<existing_amp_token_address>
   ```

4. **Install LayerZero V2 Dependencies**
   ```bash
   npm install --legacy-peer-deps --save-dev @layerzerolabs/oft-evm @layerzerolabs/toolbox-hardhat @layerzerolabs/lz-definitions @layerzerolabs/lz-v2-utilities @layerzerolabs/metadata-tools
   ```

## Deployment Steps

### Step 1: Deploy AMPED Token (LayerZero V2)

```bash
npx hardhat run scripts/tokens/deployAmpedTokenV2.js --network sonic
```

This will:
- Deploy the AMPED token with 100 million initial supply
- Configure LayerZero V2 endpoint
- Set up initial voting delegation
- Output the deployed address

**Post-deployment:**
- Note the AMPED token address
- Verify contract on Sonic explorer:
  ```bash
  npx hardhat verify --network sonic <AMPED_ADDRESS> "0x1a44076050125825900e736c501f859c50fE728c" "<DEPLOYER_ADDRESS>"
  ```

### Step 2: Deploy Router Contracts

Set the token addresses:
```bash
export AMPED_TOKEN_ADDRESS=<amped_token_address_from_step_1>
export AMP_TOKEN_ADDRESS=<existing_amp_token_address>
```

Deploy routers:
```bash
npx hardhat run scripts/staking/deployAmpedRouters.js --network sonic
```

This will deploy and initialize:
- AmpedSwapRouter
- AmpedStakingRouter  
- AmpedRewardsRouter

### Step 3: Fund SwapRouter with Tokens

The SwapRouter needs liquidity for both tokens:

```javascript
// Bridge AMP tokens from source chain to Sonic
// Then fund the SwapRouter:

// 1. Transfer AMP tokens to SwapRouter
const ampAmount = ethers.utils.parseEther("1000000"); // 1M AMP
await ampToken.transfer(swapRouter.address, ampAmount);

// 2. Also transfer some AMPED tokens for reverse swaps
const ampedAmount = ethers.utils.parseEther("1000000"); // 1M AMPED
await ampedToken.transfer(swapRouter.address, ampedAmount);

// 3. Configure swap ratio (10000 = 1:1)
await swapRouter.setSwapRatio(10000);
```

### Step 4: Configure External DEX (Optional)

If using an external DEX for swaps:

```javascript
// Set external DEX router (e.g., SonicSwap)
await swapRouter.setExternalDex(dexRouterAddress, true);

// Configure swap paths
const ampedToAmpPath = [ampedToken.address, ampToken.address];
await swapRouter.setSwapPath(ampedToken.address, ampToken.address, ampedToAmpPath);
```

### Step 5: Set Permissions

Grant necessary permissions on the main protocol contracts:

```javascript
// Allow StakingRouter to stake on behalf of users
await rewardRouterV2.setHandler(ampedStakingRouter.address, true);

// If needed, grant minter role to SwapRouter for AMP tokens
// This depends on how AMP tokens are managed
```

### Step 6: Configure LayerZero V2 for Cross-Chain

After deploying AMPED contracts on multiple chains, configure cross-chain connections:

#### Step 1: Update layerzero.config.ts

Update the `layerzero.config.ts` file with your deployed contract addresses:

```typescript
import { EndpointId } from '@layerzerolabs/lz-definitions';

const sonicContract: OmniPointHardhat = {
  eid: 30278, // Sonic endpoint ID
  contractName: 'AmpedTokenV2',
  address: '<YOUR_SONIC_AMPED_ADDRESS>' // Add after deployment
};

const ethereumContract: OmniPointHardhat = {
  eid: 30101, // Ethereum endpoint ID
  contractName: 'AmpedTokenV2',
  address: '<YOUR_ETHEREUM_AMPED_ADDRESS>' // Add after deployment
};

// Add other chains as needed
```

#### Step 2: Wire the Contracts

Ensure Frame wallet is running and connected to all networks where you deployed contracts.

```bash
npx hardhat lz:oapp:wire --oapp-config layerzero.config.ts
```

This command will:
- Set up peer connections between all chains
- Configure DVNs (Decentralized Verifier Networks)
- Set gas limits and confirmations
- Verify all settings across chains

**Note**: The wire command will prompt you to sign transactions on each network.

#### Step 3: Verify Configuration

After wiring, verify the setup:

```bash
# Check peers are set correctly
npx hardhat lz:oapp:peers:get --oapp-config layerzero.config.ts

# Check enforced options
npx hardhat lz:oapp:enforced-opts:get --oapp-config layerzero.config.ts
```

**LayerZero V2 Endpoint IDs:**
- Ethereum Mainnet: 30101
- Sepolia: 40161
- Base Sepolia: 40245
- Sonic: 30278
- BSC: 30102
- Arbitrum: 30110

For a complete list of endpoint IDs, refer to the [LayerZero V2 documentation](https://docs.layerzero.network/v2/developers/evm/technical-reference/deployed-contracts).

## Usage Examples

### Staking AMPED

```javascript
// User approves AMPED
await ampedToken.approve(stakingRouter.address, stakeAmount);

// Stake AMPED (automatically converts to AMP and stakes)
await stakingRouter.stakeAmped(stakeAmount);
```

### Claiming Rewards as AMPED

```javascript
// Claim all rewards and convert to AMPED
await rewardsRouter.claimAllRewards(
    true,  // claim AMP
    true,  // claim esAMP
    true,  // claim WS fees
    true   // convert to AMPED
);
```

### Cross-Chain Transfer (LayerZero V2)

```javascript
// Prepare send parameters
const sendParam = {
    dstEid: 30278, // Destination endpoint ID (e.g., Sonic)
    to: ethers.utils.zeroPad(recipientAddress, 32), // Recipient address as bytes32
    amountLD: ethers.utils.parseEther("100"), // Amount in local decimals
    minAmountLD: ethers.utils.parseEther("100"), // Minimum amount to receive
    extraOptions: "0x", // Additional options (can be empty)
    composeMsg: "0x", // Compose message (can be empty)
    oftCmd: "0x" // OFT command (can be empty)
};

// Quote the cross-chain transfer fee
const [nativeFee, lzTokenFee] = await ampedToken.quoteSend(sendParam, false);
console.log("Native fee required:", ethers.utils.formatEther(nativeFee));

// Send tokens cross-chain
const tx = await ampedToken.send(
    sendParam,
    { nativeFee, lzTokenFee }, // Fee object
    senderAddress, // Refund address
    { value: nativeFee } // Send native fee with transaction
);

await tx.wait();
console.log("Cross-chain transfer sent:", tx.hash);
```

## Security Considerations

1. **Access Control**
   - Transfer ownership of all contracts to multisig
   - Review and limit handler permissions
   - Set up timelock for critical functions

2. **Swap Security**
   - Configure appropriate slippage limits
   - Monitor swap ratios and liquidity
   - Implement rate limiting if needed

3. **Cross-Chain Security**
   - Carefully verify trusted remote addresses
   - Test with small amounts first
   - Monitor bridge transactions

## Monitoring and Maintenance

1. **Regular Tasks**
   - Monitor swap liquidity levels
   - Adjust swap ratios based on market conditions
   - Update gas limits for cross-chain transfers
   - Monitor for unusual activity

2. **Emergency Procedures**
   - Pause token transfers if needed
   - Disable swap functionality
   - Emergency withdrawal functions

## Testing Checklist

- [ ] Deploy all contracts on testnet
- [ ] Test AMPED -> AMP swap and stake
- [ ] Test reward claiming and conversion to AMPED
- [ ] Test cross-chain transfers
- [ ] Test emergency functions
- [ ] Verify gas costs are reasonable
- [ ] Test with various amounts (small, large, edge cases)
- [ ] Test slippage protection
- [ ] Verify all events are emitted correctly

## Troubleshooting

### Common Issues

1. **"Insufficient output amount" error**
   - Check swap liquidity
   - Adjust minAmountOut setting
   - Verify swap ratio configuration

2. **"RewardRouter: forbidden" error**
   - Ensure router contracts are set as handlers
   - Check permissions on RewardRouterV2

3. **Cross-chain transfer fails**
   - Verify peer configuration using `lz:oapp:peers:get`
   - Check if contracts are properly wired
   - Ensure sufficient native token for fees
   - Verify destination chain is active

## Contract Addresses (To be filled after deployment)

- AMPED Token: `0x...`
- AmpedSwapRouter: `0x...`
- AmpedStakingRouter: `0x...`
- AmpedRewardsRouter: `0x...`