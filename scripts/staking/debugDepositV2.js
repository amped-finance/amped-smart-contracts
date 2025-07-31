const { ethers } = require("hardhat")

async function main() {
  const [signer] = await ethers.getSigners()
  
  // Contract addresses
  const vaultAddress = "0xb809E1B3078FFF4920f07aE036852573b13D6d5C"
  const glpManagerAddress = "0x4DE729B85dDB172F1bb775882f355bA25764E430"
  const usdcAddress = "0x29219dd400f2Bf60E5a23d13Be72B486D4038894"
  const glpAddress = "0x6fbaeE8bEf2e8f5c34A08BdD4A4AB777Bd3f6764"
  const fsAlpAddress = "0xB895e3DBFB37A4Cc6b4FB50B1cf903608e942FF9"
  
  console.log("Debugging deposit process...")
  
  // Get contracts
  const vault = await ethers.getContractAt("YieldBearingALPVaultV2", vaultAddress)
  const glpManager = await ethers.getContractAt("GlpManager", glpManagerAddress)
  const usdc = await ethers.getContractAt("IERC20", usdcAddress)
  const glp = await ethers.getContractAt("IERC20", glpAddress)
  const fsAlp = await ethers.getContractAt("IRewardTracker", fsAlpAddress)
  
  const amount = ethers.utils.parseUnits("0.1", 6)
  
  // Check balances
  console.log("\n=== Initial State ===")
  console.log("User USDC balance:", ethers.utils.formatUnits(await usdc.balanceOf(signer.address), 6))
  console.log("Vault USDC balance:", ethers.utils.formatUnits(await usdc.balanceOf(vaultAddress), 6))
  console.log("Vault GLP balance:", ethers.utils.formatUnits(await glp.balanceOf(vaultAddress), 18))
  console.log("Vault fsALP balance:", ethers.utils.formatUnits(await fsAlp.stakedAmounts(vaultAddress), 18))
  
  // Check handler status
  console.log("\n=== Handler Status ===")
  console.log("Is vault a handler in GlpManager?", await glpManager.isHandler(vaultAddress))
  
  // Try to simulate each step
  console.log("\n=== Simulating Deposit Steps ===")
  
  try {
    // Step 1: Approve
    console.log("1. Approving USDC...")
    const approveTx = await usdc.approve(vaultAddress, amount)
    await approveTx.wait()
    console.log("   ✓ Approved")
    
    // Step 2: Transfer to vault (this happens in deposit function)
    console.log("2. Vault will receive USDC via transferFrom")
    
    // Step 3: Try to simulate GlpManager.addLiquidityForAccount
    console.log("3. Testing GlpManager.addLiquidityForAccount...")
    
    // First approve GlpManager from vault's perspective
    // This would normally happen inside the vault
    console.log("   - Vault would approve GlpManager for USDC")
    
    // Try a static call to see if it would work
    try {
      // We can't directly call this as the vault, but we can check if the vault can
      console.log("   - Checking if addLiquidityForAccount would work...")
      
      // Instead, let's just try the full deposit
      console.log("\n4. Attempting full deposit...")
      const depositTx = await vault.deposit(
        usdcAddress,
        amount,
        0, // minUsdg
        0, // minGlp
        signer.address,
        { gasLimit: 2000000 }
      )
      console.log("Transaction sent:", depositTx.hash)
      const receipt = await depositTx.wait()
      console.log("✅ Deposit successful!")
      
      // Check final state
      console.log("\n=== Final State ===")
      console.log("User yALP balance:", ethers.utils.formatUnits(await vault.balanceOf(signer.address), 18))
      console.log("Vault fsALP balance:", ethers.utils.formatUnits(await fsAlp.stakedAmounts(vaultAddress), 18))
      
    } catch (error) {
      console.error("   ✗ Error:", error.reason || error.message)
      
      // Try to get more details
      if (error.error?.data) {
        console.log("   Error data:", error.error.data)
      }
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