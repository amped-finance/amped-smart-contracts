const { deployContract, contractAt, sendTxn } = require("../shared/helpers");
const { expandDecimals, formatAmount } = require("../../test/shared/utilities");
const { ethers } = require("ethers");
const fs = require('fs');
const path = require('path');
const VaultABI = require("../../artifacts/contracts/core/Vault.sol/Vault.json").abi;
const ReaderABI = require("../../artifacts/contracts/peripherals/Reader.sol/Reader.json").abi;
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// Load environment variables to get RPC URLs
const envPath = path.join(__dirname, '../../env.json');
let envConfig = {};
if (fs.existsSync(envPath)) {
    envConfig = require(envPath);
} else {
    console.warn("env.json not found, RPC URLs must be set via environment variables or script will fail.");
}

// Helper to get RPC URL, checking env.json then process.env
function getRpcUrl(network) {
    const networkUpper = network.toUpperCase();
    const envJsonKey = `${networkUpper}_RPC`;
    const processEnvKey = `${networkUpper}_RPC`; // Assuming same naming convention

    if (envConfig[envJsonKey]) {
        return envConfig[envJsonKey];
    }
    if (process.env[processEnvKey]) {
        return process.env[processEnvKey];
    }
    console.error(`RPC URL for network ${network} not found in env.json (as ${envJsonKey}) or process.env (as ${processEnvKey})`);
    return null;
}

const allTokens = require('./tokens'); // Load all network tokens

// Define the networks that are supported by this script. This is the master list; users can
// narrow it down via the `--network` / `-n` CLI flag when invoking the script.
const SUPPORTED_NETWORKS = ['phoenix', 'berachain', 'sonic', 'base', 'superseed'];

// ---------------------- CLI ARGUMENT PARSING ----------------------
// Usage examples:
//   node readCurrentTokenConfigs.js               -> processes ALL supported networks
//   node readCurrentTokenConfigs.js --network base           -> processes only "base"
//   node readCurrentTokenConfigs.js -n sonic,superseed       -> processes "sonic" and "superseed"

const argv = yargs(hideBin(process.argv))
  .option('network', {
    alias: 'n',
    type: 'string',
    description: 'Comma‑separated list of networks to process (e.g. "base" or "sonic,base")',
  })
  .help(false)
  .version(false)
  .argv;

let networksToProcess = SUPPORTED_NETWORKS;
if (argv.network) {
  networksToProcess = argv.network
    .split(',')
    .map((n) => n.trim().toLowerCase())
    .filter((n) => n.length > 0);

  // Validate the user‑provided networks against SUPPORTED_NETWORKS so we fail fast on typos.
  const unknown = networksToProcess.filter((n) => !SUPPORTED_NETWORKS.includes(n));
  if (unknown.length > 0) {
    console.error(`\n[ERROR] Unknown network(s) specified: ${unknown.join(', ')}`);
    console.error(`Supported networks are: ${SUPPORTED_NETWORKS.join(', ')}`);
    process.exit(1);
  }
}

// If the user didn't provide -n/--network, but the script is being executed via
// Hardhat (i.e. `npx hardhat run --network <net>`), infer the network from
// Hardhat so that the script automatically focuses on that single network.
if (!argv.network) {
  try {
    // Dynamically import hardhat only if available (so plain Node execution isn't affected)
    // eslint-disable-next-line import/no-extraneous-dependencies, global-require
    const hardhat = require('hardhat');
    if (hardhat && hardhat.network && hardhat.network.name) {
      const inferred = hardhat.network.name.toLowerCase();
      if (SUPPORTED_NETWORKS.includes(inferred)) {
        networksToProcess = [inferred];
        console.log(`[INFO] Detected Hardhat runtime. Defaulting to network "${inferred}".`);
      } else {
        console.warn(`[WARN] Hardhat network "${inferred}" is not in SUPPORTED_NETWORKS; processing all networks instead.`);
      }
    }
  } catch (err) {
    // Not running inside Hardhat or Hardhat not installed; ignore.
  }
}
// ------------------------------------------------------------------

