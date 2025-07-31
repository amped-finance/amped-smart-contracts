const { ethers } = require("hardhat")

async function main() {
  const [signer] = await ethers.getSigners()
  
  const rewardRouterAddress = "0xE72A2d5B3b09c88D4E8Cc60e74BD438d7168e80F"
  const usdcAddress = "0x29219dd400f2Bf60E5a23d13Be72B486D4038894"
  const fsAlpAddress = "0xB895e3DBFB37A4Cc6b4FB50B1cf903608e942FF9"
  
  console.log("Testing RewardRouter directly with account:", signer.address)
  
  const rewardRouter = await ethers.getContractAt("IRewardRouterV2Extended", rewardRouterAddress)
  const usdc = await ethers.getContractAt("IERC20", usdcAddress)
  const fsAlp = await ethers.getContractAt("IRewardTracker", fsAlpAddress)
  
  // Check initial balance
  const fsAlpBefore = await fsAlp.stakedAmounts(signer.address)
  console.log("fsALP balance before:", ethers.utils.formatUnits(fsAlpBefore, 18))
  
  // Small amount
  const amount = ethers.utils.parseUnits("0.1", 6)
  
  // Approve and mint
  console.log("\nApproving USDC...")
  await usdc.approve(rewardRouterAddress, amount)
  
  console.log("Calling mintAndStakeGlp...")
  try {
    const tx = await rewardRouter.mintAndStakeGlp(
      usdcAddress,
      amount,
      0, // minUsdg
      0, // minGlp
      { gasLimit: 1000000 }
    )
    console.log("Transaction sent:", tx.hash)
    await tx.wait()
    
    const fsAlpAfter = await fsAlp.stakedAmounts(signer.address)
    console.log("\n✅ Success!")
    console.log("fsALP balance after:", ethers.utils.formatUnits(fsAlpAfter, 18))
    console.log("fsALP received:", ethers.utils.formatUnits(fsAlpAfter.sub(fsAlpBefore), 18))
    
  } catch (error) {
    console.error("❌ Failed:", error.reason || error.message)
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })