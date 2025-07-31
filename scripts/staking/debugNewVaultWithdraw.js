const { ethers } = require("hardhat")

async function main() {
  const [signer] = await ethers.getSigners()
  console.log("Debugging withdraw on new vault...")
  
  const vaultAddress = "0xd2e4b0cC3FB79ef958137206cbEd94C7a5C7972d"
  const vault = await ethers.getContractAt("YieldBearingALPVaultETH", vaultAddress)
  
  const yalpBalance = await vault.balanceOf(signer.address)
  console.log("Current yALP balance:", ethers.utils.formatEther(yalpBalance))
  
  // Test different withdraw amounts
  const testAmounts = [
    yalpBalance.div(10),   // 10%
    yalpBalance.div(4),    // 25%
    yalpBalance.div(2),    // 50%
    yalpBalance            // 100%
  ]
  
  console.log("\nTesting withdraw with different amounts...")
  
  for (let i = 0; i < testAmounts.length; i++) {
    const amount = testAmounts[i]
    console.log(`\nTest ${i+1}: Withdrawing ${ethers.utils.formatEther(amount)} yALP (${i === 3 ? '100%' : `${(i+1)*10}%`})`)
    
    try {
      // First simulate with callStatic
      const simulatedResult = await vault.callStatic.withdrawETH(
        amount,
        0,
        signer.address,
        { gasLimit: 3000000 }
      )
      console.log("✅ Simulation successful, would receive:", ethers.utils.formatEther(simulatedResult), "S")
      
      // Try actual transaction
      const tx = await vault.withdrawETH(
        amount,
        0,
        signer.address,
        { gasLimit: 3000000 }
      )
      console.log("✅ Transaction sent:", tx.hash)
      const receipt = await tx.wait()
      console.log("✅ Withdraw successful! Gas used:", receipt.gasUsed.toString())
      break
      
    } catch (error) {
      console.log("❌ Failed:", error.reason || error.message)
      
      // Try to estimate gas to see if it's a gas issue
      try {
        const estimatedGas = await vault.estimateGas.withdrawETH(amount, 0, signer.address)
        console.log("Gas estimate:", estimatedGas.toString())
      } catch (gasError) {
        console.log("Gas estimation also failed")
      }
    }
  }
  
  // Check cooldown or other restrictions
  const glpManagerAddress = "0x4DE729B85dDB172F1bb775882f355bA25764E430"
  const glpManager = await ethers.getContractAt("GlpManager", glpManagerAddress)
  
  console.log("\n=== Checking GlpManager restrictions ===")
  const cooldown = await glpManager.cooldownDuration()
  console.log("Cooldown duration:", cooldown.toString(), "seconds")
  
  const lastAddedAt = await glpManager.lastAddedAt(vaultAddress)
  console.log("Vault lastAddedAt:", lastAddedAt.toString())
  
  if (lastAddedAt.gt(0)) {
    const currentTime = Math.floor(Date.now() / 1000)
    const timeSinceLastAdd = currentTime - lastAddedAt.toNumber()
    console.log("Time since last add:", timeSinceLastAdd, "seconds")
    console.log("Cooldown remaining:", Math.max(0, cooldown.toNumber() - timeSinceLastAdd), "seconds")
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })