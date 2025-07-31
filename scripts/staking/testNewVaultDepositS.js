const { contractAt } = require("../shared/helpers");
const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Testing deposit with account:", signer.address);
  
  // New vault address with WS support
  const YALP_VAULT = "0x9A858D788d538caBe28b3EDf79922B209A3eD45f";
  const vault = await contractAt("YieldBearingALPVault", YALP_VAULT);
  
  console.log("\n=== Vault Configuration ===");
  const ws = await vault.ws();
  const keeper = await vault.keeper();
  const gov = await vault.gov();
  
  console.log("WS (Wrapped Sonic):", ws);
  console.log("Keeper:", keeper);
  console.log("Gov:", gov);
  
  console.log("\n=== Pre-Deposit State ===");
  
  // Check vault state before deposit
  const totalSupplyBefore = await vault.totalSupply();
  const totalAssetsBefore = await vault.totalAssets();
  const userBalanceBefore = await vault.balanceOf(signer.address);
  
  console.log("Total yALP supply:", ethers.utils.formatEther(totalSupplyBefore));
  console.log("Total fsALP in vault:", ethers.utils.formatEther(totalAssetsBefore));
  console.log("Your yALP balance:", ethers.utils.formatEther(userBalanceBefore));
  
  // Get user's S balance
  const sBalanceBefore = await signer.getBalance();
  console.log("Your S balance:", ethers.utils.formatEther(sBalanceBefore));
  
  // Make a small test deposit - 0.001 S
  const depositAmount = ethers.utils.parseEther("0.001");
  console.log("\n=== Depositing", ethers.utils.formatEther(depositAmount), "S ===");
  
  try {
    const tx = await vault.depositS(
      0, // minUsdg - set to 0 for test
      0, // minGlp - set to 0 for test
      {
        value: depositAmount,
        gasLimit: 2000000 // 2M gas to be safe
      }
    );
    
    console.log("Transaction sent:", tx.hash);
    console.log("Waiting for confirmation...");
    
    const receipt = await tx.wait();
    console.log("✅ Deposit successful!");
    console.log("Gas used:", receipt.gasUsed.toString());
    
    // Parse deposit event
    const depositEvent = receipt.events.find(e => e.event === "Deposit");
    if (depositEvent) {
      console.log("\nDeposit event:");
      console.log("- Sender:", depositEvent.args.sender);
      console.log("- Owner:", depositEvent.args.owner);
      console.log("- Assets (fsALP):", ethers.utils.formatEther(depositEvent.args.assets));
      console.log("- Shares (yALP):", ethers.utils.formatEther(depositEvent.args.shares));
    }
    
  } catch (error) {
    console.log("❌ Deposit failed:", error.message);
    if (error.error && error.error.data) {
      console.log("Error data:", error.error.data);
    }
    return;
  }
  
  console.log("\n=== Post-Deposit State ===");
  
  // Check vault state after deposit
  const totalSupplyAfter = await vault.totalSupply();
  const totalAssetsAfter = await vault.totalAssets();
  const userBalanceAfter = await vault.balanceOf(signer.address);
  const sBalanceAfter = await signer.getBalance();
  
  console.log("Total yALP supply:", ethers.utils.formatEther(totalSupplyAfter));
  console.log("Total fsALP in vault:", ethers.utils.formatEther(totalAssetsAfter));
  console.log("Your yALP balance:", ethers.utils.formatEther(userBalanceAfter));
  console.log("Your S balance:", ethers.utils.formatEther(sBalanceAfter));
  
  // Calculate changes
  console.log("\n=== Summary ===");
  const yalpReceived = userBalanceAfter.sub(userBalanceBefore);
  const fsAlpAdded = totalAssetsAfter.sub(totalAssetsBefore);
  const sSpent = sBalanceBefore.sub(sBalanceAfter);
  
  console.log("yALP received:", ethers.utils.formatEther(yalpReceived));
  console.log("fsALP added to vault:", ethers.utils.formatEther(fsAlpAdded));
  console.log("S spent (including gas):", ethers.utils.formatEther(sSpent));
  
  // Check exchange rate
  if (totalSupplyAfter.gt(0)) {
    const rate = totalAssetsAfter.mul(ethers.utils.parseEther("1")).div(totalSupplyAfter);
    console.log("\nCurrent exchange rate: 1 yALP =", ethers.utils.formatEther(rate), "fsALP");
  }
  
  // Show compound info
  const totalCompounded = await vault.totalCompoundedRewards();
  console.log("\n=== Compound Info ===");
  console.log("Total compounded rewards:", ethers.utils.formatEther(totalCompounded), "fsALP");
  console.log("Keeper can call compound() to reinvest any WS rewards");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });