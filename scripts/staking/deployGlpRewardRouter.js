const { deployContract, contractAt, sendTxn, getFrameSigner } = require("../shared/helpers")
const { getDeployFilteredInfo } = require("../shared/syncParams");

async function deployGlpRewardRouter() {
  const nativeToken = getDeployFilteredInfo("nativeToken").imple
  const glp = getDeployFilteredInfo("GLP").imple
  const feeGlpTracker = getDeployFilteredInfo("RewardTrackerFeeGLP").imple
  const stakedGlpTracker = getDeployFilteredInfo("RewardTrackerFeeStakedGLP").imple
  const glpManager = getDeployFilteredInfo("GlpManager").imple
  const gmx = getDeployFilteredInfo("GMX").imple
  const esgmx = getDeployFilteredInfo("EsGMX").imple
  const bngmx = getDeployFilteredInfo("BonusGMX").imple
  const stakedGMXTracker = getDeployFilteredInfo("RewardTrackerStakedGMX").imple
  const stakedBonusGMXTracker = getDeployFilteredInfo("RewardTrackerStakedBonusGMX").imple
  const feeGmxTracker = getDeployFilteredInfo("RewardTrackerStakedBonusFeeGMX").imple
  const gmxVester = getDeployFilteredInfo("VesterGMX").imple
  const glpVester = getDeployFilteredInfo("VesterGLP").imple

  await deployContract("RewardRouterV2", [], undefined, undefined, "GLPRewardRouterV2")

  const rewardRouter = await contractAt("RewardRouterV2", getDeployFilteredInfo("GLPRewardRouterV2").imple)

  // Fetch signer explicitly for sendTxn calls
  const signer = await getFrameSigner();

  await sendTxn(rewardRouter.initialize(
    nativeToken, // _weth
    gmx, // _gmx
    esgmx, // _esGmx
    bngmx, // _bnGmx
    glp, // _glp
    stakedGMXTracker, // _stakedGmxTracker
    stakedBonusGMXTracker, // _bonusGmxTracker
    feeGmxTracker, // _feeGmxTracker
    feeGlpTracker, // _feeGlpTracker
    stakedGlpTracker, // _stakedGlpTracker
    glpManager, // _glpManager
    gmxVester, // _gmxVester
    glpVester // glpVester
  ), "rewardRouter.initialize", signer)

  const glpManagerContract = await contractAt("GlpManager", glpManager)

  await sendTxn(glpManagerContract.setHandler(getDeployFilteredInfo("GLPRewardRouterV2").imple, true), "glpManager.setHandler(glpRewardRouter,true)", signer)

  const stakedGMXTrackerContract = await contractAt("RewardTracker", stakedGMXTracker)

  await sendTxn(stakedGMXTrackerContract.setHandler(getDeployFilteredInfo("GLPRewardRouterV2").imple, true), "stakedGMXTracker.setHandler(glpRewardRouter,true)", signer)

  const stakedBonusGMXTrackerContract = await contractAt("RewardTracker", stakedBonusGMXTracker)

  await sendTxn(stakedBonusGMXTrackerContract.setHandler(getDeployFilteredInfo("GLPRewardRouterV2").imple, true), "stakedBonusGMXTracker.setHandler(glpRewardRouter,true)", signer)

  const feeGmxTrackerContract = await contractAt("RewardTracker", feeGmxTracker)

  await sendTxn(feeGmxTrackerContract.setHandler(getDeployFilteredInfo("GLPRewardRouterV2").imple, true), "feeGmxTracker.setHandler(glpRewardRouter,true)", signer)

  const feeGlpTrackerContract = await contractAt("RewardTracker", feeGlpTracker)

  await sendTxn(feeGlpTrackerContract.setHandler(getDeployFilteredInfo("GLPRewardRouterV2").imple, true), "feeGlpTracker.setHandler(glpRewardRouter,true)", signer)

  const stakedGlpTrackerContract = await contractAt("RewardTracker", stakedGlpTracker)
  
  await sendTxn(stakedGlpTrackerContract.setHandler(getDeployFilteredInfo("GLPRewardRouterV2").imple, true), "stakedGlpTracker.setHandler(glpRewardRouter,true)", signer)
}

module.exports = deployGlpRewardRouter