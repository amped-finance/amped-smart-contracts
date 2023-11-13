const { getFrameSigner, deployContract, contractAt, sendTxn } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")

async function main() {
  // const signer = await getFrameSigner()

  // const alpManager = await contractAt("AlpManager", "0x14fB4767dc9E10F96faaF37Ad24DE3E498cC344B")
  // await sendTxn(alpManager.setCooldownDuration(10 * 60), "alpManager.setCooldownDuration")
  // const amp = await contractAt("AMP", "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a", signer)
  // const esAmp = await contractAt("EsAMP", "0xf42Ae1D54fd613C9bb14810b0588FaAa09a426cA")

  // const stakedAmpTracker = await contractAt("RewardTracker", "0x908C4D94D34924765f1eDc22A1DD098397c59dD4")
  // await sendTxn(amp.approve(stakedAmpTracker.address, 0), "amp.approve(stakedAmpTracker)")

  // const rewardRouter = await contractAt("RewardRouter", "0x67b789D48c926006F5132BFCe4e976F0A7A63d5D")
  // await sendTxn(rewardRouter.stakeEsAmp(expandDecimals(1, 18)), "rewardRouter.stakeEsAmp")

  // const vaultPriceFeed = await contractAt("VaultPriceFeed", "0x30333ce00AC3025276927672aAeFd80f22E89E54")
  // await sendTxn(vaultPriceFeed.setPriceSampleSpace(2), "vaultPriceFeed.setPriceSampleSpace")

  const amp = await contractAt("AMP", "0x62edc0692BD897D2295872a9FFCac5425011c661")
  await sendTxn(amp.approve("0x62edc0692BD897D2295872a9FFCac5425011c661", 100, { nonce: 714 }), "amp.approve")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
