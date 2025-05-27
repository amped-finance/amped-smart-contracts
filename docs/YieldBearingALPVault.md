# YieldBearingALPVault (yALP) Documentation

## Overview

The YieldBearingALPVault is an EIP-4626 compliant tokenized vault that wraps Amped's ALP tokens into a yield-bearing token called yALP. The vault automatically compounds rewards from staking and fee distributions, allowing users to earn yield without manual claiming.

## Deployed Contract

**Network**: Sonic  
**Address**: `0xd2e4b0cC3FB79ef958137206cbEd94C7a5C7972d`  
**Token Name**: Yield Bearing ALP  
**Token Symbol**: yALP  

## Key Features

- **EIP-4626 Compliant**: Follows the tokenized vault standard for composability
- **Auto-Compounding**: Automatically reinvests earned rewards back into ALP
- **ETH-Only Deposits/Withdrawals**: Simplified interface accepting only ETH
- **Non-Custodial**: Users maintain control through yALP tokens
- **Transparent Exchange Rate**: Fair share calculation based on vault's total assets

## Technical Details

### Architecture

The vault interacts with Amped's RewardRouter to:
1. Accept ETH deposits
2. Mint and stake ALP tokens to receive fsALP (fee + staked ALP)
3. Hold fsALP tokens and compound rewards
4. Allow withdrawals back to ETH

### Key Functions

#### Deposits
```solidity
function depositETH(uint256 minUsdg, uint256 minGlp) external payable returns (uint256 shares)
```
- Accepts ETH and mints yALP shares
- Requires minimum USDG and GLP amounts for slippage protection
- Gas requirement: ~1.5-2M gas

#### Withdrawals
```solidity
function withdrawETH(uint256 shares, uint256 minOut, address receiver) external returns (uint256 amountOut)
```
- Burns yALP shares and returns ETH
- Subject to 15-minute cooldown period
- Gas requirement: ~1.5-2M gas

#### View Functions
```solidity
function totalAssets() public view returns (uint256)
function convertToShares(uint256 assets) public view returns (uint256)
function convertToAssets(uint256 shares) public view returns (uint256)
function previewDeposit(uint256 assets) public view returns (uint256)
function previewWithdraw(uint256 assets) public view returns (uint256)
```

### Important Considerations

1. **Cooldown Period**: There is a 15-minute cooldown on withdrawals enforced by the GlpManager. This cooldown is global for the vault, meaning if any user triggers it, all users must wait.

2. **Gas Requirements**: Both deposits and withdrawals require significant gas (1.5-2M). Users should set appropriate gas limits.

3. **Exchange Rate**: The vault maintains a fair exchange rate by calculating shares based on the vault's state before deposits, preventing dilution attacks.

4. **Non-Transferable Underlying**: The underlying fsALP tokens are non-transferable, but yALP tokens are freely transferable.

## Integration Guide

### Depositing ETH

```javascript
// Example using ethers.js
const tx = await yalpVault.depositETH(
    minUsdg,  // Minimum USDG to receive (use 0 for no minimum)
    minGlp,   // Minimum GLP to receive (use 0 for no minimum)
    {
        value: ethers.utils.parseEther("1.0"),  // 1 ETH
        gasLimit: 2000000  // Important: Set high gas limit
    }
);
```

### Withdrawing ETH

```javascript
// Check if withdrawal is available
const cooldownDuration = await yalpVault.cooldownDuration();
const lastAddLiquidityTime = await yalpVault.lastAddLiquidityTime();
const currentTime = Math.floor(Date.now() / 1000);
const canWithdraw = currentTime >= lastAddLiquidityTime + cooldownDuration;

if (canWithdraw) {
    const shares = ethers.utils.parseEther("100");  // 100 yALP
    const tx = await yalpVault.withdrawETH(
        shares,
        0,  // Minimum ETH out (0 for no minimum)
        userAddress,  // Receiver address
        { gasLimit: 2000000 }
    );
}
```

### Checking Balances

```javascript
// Get yALP balance
const yalpBalance = await yalpVault.balanceOf(userAddress);

// Get equivalent fsALP value
const fsAlpValue = await yalpVault.convertToAssets(yalpBalance);

// Get total assets in vault
const totalAssets = await yalpVault.totalAssets();
```

## Security Considerations

1. The vault has been designed to prevent common vulnerabilities including:
   - Exchange rate manipulation
   - First depositor attacks
   - Reentrancy attacks

2. The vault relies on Amped's core protocol security for:
   - Price feeds
   - Liquidity management
   - Fee distribution

3. Users should be aware of:
   - Smart contract risk
   - Liquidity risk during high withdrawal periods
   - Potential slippage on deposits/withdrawals

## Helper Scripts

### Check Withdrawal Availability
```bash
npx hardhat run scripts/staking/checkWithdrawAvailability.js --network sonic
```

### Deploy New Instance
```bash
USE_FRAME_SIGNER=true npx hardhat run scripts/staking/deployYieldBearingALPVault.js --network sonic
```

### Example Interactions
```bash
YALP_VAULT=0xd2e4b0cC3FB79ef958137206cbEd94C7a5C7972d npx hardhat run scripts/staking/exampleYALPInteractions.js --network sonic
```

### Compound Rewards (Keeper Only)
```bash
YALP_VAULT=0xd2e4b0cC3FB79ef958137206cbEd94C7a5C7972d npx hardhat run scripts/staking/compoundYALP.js --network sonic
```

## Contract Source

The full contract source code can be found at:
`contracts/staking/YieldBearingALPVault.sol`

## Support

For issues or questions:
- GitHub: [Amped Smart Contracts Repository]
- Discord: [Amped Finance Discord]