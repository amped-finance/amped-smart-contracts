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
const deployGlpRewardRouter = require("../staking/deployGlpRewardRouter");
const deployMulticall = require("../core/deployMulticall");
const directPoolDeposit = require("../core/directPoolDeposit");
// const configureNewToken = require("../peripherals/configureNewToken");

async function deploy_pegasus(signer) {
  syncDeployInfo("usdt", {
    name: "usdt",
    imple: "0x057e8e2bC40ECff87e6F9b28750D5E7AC004Eab9",
  });
  syncDeployInfo("ll", {
    name: "ll",
    imple: "0xB0AAaa41170Ad29b00FC166E41dA3100D11EdF68",
  });
  syncDeployInfo("weth", {
    name: "weth",
    imple: "0xF42991f02C07AB66cFEa282E7E482382aEB85461",
  });
  syncDeployInfo("nativeToken", {
    name: "nativeToken",
    imple: "0xF42991f02C07AB66cFEa282E7E482382aEB85461",
  });
  syncDeployInfo("wbtc", {
    name: "wbtc",
    imple: "0x9Ee1Aa18F3FEB435f811d6AE2F71B7D2a4Adce0B",
  });
  syncDeployInfo("wsol", {
    name: "wsol",
    imple: "0xad45924555BE89f07019376Eeb4cB30e3D857cFd",
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

  console.log("gas used:", getGasUsed());

  // await directPoolDeposit('10000000000000000') // 1 WETH
  //  await configureNewToken()
}

module.exports = { deploy_pegasus };
