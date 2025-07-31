const { ethers } = require("hardhat")

async function main() {
  const [signer] = await ethers.getSigners()
  
  const glpManagerAddress = "0x4DE729B85dDB172F1bb775882f355bA25764E430"
  const usdcAddress = "0x29219dd400f2bf60e5a23d13be72b486d4038894"
  const rewardRouterAddress = "0xE72A2d5B3b09c88D4E8Cc60e74BD438d7168e80F"
  
  const glpManager = await ethers.getContractAt("GlpManager", glpManagerAddress)
  const usdc = await ethers.getContractAt("IERC20", usdcAddress)
  
  console.log("Testing direct GlpManager interaction...")
  
  // Check if we can call addLiquidity directly (should fail due to inPrivateMode)
  const amount = ethers.utils.parseUnits("0.01", 6)
  
  try {
    console.log("\n1. Testing direct addLiquidity (should fail)...")
    await usdc.approve(glpManagerAddress, amount)
    await glpManager.addLiquidity(usdcAddress, amount, 0, 0)
  } catch (error) {
    console.log("✓ Expected failure:", error.reason || "GlpManager: action not enabled")
  }
  
  // Test through RewardRouter (should work)
  try {
    console.log("\n2. Testing through RewardRouter...")
    const rewardRouter = await ethers.getContractAt("IRewardRouterV2Extended", rewardRouterAddress)
    
    await usdc.approve(rewardRouterAddress, amount)
    const tx = await rewardRouter.mintAndStakeGlp(
      usdcAddress,
      amount,
      0,
      0,
      { gasLimit: 1000000 }
    )
    console.log("Transaction sent:", tx.hash)
    const receipt = await tx.wait()
    console.log("✓ Success! This confirms the issue is with our vault's interaction")
    
  } catch (error) {
    console.log("✗ RewardRouter also failed:", error.reason || error.message)
  }
  
  // Check GlpManager configuration
  console.log("\n=== GlpManager Configuration ===")
  const cooldown = await glpManager.cooldownDuration()
  console.log("Cooldown duration:", cooldown.toString(), "seconds")
  
  const inPrivateMode = await glpManager.inPrivateMode()
  console.log("In private mode:", inPrivateMode)
  
  // Check AUM
  try {
    const aum = await glpManager.getAumInUsdg(false)
    console.log("AUM in USDG:", ethers.utils.formatUnits(aum, 18))
  } catch (error) {
    console.log("Error getting AUM:", error.message)
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })