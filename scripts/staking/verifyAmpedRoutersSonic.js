const { verifyContract } = require("../shared/helpers");
const { run } = require("hardhat");

async function verifyAmpedRoutersSonic() {
  console.log("Starting AMPED router contracts verification on Sonic...");
  
  // Contract addresses from deployment
  const contracts = {
    AmpedSwapRouter: process.env.AMPED_SWAP_ROUTER || "0x1D4Ab8Cc7552F76654Cfae4155854E5235aCc3Bc",
    AmpedStakingRouter: process.env.AMPED_STAKING_ROUTER || "0xD6D8735492C19BDd70c0b929240129475135A15E",
    AmpedRewardsRouter: process.env.AMPED_REWARDS_ROUTER || "0x0296C7d4070C3A3577EF4Ee8c79A7334D03cc3BB"
  };
  
  console.log("\nVerifying contracts on Sonic (Chain ID: 146):");
  console.log("- AmpedSwapRouter:", contracts.AmpedSwapRouter);
  console.log("- AmpedStakingRouter:", contracts.AmpedStakingRouter);
  console.log("- AmpedRewardsRouter:", contracts.AmpedRewardsRouter);
  console.log("\nBlock Explorer: https://sonicscan.org");
  
  const verificationResults = {
    success: [],
    failed: []
  };
  
  // Verify AmpedSwapRouter
  try {
    console.log("\n1. Verifying AmpedSwapRouter...");
    await verifyContract("AmpedSwapRouter", contracts.AmpedSwapRouter, "contracts/staking/AmpedSwapRouter.sol:AmpedSwapRouter", []);
    console.log("✅ AmpedSwapRouter verified successfully");
    console.log(`   View on Sonicscan: https://sonicscan.org/address/${contracts.AmpedSwapRouter}#code`);
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
    console.log(`   View on Sonicscan: https://sonicscan.org/address/${contracts.AmpedStakingRouter}#code`);
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
    console.log(`   View on Sonicscan: https://sonicscan.org/address/${contracts.AmpedRewardsRouter}#code`);
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
    console.log("1. Make sure SONIC_API_KEY is set in your .env file");
    console.log("2. Wait a few minutes after deployment before verifying");
    console.log("3. Check if the contracts are already verified on Sonicscan");
    console.log("4. Try manual verification using:");
    console.log("   npx hardhat verify --network sonic CONTRACT_ADDRESS");
    console.log("\nManual verification commands:");
    console.log(`   npx hardhat verify --network sonic ${contracts.AmpedSwapRouter}`);
    console.log(`   npx hardhat verify --network sonic ${contracts.AmpedStakingRouter}`);
    console.log(`   npx hardhat verify --network sonic ${contracts.AmpedRewardsRouter}`);
  }
  
  // Save verification results
  const fs = require('fs');
  const timestamp = Date.now();
  const resultsFileName = `scripts/staking/verification-results-sonic-${timestamp}.json`;
  fs.writeFileSync(resultsFileName, JSON.stringify({
    timestamp,
    network: "sonic",
    chainId: 146,
    blockExplorer: "https://sonicscan.org",
    contracts,
    results: verificationResults
  }, null, 2));
  
  console.log(`\nVerification results saved to: ${resultsFileName}`);
  
  // Display direct links to view contracts
  console.log("\n=== Direct Links to View Contracts ===");
  console.log(`AmpedSwapRouter: https://sonicscan.org/address/${contracts.AmpedSwapRouter}`);
  console.log(`AmpedStakingRouter: https://sonicscan.org/address/${contracts.AmpedStakingRouter}`);
  console.log(`AmpedRewardsRouter: https://sonicscan.org/address/${contracts.AmpedRewardsRouter}`);
}

module.exports = {
  verifyAmpedRoutersSonic,
};

// If running directly
if (require.main === module) {
  verifyAmpedRoutersSonic()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
} 