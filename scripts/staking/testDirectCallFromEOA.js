const { ethers } = require("hardhat")

async function main() {
  const [signer] = await ethers.getSigners()
  
  // First, let's confirm that direct calls from EOA still work
  console.log("Testing direct call from EOA:", signer.address)
  console.log("Is EOA?", await ethers.provider.getCode(signer.address) === "0x")
  
  const rewardRouterAddress = "0xE72A2d5B3b09c88D4E8Cc60e74BD438d7168e80F"
  const rewardRouter = await ethers.getContractAt("IRewardRouterV2Extended", rewardRouterAddress)
  
  // Small test
  try {
    const tx = await rewardRouter.mintAndStakeGlpETH(
      0, // minUsdg
      0, // minGlp
      { value: ethers.utils.parseEther("0.01"), gasLimit: 1000000 }
    )
    console.log("✅ EOA can call mintAndStakeGlpETH successfully")
    await tx.wait()
  } catch (error) {
    console.log("❌ Even EOA fails now:", error.message)
  }
  
  // Now let's check if the issue is contract size
  const nativeVault = "0xbFD3C06e6293907e088a74eaaDa7bb7124F290be"
  const v1Vault = "0xB91735aE255403B9ab9d97dF671a63807a89f08c"
  
  const nativeCode = await ethers.provider.getCode(nativeVault)
  const v1Code = await ethers.provider.getCode(v1Vault)
  
  console.log("\nContract sizes:")
  console.log("Native vault code size:", nativeCode.length)
  console.log("V1 vault code size:", v1Code.length)
  
  // Check if there's any difference in how they're deployed
  const nativeDeployTx = await ethers.provider.getTransaction("0xc6a1c6c2d7a6c3b4c5e9e3f4f5b6b7b8b9cacbcc") // dummy
  const v1DeployBlock = await ethers.provider.getBlock(28000000) // estimate
  
  console.log("\nV1 was likely deployed before block:", v1DeployBlock.number)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })