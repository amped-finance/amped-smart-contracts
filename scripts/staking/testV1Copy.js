const { ethers } = require("hardhat")

async function main() {
  const [signer] = await ethers.getSigners()
  console.log("Testing V1 copy with account:", signer.address)
  
  const vaultAddress = "0xc08505B9f894c0C27bA45e6Fc682469f94694725" // New V1 copy
  const vault = await ethers.getContractAt("YieldBearingALPVaultFixed", vaultAddress)
  
  // Small amount
  const amount = ethers.utils.parseEther("0.05")
  
  console.log("\nTesting ETH deposit on fresh V1 copy...")
  try {
    const tx = await vault.depositETH(
      0, // minUsdg
      0, // minGlp  
      signer.address,
      { value: amount, gasLimit: 1000000 }
    )
    console.log("Transaction sent:", tx.hash)
    const receipt = await tx.wait()
    console.log("✅ V1 copy works without whitelisting!")
    
    const yalpBalance = await vault.balanceOf(signer.address)
    console.log("yALP received:", ethers.utils.formatEther(yalpBalance))
    
  } catch (error) {
    console.error("❌ V1 copy also failed:", error.reason || error.message)
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })