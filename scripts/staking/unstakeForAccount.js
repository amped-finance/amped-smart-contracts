const { deployContract, contractAt, sendTxn } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")

async function main() {
  const wallet = { address: "0x5F799f365Fa8A2B60ac0429C48B153cA5a6f0Cf8" }

  const account = "0x6eA748d14f28778495A3fBa3550a6CdfBbE555f9"
  const unstakeAmount = "79170000000000000000"

  const rewardRouter = await contractAt("RewardRouter", "0x1b8911995ee36F4F95311D1D9C1845fA18c56Ec6")
  const amp = await contractAt("AMP", "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a");
  const bnAmp = await contractAt("MintableBaseToken", "0x35247165119B69A40edD5304969560D0ef486921");
  const stakedAmpTracker = await contractAt("RewardTracker", "0x908C4D94D34924765f1eDc22A1DD098397c59dD4")
  const bonusAmpTracker = await contractAt("RewardTracker", "0x4d268a7d4C16ceB5a606c173Bd974984343fea13")
  const feeAmpTracker = await contractAt("RewardTracker", "0xd2D1162512F927a7e282Ef43a362659E4F2a728F")

  // const gasLimit = 30000000

  // await sendTxn(feeAmpTracker.setHandler(wallet.address, true, { gasLimit }), "feeAmpTracker.setHandler")
  // await sendTxn(bonusAmpTracker.setHandler(wallet.address, true, { gasLimit }), "bonusAmpTracker.setHandler")
  // await sendTxn(stakedAmpTracker.setHandler(wallet.address, true, { gasLimit }), "stakedAmpTracker.setHandler")

  const stakedAmount = await stakedAmpTracker.stakedAmounts(account)
  console.log(`${account} staked: ${stakedAmount.toString()}`)
  console.log(`unstakeAmount: ${unstakeAmount.toString()}`)

  await sendTxn(feeAmpTracker.unstakeForAccount(account, bonusAmpTracker.address, unstakeAmount, account), "feeAmpTracker.unstakeForAccount")
  await sendTxn(bonusAmpTracker.unstakeForAccount(account, stakedAmpTracker.address, unstakeAmount, account), "bonusAmpTracker.unstakeForAccount")
  await sendTxn(stakedAmpTracker.unstakeForAccount(account, amp.address, unstakeAmount, account), "stakedAmpTracker.unstakeForAccount")

  await sendTxn(bonusAmpTracker.claimForAccount(account, account), "bonusAmpTracker.claimForAccount")

  const bnAmpAmount = await bnAmp.balanceOf(account)
  console.log(`bnAmpAmount: ${bnAmpAmount.toString()}`)

  await sendTxn(feeAmpTracker.stakeForAccount(account, account, bnAmp.address, bnAmpAmount), "feeAmpTracker.stakeForAccount")

  const stakedBnAmp = await feeAmpTracker.depositBalances(account, bnAmp.address)
  console.log(`stakedBnAmp: ${stakedBnAmp.toString()}`)

  const reductionAmount = stakedBnAmp.mul(unstakeAmount).div(stakedAmount)
  console.log(`reductionAmount: ${reductionAmount.toString()}`)
  await sendTxn(feeAmpTracker.unstakeForAccount(account, bnAmp.address, reductionAmount, account), "feeAmpTracker.unstakeForAccount")
  await sendTxn(bnAmp.burn(account, reductionAmount), "bnAmp.burn")

  const ampAmount = await amp.balanceOf(account)
  console.log(`ampAmount: ${ampAmount.toString()}`)

  await sendTxn(amp.burn(account, unstakeAmount), "amp.burn")
  const nextAmpAmount = await amp.balanceOf(account)
  console.log(`nextAmpAmount: ${nextAmpAmount.toString()}`)

  const nextStakedAmount = await stakedAmpTracker.stakedAmounts(account)
  console.log(`nextStakedAmount: ${nextStakedAmount.toString()}`)

  const nextStakedBnAmp = await feeAmpTracker.depositBalances(account, bnAmp.address)
  console.log(`nextStakedBnAmp: ${nextStakedBnAmp.toString()}`)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
