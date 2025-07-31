const { ethers } = require("hardhat")

async function main() {
  const [signer] = await ethers.getSigners()
  console.log("Testing withdraw on V1 vault with account:", signer.address)
  
  const v1VaultAddress = "0xB91735aE255403B9ab9d97dF671a63807a89f08c"
  const vault = await ethers.getContractAt("YieldBearingALPVaultFixed", v1VaultAddress)
  
  // Check current balance
  const yalpBalance = await vault.balanceOf(signer.address)
  console.log("\nCurrent yALP balance:", ethers.utils.formatEther(yalpBalance))
  
  if (yalpBalance.eq(0)) {
    console.log("No yALP balance to withdraw. Depositing first...")
    
    // Deposit some ETH first
    const depositAmount = ethers.utils.parseEther("0.05")
    const depositTx = await vault.depositETH(0, 0, signer.address, { value: depositAmount })
    await depositTx.wait()
    console.log("Deposited", ethers.utils.formatEther(depositAmount), "S")
    
    const newBalance = await vault.balanceOf(signer.address)
    console.log("New yALP balance:", ethers.utils.formatEther(newBalance))
  }
  
  // Test withdraw to native token (ETH/S)
  const withdrawAmount = yalpBalance.div(2) // Withdraw half
  console.log("\n=== Testing withdrawETH ===")
  console.log("Withdrawing", ethers.utils.formatEther(withdrawAmount), "yALP...")
  
  const ethBalanceBefore = await ethers.provider.getBalance(signer.address)
  
  try {
    const tx = await vault.withdrawETH(
      withdrawAmount,
      0, // minOut
      signer.address,
      { gasLimit: 1500000 }
    )
    console.log("Transaction sent:", tx.hash)
    const receipt = await tx.wait()
    console.log("✅ WithdrawETH successful! Gas used:", receipt.gasUsed.toString())
    
    const ethBalanceAfter = await ethers.provider.getBalance(signer.address)
    const ethReceived = ethBalanceAfter.sub(ethBalanceBefore).add(receipt.gasUsed.mul(receipt.effectiveGasPrice))
    console.log("S received:", ethers.utils.formatEther(ethReceived))
    
  } catch (error) {
    console.error("❌ WithdrawETH failed:", error.reason || error.message)
    if (error.error?.data) {
      console.log("Error data:", error.error.data)
    }
  }
  
  // Also test withdraw to USDC
  console.log("\n=== Testing withdraw to USDC ===")
  const remainingBalance = await vault.balanceOf(signer.address)
  const usdcAddress = "0x29219dd400f2Bf60E5a23d13be72B486D4038894"
  
  if (remainingBalance.gt(0)) {
    try {
      const withdrawHalf = remainingBalance.div(2)
      console.log("Withdrawing", ethers.utils.formatEther(withdrawHalf), "yALP to USDC...")
      
      const usdc = await ethers.getContractAt("IERC20", usdcAddress)
      const usdcBefore = await usdc.balanceOf(signer.address)
      
      const tx = await vault.withdraw(
        withdrawHalf,
        usdcAddress,
        0, // minOut
        signer.address,
        { gasLimit: 1500000 }
      )
      console.log("Transaction sent:", tx.hash)
      const receipt = await tx.wait()
      console.log("✅ Withdraw to USDC successful!")
      
      const usdcAfter = await usdc.balanceOf(signer.address)
      console.log("USDC received:", ethers.utils.formatUnits(usdcAfter.sub(usdcBefore), 6))
      
    } catch (error) {
      console.error("❌ Withdraw to USDC failed:", error.reason || error.message)
    }
  }
  
  // Check final state
  console.log("\n=== Final State ===")
  const finalYalpBalance = await vault.balanceOf(signer.address)
  const totalSupply = await vault.totalSupply()
  const totalAssets = await vault.totalAssets()
  
  console.log("Final yALP balance:", ethers.utils.formatEther(finalYalpBalance))
  console.log("Total yALP supply:", ethers.utils.formatEther(totalSupply))
  console.log("Total fsALP in vault:", ethers.utils.formatEther(totalAssets))
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })