// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const { deploy_localhost } = require("./networks/localhost")
const { deploy_pegasus } = require('./networks/pegasus')
const { deploy_phoenix } = require('./networks/phoenix')
const { deploy_bsctestnet } = require('./networks/bsctestnet')
const { deploy_bsc } = require("./networks/bsc")
const { deploy_sonic } = require('./networks/sonic')
const { deploy_berachain } = require('./networks/berachain')
const { deploy_megaeth } = require('./networks/megaeth') // Add this line
const { deploy_superseed } = require('./networks/superseed') // Add superseed import
const { setNetwork } = require("./shared/syncParams")
const fs = require('fs'); // Added for file logging
const { JsonRpcProvider } = hre.ethers.providers; // Added for Frame signer

async function main() {
  const { ethers } = hre; // Import ethers

  // --- Determine Deployer Signer ---
  let deployerSigner;
  let deployerAddress;

  if (process.env.USE_FRAME_SIGNER === 'true') {
    console.log("[Signer] Attempting to use Frame signer...");
    try {
      const targetChainId = hre.network.config?.chainId ?? (await ethers.provider.getNetwork()).chainId;

      // Create Frame provider with flexible network detection to avoid immediate mismatch errors
      const frameProvider = new JsonRpcProvider("http://127.0.0.1:1248", "any");

      // Ensure Frame is on the correct network (attempt automatic switch if supported)
      const detectedNetwork = await frameProvider.getNetwork();
      if (detectedNetwork.chainId !== targetChainId) {
        console.log(`[Signer] Frame currently on chainId ${detectedNetwork.chainId}, switching to ${targetChainId} (${hre.network.name})`);
        const chainIdHex = "0x" + targetChainId.toString(16);
        try {
          await frameProvider.send("wallet_switchEthereumChain", [{ chainId: chainIdHex }]);
        } catch (switchErr) {
          console.warn(`[Signer] wallet_switchEthereumChain failed: ${switchErr?.message || switchErr}`);
        }

        // Re‑detect network after attempting to switch
        const postSwitchNetwork = await frameProvider.getNetwork();
        if (postSwitchNetwork.chainId !== targetChainId) {
          console.error(`[Signer] Frame network mismatch. Expected chainId ${targetChainId} but still ${postSwitchNetwork.chainId}. Please switch network manually in Frame and retry.`);
          process.exit(1);
        }
      }

      // Check if Frame is connected by requesting accounts
      const frameAccounts = await frameProvider.listAccounts();
      if (frameAccounts.length === 0) {
        throw new Error("Frame is running but no account is connected/selected.");
      }
      deployerSigner = frameProvider.getSigner();
      
      // Force low gas fee parameters for Superseed network when using Frame
      if (hre.network.name === "superseed") {
        console.log("[Signer] Aggressive override of gas parameters for Superseed network");

        // Get the original eth_sendTransaction method that Frame will call
        const origSend = frameProvider.send.bind(frameProvider);

        // Override the provider's send method to intercept eth_sendTransaction calls
        frameProvider.send = async (method, params) => {
          // Only intercept transaction requests
          if (method === 'eth_sendTransaction' && params && params.length > 0) {
            const tx = params[0];
            
            // Force our exact gas values - convert our wei value to hex
            const priorityFeeHex = '0x' + (1100000).toString(16); // 0.0011 gwei in hex
            const maxFeeHex = '0x' + (10000000000).toString(16); // 10 gwei max fee
            
            console.log('[Signer] Before override:', {
              gasPrice: tx.gasPrice,
              maxPriorityFeePerGas: tx.maxPriorityFeePerGas,
              maxFeePerGas: tx.maxFeePerGas
            });
            
            // Apply our overrides
            delete tx.gasPrice; // Remove legacy gasPrice
            tx.maxPriorityFeePerGas = priorityFeeHex;
            tx.maxFeePerGas = tx.maxFeePerGas || maxFeeHex;
            
            console.log('[Signer] After override:', {
              maxPriorityFeePerGas: tx.maxPriorityFeePerGas + ' (' + ethers.utils.formatUnits(ethers.BigNumber.from(tx.maxPriorityFeePerGas), 'gwei') + ' gwei)',
              maxFeePerGas: tx.maxFeePerGas + ' (' + ethers.utils.formatUnits(ethers.BigNumber.from(tx.maxFeePerGas), 'gwei') + ' gwei)'
            });
            
            // Use the modified params
            params[0] = tx;
          }
          // Pass through to the original method
          return origSend(method, params);
        };
        
        // Also override the signer's sendTransaction
        const origSendTransaction = deployerSigner.sendTransaction.bind(deployerSigner);
        deployerSigner.sendTransaction = async (transaction) => {
          if (!transaction.maxPriorityFeePerGas) {
            transaction.maxPriorityFeePerGas = ethers.BigNumber.from('1100000');
          } else {
            transaction.maxPriorityFeePerGas = ethers.BigNumber.from('1100000');
          }
          
          if (!transaction.maxFeePerGas) {
            transaction.maxFeePerGas = ethers.utils.parseUnits('10', 'gwei');
          }
          
          // Remove gasPrice to ensure EIP-1559 is used
          delete transaction.gasPrice;
          
          console.log("[Signer] Sending with forced fees:", {
            maxPriorityFeePerGas: ethers.utils.formatUnits(transaction.maxPriorityFeePerGas, 'gwei') + ' gwei',
            maxFeePerGas: ethers.utils.formatUnits(transaction.maxFeePerGas, 'gwei') + ' gwei'
          });
          
          return origSendTransaction(transaction);
        };
        
        console.log("[Signer] Forced gas parameters: maxPriorityFee=0.0011 gwei");
      }
      
      deployerAddress = await deployerSigner.getAddress();
      console.log(`[Signer] Using Frame signer: ${deployerAddress}`);
      const balance = await deployerSigner.getBalance();
      console.log(`[Signer] Frame signer balance: ${ethers.utils.formatEther(balance)} ETH`);
    } catch (error) {
      console.error("[Signer] Failed to connect to Frame signer. Ensure Frame is running, unlocked, and accessible at http://127.0.0.1:1248");
      console.error(error.message);
      process.exit(1); // Exit if Frame signer is requested but fails
    }
  } else {
    const accounts = await hre.ethers.getSigners();
    if (accounts.length === 0) {
      console.error("[Signer] No default Hardhat signers found. Check your network configuration.");
      process.exit(1);
    }
    deployerSigner = accounts[0]; // Use the default signer
    deployerAddress = await deployerSigner.getAddress();
    console.log(`[Signer] Using default Hardhat signer: ${deployerAddress}`);

    // Log all default signers' balances
    const provider = hre.ethers.provider;
    console.log("[Signer] Default Hardhat Signer Balances:");
    for (const account of accounts) {
      console.log(
        "  %s (%s ETH)",
        account.address,
        ethers.utils.formatEther(
          await provider.getBalance(account.address)
        )
      );
    }
  }
  // ---------

  // --- BEGIN ADDED DEPLOYMENT LOGGING ---
  const logFilePath = `./deployment-log-${hre.network.name}.json`; // Log file path
  const deploymentLogs = []; // Array to store logs in memory (optional)

  console.log(`[Deployment Log] Logging deployments to ${logFilePath}`);
  // Initialize log file as an empty JSON array ONLY if it doesn't exist
  if (!fs.existsSync(logFilePath)) {
    console.log(`[Deployment Log] Initializing new log file: ${logFilePath}`);
    try {
      fs.writeFileSync(logFilePath, '[]', 'utf8');
    } catch (e) {
      console.error(`[Deployment Log] Failed to initialize log file ${logFilePath}: ${e}`);
      // Exit or handle error appropriately if initialization fails
      process.exit(1);
    }
  } else {
    console.log(`[Deployment Log] Appending to existing log file: ${logFilePath}`);
  }

  const originalGetContractFactory = ethers.getContractFactory;

  ethers.getContractFactory = async (name, signerOrOptions) => {
    // Determine the signer to use for this factory instance
    let factorySigner;
    let contractFactoryArgs = [name];

    // Check if signerOrOptions is the signer itself or an options object containing the signer
    if (signerOrOptions && signerOrOptions.signer && signerOrOptions.signer instanceof ethers.Signer) {
        factorySigner = signerOrOptions.signer;
        contractFactoryArgs.push(signerOrOptions);
    } else if (signerOrOptions && signerOrOptions instanceof ethers.Signer) {
        factorySigner = signerOrOptions;
        contractFactoryArgs.push(factorySigner); // Pass only the signer if it's not in an options object
    } else {
        factorySigner = deployerSigner; // Default to the chosen deployer
        // If signerOrOptions was provided but wasn't a signer, pass it along (e.g., for libraries)
        if (signerOrOptions) {
            contractFactoryArgs.push({...signerOrOptions, signer: factorySigner });
        } else {
            contractFactoryArgs.push(factorySigner); // Pass only the signer
        }
    }

    // Call the original function with the determined arguments
    const factory = await originalGetContractFactory.apply(ethers, contractFactoryArgs);

    // Keep a reference to the original deploy method
    const originalDeploy = factory.deploy;

    // Override the deploy method
    factory.deploy = async (...args) => {
      console.log(`[Deployment Log] Attempting deployment: ${name} with args: ${JSON.stringify(args)}`);
      // --- Inject EIP‑1559 fee overrides for Superseed ---
      if (hre.network.name === "superseed") {
        try {
          const feeData = await hre.ethers.provider.getFeeData();
          const tip = feeData.maxPriorityFeePerGas && feeData.maxPriorityFeePerGas.gt(0)
            ? feeData.maxPriorityFeePerGas
            : hre.ethers.BigNumber.from("1100000"); // default 0.0011 gwei tip

          // Fallback: if maxFeePerGas is missing, approximate baseFee*2 + tip
          let max;
          if (feeData.maxFeePerGas && feeData.maxFeePerGas.gt(0)) {
            max = feeData.maxFeePerGas;
          } else if (feeData.lastBaseFeePerGas && feeData.lastBaseFeePerGas.gt(0)) {
            max = feeData.lastBaseFeePerGas.mul(2).add(tip);
          } else if (feeData.gasPrice && feeData.gasPrice.gt(0)) {
            max = feeData.gasPrice.mul(2).add(tip);
          } else {
            max = hre.ethers.utils.parseUnits("5", "gwei"); // sane default
          }

          const feeOverrides = { maxPriorityFeePerGas: tip, maxFeePerGas: max };

          // If last argument is an overrides object, merge, else append
          if (args.length > 0 && typeof args[args.length - 1] === "object" && !Array.isArray(args[args.length - 1])) {
            args[args.length - 1] = { ...args[args.length - 1], ...feeOverrides };
          } else {
            args.push(feeOverrides);
          }
        } catch (e) {
          console.warn(`[Signer] Could not fetch fee data, defaulting to legacy gasPrice. Reason: ${e.message || e}`);
        }
      }

      const contract = await originalDeploy.apply(factory, args);

      // Wait for the deployment transaction to be confirmed
      await contract.deployed();

      // Log the details
      const logEntry = {
        contractName: name,
        address: contract.address,
        arguments: args,
        timestamp: new Date().toISOString()
      };
      console.log(`[Deployment Log] Deployed ${name} to ${contract.address}`);
      deploymentLogs.push(logEntry); // Add to in-memory log

      // Append log entry to the JSON file
      try {
          const currentLogs = JSON.parse(fs.readFileSync(logFilePath, 'utf8'));
          currentLogs.push(logEntry);
          fs.writeFileSync(logFilePath, JSON.stringify(currentLogs, null, 2), 'utf8');
      } catch (e) {
          console.error(`[Deployment Log] Error writing entry to log file ${logFilePath}: ${e}`);
          // Attempt to write just this entry if reading failed
          try {
              fs.writeFileSync(logFilePath, JSON.stringify([logEntry], null, 2), 'utf8');
          } catch (writeErr) {
              console.error(`[Deployment Log] Critical: Failed even to write single entry to log file: ${writeErr}`);
          }
      }

      // Return the deployed contract instance
      return contract;
    };

    // Return the modified factory
    return factory;
  };
  // --- END ADDED DEPLOYMENT LOGGING ---

  // Log account info only if not using Frame (already logged above)
  if (process.env.USE_FRAME_SIGNER !== 'true') {
    const accounts = await hre.ethers.getSigners()
    const provider = hre.ethers.provider
    for (const account of accounts) {
      console.log(
        "%s (%i ETH)",
        account.address,
        hre.ethers.utils.formatEther(
          // getBalance returns wei amount, format to ETH amount
          await provider.getBalance(account.address)
        )
      );
    }
  }

  setNetwork(hre.network.name)

  // Pass the deployerSigner to the network-specific deployment function
  if (hre.network.name === "hardhat" || hre.network.name === "localhost") {
    await deploy_localhost(deployerSigner)
  } else if (hre.network.name === "pegasus") {
    await deploy_pegasus(deployerSigner)
  } else if (hre.network.name === "phoenix") {
    await deploy_phoenix(deployerSigner)
  }else if (hre.network.name === "bsctestnet") {
    await deploy_bsctestnet(deployerSigner)
  } else if (hre.network.name === "bsc") {
    await deploy_bsc(deployerSigner)
  } else if (hre.network.name === "sonic") {
    await deploy_sonic(deployerSigner)
  } else if (hre.network.name === "berachain") {
    await deploy_berachain(deployerSigner)
  } else if (hre.network.name === "megaeth") { // Add this block
    await deploy_megaeth(deployerSigner)
  } else if (hre.network.name === "superseed") {
    await deploy_superseed(deployerSigner)
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
