const { ethers } = require("hardhat")

async function main() {
  const [signer] = await ethers.getSigners()
  console.log("Testing if V1 vault still works with account:", signer.address)
  
  const v1VaultAddress = "0xB91735aE255403B9ab9d97dF671a63807a89f08c"
  const vault = await ethers.getContractAt("YieldBearingALPVaultFixed", v1VaultAddress)
  
  // Small amount
  const amount = ethers.utils.parseEther("0.05")
  
  console.log("\n=== Before Deposit ===")
  const yalpBalanceBefore = await vault.balanceOf(signer.address)
  console.log("yALP balance:", ethers.utils.formatEther(yalpBalanceBefore))
  console.log("Total yALP supply:", ethers.utils.formatEther(await vault.totalSupply()))
  console.log("Total fsALP in vault:", ethers.utils.formatEther(await vault.totalAssets()))
  
  // Test ETH deposit
  console.log("\nDepositing", ethers.utils.formatEther(amount), "S to V1 vault...")
  try {
    const tx = await vault.depositETH(
      0, // minUsdg
      0, // minGlp  
      signer.address,
      { value: amount, gasLimit: 1000000 }
    )
    console.log("Transaction sent:", tx.hash)
    const receipt = await tx.wait()
    console.log("✅ V1 Vault still works!")
    
    const yalpBalanceAfter = await vault.balanceOf(signer.address)
    console.log("\nyALP received:", ethers.utils.formatEther(yalpBalanceAfter.sub(yalpBalanceBefore)))
    
  } catch (error) {
    console.error("❌ V1 Vault failed too:", error.reason || error.message)
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })