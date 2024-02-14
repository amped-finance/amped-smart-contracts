const { getFrameSigner, deployContract, contractAt, sendTxn, updateTokensPerInterval, signers } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities");

const network = (process.env.HARDHAT_NETWORK || 'mainnet');

async function getArbValues(signer) {
  const rewardToken = await contractAt("Token", "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", signer)
  const tokenDecimals = 18

  const rewardTrackerArr = [
    {
      name: "feeAmpTracker",
      address: "0xd2D1162512F927a7e282Ef43a362659E4F2a728F",
      transferAmount: "689"
    },
    {
      name: "feeAlpTracker",
      address: "0x4e971a87900b931fF39d1Aad67697F49835400b6",
      transferAmount: "1519"
    }
  ]

  return { rewardToken, tokenDecimals, rewardTrackerArr }
}

async function getPegasusValues(signer) {
  const rewardToken = await contractAt("Token", "0xF42991f02C07AB66cFEa282E7E482382aEB85461", signer)
  const tokenDecimals = 18

  const rewardTrackerArr = [
    {
      name: "feeAmpTracker",
      address: "0xE90eb1FE40c0134251d5bd9358fF92a25650618d",
      transferAmount: "0.1"
    },
    {
      name: "feeAlpTracker",
      address: "0xFde2DE66Aa6cb6f7A4565Fab3449236738D28213",
      transferAmount: "0"
    }
  ]

  return { rewardToken, tokenDecimals, rewardTrackerArr }
}

function getValues(signer) {
  if (network === "arbitrum") {
    return getArbValues(signer)
  }

  if (network === "pegasus") {
    return getPegasusValues(signer)
  }
}

async function main() {
  // const signer = await getFrameSigner()
  const signer = signers["pegasus"]
  const { rewardToken, tokenDecimals, rewardTrackerArr } = await getValues(signer)

  for (let i = 0; i < rewardTrackerArr.length; i++) {
    const rewardTrackerItem = rewardTrackerArr[i]
    const { transferAmount } = rewardTrackerItem
    const rewardTracker = await contractAt("RewardTracker", rewardTrackerItem.address)
    const rewardDistributorAddress = await rewardTracker.distributor()
    const rewardDistributor = await contractAt("RewardDistributor", rewardDistributorAddress)
    const convertedTransferAmount = ethers.utils.parseUnits(transferAmount, tokenDecimals)
    const rewardsPerInterval = convertedTransferAmount.div(7 * 24 * 60 * 60)
    console.log("rewardDistributorAddress", rewardDistributorAddress)
    console.log("convertedTransferAmount", convertedTransferAmount.toString())
    console.log("rewardsPerInterval", rewardsPerInterval.toString())

    await sendTxn(rewardToken.transfer(rewardDistributorAddress, convertedTransferAmount, { gasLimit: 500000 }), `rewardToken.transfer ${i}`)
    await updateTokensPerInterval(rewardDistributor, rewardsPerInterval, "rewardDistributor")
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
