const { deployContract, contractAt, sendTxn, readTmpAddresses } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('../core/tokens')[network];

async function main() {
  const {
    nativeToken
  } = tokens

  const weth = await contractAt("Token", nativeToken.address)
  const amp = await contractAt("AMP", "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a")
  const esAmp = await contractAt("EsAMP", "0xf42Ae1D54fd613C9bb14810b0588FaAa09a426cA")
  const bnAmp = await contractAt("MintableBaseToken", "0x35247165119B69A40edD5304969560D0ef486921")

  const stakedAmpTracker = await contractAt("RewardTracker", "0x908C4D94D34924765f1eDc22A1DD098397c59dD4")
  const bonusAmpTracker = await contractAt("RewardTracker", "0x4d268a7d4C16ceB5a606c173Bd974984343fea13")
  const feeAmpTracker = await contractAt("RewardTracker", "0xd2D1162512F927a7e282Ef43a362659E4F2a728F")

  const feeAlpTracker = await contractAt("RewardTracker", "0x4e971a87900b931fF39d1Aad67697F49835400b6")
  const stakedAlpTracker = await contractAt("RewardTracker", "0x1aDDD80E6039594eE970E5872D247bf0414C8903")

  const alp = await contractAt("ALP", "0x4277f8F2c384827B5273592FF7CeBd9f2C1ac258")
  const alpManager = await contractAt("AlpManager", "0x321F653eED006AD1C29D174e17d96351BDe22649")

  console.log("alpManager", alpManager.address)

  const rewardRouter = await deployContract("RewardRouter", [])

  await sendTxn(rewardRouter.initialize(
    weth.address,
    amp.address,
    esAmp.address,
    bnAmp.address,
    alp.address,
    stakedAmpTracker.address,
    bonusAmpTracker.address,
    feeAmpTracker.address,
    feeAlpTracker.address,
    stakedAlpTracker.address,
    alpManager.address
  ), "rewardRouter.initialize")

  // allow rewardRouter to stake in stakedAmpTracker
  await sendTxn(stakedAmpTracker.setHandler(rewardRouter.address, true), "stakedAmpTracker.setHandler(rewardRouter)")
  // allow rewardRouter to stake in bonusAmpTracker
  await sendTxn(bonusAmpTracker.setHandler(rewardRouter.address, true), "bonusAmpTracker.setHandler(rewardRouter)")
  // allow rewardRouter to stake in feeAmpTracker
  await sendTxn(feeAmpTracker.setHandler(rewardRouter.address, true), "feeAmpTracker.setHandler(rewardRouter)")
  // allow rewardRouter to burn bnAmp
  await sendTxn(bnAmp.setMinter(rewardRouter.address, true), "bnAmp.setMinter(rewardRouter)")

  // allow rewardRouter to mint in alpManager
  await sendTxn(alpManager.setHandler(rewardRouter.address, true), "alpManager.setHandler(rewardRouter)")
  // allow rewardRouter to stake in feeAlpTracker
  await sendTxn(feeAlpTracker.setHandler(rewardRouter.address, true), "feeAlpTracker.setHandler(rewardRouter)")
  // allow rewardRouter to stake in stakedAlpTracker
  await sendTxn(stakedAlpTracker.setHandler(rewardRouter.address, true), "stakedAlpTracker.setHandler(rewardRouter)")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
