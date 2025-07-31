const { contractAt } = require("../shared/helpers");
const { ethers } = require("hardhat");

async function main() {
  const YALP_VAULT = "0x1358cC494A3D2588BB70fDc173EedeE4C5aFBEF3";
  const vault = await contractAt("YieldBearingALPVault", YALP_VAULT);
  
  console.log("Checking yALP Vault State...\n");
  console.log("Vault address:", YALP_VAULT);
  
  // Check basic state
  const totalSupply = await vault.totalSupply();
  const totalAssets = await vault.totalAssets();
  const lastDeposit = await vault.lastDeposit();
  
  console.log("\n=== Vault State ===");
  console.log("Total Supply:", ethers.utils.formatEther(totalSupply), "yALP");
  console.log("Total Assets:", ethers.utils.formatEther(totalAssets), "fsALP");
  console.log("Last Deposit Timestamp:", lastDeposit.toString());
  
  if (lastDeposit.gt(0)) {
    const depositDate = new Date(lastDeposit.toNumber() * 1000);
    console.log("Last Deposit Date:", depositDate.toLocaleString());
  } else {
    console.log("Last Deposit Date: No deposits yet");
  }
  
  // Check withdrawalsAvailableAt
  try {
    const withdrawalsAt = await vault.withdrawalsAvailableAt();
    console.log("\nWithdrawals Available At Timestamp:", withdrawalsAt.toString());
    
    if (withdrawalsAt.gt(0)) {
      const withdrawDate = new Date(withdrawalsAt.toNumber() * 1000);
      console.log("Withdrawals Available Date:", withdrawDate.toLocaleString());
      
      const now = Math.floor(Date.now() / 1000);
      if (withdrawalsAt.gt(now)) {
        const remainingSeconds = withdrawalsAt.sub(now);
        console.log("Time until withdrawals available:", remainingSeconds.toString(), "seconds");
      } else {
        console.log("Withdrawals are currently available!");
      }
    }
  } catch (error) {
    console.log("\nError calling withdrawalsAvailableAt:", error.message);
  }
  
  // Check cooldown duration from GlpManager
  const glpManager = await contractAt("IGlpManager", "0x4DE729B85dDB172F1bb775882f355bA25764E430");
  try {
    const cooldown = await glpManager.cooldownDuration();
    console.log("\nCooldown Duration:", cooldown.toString(), "seconds");
  } catch (error) {
    console.log("\nError reading cooldown duration:", error.message);
  }
  
  // Check if this is a fresh vault
  if (totalSupply.eq(0)) {
    console.log("\n⚠️  This is a fresh vault with no deposits yet.");
    console.log("The lastDeposit and withdrawalsAvailableAt will be 0 until the first deposit.");
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });