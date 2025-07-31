const { contractAt } = require("../shared/helpers");
const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Testing deposit with account:", signer.address);
  
  const vaultAddress = "0x2A7353242c2C0BbF9cB56bEe98b6b5f2Fa528Cfa";
  const vault = await contractAt("YieldBearingALPVault", vaultAddress);
  
  // Check balance before
  const ethBalance = await signer.getBalance();
  console.log("\n=== Before Deposit ===");
  console.log("Your S balance:", ethers.utils.formatEther(ethBalance), "S");
  
  if (ethBalance.lt(ethers.utils.parseEther("5.1"))) {
    console.log("❌ Insufficient balance. Need at least 5.1 S (5 S + gas)");
    return;
  }
  
  const yalpBalanceBefore = await vault.balanceOf(signer.address);
  console.log("Your yALP balance:", ethers.utils.formatEther(yalpBalanceBefore), "yALP");
  
  const totalSupplyBefore = await vault.totalSupply();
  console.log("Total yALP supply:", ethers.utils.formatEther(totalSupplyBefore), "yALP");
  
  const totalAssetsBefore = await vault.totalAssets();
  console.log("Vault's total fsALP:", ethers.utils.formatEther(totalAssetsBefore), "fsALP");
  
  console.log("\n=== Depositing 5 S ===");
  
  try {
    const depositAmount = ethers.utils.parseEther("5");
    console.log("Deposit amount:", ethers.utils.formatEther(depositAmount), "S");
    
    const tx = await vault.depositETH(
      0, // minUsdg - set to 0 for no slippage protection
      0, // minGlp - set to 0 for no slippage protection
      signer.address, // receiver
      {
        value: depositAmount,
        gasLimit: 1500000
      }
    );
    
    console.log("Transaction sent:", tx.hash);
    console.log("Waiting for confirmation...");
    
    const receipt = await tx.wait();
    console.log("\n✅ Deposit successful!");
    console.log("Transaction hash:", receipt.transactionHash);
    console.log("Gas used:", receipt.gasUsed.toString());
    console.log("Block number:", receipt.blockNumber);
    
    // Parse events
    const transferEvent = receipt.events.find(e => e.event === "Transfer");
    const depositEvent = receipt.events.find(e => e.event === "Deposit");
    
    if (depositEvent) {
      console.log("\n📊 Deposit Event Details:");
      console.log("- Depositor:", depositEvent.args.caller);
      console.log("- Receiver:", depositEvent.args.owner);
      console.log("- fsALP received:", ethers.utils.formatEther(depositEvent.args.assets), "fsALP");
      console.log("- yALP minted:", ethers.utils.formatEther(depositEvent.args.shares), "yALP");
    }
    
  } catch (error) {
    console.log("\n❌ Deposit failed:", error.message);
    if (error.error && error.error.data) {
      console.log("Error data:", error.error.data);
    }
    return;
  }
  
  console.log("\n=== After Deposit ===");
  
  const ethBalanceAfter = await signer.getBalance();
  console.log("Your S balance:", ethers.utils.formatEther(ethBalanceAfter), "S");
  console.log("S spent (including gas):", ethers.utils.formatEther(ethBalance.sub(ethBalanceAfter)), "S");
  
  const yalpBalanceAfter = await vault.balanceOf(signer.address);
  console.log("Your yALP balance:", ethers.utils.formatEther(yalpBalanceAfter), "yALP");
  console.log("yALP received:", ethers.utils.formatEther(yalpBalanceAfter.sub(yalpBalanceBefore)), "yALP");
  
  const totalSupplyAfter = await vault.totalSupply();
  console.log("Total yALP supply:", ethers.utils.formatEther(totalSupplyAfter), "yALP");
  
  const totalAssetsAfter = await vault.totalAssets();
  console.log("Vault's total fsALP:", ethers.utils.formatEther(totalAssetsAfter), "fsALP");
  
  // Calculate exchange rate
  if (totalSupplyAfter.gt(0)) {
    const oneYALP = ethers.utils.parseEther("1");
    const assetsPerYALP = await vault.convertToAssets(oneYALP);
    console.log("\n💱 Exchange Rate:");
    console.log("1 yALP =", ethers.utils.formatEther(assetsPerYALP), "fsALP");
    
    const sharesPerALP = await vault.convertToShares(oneYALP);
    console.log("1 fsALP =", ethers.utils.formatEther(sharesPerALP), "yALP");
  }
  
  console.log("\n✨ Deposit complete! You now hold yALP tokens that auto-compound trading fee rewards.");
  console.log("🔗 View transaction: https://sonicscan.org/tx/" + receipt.transactionHash);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });