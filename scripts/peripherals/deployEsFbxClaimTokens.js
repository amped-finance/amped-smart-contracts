const { deployContract, contractAt, writeTmpAddresses } = require("../shared/helpers")

async function main() {
  await deployContract("MintableBaseToken", ["VestingOption", "ARB:AMP", 0])
  await deployContract("MintableBaseToken", ["VestingOption", "ARB:ALP", 0])
  await deployContract("MintableBaseToken", ["VestingOption", "AVAX:AMP", 0])
  await deployContract("MintableBaseToken", ["VestingOption", "AVAX:ALP", 0])
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
