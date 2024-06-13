const { getFrameSigner, contractAt, sendTxn, updateTokensPerInterval } = require("../shared/helpers")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');

async function getArbValues(signer) {
  const rewardToken = await contractAt("Token", "0xF42991f02C07AB66cFEa282E7E482382aEB85461", signer)
  const tokenDecimals = 18

  const rewardTrackerArr = [
    {
      name: "feeGmxTracker",
      address: "0x2a8523678a709360bE70E1e3C26Ebc227FA2866F",
      transferAmount: "1207"
    },
    {
      name: "feeGlpTracker",
      address: "0x02b50Ded7CB3a83b6cb7d2Ea2a6B2bb2ea5d982e",
      transferAmount: "2593"
    }
  ]

  return { rewardToken, tokenDecimals, rewardTrackerArr }
}

async function getAvaxValues(signer) {
  const rewardToken = await contractAt("Token", "0x7EbeF2A4b1B09381Ec5B9dF8C5c6f2dBECA59c73", signer)
  const tokenDecimals = 18

  const rewardTrackerArr = [
    {
      name: "feeGmxTracker",
      address: "0xB87bc8A763A7856C5806bB0920C00c97Ca5c00d3",
      transferAmount: "7414"
    },
    {
      name: "feeGlpTracker",
      address: "0xEE5BD4c29f4cAC23554cc3965D7aE0E22FE84BD7",
      transferAmount: "38822"
    }
  ]

  return { rewardToken, tokenDecimals, rewardTrackerArr }
}

function getValues(signer) {
  if (network === "arbitrum") {
    return getArbValues(signer)
  }

  if (network === "avax") {
    return getAvaxValues(signer)
  }
}

async function main() {
  const signer = await getFrameSigner()
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

    await sendTxn(rewardToken.transfer(rewardDistributorAddress, convertedTransferAmount, { gasLimit: 1000000 }), `rewardToken.transfer ${i}`)
    await updateTokensPerInterval(rewardDistributor, rewardsPerInterval, "rewardDistributor")
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
