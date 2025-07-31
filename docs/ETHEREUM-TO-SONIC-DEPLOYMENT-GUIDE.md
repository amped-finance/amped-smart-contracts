# AMPED Token: Ethereum to Sonic Cross-Chain Deployment Guide (LayerZero V2)

This guide covers deploying AMPED token on Ethereum mainnet first, then establishing it on Sonic via LayerZero V2 OFT bridge.

## Overview

1. Deploy AMPED token on Ethereum with full governance features
2. Deploy OFT representation on Sonic (no initial supply)
3. Configure LayerZero V2 cross-chain connections using `lz:oapp:wire`
4. Bridge initial liquidity from Ethereum to Sonic
5. Deploy and configure router contracts on Sonic

## Prerequisites

- Ethereum mainnet deployment wallet with ETH
- Sonic network deployment wallet with S tokens
- Frame wallet configured for both networks
- LayerZero V2 dependencies installed:
  ```bash
  npm install --legacy-peer-deps --save-dev @layerzerolabs/oft-evm @layerzerolabs/toolbox-hardhat @layerzerolabs/lz-definitions @layerzerolabs/lz-v2-utilities @layerzerolabs/metadata-tools
  ```

## Part 1: Ethereum Deployment

### Step 1: Deploy AMPED Token on Ethereum

```bash
# Deploy AMPED token V2
npx hardhat run scripts/tokens/deployAmpedTokenV2.js --network ethereum
```

This deploys:
- AMPED token with 100 million supply
- ERC20Votes for governance
- LayerZero V2 OFT support
- Initial voting delegation setup

**Save the deployed address**: `ETHEREUM_AMPED_ADDRESS`

### Step 2: Verify on Etherscan

```bash
npx hardhat verify --network ethereum <ETHEREUM_AMPED_ADDRESS> "0x1a44076050125825900e736c501f859c50fE728c" "<DEPLOYER_ADDRESS>"
```

## Part 2: Sonic OFT Deployment

### Step 1: Deploy OFT on Sonic

Deploy the OFT representation on Sonic:

```bash
# Deploy OFT V2 representation on Sonic (no initial mint)
npx hardhat run scripts/tokens/deployAmpedOFTV2.js --network sonic
```

**Note**: This uses the `AmpedOFTV2` contract which is specifically designed for remote chains. Unlike the main `AmpedTokenV2` contract, it does NOT mint any initial supply. All tokens on Sonic must be bridged from Ethereum.

**Save the deployed address**: `SONIC_AMPED_ADDRESS`

### Step 2: Verify on Sonicscan

```bash
npx hardhat verify --network sonic <SONIC_AMPED_ADDRESS> "0x1a44076050125825900e736c501f859c50fE728c" "<DEPLOYER_ADDRESS>"
```

## Part 3: Configure LayerZero V2 Cross-Chain Connection

Now that both contracts are deployed, configure the cross-chain connection using LayerZero V2.

### Step 1: Update layerzero.config.ts

Create or update `layerzero.config.ts` in your project root:

```typescript
import { EndpointId } from '@layerzerolabs/lz-definitions';
import { ExecutorOptionType } from '@layerzerolabs/lz-v2-utilities';
import { TwoWayConfig, generateConnectionsConfig } from '@layerzerolabs/metadata-tools';
import { OAppEnforcedOption, OmniPointHardhat } from '@layerzerolabs/toolbox-hardhat';

const ethereumContract: OmniPointHardhat = {
  eid: EndpointId.ETHEREUM_V2_MAINNET, // 30101
  contractName: 'AmpedTokenV2',
  address: '<ETHEREUM_AMPED_ADDRESS>' // Replace with your deployed address
};

const sonicContract: OmniPointHardhat = {
  eid: 30278, // Sonic endpoint ID
  contractName: 'AmpedOFTV2',
  address: '<SONIC_AMPED_ADDRESS>' // Replace with your deployed address
};

const EVM_ENFORCED_OPTIONS: OAppEnforcedOption[] = [
  {
    msgType: 1,
    optionType: ExecutorOptionType.LZ_RECEIVE,
    gas: 200000,
    value: 0,
  },
];

const pathways: TwoWayConfig[] = [
  [
    ethereumContract,
    sonicContract,
    [['LayerZero Labs'], []], // DVN configuration
    [1, 1], // Confirmations
    [EVM_ENFORCED_OPTIONS, EVM_ENFORCED_OPTIONS],
  ],
];

export default async function () {
  const connections = await generateConnectionsConfig(pathways);
  return {
    contracts: [
      { contract: ethereumContract },
      { contract: sonicContract },
    ],
    connections,
  };
}
```

### Step 2: Wire the Contracts

Ensure Frame wallet is running and connected to both Ethereum and Sonic networks.

```bash
npx hardhat lz:oapp:wire --oapp-config layerzero.config.ts
```

This command will:
- Set up peer connections between Ethereum and Sonic
- Configure DVNs (Decentralized Verifier Networks)
- Set gas limits and confirmations
- Execute all necessary transactions on both chains

**Note**: You'll need to sign transactions on both networks during this process.

### Step 3: Verify Configuration

```bash
# Check peers are set correctly
npx hardhat lz:oapp:peers:get --oapp-config layerzero.config.ts

# Check enforced options
npx hardhat lz:oapp:enforced-opts:get --oapp-config layerzero.config.ts
```

## Part 4: Bridge Initial Liquidity

### Step 1: Prepare Bridge Transaction

Using ethers.js or Frame:

```javascript
// Connect to AMPED token on Ethereum
const ampedToken = await ethers.getContractAt("AmpedTokenV2", ETHEREUM_AMPED_ADDRESS);

// Prepare send parameters
const sendParam = {
    dstEid: 30278, // Sonic endpoint ID
    to: ethers.utils.zeroPad(YOUR_SONIC_ADDRESS, 32), // Your address on Sonic
    amountLD: ethers.utils.parseEther("1000000"), // 1M tokens
    minAmountLD: ethers.utils.parseEther("1000000"), // Min amount to receive
    extraOptions: "0x", // Additional options
    composeMsg: "0x", // Compose message
    oftCmd: "0x" // OFT command
};

// Quote the fee
const [nativeFee, lzTokenFee] = await ampedToken.quoteSend(sendParam, false);
console.log("Bridge fee:", ethers.utils.formatEther(nativeFee), "ETH");
```

### Step 2: Execute Bridge Transaction

```javascript
// Send tokens to Sonic
const tx = await ampedToken.send(
    sendParam,
    { nativeFee, lzTokenFee },
    YOUR_ADDRESS, // Refund address
    { value: nativeFee } // Send ETH for fee
);

await tx.wait();
console.log("Bridge transaction:", tx.hash);
```

### Step 3: Monitor Bridge Progress

- Check transaction on Ethereum: `https://etherscan.io/tx/{tx_hash}`
- Monitor LayerZero Scan: `https://layerzeroscan.com/tx/{tx_hash}`
- Verify receipt on Sonic: Check balance on Sonicscan
```

Wait for confirmation on both chains (~10-15 minutes).

## Part 5: Deploy Sonic Infrastructure

### Step 1: Deploy Router Contracts

```bash
# Set addresses
export AMPED_TOKEN_ADDRESS=<SONIC_AMPED_ADDRESS>
export AMP_TOKEN_ADDRESS=<existing_AMP_address>

# Deploy routers
npx hardhat run scripts/staking/deployAmpedRouters.js --network sonic
```

### Step 2: Bridge Additional Tokens

1. **Bridge more AMPED** for SwapRouter liquidity
2. **Bridge AMP tokens** (if they exist on Ethereum) or acquire on Sonic

### Step 3: Configure System

Follow the existing `MANUAL-CONFIGURATION-GUIDE.md` for:
- Setting handler permissions
- Registering tokens
- Funding SwapRouter
- Configuring ratios

## Governance Considerations

### Snapshot Configuration

Create a Snapshot space with multi-chain strategy:

```json
{
  "name": "AMPED Finance",
  "network": "1",
  "strategies": [
    {
      "name": "erc20-balance-of",
      "params": {
        "address": "<ETHEREUM_AMPED_ADDRESS>",
        "decimals": 18
      },
      "network": "1"
    },
    {
      "name": "erc20-balance-of", 
      "params": {
        "address": "<SONIC_AMPED_ADDRESS>",
        "decimals": 18
      },
      "network": "146"
    }
  ]
}
```

This allows voting with AMPED tokens on both chains without bridging.

## Important LayerZero V2 Endpoint IDs

- Ethereum Mainnet: 30101
- Sonic Mainnet: 30278

## Verification Checklist

### LayerZero V2 Configuration Verification:
1. **Check Peers** (Read functions on both chains):
   ```
   Function: peers
   Parameter: eid (30278 for Sonic, 30101 for Ethereum)
   Should return: The peer address (as bytes32)
   ```

2. **Check Enforced Options**:
   ```bash
   npx hardhat lz:oapp:enforced-opts:get --oapp-config layerzero.config.ts
   ```

3. **Test Small Transfer**:
   - Send 1 AMPED from Ethereum to Sonic
   - Monitor on LayerZero Scan: https://layerzeroscan.com/
   - Verify arrival on Sonic

### Ethereum:
- [ ] AMPED token V2 deployed with correct supply
- [ ] Peer set for Sonic using lz:oapp:wire
- [ ] DVNs and executors configured
- [ ] Initial bridge transaction successful

### Sonic:
- [ ] OFT V2 representation deployed (no initial mint)
- [ ] Peer set for Ethereum using lz:oapp:wire
- [ ] DVNs and executors configured
- [ ] Tokens received from bridge
- [ ] Router contracts deployed
- [ ] System configured per manual guide

## Troubleshooting

### Bridge Issues:
- "LayerZero: insufficient fee" - Increase ETH sent with transaction
- "NoPeer" - Run lz:oapp:wire to set up peers
- Transaction stuck - Check LayerZero Scan for status

### Configuration Issues:
- Run `lz:oapp:peers:get` to verify peer setup
- Ensure both chains are properly wired
- Check endpoint IDs are correct (30101 for Ethereum, 30278 for Sonic)

## Cost Estimates

- Ethereum deployment: ~0.05-0.1 ETH
- Sonic deployment: ~10-20 S
- Bridge transaction: ~0.01-0.02 ETH per transfer
- Configuration transactions: Minimal on both chains