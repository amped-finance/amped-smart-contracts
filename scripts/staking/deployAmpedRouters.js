const { deployContract, contractAt, writeTmpAddresses, getFrameSigner } = require("../shared/helpers");
const { expandDecimals } = require("../shared/helpers");

async function deployAmpedRouters() {
  console.log("Starting AMPED router contracts deployment on Sonic...");
  
  // Get the proper signer (Frame signer if USE_FRAME_SIGNER=true)
  const signer = await getFrameSigner();
  console.log("Using signer:", await signer.getAddress());
  
  // Check for command line arguments
  const args = process.argv.slice(2);
  let ampedTokenAddress = "";
  
  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--amped' && i + 1 < args.length) {
      ampedTokenAddress = args[i + 1];
    }
  }
  
  const startTime = Date.now();
  const deploymentLog = {
    network: "sonic",
    chainId: 146,
    startTime,
    contracts: {},
    transactions: [],
  };

  try {
    // Load existing deployment addresses
    const network = "sonic";
    const deployData = require("../deploy-sonic.json");
    
    // Get required addresses from sonic deployment
    // The deploy-sonic.json file contains an array of objects with name/imple properties
    const getAddress = (name) => {
      const item = deployData.find(d => d.name === name);
      return item ? item.imple : null;
    };
    
    const rewardRouter = getAddress("RewardRouterV2");
    const weth = getAddress("ws") || getAddress("WS") || "0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38"; // WS is wrapped Sonic
    const glpManager = getAddress("GlpManager");
    
    // These addresses need to be provided
    const ampedToken = ampedTokenAddress || process.env.AMPED_TOKEN_ADDRESS || ""; // Set after AMPED token deployment
    const ampToken = process.env.AMP_TOKEN_ADDRESS || getAddress("GMX") || ""; // The main AMP token address (already deployed)
    const esAmpToken = getAddress("EsGMX") || getAddress("esAMP");
    
    // Get RewardTracker addresses
    const stakedGmxTrackerAddress = getAddress("RewardTrackerStakedGMX");
    const bonusGmxTrackerAddress = getAddress("RewardTrackerStakedBonusGMX");
    const feeGmxTrackerAddress = getAddress("RewardTrackerStakedBonusFeeGMX");
    
    console.log("Using addresses:");
    console.log("- AMPED Token:", ampedToken);
    console.log("- AMP Token:", ampToken);
    console.log("- esAMP Token:", esAmpToken);
    console.log("- Reward Router:", rewardRouter);
    console.log("- Wrapped Sonic (WS):", weth);
    console.log("- StakedGmxTracker:", stakedGmxTrackerAddress);
    console.log("- BonusGmxTracker:", bonusGmxTrackerAddress);
    console.log("- FeeGmxTracker:", feeGmxTrackerAddress);
    
    if (!ampedToken) {
      console.error("\nERROR: AMPED token address is required!");
      console.error("\nYou can provide it in one of these ways:");
      console.error("1. As a command line argument:");
      console.error("   npx hardhat run scripts/staking/deployAmpedRouters.js --network sonic -- --amped 0xYourAmpedTokenAddress");
      console.error("\n2. As an environment variable:");
      console.error("   AMPED_TOKEN_ADDRESS=0xYourAmpedTokenAddress npx hardhat run scripts/staking/deployAmpedRouters.js --network sonic");
      console.error("\n3. In your .env file (add this line):");
      console.error("   AMPED_TOKEN_ADDRESS=0xYourAmpedTokenAddress");
      console.error("\nNote: You need to deploy the AMPED token first before deploying the routers.");
      throw new Error("AMPED_TOKEN_ADDRESS must be set");
    }
    
    if (!ampToken) {
      throw new Error("AMP_TOKEN_ADDRESS must be set (use existing AMP token address)");
    }

    // Deploy AmpedSwapRouter
    console.log("\nDeploying AmpedSwapRouter...");
    const swapRouter = await deployContract("AmpedSwapRouter", [], "AmpedSwapRouter", {}, undefined, signer);
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
    
    // Deploy AmpedStakingRouter
    console.log("\nDeploying AmpedStakingRouter...");
    const stakingRouter = await deployContract("AmpedStakingRouter", [], "AmpedStakingRouter", {}, undefined, signer);
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
    
    // Deploy AmpedRewardsRouter
    console.log("\nDeploying AmpedRewardsRouter...");
    const rewardsRouter = await deployContract("AmpedRewardsRouter", [], "AmpedRewardsRouter", {}, undefined, signer);
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
    
    // Set reward trackers on RewardsRouter
    console.log("Setting reward trackers on AmpedRewardsRouter...");
    await rewardsRouter.setRewardTrackers(
      getAddress("VesterGMX") || getAddress("Vester"),
      getAddress("VesterGLP"),
      getAddress("RewardTrackerStakedGMX"),
      getAddress("RewardTrackerStakedBonusGMX"),
      getAddress("RewardTrackerStakedBonusFeeGMX"),
      getAddress("RewardTrackerFeeStakedGLP"),
      getAddress("RewardTrackerFeeGLP")
    );
    
    // Set reward trackers on StakingRouter
    console.log("Setting reward trackers on AmpedStakingRouter...");
    await stakingRouter.setRewardTrackers(
      stakedGmxTrackerAddress,
      bonusGmxTrackerAddress,
      feeGmxTrackerAddress
    );
    
    // Set handlers
    console.log("\nSetting handlers...");
    
    // SwapRouter as handler for StakingRouter and RewardsRouter
    await swapRouter.setHandler(stakingRouter.address, true);
    await swapRouter.setHandler(rewardsRouter.address, true);
    
    // StakingRouter as handler for RewardTrackers
    console.log("Setting StakingRouter as handler on RewardTrackers...");
    const stakedGmxTracker = await contractAt("RewardTracker", stakedGmxTrackerAddress, signer);
    const bonusGmxTracker = await contractAt("RewardTracker", bonusGmxTrackerAddress, signer);
    const feeGmxTracker = await contractAt("RewardTracker", feeGmxTrackerAddress, signer);
    
    await stakedGmxTracker.setHandler(stakingRouter.address, true);
    await bonusGmxTracker.setHandler(stakingRouter.address, true);
    await feeGmxTracker.setHandler(stakingRouter.address, true);
    
    // Store deployment addresses
    const addresses = {
      AmpedSwapRouter: swapRouter.address,
      AmpedStakingRouter: stakingRouter.address,
      AmpedRewardsRouter: rewardsRouter.address,
    };
    // Note: writeTmpAddresses is not available, but addresses are saved in deployment log below

    // Save deployment log
    deploymentLog.endTime = Date.now();
    deploymentLog.duration = deploymentLog.endTime - deploymentLog.startTime;
    
    const fs = require('fs');
    const deploymentFileName = `scripts/staking/amped-routers-deployment-sonic-${startTime}.json`;
    fs.writeFileSync(deploymentFileName, JSON.stringify(deploymentLog, null, 2));
    console.log(`\nDeployment log saved to: ${deploymentFileName}`);

    console.log("\n=== AMPED Routers Deployment Summary ===");
    console.log(`Network: Sonic (Chain ID: 146)`);
    console.log(`AmpedSwapRouter: ${swapRouter.address}`);
    console.log(`AmpedStakingRouter: ${stakingRouter.address}`);
    console.log(`AmpedRewardsRouter: ${rewardsRouter.address}`);
    
    console.log("\n=== CRITICAL Post-Deployment Steps ===");
    console.log("MUST DO - These steps are required for the system to work:");
    console.log("");
    console.log("1. Fund SwapRouter with AMP tokens:");
    console.log("   - Bridge AMP tokens from source chain");
    console.log("   - Transfer sufficient AMP to SwapRouter for liquidity");
    console.log(`   - SwapRouter address: ${swapRouter.address}`);
    console.log("");
    console.log("2. Configure Handler Permissions:");
    console.log("   // Make StakingRouter a handler on all RewardTrackers");
    console.log(`   await stakedGmxTracker.setHandler("${stakingRouter.address}", true); // ALREADY DONE IN SCRIPT`);
    console.log(`   await bonusGmxTracker.setHandler("${stakingRouter.address}", true); // ALREADY DONE IN SCRIPT`);
    console.log(`   await feeGmxTracker.setHandler("${stakingRouter.address}", true); // ALREADY DONE IN SCRIPT`);
    console.log("");
    console.log("3. Register AMP as Deposit Token:");
    console.log("   // Register AMP token on stakedGmxTracker");
    console.log(`   await stakedGmxTracker.setDepositToken(ampToken.address, true);`);
    console.log("");
    console.log("4. Configure SwapRouter:");
    console.log("   // Set swap ratio (10000 = 1:1)");
    console.log(`   await swapRouter.setSwapRatio(10000);`);
    console.log("   // Deposit liquidity");
    console.log(`   await ampToken.approve(swapRouter.address, liquidityAmount);`);
    console.log(`   await swapRouter.depositTokens(ampToken.address, liquidityAmount);`);
    console.log("");
    console.log("5. Make SwapRouter handlers for StakingRouter and RewardsRouter (already done)");
    console.log("");
    console.log("6. Verify all contracts on Sonic explorer");
    console.log("7. Test all flows with small amounts before enabling for users");
    console.log("");
    console.log("WITHOUT THESE STEPS, THE SYSTEM WILL NOT WORK!");

    return addresses;
  } catch (error) {
    console.error("Deployment failed:", error);
    deploymentLog.error = error.toString();
    deploymentLog.endTime = Date.now();
    deploymentLog.duration = deploymentLog.endTime - deploymentLog.startTime;
    
    const fs = require('fs');
    const deploymentFileName = `scripts/staking/amped-routers-deployment-sonic-failed-${startTime}.json`;
    fs.writeFileSync(deploymentFileName, JSON.stringify(deploymentLog, null, 2));
    
    throw error;
  }
}

module.exports = {
  deployAmpedRouters,
};

// If running directly
if (require.main === module) {
  deployAmpedRouters()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}