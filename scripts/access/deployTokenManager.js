const { deployContract, contractAt, writeTmpAddresses, sendTxn } = require("../shared/helpers")

async function main() {
  const tokenManager = await deployContract("TokenManager", [1], "TokenManager")

  const signer = [
    "0x03413564187AD43DB5024b0E6D7E1d24b1d0bE23",
  ]

  await sendTxn(tokenManager.initialize(signer), "tokenManager.initialize")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
