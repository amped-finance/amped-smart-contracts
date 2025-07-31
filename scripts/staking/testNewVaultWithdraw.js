const { ethers } = require("hardhat")

async function main() {
  const [signer] = await ethers.getSigners()
  console.log("Testing withdraw on new YieldBearingALPVaultETH with account:", signer.address)
  
  const vaultAddress = "0xd2e4b0cC3FB79ef958137206cbEd94C7a5C7972d"
  const vault = await ethers.getContractAt("YieldBearingALPVaultETH", vaultAddress)
  
  // Check current state
  console.log("\n=== Current State ===")
  const yalpBalance = await vault.balanceOf(signer.address)
  const totalSupply = await vault.totalSupply()
  const totalAssets = await vault.totalAssets()
  
  console.log("Your yALP balance:", ethers.utils.formatEther(yalpBalance))
  console.log("Total yALP supply:", ethers.utils.formatEther(totalSupply))
  console.log("Total fsALP in vault:", ethers.utils.formatEther(totalAssets))
  
  if (yalpBalance.eq(0)) {
    console.log("\nNo yALP balance to withdraw. Let's deposit first...")
    
    // Deposit some ETH
    const depositAmount = ethers.utils.parseEther("0.1")
    console.log("\nDepositing", ethers.utils.formatEther(depositAmount), "S...")
    
    try {
      const depositTx = await vault.depositETH(0, 0, signer.address, { 
        value: depositAmount,
        gasLimit: 2000000 
      })
      console.log("Deposit tx sent:", depositTx.hash)
      const depositReceipt = await depositTx.wait()
      console.log("✅ Deposit successful! Gas used:", depositReceipt.gasUsed.toString())
      
      // Update balance
      const newYalpBalance = await vault.balanceOf(signer.address)
      console.log("New yALP balance:", ethers.utils.formatEther(newYalpBalance))
      
    } catch (error) {
      console.error("❌ Deposit failed:", error.reason || error.message)
      return
    }
  }
  
  // Now test withdraw
  const updatedBalance = await vault.balanceOf(signer.address)
  if (updatedBalance.gt(0)) {
    console.log("\n=== Testing Withdraw ===")
    
    // Withdraw half of the balance
    const withdrawAmount = updatedBalance.div(2)
    console.log("Withdrawing", ethers.utils.formatEther(withdrawAmount), "yALP...")
    
    const ethBalanceBefore = await ethers.provider.getBalance(signer.address)
    
    try {
      const withdrawTx = await vault.withdrawETH(
        withdrawAmount,
        0, // minOut
        signer.address,
        { gasLimit: 2000000 }
      )
      console.log("Withdraw tx sent:", withdrawTx.hash)
      const receipt = await withdrawTx.wait()
      console.log("✅ Withdraw successful! Gas used:", receipt.gasUsed.toString())
      
      // Calculate ETH received
      const ethBalanceAfter = await ethers.provider.getBalance(signer.address)
      const gasSpent = receipt.gasUsed.mul(receipt.effectiveGasPrice)
      const ethReceived = ethBalanceAfter.sub(ethBalanceBefore).add(gasSpent)
      
      console.log("\nETH received:", ethers.utils.formatEther(ethReceived))
      
      // Check final state
      console.log("\n=== Final State ===")
      const finalYalpBalance = await vault.balanceOf(signer.address)
      const finalTotalSupply = await vault.totalSupply()
      const finalTotalAssets = await vault.totalAssets()
      
      console.log("Your yALP balance:", ethers.utils.formatEther(finalYalpBalance))
      console.log("Total yALP supply:", ethers.utils.formatEther(finalTotalSupply))
      console.log("Total fsALP in vault:", ethers.utils.formatEther(finalTotalAssets))
      
      // Verify exchange rate remained stable
      if (finalTotalSupply.gt(0)) {
        const exchangeRate = finalTotalAssets.mul(ethers.utils.parseEther("1")).div(finalTotalSupply)
        console.log("\nExchange rate (fsALP per yALP):", ethers.utils.formatEther(exchangeRate))
      }
      
    } catch (error) {
      console.error("❌ Withdraw failed:", error.reason || error.message)
      if (error.error?.data) {
        console.log("Error data:", error.error.data)
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