# yALP Deployment Guide for Base Network

This guide walks you through deploying the Yield Bearing ALP Vault (yALP) to the Base network.

## Prerequisites

1. **Node.js and npm** installed
2. **Hardhat** configured with Base network
3. **Private key** with ETH for deployment
4. **Base RPC URL** (e.g., Alchemy, Infura, or public RPC)
5. **Existing Amped Protocol** deployed on Base (using addresses from Base Sepolia)

## Step 1: Environment Setup

### 1.1 Update `env.json`

Add Base network configuration to your `env.json`:

```json
{
  "BASE_RPC": "https://mainnet.base.org",
  "BASE_DEPLOY_KEY": "your-private-key-here",
  "BASE_API_KEY": "your-basescan-api-key"
}
```

### 1.2 Verify Hardhat Configuration

Ensure your `hardhat.config.js` includes Base network:

```javascript
base: {
  url: BASE_RPC,
  chainId: 8453,
  accounts: [BASE_DEPLOY_KEY]
}
```

## Step 2: Contract Addresses

The deployment script uses these addresses from Base Sepolia (update if different on mainnet):

- **RewardRouter**: `0xB4dcD1F9AC7577b01B78e3253cB68a538B11aFAe`
- **fsALP**: `0x38A19A6078d7Dd180b136b31120687931e488b2B`
- **GlpManager**: `0xAA1eBd1F27A615A9e4CeE37881d4C7Cacc44858E`
- **WETH**: `0x4200000000000000000000000000000000000006` (Base native WETH)
- **esAMP**: `0xe5AF4c03F23af85AC6732F2dE3afAed3dD712080`

## Step 3: Deploy yALP Vault

### 3.1 Run Deployment Script

```bash
npx hardhat run scripts/staking/deployYALPVault-base.js --network base
```

### 3.2 Expected Output

```
=== Deploying YieldBearingALPVault for Base ===
✅ YieldBearingALPVault deployed to: 0x[VAULT_ADDRESS]
📁 Deployment info saved to: ./scripts/staking/yalp-vault-deployment-base-[TIMESTAMP].json
```

### 3.3 Verify Contract

```bash
npx hardhat verify --network base [VAULT_ADDRESS] "0xB4dcD1F9AC7577b01B78e3253cB68a538B11aFAe" "0x38A19A6078d7Dd180b136b31120687931e488b2B" "0xAA1eBd1F27A615A9e4CeE37881d4C7Cacc44858E" "0x4200000000000000000000000000000000000006" "0xe5AF4c03F23af85AC6732F2dE3afAed3dD712080"
```

## Step 4: Configure Keeper Bot

### 4.1 Update Keeper Configuration

Edit `yalp-keeper-bot/ecosystem-base.config.js`:

```javascript
env: {
  YALP_VAULT_ADDRESS: '[DEPLOYED_VAULT_ADDRESS]',
  KEEPER_PRIVATE_KEY: '[KEEPER_PRIVATE_KEY]',
  RPC_URL: 'https://mainnet.base.org',
  // ... other settings
}
```

### 4.2 Set Keeper Permissions

The vault deployer is initially set as both `gov` and `keeper`. To set a different keeper:

```javascript
// Using ethers.js
const vault = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, signer);
await vault.setKeeper(KEEPER_ADDRESS);
```

### 4.3 Start Keeper Bot

```bash
cd yalp-keeper-bot
pm2 start ecosystem-base.config.js
```

## Step 5: Testing

### 5.1 Test Deposit

```javascript
// Deposit ETH
const vault = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, signer);
const tx = await vault.depositS(0, 0, { value: ethers.utils.parseEther("0.01") });
await tx.wait();
```

### 5.2 Check Vault Stats

```javascript
const totalAssets = await vault.totalAssets();
const totalSupply = await vault.totalSupply();
const userBalance = await vault.balanceOf(userAddress);

console.log("Total Assets:", ethers.utils.formatEther(totalAssets));
console.log("Total Supply:", ethers.utils.formatEther(totalSupply));
console.log("User yALP Balance:", ethers.utils.formatEther(userBalance));
```

## Step 6: Monitoring

### 6.1 Check Keeper Bot Logs

```bash
pm2 logs yalp-keeper-bot-base
```

### 6.2 Monitor Vault Performance

- Track total assets growth
- Monitor compound frequency
- Check WETH rewards accumulation
- Verify exchange rate improvements

## Contract Features

### User Functions

- `depositS(uint256 minUsdg, uint256 minGlp)` - Deposit ETH
- `deposit(address token, uint256 amount, uint256 minUsdg, uint256 minGlp, address receiver)` - Deposit tokens
- `withdrawS(uint256 shares, uint256 minOut, address receiver)` - Withdraw to ETH
- `withdraw(uint256 shares, address tokenOut, uint256 minOut, address receiver)` - Withdraw to tokens

### Keeper Functions

- `compound()` - Compound WETH rewards into more ALP

### View Functions

- `totalAssets()` - Total fsALP held by vault
- `totalSupply()` - Total yALP tokens issued
- `convertToShares(uint256 assets)` - Convert fsALP to yALP
- `convertToAssets(uint256 shares)` - Convert yALP to fsALP

## Key Differences from Sonic

1. **Native Token**: Uses WETH instead of WS (Wrapped Sonic)
2. **Network**: Base (Chain ID 8453) instead of Sonic (Chain ID 146)
3. **Explorer**: BaseScan instead of SonicScan
4. **Token Symbol**: `yALP.base` instead of `yALP.s`

## Troubleshooting

### Common Issues

1. **Insufficient Gas**: Increase gas limit for complex operations
2. **Slippage**: Use appropriate `minUsdg` and `minGlp` values
3. **Cooldown**: Users must wait for GLP cooldown period before withdrawing
4. **Keeper Permissions**: Ensure keeper address is set correctly

### Debug Commands

```bash
# Check network connection
npx hardhat run --network base scripts/test/checkNetwork.js

# Verify contract addresses
npx hardhat run --network base scripts/test/verifyAddresses.js

# Test vault functions
npx hardhat run --network base scripts/test/testVault.js
```

## Security Considerations

1. **Private Keys**: Store securely, never commit to version control
2. **Keeper Bot**: Run on secure infrastructure with monitoring
3. **Contract Verification**: Always verify contracts on BaseScan
4. **Testing**: Test thoroughly on testnet before mainnet deployment

## Next Steps

1. **Frontend Integration**: Update frontend to support Base network
2. **Analytics**: Set up monitoring and analytics dashboard
3. **Documentation**: Update user documentation for Base deployment
4. **Marketing**: Announce yALP availability on Base network

## Support

For issues or questions:
- Check the logs: `pm2 logs yalp-keeper-bot-base`
- Review contract on BaseScan: `https://basescan.org/address/[VAULT_ADDRESS]`
- Test on Base Sepolia first if issues arise 