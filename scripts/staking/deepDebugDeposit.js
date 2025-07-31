const { ethers } = require("hardhat")

async function main() {
  const [signer] = await ethers.getSigners()
  
  const vaultAddress = "0xb809E1B3078FFF4920f07aE036852573b13D6d5C"
  const usdcAddress = "0x29219dd400f2bf60e5a23d13be72b486d4038894"
  const glpAddress = "0x6fbaeE8bEf2e8f5c34A08BdD4A4AB777Bd3f6764"
  const glpManagerAddress = "0x4DE729B85dDB172F1bb775882f355bA25764E430"
  const vaultAddress2 = "0x5B8caae7cC6Ea61fb96Fd251C4Bc13e48749C7Da" // Vault from deploy-sonic.json
  
  console.log("Deep debugging deposit process...")
  
  const vault = await ethers.getContractAt("YieldBearingALPVaultV2", vaultAddress)
  const glpManager = await ethers.getContractAt("GlpManager", glpManagerAddress)
  const usdc = await ethers.getContractAt("IERC20", usdcAddress)
  const glp = await ethers.getContractAt("IERC20", glpAddress)
  const vaultContract = await ethers.getContractAt("IVault", vaultAddress2)
  
  // Check if USDC is whitelisted in Vault
  console.log("\n=== Vault Token Config ===")
  try {
    const isWhitelisted = await vaultContract.whitelistedTokens(usdcAddress)
    console.log("Is USDC whitelisted in Vault?", isWhitelisted)
    
    const tokenConfig = await vaultContract.tokenConfigs(usdcAddress)
    console.log("USDC token config exists?", tokenConfig.tokenDecimals > 0)
    console.log("USDC decimals in Vault:", tokenConfig.tokenDecimals)
    
    // Check if GlpManager can receive from Vault
    const glpManagerVault = await glpManager.vault()
    console.log("GlpManager's vault:", glpManagerVault)
    console.log("Expected vault:", vaultAddress2)
    console.log("Vault addresses match?", glpManagerVault.toLowerCase() === vaultAddress2.toLowerCase())
    
  } catch (error) {
    console.error("Error checking vault config:", error.message)
  }
  
  // Try minimal test
  console.log("\n=== Attempting Minimal Deposit ===")
  const amount = ethers.utils.parseUnits("0.01", 6) // Even smaller amount
  
  try {
    // Approve
    await usdc.approve(vaultAddress, amount)
    console.log("✓ Approved USDC")
    
    // Try deposit with higher gas limit
    const tx = await vault.deposit(
      usdcAddress,
      amount,
      0, // minUsdg
      0, // minGlp
      signer.address,
      { gasLimit: 3000000 }
    )
    console.log("Transaction sent:", tx.hash)
    const receipt = await tx.wait()
    console.log("✅ SUCCESS! Gas used:", receipt.gasUsed.toString())
    
  } catch (error) {
    console.error("❌ Failed:", error.reason || error.message)
    
    // Try to decode the error
    if (error.error?.data) {
      console.log("\nError data:", error.error.data)
      
      // Try to decode as Vault error
      try {
        const vaultIface = new ethers.utils.Interface([
          "error Vault_InvalidToken()",
          "error Vault_TokenNotWhitelisted()",
          "error Vault_InvalidTokenAmount()",
          "error Vault_MaxUsdgExceeded()",
          "error Vault_PoolAmountExceeded()",
          "error Vault_PoolAmountLessThanReserved()"
        ])
        const decoded = vaultIface.parseError(error.error.data)
        console.log("Decoded Vault error:", decoded)
      } catch (e) {
        // Not a Vault error
      }
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })