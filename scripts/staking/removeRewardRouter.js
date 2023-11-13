const { deployContract, contractAt, sendTxn } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")

async function main() {
  const rewardRouter = await contractAt("RewardRouter", "0xEa7fCb85802713Cb03291311C66d6012b23402ea")
  const bnAmp = await contractAt("MintableBaseToken", "0x35247165119B69A40edD5304969560D0ef486921")
  const alpManager = await contractAt("AlpManager", "0x91425Ac4431d068980d497924DD540Ae274f3270")

  const stakedAmpTracker = await contractAt("RewardTracker", "0x908C4D94D34924765f1eDc22A1DD098397c59dD4")
  const bonusAmpTracker = await contractAt("RewardTracker", "0x4d268a7d4C16ceB5a606c173Bd974984343fea13")
  const feeAmpTracker = await contractAt("RewardTracker", "0xd2D1162512F927a7e282Ef43a362659E4F2a728F")

  const feeAlpTracker = await contractAt("RewardTracker", "0x4e971a87900b931fF39d1Aad67697F49835400b6")
  const stakedAlpTracker = await contractAt("RewardTracker", "0x1aDDD80E6039594eE970E5872D247bf0414C8903")

  // allow rewardRouter to stake in stakedAmpTracker
  await sendTxn(stakedAmpTracker.setHandler(rewardRouter.address, false), "stakedAmpTracker.setHandler(rewardRouter)")
  // allow rewardRouter to stake in bonusAmpTracker
  await sendTxn(bonusAmpTracker.setHandler(rewardRouter.address, false), "bonusAmpTracker.setHandler(rewardRouter)")
  // allow rewardRouter to stake in feeAmpTracker
  await sendTxn(feeAmpTracker.setHandler(rewardRouter.address, false), "feeAmpTracker.setHandler(rewardRouter)")
  // allow rewardRouter to burn bnAmp
  await sendTxn(bnAmp.setMinter(rewardRouter.address, false), "bnAmp.setMinter(rewardRouter)")

  // allow rewardRouter to mint in alpManager
  await sendTxn(alpManager.setHandler(rewardRouter.address, false), "alpManager.setHandler(rewardRouter)")
  // allow rewardRouter to stake in feeAlpTracker
  await sendTxn(feeAlpTracker.setHandler(rewardRouter.address, false), "feeAlpTracker.setHandler(rewardRouter)")
  // allow rewardRouter to stake in stakedAlpTracker
  await sendTxn(stakedAlpTracker.setHandler(rewardRouter.address, false), "stakedAlpTracker.setHandler(rewardRouter)")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
