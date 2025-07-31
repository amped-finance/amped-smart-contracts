# yALP Keeper Bot

This keeper bot automatically calls the `compound()` function on the yALP vault contract at configurable intervals to compound accumulated rewards.

## Setup

1. **Configure Environment Variables**
   
   Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set:
   - `KEEPER_PRIVATE_KEY`: Private key of the keeper wallet (must be authorized keeper on the contract)
   - `COMPOUND_INTERVAL_HOURS`: How often to compound (default: 1 hour)
   - `YALP_VAULT_ADDRESS`: yALP vault contract address (default: 0x9A2A5864b906D734dCc2a352FF22046Fa5C8dD13)

2. **Ensure Keeper Authorization**
   
   The wallet address derived from `KEEPER_PRIVATE_KEY` must be set as the keeper on the yALP vault contract. Only the contract governor can set the keeper.

3. **Fund Keeper Wallet**
   
   The keeper wallet needs ETH/S for gas fees. Ensure it has sufficient balance.

## Running the Bot

### Direct Execution
```bash
npx hardhat run scripts/staking/yalpKeeperBot.js --network sonic
```

### Using PM2 (Recommended for Production)

1. Install PM2 globally if not already installed:
   ```bash
   npm install -g pm2
   ```

2. Create logs directory:
   ```bash
   mkdir -p logs
   ```

3. Start the keeper bot:
   ```bash
   pm2 start ecosystem.config.js
   ```

4. PM2 Commands:
   ```bash
   # View logs
   pm2 logs yalp-keeper-bot
   
   # Monitor
   pm2 monit
   
   # Stop
   pm2 stop yalp-keeper-bot
   
   # Restart
   pm2 restart yalp-keeper-bot
   
   # Delete from PM2
   pm2 delete yalp-keeper-bot
   
   # Save PM2 process list
   pm2 save
   
   # Setup PM2 to restart on system reboot
   pm2 startup
   ```

## Features

- **Automatic Compounding**: Calls `compound()` at regular intervals
- **Gas Estimation**: Estimates gas before transactions
- **Balance Checks**: Ensures keeper has sufficient ETH for gas
- **Error Handling**: Graceful error handling with detailed logging
- **PM2 Integration**: Production-ready with automatic restarts
- **Configurable Intervals**: Set compound frequency via environment variables

## Logs

When running with PM2, logs are saved to:
- Output: `./logs/yalp-keeper-out.log`
- Errors: `./logs/yalp-keeper-error.log`

## Security Notes

- Never commit `.env` file with private keys
- Use a dedicated keeper wallet with minimal funds
- Regularly monitor keeper wallet balance
- Consider using a hardware wallet or secure key management service in production