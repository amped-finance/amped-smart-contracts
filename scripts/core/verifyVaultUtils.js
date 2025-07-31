const { ethers } = require("hardhat");

async function main() {
  const vaultAddress = "0x5B8caae7cC6Ea61fb96Fd251C4Bc13e48749C7Da";
  const expectedVaultUtilsAddress = "0xf669bA7d9a4393B509B1209Dcdc5ab44cD62b4A8";
  
  // Get the Vault contract
  const Vault = await ethers.getContractFactory("Vault");
  const vault = Vault.attach(vaultAddress);
  
  // Get the actual VaultUtils address from Vault
  const actualVaultUtilsAddress = await vault.vaultUtils();
  
  console.log("Expected VaultUtils:", expectedVaultUtilsAddress);
  console.log("Actual VaultUtils:", actualVaultUtilsAddress);
  console.log("Match?", actualVaultUtilsAddress.toLowerCase() === expectedVaultUtilsAddress.toLowerCase());
  
  // Now let's test the actual fee calculation through the actual contracts
  const VaultUtils = await ethers.getContractFactory("VaultUtils");
  const vaultUtils = VaultUtils.attach(actualVaultUtilsAddress);
  
  // Test parameters from the transaction
  const account = "0x111fbf7b389e024d09f35fb091d7d4479b321b0a";
  const collateralToken = "0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38";
  const indexToken = "0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38";
  const sizeDelta = ethers.BigNumber.from("17584157171117705242315779160000");
  
  // Get the fee through VaultUtils directly
  console.log("\nDirect VaultUtils call:");
  try {
    const fee = await vaultUtils.getPositionFee(account, collateralToken, indexToken, true, sizeDelta);
    console.log("Fee from VaultUtils:", fee.toString());
    console.log("Fee basis points:", fee.mul(10000).div(sizeDelta).toString());
  } catch (e) {
    console.log("Error calling VaultUtils:", e.message);
  }
  
  // Also check through Vault
  console.log("\nThrough Vault call:");
  const feeFromVault = await vault.getPositionFee(account, collateralToken, indexToken, true, sizeDelta);
  console.log("Fee from Vault:", feeFromVault.toString());
  console.log("Fee basis points:", feeFromVault.mul(10000).div(sizeDelta).toString());
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });