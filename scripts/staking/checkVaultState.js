const { ethers } = require("hardhat")

async function main() {
  const vaultAddress = "0x5B8caae7cC6Ea61fb96Fd251C4Bc13e48749C7Da"
  const usdcAddress = "0x29219dd400f2Bf60E5a23d13be72B486D4038894"
  
  const vault = await ethers.getContractAt("IVault", vaultAddress)
  
  console.log("Checking Vault state...")
  
  try {
    // Check if deposits are enabled
    const isLeverageEnabled = await vault.isLeverageEnabled()
    console.log("Is leverage enabled:", isLeverageEnabled)
    
    // Check if USDC is whitelisted
    const isWhitelisted = await vault.whitelistedTokens(usdcAddress)
    console.log("Is USDC whitelisted:", isWhitelisted)
    
    // Check pool amount
    const poolAmount = await vault.poolAmounts(usdcAddress)
    console.log("USDC pool amount:", ethers.utils.formatUnits(poolAmount, 6))
    
    // Check reserved amount
    const reservedAmount = await vault.reservedAmounts(usdcAddress)
    console.log("USDC reserved amount:", ethers.utils.formatUnits(reservedAmount, 6))
    
    // Check if manager mode
    const inManagerMode = await vault.inManagerMode()
    console.log("In manager mode:", inManagerMode)
    
    // Check max USDG
    const maxUsdgAmounts = await vault.maxUsdgAmounts(usdcAddress)
    console.log("Max USDG for USDC:", ethers.utils.formatUnits(maxUsdgAmounts, 18))
    
    // Check current USDG amount
    const usdgAmount = await vault.usdgAmounts(usdcAddress)
    console.log("Current USDG amount:", ethers.utils.formatUnits(usdgAmount, 18))
    
    // Check if exceeded
    if (usdgAmount.gte(maxUsdgAmounts) && maxUsdgAmounts.gt(0)) {
      console.log("⚠️  USDG limit reached for USDC!")
    }
    
  } catch (error) {
    console.error("Error:", error.message)
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })