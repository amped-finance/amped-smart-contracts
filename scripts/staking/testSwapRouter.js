const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Testing with signer:", signer.address);
  
  const swapRouterAddress = "0x3B77EAEDa0F83b1447bda1CA92284644FefF8C56";
  
  // Get contract instances
  const swapRouter = await ethers.getContractAt("AmpedSwapRouter", swapRouterAddress);
  
  console.log("\n=== Checking AmpedSwapRouter Configuration ===");
  
  // Check if initialized
  const isInitialized = await swapRouter.isInitialized();
  console.log("Is initialized:", isInitialized);
  
  if (!isInitialized) {
    console.log("ERROR: Router not initialized!");
    return;
  }
  
  // Check token addresses
  const ampedToken = await swapRouter.ampedToken();
  const ampToken = await swapRouter.ampToken();
  console.log("AMPED token:", ampedToken);
  console.log("AMP token:", ampToken);
  
  // Check if signer is handler
  const isHandler = await swapRouter.isHandler(signer.address);
  console.log("Is signer a handler:", isHandler);
  
  // Check governance
  const gov = await swapRouter.gov();
  console.log("Governance address:", gov);
  
  // Check swap settings
  const useExternalDex = await swapRouter.useExternalDex();
  const swapRatio = await swapRouter.swapRatio();
  const dexRouter = await swapRouter.dexRouter();
  
  console.log("\n=== Swap Settings ===");
  console.log("Use external DEX:", useExternalDex);
  console.log("Swap ratio:", swapRatio.toString(), "(10000 = 1:1)");
  console.log("DEX router:", dexRouter);
  
  // Check if router has token balances
  console.log("\n=== Token Balances ===");
  if (ampedToken !== ethers.constants.AddressZero) {
    const ampedContract = await ethers.getContractAt("contracts/libraries/token/IERC20.sol:IERC20", ampedToken);
    const ampedBalance = await ampedContract.balanceOf(swapRouterAddress);
    console.log("Router AMPED balance:", ethers.utils.formatEther(ampedBalance));
  }
  
  if (ampToken !== ethers.constants.AddressZero) {
    const ampContract = await ethers.getContractAt("contracts/libraries/token/IERC20.sol:IERC20", ampToken);
    const ampBalance = await ampContract.balanceOf(swapRouterAddress);
    console.log("Router AMP balance:", ethers.utils.formatEther(ampBalance));
  }
  
  console.log("\n=== Diagnosis ===");
  if (!isHandler && signer.address !== gov) {
    console.log("❌ ERROR: Your address is not a handler and not governance!");
    console.log("   The swap function requires onlyHandler modifier.");
    console.log("   Ask governance to add your address as a handler.");
  }
  
  if (ampedToken === ethers.constants.AddressZero || ampToken === ethers.constants.AddressZero) {
    console.log("❌ ERROR: Token addresses not set!");
    console.log("   Router needs to be initialized with token addresses.");
  }
  
  if (!useExternalDex) {
    // Internal swap mode
    if (ampedToken !== ethers.constants.AddressZero && ampToken !== ethers.constants.AddressZero) {
      const ampedContract = await ethers.getContractAt("contracts/libraries/token/IERC20.sol:IERC20", ampedToken);
      const ampContract = await ethers.getContractAt("contracts/libraries/token/IERC20.sol:IERC20", ampToken);
      const ampedBalance = await ampedContract.balanceOf(swapRouterAddress);
      const ampBalance = await ampContract.balanceOf(swapRouterAddress);
      
      if (ampedBalance.eq(0) && ampBalance.eq(0)) {
        console.log("❌ WARNING: Router has no token balances!");
        console.log("   For internal swaps, router needs token liquidity.");
      }
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });