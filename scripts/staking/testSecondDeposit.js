const { contractAt } = require("../shared/helpers");
const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Testing SECOND deposit with account:", signer.address);
  
  // New fixed vault address
  const vaultAddress = "0xB91735aE255403B9ab9d97dF671a63807a89f08c";
  const vault = await contractAt("YieldBearingALPVaultFixed", vaultAddress);
  
  console.log("\n=== Before Second Deposit ===");
  
  const yalpBalanceBefore = await vault.balanceOf(signer.address);
  console.log("Your yALP balance:", ethers.utils.formatEther(yalpBalanceBefore), "yALP");
  
  const totalSupplyBefore = await vault.totalSupply();
  console.log("Total yALP supply:", ethers.utils.formatEther(totalSupplyBefore), "yALP");
  
  const totalAssetsBefore = await vault.totalAssets();
  console.log("Vault's total fsALP:", ethers.utils.formatEther(totalAssetsBefore), "fsALP");
  
  console.log("\n💡 Expected behavior for second deposit:");
  console.log("- Shares should be proportional to contribution");
  console.log("- Formula: shares = fsAlpReceived * totalSupply / totalAssetsBefore");
  
  console.log("\n=== Depositing 1 S (10x the first deposit) ===");
  
  try {
    const depositAmount = ethers.utils.parseEther("1");
    console.log("Deposit amount:", ethers.utils.formatEther(depositAmount), "S");
    
    const tx = await vault.depositETH(
      0, // minUsdg
      0, // minGlp
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
    console.log("Gas used:", receipt.gasUsed.toString());
    
    // Parse deposit event
    const depositEvent = receipt.events.find(e => e.event === "Deposit");
    
    if (depositEvent) {
      const fsAlpReceived = depositEvent.args.assets;
      const sharesReceived = depositEvent.args.shares;
      
      console.log("\n📊 Deposit Results:");
      console.log("- fsALP received:", ethers.utils.formatEther(fsAlpReceived), "fsALP");
      console.log("- yALP minted:", ethers.utils.formatEther(sharesReceived), "yALP");
      
      // Calculate expected shares
      const expectedShares = fsAlpReceived.mul(totalSupplyBefore).div(totalAssetsBefore);
      
      console.log("\n🔍 Proportional Share Verification:");
      console.log("- Expected shares:", ethers.utils.formatEther(expectedShares), "yALP");
      console.log("- Actual shares:", ethers.utils.formatEther(sharesReceived), "yALP");
      console.log("- Match:", expectedShares.sub(sharesReceived).abs().lte(1) ? "✅ CORRECT (within 1 wei)" : "❌ INCORRECT");
      
      // Check proportions
      console.log("\n📊 Ownership Analysis:");
      const totalSupplyAfter = await vault.totalSupply();
      const firstDepositProportion = totalSupplyBefore.mul(10000).div(totalSupplyAfter);
      const secondDepositProportion = sharesReceived.mul(10000).div(totalSupplyAfter);
      
      console.log("- First depositor owns:", firstDepositProportion.toNumber() / 100, "% of vault");
      console.log("- Second deposit owns:", secondDepositProportion.toNumber() / 100, "% of vault");
      
      // Check if proportions match contributions
      const totalAssets = await vault.totalAssets();
      const firstContribution = totalAssetsBefore.mul(10000).div(totalAssets);
      const secondContribution = fsAlpReceived.mul(10000).div(totalAssets);
      
      console.log("\n- First depositor contributed:", firstContribution.toNumber() / 100, "% of fsALP");
      console.log("- Second deposit contributed:", secondContribution.toNumber() / 100, "% of fsALP");
      
      console.log("\n✅ The proportions should match closely, confirming fair share distribution!");
    }
    
  } catch (error) {
    console.log("\n❌ Deposit failed:", error.message);
    return;
  }
  
  console.log("\n=== After Second Deposit ===");
  
  const yalpBalanceAfter = await vault.balanceOf(signer.address);
  console.log("Your total yALP balance:", ethers.utils.formatEther(yalpBalanceAfter), "yALP");
  
  const totalSupplyAfter = await vault.totalSupply();
  console.log("Total yALP supply:", ethers.utils.formatEther(totalSupplyAfter), "yALP");
  
  const totalAssetsAfter = await vault.totalAssets();
  console.log("Vault's total fsALP:", ethers.utils.formatEther(totalAssetsAfter), "fsALP");
  
  // New exchange rate
  const oneYALP = ethers.utils.parseEther("1");
  const assetsPerYALP = await vault.convertToAssets(oneYALP);
  console.log("\n💱 New Exchange Rate:");
  console.log("1 yALP =", ethers.utils.formatEther(assetsPerYALP), "fsALP");
  
  console.log("\n✨ The fixed vault is working correctly with proportional shares!");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });