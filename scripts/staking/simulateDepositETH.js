const { contractAt } = require("../shared/helpers");

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Testing with account:", signer.address);
  
  const vaultAddress = "0x2A7353242c2C0BbF9cB56bEe98b6b5f2Fa528Cfa";
  const vault = await contractAt("YieldBearingALPVault", vaultAddress);
  
  console.log("\n=== Simulating depositETH ===");
  
  try {
    // Try to estimate gas first
    const gasEstimate = await vault.estimateGas.depositETH(0, 0, signer.address, {
      value: ethers.utils.parseEther("0.001")
    });
    console.log("Gas estimate:", gasEstimate.toString());
  } catch (error) {
    console.log("Gas estimation failed:", error.message);
    
    // Try to get more details
    try {
      // Use staticCall to see the actual error
      await vault.callStatic.depositETH(0, 0, signer.address, {
        value: ethers.utils.parseEther("0.001")
      });
    } catch (staticError) {
      console.log("\nStatic call error:", staticError.message);
      console.log("Error reason:", staticError.reason);
    }
  }
  
  // Check if the issue is with the RewardRouter interface
  console.log("\n=== Checking RewardRouter Interface ===");
  const rewardRouterAddress = await vault.rewardRouter();
  
  // Check if mintAndStakeGlpETH is in the IRewardRouterV2Extended interface
  try {
    const IRewardRouterV2Extended = await ethers.getContractFactory("IRewardRouterV2Extended");
    console.log("IRewardRouterV2Extended interface exists");
    
    // Get the function selector for mintAndStakeGlpETH
    const iface = new ethers.utils.Interface([
      "function mintAndStakeGlpETH(uint256 _minUsdg, uint256 _minGlp) external payable returns (uint256)"
    ]);
    const selector = iface.getSighash("mintAndStakeGlpETH");
    console.log("mintAndStakeGlpETH selector:", selector);
    
  } catch (error) {
    console.log("Interface check error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });