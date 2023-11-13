const { deployContract, contractAt, writeTmpAddresses } = require("../shared/helpers")

async function main() {
  await deployContract("EsAMP", [])
  // await deployContract("ALP", [])
  // await deployContract("MintableBaseToken", ["esAMP IOU", "esAMP:IOU", 0])
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
