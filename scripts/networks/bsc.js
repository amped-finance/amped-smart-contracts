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
    imple: "0xAc29aCc26F0E1A256C1870F75e3308a05C045C58",
  });
  syncDeployInfo("MultiSigner2", {
    name: "MultiSigner2",
    imple: "0x9F82E96D983011Df21bF642C0C34daDD820666b2",
  });
  syncDeployInfo("MultiSigner3", {
    name: "MultiSigner3",
    imple: "0x7C669A39c6c6c3096b955cbdedf113A3B73c19C3",
  });
  syncDeployInfo("MultiSigner4", {
    name: "MultiSigner4",
    imple: "0x99692AeF1eC9FBCC09F9C5bD2640d8d1235e7995",
  });
  syncDeployInfo("MultiSigner5", {
    name: "MultiSigner5",
    imple: "0x502aC525a1a0f57c4b5327712abb67b1F605C9E7",
  });
  syncDeployInfo("MultiSigner6", {
    name: "MultiSigner6",
    imple: "0x51aa1BE4E624c3A2C80807300A0000aCFf4Ec917",
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
