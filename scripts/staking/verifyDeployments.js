const { ethers } = require("hardhat");

async function main() {
  console.log("Verifying yALP deployments on Sonic...");
  
  const addresses = {
    yALP: "0xe0FBB9A23649f93C479C8995a43302f12A223B62",
    zapper: "0x6e2E56Eb79B11a4D18e66Dc28cDaDdE8ffF5B727",
    zapperOut: "0x015ed211A14Ee0C9B158A4d3BE0fB0Cc64B0F382"
  };
  
  for (const [name, address] of Object.entries(addresses)) {
    console.log(`\n=== Checking ${name} at ${address} ===`);
    
    const code = await ethers.provider.getCode(address);
    console.log(`Bytecode length: ${code.length}`);
    console.log(`Is contract: ${code.length > 2}`);
    
    if (code.length > 2) {
      console.log("✅ Contract exists");
      
      // Try to interact with it
      try {
        if (name === "yALP") {
          const yalp = await ethers.getContractAt("YieldBearingALP", address);
          const symbol = await yalp.symbol();
          const totalSupply = await yalp.totalSupply();
          console.log(`Symbol: ${symbol}`);
          console.log(`Total Supply: ${ethers.utils.formatEther(totalSupply)}`);
        }
      } catch (e) {
        console.log("Error interacting:", e.message);
      }
    } else {
      console.log("❌ No contract deployed at this address!");
    }
  }
  
  // Check transaction count to see if these are EOAs
  const [signer] = await ethers.getSigners();
  console.log("\n=== Checking if addresses are EOAs ===");
  
  for (const [name, address] of Object.entries(addresses)) {
    const txCount = await ethers.provider.getTransactionCount(address);
    console.log(`${name} (${address}): ${txCount} transactions`);
  }
  
  // Let's check the deployment transaction
  console.log("\n=== Recent Deployments from Deployer ===");
  console.log("Deployer:", signer.address);
  
  const deployerTxCount = await ethers.provider.getTransactionCount(signer.address);
  console.log(`Deployer has sent ${deployerTxCount} transactions`);
  
  // Get recent blocks to find deployment transactions
  const currentBlock = await ethers.provider.getBlockNumber();
  console.log(`Current block: ${currentBlock}`);
  
  // The deployment should have been recent, let's check last few transactions
  if (deployerTxCount > 0) {
    console.log("\nChecking recent transactions...");
    // We can't easily get transactions by address without an indexer
    // But we can check if the contracts were created by checking nonce
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });