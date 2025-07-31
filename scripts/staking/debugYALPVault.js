const { contractAt } = require("../shared/helpers");

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Debugging with account:", signer.address);
  
  const vaultAddress = "0x2A7353242c2C0BbF9cB56bEe98b6b5f2Fa528Cfa";
  const vault = await contractAt("YieldBearingALPVault", vaultAddress);
  
  console.log("\n=== Checking Vault Configuration ===");
  
  // Check all addresses
  const rewardRouter = await vault.rewardRouter();
  const fsAlp = await vault.fsAlp();
  const glpManager = await vault.glpManager();
  const weth = await vault.weth();
  const esAmp = await vault.esAmp();
  
  console.log("RewardRouter:", rewardRouter);
  console.log("fsALP:", fsAlp);
  console.log("GlpManager:", glpManager);
  console.log("WETH:", weth);
  console.log("esAMP:", esAmp);
  
  // Check if vault has any balance
  const totalAssets = await vault.totalAssets();
  console.log("\nVault's total assets (fsALP):", ethers.utils.formatEther(totalAssets));
  
  // Try to understand why depositETH failed
  console.log("\n=== Testing depositETH ===");
  
  // First, let's check if the RewardRouter accepts ETH
  const rewardRouterContract = await contractAt("RewardRouterV2", rewardRouter);
  
  try {
    // Check if mintAndStakeGlpETH exists on the RewardRouter
    const code = await ethers.provider.getCode(rewardRouter);
    console.log("RewardRouter has code:", code.length > 2);
    
    // Try a direct call to mintAndStakeGlpETH on RewardRouter
    console.log("\nTesting direct mintAndStakeGlpETH on RewardRouter...");
    const directTx = await rewardRouterContract.mintAndStakeGlpETH(0, 0, {
      value: ethers.utils.parseEther("0.001"),
      gasLimit: 1000000
    });
    console.log("Direct tx sent:", directTx.hash);
    await directTx.wait();
    console.log("✅ Direct mintAndStakeGlpETH works!");
    
  } catch (error) {
    console.log("❌ Direct mintAndStakeGlpETH failed:", error.message);
  }
  
  // Check WETH address on Sonic
  console.log("\n=== Checking WETH ===");
  const sonicWeth = "0x50c42deacd8fc9773493ed674b675be577f2634b";
  console.log("Expected WETH:", sonicWeth);
  console.log("Vault's WETH:", weth);
  console.log("WETH addresses match:", sonicWeth.toLowerCase() === weth.toLowerCase());
  
  // Check if we need to use native token symbol
  console.log("\n=== Checking Native Token ===");
  console.log("ETH constant in vault:", await vault.ETH());
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });