const { contractAt } = require("../shared/helpers");
const { ethers } = require("hardhat");

async function main() {
  console.log("Checking minimum deposit amounts and fees...");
  
  // Contract addresses
  const glpManagerAddress = "0x4DE729B85dDB172F1bb775882f355bA25764E430";
  const vaultAddress = "0x5B8caae7cC6Ea61fb96Fd251C4Bc13e48749C7Da";
  const usdgAddress = "0x8846d38481f8e3F9a7dDCBE1DFf0981dB2bC04A3";
  
  const glpManager = await ethers.getContractAt("IGlpManager", glpManagerAddress);
  const vault = await ethers.getContractAt("IVault", vaultAddress);
  const usdg = await ethers.getContractAt("IERC20", usdgAddress);
  
  console.log("\n=== Vault Fee Settings ===");
  
  try {
    const mintBurnFeeBasisPoints = await vault.mintBurnFeeBasisPoints();
    const taxBasisPoints = await vault.taxBasisPoints();
    const stableTaxBasisPoints = await vault.stableTaxBasisPoints();
    const swapFeeBasisPoints = await vault.swapFeeBasisPoints();
    const stableSwapFeeBasisPoints = await vault.stableSwapFeeBasisPoints();
    
    console.log("Mint/Burn fee:", mintBurnFeeBasisPoints.toString(), "bps (", mintBurnFeeBasisPoints.toNumber() / 100, "%)");
    console.log("Tax:", taxBasisPoints.toString(), "bps (", taxBasisPoints.toNumber() / 100, "%)");
    console.log("Stable tax:", stableTaxBasisPoints.toString(), "bps (", stableTaxBasisPoints.toNumber() / 100, "%)");
    console.log("Swap fee:", swapFeeBasisPoints.toString(), "bps (", swapFeeBasisPoints.toNumber() / 100, "%)");
    console.log("Stable swap fee:", stableSwapFeeBasisPoints.toString(), "bps (", stableSwapFeeBasisPoints.toNumber() / 100, "%)");
    
  } catch (error) {
    console.log("Error getting fees:", error.message);
  }
  
  console.log("\n=== Testing Different USDC Amounts ===");
  
  const usdcAddress = "0x29219dd400f2bf60e5a23d13be72b486d4038894";
  const amounts = [
    ethers.utils.parseUnits("0.1", 6),   // $0.10
    ethers.utils.parseUnits("1", 6),     // $1.00
    ethers.utils.parseUnits("10", 6),    // $10.00
    ethers.utils.parseUnits("100", 6),   // $100.00
  ];
  
  for (const amount of amounts) {
    console.log(`\nTesting ${ethers.utils.formatUnits(amount, 6)} USDC:`);
    
    try {
      // Calculate expected USDG output
      const usdgAmount = await vault.getUsdgAmount(usdcAddress, amount);
      console.log("- Expected USDG:", ethers.utils.formatUnits(usdgAmount, 18));
      
      // Check if this meets any minimum
      if (usdgAmount.eq(0)) {
        console.log("  ⚠️  USDG output is 0 - amount too small!");
      }
      
      // Calculate fees
      const feeBasisPoints = await vault.getFeeBasisPoints(usdcAddress, amount, mintBurnFeeBasisPoints, taxBasisPoints, true);
      const afterFeeAmount = amount.mul(10000 - feeBasisPoints).div(10000);
      console.log("- Fee:", feeBasisPoints.toString(), "bps (", feeBasisPoints.toNumber() / 100, "%)");
      console.log("- After fee:", ethers.utils.formatUnits(afterFeeAmount, 6), "USDC");
      
    } catch (error) {
      console.log("- Error:", error.message);
    }
  }
  
  console.log("\n=== Checking USDG Total Supply ===");
  
  try {
    const totalSupply = await usdg.totalSupply();
    console.log("USDG total supply:", ethers.utils.formatUnits(totalSupply, 18));
    
    // Check max USDG amounts for tokens
    console.log("\nMax USDG amounts:");
    const tokens = {
      "USDC": usdcAddress,
      "WETH": "0x50c42deacd8fc9773493ed674b675be577f2634b",
      "WS": "0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38"
    };
    
    for (const [name, address] of Object.entries(tokens)) {
      const maxUsdg = await vault.maxUsdgAmounts(address);
      console.log(`${name}: ${ethers.utils.formatUnits(maxUsdg, 18)} USDG`);
      
      if (maxUsdg.gt(0) && totalSupply.gte(maxUsdg)) {
        console.log(`  ⚠️  ${name} has reached max USDG capacity!`);
      }
    }
    
  } catch (error) {
    console.log("Error checking USDG:", error.message);
  }
  
  console.log("\n=== Potential Issues ===");
  console.log("1. Minimum deposit amounts may be too high");
  console.log("2. USDG capacity limits may be reached");
  console.log("3. Fees might make small deposits uneconomical");
  console.log("4. The protocol might be paused or in a restricted mode");
  
  console.log("\n💡 Recommendation: Use native S (ETH) deposits which we know work!");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });