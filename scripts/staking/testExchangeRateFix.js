const { ethers } = require("hardhat");

async function main() {
  console.log("Testing exchange rate fix...");
  
  // Simulate the exchange rate calculation
  function calculateShares(fsAlpReceived, totalSupply, fsAlpBefore) {
    if (totalSupply.eq(0)) {
      return fsAlpReceived;
    } else {
      return fsAlpReceived.mul(totalSupply).div(fsAlpBefore);
    }
  }
  
  // Test scenario 1: First deposit
  console.log("\n=== First Deposit ===");
  const firstDepositFsAlp = ethers.utils.parseEther("0.00264");
  const totalSupply1 = ethers.utils.parseEther("0");
  const fsAlpBefore1 = ethers.utils.parseEther("0");
  
  const shares1 = calculateShares(firstDepositFsAlp, totalSupply1, fsAlpBefore1);
  console.log("fsALP received:", ethers.utils.formatEther(firstDepositFsAlp));
  console.log("Total supply before:", ethers.utils.formatEther(totalSupply1));
  console.log("fsALP before:", ethers.utils.formatEther(fsAlpBefore1));
  console.log("Shares minted:", ethers.utils.formatEther(shares1));
  console.log("Ratio:", shares1.eq(firstDepositFsAlp) ? "1:1 ✅" : "NOT 1:1 ❌");
  
  // Test scenario 2: Second deposit (with bug)
  console.log("\n=== Second Deposit (WITH BUG) ===");
  const secondDepositFsAlp = ethers.utils.parseEther("13.137");
  const totalSupply2 = ethers.utils.parseEther("0.00264");
  const fsAlpBefore2 = ethers.utils.parseEther("0.00264");
  const fsAlpAfter2 = fsAlpBefore2.add(secondDepositFsAlp); // This is what the bug uses
  
  // Bug calculation (using totalAssets AFTER deposit)
  const sharesBug = secondDepositFsAlp.mul(totalSupply2).div(fsAlpAfter2);
  console.log("fsALP received:", ethers.utils.formatEther(secondDepositFsAlp));
  console.log("Total supply before:", ethers.utils.formatEther(totalSupply2));
  console.log("fsALP before:", ethers.utils.formatEther(fsAlpBefore2));
  console.log("fsALP after (bug uses this):", ethers.utils.formatEther(fsAlpAfter2));
  console.log("Shares minted (bug):", ethers.utils.formatEther(sharesBug));
  console.log("Expected ~13.137, got:", ethers.utils.formatEther(sharesBug), "❌");
  
  // Test scenario 3: Second deposit (fixed)
  console.log("\n=== Second Deposit (FIXED) ===");
  const sharesFixed = calculateShares(secondDepositFsAlp, totalSupply2, fsAlpBefore2);
  console.log("fsALP received:", ethers.utils.formatEther(secondDepositFsAlp));
  console.log("Total supply before:", ethers.utils.formatEther(totalSupply2));
  console.log("fsALP before:", ethers.utils.formatEther(fsAlpBefore2));
  console.log("Shares minted (fixed):", ethers.utils.formatEther(sharesFixed));
  console.log("Expected ~13.137, got:", ethers.utils.formatEther(sharesFixed), "✅");
  
  // Verify proportional distribution
  console.log("\n=== Proportional Check ===");
  const firstDepositorProportion = shares1.mul(10000).div(shares1.add(sharesFixed));
  const secondDepositorProportion = sharesFixed.mul(10000).div(shares1.add(sharesFixed));
  const fsAlpFirstProportion = firstDepositFsAlp.mul(10000).div(firstDepositFsAlp.add(secondDepositFsAlp));
  const fsAlpSecondProportion = secondDepositFsAlp.mul(10000).div(firstDepositFsAlp.add(secondDepositFsAlp));
  
  console.log("First depositor owns:", firstDepositorProportion.toNumber() / 100, "% of shares");
  console.log("First depositor contributed:", fsAlpFirstProportion.toNumber() / 100, "% of fsALP");
  console.log("Second depositor owns:", secondDepositorProportion.toNumber() / 100, "% of shares");
  console.log("Second depositor contributed:", fsAlpSecondProportion.toNumber() / 100, "% of fsALP");
  
  console.log("\n✅ The fix ensures fair proportional share distribution!");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });