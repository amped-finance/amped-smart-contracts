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

const deploy_bsc = async () => {
  syncDeployInfo("bscusd", {
    name: "bscusd",
    imple: "0x55d398326f99059ff775485246999027b3197955",
  });
  syncDeployInfo("wbnb", {
    name: "wbnb",
    imple: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
  });
  syncDeployInfo("cake", {
    name: "cake",
    imple: "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82",
  });
  syncDeployInfo("pepe", {
    name: "pepe",
    imple: "0x25d887ce7a35172c62febfd67a1856f20faebb00",
  });
  syncDeployInfo("floki", {
    name: "floki",
    imple: "0xfb5b838b6cfeedc2873ab27866079ac55363d37e",
  });
  syncDeployInfo("maga", {
    name: "maga",
    imple: "0x4ea98c1999575aaadfb38237dd015c5e773f75a2",
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
    imple: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
  });
  syncDeployInfo("GMX", {
    name: "GMX",
    imple: "0x16DF3d8978d17fE725Dc307aD14FdE3B12E6Da75"
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
};

module.exports = { deploy_bsc };
