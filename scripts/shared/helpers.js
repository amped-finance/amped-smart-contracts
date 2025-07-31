const fs = require("fs");
const path = require("path");
const parse = require("csv-parse");
const { run, network: hreNetwork } = require('hardhat')

const {
  PEGASUS_DEPLOY_KEY,
  PEGASUS_RPC,
  PHOENIX_DEPLOY_KEY,
  PHOENIX_RPC,
  BSC_TESTNET_URL,
  BSC_TESTNET_DEPLOY_KEY,
  BSC_DEPLOY_KEY
} = require("../../env.json");
const { ADDRESS_ZERO } = require('@uniswap/v3-sdk');

const providers = {
  pegasus: new ethers.providers.JsonRpcProvider(PEGASUS_RPC),
  phoenix: new ethers.providers.JsonRpcProvider(PHOENIX_RPC),
  bsctestnet: new ethers.providers.JsonRpcProvider(BSC_TESTNET_URL),
  bsc: new ethers.providers.JsonRpcProvider(BSC_DEPLOY_KEY),
}

const signers = {
  pegasus: new ethers.Wallet(PEGASUS_DEPLOY_KEY).connect(providers.pegasus),
  phoenix: new ethers.Wallet(PHOENIX_DEPLOY_KEY).connect(providers.phoenix),
  bsctestnet: new ethers.Wallet(BSC_TESTNET_DEPLOY_KEY).connect(providers.bsctestnet),
  bsc: new ethers.Wallet(BSC_DEPLOY_KEY).connect(providers.bsc),
}

const { syncDeployInfo, addGasUsed } = require("./syncParams");
const { bsctestnet } = require("../core/tokens");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getFrameSigner() {
  if (process.env.USE_FRAME_SIGNER !== 'true') {
    console.log("[getFrameSigner] USE_FRAME_SIGNER not true, returning default signer.");
    const accounts = await ethers.getSigners();
    if (!accounts || accounts.length === 0) {
      throw new Error("No default Hardhat signers found.");
    }
    return accounts[0];
  }

  console.log("[getFrameSigner] Attempting to connect to Frame signer...");
  try {
    const frameProvider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:1248", "any"); // Use 'any' network initially

    // Get the target chain ID from Hardhat configuration
    const targetChainId = hreNetwork.config?.chainId ?? (await ethers.provider.getNetwork()).chainId;
    console.log(`[getFrameSigner] Target network specified by Hardhat: ${hreNetwork.name} (Chain ID: ${targetChainId})`);

    // Check Frame's current network and switch if necessary
    const currentFrameNet = await frameProvider.getNetwork();
    console.log(`[getFrameSigner] Frame's current network: Chain ID ${currentFrameNet.chainId}`);

    if (currentFrameNet.chainId !== targetChainId) {
      console.log(`[getFrameSigner] Frame network (ID: ${currentFrameNet.chainId}) does not match target (ID: ${targetChainId}). Attempting to switch...`);
      const hexChainId = "0x" + targetChainId.toString(16);
      try {
        await frameProvider.send("wallet_switchEthereumChain", [{ chainId: hexChainId }]);
        // Re-check network after switch attempt
        const newFrameNet = await frameProvider.getNetwork();
        if (newFrameNet.chainId !== targetChainId) {
          throw new Error(`Frame did not switch to the correct network (expected ${targetChainId}, still on ${newFrameNet.chainId}). Please switch manually in Frame.`);
        }
        console.log(`[getFrameSigner] Frame successfully switched to network ID: ${newFrameNet.chainId}`);
        await sleep(2000); // Add a 2-second delay to allow Frame to stabilize connection
      } catch (switchError) {
        console.error(`[getFrameSigner] Error sending network switch request to Frame: ${switchError.message}`);
        throw new Error(`Failed to switch Frame network. Please switch manually to Chain ID ${targetChainId}. Error: ${switchError.message}`);
      }
    } else {
      console.log("[getFrameSigner] Frame is already connected to the correct network.");
    }
    
    // Check connection by requesting accounts (after potential network switch)
    const frameAccounts = await frameProvider.listAccounts();
    if (frameAccounts.length === 0) {
      throw new Error("Frame is running but no account is connected/selected.");
    }
    
    const signer = frameProvider.getSigner();
    const signerAddress = await signer.getAddress();
    console.log(`[getFrameSigner] Successfully connected to Frame signer: ${signerAddress} on network ID: ${targetChainId}`);
    return signer;

  } catch (error) {
    console.error("[getFrameSigner] Failed to connect to Frame signer. Ensure Frame is running, unlocked, and accessible at http://127.0.0.1:1248");
    // Check if the error is due to network mismatch or connection failure
    if (error.message.includes("Frame did not switch") || error.message.includes("Failed to switch Frame")) {
       console.error(error.message); // Log the specific switch error
       throw error; // Rethrow the specific error
    } else {
        console.error(error.message); // Log generic connection error
        throw new Error(`getFrameSigner failed: ${error.message}`); 
    }
  }
}

async function sendTxn(txnPromise, label, signer) {
  const connection = signer || (await getFrameSigner());
  const txn = await txnPromise;
  console.info(`Sending ${label} from ${await connection.getAddress()}...`);
  const ret = await txn.wait();
  addGasUsed(ret.cumulativeGasUsed.toString())
  console.info(`... Sent! ${txn.hash}`);
  await sleep(2000);
  return txn;
}

async function callWithRetries(func, args, retriesCount = 3) {
  let i = 0;
  while (true) {
    i++;
    try {
      return await func(...args);
    } catch (ex) {
      if (i === retriesCount) {
        console.error("call failed %s times. throwing error", retriesCount);
        throw ex;
      }
      console.error("call i=%s failed. retrying....", i);
      console.error(ex.message);
    }
  }
}

async function deployContract(name, args, label, options, registerName, signer) {
  if (!options && typeof label === "object") {
    label = null;
    options = label;
  }

  let info = name;
  if (label) {
    info = name + ":" + label;
  }

  if (signer && !options) {
    options = {};
  }

  const factoryOptions = signer ? { ...options, signer: signer } : options;

  const contractFactory = await ethers.getContractFactory(name, factoryOptions);
  let contract;
  contract = await contractFactory.deploy(...args);

  const argStr = args.map((i) => `"${i}"`).join(" ");
  console.info(`Deploying ${info} ${contract.address} ${argStr}`);
  const ret = await contract.deployTransaction.wait();

  console.info("... Completed!");

  addGasUsed(ret.cumulativeGasUsed.toString())

  syncDeployInfo(registerName ?? name, {
    name: registerName ?? name,
    imple: contract.address,
    arguments: args,
  });

  return contract;
}

const verifyContract = async (name, address, contractPath, args) => {
  console.info(`Verifying ${name} ...`)
  await run('verify:verify', {
    contract: contractPath,
    address: address,
    constructorArguments: args ? [...args] : []
  })
}

async function contractAt(name, address, signerOrProvider, options) {
  let contractFactory = await ethers.getContractFactory(name, options);
  if (signerOrProvider && (ethers.Signer.isSigner(signerOrProvider) || ethers.providers.Provider.isProvider(signerOrProvider))) {
    contractFactory = contractFactory.connect(signerOrProvider);
  }
  return await contractFactory.attach(address);
}

// batchLists is an array of lists
async function processBatch(batchLists, batchSize, handler) {
  let currentBatch = [];
  const referenceList = batchLists[0];

  for (let i = 0; i < referenceList.length; i++) {
    const item = [];

    for (let j = 0; j < batchLists.length; j++) {
      const list = batchLists[j];
      item.push(list[i]);
    }

    currentBatch.push(item);

    if (currentBatch.length === batchSize) {
      console.log(
        "handling currentBatch",
        i,
        currentBatch.length,
        referenceList.length
      );
      await handler(currentBatch);
      currentBatch = [];
    }
  }

  if (currentBatch.length > 0) {
    console.log(
      "handling final batch",
      currentBatch.length,
      referenceList.length
    );
    await handler(currentBatch);
  }
}

async function updateTokensPerInterval(distributor, tokensPerInterval, label, signer, gasOverrides) {
  const prevTokensPerInterval = await distributor.tokensPerInterval();
  if (prevTokensPerInterval.eq(0)) {
    // if the tokens per interval was zero, the distributor.lastDistributionTime may not have been updated for a while
    // so the lastDistributionTime should be manually updated here
    await sendTxn(
      distributor.updateLastDistributionTime({ gasLimit: 1000000, ...(gasOverrides || {}) }),
      `${label}.updateLastDistributionTime`,
      signer
    );
  }
  await sendTxn(
    distributor.setTokensPerInterval(tokensPerInterval, { gasLimit: 1000000, ...(gasOverrides || {}) }),
    `${label}.setTokensPerInterval`,
    signer
  );
}

module.exports = {
  getFrameSigner,
  sendTxn,
  deployContract,
  verifyContract,
  contractAt,
  callWithRetries,
  processBatch,
  updateTokensPerInterval,
  sleep,
  signers,
};
