const { deployContract, contractAt , sendTxn, getFrameSigner } = require("../shared/helpers")
const { getDeployFilteredInfo, getNetwork } = require("../shared/syncParams");
const tokenList = require('./tokens')

async function deployPositionRouter() {
  const signer = await getFrameSigner()
  const capKeeperWallet = signer
  const capKeeperAddress = await signer.getAddress()
  const {imple: vaultAddr} = getDeployFilteredInfo("Vault")
  const {imple: timelockAddr} = getDeployFilteredInfo("Timelock")
  const {imple: routerAddr} = getDeployFilteredInfo("Router")
  const {imple: weth} = getDeployFilteredInfo("nativeToken")
  const {imple: shortsTrackerAddr} = getDeployFilteredInfo("ShortsTracker")
  const {imple: shortsTrackerTimelockAddr} = getDeployFilteredInfo("ShortsTrackerTimelock")
  const depositFee = "30" // 0.3%
  const minExecutionFee = "1000000000000000" // 0.001 ETH
  const {imple: referralStorageAddr} = getDeployFilteredInfo("ReferralStorage")

  await deployContract("PositionUtils", [])

  const positionUtils = await contractAt("PositionUtils", getDeployFilteredInfo("PositionUtils").imple)

  const referralStorage = await contractAt("ReferralStorage", referralStorageAddr)

  const referralStorageGov = await contractAt("Timelock", await referralStorage.gov())

  const positionRouterArgs = [vaultAddr, routerAddr, weth, shortsTrackerAddr, depositFee, minExecutionFee]
  await deployContract("PositionRouter", positionRouterArgs, "PositionRouter", {
      libraries: {
        PositionUtils: positionUtils.address
      }
  })

  const positionRouter = await contractAt("PositionRouter", getDeployFilteredInfo("PositionRouter").imple, undefined, {
    libraries: {
      PositionUtils: positionUtils.address
    }
  })

  await sendTxn(positionRouter.setReferralStorage(referralStorage.address), "positionRouter.setReferralStorage", signer)
  await sendTxn(referralStorageGov.signalSetHandler(referralStorage.address, positionRouter.address, true), "referralStorage.signalSetHandler(positionRouter)", signer)

  const shortsTrackerTimelock = await contractAt("ShortsTrackerTimelock", shortsTrackerTimelockAddr)
  await sendTxn(shortsTrackerTimelock.signalSetHandler(referralStorage.address, positionRouter.address, true), "shortsTrackerTimelock.signalSetHandler(positionRouter)", signer)

  const router = await contractAt("Router", routerAddr)
  await sendTxn(router.addPlugin(positionRouter.address), "router.addPlugin", signer)

  await sendTxn(positionRouter.setDelayValues(0, 180, 30 * 60), "positionRouter.setDelayValues", signer)
  const timelock = await contractAt("Timelock", timelockAddr)
  await sendTxn(timelock.setContractHandler(positionRouter.address, true), "timelock.setContractHandler(positionRouter)", signer)

  const vault = await contractAt("Vault", vaultAddr)

  const network = getNetwork()
  const tokens = tokenList[network];

  let tokenArr = []
  for (const coin in tokens) {
    tokenArr = [...tokenArr, tokens[coin]]
  }

  for (const token of tokenArr) {
    if (token === undefined) continue
    
    await sendTxn(
      vault.setTokenConfig(
        token.address, // _token
        token.decimals,
        token.tokenWeight ?? 10000,
        token.minProfitBps ?? 0,
        token.maxUsdgAmount ?? 50 * 1000 * 1000,
        token.stable === true? true: false,
        token.stable === true? false: true
      ),
      `vault.setTokenConfig(${token.name}) ${token.address} ${token.priceFeed}`, signer
    );
  }

  await sendTxn(
    vault.setGov(timelock.address),
    "vault.setGov(timelock)", signer
  );

  await sendTxn(positionRouter.setAdmin(capKeeperAddress), "positionRouter.setAdmin", signer)
  await sendTxn(positionRouter.setGov(await vault.gov()), "positionRouter.setGov", signer)

  const shortsTracker = await contractAt("ShortsTracker", shortsTrackerAddr)

  if (!(await shortsTracker.isHandler(positionRouter.address))) {
    await sendTxn(
      shortsTracker.setHandler(positionRouter.address, true),
      "shortsTracker.setContractHandler(positionRouter.address, true)", signer
    );
  }
}

module.exports = deployPositionRouter