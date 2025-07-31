const { ethers } = require("hardhat")

async function main() {
  // The V1 vault that was working
  const v1VaultAddress = "0xB91735aE255403B9ab9d97dF671a63807a89f08c"
  
  // Current native vault
  const nativeVaultAddress = "0xbFD3C06e6293907e088a74eaaDa7bb7124F290be"
  
  console.log("Comparing V1 (working) vs Native vault configurations...")
  
  const v1Vault = await ethers.getContractAt("YieldBearingALPVaultFixed", v1VaultAddress)
  const nativeVault = await ethers.getContractAt("YieldBearingALPVaultNative", nativeVaultAddress)
  
  // Get the immutable variables
  console.log("\n=== V1 Vault (Working) ===")
  const v1RewardRouter = await v1Vault.rewardRouter()
  const v1FsAlp = await v1Vault.fsAlp()
  const v1Weth = await v1Vault.weth()
  console.log("RewardRouter:", v1RewardRouter)
  console.log("fsALP:", v1FsAlp)
  console.log("WETH:", v1Weth)
  
  console.log("\n=== Native Vault ===")
  const nativeRewardRouter = await nativeVault.rewardRouter()
  const nativeFsAlp = await nativeVault.fsAlp()
  const nativeWeth = await nativeVault.weth()
  console.log("RewardRouter:", nativeRewardRouter)
  console.log("fsALP:", nativeFsAlp)
  console.log("WETH:", nativeWeth)
  
  console.log("\n=== Differences ===")
  if (v1RewardRouter !== nativeRewardRouter) {
    console.log("❌ Different RewardRouter addresses!")
    console.log("   V1:", v1RewardRouter)
    console.log("   Native:", nativeRewardRouter)
  }
  if (v1FsAlp !== nativeFsAlp) {
    console.log("❌ Different fsALP addresses!")
    console.log("   V1:", v1FsAlp)
    console.log("   Native:", nativeFsAlp)
  }
  
  // Check if V1 vault is whitelisted on its fsALP
  const v1FsAlpContract = await ethers.getContractAt("RewardTracker", v1FsAlp)
  const isV1Handler = await v1FsAlpContract.isHandler(v1VaultAddress)
  console.log("\nIs V1 vault a handler on its fsALP?", isV1Handler)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })