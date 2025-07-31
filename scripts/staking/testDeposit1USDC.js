const { contractAt } = require("../shared/helpers");
const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Testing $1 USDC deposit with account:", signer.address);
  
  // Contract addresses
  const vaultAddress = "0xB91735aE255403B9ab9d97dF671a63807a89f08c"; // Fixed vault
  const usdcAddress = "0x29219dd400f2bf60e5a23d13be72b486d4038894"; // USDC on Sonic
  
  const vault = await contractAt("YieldBearingALPVaultFixed", vaultAddress);
  const usdc = await ethers.getContractAt("IERC20", usdcAddress);
  
  console.log("\n=== Checking USDC Balance ===");
  
  const usdcBalance = await usdc.balanceOf(signer.address);
  console.log("Your USDC balance:", ethers.utils.formatUnits(usdcBalance, 6), "USDC");
  
  if (usdcBalance.eq(0)) {
    console.log("❌ You don't have any USDC tokens");
    console.log("\nTo get USDC on Sonic:");
    console.log("1. Bridge from another chain");
    console.log("2. Swap S for USDC on a DEX");
    console.log("3. Or continue using ETH deposits which work");
    return;
  }
  
  const depositAmount = ethers.utils.parseUnits("1", 6); // $1 USDC (6 decimals)
  
  if (usdcBalance.lt(depositAmount)) {
    console.log(`❌ Insufficient USDC balance. You have ${ethers.utils.formatUnits(usdcBalance, 6)} USDC but need 1 USDC`);
    return;
  }
  
  console.log("\n=== Before Deposit ===");
  
  const yalpBalanceBefore = await vault.balanceOf(signer.address);
  console.log("Your yALP balance:", ethers.utils.formatEther(yalpBalanceBefore), "yALP");
  
  const totalSupplyBefore = await vault.totalSupply();
  console.log("Total yALP supply:", ethers.utils.formatEther(totalSupplyBefore), "yALP");
  
  const totalAssetsBefore = await vault.totalAssets();
  console.log("Vault's total fsALP:", ethers.utils.formatEther(totalAssetsBefore), "fsALP");
  
  // Calculate expected shares
  if (totalSupplyBefore.gt(0)) {
    console.log("\nExpected shares calculation:");
    console.log("- If we receive X fsALP from $1 USDC");
    console.log("- Shares = X *", ethers.utils.formatEther(totalSupplyBefore), "/", ethers.utils.formatEther(totalAssetsBefore));
  }
  
  console.log("\n=== Approving USDC ===");
  
  // Check current allowance
  const currentAllowance = await usdc.allowance(signer.address, vaultAddress);
  console.log("Current allowance:", ethers.utils.formatUnits(currentAllowance, 6), "USDC");
  
  if (currentAllowance.lt(depositAmount)) {
    console.log("Approving vault to spend 1 USDC...");
    const approveTx = await usdc.approve(vaultAddress, depositAmount);
    console.log("Approval tx:", approveTx.hash);
    await approveTx.wait();
    console.log("✅ Approval confirmed");
  } else {
    console.log("✅ Sufficient allowance already set");
  }
  
  console.log("\n=== Depositing $1 USDC ===");
  console.log("Deposit amount:", ethers.utils.formatUnits(depositAmount, 6), "USDC");
  
  try {
    const tx = await vault.deposit(
      usdcAddress,     // token address
      depositAmount,   // amount (1 USDC)
      0,               // minUsdg (0 for no slippage protection)
      0,               // minGlp (0 for no slippage protection)
      signer.address,  // receiver
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
      
      // Verify proportional shares
      if (totalSupplyBefore.gt(0)) {
        const expectedShares = fsAlpReceived.mul(totalSupplyBefore).div(totalAssetsBefore);
        console.log("\n🔍 Proportional Share Verification:");
        console.log("- Expected shares:", ethers.utils.formatEther(expectedShares), "yALP");
        console.log("- Actual shares:", ethers.utils.formatEther(sharesReceived), "yALP");
        console.log("- Match:", expectedShares.sub(sharesReceived).abs().lte(1) ? "✅ CORRECT" : "❌ INCORRECT");
      }
      
      // Show exchange rates
      console.log("\n💱 Exchange Rates:");
      console.log("- $1 USDC → ", ethers.utils.formatEther(fsAlpReceived), "fsALP");
      console.log("- $1 USDC → ", ethers.utils.formatEther(sharesReceived), "yALP");
    }
    
  } catch (error) {
    console.log("\n❌ Deposit failed:", error.message);
    if (error.error && error.error.data) {
      console.log("Error data:", error.error.data);
    }
    return;
  }
  
  console.log("\n=== After Deposit ===");
  
  const usdcBalanceAfter = await usdc.balanceOf(signer.address);
  console.log("Your USDC balance:", ethers.utils.formatUnits(usdcBalanceAfter, 6), "USDC");
  console.log("USDC spent:", ethers.utils.formatUnits(usdcBalance.sub(usdcBalanceAfter), 6), "USDC");
  
  const yalpBalanceAfter = await vault.balanceOf(signer.address);
  console.log("Your yALP balance:", ethers.utils.formatEther(yalpBalanceAfter), "yALP");
  console.log("yALP received:", ethers.utils.formatEther(yalpBalanceAfter.sub(yalpBalanceBefore)), "yALP");
  
  const totalSupplyAfter = await vault.totalSupply();
  console.log("Total yALP supply:", ethers.utils.formatEther(totalSupplyAfter), "yALP");
  
  const totalAssetsAfter = await vault.totalAssets();
  console.log("Vault's total fsALP:", ethers.utils.formatEther(totalAssetsAfter), "fsALP");
  
  // New exchange rate
  const oneYALP = ethers.utils.parseEther("1");
  const assetsPerYALP = await vault.convertToAssets(oneYALP);
  console.log("\n💱 Vault Exchange Rate:");
  console.log("1 yALP =", ethers.utils.formatEther(assetsPerYALP), "fsALP");
  
  console.log("\n✨ Successfully deposited $1 USDC and received yALP!");
  console.log("🔗 View transaction: https://sonicscan.org/tx/" + receipt.transactionHash);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });