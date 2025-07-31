const { ethers } = require("hardhat")

async function main() {
  const rewardRouterAddress = "0xE72A2d5B3b09c88D4E8Cc60e74BD438d7168e80F"
  const v1Vault = "0xB91735aE255403B9ab9d97dF671a63807a89f08c"
  const nativeVault = "0xbFD3C06e6293907e088a74eaaDa7bb7124F290be"
  
  console.log("Checking if RewardRouter has any access control...")
  
  // Try to get the contract and check for common access control patterns
  const rewardRouter = await ethers.getContractAt("RewardRouterV2", rewardRouterAddress)
  
  try {
    // Check for common access control functions
    const possibleFunctions = [
      "isHandler",
      "isWhitelisted", 
      "whitelistedContracts",
      "allowedContracts",
      "isAllowed"
    ]
    
    for (const funcName of possibleFunctions) {
      try {
        // Try calling with v1 vault address
        const result = await rewardRouter[funcName](v1Vault)
        console.log(`${funcName}(v1Vault):`, result)
        
        // Try with native vault
        const result2 = await rewardRouter[funcName](nativeVault)
        console.log(`${funcName}(nativeVault):`, result2)
      } catch (e) {
        // Function doesn't exist, continue
      }
    }
  } catch (error) {
    console.log("No obvious access control found")
  }
  
  // Check deployed block numbers to understand timeline
  console.log("\nChecking deployment timeline...")
  
  // Binary search to find when V1 vault was deployed
  let low = 1
  let high = 30000000
  let v1DeployBlock = 0
  
  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    try {
      const code = await ethers.provider.getCode(v1Vault, mid)
      if (code === "0x") {
        low = mid + 1
      } else {
        v1DeployBlock = mid
        high = mid - 1
      }
    } catch (e) {
      high = mid - 1
    }
  }
  
  console.log("Estimated V1 deployment block:", v1DeployBlock)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })