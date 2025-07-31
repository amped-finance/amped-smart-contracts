const { contractAt } = require("../shared/helpers");
const { ethers } = require("hardhat");

async function main() {
  console.log("Checking WETH configuration in deployed vaults...\n");
  
  // Vault addresses
  const vaults = {
    "Original vault": "0xd2e4b0cC3FB79ef958137206cbEd94C7a5C7972d",
    "New vault (MIT)": "0x3B6246d98787FB2da1de69E2614F3e70caE2aD64"
  };
  
  // Token addresses from deploy-sonic.json
  const WS = "0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38"; // Wrapped Sonic (native)
  const WETH = "0x50c42dEAcD8Fc9773493ED674b675bE577f2634b"; // WETH (bridged?)
  
  console.log("Expected tokens:");
  console.log("- WS (Wrapped Sonic):", WS);
  console.log("- WETH (from config):", WETH);
  
  for (const [name, address] of Object.entries(vaults)) {
    console.log(`\n=== ${name} ===`);
    console.log("Address:", address);
    
    try {
      const vault = await contractAt("YieldBearingALPVault", address);
      const wethAddress = await vault.weth();
      
      console.log("Configured WETH:", wethAddress);
      
      if (wethAddress.toLowerCase() === WS.toLowerCase()) {
        console.log("✅ Vault is correctly configured with WS (Wrapped Sonic)");
      } else if (wethAddress.toLowerCase() === WETH.toLowerCase()) {
        console.log("⚠️  Vault is configured with WETH - this may cause issues if fees are distributed as WS");
      } else {
        console.log("❌ Vault is configured with unknown token:", wethAddress);
      }
    } catch (error) {
      console.log("Error reading vault:", error.message);
    }
  }
  
  // Check what token the reward router distributes
  console.log("\n=== Checking Reward Distribution ===");
  const rewardRouter = "0xE72A2d5B3b09c88D4E8Cc60e74BD438d7168e80F";
  console.log("RewardRouter:", rewardRouter);
  
  // The reward router likely has fee trackers that distribute rewards
  // We need to check what token they distribute
  console.log("\nTo properly fix this issue, we need to:");
  console.log("1. Deploy a new vault with WS as the wrapped native token");
  console.log("2. Ensure depositETH converts ETH to WS (not WETH)");
  console.log("3. Ensure compound function claims WS rewards");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });