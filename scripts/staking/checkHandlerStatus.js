const { ethers } = require("hardhat")

async function main() {
  const vaultAddress = "0xb809E1B3078FFF4920f07aE036852573b13D6d5C" // New V2 vault
  const glpManagerAddress = "0x4DE729B85dDB172F1bb775882f355bA25764E430" // Correct GlpManager from deploy-sonic.json
  
  const glpManager = await ethers.getContractAt("GlpManager", glpManagerAddress)
  
  // Check if vault is a handler
  const isHandler = await glpManager.isHandler(vaultAddress)
  console.log("Is YieldBearingALPVaultV2 a handler?", isHandler)
  
  // Also check inPrivateMode
  const inPrivateMode = await glpManager.inPrivateMode()
  console.log("GlpManager inPrivateMode:", inPrivateMode)
  
  // Check some other handlers for comparison
  const rewardRouter = "0xE72A2d5B3b09c88D4E8Cc60e74BD438d7168e80F" // Correct RewardRouter from deploy-sonic.json
  const isRewardRouterHandler = await glpManager.isHandler(rewardRouter)
  console.log("Is RewardRouter a handler?", isRewardRouterHandler)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })