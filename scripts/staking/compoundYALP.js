const { contractAt } = require("../shared/helpers");
const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Compounding yALP vault with signer:", signer.address);
  
  // Replace with your deployed vault address
  const YALP_VAULT = process.env.YALP_VAULT_ADDRESS || "YOUR_VAULT_ADDRESS_HERE";
  
  if (YALP_VAULT === "YOUR_VAULT_ADDRESS_HERE") {
    console.log("❌ Error: Please set YALP_VAULT_ADDRESS environment variable");
    console.log("Example: YALP_VAULT_ADDRESS=0x... npx hardhat run scripts/staking/compoundYALP.js");
    return;
  }
  
  const vault = await contractAt("YieldBearingALPVault", YALP_VAULT);
  
  console.log("\n=== Pre-Compound State ===");
  
  // Get vault state before compound
  const totalAssetsBefore = await vault.totalAssets();
  const totalSupply = await vault.totalSupply();
  
  console.log("Total fsALP managed:", ethers.utils.formatEther(totalAssetsBefore));
  console.log("Total yALP supply:", ethers.utils.formatEther(totalSupply));
  
  // Check if there's any WETH to compound
  const wethAddress = await vault.weth();
  const weth = await contractAt("IERC20", wethAddress);
  const wethBalance = await weth.balanceOf(vault.address);
  
  console.log("\nWETH balance in vault:", ethers.utils.formatEther(wethBalance));
  
  if (wethBalance.eq(0)) {
    console.log("⚠️  No WETH rewards to compound");
    console.log("\nTip: Rewards accumulate over time as users trade");
    console.log("You may need to wait for trading activity before compounding");
    return;
  }
  
  console.log("\n=== Compounding Rewards ===");
  
  try {
    const tx = await vault.compound({
      gasLimit: 2000000
    });
    
    console.log("Transaction sent:", tx.hash);
    const receipt = await tx.wait();
    console.log("✅ Compound successful!");
    console.log("Gas used:", receipt.gasUsed.toString());
    
  } catch (error) {
    console.log("❌ Compound failed:", error.message);
    return;
  }
  
  console.log("\n=== Post-Compound State ===");
  
  // Get vault state after compound
  const totalAssetsAfter = await vault.totalAssets();
  
  console.log("Total fsALP managed:", ethers.utils.formatEther(totalAssetsAfter));
  
  const alpGained = totalAssetsAfter.sub(totalAssetsBefore);
  console.log("\n📈 ALP gained from compound:", ethers.utils.formatEther(alpGained));
  
  // Calculate new price per share
  if (totalSupply.gt(0)) {
    const pricePerShareBefore = totalAssetsBefore.mul(ethers.utils.parseEther("1")).div(totalSupply);
    const pricePerShareAfter = totalAssetsAfter.mul(ethers.utils.parseEther("1")).div(totalSupply);
    
    console.log("\nPrice per yALP:");
    console.log("- Before:", ethers.utils.formatEther(pricePerShareBefore), "fsALP");
    console.log("- After:", ethers.utils.formatEther(pricePerShareAfter), "fsALP");
    
    if (pricePerShareAfter.gt(pricePerShareBefore)) {
      const percentIncrease = pricePerShareAfter.sub(pricePerShareBefore).mul(10000).div(pricePerShareBefore);
      console.log("- Increase:", percentIncrease.toNumber() / 100, "%");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });