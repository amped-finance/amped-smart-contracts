const { ethers } = require("hardhat");

async function main() {
  const vaultAddress = "0x5B8caae7cC6Ea61fb96Fd251C4Bc13e48749C7Da";
  
  // Get the Vault contract
  const Vault = await ethers.getContractFactory("Vault");
  const vault = Vault.attach(vaultAddress);
  
  // Get VaultUtils address
  const vaultUtilsAddress = await vault.vaultUtils();
  console.log("VaultUtils Address:", vaultUtilsAddress);
  
  // Get the VaultUtils contract
  const VaultUtils = await ethers.getContractFactory("VaultUtils");
  const vaultUtils = VaultUtils.attach(vaultUtilsAddress);
  
  // Read marginFeeBasisPoints from both contracts
  const marginFeeBasisPoints = await vault.marginFeeBasisPoints();
  console.log("Vault marginFeeBasisPoints:", marginFeeBasisPoints.toString());
  
  // Test the fee calculation with the exact sizeDelta from the transaction
  const sizeDelta = ethers.BigNumber.from("17584157171117705242315779160000");
  const account = ethers.utils.getAddress("0x111fbf7b389e024d09f35fb091d7d4479b321b0a");
  const fee = await vaultUtils.getPositionFee(
    account, // account from tx
    "0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38", // collateralToken
    "0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38", // indexToken  
    true, // isLong
    sizeDelta
  );
  
  console.log("\nTest calculation:");
  console.log("Size Delta:", sizeDelta.toString());
  console.log("Calculated Fee:", fee.toString());
  console.log("Fee Basis Points:", fee.mul(10000).div(sizeDelta).toString());
  console.log("Fee Percentage:", fee.mul(10000).div(sizeDelta).toNumber() / 100 + "%");
  
  // Compare with actual fee from transaction
  const actualFee = ethers.BigNumber.from("87920785855588526211578895800");
  console.log("\nActual transaction fee:", actualFee.toString());
  console.log("Actual fee basis points:", actualFee.mul(10000).div(sizeDelta).toString());
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });