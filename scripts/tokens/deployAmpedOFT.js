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

// LayerZero chain IDs (different from EVM chain IDs)
const LZ_CHAIN_IDS = {
  1: 101, // Ethereum
  11155111: 10161, // Sepolia
  146: 30264, // Sonic
  56: 102, // BSC
  97: 10102, // BSC Testnet
  8453: 184, // Base
  84532: 10184, // Base Sepolia
  5330: 30365, // Superseed (estimated)
};

async function deployAmpedOFT() {
  // Get the proper signer (Frame signer if USE_FRAME_SIGNER=true)
  const signer = await getFrameSigner();
  const network = await ethers.provider.getNetwork();
  const chainId = network.chainId;
  
  console.log(`Starting AMPED OFT deployment on network with chain ID: ${chainId}`);
  console.log(`Deployer address: ${await signer.getAddress()}`);
  console.log("This contract deploys WITHOUT initial supply - tokens must be bridged from main chain");
  
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
    type: "OFT_DEPLOYMENT"
  };

  try {
    // Deploy AMPED OFT token
    console.log("Deploying AmpedOFT...");
    const ampedOFT = await deployContract("AmpedOFT", [layerZeroEndpoint], "AmpedOFT", {}, null, signer);
    deploymentLog.contracts.AmpedOFT = ampedOFT.address;
    console.log(`AmpedOFT deployed at: ${ampedOFT.address}`);

    // Store deployment addresses
    const addresses = {
      AmpedOFT: ampedOFT.address,
    };

    console.log("\n=== AMPED OFT Deployment Summary ===");
    console.log(`Network: ${network.name} (Chain ID: ${chainId})`);
    console.log(`AMPED OFT: ${ampedOFT.address}`);
    console.log(`LayerZero Endpoint: ${layerZeroEndpoint}`);
    console.log(`Initial Supply: 0 (tokens will be bridged from main chain)`);
    
    console.log("\n=== Verifying Contract ===");
    // Wait a bit for the contract to be indexed
    console.log("Waiting 30 seconds for contract to be indexed...");
    await sleep(30000);
    
    try {
      await verifyContract("AmpedOFT", ampedOFT.address, "contracts/tokens/AmpedOFT.sol:AmpedOFT", [layerZeroEndpoint]);
      console.log("✅ Contract verified successfully!");
      deploymentLog.verified = true;
    } catch (error) {
      console.log("⚠️  Contract verification failed:", error.message);
      console.log("You can verify manually using:");
      console.log(`npx hardhat verify --network ${network.name} ${ampedOFT.address} "${layerZeroEndpoint}"`);
      deploymentLog.verified = false;
      deploymentLog.verificationError = error.message;
    }

    console.log("\n=== Trusted Remote Configuration ===");
    console.log("You need to set trusted remotes on BOTH chains:");
    console.log("");
    console.log("Example for Sepolia <-> Base Sepolia:");
    console.log("- Sepolia AMPED: 0x4CDa0242B345ba5519D07F9459fb5b8CE967fcE4");
    console.log(`- Base Sepolia OFT: ${ampedOFT.address}`);
    console.log("");
    console.log(`On Sepolia, call:`);
    console.log(`setTrustedRemote(${LZ_CHAIN_IDS[84532] || "10184"}, abi.encodePacked("${ampedOFT.address}", "0x4CDa0242B345ba5519D07F9459fb5b8CE967fcE4"))`);
    console.log("");
    console.log(`On Base Sepolia, call:`);
    console.log(`setTrustedRemote(${LZ_CHAIN_IDS[11155111] || "10161"}, abi.encodePacked("0x4CDa0242B345ba5519D07F9459fb5b8CE967fcE4", "${ampedOFT.address}"))`);

    console.log("\n=== Post-Deployment Steps ===");
    console.log("1. Set trusted remotes on both chains (see above)");
    console.log("2. Configure minimum destination gas settings");
    console.log("3. Set oracle and relayer addresses if needed");
    console.log("4. Bridge tokens from main chain");
    console.log("5. Transfer ownership to multisig");

    // Save deployment log after all steps
    deploymentLog.endTime = Date.now();
    deploymentLog.duration = deploymentLog.endTime - deploymentLog.startTime;
    
    const fs = require('fs');
    const deploymentFileName = `scripts/tokens/amped-oft-deployment-${network.name}-${startTime}.json`;
    fs.writeFileSync(deploymentFileName, JSON.stringify(deploymentLog, null, 2));
    console.log(`\nDeployment log saved to: ${deploymentFileName}`);

    return addresses;
  } catch (error) {
    console.error("Deployment failed:", error);
    deploymentLog.error = error.toString();
    deploymentLog.endTime = Date.now();
    deploymentLog.duration = deploymentLog.endTime - deploymentLog.startTime;
    
    const fs = require('fs');
    const deploymentFileName = `scripts/tokens/amped-oft-deployment-${network.name}-failed-${startTime}.json`;
    fs.writeFileSync(deploymentFileName, JSON.stringify(deploymentLog, null, 2));
    
    throw error;
  }
}

module.exports = {
  deployAmpedOFT,
};

// If running directly
if (require.main === module) {
  deployAmpedOFT()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}