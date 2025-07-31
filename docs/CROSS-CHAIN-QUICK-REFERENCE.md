# AMPED Cross-Chain Deployment Quick Reference

## LayerZero Endpoint Addresses
- **Ethereum**: `0x1a44076050125825900e736c501f859c50fE728c`
- **Sonic**: `0x1a44076050125825900e736c501f859c50fE728c`

## LayerZero Chain IDs
- **Ethereum**: 30101
- **Sonic**: 30264

## Deployment Order
1. Deploy AMPED on Ethereum (gets initial 1B supply)
2. Configure LayerZero trusted remotes
3. Deploy AMPED OFT on Sonic (no initial mint)
4. Configure cross-chain trust
5. Bridge tokens from Ethereum to Sonic
6. Deploy router contracts on Sonic
7. Configure Sonic infrastructure

## Key Commands

### Deploy on Ethereum
```bash
npx hardhat run scripts/tokens/deployAmpedToken.js --network ethereum
```

### Deploy OFT on Sonic
```bash
# Modify deployAmpedToken.js to skip minting for OFT deployment
npx hardhat run scripts/tokens/deployAmpedOFT.js --network sonic
```

### Bridge Tokens (from Ethereum contract)
```solidity
// Estimate fee first
estimateSendFee(30264, recipient, amount, false, "0x")

// Then send with ETH value
sendFrom(
    sender,
    30264,              // Sonic chain ID
    recipientBytes32,   // Recipient on Sonic
    amount,
    sender,            // Refund address
    address(0),        // Zero address
    "0x"               // No adapter params
)
```

## Trusted Remote Format
```solidity
// On Ethereum
abi.encodePacked(sonicAmpedAddress, ethereumAmpedAddress)

// On Sonic  
abi.encodePacked(ethereumAmpedAddress, sonicAmpedAddress)
```

## Governance Setup

### Snapshot Multi-Chain Strategy
```json
{
  "strategies": [
    {
      "name": "erc20-balance-of",
      "network": "1",
      "params": {
        "address": "<ETHEREUM_AMPED>",
        "decimals": 18
      }
    },
    {
      "name": "erc20-balance-of",
      "network": "146",
      "params": {
        "address": "<SONIC_AMPED>",
        "decimals": 18
      }
    }
  ]
}
```

## Common Issues

### "LayerZero: invalid source sending contract"
- Check trusted remote setup on both chains
- Ensure addresses are in correct order

### Tokens not arriving after bridge
- Check LayerZero Scan: https://layerzeroscan.com/
- Verify min gas settings
- Ensure sufficient fee was paid

### Can't stake on Sonic
- Verify handler permissions set
- Check AMP token is bridged
- Ensure SwapRouter has liquidity

## Useful Links
- LayerZero Scan: https://layerzeroscan.com/
- Ethereum Endpoint: https://docs.layerzero.network/v2/developers/evm/technical-reference/deployed-contracts
- Sonic Docs: https://docs.soniclabs.com/