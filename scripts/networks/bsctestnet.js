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
    imple: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd",
  });
  syncDeployInfo("wbnb", {
    name: "wbnb",
    imple: "0x612777Eea37a44F7a95E3B101C39e1E2695fa6C2",
  });
  syncDeployInfo("maga", {
    name: "maga",
    imple: "0x6cB798a28A7381E00dB35DF36E78FBdEE283DbC1",
  });
  syncDeployInfo("pepe", {
    name: "pepe",
    imple: "0x8aecbFbDd9BBe9370F6851B348d35F0583624fBe",
  });
  syncDeployInfo("floki", {
    name: "floki",
    imple: "0xa49A47C4864FEc0b498bCC4E082996a04Be55804",
  });
  syncDeployInfo("cake", {
    name: "cake",
    imple: "0x8d008B313C1d6C7fE2982F62d32Da7507cF43551",
  });
  syncDeployInfo("MultiSigner1", {
    name: "MultiSigner1",
    imple: "0x85a26bC8b81E8252e3714948d8BBf6ae8764e88A",
  });
  syncDeployInfo("MultiSigner2", {
    name: "MultiSigner2",
    imple: "0x4e32a10574321b7b16Ede27c04DabF8dfbE3AD0A",
  });
  syncDeployInfo("MultiSigner3", {
    name: "MultiSigner3",
    imple: "0xECAF2975993E5Eb86fc1fa0FFbC8e4116f075A4b",
  });
  syncDeployInfo("MultiSigner4", {
    name: "MultiSigner4",
    imple: "0x1A66DA217d84A73e646106A65550332d81d6cC68",
  });
  syncDeployInfo("MultiSigner5", {
    name: "MultiSigner5",
    imple: "0xa54BAB0C52f3b1bB688eDa06446A96AD6De509DB",
  });
  syncDeployInfo("MultiSigner6", {
    name: "MultiSigner6",
    imple: "0x8d3c366aA5594C25f592045D68896c5D8E145488",
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
