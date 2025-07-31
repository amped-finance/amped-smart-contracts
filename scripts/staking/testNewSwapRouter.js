const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Testing with signer:", signer.address);
  
  const swapRouterAddress = "0xa345894126e7728F7ed5894aABFD2C9661cB2eB1"; // New deployment
  const ampedTokenAddress = "0x0737f1ec667aea0eb45480bdec3aa9747fea38d6"; // Correct AMPED token
  const ampTokenAddress = "0xd1Af6E098F7ee3282578862C3285F754D0128a6f"; // AMP token
  
  // Get contract instances
  const swapRouter = await ethers.getContractAt("AmpedSwapRouter", swapRouterAddress);
  const ampedToken = await ethers.getContractAt("contracts/libraries/token/IERC20.sol:IERC20", ampedTokenAddress);
  const ampToken = await ethers.getContractAt("contracts/libraries/token/IERC20.sol:IERC20", ampTokenAddress);
  
  console.log("\n=== New AmpedSwapRouter Configuration ===");
  
  // Check if initialized
  const isInitialized = await swapRouter.isInitialized();
  console.log("Is initialized:", isInitialized);
  
  // Check token addresses
  const configuredAmpedToken = await swapRouter.ampedToken();
  const configuredAmpToken = await swapRouter.ampToken();
  console.log("Configured AMPED token:", configuredAmpedToken);
  console.log("Expected AMPED token:", ampedTokenAddress);
  console.log("AMPED token match:", configuredAmpedToken.toLowerCase() === ampedTokenAddress.toLowerCase());
  console.log("Configured AMP token:", configuredAmpToken);
  
  // Check if signer is handler
  const isHandler = await swapRouter.isHandler(signer.address);
  const gov = await swapRouter.gov();
  console.log("\nHandler status:");
  console.log("Is signer a handler:", isHandler);
  console.log("Is signer governance:", signer.address === gov);
  
  // Check swap settings
  const useExternalDex = await swapRouter.useExternalDex();
  const swapRatio = await swapRouter.swapRatio();
  
  console.log("\n=== Swap Settings ===");
  console.log("Use external DEX:", useExternalDex);
  console.log("Swap ratio:", swapRatio.toString(), "(10000 = 1:1)");
  
  // Check token balances
  console.log("\n=== Token Balances ===");
  const signerAmpedBalance = await ampedToken.balanceOf(signer.address);
  const signerAmpBalance = await ampToken.balanceOf(signer.address);
  const routerAmpedBalance = await ampedToken.balanceOf(swapRouterAddress);
  const routerAmpBalance = await ampToken.balanceOf(swapRouterAddress);
  
  console.log("Signer AMPED balance:", ethers.utils.formatEther(signerAmpedBalance));
  console.log("Signer AMP balance:", ethers.utils.formatEther(signerAmpBalance));
  console.log("Router AMPED balance:", ethers.utils.formatEther(routerAmpedBalance));
  console.log("Router AMP balance:", ethers.utils.formatEther(routerAmpBalance));
  
  // Check allowances
  console.log("\n=== Allowances ===");
  const ampedAllowance = await ampedToken.allowance(signer.address, swapRouterAddress);
  const ampAllowance = await ampToken.allowance(signer.address, swapRouterAddress);
  console.log("AMPED allowance to router:", ethers.utils.formatEther(ampedAllowance));
  console.log("AMP allowance to router:", ethers.utils.formatEther(ampAllowance));
  
  console.log("\n=== Next Steps ===");
  
  if (!isHandler && signer.address !== gov) {
    console.log("1. Add yourself as a handler:");
    console.log(`   await swapRouter.setHandler("${signer.address}", true)`);
  }
  
  if (routerAmpBalance.eq(0) && routerAmpedBalance.eq(0)) {
    console.log("\n2. Fund the router with tokens for liquidity:");
    console.log("   - Deposit AMP tokens for AMPED->AMP swaps");
    console.log("   - Deposit AMPED tokens for AMP->AMPED swaps");
  }
  
  console.log("\n3. To test swaps:");
  console.log("   - Ensure you have tokens to swap");
  console.log("   - Set appropriate allowances");
  console.log("   - Call swap function");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });