#!/bin/bash

# yALP Keeper Bot Management Script

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$PROJECT_ROOT"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${RED}Error: .env file not found!${NC}"
    echo "Please copy .env.example to .env and configure it:"
    echo "  cp .env.example .env"
    exit 1
fi

# Check if KEEPER_PRIVATE_KEY is set
if ! grep -q "KEEPER_PRIVATE_KEY=" .env || grep -q "KEEPER_PRIVATE_KEY=your_private_key_here" .env; then
    echo -e "${RED}Error: KEEPER_PRIVATE_KEY not configured in .env!${NC}"
    exit 1
fi

case "$1" in
    start)
        echo -e "${GREEN}Starting yALP Keeper Bot...${NC}"
        mkdir -p logs
        pm2 start ecosystem.config.js
        echo -e "${GREEN}Keeper bot started!${NC}"
        echo "View logs with: pm2 logs yalp-keeper-bot"
        ;;
    
    stop)
        echo -e "${YELLOW}Stopping yALP Keeper Bot...${NC}"
        pm2 stop yalp-keeper-bot
        ;;
    
    restart)
        echo -e "${YELLOW}Restarting yALP Keeper Bot...${NC}"
        pm2 restart yalp-keeper-bot
        ;;
    
    status)
        pm2 status yalp-keeper-bot
        ;;
    
    logs)
        pm2 logs yalp-keeper-bot
        ;;
    
    test)
        echo -e "${GREEN}Running keeper bot in test mode (single execution)...${NC}"
        npx hardhat run scripts/staking/yalpKeeperBot.js --network sonic
        ;;
    
    *)
        echo "Usage: $0 {start|stop|restart|status|logs|test}"
        echo ""
        echo "Commands:"
        echo "  start   - Start the keeper bot with PM2"
        echo "  stop    - Stop the keeper bot"
        echo "  restart - Restart the keeper bot"
        echo "  status  - Show PM2 status"
        echo "  logs    - Show keeper bot logs"
        echo "  test    - Run keeper bot once for testing"
        exit 1
        ;;
esac