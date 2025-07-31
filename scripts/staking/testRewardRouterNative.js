const { ethers } = require("hardhat")

async function main() {
  const [signer] = await ethers.getSigners()
  
  const rewardRouterAddress = "0xE72A2d5B3b09c88D4E8Cc60e74BD438d7168e80F"
  const fsAlpAddress = "0xB895e3DBFB37A4Cc6b4FB50B1cf903608e942FF9"
  
  console.log("Testing RewardRouter directly with native token:", signer.address)
  
  const rewardRouter = await ethers.getContractAt("IRewardRouterV2Extended", rewardRouterAddress)
  const fsAlp = await ethers.getContractAt("IRewardTracker", fsAlpAddress)
  
  // Check initial balance
  const fsAlpBefore = await fsAlp.stakedAmounts(signer.address)
  console.log("fsALP balance before:", ethers.utils.formatEther(fsAlpBefore))
  
  // Small amount
  const amount = ethers.utils.parseEther("0.1")
  
  console.log("\nCalling mintAndStakeGlpETH with", ethers.utils.formatEther(amount), "S...")
  try {
    const tx = await rewardRouter.mintAndStakeGlpETH(
      0, // minUsdg
      0, // minGlp
      { value: amount, gasLimit: 1000000 }
    )
    console.log("Transaction sent:", tx.hash)
    await tx.wait()
    
    const fsAlpAfter = await fsAlp.stakedAmounts(signer.address)
    console.log("\n✅ Success!")
    console.log("fsALP balance after:", ethers.utils.formatEther(fsAlpAfter))
    console.log("fsALP received:", ethers.utils.formatEther(fsAlpAfter.sub(fsAlpBefore)))
    
  } catch (error) {
    console.error("❌ Failed:", error.reason || error.message)
    
    // Try to understand the error
    if (error.error?.data) {
      console.log("\nError data:", error.error.data)
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })