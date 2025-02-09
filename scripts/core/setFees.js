const { getFrameSigner, deployContract, contractAt , sendTxn, writeTmpAddresses, callWithRetries } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const { toUsd } = require("../../test/shared/units")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];

async function main() {
  const signer = await getFrameSigner()
  
  // Core contract addresses from deployment
  const vault = await contractAt("Vault", "0x11944027D4eDC1C17db2D5E9020530dcEcEfb85b")
  const timelock = await contractAt("Timelock", "0x1Cd160Cfd7D6a9F2831c0FF1982C11d386872094")
  
  const taxBasisPoints = 50 // 0.5%
  const stableTaxBasisPoints = 20 // 0.2%
  const mintBurnFeeBasisPoints = 30 // 0.3%
  const swapFeeBasisPoints = 50 // 0.5%
  const stableSwapFeeBasisPoints = 4 // 0.04%
  const marginFeeBasisPoints = 10 // 0.1%
  
  // Get current values to maintain
  const liquidationFeeUsd = await vault.liquidationFeeUsd()
  const minProfitTime = await vault.minProfitTime()
  
  // Enable dynamic fees and set new base fees
  await sendTxn(
    timelock.setFees(
      vault.address,
      taxBasisPoints, // _taxBasisPoints
      stableTaxBasisPoints, // _stableTaxBasisPoints
      mintBurnFeeBasisPoints, // _mintBurnFeeBasisPoints
      swapFeeBasisPoints, // _swapFeeBasisPoints
      stableSwapFeeBasisPoints, // _stableSwapFeeBasisPoints
      marginFeeBasisPoints, // _marginFeeBasisPoints
      liquidationFeeUsd, // _liquidationFeeUsd
      minProfitTime, // _minProfitTime
      true // _hasDynamicFees
    ),
    "timelock.setFees"
  )
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
