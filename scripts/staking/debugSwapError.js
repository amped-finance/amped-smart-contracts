const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Testing with signer:", signer.address);
  
  const swapRouterAddress = "0x3B77EAEDa0F83b1447bda1CA92284644FefF8C56";
  const ampedTokenAddress = "0xAFf9B4Daa4dC69D0a40A6bF4955AD2A5F6Bec05C";
  const ampTokenAddress = "0xd1Af6E098F7ee3282578862C3285F754D0128a6f";
  
  // Get contract instances
  const swapRouter = await ethers.getContractAt("AmpedSwapRouter", swapRouterAddress);
  const ampedToken = await ethers.getContractAt("contracts/libraries/token/IERC20.sol:IERC20", ampedTokenAddress);
  const ampToken = await ethers.getContractAt("contracts/libraries/token/IERC20.sol:IERC20", ampTokenAddress);
  
  console.log("\n=== Issue Analysis ===");
  
  // 1. Check if caller is handler
  const isHandler = await swapRouter.isHandler(signer.address);
  const gov = await swapRouter.gov();
  console.log("1. Handler Check:");
  console.log("   - Is signer a handler:", isHandler);
  console.log("   - Is signer governance:", signer.address === gov);
  
  if (!isHandler && signer.address !== gov) {
    console.log("   ❌ ISSUE: You are not authorized to call swap()");
    console.log("   SOLUTION: Add your address as a handler first");
    
    // If we're governance, add ourselves as handler
    if (signer.address === gov) {
      console.log("\n   Adding governance as handler...");
      const tx = await swapRouter.setHandler(signer.address, true);
      await tx.wait();
      console.log("   ✅ Added as handler!");
    }
  }
  
  // 2. Check token balances
  console.log("\n2. Token Balance Check:");
  const signerAmpedBalance = await ampedToken.balanceOf(signer.address);
  const signerAmpBalance = await ampToken.balanceOf(signer.address);
  console.log("   - Your AMPED balance:", ethers.utils.formatEther(signerAmpedBalance));
  console.log("   - Your AMP balance:", ethers.utils.formatEther(signerAmpBalance));
  
  // 3. Check allowances
  console.log("\n3. Allowance Check:");
  const ampedAllowance = await ampedToken.allowance(signer.address, swapRouterAddress);
  const ampAllowance = await ampToken.allowance(signer.address, swapRouterAddress);
  console.log("   - AMPED allowance to router:", ethers.utils.formatEther(ampedAllowance));
  console.log("   - AMP allowance to router:", ethers.utils.formatEther(ampAllowance));
  
  // 4. Check router token reserves
  console.log("\n4. Router Reserve Check:");
  const routerAmpedBalance = await ampedToken.balanceOf(swapRouterAddress);
  const routerAmpBalance = await ampToken.balanceOf(swapRouterAddress);
  console.log("   - Router AMPED balance:", ethers.utils.formatEther(routerAmpedBalance));
  console.log("   - Router AMP balance:", ethers.utils.formatEther(routerAmpBalance));
  
  // 5. Test a swap if possible
  console.log("\n=== Attempting Test Swap ===");
  
  // Check if we can do AMPED -> AMP swap
  if (signerAmpedBalance.gt(0) && routerAmpBalance.gt(0)) {
    const swapAmount = ethers.utils.parseEther("1");
    
    if (signerAmpedBalance.gte(swapAmount)) {
      console.log("Attempting to swap 1 AMPED for AMP...");
      
      // Check and set allowance if needed
      if (ampedAllowance.lt(swapAmount)) {
        console.log("Setting AMPED allowance...");
        const approveTx = await ampedToken.approve(swapRouterAddress, swapAmount);
        await approveTx.wait();
        console.log("✅ Allowance set!");
      }
      
      // Try the swap
      try {
        const swapTx = await swapRouter.swap(ampedTokenAddress, ampTokenAddress, swapAmount);
        const receipt = await swapTx.wait();
        console.log("✅ Swap successful! Tx:", receipt.transactionHash);
      } catch (error) {
        console.log("❌ Swap failed:", error.reason || error.message);
      }
    } else {
      console.log("❌ Insufficient AMPED balance for test swap");
    }
  }
  
  // Check if we can do AMP -> AMPED swap
  else if (signerAmpBalance.gt(0) && routerAmpedBalance.gt(0)) {
    const swapAmount = ethers.utils.parseEther("1");
    
    if (signerAmpBalance.gte(swapAmount)) {
      console.log("Attempting to swap 1 AMP for AMPED...");
      
      // Check and set allowance if needed
      if (ampAllowance.lt(swapAmount)) {
        console.log("Setting AMP allowance...");
        const approveTx = await ampToken.approve(swapRouterAddress, swapAmount);
        await approveTx.wait();
        console.log("✅ Allowance set!");
      }
      
      // Try the swap
      try {
        const swapTx = await swapRouter.swap(ampTokenAddress, ampedTokenAddress, swapAmount);
        const receipt = await swapTx.wait();
        console.log("✅ Swap successful! Tx:", receipt.transactionHash);
      } catch (error) {
        console.log("❌ Swap failed:", error.reason || error.message);
      }
    } else {
      console.log("❌ Insufficient AMP balance for test swap");
    }
  } else {
    console.log("❌ Cannot test swap - either you have no tokens or router has no reserves");
  }
  
  console.log("\n=== Summary ===");
  console.log("The 'transfer amount exceeds balance' error can be caused by:");
  console.log("1. Not being a handler (onlyHandler modifier)");
  console.log("2. Insufficient token balance in your wallet");
  console.log("3. Insufficient allowance to the router");
  console.log("4. Router has insufficient output token reserves");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });