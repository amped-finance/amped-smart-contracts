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

async function deploy_sonic() {
  syncDeployInfo("usdc", {
    name: "usdc",
    imple: "0x29219dd400f2bf60e5a23d13be72b486d4038894",
  });
  syncDeployInfo("ws", {
    name: "ws",
    imple: "0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38",
  });
  syncDeployInfo("weth", {
    name: "weth",
    imple: "0x50c42deacd8fc9773493ed674b675be577f2634b",
  });
  syncDeployInfo("eurc", {
    name: "eurc",
    imple: "0xe715cbA7B5cCb33790ceBFF1436809d36cb17E57",
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
    imple: "0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38"
  });
  syncDeployInfo("GMX", {
    name: "GMX",
    imple: "0xAc611438AE5F3953DeDB47c2ea8d6650D601C1B4"
  });
  await deployMulticall()

  // await deployGMX()
  await deployVault()
  await deployVaultReader()
  await deployReader()
  await deployRewardReader()
  await deployTokens()
  await deployRewardRouterV2()
  await deployOrderBook()
  await deployOrderBookReader()
  await deployReferralStorage()
  await deployReferralReader()
  await deployTokenManager()
  await deployPriceFeedTimelock()
  await deployTimelock()
  await deployShortsTrackerTimelock()
  await deployPositionRouter()
  await deployPositionManager()
  await deployPriceFeed()
  await deployGlpRewardRouter()

  // await directPoolDeposit('1000000000000000000') // 1 WETH
  // await configureNewToken()

  console.log("gas used:", getGasUsed());
}

module.exports = { deploy_sonic };
