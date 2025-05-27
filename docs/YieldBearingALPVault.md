# YieldBearingALPVault (yALP) Documentation

## Overview

The YieldBearingALPVault is an EIP-4626 compliant tokenized vault that wraps Amped's ALP tokens into a yield-bearing token called yALP. The vault automatically compounds rewards from staking and fee distributions, allowing users to earn yield without manual claiming.

## Deployed Contract

**Network**: Sonic  
**Address**: `0x1358cC494A3D2588BB70fDc173EedeE4C5aFBEF3`  
**Token Name**: Yield Bearing ALP  
**Token Symbol**: yALP  

## Key Features

- **EIP-4626 Compliant**: Follows the tokenized vault standard for composability
- **Auto-Compounding**: Keeper-controlled reinvestment of WS (Wrapped Sonic) rewards back into ALP
- **Sonic Native Integration**: Deposits and withdrawals in S (Sonic's native token)
- **Non-Custodial**: Users maintain control through yALP tokens
- **Transparent Exchange Rate**: Fair share calculation based on vault's total assets
- **Deposit Tracking**: Public `lastDeposit` timestamp for transparency
- **Cooldown Visibility**: `withdrawalsAvailableAt()` shows exactly when withdrawals are available

## Technical Details

### Architecture

The vault interacts with Amped's RewardRouter to:
1. Accept S (Sonic) deposits via `depositS()`
2. Mint and stake ALP tokens to receive fsALP (fee + staked ALP)
3. Hold fsALP tokens and receive WS rewards
4. Compound WS rewards back into more fsALP via keeper
5. Allow withdrawals back to S via `withdrawS()`

### Key Functions

#### Deposits
```solidity
function depositS(uint256 minUsdg, uint256 minGlp) external payable returns (uint256 shares)
```
- Accepts S (Sonic) and mints yALP shares
- Requires minimum USDG and GLP amounts for slippage protection
- Updates `lastDeposit` timestamp
- Gas requirement: ~1.5-2M gas

#### Withdrawals
```solidity
function withdrawS(uint256 shares, uint256 minOut, address receiver) external returns (uint256 amountOut)
```
- Burns yALP shares and returns S (Sonic)
- Subject to 15-minute cooldown period (checks via `withdrawalsAvailableAt()`)
- Gas requirement: ~1.5-2M gas

#### Compound
```solidity
function compound() external
```
- Only callable by keeper
- Claims WS rewards from fee distributions
- Converts WS back to S and reinvests into more ALP
- Updates `lastDeposit` timestamp
- Increases the yALP:fsALP exchange rate

#### View Functions
```solidity
function totalAssets() public view returns (uint256)
function convertToShares(uint256 assets) public view returns (uint256)
function convertToAssets(uint256 shares) public view returns (uint256)
function lastDeposit() public view returns (uint256)
function withdrawalsAvailableAt() public view returns (uint256)
function previewDeposit(uint256 assets) public view returns (uint256)
function previewWithdraw(uint256 assets) public view returns (uint256)
```

### Important Considerations

1. **Cooldown Period**: There is a 15-minute cooldown on withdrawals enforced by the GlpManager. The vault tracks this via `lastDeposit` and users can check `withdrawalsAvailableAt()`.

2. **Gas Requirements**: Deposits, withdrawals, and compounds require significant gas (1.5-2M). Users should set appropriate gas limits.

3. **Exchange Rate**: The vault maintains a fair exchange rate by calculating shares based on the vault's state before deposits, preventing dilution attacks.

4. **Non-Transferable Underlying**: The underlying fsALP tokens are non-transferable, but yALP tokens are freely transferable.

5. **Keeper Role**: The compound function can only be called by the designated keeper address. The keeper can be updated by governance.

## Integration Guide

### Depositing S (Sonic)

```javascript
// Example using ethers.js
const tx = await yalpVault.depositS(
    minUsdg,  // Minimum USDG to receive (use 0 for no minimum)
    minGlp,   // Minimum GLP to receive (use 0 for no minimum)
    {
        value: ethers.utils.parseEther("1.0"),  // 1 S
        gasLimit: 2000000  // Important: Set high gas limit
    }
);
```

### Withdrawing S (Sonic)

```javascript
// Check if withdrawal is available
const withdrawalsAvailableAt = await yalpVault.withdrawalsAvailableAt();
const currentTime = Math.floor(Date.now() / 1000);
const canWithdraw = currentTime >= withdrawalsAvailableAt;

if (canWithdraw) {
    const shares = ethers.utils.parseEther("100");  // 100 yALP
    const tx = await yalpVault.withdrawS(
        shares,
        0,  // Minimum S out (0 for no minimum)
        userAddress,  // Receiver address
        { gasLimit: 2000000 }
    );
} else {
    console.log("Withdrawals available at:", new Date(withdrawalsAvailableAt * 1000));
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
YALP_VAULT=0x1358cC494A3D2588BB70fDc173EedeE4C5aFBEF3 npx hardhat run scripts/staking/exampleYALPInteractions.js --network sonic
```

### Compound Rewards (Keeper Only)
```bash
YALP_VAULT=0x1358cC494A3D2588BB70fDc173EedeE4C5aFBEF3 npx hardhat run scripts/staking/compoundYALP.js --network sonic
```

### Check Vault State
```bash
YALP_VAULT=0x1358cC494A3D2588BB70fDc173EedeE4C5aFBEF3 npx hardhat run scripts/staking/getYALPValue.js --network sonic
```

## Contract Source

The full contract source code can be found at:
`contracts/staking/YieldBearingALPVault.sol`

## Support

For issues or questions:
- GitHub: [Amped Smart Contracts Repository]
- Discord: [Amped Finance Discord]