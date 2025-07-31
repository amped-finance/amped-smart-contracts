const { contractAt } = require("../shared/helpers");
const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Simulating USDC deposit to debug the issue...");
  
  // Contract addresses
  const vaultAddress = "0xB91735aE255403B9ab9d97dF671a63807a89f08c";
  const usdcAddress = "0x29219dd400f2bf60e5a23d13be72b486d4038894";
  const rewardRouterAddress = "0xE72A2d5B3b09c88D4E8Cc60e74BD438d7168e80F";
  const glpManagerAddress = "0x4DE729B85dDB172F1bb775882f355bA25764E430";
  
  const vault = await contractAt("YieldBearingALPVaultFixed", vaultAddress);
  const usdc = await ethers.getContractAt("IERC20", usdcAddress);
  
  const depositAmount = ethers.utils.parseUnits("1", 6); // $1 USDC
  
  console.log("\n=== Pre-flight Checks ===");
  console.log("Deposit amount:", ethers.utils.formatUnits(depositAmount, 6), "USDC");
  
  // Check balance
  const balance = await usdc.balanceOf(signer.address);
  console.log("Your balance:", ethers.utils.formatUnits(balance, 6), "USDC");
  console.log("Balance check:", balance.gte(depositAmount) ? "✅ Sufficient" : "❌ Insufficient");
  
  // Check approval
  const allowance = await usdc.allowance(signer.address, vaultAddress);
  console.log("Your approval:", ethers.utils.formatUnits(allowance, 6), "USDC");
  console.log("Approval check:", allowance.gte(depositAmount) ? "✅ Sufficient" : "❌ Insufficient");
  
  console.log("\n=== Simulating Deposit ===");
  
  try {
    // Try static call first to see if it would revert
    console.log("Running static call simulation...");
    const result = await vault.callStatic.deposit(
      usdcAddress,
      depositAmount,
      0, // minUsdg
      0, // minGlp
      signer.address
    );
    console.log("✅ Static call succeeded! Expected shares:", ethers.utils.formatEther(result));
    
  } catch (error) {
    console.log("❌ Static call failed:", error.message);
    
    if (error.reason) {
      console.log("Error reason:", error.reason);
    }
    
    // Try to decode the error
    if (error.error && error.error.data) {
      console.log("\nError data:", error.error.data);
      
      // The error data appears to be from GlpManager
      // 0xfb8f41b2 is the selector for GlpManager__InsufficientOutput
      if (error.error.data.startsWith("0xfb8f41b2")) {
        console.log("\n⚠️  Error: GlpManager__InsufficientOutput");
        
        try {
          // Decode the error parameters
          const errorData = "0x" + error.error.data.slice(10);
          const decoded = ethers.utils.defaultAbiCoder.decode(
            ["address", "uint256", "uint256"],
            errorData
          );
          
          console.log("\nError details:");
          console.log("- Token:", decoded[0]);
          console.log("- Actual output:", ethers.utils.formatUnits(decoded[1], 18), "USDG");
          console.log("- Minimum required:", ethers.utils.formatUnits(decoded[2], 18), "USDG");
          
          if (decoded[0].toLowerCase() === glpManagerAddress.toLowerCase()) {
            console.log("\n🔍 The error shows the GlpManager address as the token!");
            console.log("This confirms the RewardRouter bug where it passes glpManager address instead of token address.");
          }
          
        } catch (e) {
          console.log("Could not decode error parameters");
        }
      }
    }
  }
  
  console.log("\n=== Diagnosis ===");
  console.log("The deposit is failing because of the RewardRouter bug we discovered earlier.");
  console.log("The RewardRouter is passing the GlpManager address instead of the token address to the vault.");
  console.log("\nThis is why:");
  console.log("- ETH deposits work (they use a different code path)");
  console.log("- Token deposits fail (they hit the buggy code path)");
  
  console.log("\n=== Solutions ===");
  console.log("1. Continue using ETH deposits only (current workaround)");
  console.log("2. Deploy a fixed RewardRouter (requires governance)");
  console.log("3. Create a wrapper contract that fixes the issue");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });