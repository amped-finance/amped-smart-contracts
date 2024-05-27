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

const deploy_core = async () => {
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
    imple: "0x0d03b4D62987A8A5BF74Bb71af4AEFb40947277c",
  });
  syncDeployInfo("MultiSigner2", {
    name: "MultiSigner2",
    imple: "0x04bbc9f5Af486c7DC183FfFa1FD5D3D3fe079142",
  });
  syncDeployInfo("MultiSigner3", {
    name: "MultiSigner3",
    imple: "0xb510D1E8409EF66eeBbd303c7465Db01a5528310",
  });
  syncDeployInfo("MultiSigner4", {
    name: "MultiSigner4",
    imple: "0x31Cae7c3bD207ff1d57fd08d2689E886f3e456e4",
  });
  syncDeployInfo("MultiSigner5", {
    name: "MultiSigner5",
    imple: "0x96958f157DCD4A7A63609a73D4eDA423BdB99070",
  });
  syncDeployInfo("MultiSigner6", {
    name: "MultiSigner6",
    imple: "0xF9939ffBe5Ec4997CAF5D6588d6F15F6416C9a04",
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

  console.log("gas used:", getGasUsed());

  // await directPoolDeposit('10000000000000000') // 1 WETH
  //  await configureNewToken()
};

module.exports = { deploy_core };
