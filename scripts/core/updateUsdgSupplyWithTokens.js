const { getFrameSigner, contractAt, sendTxn } = require("../shared/helpers")
const { bigNumberify, expandDecimals } = require("../../test/shared/utilities")
const { formatAmount } = require("../../test/shared/utilities")
const hre = require("hardhat")
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const allTokens = require('./tokens'); // Load all network tokens

// Define network configurations
const networkConfigs = {
  sonic: {
    vaultAddress: "0x5B8caae7cC6Ea61fb96Fd251C4Bc13e48749C7Da",
    timelockAddress: "0xE97055C9087458434bf95dedA69531408cC210b5",
    readerAddress: "0x700d165ef6e5c79b9BD83D2C328391FE61917af6", // Correct from deploy-sonic.json
    tokens: ["anon", "weth", "ws", "sts", "usdc", "scusd", "shadow"]
  },
  phoenix: {
    vaultAddress: "0xa6b88069EDC7a0C2F062226743C8985FF72bB2Eb",
    timelockAddress: "0x585693AedB4c18424ED7cCd13589c048BdE00785",
    readerAddress: "0x524Aa56ED7EAa10e1CF8c088577Cc1a95fa74817",
    tokens: ["usdt", "usdc", "usdtsg", "usdcsg", "ll", "wbnb", "weth", "wbtc"]
  },
  berachain: {
    vaultAddress: "0xc3727b7E7F3FF97A111c92d3eE05529dA7BD2f48",
    timelockAddress: "0xfCE9Fb0Fd92d6A19b1ee1CcaEb9d0480617E726e",
    readerAddress: "0x25Bc3D7d6AF2B1382bF4c6e0Aa6BDCd87cd599bb",
    tokens: ["honey", "usdc", "wbera", "weth"]
  },
  base: {
    vaultAddress: "0xed33E4767B8d68bd7F64c429Ce4989686426a926",
    timelockAddress: "0x69E44517D74709d552A69046585bef02d8c34D5B",
    readerAddress: "0x4F8e6B387eE3cd2189Fa14e5E8B94c5C93B5e5B3",
    tokens: ["usdc", "weth", "cbbtc"]
  },
  arbitrum: {
    vaultAddress: "0x489ee077994B6658eAfA855C308275EAd8097C4A",
    timelockAddress: "", // Will be retrieved from vault.gov()
    readerAddress: "0x2b43c90D1B727cEe1Df34925bcd5Ace52Ec37694",
    tokens: ["btc", "eth", "usdc", "link", "uni", "usdt", "frax", "dai"]
  },
  avax: {
    vaultAddress: "0x9ab2De34A33fB459b538c43f251eB825645e8595",
    timelockAddress: "", // Will be retrieved from vault.gov()
    readerAddress: "0x2eFEE1950ededC65De687b40Fd30a7B5f4544aBd",
    tokens: ["avax", "eth", "btcb", "btc", "usdc", "usdce"]
  }
}

async function main() {
  // --- Determine Network ---
  let networkName;
  let isDryRun = false;
  
  if (hre && hre.network && hre.network.name) {
    networkName = hre.network.name;
    console.log(`[DEBUG] Detected Hardhat environment. Using network name: ${networkName}`);
    // Check for dry-run in environment variable when using Hardhat
    isDryRun = process.env.DRY_RUN === 'true';
  } else {
    console.log("[DEBUG] Not in Hardhat environment. Parsing args with yargs...");
    const argv = yargs(hideBin(process.argv))
      .option('network', {
        alias: 'n',
        type: 'string',
        description: 'Network name (e.g., sonic, base, arbitrum)',
        default: 'sonic'
      })
      .option('dry-run', {
        alias: 'd',
        type: 'boolean',
        description: 'Run without sending transactions',
        default: false
      })
      .argv;
    networkName = argv.network.toLowerCase();
    isDryRun = argv['dry-run'];
    console.log(`[DEBUG] yargs parsed network name: ${networkName}`);
  }
  
  networkName = networkName.toLowerCase();

  // --- Validate Network ---
  if (!networkConfigs[networkName]) {
    console.error(`Error: Invalid or unsupported network specified: ${networkName}. Available networks: ${Object.keys(networkConfigs).join(', ')}`);
    process.exit(1);
  }

  const config = networkConfigs[networkName];
  const tokens = allTokens[networkName];
  
  console.log(`Starting USDG supply update with token configs for ${networkName.toUpperCase()} network...`);
  console.log(`Using Vault address: ${config.vaultAddress}`);
  console.log(`Using Reader address: ${config.readerAddress}`);

  // Connect to Frame
  const signer = await getFrameSigner()
  const signerAddress = await signer.getAddress()
  console.log("Using signer address:", signerAddress)

  // Get contracts
  const vault = await contractAt("Vault", config.vaultAddress, signer)
  const reader = await contractAt("Reader", config.readerAddress, signer)
  
  // Get timelock address
  let timelockAddress = config.timelockAddress
  if (!timelockAddress) {
    timelockAddress = await vault.gov()
    console.log("Retrieved timelock address from vault.gov():", timelockAddress)
  }
  const timelock = await contractAt("Timelock", timelockAddress, signer)

  // Verify timelock access
  const isHandler = await timelock.isHandler(signerAddress)
  console.log("Is signer a handler?", isHandler)
  
  const isKeeper = await timelock.isKeeper(signerAddress)
  console.log("Is signer a keeper?", isKeeper)
  
  const admin = await timelock.admin()
  console.log("Timelock admin:", admin)
  
  if (!isHandler && !isKeeper && admin.toLowerCase() !== signerAddress.toLowerCase()) {
    throw new Error("Signer is not authorized to call timelock functions")
  }

  // Get the target token symbol from environment variable
  const targetSymbol = process.env.TARGET_TOKEN;

  // Build token array from config
  let tokenArr;
  if (targetSymbol) {
    // If a target token is specified, only process that one
    console.log(`\nProcessing only specified token: ${targetSymbol}`);
    
    const tokenKey = config.tokens.find(key => 
      tokens[key] && tokens[key].name.toUpperCase() === targetSymbol.toUpperCase()
    );
    
    if (!tokenKey) {
      console.error(`Error: Token "${targetSymbol}" not found in ${networkName} configuration`);
      console.error(`Available tokens: ${config.tokens.map(k => tokens[k]?.name || k).join(', ')}`);
      process.exit(1);
    }
    
    tokenArr = [tokens[tokenKey]];
  } else {
    // Process all tokens
    tokenArr = config.tokens.map(tokenKey => {
      const token = tokens[tokenKey]
      if (!token) {
        throw new Error(`Token ${tokenKey} not found in tokens configuration for ${networkName}`)
      }
      return token
    })
    console.log(`\nProcessing ${tokenArr.length} tokens...`);
  }

  // Get vault token info
  const nativeToken = tokenArr.find(t => t.isNative) || tokenArr[0]
  const vaultTokenInfo = await reader.getVaultTokenInfoV2(
    vault.address, 
    nativeToken.address, 
    1, 
    tokenArr.map(t => t.address)
  )

  const vaultPropsLength = 14;
  const shouldSendTxn = !isDryRun
  
  let totalUsdgAmount = bigNumberify(0)
  const tokenUpdates = []

  // Calculate USDG amounts for each token
  for (const [i, tokenItem] of tokenArr.entries()) {
    const token = {}
    token.poolAmount = vaultTokenInfo[i * vaultPropsLength]
    token.reservedAmount = vaultTokenInfo[i * vaultPropsLength + 1]
    token.availableAmount = token.poolAmount.sub(token.reservedAmount)
    token.usdgAmount = vaultTokenInfo[i * vaultPropsLength + 2]
    token.redemptionAmount = vaultTokenInfo[i * vaultPropsLength + 3]
    token.weight = vaultTokenInfo[i * vaultPropsLength + 4]
    token.bufferAmount = vaultTokenInfo[i * vaultPropsLength + 5]
    token.maxUsdgAmount = vaultTokenInfo[i * vaultPropsLength + 6]
    token.globalShortSize = vaultTokenInfo[i * vaultPropsLength + 7]
    token.maxGlobalShortSize = vaultTokenInfo[i * vaultPropsLength + 8]
    token.minPrice = vaultTokenInfo[i * vaultPropsLength + 9]
    token.maxPrice = vaultTokenInfo[i * vaultPropsLength + 10]
    token.guaranteedUsd = vaultTokenInfo[i * vaultPropsLength + 11]

    // Calculate available USD
    token.availableUsd = tokenItem.isStable
      ? token.poolAmount
          .mul(token.minPrice)
          .div(expandDecimals(1, tokenItem.decimals))
      : token.availableAmount
          .mul(token.minPrice)
          .div(expandDecimals(1, tokenItem.decimals));

    // Calculate managed USD and USDG amount
    token.managedUsd = token.availableUsd.add(token.guaranteedUsd);
    let usdgAmount = token.managedUsd.div(expandDecimals(1, 30 - 18))
    
    // Store original for total calculation
    const originalUsdgAmount = usdgAmount
    totalUsdgAmount = totalUsdgAmount.add(originalUsdgAmount)

    // Apply max USDG cap if needed
    // maxUsdgAmount in tokens.js is already in the format expected by the contract
    const adjustedMaxUsdgAmount = tokenItem.maxUsdgAmount
    const adjustedMaxUsdgAmountExpanded = expandDecimals(tokenItem.maxUsdgAmount, 18)
    if (usdgAmount.gt(adjustedMaxUsdgAmountExpanded) && adjustedMaxUsdgAmount > 0) {
      console.warn(`⚠️  USDG amount for ${tokenItem.name.toUpperCase()} capped from ${formatAmount(usdgAmount, 18, 2, true)} to ${formatAmount(adjustedMaxUsdgAmountExpanded, 18, 2, true)}`)
      usdgAmount = adjustedMaxUsdgAmountExpanded
    }

    // Check for configuration changes
    const adjustedBufferAmount = expandDecimals(tokenItem.bufferAmount, tokenItem.decimals)
    
    console.log(`\n${tokenItem.name.toUpperCase()} (${tokenItem.address}):`)
    console.log(`  Current USDG: ${formatAmount(token.usdgAmount, 18, 2, true)}`)
    console.log(`  New USDG: ${formatAmount(usdgAmount, 18, 2, true)} (${usdgAmount.gt(token.usdgAmount) ? '+' : ''}${formatAmount(usdgAmount.sub(token.usdgAmount), 18, 2, true)})`)
    console.log(`  Managed USD: ${formatAmount(token.managedUsd, 30, 2, true)}`)
    console.log(`  Pool Amount: ${formatAmount(token.poolAmount, tokenItem.decimals, 2, true)}`)
    console.log(`  Available Amount: ${formatAmount(token.availableAmount, tokenItem.decimals, 2, true)}`)
    console.log(`  Guaranteed USD: ${formatAmount(token.guaranteedUsd, 30, 2, true)}`)

    // Store update info
    tokenUpdates.push({
      tokenItem,
      usdgAmount,
      adjustedMaxUsdgAmount,
      adjustedMaxUsdgAmountExpanded,
      adjustedBufferAmount,
      currentUsdgAmount: token.usdgAmount
    })
  }

  console.log(`\n========================================`)
  console.log(`Total USDG Amount: ${formatAmount(totalUsdgAmount, 18, 2, true)}`)
  console.log(`========================================\n`)

  if (shouldSendTxn) {
    console.log("Sending transactions...")
    
    // Update individual token configs
    for (const [index, update] of tokenUpdates.entries()) {
      const { tokenItem, adjustedMaxUsdgAmount, adjustedMaxUsdgAmountExpanded, adjustedBufferAmount } = update
      
      // Re-fetch current state for this specific token before updating
      console.log(`\nRefreshing data for ${tokenItem.name.toUpperCase()} before update...`)
      
      const currentTokenInfo = await reader.getVaultTokenInfoV2(
        vault.address,
        nativeToken.address,
        1,
        [tokenItem.address]
      )
      
      // Recalculate USDG amount with fresh data
      const token = {}
      token.poolAmount = currentTokenInfo[0]
      token.reservedAmount = currentTokenInfo[1]
      token.availableAmount = token.poolAmount.sub(token.reservedAmount)
      token.usdgAmount = currentTokenInfo[2]
      token.guaranteedUsd = currentTokenInfo[11]
      token.minPrice = currentTokenInfo[9]
      
      // Recalculate available USD
      token.availableUsd = tokenItem.isStable
        ? token.poolAmount
            .mul(token.minPrice)
            .div(expandDecimals(1, tokenItem.decimals))
        : token.availableAmount
            .mul(token.minPrice)
            .div(expandDecimals(1, tokenItem.decimals));
      
      // Recalculate managed USD and USDG amount
      token.managedUsd = token.availableUsd.add(token.guaranteedUsd);
      let freshUsdgAmount = token.managedUsd.div(expandDecimals(1, 30 - 18))
      
      // Apply max USDG cap if needed
      if (freshUsdgAmount.gt(adjustedMaxUsdgAmountExpanded) && adjustedMaxUsdgAmount > 0) {
        console.log(`  USDG amount capped from ${formatAmount(freshUsdgAmount, 18, 2, true)} to ${formatAmount(adjustedMaxUsdgAmountExpanded, 18, 2, true)}`)
        freshUsdgAmount = adjustedMaxUsdgAmountExpanded
      }
      
      console.log(`  Current USDG: ${formatAmount(token.usdgAmount, 18, 2, true)}`)
      console.log(`  Fresh calculated USDG: ${formatAmount(freshUsdgAmount, 18, 2, true)}`)
      
      await sendTxn(
        timelock.setTokenConfig(
          vault.address,
          tokenItem.address,
          tokenItem.tokenWeight,
          tokenItem.minProfitBps,
          adjustedMaxUsdgAmount,
          adjustedBufferAmount,
          freshUsdgAmount
        ),
        `timelock.setTokenConfig(${tokenItem.name})`
      )
    }
    
    // Check if signer has permission to update USDG supply
    const canUpdateUsdgSupply = isHandler || isKeeper || admin.toLowerCase() === signerAddress.toLowerCase()
    
    if (!canUpdateUsdgSupply) {
      console.log("\n⚠️  Warning: Signer does not have permission to update total USDG supply")
      console.log("   updateUsdgSupply requires keeper, handler, or admin role")
      console.log("   Skipping total USDG supply update...")
    } else {
      // Try to update total USDG supply with fresh data
      if (targetSymbol) {
        console.log("\n⚠️  Note: Only updating config for", targetSymbol.toUpperCase());
        console.log("   Total USDG supply update will still calculate across ALL tokens");
      }
      console.log("\nRefreshing all token data for total USDG supply calculation...")
      
      // Re-fetch all token data for accurate total
      // Need to get ALL tokens for total calculation, not just target token
      const allTokenArr = targetSymbol ? config.tokens.map(tokenKey => tokens[tokenKey]) : tokenArr;
      
      const freshVaultTokenInfo = await reader.getVaultTokenInfoV2(
        vault.address,
        nativeToken.address,
        1,
        allTokenArr.map(t => t.address)
      )
      
      let freshTotalUsdgAmount = bigNumberify(0)
      
      for (const [i, tokenItem] of allTokenArr.entries()) {
        const poolAmount = freshVaultTokenInfo[i * vaultPropsLength]
        const reservedAmount = freshVaultTokenInfo[i * vaultPropsLength + 1]
        const availableAmount = poolAmount.sub(reservedAmount)
        const guaranteedUsd = freshVaultTokenInfo[i * vaultPropsLength + 11]
        const minPrice = freshVaultTokenInfo[i * vaultPropsLength + 9]
        
        const availableUsd = tokenItem.isStable
          ? poolAmount.mul(minPrice).div(expandDecimals(1, tokenItem.decimals))
          : availableAmount.mul(minPrice).div(expandDecimals(1, tokenItem.decimals));
        
        const managedUsd = availableUsd.add(guaranteedUsd);
        const usdgAmount = managedUsd.div(expandDecimals(1, 30 - 18))
        
        freshTotalUsdgAmount = freshTotalUsdgAmount.add(usdgAmount)
      }
      
      console.log(`Fresh Total USDG Amount: ${formatAmount(freshTotalUsdgAmount, 18, 2, true)}`)
      
      try {
        await sendTxn(
          timelock.updateUsdgSupply(freshTotalUsdgAmount),
          "timelock.updateUsdgSupply"
        )
        console.log("✅ Total USDG supply updated successfully!")
      } catch (error) {
        console.warn("\n⚠️  Warning: Could not update total USDG supply")
        console.warn("Error:", error.reason || error.message)
        console.warn("\nThe error suggests there might be additional permission checks in the USDG token contract.")
        console.warn("You may need to run the updateUsdgSupply separately with an account that has the required permissions.")
      }
    }
    
    console.log("\n✅ Token configurations updated successfully!")
  } else {
    console.log("\n🔍 DRY RUN - No transactions were sent")
    console.log("To execute transactions, run with: DRY_RUN=false npx hardhat run scripts/core/updateUsdgSupplyWithTokens.js --network " + networkName)
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })