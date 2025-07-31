const { ethers } = require("hardhat")

async function main() {
  const vaultAddress = "0xb809E1B3078FFF4920f07aE036852573b13D6d5C"
  const fsAlpAddress = "0xB895e3DBFB37A4Cc6b4FB50B1cf903608e942FF9"
  const rewardRouterAddress = "0xE72A2d5B3b09c88D4E8Cc60e74BD438d7168e80F"
  
  // Get fsALP as RewardTracker contract
  const RewardTracker = await ethers.getContractFactory("RewardTracker")
  const fsAlp = RewardTracker.attach(fsAlpAddress)
  
  console.log("Checking fsALP (RewardTracker) handler status...")
  
  try {
    // Check if it has inPrivateStakingMode
    const inPrivateStakingMode = await fsAlp.inPrivateStakingMode()
    console.log("fsALP inPrivateStakingMode:", inPrivateStakingMode)
    
    if (inPrivateStakingMode) {
      // Check handlers
      const isVaultHandler = await fsAlp.isHandler(vaultAddress)
      console.log("Is vault a handler for fsALP?", isVaultHandler)
      
      const isRewardRouterHandler = await fsAlp.isHandler(rewardRouterAddress)
      console.log("Is RewardRouter a handler for fsALP?", isRewardRouterHandler)
    }
    
    // Also check if transfers are restricted
    const inPrivateTransferMode = await fsAlp.inPrivateTransferMode()
    console.log("fsALP inPrivateTransferMode:", inPrivateTransferMode)
    
  } catch (error) {
    console.error("Error:", error.message)
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })