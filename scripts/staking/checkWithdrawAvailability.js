const { ethers } = require("hardhat")

async function main() {
  const vaultAddress = "0xd2e4b0cC3FB79ef958137206cbEd94C7a5C7972d"
  const glpManagerAddress = "0x4DE729B85dDB172F1bb775882f355bA25764E430"
  
  const vault = await ethers.getContractAt("YieldBearingALPVaultETH", vaultAddress)
  const glpManager = await ethers.getContractAt("GlpManager", glpManagerAddress)
  
  console.log("=== YieldBearingALPVaultETH Withdraw Status ===")
  console.log("Vault address:", vaultAddress)
  
  // Get cooldown info
  const cooldownDuration = await glpManager.cooldownDuration()
  const lastAddedAt = await glpManager.lastAddedAt(vaultAddress)
  
  console.log("\nCooldown duration:", cooldownDuration.toString(), "seconds (", cooldownDuration.div(60).toString(), "minutes)")
  
  if (lastAddedAt.eq(0)) {
    console.log("✅ No cooldown active - withdrawals available")
  } else {
    const currentTime = Math.floor(Date.now() / 1000)
    const cooldownEnd = lastAddedAt.add(cooldownDuration).toNumber()
    const timeRemaining = cooldownEnd - currentTime
    
    console.log("Last deposit at:", new Date(lastAddedAt.toNumber() * 1000).toLocaleString())
    console.log("Cooldown ends at:", new Date(cooldownEnd * 1000).toLocaleString())
    
    if (timeRemaining > 0) {
      console.log("\n⏰ Cooldown active - withdrawals available in:")
      console.log("  -", Math.floor(timeRemaining / 60), "minutes", timeRemaining % 60, "seconds")
      console.log("  - Approximately", new Date(cooldownEnd * 1000).toLocaleTimeString())
    } else {
      console.log("\n✅ Cooldown expired - withdrawals are now available!")
    }
  }
  
  // Show vault state
  console.log("\n=== Vault State ===")
  const totalSupply = await vault.totalSupply()
  const totalAssets = await vault.totalAssets()
  
  console.log("Total yALP supply:", ethers.utils.formatEther(totalSupply))
  console.log("Total fsALP assets:", ethers.utils.formatEther(totalAssets))
  
  if (totalSupply.gt(0)) {
    const rate = totalAssets.mul(ethers.utils.parseEther("1")).div(totalSupply)
    console.log("Exchange rate:", ethers.utils.formatEther(rate), "fsALP per yALP")
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })