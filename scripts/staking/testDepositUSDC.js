const { contractAt } = require("../shared/helpers");
const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Testing USDC deposit with account:", signer.address);
  
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
    console.log("\n💡 For now, you can deposit using:");
    console.log("   - Native S (ETH) via depositETH()");
    console.log("   - WETH if you have any");
    console.log("   - Other accepted tokens: WS, SHADOW, ANON, scUSD");
    return;
  }
  
  console.log("\n=== Before Deposit ===");
  
  const yalpBalanceBefore = await vault.balanceOf(signer.address);
  console.log("Your yALP balance:", ethers.utils.formatEther(yalpBalanceBefore), "yALP");
  
  const totalSupplyBefore = await vault.totalSupply();
  console.log("Total yALP supply:", ethers.utils.formatEther(totalSupplyBefore), "yALP");
  
  const totalAssetsBefore = await vault.totalAssets();
  console.log("Vault's total fsALP:", ethers.utils.formatEther(totalAssetsBefore), "fsALP");
  
  console.log("\n=== Depositing 1 USDC ===");
  
  const depositAmount = ethers.utils.parseUnits("1", 6); // 1 USDC
  console.log("Deposit amount:", ethers.utils.formatUnits(depositAmount, 6), "USDC");
  
  // Approve vault
  const currentAllowance = await usdc.allowance(signer.address, vaultAddress);
  if (currentAllowance.lt(depositAmount)) {
    console.log("Approving vault to spend USDC...");
    const approveTx = await usdc.approve(vaultAddress, depositAmount);
    await approveTx.wait();
    console.log("✅ Approval confirmed");
  }
  
  try {
    const tx = await vault.deposit(
      usdcAddress,
      depositAmount,
      0, // minUsdg
      0, // minGlp
      signer.address,
      {
        gasLimit: 1500000
      }
    );
    
    console.log("\nTransaction sent:", tx.hash);
    console.log("Waiting for confirmation...");
    
    const receipt = await tx.wait();
    console.log("\n✅ Deposit successful!");
    console.log("Gas used:", receipt.gasUsed.toString());
    
    // Parse events
    const depositEvent = receipt.events.find(e => e.event === "Deposit");
    if (depositEvent) {
      console.log("\n📊 Deposit Event:");
      console.log("- fsALP received:", ethers.utils.formatEther(depositEvent.args.assets), "fsALP");
      console.log("- yALP minted:", ethers.utils.formatEther(depositEvent.args.shares), "yALP");
    }
    
  } catch (error) {
    console.log("\n❌ Deposit failed:", error.message);
    return;
  }
  
  console.log("\n=== After Deposit ===");
  
  const yalpBalanceAfter = await vault.balanceOf(signer.address);
  console.log("Your yALP balance:", ethers.utils.formatEther(yalpBalanceAfter), "yALP");
  console.log("yALP received:", ethers.utils.formatEther(yalpBalanceAfter.sub(yalpBalanceBefore)), "yALP");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });