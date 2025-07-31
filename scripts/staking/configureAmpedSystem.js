const { contractAt, sendTxn } = require("../shared/helpers");
const { expandDecimals } = require("../shared/helpers");

async function configureAmpedSystem() {
  console.log("Starting AMPED system configuration on Sonic...");
  
  try {
    // Load deployment addresses
    const network = "sonic";
    const deployData = require("../sonic-deployment.json");
    
    // Get deployed contract addresses from environment or command line
    const ampTokenAddress = process.env.AMP_TOKEN_ADDRESS; // Existing AMP token
    const ampedTokenAddress = process.env.AMPED_TOKEN_ADDRESS;
    const swapRouterAddress = process.env.SWAP_ROUTER_ADDRESS;
    const stakingRouterAddress = process.env.STAKING_ROUTER_ADDRESS;
    const rewardsRouterAddress = process.env.REWARDS_ROUTER_ADDRESS;
    
    if (!ampTokenAddress || !ampedTokenAddress || !swapRouterAddress || !stakingRouterAddress) {
      throw new Error("Missing required contract addresses. Set AMP_TOKEN_ADDRESS (existing token), AMPED_TOKEN_ADDRESS, SWAP_ROUTER_ADDRESS, and STAKING_ROUTER_ADDRESS");
    }
    
    console.log("Using addresses:");
    console.log("- AMP Token:", ampTokenAddress);
    console.log("- AMPED Token:", ampedTokenAddress);
    console.log("- SwapRouter:", swapRouterAddress);
    console.log("- StakingRouter:", stakingRouterAddress);
    console.log("- RewardsRouter:", rewardsRouterAddress);
    
    // Get contracts
    const ampToken = await contractAt("IERC20", ampTokenAddress); // Use IERC20 interface for existing token
    const ampedToken = await contractAt("AmpedToken", ampedTokenAddress);
    const swapRouter = await contractAt("AmpedSwapRouter", swapRouterAddress);
    const stakingRouter = await contractAt("AmpedStakingRouter", stakingRouterAddress);
    
    // Get RewardTracker contracts
    const stakedGmxTracker = await contractAt("RewardTracker", deployData.StakedGmxTracker);
    const bonusGmxTracker = await contractAt("RewardTracker", deployData.BonusGmxTracker);
    const feeGmxTracker = await contractAt("RewardTracker", deployData.FeeGmxTracker);
    
    console.log("\n=== Step 1: Configure Handler Permissions ===");
    
    // Make StakingRouter a handler on all RewardTrackers
    console.log("Setting StakingRouter as handler on StakedGmxTracker...");
    await sendTxn(
      stakedGmxTracker.setHandler(stakingRouterAddress, true),
      `stakedGmxTracker.setHandler(${stakingRouterAddress})`
    );
    
    console.log("Setting StakingRouter as handler on BonusGmxTracker...");
    await sendTxn(
      bonusGmxTracker.setHandler(stakingRouterAddress, true),
      `bonusGmxTracker.setHandler(${stakingRouterAddress})`
    );
    
    console.log("Setting StakingRouter as handler on FeeGmxTracker...");
    await sendTxn(
      feeGmxTracker.setHandler(stakingRouterAddress, true),
      `feeGmxTracker.setHandler(${stakingRouterAddress})`
    );
    
    console.log("\n=== Step 2: Register AMP as Deposit Token ===");
    
    // Check if setDepositToken function exists
    try {
      console.log("Registering AMP as deposit token on StakedGmxTracker...");
      await sendTxn(
        stakedGmxTracker.setDepositToken(ampTokenAddress, true),
        `stakedGmxTracker.setDepositToken(${ampTokenAddress})`
      );
    } catch (e) {
      console.log("Note: setDepositToken might not exist or AMP might already be registered");
    }
    
    console.log("\n=== Step 3: Configure SwapRouter ===");
    
    // Set swap ratio (1:1 by default)
    console.log("Setting swap ratio to 1:1...");
    await sendTxn(
      swapRouter.setSwapRatio(10000), // 10000 = 1:1
      "swapRouter.setSwapRatio(10000)"
    );
    
    // Check AMP balance in SwapRouter
    const ampBalance = await ampToken.balanceOf(swapRouterAddress);
    console.log(`Current AMP balance in SwapRouter: ${ampBalance.toString()}`);
    
    if (ampBalance.eq(0)) {
      console.log("WARNING: SwapRouter has no AMP tokens.");
      console.log("ACTION REQUIRED: Bridge AMP tokens from source chain and transfer to SwapRouter.");
      console.log(`Transfer AMP tokens to: ${swapRouterAddress}`);
    }
    
    // Also check AMPED token balance for reverse swaps
    const ampedBalance = await ampedToken.balanceOf(swapRouterAddress);
    console.log(`Current AMPED balance in SwapRouter: ${ampedBalance.toString()}`);
    
    console.log("\n=== Step 4: Verify Configuration ===");
    
    // Verify handlers
    const isStakingRouterHandler1 = await stakedGmxTracker.isHandler(stakingRouterAddress);
    const isStakingRouterHandler2 = await bonusGmxTracker.isHandler(stakingRouterAddress);
    const isStakingRouterHandler3 = await feeGmxTracker.isHandler(stakingRouterAddress);
    
    console.log("Handler Status:");
    console.log(`- StakingRouter on StakedGmxTracker: ${isStakingRouterHandler1}`);
    console.log(`- StakingRouter on BonusGmxTracker: ${isStakingRouterHandler2}`);
    console.log(`- StakingRouter on FeeGmxTracker: ${isStakingRouterHandler3}`);
    
    // Verify deposit token
    const isAmpDepositToken = await stakedGmxTracker.isDepositToken(ampTokenAddress);
    console.log(`\nAMP registered as deposit token: ${isAmpDepositToken}`);
    
    // Verify swap ratio
    const swapRatio = await swapRouter.swapRatio();
    console.log(`\nSwap ratio configured: ${swapRatio.toString()} (10000 = 1:1)`);
    
    console.log("\n=== Configuration Complete ===");
    console.log("The AMPED system is now configured and ready for use!");
    console.log("\nRemaining manual steps:");
    console.log("1. Transfer AMPED tokens to SwapRouter for AMPED->AMP swaps");
    console.log("2. Ensure AMP tokens are in SwapRouter for AMP->AMPED swaps");
    console.log("3. Test with small amounts before enabling for users");
    console.log("4. Set up monitoring for liquidity levels");
    
  } catch (error) {
    console.error("Configuration failed:", error);
    throw error;
  }
}

module.exports = {
  configureAmpedSystem,
};

// If running directly
if (require.main === module) {
  configureAmpedSystem()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}