const { contractAt } = require("../shared/helpers");
const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Testing stS deposit with account:", signer.address);
  
  // Contract addresses
  const vaultAddress = "0xB91735aE255403B9ab9d97dF671a63807a89f08c"; // Fixed vault
  const stSAddress = "0xE5DA20F15420aD15DE0fa650600aFc998bbE3955"; // stS token on Sonic
  
  const vault = await contractAt("YieldBearingALPVaultFixed", vaultAddress);
  const stS = await ethers.getContractAt("IERC20", stSAddress);
  
  console.log("\n=== Checking stS Balance ===");
  
  const stSBalance = await stS.balanceOf(signer.address);
  console.log("Your stS balance:", ethers.utils.formatEther(stSBalance), "stS");
  
  if (stSBalance.lt(ethers.utils.parseEther("1"))) {
    console.log("❌ Insufficient stS balance. Need at least 1 stS");
    return;
  }
  
  console.log("\n=== Before Deposit ===");
  
  const yalpBalanceBefore = await vault.balanceOf(signer.address);
  console.log("Your yALP balance:", ethers.utils.formatEther(yalpBalanceBefore), "yALP");
  
  const totalSupplyBefore = await vault.totalSupply();
  console.log("Total yALP supply:", ethers.utils.formatEther(totalSupplyBefore), "yALP");
  
  const totalAssetsBefore = await vault.totalAssets();
  console.log("Vault's total fsALP:", ethers.utils.formatEther(totalAssetsBefore), "fsALP");
  
  console.log("\n=== Approving stS ===");
  
  const depositAmount = ethers.utils.parseEther("1");
  console.log("Deposit amount:", ethers.utils.formatEther(depositAmount), "stS");
  
  // Check current allowance
  const currentAllowance = await stS.allowance(signer.address, vaultAddress);
  console.log("Current allowance:", ethers.utils.formatEther(currentAllowance), "stS");
  
  if (currentAllowance.lt(depositAmount)) {
    console.log("Approving vault to spend stS...");
    const approveTx = await stS.approve(vaultAddress, depositAmount);
    console.log("Approval tx:", approveTx.hash);
    await approveTx.wait();
    console.log("✅ Approval confirmed");
  } else {
    console.log("✅ Sufficient allowance already set");
  }
  
  console.log("\n=== Depositing 1 stS ===");
  
  try {
    // Calculate expected shares
    if (totalSupplyBefore.gt(0)) {
      console.log("\n💡 Expected behavior:");
      console.log("- Shares = fsAlpReceived * totalSupply / totalAssetsBefore");
      console.log("- Shares = fsAlpReceived *", ethers.utils.formatEther(totalSupplyBefore), "/", ethers.utils.formatEther(totalAssetsBefore));
    }
    
    const tx = await vault.deposit(
      stSAddress,     // token address
      depositAmount,  // amount
      0,              // minUsdg (0 for no slippage protection)
      0,              // minGlp (0 for no slippage protection)
      signer.address, // receiver
      {
        gasLimit: 1500000
      }
    );
    
    console.log("\nTransaction sent:", tx.hash);
    console.log("Waiting for confirmation...");
    
    const receipt = await tx.wait();
    console.log("\n✅ Deposit successful!");
    console.log("Transaction hash:", receipt.transactionHash);
    console.log("Gas used:", receipt.gasUsed.toString());
    console.log("Block number:", receipt.blockNumber);
    
    // Parse events
    const depositEvent = receipt.events.find(e => e.event === "Deposit");
    
    if (depositEvent) {
      const fsAlpReceived = depositEvent.args.assets;
      const sharesReceived = depositEvent.args.shares;
      
      console.log("\n📊 Deposit Event Details:");
      console.log("- Depositor:", depositEvent.args.caller);
      console.log("- Receiver:", depositEvent.args.owner);
      console.log("- fsALP received:", ethers.utils.formatEther(fsAlpReceived), "fsALP");
      console.log("- yALP minted:", ethers.utils.formatEther(sharesReceived), "yALP");
      
      // Verify proportional shares if not first deposit
      if (totalSupplyBefore.gt(0)) {
        const expectedShares = fsAlpReceived.mul(totalSupplyBefore).div(totalAssetsBefore);
        console.log("\n🔍 Proportional Share Verification:");
        console.log("- Expected shares:", ethers.utils.formatEther(expectedShares), "yALP");
        console.log("- Actual shares:", ethers.utils.formatEther(sharesReceived), "yALP");
        console.log("- Match:", expectedShares.sub(sharesReceived).abs().lte(1) ? "✅ CORRECT" : "❌ INCORRECT");
      }
      
      // Calculate value ratios
      console.log("\n💰 Value Analysis:");
      console.log("- 1 stS → ", ethers.utils.formatEther(fsAlpReceived), "fsALP");
      console.log("- 1 stS → ", ethers.utils.formatEther(sharesReceived), "yALP");
    }
    
  } catch (error) {
    console.log("\n❌ Deposit failed:", error.message);
    if (error.error && error.error.data) {
      console.log("Error data:", error.error.data);
    }
    return;
  }
  
  console.log("\n=== After Deposit ===");
  
  const stSBalanceAfter = await stS.balanceOf(signer.address);
  console.log("Your stS balance:", ethers.utils.formatEther(stSBalanceAfter), "stS");
  console.log("stS spent:", ethers.utils.formatEther(stSBalance.sub(stSBalanceAfter)), "stS");
  
  const yalpBalanceAfter = await vault.balanceOf(signer.address);
  console.log("Your yALP balance:", ethers.utils.formatEther(yalpBalanceAfter), "yALP");
  console.log("yALP received:", ethers.utils.formatEther(yalpBalanceAfter.sub(yalpBalanceBefore)), "yALP");
  
  const totalSupplyAfter = await vault.totalSupply();
  console.log("Total yALP supply:", ethers.utils.formatEther(totalSupplyAfter), "yALP");
  
  const totalAssetsAfter = await vault.totalAssets();
  console.log("Vault's total fsALP:", ethers.utils.formatEther(totalAssetsAfter), "fsALP");
  
  // Exchange rate
  const oneYALP = ethers.utils.parseEther("1");
  const assetsPerYALP = await vault.convertToAssets(oneYALP);
  console.log("\n💱 Exchange Rate:");
  console.log("1 yALP =", ethers.utils.formatEther(assetsPerYALP), "fsALP");
  
  console.log("\n✨ Successfully deposited stS tokens to receive yALP!");
  console.log("🔗 View transaction: https://sonicscan.org/tx/" + receipt.transactionHash);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });