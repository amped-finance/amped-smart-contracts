const { contractAt, sendTxn } = require("../shared/helpers")
const { getDeployFilteredInfo } = require("../shared/syncParams");

async function directPoolDeposit(amount) {
  // const router = await contractAt("Router", getDeployFilteredInfo("Router").imple)
  const router = await contractAt("Router", "0x6193459226a965D95593e0b181D25129a4f2c652")
  // const WETH = await contractAt("WETH", getDeployFilteredInfo("WETH").imple)
  const WETH = await contractAt("WETH", "0xF42991f02C07AB66cFEa282E7E482382aEB85461")
  
  await sendTxn(WETH.approve(router.address, amount), "router.approve")
  await sendTxn(router.directPoolDeposit(WETH.address, amount), "router.directPoolDeposit")
}

module.exports = directPoolDeposit
