const { getFrameSigner, deployContract, contractAt, sendTxn, readTmpAddresses, callWithRetries } = require("../shared/helpers")
const { bigNumberify, expandDecimals } = require("../../test/shared/utilities")
const { toChainlinkPrice } = require("../../test/shared/chainlink")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];

async function getArbValues() {
  const positionContracts = [
    "0xb87a436B93fFE9D75c5cFA7bAcFff96430b09868", // PositionRouter
    "0x75E42e6f01baf1D6022bEa862A28774a9f8a4A0C" // PositionManager
  ]

  const { btc, eth, link, uni } = tokens
  const tokenArr = [btc, eth, link, uni]

  return { positionContracts, tokenArr }
}

async function getAvaxValues() {
  const positionContracts = [
    "0xffF6D276Bc37c61A23f06410Dce4A400f66420f8", // PositionRouter
    "0xA21B83E579f4315951bA658654c371520BDcB866" // PositionManager
  ]

  const { avax, eth, btc, btcb } = tokens
  const tokenArr = [avax, eth, btc, btcb]

  return { positionContracts, tokenArr }
}

async function getCronosValues() {
  const positionContracts = [
    "0x898dECf055b9236F6E6062080bc5d11C958CfB0b", // PositionRouter
    "0x75be73dAB8EcF685DdA1701b23c12dBb8eDDf07b" // PositionManager
  ]

  const { cro, btc, eth, atom, ada, doge } = tokens
  const tokenArr = [cro, btc, eth, atom, ada, doge]

  return { positionContracts, tokenArr }
}

async function getPegasusValues() {
  const positionContracts = [
    "0xC9455e8FC2978F4d87f6707122c0876a8D91c980", // PositionRouter
    "0x4Ac0bC01Be3B215D7252205748021166A20AFC02" // PositionManager
  ]

  const { weth, btc } = tokens
  const tokenArr = [weth, btc]

  return { positionContracts, tokenArr }
}

async function getValues() {
  if (network === "arbitrum") {
    return getArbValues()
  }

  if (network === "avax") {
    return getAvaxValues()
  }

  if (network === "cronos") {
    return getCronosValues()
  }

  if (network === "pegasus") {
    return getPegasusValues()
  }
}

async function main() {
  const { positionContracts, tokenArr } = await getValues()

  console.log("eagle tokenArr = ", tokenArr)
  const tokenAddresses = tokenArr.map((t) => {
    return t.address
  })
  
  const longSizes = tokenArr.map((token) => {
    if (!token.maxGlobalLongSize) {
      return bigNumberify(0)
    }

    return expandDecimals(token.maxGlobalLongSize, 30)
  })

  const shortSizes = tokenArr.map((token) => {
    if (!token.maxGlobalShortSize) {
      return bigNumberify(0)
    }

    return expandDecimals(token.maxGlobalShortSize, 30)
  })

  for (let i = 0; i < positionContracts.length; i++) {
    const positionContract = await contractAt("PositionManager", positionContracts[i])
    await sendTxn(positionContract.setMaxGlobalSizes(tokenAddresses, longSizes, shortSizes), "positionContract.setMaxGlobalSizes")
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
