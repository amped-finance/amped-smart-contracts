const { deployContract, contractAt, sendTxn, writeTmpAddresses } = require("../shared/helpers")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('../core/tokens')[network];

async function main() {
  const { nativeToken } = tokens

  const vestingDuration = 365 * 24 * 60 * 60

  const alpManager = await contractAt("AlpManager", "0x7070FfdaF003318657D0fD5bBb2b1a07Fd94edA3")
  const alp = await contractAt("ALP", "0x42FA21d5a6a6864c183582EBbde73c41438aE35F")

  const amp = await contractAt("AMP", "0xb3b5ca0eF385198b277522FeebB238fF183280cC");
  const esAmp = await contractAt("EsAMP", "0xf56516DAdbceEAE207fddBDDd6B67611AbC67742");
  const bnAmp = await deployContract("MintableBaseToken", ["Bonus AMP", "bnAMP", 0]);
  // const bnAmp = await contractAt("MintableBaseToken", "0x8E2F2634d96068DB9B988743D24a760D50156fC1");

  await sendTxn(esAmp.setInPrivateTransferMode(true), "esAmp.setInPrivateTransferMode")
  await sendTxn(alp.setInPrivateTransferMode(true), "alp.setInPrivateTransferMode")

  const stakedAmpTracker = await deployContract("RewardTracker", ["Staked AMP", "sAMP"])
  const stakedAmpDistributor = await deployContract("RewardDistributor", [esAmp.address, stakedAmpTracker.address])
  // const stakedAmpTracker = await contractAt("RewardTracker", "0xbCCE1c2efDED06ee73183f8B20f03e452EF8495D");
  // const stakedAmpDistributor = await contractAt("RewardDistributor", "0xAf130bE896a5be983dda51a5944fA40D7157A857");
  await sendTxn(stakedAmpTracker.initialize([amp.address, esAmp.address], stakedAmpDistributor.address), "stakedAmpTracker.initialize")
  await sendTxn(stakedAmpDistributor.updateLastDistributionTime(), "stakedAmpDistributor.updateLastDistributionTime")

  const bonusAmpTracker = await deployContract("RewardTracker", ["Staked + Bonus AMP", "sbAMP"])
  const bonusAmpDistributor = await deployContract("BonusDistributor", [bnAmp.address, bonusAmpTracker.address])
  // const bonusAmpTracker = await contractAt("RewardTracker", "0x0Bbf7399092F6bDE8Cd6805dCd172E331CCc4c72");
  // const bonusAmpDistributor = await contractAt("BonusDistributor", "0x119f9030673A6d3906E2e5789045f51776c3a3A5");
  await sendTxn(bonusAmpTracker.initialize([stakedAmpTracker.address], bonusAmpDistributor.address), "bonusAmpTracker.initialize")
  await sendTxn(bonusAmpDistributor.updateLastDistributionTime(), "bonusAmpDistributor.updateLastDistributionTime")

  const feeAmpTracker = await deployContract("RewardTracker", ["Staked + Bonus + Fee AMP", "sbfAMP"])
  const feeAmpDistributor = await deployContract("RewardDistributor", [nativeToken.address, feeAmpTracker.address])
  // const feeAmpTracker = await contractAt("RewardTracker", "0xb90788e516cbEe5D88D7Bc4415dAde44A9A7f6ed");
  // const feeAmpDistributor = await contractAt("RewardDistributor", "0x9F01E9BA72b7aa99BB852cad096186BfCeb1Baf1");
  await sendTxn(feeAmpTracker.initialize([bonusAmpTracker.address, bnAmp.address], feeAmpDistributor.address), "feeAmpTracker.initialize")
  await sendTxn(feeAmpDistributor.updateLastDistributionTime(), "feeAmpDistributor.updateLastDistributionTime")

  const feeAlpTracker = await deployContract("RewardTracker", ["Fee ALP", "fALP"])
  const feeAlpDistributor = await deployContract("RewardDistributor", [nativeToken.address, feeAlpTracker.address])
  // const feeAlpTracker = await contractAt("RewardTracker", "0x5b1013DE235505DAA5C45B68eE1D151655bCeF1e");
  // const feeAlpDistributor = await contractAt("RewardDistributor", "0x4057f672aeEa2F71a0738F3a2de1Ad0F7498A685");
  await sendTxn(feeAlpTracker.initialize([alp.address], feeAlpDistributor.address), "feeAlpTracker.initialize")
  await sendTxn(feeAlpDistributor.updateLastDistributionTime(), "feeAlpDistributor.updateLastDistributionTime")

  const stakedAlpTracker = await deployContract("RewardTracker", ["Fee + Staked ALP", "fsALP"])
  const stakedAlpDistributor = await deployContract("RewardDistributor", [esAmp.address, stakedAlpTracker.address])
  // const stakedAlpTracker = await contractAt("RewardTracker", "0x9BAac9d7fc00D3A3aEAD18213E177Cf07e1B70e3");
  // const stakedAlpDistributor = await contractAt("RewardDistributor", "0x91fbBa651d128cD76153cdC97ecfAc0618f127FD");
  await sendTxn(stakedAlpTracker.initialize([feeAlpTracker.address], stakedAlpDistributor.address), "stakedAlpTracker.initialize")
  await sendTxn(stakedAlpDistributor.updateLastDistributionTime(), "stakedAlpDistributor.updateLastDistributionTime")

  await sendTxn(stakedAmpTracker.setInPrivateTransferMode(true), "stakedAmpTracker.setInPrivateTransferMode")
  await sendTxn(stakedAmpTracker.setInPrivateStakingMode(true), "stakedAmpTracker.setInPrivateStakingMode")
  await sendTxn(bonusAmpTracker.setInPrivateTransferMode(true), "bonusAmpTracker.setInPrivateTransferMode")
  await sendTxn(bonusAmpTracker.setInPrivateStakingMode(true), "bonusAmpTracker.setInPrivateStakingMode")
  await sendTxn(bonusAmpTracker.setInPrivateClaimingMode(true), "bonusAmpTracker.setInPrivateClaimingMode")
  await sendTxn(feeAmpTracker.setInPrivateTransferMode(true), "feeAmpTracker.setInPrivateTransferMode")
  await sendTxn(feeAmpTracker.setInPrivateStakingMode(true), "feeAmpTracker.setInPrivateStakingMode")

  await sendTxn(feeAlpTracker.setInPrivateTransferMode(true), "feeAlpTracker.setInPrivateTransferMode")
  await sendTxn(feeAlpTracker.setInPrivateStakingMode(true), "feeAlpTracker.setInPrivateStakingMode")
  await sendTxn(stakedAlpTracker.setInPrivateTransferMode(true), "stakedAlpTracker.setInPrivateTransferMode")
  await sendTxn(stakedAlpTracker.setInPrivateStakingMode(true), "stakedAlpTracker.setInPrivateStakingMode")

  console.log("ampVester = ", {
    _name: "Vested AMP", // _name
    _symbol: "vAMP", // _symbol
    _vestingDuration: vestingDuration, // _vestingDuration
    _esToken: esAmp.address, // _esToken
    _pairToken: feeAmpTracker.address, // _pairToken
    _claimableToken: amp.address, // _claimableToken
    _rewardTracker: stakedAmpTracker.address, // _rewardTracker
  })

  const ampVester = await deployContract("Vester", [{
    _name: "Vested AMP", // _name
    _symbol: "vAMP", // _symbol
    _vestingDuration: vestingDuration, // _vestingDuration
    _esToken: esAmp.address, // _esToken
    _pairToken: feeAmpTracker.address, // _pairToken
    _claimableToken: amp.address, // _claimableToken
    _rewardTracker: stakedAmpTracker.address, // _rewardTracker
  }
  ])
  // const ampVester = await contractAt("Vester", "0x5BbEa30Fe236d59E4c732F2d63c02ecB58f2088c");

  console.log("alpVester = ", {
    _name: "Vested ALP", // _name
    _symbol: "vALP", // _symbol
     _vestingDuration: vestingDuration, // _vestingDuration
     _esToken: esAmp.address, // _esToken
     _pairToken: stakedAlpTracker.address, // _pairToken
     _claimableToken: amp.address, // _claimableToken
     _rewardTracker: stakedAlpTracker.address, // _rewardTracker
  })

  const alpVester = await deployContract("Vester", [{
    _name: "Vested ALP", // _name
    _symbol: "vALP", // _symbol
     _vestingDuration: vestingDuration, // _vestingDuration
     _esToken: esAmp.address, // _esToken
     _pairToken: stakedAlpTracker.address, // _pairToken
     _claimableToken: amp.address, // _claimableToken
     _rewardTracker: stakedAlpTracker.address, // _rewardTracker
  }
  ])

  // const alpVester = await contractAt("Vester", "0x33f4cf97edBDCf1BBE9712ABA8E14788129E28D3");

  const rewardRouter = await deployContract("RewardRouterV2", [])
  // const rewardRouter = await contractAt("RewardRouterV2", "0xbB31eaD0682DD4C75587C0d72F3a69042aa34614");

  await sendTxn(rewardRouter.initialize({
    _weth: nativeToken.address,
    _amp: amp.address,
    _esAmp: esAmp.address,
    _bnAmp: bnAmp.address,
    _alp: alp.address,
    _stakedAmpTracker: stakedAmpTracker.address,
    _bonusAmpTracker: bonusAmpTracker.address,
    _feeAmpTracker: feeAmpTracker.address,
    _feeAlpTracker: feeAlpTracker.address,
    _stakedAlpTracker: stakedAlpTracker.address,
    _alpManager: alpManager.address,
    _ampVester: ampVester.address,
    _alpVester: alpVester.address
  }
  ), "rewardRouter.initialize")

  await sendTxn(alpManager.setHandler(rewardRouter.address, true), "alpManager.setHandler(rewardRouter)")

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

  // allow stakedAlpTracker to stake feeAlpTracker
  await sendTxn(feeAlpTracker.setHandler(stakedAlpTracker.address, true), "feeAlpTracker.setHandler(stakedAlpTracker)")
  // allow feeAlpTracker to stake alp
  await sendTxn(alp.setHandler(feeAlpTracker.address, true), "alp.setHandler(feeAlpTracker)")

  // allow rewardRouter to stake in feeAlpTracker
  await sendTxn(feeAlpTracker.setHandler(rewardRouter.address, true), "feeAlpTracker.setHandler(rewardRouter)")
  // allow rewardRouter to stake in stakedAlpTracker
  await sendTxn(stakedAlpTracker.setHandler(rewardRouter.address, true), "stakedAlpTracker.setHandler(rewardRouter)")

  await sendTxn(esAmp.setHandler(rewardRouter.address, true), "esAmp.setHandler(rewardRouter)")
  await sendTxn(esAmp.setHandler(stakedAmpDistributor.address, true), "esAmp.setHandler(stakedAmpDistributor)")
  await sendTxn(esAmp.setHandler(stakedAlpDistributor.address, true), "esAmp.setHandler(stakedAlpDistributor)")
  await sendTxn(esAmp.setHandler(stakedAlpTracker.address, true), "esAmp.setHandler(stakedAlpTracker)")
  await sendTxn(esAmp.setHandler(ampVester.address, true), "esAmp.setHandler(ampVester)")
  await sendTxn(esAmp.setHandler(alpVester.address, true), "esAmp.setHandler(alpVester)")

  await sendTxn(esAmp.setMinter(ampVester.address, true), "esAmp.setMinter(ampVester)")
  await sendTxn(esAmp.setMinter(alpVester.address, true), "esAmp.setMinter(alpVester)")

  await sendTxn(ampVester.setHandler(rewardRouter.address, true), "ampVester.setHandler(rewardRouter)")
  await sendTxn(alpVester.setHandler(rewardRouter.address, true), "alpVester.setHandler(rewardRouter)")

  await sendTxn(feeAmpTracker.setHandler(ampVester.address, true), "feeAmpTracker.setHandler(ampVester)")
  await sendTxn(stakedAlpTracker.setHandler(alpVester.address, true), "stakedAlpTracker.setHandler(alpVester)")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
