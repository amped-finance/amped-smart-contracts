const { expandDecimals, sleep, getFrameSigner } = require("../shared/helpers");
const { deployContract, contractAt, verifyContract } = require("../shared/helpers");
const { ethers, run } = require("hardhat");

// LayerZero endpoints for different networks
const LAYER_ZERO_ENDPOINTS = {
  1: "0x66A71Dcef29A0fFBDBE3c6a460a3B5BC225Cd675", // Ethereum mainnet
  11155111: "0x6EDCE65403992e310A62460808c4b910D972f10f", // Sepolia
  146: "0x1a44076050125825900e736c501f859c50fE728c", // Sonic
  56: "0x3c2269811836af69497E5F486A85D7316753cf62", // BSC
  97: "0x6Fcb97553D41516Cb228ac03FdC8B9a0a9df04A1", // BSC Testnet
  8453: "0xb6319cC6c8c27A8F5dAF0dD3DF91EA35C4720dd7", // Base
  84532: "0x6EDCE65403992e310A62460808c4b910D972f10f", // Base Sepolia
  5330: "0x1a44076050125825900e736c501f859c50fE728c", // Superseed
};

async function deployAmpedToken() {
  // Get the proper signer (Frame signer if USE_FRAME_SIGNER=true)
  const signer = await getFrameSigner();
  const network = await ethers.provider.getNetwork();
  const chainId = network.chainId;
  
  console.log(`Starting AMPED token deployment on network with chain ID: ${chainId}`);
  console.log(`Deployer address: ${await signer.getAddress()}`);
  
  // Check deployer balance
  const balance = await ethers.provider.getBalance(await signer.getAddress());
  console.log(`Deployer balance: ${ethers.utils.formatEther(balance)} ETH`);
  
  if (balance.eq(0)) {
    throw new Error(`Deployer address ${await signer.getAddress()} has no ETH balance`);
  }
  
  const layerZeroEndpoint = LAYER_ZERO_ENDPOINTS[chainId];
  if (!layerZeroEndpoint) {
    throw new Error(`No LayerZero endpoint configured for chain ID ${chainId}`);
  }
  
  console.log(`Using LayerZero endpoint: ${layerZeroEndpoint}`);
  
  const startTime = Date.now();
  const deploymentLog = {
    network: network.name,
    chainId,
    startTime,
    deployer: await signer.getAddress(),
    contracts: {},
    transactions: [],
  };

  try {
    // Deploy AMPED token
    console.log("Deploying AmpedToken...");
    const ampedToken = await deployContract("AmpedToken", [layerZeroEndpoint], "AmpedToken", {}, null, signer);
    deploymentLog.contracts.AmpedToken = ampedToken.address;
    console.log(`AmpedToken deployed at: ${ampedToken.address}`);

    // Store deployment addresses
    const addresses = {
      AmpedToken: ampedToken.address,
    };

    // Placeholder for deployment log - will be saved after verification

    console.log("\n=== AMPED Token Deployment Summary ===");
    console.log(`Network: ${network.name} (Chain ID: ${chainId})`);
    console.log(`AMPED Token: ${ampedToken.address}`);
    console.log(`LayerZero Endpoint: ${layerZeroEndpoint}`);
    console.log(`Total Supply: 1,000,000,000 AMPED`);
    console.log("\n=== Verifying Contract ===");
    // Wait a bit for the contract to be indexed
    console.log("Waiting 30 seconds for contract to be indexed...");
    await sleep(30000);
    
    try {
      await verifyContract("AmpedToken", ampedToken.address, "contracts/tokens/AmpedToken.sol:AmpedToken", [layerZeroEndpoint]);
      console.log("✅ Contract verified successfully!");
      deploymentLog.verified = true;
    } catch (error) {
      console.log("⚠️  Contract verification failed:", error.message);
      console.log("You can verify manually using:");
      console.log(`npx hardhat verify --network ${network.name} ${ampedToken.address} "${layerZeroEndpoint}"`);
      deploymentLog.verified = false;
      deploymentLog.verificationError = error.message;
    }

    console.log("\n=== Post-Deployment Steps ===");
    console.log("1. Set trusted remotes for cross-chain functionality");
    console.log("2. Configure minimum destination gas settings");
    console.log("3. Deploy router contracts for AMPED/AMP integration");
    console.log("4. Transfer ownership to multisig");

    // Save deployment log after all steps
    deploymentLog.endTime = Date.now();
    deploymentLog.duration = deploymentLog.endTime - deploymentLog.startTime;
    
    const fs = require('fs');
    const deploymentFileName = `scripts/tokens/amped-deployment-${network.name}-${startTime}.json`;
    fs.writeFileSync(deploymentFileName, JSON.stringify(deploymentLog, null, 2));
    console.log(`\nDeployment log saved to: ${deploymentFileName}`);

    return addresses;
  } catch (error) {
    console.error("Deployment failed:", error);
    deploymentLog.error = error.toString();
    deploymentLog.endTime = Date.now();
    deploymentLog.duration = deploymentLog.endTime - deploymentLog.startTime;
    
    const fs = require('fs');
    const deploymentFileName = `scripts/tokens/amped-deployment-${network.name}-failed-${startTime}.json`;
    fs.writeFileSync(deploymentFileName, JSON.stringify(deploymentLog, null, 2));
    
    throw error;
  }
}

module.exports = {
  deployAmpedToken,
};

// If running directly
if (require.main === module) {
  deployAmpedToken()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}