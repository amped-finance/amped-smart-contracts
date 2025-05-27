# Amped Contracts
Contracts for Amped Finance - a decentralized perpetuals exchange.

## Install Dependencies
If npx is not installed yet:
`npm install -g npx`

Install packages:
`npm i`

## Compile Contracts
`npx hardhat compile`

## Run Tests
`npx hardhat test`

## Deployments

### Deploy Core Contracts
`npx hardhat run --network <network> scripts/deploy.js`

### Verify Contracts
`npx hardhat verify --network <network> [address]`

## Key Components

### Core Protocol
- **Vault**: Main trading vault that handles positions, swaps, and liquidity
- **Router**: Entry point for user interactions with the protocol
- **PositionRouter**: Handles delayed position orders with keeper execution
- **OrderBook**: Manages limit orders and stop-loss/take-profit orders

### Liquidity
- **GLP/ALP**: Liquidity provider token representing share of the vault
- **GlpManager**: Manages minting and redeeming of liquidity tokens

### Staking & Rewards
- **RewardRouter**: Handles staking and reward distribution
- **RewardTracker**: Tracks staked balances and reward accrual
- **YieldBearingALPVault (yALP)**: EIP-4626 vault for auto-compounding ALP rewards
  - Deployed on Sonic: `0x1358cC494A3D2588BB70fDc173EedeE4C5aFBEF3`
  - See [docs/YieldBearingALPVault.md](docs/YieldBearingALPVault.md) for details

### Price Feeds
- **VaultPriceFeed**: Aggregates prices from multiple sources
- **FastPriceFeed**: Provides fast price updates from keepers

## Networks

The protocol is deployed on multiple networks:
- BSC
- Sonic
- Superseed
- Megaeth
- Phoenix
- Berachain

Deployment addresses for each network can be found in `scripts/deploy-<network>.json`

## Documentation

For more detailed documentation on specific components:
- [YieldBearingALPVault (yALP)](docs/YieldBearingALPVault.md) - Auto-compounding vault for ALP

## Security

The protocol has been audited. See the audit report in `audit/Amped-Finance-Final-Audit-Report.pdf`

-------------------------------------------------------------------------------
