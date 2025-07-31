const { ethers } = require("hardhat");

async function main() {
  const vaultAddress = "0x5B8caae7cC6Ea61fb96Fd251C4Bc13e48749C7Da";
  
  // Get the Vault contract
  const Vault = await ethers.getContractFactory("Vault");
  const vault = Vault.attach(vaultAddress);
  
  // Read marginFeeBasisPoints
  const marginFeeBasisPoints = await vault.marginFeeBasisPoints();
  
  console.log("Vault Address:", vaultAddress);
  console.log("Margin Fee Basis Points:", marginFeeBasisPoints.toString());
  console.log("Margin Fee Percentage:", marginFeeBasisPoints.toNumber() / 100 + "%");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });