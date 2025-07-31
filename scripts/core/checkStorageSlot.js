const { ethers } = require("hardhat");

async function main() {
  const vaultAddress = "0x5B8caae7cC6Ea61fb96Fd251C4Bc13e48749C7Da";
  
  // Storage slot for marginFeeBasisPoints
  // Assuming it follows the order of state variables in the contract
  // We need to count the storage slots
  
  console.log("Checking storage slots for Vault at:", vaultAddress);
  
  // Get provider
  const provider = ethers.provider;
  
  // Let's check multiple storage slots to find marginFeeBasisPoints
  // Based on typical Vault contracts, fee parameters are usually stored together
  for (let i = 0; i < 30; i++) {
    const slot = await provider.getStorageAt(vaultAddress, i);
    const value = ethers.BigNumber.from(slot);
    
    // Only print non-zero values
    if (!value.isZero()) {
      console.log(`Slot ${i}: ${slot} (decimal: ${value.toString()})`);
      
      // Check if this could be marginFeeBasisPoints (should be between 0 and 10000)
      if (value.gt(0) && value.lte(10000)) {
        console.log(`  -> Could be basis points: ${value.toString()} (${value.toNumber() / 100}%)`);
      }
    }
  }
  
  // Also let's directly call the getter function
  const vault = await ethers.getContractAt("Vault", vaultAddress);
  const marginFeeBasisPoints = await vault.marginFeeBasisPoints();
  console.log("\nDirect call to marginFeeBasisPoints():", marginFeeBasisPoints.toString());
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });