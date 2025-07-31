const { ethers } = require("hardhat");

async function main() {
  // Transaction data from the screenshot
  const txData = {
    account: "0x111fbf7b389e024d09f35fb091d7d4479b321b0a",
    collateralToken: "0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38",
    indexToken: "0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38",
    collateralDelta: "16164321000000000000000000000000",
    sizeDelta: "17584157171117705242315779160000",
    isLong: true,
    price: "3232864200000000000000000000000",
    fee: "87920785855588526211578895800"
  };
  
  console.log("Transaction Details:");
  console.log("===================");
  console.log("Account:", txData.account);
  console.log("Collateral Token:", txData.collateralToken);
  console.log("Index Token:", txData.indexToken);
  console.log("Collateral Delta:", txData.collateralDelta);
  console.log("Size Delta:", txData.sizeDelta);
  console.log("Is Long:", txData.isLong);
  console.log("Price:", txData.price);
  console.log("Fee:", txData.fee);
  
  // Calculate fee percentage
  const sizeDelta = ethers.BigNumber.from(txData.sizeDelta);
  const fee = ethers.BigNumber.from(txData.fee);
  const feeBasisPoints = fee.mul(10000).div(sizeDelta);
  
  console.log("\nFee Analysis:");
  console.log("=============");
  console.log("Fee in basis points:", feeBasisPoints.toString());
  console.log("Fee percentage:", feeBasisPoints.toNumber() / 100 + "%");
  
  // Check if there's a relationship between collateralDelta and fee
  const collateralDelta = ethers.BigNumber.from(txData.collateralDelta);
  console.log("\nCollateral Analysis:");
  console.log("===================");
  console.log("Collateral/Size ratio:", collateralDelta.mul(10000).div(sizeDelta).toString(), "basis points");
  
  // Check if fee might be calculated differently
  const expectedFee500bp = sizeDelta.mul(500).div(10000);
  const expectedFee50bp = sizeDelta.mul(50).div(10000);
  
  console.log("\nExpected Fees:");
  console.log("==============");
  console.log("Expected fee at 500bp (5%):", expectedFee500bp.toString());
  console.log("Expected fee at 50bp (0.5%):", expectedFee50bp.toString());
  console.log("Actual fee:", fee.toString());
  console.log("Matches 50bp?", expectedFee50bp.eq(fee));
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });