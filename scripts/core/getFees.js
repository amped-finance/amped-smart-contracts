const { getFrameSigner, contractAt } = require("../shared/helpers")
const path = require('path');
const fs = require('fs');
const hre = require("hardhat");

// Get the network from Hardhat's built-in network parameter
async function main() {
  // Get network from Hardhat
  const network = hre.network.name;
  console.log(`Using network: ${network}`);

  function getContractAddress(network, contractName) {
    const filePath = path.join(__dirname, `../deploy-${network}.json`);
    if (!fs.existsSync(filePath)) {
      console.error(`Deployment file not found for network "${network}": ${filePath}`);
      process.exit(1);
    }
    const deploymentData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const contractInfo = deploymentData.find(c => c.name === contractName);
    if (!contractInfo || !contractInfo.imple) {
      console.error(`Contract "${contractName}" address not found in ${filePath}`);
      process.exit(1);
    }
    return contractInfo.imple;
  }

  const signer = await getFrameSigner();
  const vaultAddress = getContractAddress(network, "Vault");
  const vault = await contractAt("Vault", vaultAddress);

  console.log(`Current fee configuration for network ${network}:`);
  
  // Read fee parameters
  const taxBasisPoints = await vault.taxBasisPoints();
  const stableTaxBasisPoints = await vault.stableTaxBasisPoints();
  const mintBurnFeeBasisPoints = await vault.mintBurnFeeBasisPoints();
  const swapFeeBasisPoints = await vault.swapFeeBasisPoints();
  const stableSwapFeeBasisPoints = await vault.stableSwapFeeBasisPoints();
  const marginFeeBasisPoints = await vault.marginFeeBasisPoints();
  const liquidationFeeUsd = await vault.liquidationFeeUsd();
  const minProfitTime = await vault.minProfitTime();
  const hasDynamicFees = await vault.hasDynamicFees();

  console.log(`Tax Basis Points: ${taxBasisPoints} (${taxBasisPoints/100}%)`);
  console.log(`Stable Tax Basis Points: ${stableTaxBasisPoints} (${stableTaxBasisPoints/100}%)`);
  console.log(`Mint Burn Fee Basis Points: ${mintBurnFeeBasisPoints} (${mintBurnFeeBasisPoints/100}%)`);
  console.log(`Swap Fee Basis Points: ${swapFeeBasisPoints} (${swapFeeBasisPoints/100}%)`);
  console.log(`Stable Swap Fee Basis Points: ${stableSwapFeeBasisPoints} (${stableSwapFeeBasisPoints/100}%)`);
  console.log(`Margin Fee Basis Points: ${marginFeeBasisPoints} (${marginFeeBasisPoints/100}%)`);
  console.log(`Liquidation Fee USD: ${liquidationFeeUsd}`);
  console.log(`Min Profit Time: ${minProfitTime}`);
  console.log(`Has Dynamic Fees: ${hasDynamicFees}`);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });