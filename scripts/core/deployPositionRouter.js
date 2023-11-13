const { getFrameSigner, deployContract, contractAt , sendTxn, readTmpAddresses, writeTmpAddresses } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const { toUsd } = require("../../test/shared/units")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];

async function getArbValues() {
  const vault = await contractAt("Vault", "0x489ee077994B6658eAfA855C308275EAd8097C4A")
  const timelock = await contractAt("Timelock", await vault.gov(), signer)
  const router = await contractAt("Router", await vault.router(), signer)
  const weth = await contractAt("WETH", tokens.nativeToken.address)
  const referralStorage = await contractAt("ReferralStorage", "0xe6fab3F0c7199b0d34d7FbE83394fc0e0D06e99d")
  const shortsTracker = await contractAt("ShortsTracker", "0xf58eEc83Ba28ddd79390B9e90C4d3EbfF1d434da", signer)
  const depositFee = "30" // 0.3%
  const minExecutionFee = "100000000000000" // 0.0001 ETH

  return {
    vault,
    timelock,
    router,
    weth,
    referralStorage,
    shortsTracker,
    depositFee,
    minExecutionFee,
    positionKeepers
  }
}

async function getAvaxValues() {
  const vault = await contractAt("Vault", "0x2a5bae3eaec36d147dFE859b1a68F1A5eCCB0dd5")
  // const timelock = await contractAt("Timelock", await vault.gov(), signer)
  const router = await contractAt("Router", await vault.router())
  const weth = await contractAt("WETH", tokens.nativeToken.address)
  const referralStorage = await contractAt("ReferralStorage", "0xF51Def0A8A991E2Aa227643271d290c2DAa8cFCe")
  const shortsTracker = await contractAt("ShortsTracker", "0x44feD5e7a709574151AfF6f753D61b1a2232e848")
  const depositFee = "30" // 0.3%
  const minExecutionFee = "20000000000000000" // 0.02 AVAX

  return {
    vault,
    // timelock,
    router,
    weth,
    referralStorage,
    shortsTracker,
    depositFee,
    minExecutionFee
  }
}

async function getGoerliValues() {
  const vault = await contractAt("Vault", "0xDAaD544a99cE12348375f7eE87ED7E135df6c251")
  // const timelock = await contractAt("Timelock", await vault.gov(), signer)
  const router = await contractAt("Router", await vault.router())
  const weth = await contractAt("WETH", tokens.nativeToken.address)
  const referralStorage = await contractAt("ReferralStorage", "0x990B504aa9717870b9D5C28320af8ce4B59a5A9F")
  const shortsTracker = await contractAt("ShortsTracker", "0x20db8Bb4b4775De1ea32D935CbAA4aD07c403edE")
  const depositFee = "30" // 0.3%
  const minExecutionFee = "20000000000000000" // 0.02 AVAX

  return {
    vault,
    // timelock,
    router,
    weth,
    referralStorage,
    shortsTracker,
    depositFee,
    minExecutionFee
  }
}

async function getCronosValues() {
  const vault = await contractAt("Vault", "0x26e5FbFbfd38a27D5777C9C9CC5543e687E637D8")
  // const timelock = await contractAt("Timelock", await vault.gov(), signer)
  const router = await contractAt("Router", await vault.router())
  const weth = await contractAt("WETH", tokens.nativeToken.address)
  const referralStorage = await contractAt("ReferralStorage", "0xA9daCb8294a17bF278119ADE901D388CC1D0DC7A")
  const shortsTracker = await contractAt("ShortsTracker", "0x6CD731500C97a86B9316514Afa3AD0a3a8c7c535")
  const depositFee = "30" // 0.3%
  const minExecutionFee = "4000000000000000000" // 4 CRO

  return {
    vault,
    // timelock,
    router,
    weth,
    referralStorage,
    shortsTracker,
    depositFee,
    minExecutionFee
  }
}

async function getPegasusValues() {
  const vault = await contractAt("Vault", "0x1Abe14c82a70550cD9fFB5FeB17cfe497d04F0Ff")
  // const timelock = await contractAt("Timelock", await vault.gov(), signer)
  const router = await contractAt("Router", await vault.router())
  const weth = await contractAt("WETH", tokens.nativeToken.address)
  const referralStorage = await contractAt("ReferralStorage", "0xfa369BC0Fa2A0438573b41dC735a447ac0665Fd3")
  const shortsTracker = await contractAt("ShortsTracker", "0xA604bcb1573E1ECd3F2011FCff9b449072DD0E37")
  const depositFee = "30" // 0.3%
  const minExecutionFee = "100000000000" // 0.000001 ETH

  return {
    vault,
    // timelock,
    router,
    weth,
    referralStorage,
    shortsTracker,
    depositFee,
    minExecutionFee
  }
}

async function getValues() {
  if (network === "arbitrum") {
    return getArbValues()
  }

  if (network === "avax") {
    return getAvaxValues()
  }

  if (network === "goerli") {
    return getGoerliValues()
  }

  if (network === "cronos") {
    return getCronosValues()
  }

  if (network === "pegasus") {
    return getPegasusValues()
  }
}

async function main() {
  // const signer = await getFrameSigner()

  const {
    vault,
    // timelock,
    router,
    weth,
    shortsTracker,
    depositFee,
    minExecutionFee,
    referralStorage
  } = await getValues()

  // const referralStorageGov = await contractAt("Timelock", await referralStorage.gov())

  const positionRouterArgs = [vault.address, router.address, weth.address, shortsTracker.address, depositFee, minExecutionFee]
  const positionRouter = await deployContract("PositionRouter", positionRouterArgs)
  // const positionRouter = await contractAt("PositionRouter", "0x91754a02a4507C14eCcE5913f4C80d58887B8E59")

  await sendTxn(positionRouter.setReferralStorage(referralStorage.address), "positionRouter.setReferralStorage")
  // await sendTxn(referralStorageGov.signalSetHandler(referralStorage.address, positionRouter.address, true), "referralStorage.signalSetHandler(positionRouter)")

  await sendTxn(shortsTracker.setHandler(positionRouter.address, true), "shortsTracker.setHandler(positionRouter)")

  await sendTxn(router.addPlugin(positionRouter.address), "router.addPlugin")

  await sendTxn(positionRouter.setDelayValues(1, 180, 30 * 60), "positionRouter.setDelayValues")
  // await sendTxn(timelock.setContractHandler(positionRouter.address, true), "timelock.setContractHandler(positionRouter)")

  // await sendTxn(positionRouter.setGov(await vault.gov()), "positionRouter.setGov")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
