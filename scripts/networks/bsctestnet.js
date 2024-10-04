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

const deploy_bsctestnet = async () => {
  syncDeployInfo("usdt", {
    name: "usdt",
    imple: "0x337610d27c682e347c9cd60bd4b3b107c9d34ddd",
  });
  syncDeployInfo("wbnb", {
    name: "wbnb",
    imple: "0x612777Eea37a44F7a95E3B101C39e1E2695fa6C2",
  });
  syncDeployInfo("eth", {
    name: "eth",
    imple: "0x1958f7C067226c7C8Ac310Dc994D0cebAbfb2B02",
  });
  syncDeployInfo("btc", {
    name: "btc",
    imple: "0xb19C12715134bee7c4b1Ca593ee9E430dABe7b56",
  });
  syncDeployInfo("MultiSigner1", {
    name: "MultiSigner1",
    imple: "0xB1A9056a5921C0F6f2C68Ce19E08cA9A6D5FD904",
  });
  syncDeployInfo("MultiSigner2", {
    name: "MultiSigner2",
    imple: "0xf17b5A7Fe677B705f6Dc27d6D2B0079e305dE78f",
  });
  syncDeployInfo("MultiSigner3", {
    name: "MultiSigner3",
    imple: "0x52E68B8187b3B9688fF4cfDF2526B908a1BF19A0",
  });
  syncDeployInfo("MultiSigner4", {
    name: "MultiSigner4",
    imple: "0x17A8132077eA63afa4c64E4fEF86C4ffc1e38548",
  });
  syncDeployInfo("MultiSigner5", {
    name: "MultiSigner5",
    imple: "0x989B2F4Ff4BB7F74f6642046fC0926a009a4bFCd",
  });
  syncDeployInfo("MultiSigner6", {
    name: "MultiSigner6",
    imple: "0xa9B8CeeE2b2F9404F61B21B34F8AEC144f53888f",
  });
  syncDeployInfo("nativeToken", {
    name: "nativeToken",
    imple: "0x612777Eea37a44F7a95E3B101C39e1E2695fa6C2"
  });
  await deployMulticall()

  await deployGMX()
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
};

module.exports = { deploy_bsctestnet };
