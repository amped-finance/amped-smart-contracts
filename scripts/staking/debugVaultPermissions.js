const { ethers } = require("hardhat")

async function main() {
  const vaultAddress = "0xbFD3C06e6293907e088a74eaaDa7bb7124F290be"
  const rewardRouterAddress = "0xE72A2d5B3b09c88D4E8Cc60e74BD438d7168e80F"
  const fsAlpAddress = "0xB895e3DBFB37A4Cc6b4FB50B1cf903608e942FF9"
  const feeGlpTrackerAddress = "0xF3d911F81c4A630e755B42C90942e278019709A7" // From deploy-sonic.json
  
  console.log("Checking vault permissions...")
  
  const fsAlp = await ethers.getContractAt("RewardTracker", fsAlpAddress)
  const feeGlpTracker = await ethers.getContractAt("RewardTracker", feeGlpTrackerAddress)
  
  // Check handlers on various trackers
  console.log("\n=== Handler Status ===")
  
  // Check fsALP (stakedGlpTracker)
  const isVaultHandlerFsAlp = await fsAlp.isHandler(vaultAddress)
  const isRewardRouterHandlerFsAlp = await fsAlp.isHandler(rewardRouterAddress)
  console.log("fsALP tracker:")
  console.log("- Is vault a handler?", isVaultHandlerFsAlp)
  console.log("- Is RewardRouter a handler?", isRewardRouterHandlerFsAlp)
  
  // Check feeGlpTracker
  const isVaultHandlerFeeGlp = await feeGlpTracker.isHandler(vaultAddress)
  const isRewardRouterHandlerFeeGlp = await feeGlpTracker.isHandler(rewardRouterAddress)
  console.log("\nfeeGlpTracker:")
  console.log("- Is vault a handler?", isVaultHandlerFeeGlp)
  console.log("- Is RewardRouter a handler?", isRewardRouterHandlerFeeGlp)
  
  // The issue might be that RewardRouter stakes on behalf of msg.sender
  // When vault calls it, msg.sender is the vault, so the vault needs permissions
  
  console.log("\n💡 The vault likely needs to be whitelisted as a handler on:")
  if (!isVaultHandlerFeeGlp) {
    console.log("- feeGlpTracker (0xF3d911F81c4A630e755B42C90942e278019709A7)")
  }
  if (!isVaultHandlerFsAlp) {
    console.log("- fsAlp/stakedGlpTracker (0xB895e3DBFB37A4Cc6b4FB50B1cf903608e942FF9)")
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })