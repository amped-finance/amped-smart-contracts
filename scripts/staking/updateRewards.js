const { getFrameSigner, contractAt, sendTxn, updateTokensPerInterval } = require("../shared/helpers")

const network = process.argv[2] || process.env.HARDHAT_NETWORK || 'mainnet';

async function getPegasusValues(signer) {
  const rewardToken = await contractAt("Token", "0xF42991f02C07AB66cFEa282E7E482382aEB85461", signer)
  const tokenDecimals = 18

  const rewardTrackerArr = [
    {
      name: "feeGmxTracker",
      address: "0x2a8523678a709360bE70E1e3C26Ebc227FA2866F",
      transferAmount: "0"
    },
    {
      name: "feeGlpTracker",
      address: "0x02b50Ded7CB3a83b6cb7d2Ea2a6B2bb2ea5d982e",
      transferAmount: "0"
    }
  ]

  return { rewardToken, tokenDecimals, rewardTrackerArr }
}

async function getPhoenixValues(signer) {
  const rewardToken = await contractAt("Token", "0x7EbeF2A4b1B09381Ec5B9dF8C5c6f2dBECA59c73", signer)
  const tokenDecimals = 18

  const rewardTrackerArr = [
    {
      name: "feeGmxTracker",
      address: "0xB87bc8A763A7856C5806bB0920C00c97Ca5c00d3",
      transferAmount: "0"
    },
    {
      name: "feeGlpTracker",
      address: "0xEE5BD4c29f4cAC23554cc3965D7aE0E22FE84BD7",
      transferAmount: "0.288"
    }
  ]

  return { rewardToken, tokenDecimals, rewardTrackerArr }
}

async function getBscValues(signer) {
  const rewardToken = await contractAt("Token", "0x2F29Bc0FFAF9bff337b31CBe6CB5Fb3bf12e5840", signer)
  const tokenDecimals = 18

  const rewardTrackerArr = [
    {
      name: "feeGmxTracker",
      address: "0x4d268Bf616c768F87333c15F377B8691F8e69007",
      transferAmount: "0"
    },
    {
      name: "feeGlpTracker",
      address: "0x5C04fa0B08c2BB5A69c91C6EF6E7ADD95E134c11",
      transferAmount: "0"
    }
  ]

  return { rewardToken, tokenDecimals, rewardTrackerArr }
}

async function getSonicValues(signer) {
  const rewardToken = await contractAt("Token", "0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38", signer)
  const tokenDecimals = 18

  const rewardTrackerArr = [
    {
      name: "feeGmxTracker",
      address: "0x9A4878DfAAFf4df8C640eCDCF661Bd6aF5aAFb08",
      transferAmount: "0"
    },
    {
      name: "feeGlpTracker",
      address: "0x21efb5680d6127d6c39ae0d62d80cb9fc8935887",
      transferAmount: "4617"
    }
  ]

  return { rewardToken, tokenDecimals, rewardTrackerArr }
}

function getValues(signer) {
  if (network === "pegasus") {
    return getPegasusValues(signer)
  }

  if (network === "phoenix") {
    return getPhoenixValues(signer)
  }

  if (network === "bsc") {
    return getBscValues(signer)
  }

  if (network === "sonic") {
    return getSonicValues(signer)
  }

  throw new Error("Unsupported network")
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
