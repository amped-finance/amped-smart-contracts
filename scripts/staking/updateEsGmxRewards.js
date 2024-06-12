const { contractAt, signers, updateTokensPerInterval } = require("../shared/helpers")
const { expandDecimals, bigNumberify } = require("../../test/shared/utilities")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');

const shouldSendTxn = true

const monthlyEsGmxForGlpOnArb = expandDecimals(toInt("100"), 18)
const monthlyEsGmxForGlpOnAvax = expandDecimals(toInt("100"), 18)

async function getStakedAmounts() {
  const arbStakedGmxTracker = await contractAt("RewardTracker", "0x8210Da5171B10cB934CC8a658840c663aAFF43A4", signers.pegasus)
  const arbStakedGmxAndEsGmx =await arbStakedGmxTracker.totalSupply()

  const avaxStakedGmxTracker = await contractAt("RewardTracker", "0x3c9586567a429BA0467Bc63FD38ea71bB6B912E0", signers.phoenix)
  const avaxStakedGmxAndEsGmx =await avaxStakedGmxTracker.totalSupply()

  return {
    arbStakedGmxAndEsGmx,
    avaxStakedGmxAndEsGmx
  }
}

async function getPegasusValues() {
  const gmxRewardTracker = await contractAt("RewardTracker", "0x8210Da5171B10cB934CC8a658840c663aAFF43A4")
  const glpRewardTracker = await contractAt("RewardTracker", "0x066c39f7Cc4e702c49ecb23E10E83DFE58b0B59b")
  const tokenDecimals = 18
  const monthlyEsGmxForGlp = monthlyEsGmxForGlpOnArb

  return { tokenDecimals, gmxRewardTracker, glpRewardTracker, monthlyEsGmxForGlp }
}

async function getPhoenixValues() {
  const gmxRewardTracker = await contractAt("RewardTracker", "0x2bD10f8E93B3669b6d42E74eEedC65dd1B0a1342")
  const glpRewardTracker = await contractAt("RewardTracker", "0x9e295B5B976a184B14aD8cd72413aD846C299660")
  const tokenDecimals = 18
  const monthlyEsGmxForGlp = monthlyEsGmxForGlpOnAvax

  return { tokenDecimals, gmxRewardTracker, glpRewardTracker, monthlyEsGmxForGlp }
}

function getValues() {
  if (network === "pegasus") {
    return getPegasusValues()
  }

  if (network === "phoenix") {
    return getPhoenixValues()
  }
}

function toInt(value) {
  return parseInt(value.replaceAll(",", ""))
}

async function main() {
  const { arbStakedGmxAndEsGmx, avaxStakedGmxAndEsGmx } = await getStakedAmounts()
  const { tokenDecimals, gmxRewardTracker, glpRewardTracker, monthlyEsGmxForGlp } = await getValues()

  const stakedAmounts = {
    pegasus: {
      total: arbStakedGmxAndEsGmx
    },
    phoenix: {
      total: avaxStakedGmxAndEsGmx
    }
  }

  let totalStaked = bigNumberify(0)

  for (const net in stakedAmounts) {
    totalStaked = totalStaked.add(stakedAmounts[net].total)
  }

  const totalEsGmxRewards = expandDecimals(12500, tokenDecimals)
  const secondsPerMonth = 28 * 24 * 60 * 60

  const gmxRewardDistributor = await contractAt("RewardDistributor", await gmxRewardTracker.distributor())

  const gmxCurrentTokensPerInterval = await gmxRewardDistributor.tokensPerInterval()
  const gmxNextTokensPerInterval = totalEsGmxRewards.mul(stakedAmounts[network].total).div(totalStaked).div(secondsPerMonth)
  // const gmxDelta = gmxNextTokensPerInterval.sub(gmxCurrentTokensPerInterval).mul(10000).div(gmxCurrentTokensPerInterval)

  console.log("gmxCurrentTokensPerInterval", gmxCurrentTokensPerInterval.toString())
  // console.log("gmxNextTokensPerInterval", gmxNextTokensPerInterval.toString(), `${gmxDelta.toNumber() / 100.00}%`)

  const glpRewardDistributor = await contractAt("RewardDistributor", await glpRewardTracker.distributor())

  const glpCurrentTokensPerInterval = await glpRewardDistributor.tokensPerInterval()
  const glpNextTokensPerInterval = monthlyEsGmxForGlp.div(secondsPerMonth)

  console.log("glpCurrentTokensPerInterval", glpCurrentTokensPerInterval.toString())
  console.log("glpNextTokensPerInterval", glpNextTokensPerInterval.toString())

  if (shouldSendTxn) {
    await updateTokensPerInterval(gmxRewardDistributor, gmxNextTokensPerInterval, "gmxRewardDistributor")
    await updateTokensPerInterval(glpRewardDistributor, glpNextTokensPerInterval, "glpRewardDistributor")
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
