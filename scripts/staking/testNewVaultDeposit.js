const { contractAt } = require("../shared/helpers");
const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Testing deposit with account:", signer.address);
  
  // New vault address with MIT license
  const YALP_VAULT = "0x3B6246d98787FB2da1de69E2614F3e70caE2aD64";
  const vault = await contractAt("YieldBearingALPVault", YALP_VAULT);
  
  console.log("\n=== Pre-Deposit State ===");
  
  // Check vault state before deposit
  const totalSupplyBefore = await vault.totalSupply();
  const totalAssetsBefore = await vault.totalAssets();
  const userBalanceBefore = await vault.balanceOf(signer.address);
  
  console.log("Total yALP supply:", ethers.utils.formatEther(totalSupplyBefore));
  console.log("Total fsALP in vault:", ethers.utils.formatEther(totalAssetsBefore));
  console.log("Your yALP balance:", ethers.utils.formatEther(userBalanceBefore));
  
  // Get user's ETH balance
  const ethBalanceBefore = await signer.getBalance();
  console.log("Your ETH balance:", ethers.utils.formatEther(ethBalanceBefore));
  
  // Make a small test deposit - 0.001 ETH
  const depositAmount = ethers.utils.parseEther("0.001");
  console.log("\n=== Depositing", ethers.utils.formatEther(depositAmount), "ETH ===");
  
  try {
    const tx = await vault.depositETH(
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
  const ethBalanceAfter = await signer.getBalance();
  
  console.log("Total yALP supply:", ethers.utils.formatEther(totalSupplyAfter));
  console.log("Total fsALP in vault:", ethers.utils.formatEther(totalAssetsAfter));
  console.log("Your yALP balance:", ethers.utils.formatEther(userBalanceAfter));
  console.log("Your ETH balance:", ethers.utils.formatEther(ethBalanceAfter));
  
  // Calculate changes
  console.log("\n=== Summary ===");
  const yalpReceived = userBalanceAfter.sub(userBalanceBefore);
  const fsAlpAdded = totalAssetsAfter.sub(totalAssetsBefore);
  const ethSpent = ethBalanceBefore.sub(ethBalanceAfter);
  
  console.log("yALP received:", ethers.utils.formatEther(yalpReceived));
  console.log("fsALP added to vault:", ethers.utils.formatEther(fsAlpAdded));
  console.log("ETH spent (including gas):", ethers.utils.formatEther(ethSpent));
  
  // Check exchange rate
  if (totalSupplyAfter.gt(0)) {
    const rate = totalAssetsAfter.mul(ethers.utils.parseEther("1")).div(totalSupplyAfter);
    console.log("\nCurrent exchange rate: 1 yALP =", ethers.utils.formatEther(rate), "fsALP");
  }
  
  // Show cooldown info
  const cooldownDuration = await vault.cooldownDuration();
  const lastAddTime = await vault.lastAddLiquidityTime();
  const withdrawAvailable = new Date((lastAddTime.toNumber() + cooldownDuration.toNumber()) * 1000);
  
  console.log("\n=== Withdrawal Info ===");
  console.log("Cooldown duration:", cooldownDuration.toString(), "seconds");
  console.log("Withdrawals available after:", withdrawAvailable.toLocaleString());
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });