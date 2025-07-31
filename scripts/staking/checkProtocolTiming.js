const { ethers } = require("hardhat")

async function main() {
  const glpManagerAddress = "0x4DE729B85dDB172F1bb775882f355bA25764E430"
  const glpManager = await ethers.getContractAt("GlpManager", glpManagerAddress)
  
  console.log("Checking GlpManager timing constraints...")
  
  // Check cooldown
  const cooldown = await glpManager.cooldownDuration()
  console.log("Cooldown duration:", cooldown.toString(), "seconds (", cooldown.div(60).toString(), "minutes)")
  
  // Check if there's a lastAddedAt for vaults
  const v1Vault = "0xB91735aE255403B9ab9d97dF671a63807a89f08c"
  const lastAdded = await glpManager.lastAddedAt(v1Vault)
  console.log("\nV1 Vault lastAddedAt:", lastAdded.toString())
  if (lastAdded.gt(0)) {
    const date = new Date(lastAdded.toNumber() * 1000)
    console.log("Last added date:", date.toISOString())
  }
  
  // Try to understand what changed by looking at recent transactions
  console.log("\nLet me check if there's a way to bypass the issue...")
  
  // One theory: Maybe we need to use the GLPRewardRouterV2 instead?
  const glpRewardRouter = "0x5b600cBD1f0E6805088396555fe0eD32E34c9b49"
  console.log("\nThere's also a GLPRewardRouterV2 at:", glpRewardRouter)
  console.log("Maybe the V1 vault was using this router?")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })