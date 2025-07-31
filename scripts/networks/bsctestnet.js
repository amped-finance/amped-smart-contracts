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

async function deploy_bsctestnet(signer) {
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
    imple: "0x612777Eea37a44F7a95E3B101C39e1E2695fa6C2"
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

module.exports = { deploy_bsctestnet };
