const { getFrameSigner, deployContract, contractAt, sendTxn } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const { toUsd } = require("../../test/shared/units")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];

async function updateToken(timelock, vault, tokenConfig) {
  const {
    address,
    tokenWeight,
    minProfitBps,
    maxUsdgAmount,
    bufferAmount,
    usdgAmount
  } = tokenConfig

  console.log(`\nUpdating token ${tokenConfig.name} config...`)
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
    `vault.setTokenConfig(${tokenConfig.name})`
  )
}

async function main() {
  const signer = await getFrameSigner()
  
  // Core contract addresses from deployment
  const vault = await contractAt("Vault", "0x11944027D4eDC1C17db2D5E9020530dcEcEfb85b")
  const timelock = await contractAt("Timelock", "0x1Cd160Cfd7D6a9F2831c0FF1982C11d386872094")
  
  // 1. Enable dynamic fees and set swap fee to 0.5%
  console.log("Setting fees with dynamic fees enabled...")
  await sendTxn(
    timelock.setFees(
      vault.address,
      5, // taxBasisPoints
      0, // stableTaxBasisPoints
      8, // mintBurnFeeBasisPoints
      50, // swapFeeBasisPoints (0.5%)
      0,  // stableSwapFeeBasisPoints
      10, // marginFeeBasisPoints
      "5000000000000000000", // liquidationFeeUsd
      24 * 60 * 60, // minProfitTime
      true // hasDynamicFees
    ),
    "vault.setFees"
  )

  // 2. Configure tokens
  const tokenConfigs = [
    {
      name: "ANON",
      address: "0x79bbf4508b1391af3a0f4b30bb5fc4aa9ab0e07c",
      tokenWeight: 5000, // reduced from 10000
      minProfitBps: 20,
      maxUsdgAmount: 25000, // 5000 USD
      bufferAmount: 500,
      usdgAmount: 0
    },
    {
      name: "WETH",
      address: "0x50c42deacd8fc9773493ed674b675be577f2634b",
      tokenWeight: 8000,
      minProfitBps: 20,
      maxUsdgAmount: 100000, // 50,000 USD
      bufferAmount: 1000,
      usdgAmount: 0
    },
    {
      name: "WS",
      address: "0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38",
      tokenWeight: 12000,
      minProfitBps: 20,
      maxUsdgAmount: 100000, // 100,000 USD
      bufferAmount: 1000,
      usdgAmount: 0
    },
    {
      name: "STS",
      address: "0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38",
      tokenWeight: 12000,
      minProfitBps: 20,
      maxUsdgAmount: 100000, // 100,000 USD
      bufferAmount: 1000,
      usdgAmount: 0
    }
  ]

  // Update each token's configuration
  for (const config of tokenConfigs) {
    await updateToken(timelock, vault, config)
  }
  
  console.log("Completed configuration updates")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  }) 