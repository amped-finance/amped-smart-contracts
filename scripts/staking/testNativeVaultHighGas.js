const { ethers } = require("hardhat")

async function main() {
  const [signer] = await ethers.getSigners()
  console.log("Testing native vault with high gas limit...")
  
  const nativeVault = "0xbFD3C06e6293907e088a74eaaDa7bb7124F290be"
  const vault = await ethers.getContractAt("YieldBearingALPVaultNative", nativeVault)
  
  const amount = ethers.utils.parseEther("0.01")
  
  console.log("\nTrying with different gas limits...")
  
  const gasLimits = [
    1000000,
    2000000,
    3000000,
    5000000
  ]
  
  for (const gasLimit of gasLimits) {
    console.log(`\nTrying with gas limit: ${gasLimit}`)
    try {
      const tx = await vault.deposit(0, 0, signer.address, { 
        value: amount, 
        gasLimit: gasLimit 
      })
      console.log("✅ Success with gas limit:", gasLimit)
      console.log("Transaction:", tx.hash)
      const receipt = await tx.wait()
      console.log("Actual gas used:", receipt.gasUsed.toString())
      break
    } catch (error) {
      console.log("❌ Failed with gas limit:", gasLimit)
      // Check if it's out of gas
      if (error.message.includes("out of gas")) {
        console.log("-> Out of gas error")
      }
    }
  }
  
  // Also try with estimateGas
  console.log("\nEstimating gas requirement...")
  try {
    const estimatedGas = await vault.estimateGas.deposit(0, 0, signer.address, { value: amount })
    console.log("Estimated gas:", estimatedGas.toString())
  } catch (error) {
    console.log("❌ Gas estimation failed:", error.reason || error.message)
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })