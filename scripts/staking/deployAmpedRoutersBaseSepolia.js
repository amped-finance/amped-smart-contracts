const { deployContract, contractAt, verifyContract } = require("../shared/helpers");
const { expandDecimals } = require("../shared/helpers");

async function deployAmpedRoutersBaseSepolia() {
  console.log("Starting AMPED router contracts deployment on Base Sepolia...");
  
  const startTime = Date.now();
  const deploymentLog = {
    network: "basesepolia",
    chainId: 84532,
    startTime,
    contracts: {},
    transactions: [],
  };

  try {
    // Load existing deployment addresses from Base Sepolia
    const deployData = require("../deploy-basesepolia.json");
    const deployMap = {};
    deployData.forEach(item => {
      deployMap[item.name] = item.imple;
    });
    
    // Get required addresses from base sepolia deployment
    const rewardRouter = deployMap.RewardRouterV2;
    const weth = deployMap.weth || deployMap.nativeToken;
    const glpManager = deployMap.GlpManager;
    
    // Provided addresses for Base Sepolia
    const ampedToken = "0x0737f1ec667aea0eb45480bdec3aa9747fea38d6"; // AMPED token on Base Sepolia (corrected)
    const ampToken = "0xd1Af6E098F7ee3282578862C3285F754D0128a6f"; // AMP token on Base Sepolia (same as GMX in deployment)
    const esAmpToken = deployMap.EsGMX || deployMap.esAMP;
    
    // Get reward tracker addresses
    const stakedGmxTracker = deployMap.RewardTrackerStakedGMX;
    const bonusGmxTracker = deployMap.RewardTrackerStakedBonusGMX;
    const feeGmxTracker = deployMap.RewardTrackerStakedBonusFeeGMX;
    const stakedGlpTracker = deployMap.RewardTrackerFeeStakedGLP;
    const feeGlpTracker = deployMap.RewardTrackerFeeGLP;
    const gmxVester = deployMap.VesterGMX;
    const glpVester = deployMap.VesterGLP;
    
    console.log("Using addresses:");
    console.log("- AMPED Token:", ampedToken);
    console.log("- AMP Token:", ampToken);
    console.log("- esAMP Token:", esAmpToken);
    console.log("- Reward Router:", rewardRouter);
    console.log("- WETH:", weth);
    console.log("- GLP Manager:", glpManager);
    console.log("\nReward Trackers:");
    console.log("- Staked GMX Tracker:", stakedGmxTracker);
    console.log("- Bonus GMX Tracker:", bonusGmxTracker);
    console.log("- Fee GMX Tracker:", feeGmxTracker);
    console.log("- Staked GLP Tracker:", stakedGlpTracker);
    console.log("- Fee GLP Tracker:", feeGlpTracker);

    // Deploy AmpedSwapRouter
    console.log("\nDeploying AmpedSwapRouter...");
    const swapRouter = await deployContract("AmpedSwapRouter", [], "AmpedSwapRouter");
    deploymentLog.contracts.AmpedSwapRouter = swapRouter.address;
    console.log(`AmpedSwapRouter deployed at: ${swapRouter.address}`);
    
    // Initialize SwapRouter
    console.log("Initializing AmpedSwapRouter...");
    await swapRouter.initialize(
      ampedToken,
      ampToken,
      "0x0000000000000000000000000000000000000000", // External DEX router (set later if needed)
      "0x0000000000000000000000000000000000000000"  // Price oracle (set later if needed)
    );
    console.log("AmpedSwapRouter initialized");
    
    // Deploy AmpedStakingRouter
    console.log("\nDeploying AmpedStakingRouter...");
    const stakingRouter = await deployContract("AmpedStakingRouter", [], "AmpedStakingRouter");
    deploymentLog.contracts.AmpedStakingRouter = stakingRouter.address;
    console.log(`AmpedStakingRouter deployed at: ${stakingRouter.address}`);
    
    // Initialize StakingRouter
    console.log("Initializing AmpedStakingRouter...");
    await stakingRouter.initialize(
      ampedToken,
      ampToken,
      rewardRouter,
      swapRouter.address,
      weth
    );
    console.log("AmpedStakingRouter initialized");
    
    // Deploy AmpedRewardsRouter
    console.log("\nDeploying AmpedRewardsRouter...");
    const rewardsRouter = await deployContract("AmpedRewardsRouter", [], "AmpedRewardsRouter");
    deploymentLog.contracts.AmpedRewardsRouter = rewardsRouter.address;
    console.log(`AmpedRewardsRouter deployed at: ${rewardsRouter.address}`);
    
    // Initialize RewardsRouter
    console.log("Initializing AmpedRewardsRouter...");
    await rewardsRouter.initialize(
      ampedToken,
      ampToken,
      esAmpToken,
      weth,
      rewardRouter,
      swapRouter.address
    );
    console.log("AmpedRewardsRouter initialized");
    
    // Set reward trackers on RewardsRouter
    console.log("\nSetting reward trackers on AmpedRewardsRouter...");
    await rewardsRouter.setRewardTrackers(
      gmxVester,
      glpVester,
      stakedGmxTracker,
      bonusGmxTracker,
      feeGmxTracker,
      stakedGlpTracker,
      feeGlpTracker
    );
    console.log("Reward trackers set on AmpedRewardsRouter");
    
    // Set reward trackers on StakingRouter
    console.log("\nSetting reward trackers on AmpedStakingRouter...");
    await stakingRouter.setRewardTrackers(
      stakedGmxTracker,
      bonusGmxTracker,
      feeGmxTracker
    );
    console.log("Reward trackers set on AmpedStakingRouter");
    
    // Set handlers
    console.log("\nSetting handlers...");
    
    // SwapRouter as handler for StakingRouter and RewardsRouter
    await swapRouter.setHandler(stakingRouter.address, true);
    console.log(`Set ${stakingRouter.address} as handler on SwapRouter`);
    
    await swapRouter.setHandler(rewardsRouter.address, true);
    console.log(`Set ${rewardsRouter.address} as handler on SwapRouter`);
    
    // Store deployment addresses
    const addresses = {
      AmpedSwapRouter: swapRouter.address,
      AmpedStakingRouter: stakingRouter.address,
      AmpedRewardsRouter: rewardsRouter.address,
    };
    
    // Add to deployment log
    deploymentLog.contracts = addresses;
    
    // Contract Verification
    console.log("\n=== Starting Contract Verification ===");
    
    try {
      // Verify AmpedSwapRouter
      console.log("\nVerifying AmpedSwapRouter...");
      await verifyContract("AmpedSwapRouter", swapRouter.address, "contracts/staking/AmpedSwapRouter.sol:AmpedSwapRouter", []);
      console.log("AmpedSwapRouter verified successfully");
    } catch (error) {
      console.log("AmpedSwapRouter verification failed:", error.message);
    }
    
    try {
      // Verify AmpedStakingRouter
      console.log("\nVerifying AmpedStakingRouter...");
      await verifyContract("AmpedStakingRouter", stakingRouter.address, "contracts/staking/AmpedStakingRouter.sol:AmpedStakingRouter", []);
      console.log("AmpedStakingRouter verified successfully");
    } catch (error) {
      console.log("AmpedStakingRouter verification failed:", error.message);
    }
    
    try {
      // Verify AmpedRewardsRouter
      console.log("\nVerifying AmpedRewardsRouter...");
      await verifyContract("AmpedRewardsRouter", rewardsRouter.address, "contracts/staking/AmpedRewardsRouter.sol:AmpedRewardsRouter", []);
      console.log("AmpedRewardsRouter verified successfully");
    } catch (error) {
      console.log("AmpedRewardsRouter verification failed:", error.message);
    }

    // Save deployment log
    deploymentLog.endTime = Date.now();
    deploymentLog.duration = deploymentLog.endTime - deploymentLog.startTime;
    deploymentLog.success = true;
    
    const fs = require('fs');
    const deploymentFileName = `scripts/staking/amped-routers-deployment-basesepolia-${startTime}.json`;
    fs.writeFileSync(deploymentFileName, JSON.stringify(deploymentLog, null, 2));
    console.log(`\nDeployment log saved to: ${deploymentFileName}`);

    console.log("\n=== AMPED Routers Deployment Summary ===");
    console.log(`Network: Base Sepolia (Chain ID: 84532)`);
    console.log(`AmpedSwapRouter: ${swapRouter.address}`);
    console.log(`AmpedStakingRouter: ${stakingRouter.address}`);
    console.log(`AmpedRewardsRouter: ${rewardsRouter.address}`);
    
    console.log("\n=== CRITICAL Post-Deployment Steps ===");
    console.log("MUST DO - These steps are required for the system to work:");
    console.log("");
    console.log("1. Fund SwapRouter with AMP tokens:");
    console.log("   - Transfer sufficient AMP tokens to SwapRouter for liquidity");
    console.log(`   - SwapRouter address: ${swapRouter.address}`);
    console.log(`   - AMP token address: ${ampToken}`);
    console.log("");
    console.log("2. Configure Handler Permissions on Reward Trackers:");
    console.log("   // Make StakingRouter a handler on all RewardTrackers");
    console.log(`   // Run these commands using the contract owner account:`);
    console.log(`   const stakedGmxTracker = await contractAt("RewardTracker", "${stakedGmxTracker}");`);
    console.log(`   const bonusGmxTracker = await contractAt("RewardTracker", "${bonusGmxTracker}");`);
    console.log(`   const feeGmxTracker = await contractAt("RewardTracker", "${feeGmxTracker}");`);
    console.log(`   await stakedGmxTracker.setHandler("${stakingRouter.address}", true);`);
    console.log(`   await bonusGmxTracker.setHandler("${stakingRouter.address}", true);`);
    console.log(`   await feeGmxTracker.setHandler("${stakingRouter.address}", true);`);
    console.log("");
    console.log("3. Register AMP as Deposit Token (if not already done):");
    console.log("   // Register AMP token on stakedGmxTracker");
    console.log(`   await stakedGmxTracker.setDepositToken("${ampToken}", true);`);
    console.log("");
    console.log("4. Configure SwapRouter:");
    console.log("   // Set swap ratio (10000 = 1:1)");
    console.log(`   const ampedSwapRouter = await contractAt("AmpedSwapRouter", "${swapRouter.address}");`);
    console.log(`   await ampedSwapRouter.setSwapRatio(10000); // 1:1 ratio`);
    console.log("");
    console.log("   // Deposit AMP liquidity for swaps");
    console.log(`   const ampTokenContract = await contractAt("Token", "${ampToken}");`);
    console.log(`   const liquidityAmount = ethers.utils.parseEther("10000"); // Example: 10,000 AMP`);
    console.log(`   await ampTokenContract.approve("${swapRouter.address}", liquidityAmount);`);
    console.log(`   await ampedSwapRouter.depositTokens("${ampToken}", liquidityAmount);`);
    console.log("");
    console.log("5. Set appropriate permissions and ownership:");
    console.log("   - Transfer ownership of routers to multisig or governance");
    console.log("   - Set appropriate handlers if needed");
    console.log("");
    console.log("6. Verify all contracts on Base Sepolia Etherscan:");
    console.log(`   - AmpedSwapRouter: ${swapRouter.address}`);
    console.log(`   - AmpedStakingRouter: ${stakingRouter.address}`);
    console.log(`   - AmpedRewardsRouter: ${rewardsRouter.address}`);
    console.log("");
    console.log("7. Test all flows with small amounts:");
    console.log("   - Test AMPED -> AMP swaps");
    console.log("   - Test staking AMPED tokens");
    console.log("   - Test claiming rewards");
    console.log("");
    console.log("WITHOUT THESE STEPS, THE SYSTEM WILL NOT WORK!");

    return addresses;
  } catch (error) {
    console.error("Deployment failed:", error);
    deploymentLog.error = error.toString();
    deploymentLog.endTime = Date.now();
    deploymentLog.duration = deploymentLog.endTime - deploymentLog.startTime;
    deploymentLog.success = false;
    
    const fs = require('fs');
    const deploymentFileName = `scripts/staking/amped-routers-deployment-basesepolia-failed-${startTime}.json`;
    fs.writeFileSync(deploymentFileName, JSON.stringify(deploymentLog, null, 2));
    
    throw error;
  }
}

module.exports = {
  deployAmpedRoutersBaseSepolia,
};

// If running directly
if (require.main === module) {
  deployAmpedRoutersBaseSepolia()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}