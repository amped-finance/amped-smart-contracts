const { deployContract, contractAt, sendTxn } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")

async function main() {
  const wallet = { address: "0x5F799f365Fa8A2B60ac0429C48B153cA5a6f0Cf8" }
  const { AddressZero } = ethers.constants

  const weth = { address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1" }
  const amp = await deployContract("AMP", []);
  const esAmp = await deployContract("EsAMP", []);
  const bnAmp = await deployContract("MintableBaseToken", ["Bonus AMP", "bnAMP", 0]);
  const bnAlp = { address: AddressZero }
  const alp = { address: AddressZero }

  const stakedAmpTracker = await deployContract("RewardTracker", ["Staked AMP", "sAMP"])
  const stakedAmpDistributor = await deployContract("RewardDistributor", [esAmp.address, stakedAmpTracker.address])
  await sendTxn(stakedAmpTracker.initialize([amp.address, esAmp.address], stakedAmpDistributor.address), "stakedAmpTracker.initialize")
  await sendTxn(stakedAmpDistributor.updateLastDistributionTime(), "stakedAmpDistributor.updateLastDistributionTime")

  const bonusAmpTracker = await deployContract("RewardTracker", ["Staked + Bonus AMP", "sbAMP"])
  const bonusAmpDistributor = await deployContract("BonusDistributor", [bnAmp.address, bonusAmpTracker.address])
  await sendTxn(bonusAmpTracker.initialize([stakedAmpTracker.address], bonusAmpDistributor.address), "bonusAmpTracker.initialize")
  await sendTxn(bonusAmpDistributor.updateLastDistributionTime(), "bonusAmpDistributor.updateLastDistributionTime")

  const feeAmpTracker = await deployContract("RewardTracker", ["Staked + Bonus + Fee AMP", "sbfAMP"])
  const feeAmpDistributor = await deployContract("RewardDistributor", [weth.address, feeAmpTracker.address])
  await sendTxn(feeAmpTracker.initialize([bonusAmpTracker.address, bnAmp.address], feeAmpDistributor.address), "feeAmpTracker.initialize")
  await sendTxn(feeAmpDistributor.updateLastDistributionTime(), "feeAmpDistributor.updateLastDistributionTime")

  const feeAlpTracker = { address: AddressZero }
  const stakedAlpTracker = { address: AddressZero }

  const stakedAlpTracker = { address: AddressZero }
  const bonusAlpTracker = { address: AddressZero }
  const feeAlpTracker = { address: AddressZero }

  const alpManager = { address: AddressZero }
  const alp = { address: AddressZero }

  await sendTxn(stakedAmpTracker.setInPrivateTransferMode(true), "stakedAmpTracker.setInPrivateTransferMode")
  await sendTxn(stakedAmpTracker.setInPrivateStakingMode(true), "stakedAmpTracker.setInPrivateStakingMode")
  await sendTxn(bonusAmpTracker.setInPrivateTransferMode(true), "bonusAmpTracker.setInPrivateTransferMode")
  await sendTxn(bonusAmpTracker.setInPrivateStakingMode(true), "bonusAmpTracker.setInPrivateStakingMode")
  await sendTxn(bonusAmpTracker.setInPrivateClaimingMode(true), "bonusAmpTracker.setInPrivateClaimingMode")
  await sendTxn(feeAmpTracker.setInPrivateTransferMode(true), "feeAmpTracker.setInPrivateTransferMode")
  await sendTxn(feeAmpTracker.setInPrivateStakingMode(true), "feeAmpTracker.setInPrivateStakingMode")

  const rewardRouter = await deployContract("RewardRouter", [])

  await sendTxn(rewardRouter.initialize(
    amp.address,
    esAmp.address,
    bnAmp.address,
    bnAlp.address,
    alp.address,
    alp.address,
    stakedAmpTracker.address,
    bonusAmpTracker.address,
    feeAmpTracker.address,
    feeAlpTracker.address,
    stakedAlpTracker.address,
    stakedAlpTracker.address,
    bonusAlpTracker.address,
    feeAlpTracker.address,
    alpManager.address
  ), "rewardRouter.initialize")

  // allow rewardRouter to stake in stakedAmpTracker
  await sendTxn(stakedAmpTracker.setHandler(rewardRouter.address, true), "stakedAmpTracker.setHandler(rewardRouter)")
  // allow bonusAmpTracker to stake stakedAmpTracker
  await sendTxn(stakedAmpTracker.setHandler(bonusAmpTracker.address, true), "stakedAmpTracker.setHandler(bonusAmpTracker)")
  // allow rewardRouter to stake in bonusAmpTracker
  await sendTxn(bonusAmpTracker.setHandler(rewardRouter.address, true), "bonusAmpTracker.setHandler(rewardRouter)")
  // allow bonusAmpTracker to stake feeAmpTracker
  await sendTxn(bonusAmpTracker.setHandler(feeAmpTracker.address, true), "bonusAmpTracker.setHandler(feeAmpTracker)")
  await sendTxn(bonusAmpDistributor.setBonusMultiplier(10000), "bonusAmpDistributor.setBonusMultiplier")
  // allow rewardRouter to stake in feeAmpTracker
  await sendTxn(feeAmpTracker.setHandler(rewardRouter.address, true), "feeAmpTracker.setHandler(rewardRouter)")
  // allow stakedAmpTracker to stake esAmp
  await sendTxn(esAmp.setHandler(stakedAmpTracker.address, true), "esAmp.setHandler(stakedAmpTracker)")
  // allow feeAmpTracker to stake bnAmp
  await sendTxn(bnAmp.setHandler(feeAmpTracker.address, true), "bnAmp.setHandler(feeAmpTracker")
  // allow rewardRouter to burn bnAmp
  await sendTxn(bnAmp.setMinter(rewardRouter.address, true), "bnAmp.setMinter(rewardRouter")

  // mint esAmp for distributors
  await sendTxn(esAmp.setMinter(wallet.address, true), "esAmp.setMinter(wallet)")
  await sendTxn(esAmp.mint(stakedAmpDistributor.address, expandDecimals(50000 * 12, 18)), "esAmp.mint(stakedAmpDistributor") // ~50,000 AMP per month
  await sendTxn(stakedAmpDistributor.setTokensPerInterval("20667989410000000"), "stakedAmpDistributor.setTokensPerInterval") // 0.02066798941 esAmp per second

  // mint bnAmp for distributor
  await sendTxn(bnAmp.setMinter(wallet.address, true), "bnAmp.setMinter")
  await sendTxn(bnAmp.mint(bonusAmpDistributor.address, expandDecimals(15 * 1000 * 1000, 18)), "bnAmp.mint(bonusAmpDistributor)")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
