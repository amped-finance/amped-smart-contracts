const deployTokenManager = require("../access/deployTokenManager");
const deployOrderBook = require("../core/deployOrderBook");
const deployPositionManager = require("../core/deployPositionManager");
const deployPositionRouter = require("../core/deployPositionRouter");
const deployReferralReader = require("../core/deployReferralReader");
const deployReferralStorage = require("../core/deployReferralStorage");
const deployVault = require("../core/deployVault");
const deployGMX = require("../gmx/deployGMX");
const deployTokens = require("../gmx/deployTokens");
const deployOrderBookReader = require("../peripherals/deployOrderBookReader");
const deployPriceFeedTimelock = require("../peripherals/deployPriceFeedTimelock");
const deployReader = require("../peripherals/deployReader");
const deployRewardReader = require("../peripherals/deployRewardReader");
const deployShortsTrackerTimelock = require("../peripherals/deployShortsTrackerTimelock");
const deployTimelock = require("../peripherals/deployTimelock");
const deployVaultReader = require("../peripherals/deployVaultReader");
const deployRewardRouterV2 = require("../staking/deployRewardRouterV2");
const deployPriceFeed = require("../core/deployPriceFeed");
const { getGasUsed, syncDeployInfo } = require("../shared/syncParams");
const deployPriceFeedExt = require("../core/deployPriceFeedExt");
const deployGlpRewardRouter = require("../staking/deployGlpRewardRouter");
const deployMulticall = require("../core/deployMulticall");
const directPoolDeposit = require("../core/directPoolDeposit");
// const configureNewToken = require("../peripherals/configureNewToken");

async function deploy_berachain(signer) {
  syncDeployInfo("honey", {
    name: "honey",
    imple: "0xfcbd14dc51f0a4d49d5e53c2e0950e0bc26d0dce",
  });
  syncDeployInfo("wbera", {
    name: "wbera",
    imple: "0x6969696969696969696969696969696969696969",
  });
  syncDeployInfo("weth", {
    name: "weth",
    imple: "0x2f6f07cdcf3588944bf4c42ac74ff24bf56e7590",
  });
  syncDeployInfo("usdc", {
    name: "usdc",
    imple: "0x549943e04f40284185054145c6e4e9568c1d3241",
  });
  syncDeployInfo("MultiSigner1", {
    name: "MultiSigner1",
    imple: "0xd795C3E9DccA7d3Fe9A6C9149e756cE06ed5e380",
  });
  syncDeployInfo("MultiSigner2", {
    name: "MultiSigner2",
    imple: "0x2390b12FA119d0D10cd97C64e76DA986B4E8394c",
  });
  syncDeployInfo("MultiSigner3", {
    name: "MultiSigner3",
    imple: "0x17595cF7879Af4156BbbbA9EF6231f73C5d44810",
  });
  syncDeployInfo("MultiSigner4", {
    name: "MultiSigner4",
    imple: "0x7e8B7cfADc33C6a54FAeFA59a23d8a9149f1515f",
  });
  syncDeployInfo("MultiSigner5", {
    name: "MultiSigner5",
    imple: "0x62c706D06865D6D26905A2c3495dF280755FCfa0",
  });
  syncDeployInfo("MultiSigner6", {
    name: "MultiSigner6",
    imple: "0x7Fac2B2784523ef7Ddba64C97D611E3779d3291D",
  });
  syncDeployInfo("nativeToken", {
    name: "nativeToken",
    imple: "0x6969696969696969696969696969696969696969"
  });
  syncDeployInfo("GMX", {
    name: "GMX",
    imple: "0xAc611438AE5F3953DeDB47c2ea8d6650D601C1B4"
  });
  await deployMulticall()

  await deployGMX(signer)
  await deployVault(signer)
  await deployVaultReader(signer)
  await deployReader(signer)
  await deployRewardReader(signer)
  await deployTokens(signer)
  await deployRewardRouterV2(signer)
  await deployOrderBook(signer)
  await deployOrderBookReader(signer)
  await deployReferralStorage(signer)
  await deployReferralReader(signer)
  await deployTokenManager(signer)
  await deployPriceFeedTimelock(signer)
  await deployTimelock(signer)
  await deployShortsTrackerTimelock(signer)
  await deployPositionRouter(signer)
  await deployPositionManager(signer)
  await deployPriceFeed(signer)
  await deployGlpRewardRouter(signer)

  // await directPoolDeposit('1000000000000000000') // 1 WETH
  // await configureNewToken()

  console.log("gas used:", getGasUsed());
}

module.exports = { deploy_berachain };
