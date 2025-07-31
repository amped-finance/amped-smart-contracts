const { getFrameSigner, deployContract, contractAt, sendTxn } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const { toUsd } = require("../../test/shared/units")
const hre = require("hardhat")
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

// const network = (process.env.HARDHAT_NETWORK || 'mainnet'); // No longer used directly
const allTokens = require('./tokens'); // Load all network tokens

// Define network configurations
const networkConfigs = {
  sonic: {
    vaultAddress: "0x5B8caae7cC6Ea61fb96Fd251C4Bc13e48749C7Da",
    timelockAddress: "0xE97055C9087458434bf95dedA69531408cC210b5",
    tokens: [
      {
        name: "ANON",
        address: allTokens.sonic.anon.address, // "0x79bbf4508b1391af3a0f4b30bb5fc4aa9ab0e07c",
        tokenWeight: allTokens.sonic.anon.tokenWeight, // 1500,
        minProfitBps: allTokens.sonic.anon.minProfitBps, // 20,
        maxUsdgAmount: allTokens.sonic.anon.maxUsdgAmount, // 25000,
        bufferAmount: allTokens.sonic.anon.bufferAmount, // 1000,
        usdgAmount: "22570000000000000000000" // Specific to existing sonic config in script
      },
      {
        name: "WETH",
        address: allTokens.sonic.weth.address, // "0x50c42deacd8fc9773493ed674b675be577f2634b",
        tokenWeight: allTokens.sonic.weth.tokenWeight, // 4000,
        minProfitBps: allTokens.sonic.weth.minProfitBps, // 20,
        maxUsdgAmount: allTokens.sonic.weth.maxUsdgAmount, // 200000,
        bufferAmount: allTokens.sonic.weth.bufferAmount, // 1000,
        usdgAmount: "436000000000000000000" // Specific to existing sonic config in script
      },
      {
        name: "WS",
        address: allTokens.sonic.ws.address, // "0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38",
        tokenWeight: allTokens.sonic.ws.tokenWeight, // 8000,
        minProfitBps: allTokens.sonic.ws.minProfitBps, // 20,
        maxUsdgAmount: allTokens.sonic.ws.maxUsdgAmount, // 300000,
        bufferAmount: allTokens.sonic.ws.bufferAmount, // 1000,
        usdgAmount: "4271000000000000000000" // Specific to existing sonic config in script
      },
      {
        name: "STS",
        address: allTokens.sonic.sts.address, // "0xE5DA20F15420aD15DE0fa650600aFc998bbE3955",
        tokenWeight: allTokens.sonic.sts.tokenWeight, // 8000,
        minProfitBps: allTokens.sonic.sts.minProfitBps, // 20,
        maxUsdgAmount: allTokens.sonic.sts.maxUsdgAmount, // 300000,
        bufferAmount: allTokens.sonic.sts.bufferAmount, // 1000,
        usdgAmount: "701000000000000000000" // Specific to existing sonic config in script
      },
      {
        name: "USDC",
        address: allTokens.sonic.usdc.address, // "0x29219dd400f2bf60e5a23d13be72b486d4038894",
        tokenWeight: allTokens.sonic.usdc.tokenWeight, // 3000,
        minProfitBps: allTokens.sonic.usdc.minProfitBps, // 20,
        maxUsdgAmount: allTokens.sonic.usdc.maxUsdgAmount, // 150000,
        bufferAmount: allTokens.sonic.usdc.bufferAmount, // 1000,
        usdgAmount: "00000000000000000000000" // Specific to existing sonic config in script
      },
      {
        name: "SCUSD",
        address: allTokens.sonic.scusd.address, // "0xd3DCe716f3eF535C5Ff8d041c1A41C3bd89b97aE",
        tokenWeight: allTokens.sonic.scusd.tokenWeight, // 5000,
        minProfitBps: allTokens.sonic.scusd.minProfitBps, // 20,
        maxUsdgAmount: allTokens.sonic.scusd.maxUsdgAmount, // 312000,
        bufferAmount: allTokens.sonic.scusd.bufferAmount, // 1000,
        usdgAmount: "24441780000000000000000" // Specific to existing sonic config in script
      },
      {
        name: "SHADOW",
        address: allTokens.sonic.shadow.address, // "0xd3DCe716f3eF535C5Ff8d041c1A41C3bd89b97aE",
        tokenWeight: allTokens.sonic.shadow.tokenWeight, // 5000,
        minProfitBps: allTokens.sonic.shadow.minProfitBps, // 20,
        maxUsdgAmount: allTokens.sonic.shadow.maxUsdgAmount, // 312000,
        bufferAmount: allTokens.sonic.shadow.bufferAmount, // 1000,
        usdgAmount: "0" // Specific to existing sonic config in script
      }
      ,
      {
        name: "WBTC",
        address: allTokens.sonic.wbtc.address, // "0xd3DCe716f3eF535C5Ff8d041c1A41C3bd89b97aE",
        tokenWeight: allTokens.sonic.wbtc.tokenWeight, // 5000,
        minProfitBps: allTokens.sonic.wbtc.minProfitBps, // 20,
        maxUsdgAmount: allTokens.sonic.wbtc.maxUsdgAmount, // 312000,
        bufferAmount: allTokens.sonic.wbtc.bufferAmount, // 1000,
        usdgAmount: "0" // Specific to existing sonic config in script
      }
    ]
  },
  phoenix: { // Added Phoenix network configuration
    vaultAddress: "0xa6b88069EDC7a0C2F062226743C8985FF72bB2Eb",
    timelockAddress: "0x585693AedB4c18424ED7cCd13589c048BdE00785",
    tokens: [
      // WARNING: usdgAmount is set to "0" as a placeholder. Please verify and update for Phoenix.
      {
        name: allTokens.phoenix.usdt.name,
        address: allTokens.phoenix.usdt.address,
        tokenWeight: allTokens.phoenix.usdt.tokenWeight,
        minProfitBps: allTokens.phoenix.usdt.minProfitBps,
        maxUsdgAmount: allTokens.phoenix.usdt.maxUsdgAmount,
        bufferAmount: allTokens.phoenix.usdt.bufferAmount,
        usdgAmount: "35" // Placeholder
      },
      {
        name: allTokens.phoenix.usdc.name,
        address: allTokens.phoenix.usdc.address,
        tokenWeight: allTokens.phoenix.usdc.tokenWeight,
        minProfitBps: allTokens.phoenix.usdc.minProfitBps,
        maxUsdgAmount: allTokens.phoenix.usdc.maxUsdgAmount,
        bufferAmount: allTokens.phoenix.usdc.bufferAmount,
        usdgAmount: "3818" // Placeholder
      },
      {
        name: allTokens.phoenix.usdtsg.name,
        address: allTokens.phoenix.usdtsg.address,
        tokenWeight: allTokens.phoenix.usdtsg.tokenWeight,
        minProfitBps: allTokens.phoenix.usdtsg.minProfitBps,
        maxUsdgAmount: allTokens.phoenix.usdtsg.maxUsdgAmount,
        bufferAmount: allTokens.phoenix.usdtsg.bufferAmount,
        usdgAmount: "1393" // Placeholder
      },
      {
        name: allTokens.phoenix.usdcsg.name,
        address: allTokens.phoenix.usdcsg.address,
        tokenWeight: allTokens.phoenix.usdcsg.tokenWeight,
        minProfitBps: allTokens.phoenix.usdcsg.minProfitBps,
        maxUsdgAmount: allTokens.phoenix.usdcsg.maxUsdgAmount,
        bufferAmount: allTokens.phoenix.usdcsg.bufferAmount,
        usdgAmount: "335" // Placeholder
      },
      {
        name: allTokens.phoenix.ll.name,
        address: allTokens.phoenix.ll.address,
        tokenWeight: allTokens.phoenix.ll.tokenWeight,
        minProfitBps: allTokens.phoenix.ll.minProfitBps,
        maxUsdgAmount: allTokens.phoenix.ll.maxUsdgAmount,
        bufferAmount: allTokens.phoenix.ll.bufferAmount,
        usdgAmount: "104048" // Placeholder
      },
      {
        name: allTokens.phoenix.wbnb.name,
        address: allTokens.phoenix.wbnb.address,
        tokenWeight: allTokens.phoenix.wbnb.tokenWeight,
        minProfitBps: allTokens.phoenix.wbnb.minProfitBps,
        maxUsdgAmount: allTokens.phoenix.wbnb.maxUsdgAmount,
        bufferAmount: allTokens.phoenix.wbnb.bufferAmount,
        usdgAmount: "134" // Placeholder
      },
      {
        name: allTokens.phoenix.weth.name,
        address: allTokens.phoenix.weth.address,
        tokenWeight: allTokens.phoenix.weth.tokenWeight,
        minProfitBps: allTokens.phoenix.weth.minProfitBps,
        maxUsdgAmount: allTokens.phoenix.weth.maxUsdgAmount,
        bufferAmount: allTokens.phoenix.weth.bufferAmount,
        usdgAmount: "1" // Placeholder
      },
      {
        name: allTokens.phoenix.wbtc.name,
        address: allTokens.phoenix.wbtc.address,
        tokenWeight: allTokens.phoenix.wbtc.tokenWeight,
        minProfitBps: allTokens.phoenix.wbtc.minProfitBps,
        maxUsdgAmount: allTokens.phoenix.wbtc.maxUsdgAmount,
        bufferAmount: allTokens.phoenix.wbtc.bufferAmount,
        usdgAmount: "97" // Placeholder
      }
    ]
  },
  berachain: { // Added Berachain network configuration
    vaultAddress: "0xc3727b7E7F3FF97A111c92d3eE05529dA7BD2f48",
    timelockAddress: "0xfCE9Fb0Fd92d6A19b1ee1CcaEb9d0480617E726e",
    tokens: [
      // WARNING: usdgAmount is set to "0" as a placeholder. Please verify and update for Berachain.
      {
        name: allTokens.berachain.honey.name,
        address: allTokens.berachain.honey.address,
        tokenWeight: allTokens.berachain.honey.tokenWeight,
        minProfitBps: allTokens.berachain.honey.minProfitBps,
        maxUsdgAmount: allTokens.berachain.honey.maxUsdgAmount,
        bufferAmount: allTokens.berachain.honey.bufferAmount,
        usdgAmount: "502" // Placeholder
      },
      {
        name: allTokens.berachain.usdc.name, // Note: tokens.js uses 'eurc' key but name 'usdc'
        address: allTokens.berachain.usdc.address,
        tokenWeight: allTokens.berachain.usdc.tokenWeight,
        minProfitBps: allTokens.berachain.usdc.minProfitBps,
        maxUsdgAmount: allTokens.berachain.usdc.maxUsdgAmount,
        bufferAmount: allTokens.berachain.usdc.bufferAmount,
        usdgAmount: "28" // Placeholder
      },
      {
        name: allTokens.berachain.wbera.name,
        address: allTokens.berachain.wbera.address,
        tokenWeight: allTokens.berachain.wbera.tokenWeight,
        minProfitBps: allTokens.berachain.wbera.minProfitBps,
        maxUsdgAmount: allTokens.berachain.wbera.maxUsdgAmount,
        bufferAmount: allTokens.berachain.wbera.bufferAmount,
        usdgAmount: "5243" // Placeholder
      },
      {
        name: allTokens.berachain.weth.name,
        address: allTokens.berachain.weth.address,
        tokenWeight: allTokens.berachain.weth.tokenWeight,
        minProfitBps: allTokens.berachain.weth.minProfitBps,
        maxUsdgAmount: allTokens.berachain.weth.maxUsdgAmount,
        bufferAmount: allTokens.berachain.weth.bufferAmount,
        usdgAmount: "2311" // Placeholder
      }
    ]
  },
  base: {
    vaultAddress: "0xed33E4767B8d68bd7F64c429Ce4989686426a926",
    timelockAddress: "0x69E44517D74709d552A69046585bef02d8c34D5B",
    tokens: [
      // WARNING: usdgAmount is set to "0" as a placeholder. Please verify and update.
      {
        name: allTokens.base.usdc.name, // "usdc"
        address: allTokens.base.usdc.address, // "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"
        tokenWeight: allTokens.base.usdc.tokenWeight, // 6000
        minProfitBps: allTokens.base.usdc.minProfitBps, // 0
        maxUsdgAmount: allTokens.base.usdc.maxUsdgAmount, // 0
        bufferAmount: allTokens.base.usdc.bufferAmount, // 1000000
        usdgAmount: "19303" // Placeholder - Please verify and update for Base
      },
      {
        name: allTokens.base.weth.name, // "weth"
        address: allTokens.base.weth.address, // "0x4200000000000000000000000000000000000006"
        tokenWeight: allTokens.base.weth.tokenWeight, // 12000
        minProfitBps: allTokens.base.weth.minProfitBps, // 0
        maxUsdgAmount: allTokens.base.weth.maxUsdgAmount, // 0
        bufferAmount: allTokens.base.weth.bufferAmount, // 1000000
        usdgAmount: "0" // Placeholder - Please verify and update for Base
      },
      {
        // Assuming cbbtc is the correct name mapping from tokens.js
        name: allTokens.base.cbbtc.name, // "cbbtc"
        address: allTokens.base.cbbtc.address, // "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf"
        tokenWeight: allTokens.base.cbbtc.tokenWeight, // 8000
        minProfitBps: allTokens.base.cbbtc.minProfitBps, // 0
        maxUsdgAmount: allTokens.base.cbbtc.maxUsdgAmount, // 0
        bufferAmount: allTokens.base.cbbtc.bufferAmount, // 1000000
        usdgAmount: "2999" // Placeholder - Please verify and update for Base
      }
    ]
  }
}

