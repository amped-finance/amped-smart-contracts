const { contractAt } = require("../shared/helpers");
const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Debugging stS deposit with account:", signer.address);
  
  // Contract addresses
  const vaultAddress = "0xB91735aE255403B9ab9d97dF671a63807a89f08c"; // Fixed vault
  const stSAddress = "0xE5DA20F15420aD15DE0fa650600aFc998bbE3955";
  const rewardRouterAddress = "0xE72A2d5B3b09c88D4E8Cc60e74BD438d7168e80F";
  const glpManagerAddress = "0x4DE729B85dDB172F1bb775882f355bA25764E430";
  
  const vault = await contractAt("YieldBearingALPVaultFixed", vaultAddress);
  const stS = await ethers.getContractAt("IERC20", stSAddress);
  const rewardRouter = await contractAt("RewardRouterV2", rewardRouterAddress);
  const glpManager = await ethers.getContractAt("IGlpManager", glpManagerAddress);
  
  console.log("\n=== Checking stS Token ===");
  const stSBalance = await stS.balanceOf(signer.address);
  console.log("Your stS balance:", ethers.utils.formatEther(stSBalance), "stS");
  
  // Check if vault has any approval to RewardRouter
  const vaultApproval = await stS.allowance(vault.address, rewardRouterAddress);
  console.log("Vault's approval to RewardRouter:", ethers.utils.formatEther(vaultApproval), "stS");
  
  console.log("\n=== Testing Direct Mint with stS ===");
  
  // First approve stS to RewardRouter directly
  const amount = ethers.utils.parseEther("0.1"); // Test with 0.1 stS
  console.log("Test amount:", ethers.utils.formatEther(amount), "stS");
  
  const currentAllowance = await stS.allowance(signer.address, rewardRouterAddress);
  if (currentAllowance.lt(amount)) {
    console.log("Approving RewardRouter to spend stS...");
    const approveTx = await stS.approve(rewardRouterAddress, amount);
    await approveTx.wait();
    console.log("✅ Approved");
  }
  
  // Try to mint directly to test if stS works
  try {
    console.log("\nTrying direct mintAndStakeGlp with stS...");
    const tx = await rewardRouter.mintAndStakeGlp(
      stSAddress,
      amount,
      0, // minUsdg
      0, // minGlp
      {
        gasLimit: 1500000
      }
    );
    
    console.log("Transaction sent:", tx.hash);
    const receipt = await tx.wait();
    console.log("✅ Direct mint successful! Gas used:", receipt.gasUsed.toString());
    
    // This means stS works for minting ALP
    console.log("\n✅ stS is accepted for ALP minting!");
    
  } catch (error) {
    console.log("❌ Direct mint failed:", error.message);
    
    // Try to decode the error
    if (error.error && error.error.data) {
      console.log("Error data:", error.error.data);
      
      // Try to decode using vault error messages
      try {
        const vaultErrorController = await contractAt("VaultErrorController", "0x1634b035FAC0464dE4B57E88750e0BB01e88c5C8");
        // Common error selectors
        const errorSelectors = [
          "0x3e41f282", // Vault: insufficient pool amount
          "0x98a5f7e6", // Vault: max USDG exceeded
          "0x1e51c9b0", // Vault: buffer amount exceeded
        ];
        
        for (const selector of errorSelectors) {
          if (error.error.data.startsWith(selector)) {
            console.log("Matched error selector:", selector);
          }
        }
      } catch (e) {
        // Ignore decoding errors
      }
    }
    
    console.log("\n❌ stS might not be accepted or there's another issue");
  }
  
  console.log("\n=== Checking Vault Deposit Function ===");
  
  // Try to simulate the vault deposit
  try {
    // Approve vault
    const vaultAllowance = await stS.allowance(signer.address, vault.address);
    if (vaultAllowance.lt(amount)) {
      console.log("Approving vault to spend stS...");
      const approveTx = await stS.approve(vault.address, amount);
      await approveTx.wait();
      console.log("✅ Approved vault");
    }
    
    // Try to estimate gas for deposit
    const gasEstimate = await vault.estimateGas.deposit(
      stSAddress,
      amount,
      0,
      0,
      signer.address
    );
    console.log("Gas estimate for vault deposit:", gasEstimate.toString());
    console.log("✅ Vault deposit should work!");
    
  } catch (error) {
    console.log("❌ Vault deposit simulation failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });