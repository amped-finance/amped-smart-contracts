const { getFrameSigner, deployContract, contractAt, sendTxn } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")

async function checkTokenFees(vault, reader, tokenAddress, tokenName) {
  console.log(`\nDynamic Fees for ${tokenName}:`)
  console.log("=".repeat(20 + tokenName.length))
  
  const amounts = [
    expandDecimals(1000, 18), // $1,000
    expandDecimals(10000, 18), // $10,000
    expandDecimals(100000, 18), // $100,000
    expandDecimals(1000000, 18), // $1,000,000
  ]

  for (let amount of amounts) {
    const [feeBps, feeBps0, feeBps1] = await reader.getFeeBasisPoints(
      vault.address,
      tokenAddress,
      "0x29219dd400f2bf60e5a23d13be72b486d4038894", // USDC
      amount
    )
    console.log(`\nTrade Size: $${amount/1e18}`)
    console.log(`Effective Fee Rate: ${feeBps}bp (${feeBps/100}%)`)
    console.log(`Token In Fee: ${feeBps0}bp (${feeBps0/100}%)`)
    console.log(`Token Out Fee: ${feeBps1}bp (${feeBps1/100}%)`)
  }
}

async function main() {
  const signer = await getFrameSigner()
  
  // Core contract addresses
  const vault = await contractAt("Vault", "0x11944027D4eDC1C17db2D5E9020530dcEcEfb85b")
  const reader = await contractAt("Reader", "0x8896265f319815bF43758b552c39CA9bef4f1766")
  
  // Token addresses
  const anon = "0x79bbf4508b1391af3a0f4b30bb5fc4aa9ab0e07c"
  const weth = "0x50c42deacd8fc9773493ed674b675be577f2634b"
  const ws = "0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38"
  
  // Get base fees
  console.log("\nBase Fee Rates:")
  console.log("==============")
  const taxBasisPoints = await vault.taxBasisPoints()
  const stableTaxBasisPoints = await vault.stableTaxBasisPoints()
  const mintBurnFeeBasisPoints = await vault.mintBurnFeeBasisPoints()
  const swapFeeBasisPoints = await vault.swapFeeBasisPoints()
  const stableSwapFeeBasisPoints = await vault.stableSwapFeeBasisPoints()
  const marginFeeBasisPoints = await vault.marginFeeBasisPoints()
  const hasDynamicFees = await vault.hasDynamicFees()
  
  console.log(`Tax Rate: ${taxBasisPoints}bp (${taxBasisPoints/100}%)`)
  console.log(`Stable Tax Rate: ${stableTaxBasisPoints}bp (${stableTaxBasisPoints/100}%)`)
  console.log(`Mint/Burn Fee: ${mintBurnFeeBasisPoints}bp (${mintBurnFeeBasisPoints/100}%)`)
  console.log(`Swap Fee: ${swapFeeBasisPoints}bp (${swapFeeBasisPoints/100}%)`)
  console.log(`Stable Swap Fee: ${stableSwapFeeBasisPoints}bp (${stableSwapFeeBasisPoints/100}%)`)
  console.log(`Margin Fee: ${marginFeeBasisPoints}bp (${marginFeeBasisPoints/100}%)`)
  console.log(`Dynamic Fees Enabled: ${hasDynamicFees}`)

  // Check fees for each token
  await checkTokenFees(vault, reader, anon, "ANON")
  await checkTokenFees(vault, reader, weth, "WETH")
  await checkTokenFees(vault, reader, ws, "WS")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  }) 