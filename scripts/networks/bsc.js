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
  syncDeployInfo("MultiSigner1", {
    name: "MultiSigner1",
    imple: "0x3F3d5a2d1117F404Bf561Ec3D13271017253043b",
  });
  syncDeployInfo("MultiSigner2", {
    name: "MultiSigner2",
    imple: "0x98EC3cFF51B7EDD07f1f281393755bd4e8798c87",
  });
  syncDeployInfo("MultiSigner3", {
    name: "MultiSigner3",
    imple: "0xA4D6E4e92572Ca2Ba6857F5f44Caf5Be21425b88",
  });
  syncDeployInfo("MultiSigner4", {
    name: "MultiSigner4",
    imple: "0x16866864a568B2dd42A19B638b3Ae808baaE54fC",
  });
  syncDeployInfo("MultiSigner5", {
    name: "MultiSigner5",
    imple: "0x1054D0B60Ea7Acb24044a2c0121b31baF54115a8",
  });
  syncDeployInfo("MultiSigner6", {
    name: "MultiSigner6",
    imple: "0xd3e03D9Ec6aEc5889f5A78f1D9447e3c0B241086",
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
