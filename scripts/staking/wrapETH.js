const { contractAt, sendTxn } = require("../shared/helpers");
const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Wrapping ETH to WETH for account:", signer.address);
  
  // WETH address on Base Sepolia
  const wethAddress = "0x4200000000000000000000000000000000000006";
  const weth = await ethers.getContractAt("IWETH", wethAddress);
  
  // Check current balances
  const ethBalance = await signer.getBalance();
  const wethBalance = await weth.balanceOf(signer.address);
  
  console.log("Current ETH balance:", ethers.utils.formatEther(ethBalance), "ETH");
  console.log("Current WETH balance:", ethers.utils.formatEther(wethBalance), "WETH");
  
  // Amount needed for reward distribution
  const neededAmount = ethers.utils.parseEther("0.05");
  const shortfall = neededAmount.sub(wethBalance);
  
  if (shortfall.lte(0)) {
    console.log("✅ Already have enough WETH!");
    return;
  }
  
  // Add a small buffer (0.001 ETH) to account for potential rounding
  const wrapAmount = shortfall.add(ethers.utils.parseEther("0.001"));
  
  console.log("\nNeed to wrap:", ethers.utils.formatEther(wrapAmount), "ETH");
  
  if (ethBalance.lt(wrapAmount)) {
    console.log("❌ Insufficient ETH balance to wrap!");
    console.log("Need:", ethers.utils.formatEther(wrapAmount), "ETH");
    console.log("Have:", ethers.utils.formatEther(ethBalance), "ETH");
    return;
  }
  
  // Wrap ETH to WETH
  console.log("\nWrapping ETH to WETH...");
  await sendTxn(
    weth.deposit({ value: wrapAmount, gasLimit: 100000 }),
    "weth.deposit"
  );
  
  // Check new balances
  const newEthBalance = await signer.getBalance();
  const newWethBalance = await weth.balanceOf(signer.address);
  
  console.log("\n✅ Wrapping complete!");
  console.log("New ETH balance:", ethers.utils.formatEther(newEthBalance), "ETH");
  console.log("New WETH balance:", ethers.utils.formatEther(newWethBalance), "WETH");
  console.log("Ready for reward distribution!");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  }); 