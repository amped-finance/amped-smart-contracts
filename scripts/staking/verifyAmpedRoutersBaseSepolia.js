const { verifyContract } = require("../shared/helpers");
const { run } = require("hardhat");

async function verifyAmpedRoutersBaseSepolia() {
  console.log("Starting AMPED router contracts verification on Base Sepolia...");
  
  // Contract addresses from deployment
  const contracts = {
    AmpedSwapRouter: process.env.AMPED_SWAP_ROUTER || "",
    AmpedStakingRouter: process.env.AMPED_STAKING_ROUTER || "",
    AmpedRewardsRouter: process.env.AMPED_REWARDS_ROUTER || ""
  };
  
  // Check if addresses are provided
  if (!contracts.AmpedSwapRouter || !contracts.AmpedStakingRouter || !contracts.AmpedRewardsRouter) {
    console.log("\nNo addresses provided via environment variables.");
    console.log("Using deployed addresses from recent deployment...");
    
    // Using the addresses from your deployment
    contracts.AmpedSwapRouter = "0x3B77EAEDa0F83b1447bda1CA92284644FefF8C56";
    contracts.AmpedStakingRouter = "0x11378C639C9F4b7A827Dfccb31C178db6e69044D";
    contracts.AmpedRewardsRouter = "0x757bCe8ed0D81CbF7705C154F295C366253bFd6E";
  }
  
  console.log("\nVerifying contracts:");
  console.log("- AmpedSwapRouter:", contracts.AmpedSwapRouter);
  console.log("- AmpedStakingRouter:", contracts.AmpedStakingRouter);
  console.log("- AmpedRewardsRouter:", contracts.AmpedRewardsRouter);
  
  const verificationResults = {
    success: [],
    failed: []
  };
  
  // Verify AmpedSwapRouter
  try {
    console.log("\n1. Verifying AmpedSwapRouter...");
    await verifyContract("AmpedSwapRouter", contracts.AmpedSwapRouter, "contracts/staking/AmpedSwapRouter.sol:AmpedSwapRouter", []);
    console.log("✅ AmpedSwapRouter verified successfully");
    verificationResults.success.push("AmpedSwapRouter");
  } catch (error) {
    console.log("❌ AmpedSwapRouter verification failed:", error.message);
    verificationResults.failed.push({
      contract: "AmpedSwapRouter",
      error: error.message
    });
  }
  
  // Verify AmpedStakingRouter
  try {
    console.log("\n2. Verifying AmpedStakingRouter...");
    await verifyContract("AmpedStakingRouter", contracts.AmpedStakingRouter, "contracts/staking/AmpedStakingRouter.sol:AmpedStakingRouter", []);
    console.log("✅ AmpedStakingRouter verified successfully");
    verificationResults.success.push("AmpedStakingRouter");
  } catch (error) {
    console.log("❌ AmpedStakingRouter verification failed:", error.message);
    verificationResults.failed.push({
      contract: "AmpedStakingRouter",
      error: error.message
    });
  }
  
  // Verify AmpedRewardsRouter
  try {
    console.log("\n3. Verifying AmpedRewardsRouter...");
    await verifyContract("AmpedRewardsRouter", contracts.AmpedRewardsRouter, "contracts/staking/AmpedRewardsRouter.sol:AmpedRewardsRouter", []);
    console.log("✅ AmpedRewardsRouter verified successfully");
    verificationResults.success.push("AmpedRewardsRouter");
  } catch (error) {
    console.log("❌ AmpedRewardsRouter verification failed:", error.message);
    verificationResults.failed.push({
      contract: "AmpedRewardsRouter",
      error: error.message
    });
  }
  
  // Summary
  console.log("\n=== Verification Summary ===");
  console.log(`Successful: ${verificationResults.success.length}`);
  console.log(`Failed: ${verificationResults.failed.length}`);
  
  if (verificationResults.success.length > 0) {
    console.log("\n✅ Successfully verified:");
    verificationResults.success.forEach(contract => {
      console.log(`  - ${contract}`);
    });
  }
  
  if (verificationResults.failed.length > 0) {
    console.log("\n❌ Failed to verify:");
    verificationResults.failed.forEach(item => {
      console.log(`  - ${item.contract}: ${item.error}`);
    });
    
    console.log("\nTroubleshooting tips:");
    console.log("1. Make sure ETHERSCAN_API_KEY is set in your .env file");
    console.log("2. Wait a few minutes after deployment before verifying");
    console.log("3. Check if the contracts are already verified");
    console.log("4. Try manual verification using:");
    console.log("   npx hardhat verify --network basesepolia CONTRACT_ADDRESS");
  }
  
  // Save verification results
  const fs = require('fs');
  const timestamp = Date.now();
  const resultsFileName = `scripts/staking/verification-results-${timestamp}.json`;
  fs.writeFileSync(resultsFileName, JSON.stringify({
    timestamp,
    network: "basesepolia",
    contracts,
    results: verificationResults
  }, null, 2));
  
  console.log(`\nVerification results saved to: ${resultsFileName}`);
}

module.exports = {
  verifyAmpedRoutersBaseSepolia,
};

// If running directly
if (require.main === module) {
  verifyAmpedRoutersBaseSepolia()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}