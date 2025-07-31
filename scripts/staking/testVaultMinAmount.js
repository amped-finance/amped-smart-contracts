const { ethers } = require("hardhat")

async function main() {
  const [signer] = await ethers.getSigners()
  
  const vaultAddress = "0xb809E1B3078FFF4920f07aE036852573b13D6d5C"
  const usdcAddress = "0x29219dd400f2bf60e5a23d13be72b486d4038894"
  
  const vault = await ethers.getContractAt("YieldBearingALPVaultV2", vaultAddress)
  const usdc = await ethers.getContractAt("IERC20", usdcAddress)
  
  console.log("Testing with different amounts to find minimum...")
  
  // Test with different amounts
  const amounts = [
    ethers.utils.parseUnits("1", 6),    // $1
    ethers.utils.parseUnits("0.1", 6),  // $0.10
    ethers.utils.parseUnits("0.01", 6), // $0.01
  ]
  
  for (const amount of amounts) {
    console.log(`\nTesting with ${ethers.utils.formatUnits(amount, 6)} USDC...`)
    
    try {
      // Approve
      await usdc.approve(vaultAddress, amount)
      
      // Calculate minimum expected GLP (with high slippage tolerance)
      const minGlp = amount.mul(95).div(100) // 5% slippage
      
      // Try deposit with calculated minimums
      const tx = await vault.deposit(
        usdcAddress,
        amount,
        0,      // minUsdg = 0 for now
        minGlp, // minGlp with slippage
        signer.address,
        { gasLimit: 3000000 }
      )
      
      console.log("✅ Success! Transaction:", tx.hash)
      const receipt = await tx.wait()
      
      // Check events
      const depositEvent = receipt.events.find(e => e.event === "Deposit")
      if (depositEvent) {
        console.log("Received fsALP:", ethers.utils.formatUnits(depositEvent.args.assets, 18))
        console.log("Received yALP:", ethers.utils.formatUnits(depositEvent.args.shares, 18))
      }
      
      break // If successful, stop testing
      
    } catch (error) {
      console.log("❌ Failed:", error.reason || error.message)
      
      // If it's a slippage error, try with 0 minimums
      if (error.message.includes("slippage")) {
        console.log("Retrying with 0 minimums...")
        try {
          const tx = await vault.deposit(
            usdcAddress,
            amount,
            0, // minUsdg
            0, // minGlp
            signer.address,
            { gasLimit: 3000000 }
          )
          console.log("✅ Success with 0 minimums! Transaction:", tx.hash)
          await tx.wait()
          break
        } catch (error2) {
          console.log("Still failed:", error2.reason || error2.message)
        }
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