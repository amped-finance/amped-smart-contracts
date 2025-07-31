#!/bin/bash

# Repository Cleanup Script for Amped Smart Contracts
# This script removes unnecessary files before committing to GitHub
# Always run with --dry-run first to see what will be deleted

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if --dry-run flag is passed
DRY_RUN=false
if [[ "$1" == "--dry-run" ]]; then
    DRY_RUN=true
    echo -e "${YELLOW}DRY RUN MODE: No files will be deleted${NC}"
fi

# Function to remove files/directories
remove_item() {
    local item=$1
    if [ -e "$item" ]; then
        if [ "$DRY_RUN" = true ]; then
            echo -e "${YELLOW}Would remove:${NC} $item"
        else
            rm -rf "$item"
            echo -e "${GREEN}Removed:${NC} $item"
        fi
    fi
}

echo -e "${GREEN}Starting repository cleanup...${NC}"
echo ""

# Change to repository root
cd "$(dirname "$0")"

# 1. Remove all .DS_Store files
echo -e "${YELLOW}Removing .DS_Store files...${NC}"
if [ "$DRY_RUN" = true ]; then
    find . -name ".DS_Store" -type f | while read -r file; do
        echo -e "${YELLOW}Would remove:${NC} $file"
    done
else
    find . -name ".DS_Store" -type f -delete
    echo -e "${GREEN}All .DS_Store files removed${NC}"
fi
echo ""

# 2. Remove environment files
echo -e "${YELLOW}Removing environment files...${NC}"
remove_item ".env"
remove_item ".env.example"
echo ""

# 3. Remove temporary and backup files
echo -e "${YELLOW}Removing temporary and backup files...${NC}"
remove_item "test-pm2.js"
remove_item "atlantis_bytecode.txt"
remove_item "atlantis_bytecode_full.txt"
remove_item "online_bytecode.txt"
remove_item "scripts/staking/deployYALPVault.js.old"
echo ""

# 4. Remove archive files
echo -e "${YELLOW}Removing archive files...${NC}"
remove_item "yalp-keeper-bot.zip"
remove_item "yalp-keeper-bot/"
echo ""

# 5. Remove deployment logs (except production)
echo -e "${YELLOW}Removing non-production deployment logs...${NC}"
for file in deployment-log-*.json; do
    if [[ "$file" != "deployment-log-sonic.json" && "$file" != "deployment-log-superseed.json" && -f "$file" ]]; then
        remove_item "$file"
    fi
done
echo ""

# 6. Remove failed deployment files
echo -e "${YELLOW}Removing failed deployment files...${NC}"
if [ "$DRY_RUN" = true ]; then
    find scripts -name "*-failed-*.json" -type f | while read -r file; do
        echo -e "${YELLOW}Would remove:${NC} $file"
    done
else
    find scripts -name "*-failed-*.json" -type f -delete
    echo -e "${GREEN}All failed deployment files removed${NC}"
fi
echo ""

# 7. Remove verification result files
echo -e "${YELLOW}Removing verification result files...${NC}"
if [ "$DRY_RUN" = true ]; then
    find scripts -name "verification-results-*.json" -type f | while read -r file; do
        echo -e "${YELLOW}Would remove:${NC} $file"
    done
else
    find scripts -name "verification-results-*.json" -type f -delete
    echo -e "${GREEN}All verification result files removed${NC}"
fi
echo ""

# 8. Remove test deployment files
echo -e "${YELLOW}Removing test deployment files...${NC}"
# Remove timestamped deployment files from scripts/staking/
if [ "$DRY_RUN" = true ]; then
    find scripts/staking -name "yalp-vault-deployment-*.json" -type f | while read -r file; do
        echo -e "${YELLOW}Would remove:${NC} $file"
    done
    find scripts/staking -name "amped-routers-deployment-*.json" -type f | grep -E "[0-9]{13}" | while read -r file; do
        echo -e "${YELLOW}Would remove:${NC} $file"
    done
    find scripts/staking -name "yalp-deployment-*.json" -type f | while read -r file; do
        echo -e "${YELLOW}Would remove:${NC} $file"
    done
    find scripts/staking -name "zapper-deployment-*.json" -type f | while read -r file; do
        echo -e "${YELLOW}Would remove:${NC} $file"
    done
    find scripts/staking -name "yalp-vault-*-deployment-*.json" -type f | while read -r file; do
        echo -e "${YELLOW}Would remove:${NC} $file"
    done
else
    find scripts/staking -name "yalp-vault-deployment-*.json" -type f -delete
    find scripts/staking -name "amped-routers-deployment-*.json" -type f | grep -E "[0-9]{13}" | xargs rm -f
    find scripts/staking -name "yalp-deployment-*.json" -type f -delete
    find scripts/staking -name "zapper-deployment-*.json" -type f -delete
    find scripts/staking -name "yalp-vault-*-deployment-*.json" -type f -delete
    echo -e "${GREEN}Test deployment files removed${NC}"
fi

# Remove timestamped deployment files from scripts/tokens/
if [ "$DRY_RUN" = true ]; then
    find scripts/tokens -name "amped-deployment-*.json" -type f | while read -r file; do
        echo -e "${YELLOW}Would remove:${NC} $file"
    done
    find scripts/tokens -name "amped-oft-deployment-*.json" -type f | while read -r file; do
        echo -e "${YELLOW}Would remove:${NC} $file"
    done
else
    find scripts/tokens -name "amped-deployment-*.json" -type f -delete
    find scripts/tokens -name "amped-oft-deployment-*.json" -type f -delete
fi
echo ""

# 9. Summary
echo -e "${GREEN}=== Cleanup Summary ===${NC}"
if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}This was a dry run. No files were actually deleted.${NC}"
    echo -e "${YELLOW}Run without --dry-run flag to perform actual cleanup.${NC}"
else
    echo -e "${GREEN}Repository cleanup completed successfully!${NC}"
fi

echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Review the changes with: git status"
echo "2. Add the changes to git: git add -A"
echo "3. Commit with a message like: git commit -m 'Clean up repository for GitHub'"
echo ""
echo -e "${RED}Important:${NC} The .gitignore has been updated to prevent these files from being tracked in the future."