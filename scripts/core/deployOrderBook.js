const { deployContract, contractAt , sendTxn, writeTmpAddresses } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];

async function main() {
  const { nativeToken } = tokens

  const orderBook = await deployContract("OrderBook", []);
  // const orderBook = await contractAt("OrderBook", "0xb3E8745f0A0FCa7dCBF74fd05F8bf0363008D686");

  // Arbitrum mainnet addresses
  await sendTxn(orderBook.initialize(
    "0xdB5042a485Be8CcEad0d358540D23F5A0dE39135", // router
    "0x1Abe14c82a70550cD9fFB5FeB17cfe497d04F0Ff", // vault
    nativeToken.address, // weth
    "0xA092D1d58a672AC4C8CE4Bd14efA79a1Bab8AD54", // usdg
    "10000000000000000", // 0.01 AVAX
    expandDecimals(10, 30) // min purchase token amount usd
  ), "orderBook.initialize");

  writeTmpAddresses({
    orderBook: orderBook.address
  })
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
