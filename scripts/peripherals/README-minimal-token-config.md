# Minimal Token Configuration for GMX v1 Swaps

This directory contains scripts for configuring new tokens in GMX v1 for swap-only functionality without requiring FastPriceFeed or keeper infrastructure.

## Scripts

### 1. `configureNewTokenMinimal.js`
A simplified version of `configureNewToken.js` that only configures the essential components for swap functionality:
- Vault token whitelisting
- Primary price feed (Chainlink) configuration
- NO FastPriceFeed configuration
- NO keeper requirements

### 2. `disableSecondaryPriceFeed.js`
Utility script to check and disable the secondary price feed (FastPriceFeed) on the VaultPriceFeed contract.

## Usage

### Step 1: Disable Secondary Price Feed (if not already disabled)
```bash
npx hardhat run scripts/peripherals/disableSecondaryPriceFeed.js --network <network>
```

### Step 2: Configure New Tokens

#### Configure a specific token:
```bash
npx hardhat run scripts/peripherals/configureNewTokenMinimal.js --network <network> <token_symbol>

# Example:
npx hardhat run scripts/peripherals/configureNewTokenMinimal.js --network sonic usdc
```

#### Configure ALL tokens in tokens.js:
```bash
npx hardhat run scripts/peripherals/configureNewTokenMinimal.js --network <network>
```

#### Get help:
```bash
npx hardhat run scripts/peripherals/configureNewTokenMinimal.js --help
```

## Requirements

For swap-only functionality with these scripts, you need:

1. **Token Information** in `scripts/core/tokens.js`:
   ```javascript
   {
     address: "0x...",           // Token contract address
     decimals: 18,               // Token decimals
     tokenWeight: 10000,         // Weight in basis points
     minProfitBps: 150,         // Min profit in basis points
     maxUsdgAmount: 50000000,   // Max USDG amount
     isStable: false,           // Is stablecoin
     isShortable: false,        // Can be shorted (false for swap-only)
     priceFeed: "0x...",        // Chainlink price feed address
     priceDecimals: 8,          // Price feed decimals
     stable: false              // Price feed stable flag
   }
   ```

2. **Deployed Contracts**:
   - Vault
   - VaultPriceFeed
   - Timelock
   - PriceFeedTimelock

3. **Settings**:
   - `isSecondaryPriceEnabled` must be `false` on VaultPriceFeed
   - `isSwapEnabled` must be `true` on Vault

## What This Configuration Enables

- Direct token swaps through the Vault contract
- Price data from Chainlink oracles only
- No dependency on FastPriceFeed or keepers
- No leverage trading or limit orders

## What This Configuration Does NOT Support

- Leveraged positions
- Limit/stop orders (requires OrderBook and keepers)
- FastPrice updates (requires keepers)
- Price manipulation protection from FastPriceFeed

## Verification

After running the scripts, verify:

1. Check token is whitelisted:
   ```javascript
   await vault.whitelistedTokens(tokenAddress) // should return true
   ```

2. Check price feed is configured:
   ```javascript
   await vaultPriceFeed.priceFeeds(tokenAddress) // should return Chainlink feed address
   ```

3. Check secondary price feed is disabled:
   ```javascript
   await vaultPriceFeed.isSecondaryPriceEnabled() // should return false
   ```

## Notes

- This minimal configuration is suitable for DEX-like swap functionality only
- For production use with leverage trading, the full configuration with FastPriceFeed and keepers is recommended
- Always test token swaps on testnet before mainnet deployment