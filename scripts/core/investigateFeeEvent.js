const { ethers } = require("hardhat");

async function main() {
  // The exact fee from the transaction
  const actualFee = ethers.BigNumber.from("87920785855588526211578895800");
  const sizeDelta = ethers.BigNumber.from("17584157171117705242315779160000");
  
  // What the fee should be at different rates
  const fee500bp = sizeDelta.mul(500).div(10000);
  const fee50bp = sizeDelta.mul(50).div(10000);
  const fee5bp = sizeDelta.mul(5).div(10000);
  
  console.log("Transaction Analysis:");
  console.log("====================");
  console.log("Actual fee:", actualFee.toString());
  console.log("Expected at 500bp:", fee500bp.toString());
  console.log("Expected at 50bp:", fee50bp.toString());
  console.log("Expected at 5bp:", fee5bp.toString());
  
  console.log("\nFee matches:");
  console.log("500bp?", actualFee.eq(fee500bp));
  console.log("50bp?", actualFee.eq(fee50bp));
  console.log("5bp?", actualFee.eq(fee5bp));
  
  // Let's check if the actual fee could be a result of integer division
  // Maybe there's a hidden division by 10 somewhere
  const feeDiv10 = fee500bp.div(10);
  console.log("\n500bp / 10 =", feeDiv10.toString());
  console.log("Matches actual?", actualFee.eq(feeDiv10));
  
  // Check if this could be related to decimal precision
  // The transaction shows the fee parameter directly in the event
  // Let's see what marginFeeBasisPoints value would produce this fee
  const impliedBasisPoints = actualFee.mul(10000).div(sizeDelta);
  console.log("\nImplied basis points from actual fee:", impliedBasisPoints.toString());
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });