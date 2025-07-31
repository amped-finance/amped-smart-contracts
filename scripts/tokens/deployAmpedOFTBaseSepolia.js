const { deployContract, contractAt, writeTmpAddresses, getFrameSigner } = require("../shared/helpers");
const { ethers } = require("hardhat");

const LAYER_ZERO_ENDPOINT_BASE_SEPOLIA = "0x6EDCE65403992e310A62460808c4b910D972f10f";

async function deployAmpedOFTBaseSepolia() {
  console.log("Starting AMPED OFT deployment on Base Sepolia...");
  console.log("This deploys the OFT representation without initial supply");
  console.log("Tokens will be bridged from Ethereum Sepolia");
  
  const signer = await getFrameSigner();
  const network = await ethers.provider.getNetwork();
  const chainId = network.chainId;
  
  console.log(`Deployer address: ${await signer.getAddress()}`);
  
  // Check deployer balance
  const balance = await ethers.provider.getBalance(await signer.getAddress());
  console.log(`Deployer balance: ${ethers.utils.formatEther(balance)} ETH`);
  
  const startTime = Date.now();
  const deploymentLog = {
    network: "basesepolia",
    chainId: 84532,
    startTime,
    deployer: await signer.getAddress(),
    contracts: {},
    transactions: [],
    type: "OFT_REPRESENTATION"
  };

  try {
    // Deploy AMPED OFT token (no initial mint)
    console.log("Deploying AmpedToken OFT...");
    console.log("LayerZero Endpoint:", LAYER_ZERO_ENDPOINT_BASE_SEPOLIA);
    
    // Deploy the contract - it will mint to deployer but we'll need to handle that
    const AmpedToken = await ethers.getContractFactory("AmpedToken", signer);
    const ampedToken = await AmpedToken.deploy(LAYER_ZERO_ENDPOINT_BASE_SEPOLIA);
    await ampedToken.deployed();
    
    deploymentLog.contracts.AmpedToken = ampedToken.address;
    console.log(`AmpedToken OFT deployed at: ${ampedToken.address}`);
    
    // Note: The contract mints initial supply, but for a proper OFT setup,
    // you should burn these tokens after setting up trusted remotes
    console.log("WARNING: Contract minted initial supply. Consider burning these tokens after bridge setup.");

    // Write deployment addresses
    const addresses = {
      AmpedTokenOFT: ampedToken.address,
    };
    writeTmpAddresses(addresses);

    // Save deployment log
    deploymentLog.endTime = Date.now();
    deploymentLog.duration = deploymentLog.endTime - deploymentLog.startTime;
    
    const fs = require('fs');
    const deploymentFileName = `scripts/tokens/amped-oft-deployment-basesepolia-${startTime}.json`;
    fs.writeFileSync(deploymentFileName, JSON.stringify(deploymentLog, null, 2));
    console.log(`Deployment log saved to: ${deploymentFileName}`);

    console.log("\n=== AMPED OFT Deployment Summary ===");
    console.log(`Network: Base Sepolia (Chain ID: 84532)`);
    console.log(`AMPED OFT: ${ampedToken.address}`);
    console.log(`LayerZero Endpoint: ${LAYER_ZERO_ENDPOINT_BASE_SEPOLIA}`);
    console.log(`Initial Supply: 100M (should be burned for proper OFT setup)`);
    
    console.log("\n=== Next Steps ===");
    console.log("1. Configure trusted remote on BOTH chains:");
    console.log("   - On Sepolia: setTrustedRemote(10184, path)"); // Base Sepolia LZ chain ID
    console.log("   - On Base Sepolia: setTrustedRemote(10161, path)"); // Sepolia LZ chain ID
    console.log("2. Set minimum destination gas on both chains");
    console.log("3. Consider burning the initial supply on Base Sepolia");
    console.log("4. Bridge tokens from Sepolia to Base Sepolia");
    
    console.log("\n=== Trusted Remote Configuration ===");
    console.log("Sepolia AMPED address: 0x4CDa0242B345ba5519D07F9459fb5b8CE967fcE4");
    console.log(`Base Sepolia path: abi.encodePacked("0x4CDa0242B345ba5519D07F9459fb5b8CE967fcE4", "${ampedToken.address}")`);
    console.log(`Sepolia path: abi.encodePacked("${ampedToken.address}", "0x4CDa0242B345ba5519D07F9459fb5b8CE967fcE4")`);

    return addresses;
  } catch (error) {
    console.error("Deployment failed:", error);
    deploymentLog.error = error.toString();
    deploymentLog.endTime = Date.now();
    deploymentLog.duration = deploymentLog.endTime - deploymentLog.startTime;
    
    const fs = require('fs');
    const deploymentFileName = `scripts/tokens/amped-oft-deployment-basesepolia-failed-${startTime}.json`;
    fs.writeFileSync(deploymentFileName, JSON.stringify(deploymentLog, null, 2));
    
    throw error;
  }
}

module.exports = {
  deployAmpedOFTBaseSepolia,
};

// If running directly
if (require.main === module) {
  deployAmpedOFTBaseSepolia()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}