// Function to get contract addresses based on network
async function getContractAddresses(network) {
  const deployFilePath = path.join(__dirname, `../deploy-${network}.json`);
  console.log(`Attempting to load deployment file for ${network}: ${deployFilePath}`);

  if (!fs.existsSync(deployFilePath)) {
    console.error(`Deployment file not found for network ${network}: ${deployFilePath}`);
    return { vault: null, reader: null };
  }

  try {
    const deploymentData = require(deployFilePath);

    const vaultEntry = deploymentData.find(d => d.name === "Vault");
    const readerEntry = deploymentData.find(d => d.name === "Reader");

    if (!vaultEntry || !vaultEntry.imple) {
        console.error(`Vault address ('imple' field) not found in ${deployFilePath}`);
        return { vault: null, reader: null };
    }
    if (!readerEntry || !readerEntry.imple) {
        console.error(`Reader address ('imple' field) not found in ${deployFilePath}`);
        return { vault: vaultEntry.imple, reader: null }; // Return vault if found, reader if not
    }

    console.log(`Found addresses for ${network}: Vault=${vaultEntry.imple}, Reader=${readerEntry.imple}`);
    return {
      vault: vaultEntry.imple,
      reader: readerEntry.imple
    };
  } catch (error) {
    console.error(`Error reading or parsing deployment file for ${network} (${deployFilePath}):`, error);
    return { vault: null, reader: null };
  }
}

async function processNetwork(network) {
  console.log(`\n========================================`);
  console.log(` Processing network: ${network.toUpperCase()} `);
  console.log(`========================================\n`);

  const rpcUrl = getRpcUrl(network);
  if (!rpcUrl) {
    console.error(`Skipping ${network} due to missing RPC URL.`);
    return;
  }
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  console.log(`Using RPC: ${rpcUrl}`);

  const tokens = allTokens[network];
  if (!tokens) {
      console.error(`Token definitions not found for network: ${network} in scripts/core/tokens.js`);
      return; // Skip this network if tokens are missing
  }

  const { vault: vaultAddress, reader: readerAddress } = await getContractAddresses(network);

  if (!vaultAddress || !readerAddress) {
      console.error(`Vault or Reader address missing for network ${network}. Skipping.`);
      return;
  }

  // Pass the specific provider for this network
  const vault = new ethers.Contract(vaultAddress, VaultABI, provider);
  const reader = new ethers.Contract(readerAddress, ReaderABI, provider);

  let tokensToCheck = [];
  let nativeTokenAddress = ethers.constants.AddressZero;

  // Dynamically define tokens and native token based on network
  // Assuming structure in tokens.js maps network name to token objects like:
  // { phoenix: { weth: {...}, usdc: {...}, nativeTokenSymbol: 'weth' }, ... }
  // Adjust the logic below based on the actual structure of your tokens.js

  const networkTokens = allTokens[network];
  const nativeTokenSymbol = networkTokens.nativeTokenSymbol || 'eth'; // Default or specific native symbol
  tokensToCheck = Object.values(networkTokens).filter(t => typeof t === 'object' && t.address); // Get all defined token objects
  const nativeTokenInfo = tokensToCheck.find(t => t.name.toLowerCase() === nativeTokenSymbol.toLowerCase() || (t.symbol && t.symbol.toLowerCase() === nativeTokenSymbol.toLowerCase()));

  if (nativeTokenInfo) {
      nativeTokenAddress = nativeTokenInfo.address;
      console.log(`Identified native token for ${network}: ${nativeTokenInfo.name} (${nativeTokenAddress})`);
  } else if (tokensToCheck.length > 0) {
      // Fallback or specific logic if nativeTokenSymbol isn't found directly
      // Example: Using the first token or a default like WETH/WBTC/etc. if applicable
      if (network === 'base' && networkTokens.weth) nativeTokenAddress = networkTokens.weth.address;
      else if (network === 'phoenix' && networkTokens.weth) nativeTokenAddress = networkTokens.weth.address;
      else if (network === 'sonic' && networkTokens.ws) nativeTokenAddress = networkTokens.ws.address; // Assuming WS is native wrapper
      else if (network === 'berachain' && networkTokens.wbera) nativeTokenAddress = networkTokens.wbera.address; // Assuming WBERA is native wrapper
      else if (network === 'superseed' && networkTokens.weth) nativeTokenAddress = networkTokens.weth.address; // WETH is native wrapper on Superseed
      else {
          console.warn(`Could not definitively identify native token for ${network} based on symbol '${nativeTokenSymbol}'. Using Zero Address. Check tokens.js`);
          // nativeTokenAddress = ethers.constants.AddressZero; // Already default
      }
       if (nativeTokenAddress !== ethers.constants.AddressZero) {
            console.log(`Fallback: Identified native token for ${network}: address ${nativeTokenAddress}`);
       }
  } else {
      console.error(`No tokens defined or native token could not be identified for network: ${network}. Using Zero Address.`);
      // nativeTokenAddress = ethers.constants.AddressZero; // Already default
  }


  if (tokensToCheck.length === 0) {
      console.warn(`No tokens found to check for network: ${network}`);
      return;
  }

  console.log(`Vault Address: ${vaultAddress}`);
  console.log(`Reader Address: ${readerAddress}`);
  console.log("Checking tokens:", tokensToCheck.map(t => `${t.name} (${t.address})`).join(", "));
  console.log("\n---\n");

  const tokenAddresses = tokensToCheck.map(t => t.address);
  // Ensure nativeTokenAddress is valid before calling reader
  if (!ethers.utils.isAddress(nativeTokenAddress)) {
      console.error(`Invalid nativeTokenAddress derived for ${network}: ${nativeTokenAddress}. Skipping reader call.`);
      return;
  }

  // *** Add error handling for reader call ***
  let vaultTokenInfo;
  try {
      vaultTokenInfo = await reader.getVaultTokenInfoV2(vault.address, nativeTokenAddress, 1, tokenAddresses);
  } catch (error) {
      console.error(`Error calling reader.getVaultTokenInfoV2 for ${network}:`, error);
      console.error(`Vault: ${vault.address}, Reader: ${reader.address}, Native: ${nativeTokenAddress}`);
      console.error(`Tokens: ${tokenAddresses.join(', ')}`);
      console.error(`Skipping token details for ${network}.`);
      return; // Skip the rest of the processing for this network
  }

  const vaultPropsLength = 14; // Number of properties returned per token by getVaultTokenInfoV2

  for (const [i, tokenItem] of tokensToCheck.entries()) {
    console.log(`Token: ${tokenItem.name} (${tokenItem.address})`);

    // Extract data from the reader result array
    // Add checks for array bounds
    const baseIndex = i * vaultPropsLength;
    if (baseIndex + 11 >= vaultTokenInfo.length) {
        console.error(`  Error: Not enough data returned from reader for token ${tokenItem.name}. Expected at least ${baseIndex + 12} items, got ${vaultTokenInfo.length}. Skipping.`);
        continue; // Skip this token
    }

    const tokenInfo = {
      poolAmount: vaultTokenInfo[baseIndex],
      reservedAmount: vaultTokenInfo[baseIndex + 1],
      usdgAmount: vaultTokenInfo[baseIndex + 2],      // Already scaled (18 decimals)
      redemptionAmount: vaultTokenInfo[baseIndex + 3],
      weight: vaultTokenInfo[baseIndex + 4],
      bufferAmount: vaultTokenInfo[baseIndex + 5],      // Already scaled (token decimals)
      maxUsdgAmount: vaultTokenInfo[baseIndex + 6],     // Already scaled (18 decimals)
      globalShortSize: vaultTokenInfo[baseIndex + 7],
      maxGlobalShortSize: vaultTokenInfo[baseIndex + 8],
      minPrice: vaultTokenInfo[baseIndex + 9],
      maxPrice: vaultTokenInfo[baseIndex + 10],
      guaranteedUsd: vaultTokenInfo[baseIndex + 11]
      // Indices 12 and 13 are not used here (cumulative funding rate and last funding time)
    };

    // Read additional config directly from Vault
    // *** Add error handling for vault calls ***
    let decimals, isStable, isShortable, minProfitBps;
    try {
        decimals = await vault.tokenDecimals(tokenItem.address);
        isStable = await vault.stableTokens(tokenItem.address);
        isShortable = await vault.shortableTokens(tokenItem.address);
        minProfitBps = await vault.minProfitBasisPoints(tokenItem.address);
    } catch (error) {
        console.error(`  Error reading vault config for token ${tokenItem.name} (${tokenItem.address}):`, error);
        console.error(`  Skipping details for this token.`);
        continue; // Skip this token
    }

    // Print the configuration
    console.log(`  Decimals: ${decimals.toString()}`);
    console.log(`  Is Stable: ${isStable}`);
    console.log(`  Is Shortable: ${isShortable}`);
    console.log(`  Token Weight: ${tokenInfo.weight.toString()}`);
    console.log(`  Min Profit BPS: ${minProfitBps.toString()}`);
    console.log(`  Max USDG Amount (scaled): ${tokenInfo.maxUsdgAmount.toString()} (${formatAmount(tokenInfo.maxUsdgAmount, 18, 2, true)} USDG)`);
    console.log(`  Buffer Amount (scaled): ${tokenInfo.bufferAmount.toString()} (${formatAmount(tokenInfo.bufferAmount, decimals, 4, true)} ${tokenItem.name})`);
    console.log(`  Current USDG Amount (scaled): ${tokenInfo.usdgAmount.toString()} (${formatAmount(tokenInfo.usdgAmount, 18, 2, true)} USDG)`);
    console.log(`  Pool Amount (scaled): ${tokenInfo.poolAmount.toString()} (${formatAmount(tokenInfo.poolAmount, decimals, 4, true)} ${tokenItem.name})`);
    console.log(`  Reserved Amount (scaled): ${tokenInfo.reservedAmount.toString()} (${formatAmount(tokenInfo.reservedAmount, decimals, 4, true)} ${tokenItem.name})`);
    console.log(`  Guaranteed USD (scaled): ${tokenInfo.guaranteedUsd.toString()} (${formatAmount(tokenInfo.guaranteedUsd, 30, 2, true)} USD)`); // Guaranteed USD has 30 decimals
    console.log("---");
  }

  // --- Calculate and display total USDG amount ---
  console.log(`\nCalculating total USDG amount across all whitelisted tokens for ${network}...`);
  let totalUsdgAmount = ethers.BigNumber.from(0);
  let tokenCount = 0;
  const allTokenAddresses = []; // Store addresses for logging

  try {
      tokenCount = await vault.allWhitelistedTokensLength();
      for (let i = 0; i < tokenCount; i++) {
        const tokenAddress = await vault.allWhitelistedTokens(i);
        allTokenAddresses.push(tokenAddress);
        const usdgAmt = await vault.usdgAmounts(tokenAddress);
        totalUsdgAmount = totalUsdgAmount.add(usdgAmt);
      }
      console.log(`Found ${tokenCount} whitelisted tokens for ${network}: ${allTokenAddresses.join(', ')}`);
      console.log(`\nTotal USDG Amount for ${network} (scaled): ${totalUsdgAmount.toString()} (${formatAmount(totalUsdgAmount, 18, 6, true)} USDG)`);

  } catch (error) {
      console.error(`Error calculating total USDG amount for ${network}:`, error);
  }
  console.log("---");

}

async function main() {
    console.log("Starting token config read for all supported networks...");

    for (const network of networksToProcess) {
        try {
            await processNetwork(network);
        } catch (error) {
            console.error(`\n!!!!!!!! UNHANDLED ERROR PROCESSING NETWORK: ${network} !!!!!!!!`);
            console.error(error);
            console.error(`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n`);
        }
    }

    console.log("\nFinished processing all networks.");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("An unexpected error occurred during the main execution:");
    console.error(error);
    process.exit(1);
  }); 