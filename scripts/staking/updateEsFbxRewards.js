const { deployContract, contractAt, sendTxn, signers, updateTokensPerInterval } = require("../shared/helpers")
const { expandDecimals, bigNumberify } = require("../../test/shared/utilities")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');

const shouldSendTxn = true

const monthlyEsAmpForAlpOnArb = expandDecimals(toInt("0"), 18)
const monthlyEsAmpForAlpOnAvax = expandDecimals(toInt("0"), 18)

async function getStakedAmounts() {
  const arbStakedAmpTracker = await contractAt("RewardTracker", "0x908C4D94D34924765f1eDc22A1DD098397c59dD4", signers.arbitrum)
  const arbStakedAmpAndEsAmp =await arbStakedAmpTracker.totalSupply()

  const avaxStakedAmpTracker = await contractAt("RewardTracker", "0x908C4D94D34924765f1eDc22A1DD098397c59dD4", signers.avax)
  const avaxStakedAmpAndEsAmp =await avaxStakedAmpTracker.totalSupply()

  return {
    arbStakedAmpAndEsAmp,
    avaxStakedAmpAndEsAmp
  }
}

async function getArbValues() {
  const ampRewardTracker = await contractAt("RewardTracker", "0x908C4D94D34924765f1eDc22A1DD098397c59dD4")
  const alpRewardTracker = await contractAt("RewardTracker", "0x1aDDD80E6039594eE970E5872D247bf0414C8903")
  const tokenDecimals = 18
  const monthlyEsAmpForAlp = monthlyEsAmpForAlpOnArb

  return { tokenDecimals, ampRewardTracker, alpRewardTracker, monthlyEsAmpForAlp }
}

async function getAvaxValues() {
  const ampRewardTracker = await contractAt("RewardTracker", "0x2bD10f8E93B3669b6d42E74eEedC65dd1B0a1342")
  const alpRewardTracker = await contractAt("RewardTracker", "0x9e295B5B976a184B14aD8cd72413aD846C299660")
  const tokenDecimals = 18
  const monthlyEsAmpForAlp = monthlyEsAmpForAlpOnAvax

  return { tokenDecimals, ampRewardTracker, alpRewardTracker, monthlyEsAmpForAlp }
}

function getValues() {
  if (network === "arbitrum") {
    return getArbValues()
  }

  if (network === "avax") {
    return getAvaxValues()
  }
}

function toInt(value) {
  return parseInt(value.replaceAll(",", ""))
}

async function main() {
  const { arbStakedAmpAndEsAmp, avaxStakedAmpAndEsAmp } = await getStakedAmounts()
  const { tokenDecimals, ampRewardTracker, alpRewardTracker, monthlyEsAmpForAlp } = await getValues()

  const stakedAmounts = {
    arbitrum: {
      total: arbStakedAmpAndEsAmp
    },
    avax: {
      total: avaxStakedAmpAndEsAmp
    }
  }

  let totalStaked = bigNumberify(0)

  for (const net in stakedAmounts) {
    totalStaked = totalStaked.add(stakedAmounts[net].total)
  }

  const totalEsAmpRewards = expandDecimals(50000, tokenDecimals)
  const secondsPerMonth = 28 * 24 * 60 * 60

  const ampRewardDistributor = await contractAt("RewardDistributor", await ampRewardTracker.distributor())

  const ampCurrentTokensPerInterval = await ampRewardDistributor.tokensPerInterval()
  const ampNextTokensPerInterval = totalEsAmpRewards.mul(stakedAmounts[network].total).div(totalStaked).div(secondsPerMonth)
  const ampDelta = ampNextTokensPerInterval.sub(ampCurrentTokensPerInterval).mul(10000).div(ampCurrentTokensPerInterval)

  console.log("ampCurrentTokensPerInterval", ampCurrentTokensPerInterval.toString())
  console.log("ampNextTokensPerInterval", ampNextTokensPerInterval.toString(), `${ampDelta.toNumber() / 100.00}%`)

  const alpRewardDistributor = await contractAt("RewardDistributor", await alpRewardTracker.distributor())

  const alpCurrentTokensPerInterval = await alpRewardDistributor.tokensPerInterval()
  const alpNextTokensPerInterval = monthlyEsAmpForAlp.div(secondsPerMonth)

  console.log("alpCurrentTokensPerInterval", alpCurrentTokensPerInterval.toString())
  console.log("alpNextTokensPerInterval", alpNextTokensPerInterval.toString())

  if (shouldSendTxn) {
    await updateTokensPerInterval(ampRewardDistributor, ampNextTokensPerInterval, "ampRewardDistributor")
    await updateTokensPerInterval(alpRewardDistributor, alpNextTokensPerInterval, "alpRewardDistributor")
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
