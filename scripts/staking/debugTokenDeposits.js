const { contractAt } = require("../shared/helpers");
const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Debugging token deposits with account:", signer.address);
  
  // Contract addresses
  const vaultAddress = "0xB91735aE255403B9ab9d97dF671a63807a89f08c";
  const rewardRouterAddress = "0xE72A2d5B3b09c88D4E8Cc60e74BD438d7168e80F";
  const glpManagerAddress = "0x4DE729B85dDB172F1bb775882f355bA25764E430";
  const usdcAddress = "0x29219dd400f2bf60e5a23d13be72b486d4038894";
  
  const vault = await contractAt("YieldBearingALPVaultFixed", vaultAddress);
  const rewardRouter = await contractAt("RewardRouterV2", rewardRouterAddress);
  const glpManager = await ethers.getContractAt("IGlpManager", glpManagerAddress);
  const usdc = await ethers.getContractAt("IERC20", usdcAddress);
  
  console.log("\n=== Testing Direct USDC Mint ===");
  
  const amount = ethers.utils.parseUnits("0.1", 6); // 0.1 USDC
  console.log("Test amount:", ethers.utils.formatUnits(amount, 6), "USDC");
  
  // Check balance
  const usdcBalance = await usdc.balanceOf(signer.address);
  console.log("Your USDC balance:", ethers.utils.formatUnits(usdcBalance, 6), "USDC");
  
  if (usdcBalance.lt(amount)) {
    console.log("❌ Insufficient USDC balance");
    return;
  }
  
  // Approve RewardRouter directly
  const currentAllowance = await usdc.allowance(signer.address, rewardRouterAddress);
  if (currentAllowance.lt(amount)) {
    console.log("Approving RewardRouter...");
    const approveTx = await usdc.approve(rewardRouterAddress, amount);
    await approveTx.wait();
    console.log("✅ Approved");
  }
  
  // Try direct mint
  try {
    console.log("\nTrying direct mintAndStakeGlp with USDC...");
    const tx = await rewardRouter.mintAndStakeGlp(
      usdcAddress,
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
    console.log("USDC works for minting ALP!");
    
  } catch (error) {
    console.log("❌ Direct mint failed:", error.message);
    
    // Try to get more error details
    if (error.error && error.error.data) {
      console.log("Error data:", error.error.data);
      
      // Try to decode the error
      try {
        // Common vault errors
        const errorMessages = {
          "0x3e41f282": "Vault: insufficient pool amount",
          "0x98a5f7e6": "Vault: max USDG exceeded",
          "0x1e51c9b0": "Vault: buffer amount exceeded",
          "0xfb8f41b2": "GlpManager: insufficient USDG output",
          "0x44230078": "GlpManager: insufficient GLP output",
          "0x4c6e73b8": "GlpManager: action not enabled"
        };
        
        const selector = error.error.data.slice(0, 10);
        if (errorMessages[selector]) {
          console.log("\n⚠️  Error decoded:", errorMessages[selector]);
        }
        
        // Try to decode the error parameters
        if (error.error.data.startsWith("0xfb8f41b2")) {
          // GlpManager: insufficient USDG output
          const decoded = ethers.utils.defaultAbiCoder.decode(
            ["address", "uint256", "uint256"],
            "0x" + error.error.data.slice(10)
          );
          console.log("Token:", decoded[0]);
          console.log("USDG output:", ethers.utils.formatUnits(decoded[1], 30));
          console.log("Min USDG:", ethers.utils.formatUnits(decoded[2], 30));
        }
      } catch (e) {
        // Ignore decode errors
      }
    }
  }
  
  console.log("\n=== Checking GLP Manager Settings ===");
  
  try {
    // Check if adding liquidity is enabled
    const vault = await ethers.getContractAt("IVault", "0x5B8caae7cC6Ea61fb96Fd251C4Bc13e48749C7Da");
    
    // Check USDC settings
    const isWhitelisted = await vault.whitelistedTokens(usdcAddress);
    console.log("USDC whitelisted:", isWhitelisted);
    
    if (isWhitelisted) {
      const tokenDecimals = await vault.tokenDecimals(usdcAddress);
      const minPrice = await vault.getMinPrice(usdcAddress);
      const maxPrice = await vault.getMaxPrice(usdcAddress);
      
      console.log("USDC decimals:", tokenDecimals.toString());
      console.log("USDC min price:", ethers.utils.formatUnits(minPrice, 30), "USD");
      console.log("USDC max price:", ethers.utils.formatUnits(maxPrice, 30), "USD");
      
      // Check pool amounts
      const poolAmount = await vault.poolAmounts(usdcAddress);
      const reservedAmount = await vault.reservedAmounts(usdcAddress);
      const availableAmount = poolAmount.sub(reservedAmount);
      
      console.log("\nUSDC Pool Info:");
      console.log("Pool amount:", ethers.utils.formatUnits(poolAmount, 6), "USDC");
      console.log("Reserved:", ethers.utils.formatUnits(reservedAmount, 6), "USDC");
      console.log("Available:", ethers.utils.formatUnits(availableAmount, 6), "USDC");
      
      if (availableAmount.eq(0)) {
        console.log("\n⚠️  No USDC liquidity in the pool!");
        console.log("This might be why deposits are failing.");
      }
    }
    
  } catch (error) {
    console.log("Error checking settings:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });