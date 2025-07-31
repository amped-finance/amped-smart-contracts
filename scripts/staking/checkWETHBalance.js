const { contractAt } = require("../shared/helpers");
const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Checking WETH balance for account:", signer.address);
  
  // WETH address on Base Sepolia
  const wethAddress = "0x4200000000000000000000000000000000000006";
  const weth = await contractAt("Token", wethAddress);
  
  // Check WETH balance
  const wethBalance = await weth.balanceOf(signer.address);
  console.log("WETH balance:", ethers.utils.formatEther(wethBalance), "WETH");
  console.log("WETH balance (raw):", wethBalance.toString());
  
  // Check ETH balance
  const ethBalance = await signer.getBalance();
  console.log("ETH balance:", ethers.utils.formatEther(ethBalance), "ETH");
  
  // Amount trying to transfer
  const transferAmount = ethers.utils.parseEther("0.05");
  console.log("\nTrying to transfer:", ethers.utils.formatEther(transferAmount), "WETH");
  
  if (wethBalance.lt(transferAmount)) {
    console.log("❌ Insufficient WETH balance!");
    console.log("Need:", ethers.utils.formatEther(transferAmount), "WETH");
    console.log("Have:", ethers.utils.formatEther(wethBalance), "WETH");
    console.log("Shortfall:", ethers.utils.formatEther(transferAmount.sub(wethBalance)), "WETH");
  } else {
    console.log("✅ Sufficient WETH balance");
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  }); 