const { ethers } = require("hardhat")

async function main() {
  const v1VaultAddress = "0xB91735aE255403B9ab9d97dF671a63807a89f08c" // Working V1
  const nativeVaultAddress = "0xbFD3C06e6293907e088a74eaaDa7bb7124F290be" // New Native
  const glpAddress = "0x6fbaeE8bEf2e8f5c34A08BdD4A4AB777Bd3f6764"
  const feeGlpTrackerAddress = "0xF3d911F81c4A630e755B42C90942e278019709A7"
  
  const glp = await ethers.getContractAt("IERC20", glpAddress)
  
  console.log("Checking GLP approvals...")
  
  // Check V1 vault's approval to feeGlpTracker
  const v1Approval = await glp.allowance(v1VaultAddress, feeGlpTrackerAddress)
  console.log("\nV1 Vault GLP approval to feeGlpTracker:", v1Approval.toString())
  
  // Check Native vault's approval
  const nativeApproval = await glp.allowance(nativeVaultAddress, feeGlpTrackerAddress)
  console.log("Native Vault GLP approval to feeGlpTracker:", nativeApproval.toString())
  
  // Also check GLP balances
  const v1Balance = await glp.balanceOf(v1VaultAddress)
  const nativeBalance = await glp.balanceOf(nativeVaultAddress)
  console.log("\nV1 Vault GLP balance:", ethers.utils.formatEther(v1Balance))
  console.log("Native Vault GLP balance:", ethers.utils.formatEther(nativeBalance))
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })