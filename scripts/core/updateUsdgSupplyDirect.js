const { getFrameSigner, contractAt, sendTxn } = require("../shared/helpers")
const { bigNumberify, expandDecimals } = require("../../test/shared/utilities")
const { formatAmount } = require("../../test/shared/utilities")

const allTokens = require('./tokens')

// Network configurations
const networkConfigs = {
  sonic: {
    vaultAddress: "0x5B8caae7cC6Ea61fb96Fd251C4Bc13e48749C7Da",
    glpManagerAddress: "0x4DE729B85dDB172F1bb775882f355bA25764E430",
    usdgAddress: "0x8846d38481f8e3F9a7dDCBE1DFf0981dB2bC04A3",
    readerAddress: "0x700d165ef6e5c79b9BD83D2C328391FE61917af6",
    tokens: ["anon", "weth", "ws", "sts", "usdc", "scusd", "shadow"]
  }
  // Add other networks as needed
}

async function main() {
  const network = (process.env.HARDHAT_NETWORK || 'mainnet')
  const config = networkConfigs[network.toLowerCase()]
  
  if (!config) {
    throw new Error(`Network ${network} not configured`)
  }
  
  console.log(`Updating USDG supply directly on ${network} network...`)
  
  // Connect to Frame signer
  const signer = await getFrameSigner()
  const signerAddress = await signer.getAddress()
  console.log("Using signer address:", signerAddress)
  
  // Get contracts
  const usdg = await contractAt("USDG", config.usdgAddress, signer)
  const glpManager = await contractAt("GlpManager", config.glpManagerAddress, signer)
  const vault = await contractAt("Vault", config.vaultAddress, signer)
  const reader = await contractAt("Reader", config.readerAddress, signer)
  
  // Verify we're the gov
  const currentGov = await usdg.gov()
  console.log("Current USDG gov:", currentGov)
  
  if (currentGov.toLowerCase() !== signerAddress.toLowerCase()) {
    throw new Error(`Signer ${signerAddress} is not the gov. Current gov is ${currentGov}`)
  }
  
  // Get current USDG balance of GlpManager
  const currentBalance = await usdg.balanceOf(glpManager.address)
  console.log("Current GlpManager USDG balance:", formatAmount(currentBalance, 18, 2, true))
  
  // Calculate what the total USDG should be based on vault state
  const tokens = allTokens[network.toLowerCase()]
  const tokenArr = config.tokens.map(tokenKey => {
    const token = tokens[tokenKey]
    if (!token) {
      throw new Error(`Token ${tokenKey} not found in tokens configuration`)
    }
    return token
  })
  
  console.log(`\nCalculating total USDG based on ${tokenArr.length} tokens...`)
  
  // Get vault token info
  const nativeToken = tokenArr.find(t => t.isNative) || tokenArr[0]
  const vaultTokenInfo = await reader.getVaultTokenInfoV2(
    vault.address,
    nativeToken.address,
    1,
    tokenArr.map(t => t.address)
  )
  
  const vaultPropsLength = 14
  let totalUsdgAmount = bigNumberify(0)
  
  // Calculate total USDG needed
  for (const [i, tokenItem] of tokenArr.entries()) {
    const poolAmount = vaultTokenInfo[i * vaultPropsLength]
    const reservedAmount = vaultTokenInfo[i * vaultPropsLength + 1]
    const availableAmount = poolAmount.sub(reservedAmount)
    const guaranteedUsd = vaultTokenInfo[i * vaultPropsLength + 11]
    const minPrice = vaultTokenInfo[i * vaultPropsLength + 9]
    
    const availableUsd = tokenItem.isStable
      ? poolAmount.mul(minPrice).div(expandDecimals(1, tokenItem.decimals))
      : availableAmount.mul(minPrice).div(expandDecimals(1, tokenItem.decimals))
    
    const managedUsd = availableUsd.add(guaranteedUsd)
    const usdgAmount = managedUsd.div(expandDecimals(1, 30 - 18))
    
    totalUsdgAmount = totalUsdgAmount.add(usdgAmount)
    
    console.log(`  ${tokenItem.name.toUpperCase()}: ${formatAmount(usdgAmount, 18, 2, true)} USDG`)
  }
  
  console.log(`\nTotal USDG needed: ${formatAmount(totalUsdgAmount, 18, 2, true)}`)
  console.log(`Current balance: ${formatAmount(currentBalance, 18, 2, true)}`)
  
  const diff = totalUsdgAmount.sub(currentBalance)
  const needsUpdate = !diff.eq(0)
  
  if (!needsUpdate) {
    console.log("\n✅ USDG supply is already correct, no update needed")
    return
  }
  
  // Check if we're a vault (required to mint/burn)
  const isVault = await usdg.isVault(signerAddress)
  console.log("\nIs signer a vault?", isVault)
  
  // Temporarily add ourselves as vault if needed
  if (!isVault) {
    console.log("Adding signer as temporary vault...")
    await sendTxn(
      usdg.addVault(signerAddress),
      "usdg.addVault(signer)"
    )
  }
  
  try {
    if (diff.gt(0)) {
      console.log(`\nMinting ${formatAmount(diff, 18, 2, true)} USDG to GlpManager...`)
      await sendTxn(
        usdg.mint(glpManager.address, diff),
        "usdg.mint"
      )
    } else {
      console.log(`\nBurning ${formatAmount(diff.abs(), 18, 2, true)} USDG from GlpManager...`)
      await sendTxn(
        usdg.burn(glpManager.address, diff.abs()),
        "usdg.burn"
      )
    }
    
    // Verify final balance
    const finalBalance = await usdg.balanceOf(glpManager.address)
    console.log("\nFinal GlpManager USDG balance:", formatAmount(finalBalance, 18, 2, true))
    console.log("Target balance:", formatAmount(totalUsdgAmount, 18, 2, true))
    
    if (finalBalance.eq(totalUsdgAmount)) {
      console.log("\n✅ USDG supply updated successfully!")
    } else {
      console.log("\n⚠️  Warning: Final balance doesn't match target")
    }
  } finally {
    // Remove ourselves as vault if we added it
    if (!isVault) {
      console.log("\nRemoving signer as vault...")
      await sendTxn(
        usdg.removeVault(signerAddress),
        "usdg.removeVault(signer)"
      )
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })