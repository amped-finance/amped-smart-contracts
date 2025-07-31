const {
  getFrameSigner,
  deployContract,
  contractAt,
  sendTxn,
  writeTmpAddresses,
  callWithRetries,
} = require("../shared/helpers");
const { expandDecimals } = require("../../test/shared/utilities");
const { toUsd } = require("../../test/shared/units");
const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

// Function to get contract address from deployment file
function getContractAddress(network, contractName) {
  const filePath = path.join(__dirname, `../deploy-${network}.json`);
  if (!fs.existsSync(filePath)) {
    console.error(
      `Deployment file not found for network "${network}": ${filePath}`
    );
    process.exit(1);
  }
  const deploymentData = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const contractInfo = deploymentData.find((c) => c.name === contractName);
  if (!contractInfo || !contractInfo.imple) {
    console.error(
      `Contract "${contractName}" address not found in ${filePath}`
    );
    process.exit(1);
  }
  return contractInfo.imple;
}

async function main() {
  // Get network from Hardhat
  const network = hre.network.name;
  console.log(`Using network: ${network}`);

  const signer = await getFrameSigner();

  // Get contract addresses based on network
  const vaultAddress = getContractAddress(network, "Vault");
  const timelockAddress = getContractAddress(network, "Timelock");

  console.log(`Vault address: ${vaultAddress}`);
  console.log(`Timelock address: ${timelockAddress}`);

  const vault = await contractAt("Vault", vaultAddress, signer);
  const timelock = await contractAt("Timelock", timelockAddress, signer);

  const taxBasisPoints = 8;
  const stableTaxBasisPoints = 0;
  const mintBurnFeeBasisPoints = 8;
  const swapFeeBasisPoints = 12;
  const stableSwapFeeBasisPoints = 0;
  const marginFeeBasisPoints = 5;

  // Get current values to maintain
  const liquidationFeeUsd = await vault.liquidationFeeUsd();
  const minProfitTime = await vault.minProfitTime();

  // Enable dynamic fees and set new base fees
  console.log("Setting fees...");
  await sendTxn(
    timelock.setFees(
      vault.address,
      taxBasisPoints, // _taxBasisPoints
      stableTaxBasisPoints, // _stableTaxBasisPoints
      mintBurnFeeBasisPoints, // _mintBurnFeeBasisPoints
      swapFeeBasisPoints, // _swapFeeBasisPoints
      stableSwapFeeBasisPoints, // _stableSwapFeeBasisPoints
      marginFeeBasisPoints, // _marginFeeBasisPoints
      liquidationFeeUsd, // _liquidationFeeUsd
      minProfitTime, // _minProfitTime
      true // _hasDynamicFees
    ),
    "timelock.setFees",
    signer
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
