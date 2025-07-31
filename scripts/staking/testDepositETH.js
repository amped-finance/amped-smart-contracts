const { contractAt, sendTxn } = require("../shared/helpers");

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Testing deposit with account:", signer.address);
  
  const vaultAddress = "0x2A7353242c2C0BbF9cB56bEe98b6b5f2Fa528Cfa";
  const vault = await contractAt("YieldBearingALPVault", vaultAddress);
  
  console.log("\n=== Before Deposit ===");
  const yalpBalanceBefore = await vault.balanceOf(signer.address);
  console.log("yALP balance before:", ethers.utils.formatEther(yalpBalanceBefore));
  
  const totalSupplyBefore = await vault.totalSupply();
  console.log("Total supply before:", ethers.utils.formatEther(totalSupplyBefore));
  
  const totalAssetsBefore = await vault.totalAssets();
  console.log("Total assets before:", ethers.utils.formatEther(totalAssetsBefore));
  
  console.log("\n=== Depositing 0.001 ETH ===");
  
  try {
    const tx = await vault.depositETH(0, 0, signer.address, {
      value: ethers.utils.parseEther("0.001"),
      gasLimit: 1500000 // Use higher gas limit
    });
    
    console.log("Transaction sent:", tx.hash);
    const receipt = await tx.wait();
    console.log("✅ Deposit successful!");
    console.log("Gas used:", receipt.gasUsed.toString());
    
    // Parse events
    const depositEvent = receipt.events.find(e => e.event === "Deposit");
    if (depositEvent) {
      console.log("\nDeposit event:");
      console.log("- Caller:", depositEvent.args.caller);
      console.log("- Owner:", depositEvent.args.owner);
      console.log("- Assets:", ethers.utils.formatEther(depositEvent.args.assets));
      console.log("- Shares:", ethers.utils.formatEther(depositEvent.args.shares));
    }
    
  } catch (error) {
    console.log("❌ Deposit failed:", error.message);
    
    // Try to decode the error
    if (error.error && error.error.data) {
      console.log("Error data:", error.error.data);
    }
    return;
  }
  
  console.log("\n=== After Deposit ===");
  const yalpBalanceAfter = await vault.balanceOf(signer.address);
  console.log("yALP balance after:", ethers.utils.formatEther(yalpBalanceAfter));
  
  const totalSupplyAfter = await vault.totalSupply();
  console.log("Total supply after:", ethers.utils.formatEther(totalSupplyAfter));
  
  const totalAssetsAfter = await vault.totalAssets();
  console.log("Total assets after:", ethers.utils.formatEther(totalAssetsAfter));
  
  // Check fsALP balance of vault
  const fsAlpAddress = await vault.fsAlp();
  const fsAlp = await contractAt("IRewardTracker", fsAlpAddress);
  const vaultFsAlpBalance = await fsAlp.stakedAmounts(vault.address);
  console.log("\nVault's fsALP balance:", ethers.utils.formatEther(vaultFsAlpBalance));
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });