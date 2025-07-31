const { getFrameSigner, deployContract, contractAt, sendTxn } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const { toUsd } = require("../../test/shared/units")
const hre = require("hardhat")
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const allTokens = require('./tokens'); // Load all network tokens

// Define network configurations
const networkConfigs = {
  sonic: {
    vaultAddress: "0x5B8caae7cC6Ea61fb96Fd251C4Bc13e48749C7Da",
    timelockAddress: "0xE97055C9087458434bf95dedA69531408cC210b5",
    tokens: [
      {
        name: "ANON",
        address: allTokens.sonic.anon.address,
        tokenWeight: allTokens.sonic.anon.tokenWeight,
        minProfitBps: allTokens.sonic.anon.minProfitBps,
        maxUsdgAmount: allTokens.sonic.anon.maxUsdgAmount,
        bufferAmount: allTokens.sonic.anon.bufferAmount,
      },
      {
        name: "WETH",
        address: allTokens.sonic.weth.address,
        tokenWeight: allTokens.sonic.weth.tokenWeight,
        minProfitBps: allTokens.sonic.weth.minProfitBps,
        maxUsdgAmount: allTokens.sonic.weth.maxUsdgAmount,
        bufferAmount: allTokens.sonic.weth.bufferAmount,
      },
      {
        name: "WS",
        address: allTokens.sonic.ws.address,
        tokenWeight: allTokens.sonic.ws.tokenWeight,
        minProfitBps: allTokens.sonic.ws.minProfitBps,
        maxUsdgAmount: allTokens.sonic.ws.maxUsdgAmount,
        bufferAmount: allTokens.sonic.ws.bufferAmount,
      },
      {
        name: "STS",
        address: allTokens.sonic.sts.address,
        tokenWeight: allTokens.sonic.sts.tokenWeight,
        minProfitBps: allTokens.sonic.sts.minProfitBps,
        maxUsdgAmount: allTokens.sonic.sts.maxUsdgAmount,
        bufferAmount: allTokens.sonic.sts.bufferAmount,
      },
      {
        name: "USDC",
        address: allTokens.sonic.usdc.address,
        tokenWeight: allTokens.sonic.usdc.tokenWeight,
        minProfitBps: allTokens.sonic.usdc.minProfitBps,
        maxUsdgAmount: allTokens.sonic.usdc.maxUsdgAmount,
        bufferAmount: allTokens.sonic.usdc.bufferAmount,
      },
      {
        name: "SCUSD",
        address: allTokens.sonic.scusd.address,
        tokenWeight: allTokens.sonic.scusd.tokenWeight,
        minProfitBps: allTokens.sonic.scusd.minProfitBps,
        maxUsdgAmount: allTokens.sonic.scusd.maxUsdgAmount,
        bufferAmount: allTokens.sonic.scusd.bufferAmount,
      },
      {
        name: "SHADOW",
        address: allTokens.sonic.shadow.address,
        tokenWeight: allTokens.sonic.shadow.tokenWeight,
        minProfitBps: allTokens.sonic.shadow.minProfitBps,
        maxUsdgAmount: allTokens.sonic.shadow.maxUsdgAmount,
        bufferAmount: allTokens.sonic.shadow.bufferAmount,
      },
      {
        name: "WBTC",
        address: allTokens.sonic.wbtc.address,
        tokenWeight: allTokens.sonic.wbtc.tokenWeight,
        minProfitBps: allTokens.sonic.wbtc.minProfitBps,
        maxUsdgAmount: allTokens.sonic.wbtc.maxUsdgAmount,
        bufferAmount: allTokens.sonic.wbtc.bufferAmount,
      }
    ]
  },
  phoenix: {
    vaultAddress: "0xa6b88069EDC7a0C2F062226743C8985FF72bB2Eb",
    timelockAddress: "0x585693AedB4c18424ED7cCd13589c048BdE00785",
    tokens: [
      {
        name: allTokens.phoenix.usdt.name,
        address: allTokens.phoenix.usdt.address,
        tokenWeight: allTokens.phoenix.usdt.tokenWeight,
        minProfitBps: allTokens.phoenix.usdt.minProfitBps,
        maxUsdgAmount: allTokens.phoenix.usdt.maxUsdgAmount,
        bufferAmount: allTokens.phoenix.usdt.bufferAmount,
      },
      {
        name: allTokens.phoenix.usdc.name,
        address: allTokens.phoenix.usdc.address,
        tokenWeight: allTokens.phoenix.usdc.tokenWeight,
        minProfitBps: allTokens.phoenix.usdc.minProfitBps,
        maxUsdgAmount: allTokens.phoenix.usdc.maxUsdgAmount,
        bufferAmount: allTokens.phoenix.usdc.bufferAmount,
      },
      {
        name: allTokens.phoenix.usdtsg.name,
        address: allTokens.phoenix.usdtsg.address,
        tokenWeight: allTokens.phoenix.usdtsg.tokenWeight,
        minProfitBps: allTokens.phoenix.usdtsg.minProfitBps,
        maxUsdgAmount: allTokens.phoenix.usdtsg.maxUsdgAmount,
        bufferAmount: allTokens.phoenix.usdtsg.bufferAmount,
      },
      {
        name: allTokens.phoenix.usdcsg.name,
        address: allTokens.phoenix.usdcsg.address,
        tokenWeight: allTokens.phoenix.usdcsg.tokenWeight,
        minProfitBps: allTokens.phoenix.usdcsg.minProfitBps,
        maxUsdgAmount: allTokens.phoenix.usdcsg.maxUsdgAmount,
        bufferAmount: allTokens.phoenix.usdcsg.bufferAmount,
      },
      {
        name: allTokens.phoenix.ll.name,
        address: allTokens.phoenix.ll.address,
        tokenWeight: allTokens.phoenix.ll.tokenWeight,
        minProfitBps: allTokens.phoenix.ll.minProfitBps,
        maxUsdgAmount: allTokens.phoenix.ll.maxUsdgAmount,
        bufferAmount: allTokens.phoenix.ll.bufferAmount,
      },
      {
        name: allTokens.phoenix.wbnb.name,
        address: allTokens.phoenix.wbnb.address,
        tokenWeight: allTokens.phoenix.wbnb.tokenWeight,
        minProfitBps: allTokens.phoenix.wbnb.minProfitBps,
        maxUsdgAmount: allTokens.phoenix.wbnb.maxUsdgAmount,
        bufferAmount: allTokens.phoenix.wbnb.bufferAmount,
      },
      {
        name: allTokens.phoenix.weth.name,
        address: allTokens.phoenix.weth.address,
        tokenWeight: allTokens.phoenix.weth.tokenWeight,
        minProfitBps: allTokens.phoenix.weth.minProfitBps,
        maxUsdgAmount: allTokens.phoenix.weth.maxUsdgAmount,
        bufferAmount: allTokens.phoenix.weth.bufferAmount,
      },
      {
        name: allTokens.phoenix.wbtc.name,
        address: allTokens.phoenix.wbtc.address,
        tokenWeight: allTokens.phoenix.wbtc.tokenWeight,
        minProfitBps: allTokens.phoenix.wbtc.minProfitBps,
        maxUsdgAmount: allTokens.phoenix.wbtc.maxUsdgAmount,
        bufferAmount: allTokens.phoenix.wbtc.bufferAmount,
      }
    ]
  },
  berachain: {
    vaultAddress: "0xc3727b7E7F3FF97A111c92d3eE05529dA7BD2f48",
    timelockAddress: "0xfCE9Fb0Fd92d6A19b1ee1CcaEb9d0480617E726e",
    tokens: [
      {
        name: allTokens.berachain.honey.name,
        address: allTokens.berachain.honey.address,
        tokenWeight: allTokens.berachain.honey.tokenWeight,
        minProfitBps: allTokens.berachain.honey.minProfitBps,
        maxUsdgAmount: allTokens.berachain.honey.maxUsdgAmount,
        bufferAmount: allTokens.berachain.honey.bufferAmount,
      },
      {
        name: allTokens.berachain.usdc.name,
        address: allTokens.berachain.usdc.address,
        tokenWeight: allTokens.berachain.usdc.tokenWeight,
        minProfitBps: allTokens.berachain.usdc.minProfitBps,
        maxUsdgAmount: allTokens.berachain.usdc.maxUsdgAmount,
        bufferAmount: allTokens.berachain.usdc.bufferAmount,
      },
      {
        name: allTokens.berachain.wbera.name,
        address: allTokens.berachain.wbera.address,
        tokenWeight: allTokens.berachain.wbera.tokenWeight,
        minProfitBps: allTokens.berachain.wbera.minProfitBps,
        maxUsdgAmount: allTokens.berachain.wbera.maxUsdgAmount,
        bufferAmount: allTokens.berachain.wbera.bufferAmount,
      },
      {
        name: allTokens.berachain.weth.name,
        address: allTokens.berachain.weth.address,
        tokenWeight: allTokens.berachain.weth.tokenWeight,
        minProfitBps: allTokens.berachain.weth.minProfitBps,
        maxUsdgAmount: allTokens.berachain.weth.maxUsdgAmount,
        bufferAmount: allTokens.berachain.weth.bufferAmount,
      }
    ]
  },
  base: {
    vaultAddress: "0xed33E4767B8d68bd7F64c429Ce4989686426a926",
    timelockAddress: "0x69E44517D74709d552A69046585bef02d8c34D5B",
    tokens: [
      {
        name: allTokens.base.usdc.name,
        address: allTokens.base.usdc.address,
        tokenWeight: allTokens.base.usdc.tokenWeight,
        minProfitBps: allTokens.base.usdc.minProfitBps,
        maxUsdgAmount: allTokens.base.usdc.maxUsdgAmount,
        bufferAmount: allTokens.base.usdc.bufferAmount,
      },
      {
        name: allTokens.base.weth.name,
        address: allTokens.base.weth.address,
        tokenWeight: allTokens.base.weth.tokenWeight,
        minProfitBps: allTokens.base.weth.minProfitBps,
        maxUsdgAmount: allTokens.base.weth.maxUsdgAmount,
        bufferAmount: allTokens.base.weth.bufferAmount,
      },
      {
        name: allTokens.base.cbbtc.name,
        address: allTokens.base.cbbtc.address,
        tokenWeight: allTokens.base.cbbtc.tokenWeight,
        minProfitBps: allTokens.base.cbbtc.minProfitBps,
        maxUsdgAmount: allTokens.base.cbbtc.maxUsdgAmount,
        bufferAmount: allTokens.base.cbbtc.bufferAmount,
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
    name
  } = tokenConfig

  // Read the current usdgAmount from the vault
  const usdgAmount = await vault.usdgAmounts(address);

  console.log(`\nUpdating token ${name} (${address}) config via Timelock:`)
  console.log(`  Weight: ${tokenWeight}, MinProfitBps: ${minProfitBps}`)
  console.log(`  MaxUsdgAmount: ${maxUsdgAmount}, BufferAmount: ${bufferAmount}`)
  console.log(`  Current UsdgAmount from vault: ${usdgAmount.toString()} (${usdgAmount.div(expandDecimals(1, 18)).toString()} USDG)`)

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
    `timelock.setTokenConfig(${name})`
  )
}

async function main() {
  // --- Determine Network --- 
  let networkName;
  if (hre && hre.network && hre.network.name) {
    networkName = hre.network.name;
    console.log(`[DEBUG] Detected Hardhat environment. Using network name: ${networkName}`);
  } else {
    console.log("[DEBUG] Not in Hardhat environment or hre.network.name undefined. Parsing args with yargs...");
    const argv = yargs(hideBin(process.argv))
      .option('network', {
        alias: 'n',
        type: 'string',
        description: 'Network name (e.g., sonic, base)',
        default: 'sonic'
      })
      .argv;
    networkName = argv.network.toLowerCase();
    console.log(`[DEBUG] yargs parsed network name: ${networkName}`);
  }
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
  
  // 1. Enable dynamic fees and set swap fee to 0.5%
  console.log("\nSetting fees with dynamic fees enabled...")
  await sendTxn(
    timelock.setFees(
      vault.address,
      12, // taxBasisPoints
      0, // stableTaxBasisPoints
      10, // mintBurnFeeBasisPoints
      16, // swapFeeBasisPoints (0.12%)
      0,  // stableSwapFeeBasisPoints
      50, // marginFeeBasisPoints
      "5000000000000000000", // liquidationFeeUsd
      24 * 60 * 60, // minProfitTime
      true // hasDynamicFees
    ),
    "vault.setFees"
  )

  // 2. Configure tokens
  const tokenConfigs = config.tokens;

  // Get the target token symbol from environment variable
  const targetSymbol = process.env.TARGET_TOKEN;

  if (targetSymbol) {
    // If a target token is specified, update only that one
    console.log(`\nAttempting to update config for specified token: ${targetSymbol}`);

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
    console.log(`\nCompleted configuration update for ${targetConfig.name}`);

  } else {
    // If no target token is specified, update all tokens in the array
    console.log("\nNo specific token provided via TARGET_TOKEN. Updating all tokens defined in the script...");

    // Calculate total weight to verify it's 100%
    const totalWeight = tokenConfigs.reduce((sum, config) => sum + config.tokenWeight, 0);
    console.log(`\nTotal token weight: ${totalWeight} (should be 100000 for 100%)`);
    
    if (totalWeight !== 100000) {
      console.warn(`WARNING: Total token weight is ${totalWeight}, not 100000. Distribution may be incorrect.`);
    }

    for (const config of tokenConfigs) {
      await updateToken(timelock, vault, config);
    }

    console.log("\nCompleted configuration updates for all tokens.");
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })