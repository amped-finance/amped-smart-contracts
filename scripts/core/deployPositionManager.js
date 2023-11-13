const { getFrameSigner, deployContract, contractAt , sendTxn } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const { toUsd } = require("../../test/shared/units")
const { errors } = require("../../test/core/Vault/helpers")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];

const depositFee = 30 // 0.3%

async function getArbValues() {
  const vault = await contractAt("Vault", "0x4d901306c35Df4761c1758071A2B31706a9a45C8", signer)
  const timelock = await contractAt("Timelock", await vault.gov(), signer)
  const router = await contractAt("Router", await vault.router(), signer)
  const shortsTracker = await contractAt("ShortsTracker", "0xf58eEc83Ba28ddd79390B9e90C4d3EbfF1d434da", signer)
  const weth = await contractAt("WETH", tokens.nativeToken.address)
  const orderBook = await contractAt("OrderBook", "0x09f77E8A13De9a35a7231028187e9fD5DB8a2ACB")
  const referralStorage = await contractAt("ReferralStorage", "0xe6fab3f0c7199b0d34d7fbe83394fc0e0d06e99d")

  const orderKeepers = [
    { address: "0xd4266F8F82F7405429EE18559e548979D49160F3" },
    { address: "0x2D1545d6deDCE867fca3091F49B29D16B230a6E4" }
  ]
  const liquidators = [
    { address: "0x44311c91008DDE73dE521cd25136fD37d616802c" }
  ]

  const partnerContracts = [
    "0x9ba57a1D3f6C61Ff500f598F16b97007EB02E346", // Vovo ETH up vault
    "0x5D8a5599D781CC50A234D73ac94F4da62c001D8B", // Vovo ETH down vault
    "0xE40bEb54BA00838aBE076f6448b27528Dd45E4F0", // Vovo BTC up vault
    "0x1704A75bc723A018D176Dc603b0D1a361040dF16", // Vovo BTC down vault
    "0xbFbEe90E2A96614ACe83139F41Fa16a2079e8408", // Vovo ALP ETH up vault
    "0x0FAE768Ef2191fDfCb2c698f691C49035A53eF0f", // Vovo ALP ETH down vault
    "0x2b8E28667A29A5Ab698b82e121F2b9Edd9271e93", // Vovo ALP BTC up vault
    "0x46d6dEE922f1d2C6421895Ba182120C784d986d3", // Vovo ALP BTC down vault
    "0x3327a5F041E821f476E00572ee0862fbcaa32993", // Jones ETH Hedging
    "0x2F9980d6fb25bD972196B19E243e36Dbde60618B", // Jones gOHM Hedging
    "0xC75417CB103D7008eCb07aa6fbf214eE2c127901", // Jones DPX Hedging
    "0x37a86cB53981CC762709B2c402B0F790D58F95BF", // Jones rDPX Hedging
  ]

  return { vault, timelock, router, shortsTracker, weth, depositFee, orderBook, referralStorage, orderKeepers, liquidators, partnerContracts }
}

async function getAvaxValues() {
  const vault = await contractAt("Vault", "0x2a5bae3eaec36d147dFE859b1a68F1A5eCCB0dd5")
  // const timelock = await contractAt("Timelock", await vault.gov(), signer)
  // const router = await contractAt("Router", await vault.router(), signer)
  const router = await contractAt("Router", await vault.router())
  const shortsTracker = await contractAt("ShortsTracker", "0x44feD5e7a709574151AfF6f753D61b1a2232e848")
  const weth = await contractAt("WETH", tokens.nativeToken.address)
  const orderBook = await contractAt("OrderBook", "0x2cd0640F9bA7C0a0306C92a674be4f89eF89cE80")
  const referralStorage = await contractAt("ReferralStorage", "0xF51Def0A8A991E2Aa227643271d290c2DAa8cFCe")

  const orderKeepers = [
    { address: "0xDF4c9f7DA7068337b893980420471b7Dc8C413Cb" },
    { address: "0xDF4c9f7DA7068337b893980420471b7Dc8C413Cb" }
  ]
  const liquidators = [
    { address: "0xDF4c9f7DA7068337b893980420471b7Dc8C413Cb" }
  ]

  const partnerContracts = []

  // return { vault, timelock, router, shortsTracker, weth, depositFee, orderBook, referralStorage, orderKeepers, liquidators, partnerContracts }
  return { vault, router, shortsTracker, weth, depositFee, orderBook, referralStorage, orderKeepers, liquidators, partnerContracts }
}

async function getGoerliValues() {
  const vault = await contractAt("Vault", "0xDAaD544a99cE12348375f7eE87ED7E135df6c251")
  // const timelock = await contractAt("Timelock", await vault.gov(), signer)
  // const router = await contractAt("Router", await vault.router(), signer)
  const router = await contractAt("Router", await vault.router())
  const shortsTracker = await contractAt("ShortsTracker", "0x20db8Bb4b4775De1ea32D935CbAA4aD07c403edE")
  const weth = await contractAt("WETH", tokens.nativeToken.address)
  const orderBook = await contractAt("OrderBook", "0x2D8BF359Fe5969448bE386BE0C66A9111c1Dd8e1")
  const referralStorage = await contractAt("ReferralStorage", "0x990B504aa9717870b9D5C28320af8ce4B59a5A9F")

  const orderKeepers = [
    { address: "0x23caDe50f2c2FA49F7CCb56621C08E3F9ba8c8fB" }
  ]
  const liquidators = [
    { address: "0x23caDe50f2c2FA49F7CCb56621C08E3F9ba8c8fB" }
  ]

  const partnerContracts = []

  // return { vault, timelock, router, shortsTracker, weth, depositFee, orderBook, referralStorage, orderKeepers, liquidators, partnerContracts }
  return { vault, router, shortsTracker, weth, depositFee, orderBook, referralStorage, orderKeepers, liquidators, partnerContracts }
}

async function getCronosValues() {
  const vault = await contractAt("Vault", "0x26e5FbFbfd38a27D5777C9C9CC5543e687E637D8")
  // const timelock = await contractAt("Timelock", await vault.gov(), signer)
  // const router = await contractAt("Router", await vault.router(), signer)
  const router = await contractAt("Router", await vault.router())
  const shortsTracker = await contractAt("ShortsTracker", "0x6CD731500C97a86B9316514Afa3AD0a3a8c7c535")
  const weth = await contractAt("WETH", tokens.nativeToken.address)
  const orderBook = await contractAt("OrderBook", "0xe68C423AdcD64Db9827d97EB475074f758Ed97D8")
  const referralStorage = await contractAt("ReferralStorage", "0xA9daCb8294a17bF278119ADE901D388CC1D0DC7A")

  const orderKeepers = [
    { address: "0x8e5de1BC43d6c0cB36E3F2A5e11dc5295662aeEC" }
  ]
  const liquidators = [
    { address: "0x8e5de1BC43d6c0cB36E3F2A5e11dc5295662aeEC" }
  ]

  const partnerContracts = []

  // return { vault, timelock, router, shortsTracker, weth, depositFee, orderBook, referralStorage, orderKeepers, liquidators, partnerContracts }
  return { vault, router, shortsTracker, weth, depositFee, orderBook, referralStorage, orderKeepers, liquidators, partnerContracts }
}

async function getPegasusValues() {
  const vault = await contractAt("Vault", "0x1Abe14c82a70550cD9fFB5FeB17cfe497d04F0Ff")
  // const timelock = await contractAt("Timelock", await vault.gov(), signer)
  // const router = await contractAt("Router", await vault.router(), signer)
  const router = await contractAt("Router", await vault.router())
  const shortsTracker = await contractAt("ShortsTracker", "0xA604bcb1573E1ECd3F2011FCff9b449072DD0E37")
  const weth = await contractAt("WETH", tokens.nativeToken.address)
  const orderBook = await contractAt("OrderBook", "0x8DFFe4484A47577Ce2562b0A052337AeA60dc96d")
  const referralStorage = await contractAt("ReferralStorage", "0xfa369BC0Fa2A0438573b41dC735a447ac0665Fd3")

  const orderKeepers = [
    { address: "0x03413564187AD43DB5024b0E6D7E1d24b1d0bE23" }
  ]
  const liquidators = [
    { address: "0x03413564187AD43DB5024b0E6D7E1d24b1d0bE23" }
  ]

  const partnerContracts = []

  // return { vault, timelock, router, shortsTracker, weth, depositFee, orderBook, referralStorage, orderKeepers, liquidators, partnerContracts }
  return { vault, router, shortsTracker, weth, depositFee, orderBook, referralStorage, orderKeepers, liquidators, partnerContracts }
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
    positionManagerAddress,
    vault,
    // timelock,
    router,
    shortsTracker,
    weth,
    depositFee,
    orderBook,
    referralStorage,
    orderKeepers,
    liquidators,
    partnerContracts
  } = await getValues()

  let positionManager
  if (positionManagerAddress) {
    console.log("Using position manager at", positionManagerAddress)
    positionManager = await contractAt("PositionManager", positionManagerAddress)
  } else {
    console.log("Deploying new position manager")
    const positionManagerArgs = [vault.address, router.address, shortsTracker.address, weth.address, depositFee, orderBook.address]
    positionManager = await deployContract("PositionManager", positionManagerArgs)
  }

  // positionManager = await contractAt("PositionManager", "0x4Cdc73c46570E6b4C7b4086Ab249D1FdE901C899")

  // positionManager only reads from referralStorage so it does not need to be set as a handler of referralStorage
  if ((await positionManager.referralStorage()).toLowerCase() != referralStorage.address.toLowerCase()) {
    await sendTxn(positionManager.setReferralStorage(referralStorage.address), "positionManager.setReferralStorage")
  }
  if (await positionManager.shouldValidateIncreaseOrder()) {
    await sendTxn(positionManager.setShouldValidateIncreaseOrder(false), "positionManager.setShouldValidateIncreaseOrder(false)")
  }

  for (let i = 0; i < orderKeepers.length; i++) {
    const orderKeeper = orderKeepers[i]
    if (!(await positionManager.isOrderKeeper(orderKeeper.address))) {
      await sendTxn(positionManager.setOrderKeeper(orderKeeper.address, true), "positionManager.setOrderKeeper(orderKeeper)")
    }
  }

  for (let i = 0; i < liquidators.length; i++) {
    const liquidator = liquidators[i]
    if (!(await positionManager.isLiquidator(liquidator.address))) {
      await sendTxn(positionManager.setLiquidator(liquidator.address, true), "positionManager.setLiquidator(liquidator)")
    }
  }

  // if (!(await timelock.isHandler(positionManager.address))) {
  //   await sendTxn(timelock.setContractHandler(positionManager.address, true), "timelock.setContractHandler(positionManager)")
  // }
  // if (!(await vault.isLiquidator(positionManager.address))) {
  //   await sendTxn(timelock.setLiquidator(vault.address, positionManager.address, true), "timelock.setLiquidator(vault, positionManager, true)")
  // }
  if (!(await shortsTracker.isHandler(positionManager.address))) {
    await sendTxn(shortsTracker.setHandler(positionManager.address, true), "shortsTracker.setContractHandler(positionManager.address, true)")
  }
  if (!(await router.plugins(positionManager.address))) {
    await sendTxn(router.addPlugin(positionManager.address), "router.addPlugin(positionManager)")
  }

  for (let i = 0; i < partnerContracts.length; i++) {
    const partnerContract = partnerContracts[i]
    if (!(await positionManager.isPartner(partnerContract))) {
      await sendTxn(positionManager.setPartner(partnerContract, false), "positionManager.setPartner(partnerContract)")
    }
  }

  if ((await positionManager.gov()) != (await vault.gov())) {
    await sendTxn(positionManager.setGov(await vault.gov()), "positionManager.setGov")
  }

  console.log("done.")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
