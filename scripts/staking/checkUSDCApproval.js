const { contractAt } = require("../shared/helpers");
const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Checking USDC approvals for account:", signer.address);
  
  // Contract addresses
  const vaultAddress = "0xB91735aE255403B9ab9d97dF671a63807a89f08c"; // Fixed vault
  const rewardRouterAddress = "0xE72A2d5B3b09c88D4E8Cc60e74BD438d7168e80F";
  const usdcAddress = "0x29219dd400f2bf60e5a23d13be72b486d4038894";
  
  const usdc = await ethers.getContractAt("IERC20", usdcAddress);
  
  console.log("\n=== USDC Token Info ===");
  const usdcBalance = await usdc.balanceOf(signer.address);
  console.log("Your USDC balance:", ethers.utils.formatUnits(usdcBalance, 6), "USDC");
  
  console.log("\n=== Checking Approvals ===");
  
  // Check approval to vault
  const vaultAllowance = await usdc.allowance(signer.address, vaultAddress);
  console.log("\nYour approval to YieldBearingALPVault:");
  console.log("- Address:", vaultAddress);
  console.log("- Allowance:", ethers.utils.formatUnits(vaultAllowance, 6), "USDC");
  console.log("- Status:", vaultAllowance.gt(0) ? "✅ Approved" : "❌ Not approved");
  
  // Check approval to RewardRouter
  const routerAllowance = await usdc.allowance(signer.address, rewardRouterAddress);
  console.log("\nYour approval to RewardRouter:");
  console.log("- Address:", rewardRouterAddress);
  console.log("- Allowance:", ethers.utils.formatUnits(routerAllowance, 6), "USDC");
  console.log("- Status:", routerAllowance.gt(0) ? "✅ Approved" : "❌ Not approved");
  
  // Check vault's approval to RewardRouter
  const vaultToRouterAllowance = await usdc.allowance(vaultAddress, rewardRouterAddress);
  console.log("\nVault's approval to RewardRouter:");
  console.log("- Vault:", vaultAddress);
  console.log("- RewardRouter:", rewardRouterAddress);
  console.log("- Allowance:", ethers.utils.formatUnits(vaultToRouterAllowance, 6), "USDC");
  console.log("- Status:", vaultToRouterAllowance.gt(0) ? "✅ Approved" : "❌ Not approved");
  
  console.log("\n=== How Approvals Work ===");
  console.log("1. You approve the vault to take your USDC");
  console.log("2. The vault transfers USDC from you to itself");
  console.log("3. The vault approves RewardRouter (this happens automatically in the contract)");
  console.log("4. The vault calls mintAndStakeGlp on RewardRouter");
  
  console.log("\n=== Setting Approval if Needed ===");
  
  if (vaultAllowance.eq(0)) {
    console.log("\nYou need to approve the vault to spend your USDC!");
    console.log("Let's approve 10 USDC for testing...");
    
    try {
      const approveAmount = ethers.utils.parseUnits("10", 6); // 10 USDC
      const tx = await usdc.approve(vaultAddress, approveAmount);
      console.log("Approval transaction sent:", tx.hash);
      await tx.wait();
      console.log("✅ Approval confirmed!");
      
      // Check new allowance
      const newAllowance = await usdc.allowance(signer.address, vaultAddress);
      console.log("New allowance:", ethers.utils.formatUnits(newAllowance, 6), "USDC");
      
    } catch (error) {
      console.log("❌ Approval failed:", error.message);
    }
  } else {
    console.log("\n✅ You already have approval set for the vault!");
    console.log("Current approval:", ethers.utils.formatUnits(vaultAllowance, 6), "USDC");
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });