const { contractAt, sendTxn, getFrameSigner } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const hre = require("hardhat");
const { ethers } = hre;
const { JsonRpcProvider } = ethers.providers;
const baseDeployments = require("../../scripts/deploy-base.json");

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];

// Convenience wrappers that inject signer
function withSigner(signer) {
  return {
    contractAt: (name, address, options) => contractAt(name, address, signer, options),
    sendTxn: (txPromise, label) => sendTxn(txPromise, label, signer)
  };
}

// time check to avoid invalid fee withdrawals
const time = Math.floor(Date.now() / 1000) // Current timestamp in seconds

if (Date.now() / 1000 > time + 10 * 60) {
  throw new Error("invalid time")
}

async function withdrawFeesBsc(signer) {
  const { contractAt, sendTxn } = withSigner(signer);
  const receiver = { address: "0x9f169c2189A2d975C18965DE985936361b4a9De9" }
  const vault = await contractAt("Vault", "0xc73A8DcAc88498FD4b4B1b2AaA37b0a2614Ff67B")
  const gov = await contractAt("Timelock", "0x58d6e1675232496226d074502d0c2df383fa0cbe")
  const balanceUpdater = await contractAt("BalanceUpdater", "0x912F4db2076079718D3b3A3Ab21F5Af22Bd1EDd3")
  const usdg = await contractAt("Token", "0x85E76cbf4893c1fbcB34dCF1239A91CE2A4CF5a7")

  const btc = { address: "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c" }
  const eth = { address: "0x2170ed0880ac9a755fd29b2688956bd959f933f8" }
  const bnb = { address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c" }
  const busd = { address: "0xe9e7cea3dedca5984780bafc599bd69add087d56" }
  const usdc = { address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d" }
  const usdt = { address: "0x55d398326f99059fF775485246999027B3197955" }

  const tokens = [btc, eth, bnb, busd, usdc, usdt]

  await sendTxn(gov.batchWithdrawFees(vault.address, tokens.map(t => t.address)), `gov.batchWithdrawFees`)
}

async function withdrawFeesArb(signer) {
  const { contractAt, sendTxn } = withSigner(signer);
  const receiver = { address: "0x49B373D422BdA4C6BfCdd5eC1E48A9a26fdA2F8b" }
  const vault = await contractAt("Vault", "0x489ee077994B6658eAfA855C308275EAd8097C4A")
  const gov = await contractAt("Timelock", await vault.gov())
  const { btc, eth, usdc, link, uni, usdt, mim, frax, dai } = tokens

  const tokenArr = [btc, eth, usdc, link, uni, usdt, frax, dai]

  await sendTxn(gov.batchWithdrawFees(vault.address, tokenArr.map(t => t.address)), `gov.batchWithdrawFees`)
}

async function withdrawFeesAvax(signer) {
  const { contractAt, sendTxn } = withSigner(signer);
  const receiver = { address: "0x49B373D422BdA4C6BfCdd5eC1E48A9a26fdA2F8b" }
  const vault = await contractAt("Vault", "0x9ab2De34A33fB459b538c43f251eB825645e8595")
  const gov = await contractAt("Timelock", await vault.gov())
  const { avax, btc, btcb, eth, mim, usdce, usdc } = tokens

  const tokenArr = [avax, btc, btcb, eth, usdce, usdc]

  await sendTxn(gov.batchWithdrawFees(vault.address, tokenArr.map(t => t.address)), `gov.batchWithdrawFees`)
}

async function withdrawFeesLightlink(signer) {
  const { contractAt, sendTxn } = withSigner(signer);
  const receiver = { address: "0x254081ACC3c468cc7020A6A0264626c1A9103CEF" }
  const vault = await contractAt("Vault", "0xa6b88069EDC7a0C2F062226743C8985FF72bB2Eb")
  const gov = await contractAt("Timelock", "0x585693AedB4c18424ED7cCd13589c048BdE00785")

  const usdt = { address: "0x6308fa9545126237158778e74AE1b6b89022C5c0" }
  const usdc = { address: "0x18fB38404DADeE1727Be4b805c5b242B5413Fa40" }
  const usdtsg = { address: "0x808d7c71ad2ba3FA531b068a2417C63106BC0949" }
  const usdcsg = { address: "0xbCF8C1B03bBDDA88D579330BDF236B58F8bb2cFd" }
  const ll = { address: "0xd9d7123552fA2bEdB2348bB562576D67f6E8e96E" }
  const wbnb = { address: "0x81A1f39f7394c4849E4261Aa02AaC73865d13774" }
  const weth = { address: "0x7EbeF2A4b1B09381Ec5B9dF8C5c6f2dBECA59c73" }
  const wbtc = { address: "0x46A5e3Fa4a02B9Ae43D9dF9408C86eD643144A67" }
  const shadow = { address: "0x3333b97138d4b086720b5ae8a7844b1345a33333" }

  const tokenArr = [usdt, usdc, usdtsg, usdcsg, ll, wbnb, weth, wbtc, shadow]

  await sendTxn(gov.batchWithdrawFees(vault.address, tokenArr.map(t => t.address)), `gov.batchWithdrawFees`)
}

async function withdrawFeesSonic(signer) {
  const { contractAt, sendTxn } = withSigner(signer);
  const receiver = { address: "0xd99C871c8130B03C8BB597A74fb5EAA7a46864Bb" }
  const vault = await contractAt("Vault", "0x5B8caae7cC6Ea61fb96Fd251C4Bc13e48749C7Da")
  const gov = await contractAt("Timelock", "0xE97055C9087458434bf95dedA69531408cC210b5")

  const usdc = { address: "0x29219dd400f2bf60e5a23d13be72b486d4038894" }
  const ws = { address: "0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38" }
  const weth = { address: "0x50c42deacd8fc9773493ed674b675be577f2634b" }
  const anon = { address: "0x79bbf4508b1391af3a0f4b30bb5fc4aa9ab0e07c" }
  const sts = { address: "0xE5DA20F15420aD15DE0fa650600aFc998bbE3955" }
  const scusd = { address: "0xd3DCe716f3eF535C5Ff8d041c1A41C3bd89b97aE" }
  const shadow = { address: "0x3333b97138d4b086720b5ae8a7844b1345a33333" }

  const tokenArr = [usdc, ws, weth, anon, sts, scusd, shadow]

  await sendTxn(gov.batchWithdrawFees(vault.address, tokenArr.map(t => t.address)), `gov.batchWithdrawFees`)
}

async function withdrawFeesBerachain(signer) {
  const { contractAt, sendTxn } = withSigner(signer);
  const receiver = { address: "0xcD413cC5EC244b5B04c210cA70b0B4a16b563e0E" }
  const vault = await contractAt("Vault", "0xc3727b7E7F3FF97A111c92d3eE05529dA7BD2f48")
  const gov = await contractAt("Timelock", "0xfCE9Fb0Fd92d6A19b1ee1CcaEb9d0480617E726e")

  const wbera = { address: "0x6969696969696969696969696969696969696969" }
  const honey = { address: "0xfcbd14dc51f0a4d49d5e53c2e0950e0bc26d0dce" }
  const weth = { address: "0x2f6f07cdcf3588944bf4c42ac74ff24bf56e7590" }
  const usdc = { address: "0x549943e04f40284185054145c6e4e9568c1d3241" }
  
  const tokenArr = [usdc, wbera, honey, weth]

  await sendTxn(gov.batchWithdrawFees(vault.address, tokenArr.map(t => t.address)), `gov.batchWithdrawFees`)
}

async function withdrawFeesBase(signer) {
  const { contractAt, sendTxn } = withSigner(signer);
  const receiver = { address: "0xd99C871c8130B03C8BB597A74fb5EAA7a46864Bb" };
  const vaultAddr = "0xed33E4767B8d68bd7F64c429Ce4989686426a926";
  const timelockAddr = baseDeployments.find(x => x.name === "Timelock").imple;
  const vault = await contractAt("Vault", vaultAddr);
  const gov = await contractAt("Timelock", timelockAddr);

  const { usdc, weth, cbbtc } = tokens;
  const tokenArr = [usdc, weth, cbbtc];

  await sendTxn(gov.batchWithdrawFees(vault.address, tokenArr.map(t => t.address)), `[Base] gov.batchWithdrawFees`);
  console.log(`[Base] Batch fee withdrawal transaction sent.`);
}

async function withdrawFeesSuperseed(signer) {
  const { contractAt, sendTxn } = withSigner(signer);
  const receiver = { address: "0xd99C871c8130B03C8BB597A74fb5EAA7a46864Bb" }; // Use same as base/sonic for now
  const vaultAddr = "0x7f27Ce4B02b51Ea3a433eD130259F8A173F7c6C7"; // from deploy-superseed.json
  const timelockAddr = "0xD4A870592B6A29f3904D1a3077AD47ED11d01400"; // from deploy-superseed.json
  const vault = await contractAt("Vault", vaultAddr);
  const gov = await contractAt("Timelock", timelockAddr);

  const { weth, usdc, ousdt } = tokens;
  const tokenArr = [weth, usdc, ousdt];

  // EIP-1559 gas overrides for superseed network
  const gasOverrides = {
    maxPriorityFeePerGas: ethers.BigNumber.from("1100000"), // 0.0011 gwei
    maxFeePerGas: ethers.utils.parseUnits("10", "gwei")    // 10 gwei
  };

  await sendTxn(
    gov.batchWithdrawFees(vault.address, tokenArr.map(t => t.address), gasOverrides),
    `[Superseed] gov.batchWithdrawFees`
  );
  console.log(`[Superseed] Batch fee withdrawal transaction sent.`);
}

async function main() {
  const signer = await getFrameSigner();

  if (network === "bsc") {
    await withdrawFeesBsc(signer)
    return
  }

  if (network === "avax") {
    await withdrawFeesAvax(signer)
    return
  }

  if (network === "phoenix") {
    await withdrawFeesLightlink(signer)
    return
  }

  if (network === "sonic") {
    await withdrawFeesSonic(signer)
    return
  }

  if (network === "berachain") {
    await withdrawFeesBerachain(signer)
    return
  }

  if (network === "base") {
    await withdrawFeesBase(signer);
    return;
  }

  if (network === "superseed") {
    await withdrawFeesSuperseed(signer);
    return;
  }

  await withdrawFeesArb(signer)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
