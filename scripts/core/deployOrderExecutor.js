const { deployContract, contractAt , sendTxn } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const { toUsd } = require("../../test/shared/units")
const { errors } = require("../../test/core/Vault/helpers")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];

async function main() {
  const vault = await contractAt("Vault", "0x4d901306c35Df4761c1758071A2B31706a9a45C8")
  const orderBook = await contractAt("OrderBook", "0x1Ef73884Cc0a1591540F46Cfa67aA121357ca29A")
  await deployContract("OrderExecutor", [vault.address, orderBook.address])
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