async function updateToken(timelock, vault, tokenConfig) {
  const {
    address,
    tokenWeight,
    minProfitBps,
    maxUsdgAmount,
    bufferAmount,
    usdgAmount
  } = tokenConfig

  console.log(`\nUpdating token ${tokenConfig.name} (${address}) config via Timelock:`)
  console.log(`  Weight: ${tokenWeight}, MinProfitBps: ${minProfitBps}`)
  console.log(`  MaxUsdgAmount: ${maxUsdgAmount}, BufferAmount: ${bufferAmount}, UsdgAmount: ${usdgAmount}`)

  await sendTxn(
    timelock.setTokenConfig(
      vault.address,
      address,
      tokenWeight,
      minProfitBps,
      maxUsdgAmount,
      bufferAmount,
      usdgAmount
    ),
    `timelock.setTokenConfig(${tokenConfig.name})`
  )
}

async function main() {
  // --- Determine Network --- 
  let networkName;
  if (hre && hre.network && hre.network.name) {
    // If running within Hardhat runtime environment, use its network name
    networkName = hre.network.name;
    console.log(`[DEBUG] Detected Hardhat environment. Using network name: ${networkName}`);
  } else {
    // Otherwise (e.g., running with node), parse command line args
    console.log("[DEBUG] Not in Hardhat environment or hre.network.name undefined. Parsing args with yargs...");
    const argv = yargs(hideBin(process.argv))
      .option('network', {
        alias: 'n',
        type: 'string',
        description: 'Network name (e.g., sonic, base)',
        default: 'sonic' // Default to sonic if not provided
      })
      .argv;
    networkName = argv.network.toLowerCase();
    console.log(`[DEBUG] yargs parsed network name: ${networkName}`);
  }
  // Ensure networkName is always lowercase for consistency
  networkName = networkName.toLowerCase();

  // --- Validate Network --- 
  if (!networkConfigs[networkName]) {
    console.error(`Error: Invalid or unsupported network specified: ${networkName}. Available networks in script: ${Object.keys(networkConfigs).join(', ')}`);
    process.exit(1);
  }

  const config = networkConfigs[networkName];
  console.log(`[DEBUG] Network selected by script: ${networkName}`);
  console.log(`[DEBUG] Using Vault address: ${config.vaultAddress}`);
  console.log(`[DEBUG] Using Timelock address: ${config.timelockAddress}`);
  console.log(`Starting token config update for ${networkName.toUpperCase()} network with Frame...`);
  
  // Connect to Frame
  const signer = await getFrameSigner()
  const signerAddress = await signer.getAddress()
  console.log("Using signer address:", signerAddress)
  
  // Core contract addresses from selected network config - connect with signer
  const vault = await contractAt("Vault", config.vaultAddress, signer)
  const timelock = await contractAt("Timelock", config.timelockAddress, signer)
  
  // Verify timelock access
  const isHandler = await timelock.isHandler(signerAddress)
  console.log("Is signer a handler?", isHandler)
  
  const isKeeper = await timelock.isKeeper(signerAddress)
  console.log("Is signer a keeper?", isKeeper)
  
  const admin = await timelock.admin()
  console.log("Timelock admin:", admin)
  console.log("Signer address:", signerAddress)
  
  if (!isHandler && !isKeeper && admin.toLowerCase() !== signerAddress.toLowerCase()) {
    throw new Error("Signer is not authorized to call timelock functions")
  }
  
  // NOTE: Removed the setFees transaction - now only setting token config
  
  // Configure tokens
  const tokenConfigs = config.tokens; // Use tokens from the selected network config

  // Get the target token symbol from environment variable
  const targetSymbol = process.env.TARGET_TOKEN;

  if (targetSymbol) {
    // If a target token is specified, update only that one
    console.log(`Attempting to update config for specified token: ${targetSymbol}`);

    // Find the configuration for the target token (case-insensitive)
    const targetConfig = tokenConfigs.find(config => config.name.toUpperCase() === targetSymbol.toUpperCase());

    if (!targetConfig) {
      console.error(`Error: Configuration for specified token symbol "${targetSymbol}" not found in the script.`);
      const availableTokens = tokenConfigs.map(c => c.name).join(', ');
      console.error(`Available tokens in script: ${availableTokens}`);
      process.exit(1);
    }

    // Update only the target token's configuration
    console.log(`Found configuration for ${targetConfig.name}. Proceeding with update...`);
    await updateToken(timelock, vault, targetConfig);
    console.log(`Completed configuration update for ${targetConfig.name}`);

  } else {
    // If no target token is specified, update all tokens in the array
    console.log("No specific token provided via TARGET_TOKEN. Updating all tokens defined in the script...");

    for (const config of tokenConfigs) {
      await updateToken(timelock, vault, config);
    }

    console.log("Completed configuration updates for all tokens.");
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })