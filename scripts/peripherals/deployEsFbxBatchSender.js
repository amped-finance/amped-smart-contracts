const { getFrameSigner, deployContract, contractAt, sendTxn } = require("../shared/helpers")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');

async function getArbValues() {
  const signer = await getFrameSigner()

  const esAmp = await contractAt("EsAMP", "0xf42Ae1D54fd613C9bb14810b0588FaAa09a426cA")
  const esAmpGov = await contractAt("Timelock", await esAmp.gov(), signer)
  const ampVester = await contractAt("Vester", "0x199070DDfd1CFb69173aa2F7e20906F26B363004")
  const ampVesterGov = await contractAt("Timelock", await ampVester.gov(), signer)
  const alpVester = await contractAt("Vester", "0xA75287d2f8b217273E7FCD7E86eF07D33972042E")
  const alpVesterGov = await contractAt("Timelock", await alpVester.gov(), signer)

  return { esAmp, esAmpGov, ampVester, ampVesterGov, alpVester, alpVesterGov }
}

async function getAvaxValues() {
  const signer = await getFrameSigner()

  const esAmp = await contractAt("EsAMP", "0xFf1489227BbAAC61a9209A08929E4c2a526DdD17")
  const esAmpGov = await contractAt("Timelock", await esAmp.gov(), signer)
  const ampVester = await contractAt("Vester", "0x472361d3cA5F49c8E633FB50385BfaD1e018b445")
  const ampVesterGov = await contractAt("Timelock", await ampVester.gov(), signer)
  const alpVester = await contractAt("Vester", "0x62331A7Bd1dfB3A7642B7db50B5509E57CA3154A")
  const alpVesterGov = await contractAt("Timelock", await alpVester.gov(), signer)

  return { esAmp, esAmpGov, ampVester, ampVesterGov, alpVester, alpVesterGov }
}

async function main() {
  const method = network === "arbitrum" ? getArbValues : getAvaxValues
  const { esAmp, esAmpGov, ampVester, ampVesterGov, alpVester, alpVesterGov } = await method()

  const esAmpBatchSender = await deployContract("EsAmpBatchSender", [esAmp.address])

  console.log("esAmp", esAmp.address)
  console.log("esAmpGov", esAmpGov.address)
  console.log("ampVester", ampVester.address)
  console.log("ampVesterGov", ampVesterGov.address)
  console.log("alpVester", alpVester.address)
  console.log("alpVesterGov", alpVesterGov.address)

  await sendTxn(esAmpGov.signalSetHandler(esAmp.address, esAmpBatchSender.address, true), "esAmpGov.signalSetHandler")
  await sendTxn(ampVesterGov.signalSetHandler(ampVester.address, esAmpBatchSender.address, true), "ampVesterGov.signalSetHandler")
  await sendTxn(alpVesterGov.signalSetHandler(alpVester.address, esAmpBatchSender.address, true), "alpVesterGov.signalSetHandler")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
