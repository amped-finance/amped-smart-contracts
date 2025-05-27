# yALP - Yield Bearing ALP Vault

## Overview

yALP (Yield Bearing ALP) is an EIP-4626 compliant vault that enables auto-compounding rewards for Amped's ALP tokens. The vault solves the fundamental issue that ALP tokens are automatically staked to fsALP (fee + staked ALP) when purchased, and fsALP tokens are non-transferable.

## Problem Statement

When users buy ALP through Amped's RewardRouter:
1. They never receive raw ALP tokens
2. Instead, they automatically receive fsALP (staked ALP)
3. fsALP tokens are non-transferable (no `transfer()` or `approve()` functions)
4. This makes it impossible to create a traditional wrapper where users deposit fsALP

## Solution Architecture

The YieldBearingALPVault acts as an intermediary that:
1. Receives user deposits (tokens or ETH)
2. Calls `mintAndStakeGlp` as the vault itself (`msg.sender`)
3. Holds the non-transferable fsALP tokens
4. Issues transferable yALP tokens representing shares in the vault
5. Auto-compounds WETH rewards by reinvesting into more ALP

## Deployed Contracts

### Sonic Network
- **YieldBearingALPVault**: `0x2A7353242c2C0BbF9cB56bEe98b6b5f2Fa528Cfa` ([Verified on Sonicscan](https://sonicscan.org/address/0x2A7353242c2C0BbF9cB56bEe98b6b5f2Fa528Cfa#code))

### Dependencies (Existing Amped Infrastructure)
- **RewardRouter**: `0xE72A2d5B3b09c88D4E8Cc60e74BD438d7168e80F`
- **fsALP**: `0xB895e3DBFB37A4Cc6b4FB50B1cf903608e942FF9`
- **GlpManager**: `0x4DE729B85dDB172F1bb775882f355bA25764E430`
- **WETH**: `0x50c42deacd8fc9773493ed674b675be577f2634b`
- **esAMP**: `0x1ab02347D787A144a7fBC934a9B96420d46e9eD8`

## User Flows

### Depositing (Zap In)

Users can deposit approved tokens or native S (ETH) to receive yALP tokens:

#### With ERC20 Tokens
```solidity
// 1. Approve tokens to vault
IERC20(token).approve(yALPVault, amount);

// 2. Deposit tokens
vault.deposit(
    token,      // Address of token (USDC, WETH, WS, ANON, SHADOW, stS, scUSD)
    amount,     // Amount to deposit
    minUsdg,    // Minimum USDG to receive (slippage protection)
    minGlp,     // Minimum GLP to receive (slippage protection)
    receiver    // Address to receive yALP tokens
);
```

#### With Native S (ETH)
```solidity
vault.depositETH{value: amount}(
    minUsdg,    // Minimum USDG to receive (slippage protection)
    minGlp,     // Minimum GLP to receive (slippage protection)
    receiver    // Address to receive yALP tokens
);
```

### Withdrawing (Zap Out)

Users can withdraw their yALP shares to receive tokens or native S:

#### To ERC20 Tokens
```solidity
vault.withdraw(
    shares,     // Amount of yALP shares to burn
    tokenOut,   // Address of token to receive
    minOut,     // Minimum tokens to receive (slippage protection)
    receiver    // Address to receive tokens
);
```

#### To Native S (ETH)
```solidity
vault.withdrawETH(
    shares,     // Amount of yALP shares to burn
    minOut,     // Minimum ETH to receive (slippage protection)
    receiver    // Address to receive ETH
);
```

### Auto-Compounding

The vault automatically compounds WETH rewards from trading fees:

```solidity
// Only callable by keeper
vault.compound();
```

This function:
1. Claims all pending WETH rewards from the RewardRouter
2. Takes a performance fee (default 10%)
3. Uses remaining WETH to mint more ALP
4. All yALP holders benefit from the increased ALP per share

## Contract Components

### Core Contract
- **YieldBearingALPVault.sol**: Main vault implementing EIP-4626 standard
  - Holds fsALP tokens on behalf of users
  - Issues yALP tokens as transferable shares
  - Handles deposits, withdrawals, and compounding
  - Implements slippage protection and performance fees

### Interfaces
- **IRewardRouterV2Extended.sol**: Extended interface for RewardRouter
  - Defines methods for minting/redeeming ALP
  - Used by the vault to interact with Amped's infrastructure

### Deployment Scripts
- **deployYALPVault.js**: Main deployment script
  - Deploys the vault contract
  - Configures all necessary addresses
  - Performs initial testing
  - Saves deployment information
  - Includes automatic contract verification

### Testing Scripts
- **testDepositETH.js**: Tests ETH deposits
- **debugYALPVault.js**: Debugging utilities
- **simulateDepositETH.js**: Simulates deposits for gas estimation

## Deployment

### Prerequisites
1. Install dependencies: `npm install`
2. Configure network settings in `hardhat.config.js`
3. Set up deployment keys and API keys in `env.json`

### Deploy Contract
```bash
npx hardhat run scripts/staking/deployYALPVault.js --network sonic
```

The deployment script will:
1. Deploy the YieldBearingALPVault contract
2. Verify the contract on Sonicscan automatically
3. Test with a small deposit
4. Save deployment information to a JSON file

### Manual Verification (if needed)
```bash
npx hardhat verify --network sonic \
  0x2A7353242c2C0BbF9cB56bEe98b6b5f2Fa528Cfa \
  "0xE72A2d5B3b09c88D4E8Cc60e74BD438d7168e80F" \
  "0xB895e3DBFB37A4Cc6b4FB50B1cf903608e942FF9" \
  "0x4DE729B85dDB172F1bb775882f355bA25764E430" \
  "0x50c42deacd8fc9773493ed674b675be577f2634b" \
  "0x1ab02347D787A144a7fBC934a9B96420d46e9eD8"
```

## Technical Details

### Key Features
- **EIP-4626 Compliant**: Standard vault interface for DeFi integrations
- **Non-Custodial**: Users can withdraw at any time
- **Auto-Compounding**: No manual claiming required
- **Slippage Protection**: Configurable slippage tolerance
- **Performance Fee**: 10% on compounded rewards (configurable by governance)
- **No Permission Changes**: Works with existing Amped infrastructure

### Security Considerations
- Uses OpenZeppelin's ReentrancyGuard
- Implements SafeMath for arithmetic operations
- SafeERC20 for token transfers
- Slippage protection on all mint/redeem operations
- Only keeper can trigger compounds

### Gas Optimization
- Efficient share calculation using EIP-4626 formulas
- Minimal storage operations
- Batch operations where possible

## Integration Guide

### For Frontend Developers

#### Reading Data
```javascript
// Get user's yALP balance
const balance = await vault.balanceOf(userAddress);

// Get total assets (fsALP) managed by vault
const totalAssets = await vault.totalAssets();

// Convert yALP shares to fsALP assets
const assets = await vault.convertToAssets(shares);

// Convert fsALP assets to yALP shares
const shares = await vault.convertToShares(assets);
```

#### Depositing
```javascript
// Deposit USDC
const usdcAmount = ethers.utils.parseUnits("100", 6); // 100 USDC
await usdc.approve(vault.address, usdcAmount);
await vault.deposit(usdc.address, usdcAmount, 0, 0, userAddress);

// Deposit ETH
await vault.depositETH(0, 0, userAddress, {
  value: ethers.utils.parseEther("1.0")
});
```

#### Withdrawing
```javascript
// Withdraw to USDC
const shares = ethers.utils.parseEther("50"); // 50 yALP
await vault.withdraw(shares, usdc.address, 0, userAddress);

// Withdraw to ETH
await vault.withdrawETH(shares, 0, userAddress);
```

### For Protocol Integrators

The vault implements the full EIP-4626 standard, making it compatible with:
- Yield aggregators
- Lending protocols
- DeFi dashboards
- Portfolio trackers

## Governance

### Configurable Parameters
- **keeper**: Address authorized to call compound()
- **performanceFee**: Fee taken on compounded rewards (default: 10%)
- **feeRecipient**: Address receiving performance fees
- **maxSlippage**: Maximum allowed slippage (default: 1%)

### Admin Functions
```solidity
// Change keeper
vault.setKeeper(newKeeper);

// Update performance fee
vault.setPerformanceFee(newFee);

// Change fee recipient
vault.setFeeRecipient(newRecipient);

// Update slippage tolerance
vault.setMaxSlippage(newSlippage);
```

## Support

For questions or issues:
- Review this documentation
- Check the verified contract on [Sonicscan](https://sonicscan.org/address/0x2A7353242c2C0BbF9cB56bEe98b6b5f2Fa528Cfa#code)
- Contact the Amped team

## License

This project is licensed under the MIT License.