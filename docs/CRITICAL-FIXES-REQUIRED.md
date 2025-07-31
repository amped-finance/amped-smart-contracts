# CRITICAL FIXES REQUIRED FOR AMPED IMPLEMENTATION

## Summary of Issues Found

After thorough analysis with Gemini Pro, we've identified 5 critical issues that will prevent the current implementation from working without proper configuration.

## Critical Issues & Solutions

### 1. AMP Token Supply Issue 🚨
**Problem**: SwapRouter needs AMP tokens to perform swaps.

**Solution**:
```javascript
// AMP token already exists on another chain
// Bridge AMP tokens to Sonic network
// Then transfer to SwapRouter:

const ampAmount = ethers.utils.parseEther("1000000"); // Amount based on expected volume
await ampToken.transfer(swapRouter.address, ampAmount);
```

### 2. Handler Permissions Required 🚨
**Problem**: RewardTracker's `stakeForAccount` requires handler permission.

**Solution**: The `configureAmpedSystem.js` script handles this automatically:
```javascript
// Make StakingRouter a handler on all RewardTrackers
await stakedGmxTracker.setHandler(stakingRouter.address, true);
await bonusGmxTracker.setHandler(stakingRouter.address, true);
await feeGmxTracker.setHandler(stakingRouter.address, true);
```

**Status**: ✅ Automated in the configuration script

### 3. Token Registration Required 🚨
**Problem**: RewardTracker requires tokens to be registered as deposit tokens.

**Solution**: The `configureAmpedSystem.js` script handles this:
```javascript
// Register AMP as a deposit token on stakedGmxTracker
await stakedGmxTracker.setDepositToken(ampToken.address, true);

// Register esAMP as a deposit token if needed
await stakedGmxTracker.setDepositToken(esAmpToken.address, true);
```

**Status**: ✅ Automated in the configuration script (with error handling if already registered)

### 4. Correct Staking Flow Implementation ✅ ALREADY FIXED
**Problem**: Initial router implementation wouldn't work with RewardRouter's permission model.

**Solution Implemented**: AmpedStakingRouter has been updated to use direct RewardTracker integration:

```solidity
// This has already been implemented in AmpedStakingRouter.sol
function _stakeAmped(address _account, uint256 _amount) private returns (uint256) {
    // ... swap logic ...
    
    // Stake directly on RewardTrackers (requires this contract to be a handler)
    IRewardTracker(stakedGmxTracker).stakeForAccount(
        address(this), // funding account
        _account,      // user account gets credit
        ampToken,      // deposit token
        ampAmount      // amount
    );
    
    // Stake the receipt token in next tracker
    IRewardTracker(bonusGmxTracker).stakeForAccount(
        _account,
        _account,
        stakedGmxTracker,
        ampAmount
    );
    
    // Continue cascading...
    IRewardTracker(feeGmxTracker).stakeForAccount(
        _account,
        _account,
        bonusGmxTracker,
        ampAmount
    );
}
```

**Status**: ✅ Already implemented in the contract code

### 5. Deployment Order & Configuration 🚨
**Problem**: Complex dependency chain requires precise deployment order.

**Correct Deployment Sequence**:
1. Deploy AMPED token
2. Deploy AMP token
3. Deploy SwapRouter and fund with tokens
4. Deploy StakingRouter and RewardsRouter
5. Configure handlers on RewardRouterV2
6. Make routers handlers on RewardTrackers
7. Register AMP as deposit token
8. Configure swap ratios and paths
9. Test all flows before enabling

## Alternative Approach: Wrapper Token Pattern

If modifying handler permissions is not possible, consider a wrapper token approach:

```solidity
contract StakedAMPED is ERC20 {
    function stake(uint256 ampedAmount) external {
        // Take AMPED from user
        ampedToken.transferFrom(msg.sender, address(this), ampedAmount);
        
        // Swap to AMP
        uint256 ampAmount = swapRouter.swap(ampedToken, ampToken, ampedAmount);
        
        // Stake AMP in protocol (contract holds the stake)
        rewardRouter.stakeGmx(ampAmount);
        
        // Mint wrapper tokens to user
        _mint(msg.sender, ampAmount);
    }
    
    function unstake(uint256 amount) external {
        // Burn wrapper tokens
        _burn(msg.sender, amount);
        
        // Unstake from protocol
        rewardRouter.unstakeGmx(amount);
        
        // Swap AMP back to AMPED
        uint256 ampedAmount = swapRouter.swap(ampToken, ampedToken, amount);
        
        // Return AMPED to user
        ampedToken.transfer(msg.sender, ampedAmount);
    }
}
```

## Implementation Status Summary

✅ **COMPLETED**:
1. **Staking Flow**: AmpedStakingRouter correctly implements direct RewardTracker integration
2. **Handler Configuration**: Automated in `configureAmpedSystem.js` script
3. **Token Registration**: Automated in `configureAmpedSystem.js` script
4. **Deployment Scripts**: Updated with all necessary configuration steps

⏳ **MANUAL STEPS REQUIRED**:
1. **Bridge AMP Tokens**: Transfer AMP from source chain to Sonic
2. **Fund SwapRouter**: Transfer AMP and AMPED tokens to SwapRouter
3. **Run Configuration**: Execute `configureAmpedSystem.js` after deployment

## Testing Checklist

- [ ] AMP token has sufficient supply for swaps
- [ ] SwapRouter can perform AMPED <-> AMP swaps
- [ ] StakingRouter is a handler on RewardTrackers
- [ ] AMP is registered as a deposit token
- [ ] Users can stake AMPED and receive staking credit
- [ ] Users can claim rewards and receive AMPED
- [ ] Cascading tracker system works correctly
- [ ] All events are emitted properly