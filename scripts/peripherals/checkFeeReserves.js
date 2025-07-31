console.log("Script starting..."); // Added for debugging

const { ethers } = require("ethers");
console.log("Loaded ethers"); // Debug log

const tokensConfig = require('../core/tokens');
console.log("Loaded tokensConfig"); // Debug log

const env = require('../../env.json');
console.log("Loaded env.json"); // Debug log

const baseDeployments = require('../deploy-base.json');
console.log("Loaded deploy-base.json"); // Debug log

const sonicDeployments = require('../deploy-sonic.json');
console.log("Loaded deploy-sonic.json"); // Debug log

const phoenixDeployments = require('../deploy-phoenix.json');
console.log("Loaded deploy-phoenix.json"); // Debug log

const berachainDeployments = require('../deploy-berachain.json');
console.log("Loaded deploy-berachain.json"); // Debug log

const superseedDeployments = require('../deploy-superseed.json');
console.log("Loaded deploy-superseed.json for superseed"); // Debug log

// Minimal ABI for the Vault feeReserves function
const vaultAbi = [
  "function feeReserves(address _token) view returns (uint256)"
];

// Helper to find deployment address
const findAddress = (deployments, name) => {
    const entry = deployments.find(d => d.name === name);
    return entry ? entry.imple : null;
};

// Network configurations
const networks = {
  base: {
    rpcUrl: env.BASE_RPC,
    vaultAddress: findAddress(baseDeployments, "Vault"),
    tokens: tokensConfig.base
  },
  sonic: {
    rpcUrl: env.SONIC_RPC,
    vaultAddress: findAddress(sonicDeployments, "Vault"),
    tokens: tokensConfig.sonic
  },
  phoenix: {
    rpcUrl: env.PHOENIX_RPC,
    vaultAddress: findAddress(phoenixDeployments, "Vault"),
    tokens: tokensConfig.phoenix
  },
  berachain: {
    rpcUrl: env.BERACHAIN_RPC,
    vaultAddress: findAddress(berachainDeployments, "Vault"),
    tokens: tokensConfig.berachain
  },
  superseed: {
    rpcUrl: env.SUPERSEED_RPC,
    vaultAddress: findAddress(superseedDeployments, "Vault"),
    tokens: tokensConfig.superseed
  }
};

async function checkFeeReserves() {
  console.log("Checking Fee Reserves..."); // Corrected

  for (const networkName in networks) {
    const config = networks[networkName];
    console.log(`--- Network: ${networkName.toUpperCase()} ---`);

    if (!config.rpcUrl) {
        console.error(`  Error: RPC URL not found for network ${networkName} in env.json`);
        console.log('---------------------------'); // Corrected
        continue;
    }
     if (!config.vaultAddress) {
        console.error(`  Error: Vault address not found for network ${networkName} in deploy-${networkName}.json`);
        console.log('---------------------------'); // Corrected
        continue;
    }
     if (!config.tokens || Object.keys(config.tokens).length === 0) {
        console.warn(`  Warning: No token configurations found for network ${networkName} in tokens.js`);
        console.log('---------------------------'); // Corrected
        continue;
    }

    console.log(`  Vault: ${config.vaultAddress}`);
    console.log(`  RPC: ${config.rpcUrl}`);

    try {
      const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
      const vaultContract = new ethers.Contract(config.vaultAddress, vaultAbi, provider);

      const tokenKeys = Object.keys(config.tokens);

      console.log("  Fee Reserves:");
      for (const tokenKey of tokenKeys) {
          const token = config.tokens[tokenKey];
           if (!token.address || token.address === "0x0000000000000000000000000000000000000000") {
              console.log(`    ${token.name} (${tokenKey}): Skipping (Address is zero or missing)`);
              continue;
            }
          try {
              const feeReservesRaw = await vaultContract.feeReserves(token.address);
              // Ensure decimals is a number, default to 18 if undefined/null
              const decimals = (typeof token.decimals === 'number') ? token.decimals : 18;
              if (typeof token.decimals === 'undefined' || token.decimals === null) {
                 console.warn(`      Warning: Decimals not defined for ${token.name} (${tokenKey}) on ${networkName}, assuming 18.`);
              }
              const feeReservesFormatted = ethers.utils.formatUnits(feeReservesRaw, decimals);
              console.log(`    ${token.name} (${tokenKey}): ${feeReservesFormatted}`);
          } catch (tokenError) {
              // Handle cases where the token might not be configured in the vault, leading to reverts
              if (tokenError.code === 'CALL_EXCEPTION') {
                 console.warn(`    ${token.name} (${tokenKey}): Could not fetch (Perhaps not configured in Vault)`);
              } else {
                 console.error(`    Error fetching fee reserve for ${token.name} (${token.address}): ${tokenError.message}`);
              }
          }
      }

    } catch (networkError) {
      console.error(`  Error connecting or interacting with network ${networkName} (${config.rpcUrl}): ${networkError.message}`);
    }
    console.log('---------------------------'); // Corrected
  }
}

checkFeeReserves().catch((error) => {
  console.error("Script failed:", error);
  process.exit(1);
}); 