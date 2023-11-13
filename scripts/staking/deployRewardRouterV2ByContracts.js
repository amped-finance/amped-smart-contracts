const { deployContract, contractAt, sendTxn, writeTmpAddresses } = require("../shared/helpers")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('../core/tokens')[network];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const { nativeToken } = tokens

  const vestingDuration = 365 * 24 * 60 * 60

  const alpManager = await contractAt("AlpManager", "0x3a417b2949d59B129e5C6c0A52114335C780B9AE")
  const alp = await contractAt("ALP", "0xA63FbC76dDaf2F800B3699a4a46C5f260E04050C")

  const amp = await contractAt("AMP", "0x39E1Da9a034Fd5ADba01C7F6cFA8B5dE16dD908c");
  const esAmp = await contractAt("EsAMP", "0x6CdEf99C74CcF3FA65211fF547Be5dDB4A73770C");
  // const bnAmp = await deployContract("MintableBaseToken", ["Bonus AMP", "bnAMP", 0]);
  const bnAmp = await contractAt("MintableBaseToken", "0x6e29e6db1Ea778fCC17BA575C8fB22A4dfeAE08f");


  // await sendTxn(esAmp.setInPrivateTransferMode(true), "esAmp.setInPrivateTransferMode")
  // await sendTxn(alp.setInPrivateTransferMode(true), "alp.setInPrivateTransferMode")

  // const stakedAmpTracker = await deployContract("RewardTracker", ["Staked AMP", "sAMP"])
  const stakedAmpTracker = await contractAt("RewardTracker", "0x48d7f4529f6149c5EB96AeF38534b90AD7562b4d")
  // const stakedAmpDistributor = await deployContract("RewardDistributor", [esAmp.address, stakedAmpTracker.address])
  const stakedAmpDistributor = await contractAt("RewardDistributor", "0x4e11F35A9c226be709078787cC44375FD7c22424")

  // await sendTxn(stakedAmpTracker.initialize([amp.address, esAmp.address], stakedAmpDistributor.address), "stakedAmpTracker.initialize")
  // await sendTxn(stakedAmpDistributor.updateLastDistributionTime(), "stakedAmpDistributor.updateLastDistributionTime")

  // const bonusAmpTracker = await deployContract("RewardTracker", ["Staked + Bonus AMP", "sbAMP"])
  const bonusAmpTracker = await contractAt("RewardTracker", "0xC5fcC14560781C4c9FD55d7466d781539177A3a4")

  // const bonusAmpDistributor = await deployContract("BonusDistributor", [bnAmp.address, bonusAmpTracker.address])
  const bonusAmpDistributor = await contractAt("BonusDistributor", "0x667Af1B5Cb7b86107B0B9BEa3AE3C44506E1d8Ce")

  // await sendTxn(bonusAmpTracker.initialize([stakedAmpTracker.address], bonusAmpDistributor.address), "bonusAmpTracker.initialize")
  // await sendTxn(bonusAmpDistributor.updateLastDistributionTime(), "bonusAmpDistributor.updateLastDistributionTime")

  // const feeAmpTracker = await deployContract("RewardTracker", ["Staked + Bonus + Fee AMP", "sbfAMP"])
  const feeAmpTracker = await contractAt("RewardTracker", "0xb31018C29500a565e511a0800dA87e1457CdE9b1")

  // const feeAmpDistributor = await deployContract("RewardDistributor", [nativeToken.address, feeAmpTracker.address])
  const feeAmpDistributor = await contractAt("RewardDistributor", "0xd04EA0a03850786b7d057Ac668A3ab9B3E00199D")

  // await sendTxn(feeAmpTracker.initialize([bonusAmpTracker.address, bnAmp.address], feeAmpDistributor.address), "feeAmpTracker.initialize")
  // await sendTxn(feeAmpDistributor.updateLastDistributionTime(), "feeAmpDistributor.updateLastDistributionTime")

  // const feeAlpTracker = await deployContract("RewardTracker", ["Fee ALP", "fALP"])
  const feeAlpTracker = await contractAt("RewardTracker", "0x82b84dc1A46D43747496E62BBEE2c70Ef8EE4EAD")

  // const feeAlpDistributor = await deployContract("RewardDistributor", [nativeToken.address, feeAlpTracker.address])
  const feeAlpDistributor = await contractAt("RewardDistributor", "0x6445024BFA34a160714d0099D7F24f0b19Bb3C0c")

  // await sendTxn(feeAlpTracker.initialize([alp.address], feeAlpDistributor.address), "feeAlpTracker.initialize")
  // await sendTxn(feeAlpDistributor.updateLastDistributionTime(), "feeAlpDistributor.updateLastDistributionTime")

  // const stakedAlpTracker = await deployContract("RewardTracker", ["Fee + Staked ALP", "fsALP"])
  const stakedAlpTracker = await contractAt("RewardTracker", "0x8b498C45465f4a7e9CEc0D12Aa6a695A6b563A34")

  // const stakedAlpDistributor = await deployContract("RewardDistributor", [esAmp.address, stakedAlpTracker.address])
  const stakedAlpDistributor = await contractAt("RewardDistributor", "0x7ed80C511359db0E34e2FbF14aB12Ee9AfAB0Baa")
  // await sendTxn(stakedAlpTracker.initialize([feeAlpTracker.address], stakedAlpDistributor.address), "stakedAlpTracker.initialize")
  // await sendTxn(stakedAlpDistributor.updateLastDistributionTime(), "stakedAlpDistributor.updateLastDistributionTime")

  // await sendTxn(stakedAmpTracker.setInPrivateTransferMode(true), "stakedAmpTracker.setInPrivateTransferMode")
  // await sendTxn(stakedAmpTracker.setInPrivateStakingMode(true), "stakedAmpTracker.setInPrivateStakingMode")
  // await sendTxn(bonusAmpTracker.setInPrivateTransferMode(true), "bonusAmpTracker.setInPrivateTransferMode")
  // await sendTxn(bonusAmpTracker.setInPrivateStakingMode(true), "bonusAmpTracker.setInPrivateStakingMode")
  // await sendTxn(bonusAmpTracker.setInPrivateClaimingMode(true), "bonusAmpTracker.setInPrivateClaimingMode")
  // await sendTxn(feeAmpTracker.setInPrivateTransferMode(true), "feeAmpTracker.setInPrivateTransferMode")
  // await sendTxn(feeAmpTracker.setInPrivateStakingMode(true), "feeAmpTracker.setInPrivateStakingMode")

  // await sendTxn(feeAlpTracker.setInPrivateTransferMode(true), "feeAlpTracker.setInPrivateTransferMode")
  // await sendTxn(feeAlpTracker.setInPrivateStakingMode(true), "feeAlpTracker.setInPrivateStakingMode")
  // await sendTxn(stakedAlpTracker.setInPrivateTransferMode(true), "stakedAlpTracker.setInPrivateTransferMode")
  // await sendTxn(stakedAlpTracker.setInPrivateStakingMode(true), "stakedAlpTracker.setInPrivateStakingMode")

  // const ampVester = await deployContract("Vester", [
  //   "Vested AMP", // _name
  //   "vAMP", // _symbol
  //   vestingDuration, // _vestingDuration
  //   esAmp.address, // _esToken
  //   feeAmpTracker.address, // _pairToken
  //   amp.address, // _claimableToken
  //   stakedAmpTracker.address, // _rewardTracker
  // ])
  const ampVester = await contractAt("Vester", "0x957C9a17fc5A5Fda190D1Bc4Fc1AF2B6282C2743")
  //
  // const alpVester = await deployContract("Vester", [
  //   "Vested ALP", // _name
  //   "vALP", // _symbol
  //   vestingDuration, // _vestingDuration
  //   esAmp.address, // _esToken
  //   stakedAlpTracker.address, // _pairToken
  //   amp.address, // _claimableToken
  //   stakedAlpTracker.address, // _rewardTracker
  // ])
  const alpVester = await contractAt("Vester", "0xcf920DC4df556267A82783c4647cbe9Ce55cB1A2")
  // const rewardRouter = await deployContract("RewardRouterV2", [])
  const rewardRouter = await contractAt("RewardRouterV2", "0x0AB63435EbA15CCedb44d86Cf3e2f1d8DBeB9e08")

  // await sendTxn(rewardRouter.initialize(
  //   nativeToken.address,
  //   amp.address,
  //   esAmp.address,
  //   bnAmp.address,
  //   alp.address,
  //   stakedAmpTracker.address,
  //   bonusAmpTracker.address,
  //   feeAmpTracker.address,
  //   feeAlpTracker.address,
  //   stakedAlpTracker.address,
  //   alpManager.address,
  //   ampVester.address,
  //   alpVester.address
  // ), "rewardRouter.initialize")

  await sendTxn(alpManager.setHandler(rewardRouter.address, true), "alpManager.setHandler(rewardRouter)")
  await sleep(15000)
  // allow rewardRouter to stake in stakedAmpTracker
  await sendTxn(stakedAmpTracker.setHandler(rewardRouter.address, true), "stakedAmpTracker.setHandler(rewardRouter)")
  await sleep(15000)
  // allow bonusAmpTracker to stake stakedAmpTracker
  await sendTxn(stakedAmpTracker.setHandler(bonusAmpTracker.address, true), "stakedAmpTracker.setHandler(bonusAmpTracker)")
  await sleep(15000)
  // allow rewardRouter to stake in bonusAmpTracker
  await sendTxn(bonusAmpTracker.setHandler(rewardRouter.address, true), "bonusAmpTracker.setHandler(rewardRouter)")
  await sleep(15000)
  // allow bonusAmpTracker to stake feeAmpTracker
  await sendTxn(bonusAmpTracker.setHandler(feeAmpTracker.address, true), "bonusAmpTracker.setHandler(feeAmpTracker)")
  await sleep(15000)
  await sendTxn(bonusAmpDistributor.setBonusMultiplier(10000), "bonusAmpDistributor.setBonusMultiplier")
  await sleep(15000)
  // allow rewardRouter to stake in feeAmpTracker
  await sendTxn(feeAmpTracker.setHandler(rewardRouter.address, true), "feeAmpTracker.setHandler(rewardRouter)")
  await sleep(15000)
  // allow stakedAmpTracker to stake esAmp
  await sendTxn(esAmp.setHandler(stakedAmpTracker.address, true), "esAmp.setHandler(stakedAmpTracker)")
  await sleep(15000)
  // allow feeAmpTracker to stake bnAmp
  await sendTxn(bnAmp.setHandler(feeAmpTracker.address, true), "bnAmp.setHandler(feeAmpTracker")
  await sleep(15000)
  // allow rewardRouter to burn bnAmp
  await sendTxn(bnAmp.setMinter(rewardRouter.address, true), "bnAmp.setMinter(rewardRouter")
  await sleep(15000)

  // allow stakedAlpTracker to stake feeAlpTracker
  await sendTxn(feeAlpTracker.setHandler(stakedAlpTracker.address, true), "feeAlpTracker.setHandler(stakedAlpTracker)")
  await sleep(15000)
  // allow feeAlpTracker to stake alp
  await sendTxn(alp.setHandler(feeAlpTracker.address, true), "alp.setHandler(feeAlpTracker)")
  await sleep(15000)

  // allow rewardRouter to stake in feeAlpTracker
  await sendTxn(feeAlpTracker.setHandler(rewardRouter.address, true), "feeAlpTracker.setHandler(rewardRouter)")
  await sleep(15000)
  // allow rewardRouter to stake in stakedAlpTracker
  await sendTxn(stakedAlpTracker.setHandler(rewardRouter.address, true), "stakedAlpTracker.setHandler(rewardRouter)")
  await sleep(15000)

  await sendTxn(esAmp.setHandler(rewardRouter.address, true), "esAmp.setHandler(rewardRouter)")
  await sleep(15000)
  await sendTxn(esAmp.setHandler(stakedAmpDistributor.address, true), "esAmp.setHandler(stakedAmpDistributor)")
  await sleep(15000)
  await sendTxn(esAmp.setHandler(stakedAlpDistributor.address, true), "esAmp.setHandler(stakedAlpDistributor)")
  await sleep(15000)
  await sendTxn(esAmp.setHandler(stakedAlpTracker.address, true), "esAmp.setHandler(stakedAlpTracker)")
  await sleep(15000)
  await sendTxn(esAmp.setHandler(ampVester.address, true), "esAmp.setHandler(ampVester)")
  await sleep(15000)
  await sendTxn(esAmp.setHandler(alpVester.address, true), "esAmp.setHandler(alpVester)")
  await sleep(15000)

  await sendTxn(esAmp.setMinter(ampVester.address, true), "esAmp.setMinter(ampVester)")
  await sleep(15000)
  await sendTxn(esAmp.setMinter(alpVester.address, true), "esAmp.setMinter(alpVester)")
  await sleep(15000)

  await sendTxn(ampVester.setHandler(rewardRouter.address, true), "ampVester.setHandler(rewardRouter)")
  await sleep(15000)
  await sendTxn(alpVester.setHandler(rewardRouter.address, true), "alpVester.setHandler(rewardRouter)")
  await sleep(15000)

  await sendTxn(feeAmpTracker.setHandler(ampVester.address, true), "feeAmpTracker.setHandler(ampVester)")
  await sleep(15000)
  await sendTxn(stakedAlpTracker.setHandler(alpVester.address, true), "stakedAlpTracker.setHandler(alpVester)")
  await sleep(15000)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
