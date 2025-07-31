const { ethers } = require("hardhat")

async function main() {
  const [signer] = await ethers.getSigners()
  
  // Test both vaults
  const v1Vault = "0xB91735aE255403B9ab9d97dF671a63807a89f08c" // Working
  const nativeVault = "0xbFD3C06e6293907e088a74eaaDa7bb7124F290be" // Not working
  
  console.log("Simulating deposit calls to understand the difference...")
  
  // First, let's call eth_call to simulate without sending transaction
  const amount = ethers.utils.parseEther("0.01")
  
  console.log("\n=== V1 Vault (Working) ===")
  try {
    const v1 = await ethers.getContractAt("YieldBearingALPVaultFixed", v1Vault)
    // Use callStatic to simulate without sending
    const result = await v1.callStatic.depositETH(0, 0, signer.address, { value: amount })
    console.log("✅ Simulation successful, would receive:", ethers.utils.formatEther(result), "yALP")
  } catch (error) {
    console.log("❌ Simulation failed:", error.reason || error.message)
  }
  
  console.log("\n=== Native Vault (Not Working) ===")
  try {
    const native = await ethers.getContractAt("YieldBearingALPVaultNative", nativeVault)
    // Use callStatic to simulate
    const result = await native.callStatic.deposit(0, 0, signer.address, { value: amount })
    console.log("✅ Simulation successful, would receive:", ethers.utils.formatEther(result), "yALP")
  } catch (error) {
    console.log("❌ Simulation failed:", error.reason || error.message)
    
    // Try to get more details about the revert
    if (error.error) {
      console.log("\nError details:")
      console.log("- Method:", error.error.method)
      console.log("- Data:", error.error.data)
      console.log("- Error:", error.error.error)
    }
  }
  
  // Let's also check if both vaults are using the same interfaces
  console.log("\n=== Checking Contract Interfaces ===")
  const v1Contract = await ethers.getContractAt("YieldBearingALPVaultFixed", v1Vault)
  const nativeContract = await ethers.getContractAt("YieldBearingALPVaultNative", nativeVault)
  
  console.log("V1 rewardRouter:", await v1Contract.rewardRouter())
  console.log("Native rewardRouter:", await nativeContract.rewardRouter())
  
  console.log("\nV1 fsAlp:", await v1Contract.fsAlp())
  console.log("Native fsAlp:", await nativeContract.fsAlp())
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })