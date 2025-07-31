const { ethers } = require("hardhat");

async function main() {
  // Calculate function selectors
  const functions = [
    "depositS(uint256,uint256)",
    "depositETH(uint256,uint256)",
    "withdrawS(uint256,uint256,address)",
    "withdrawETH(uint256,uint256,address)",
    "compound()",
    "deposit(uint256,uint256)" // in case there's a simpler signature
  ];
  
  console.log("Function Selectors:\n");
  
  for (const func of functions) {
    const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(func));
    const selector = hash.slice(0, 10); // First 4 bytes (0x + 8 chars)
    console.log(`${func}`);
    console.log(`  Selector: ${selector}`);
    console.log(`  Full hash: ${hash}\n`);
  }
  
  // Check what 0x22af0342 corresponds to
  console.log("Checking 0x22af0342:");
  const targetSelector = "0x22af0342";
  
  // The selector appears to be for depositS
  const depositSHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("depositS(uint256,uint256)"));
  const depositSSelector = depositSHash.slice(0, 10);
  
  if (depositSSelector.toLowerCase() === targetSelector.toLowerCase()) {
    console.log("✅ 0x22af0342 is the selector for depositS(uint256,uint256)");
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });