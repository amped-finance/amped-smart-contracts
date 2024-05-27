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
const configureNewToken = require("../peripherals/configureNewToken");

const deploy_bsctestnet = async () => {
  // syncDeployInfo("USDT", {
  //   name: "USDT",
  //   imple: "0x81bCEa03678D1CEF4830942227720D542Aa15817",
  // });
  // syncDeployInfo("MultiSigner1", {
  //   name: "MultiSigner1",
  //   imple: "0xdfAf8d7a9A71736f7516eeE20C54a25AA7201D2e",
  // });
  // syncDeployInfo("MultiSigner2", {
  //   name: "MultiSigner2",
  //   imple: "0xaff1a4950b91d742c180718c39ca61125112d985",
  // });
  // syncDeployInfo("MultiSigner3", {
  //   name: "MultiSigner3",
  //   imple: "0x7aF25b297FA77cE14b03Bf710216C6355e9cB57a",
  // });
  // syncDeployInfo("MultiSigner4", {
  //   name: "MultiSigner4",
  //   imple: "0x02B5d223eB5fB990Aa83Ff1F7098abD9887d40a9",
  // });
  // syncDeployInfo("MultiSigner5", {
  //   name: "MultiSigner5",
  //   imple: "0xa34153725cB218c30996f05E2F7A1ec0f495192E",
  // });
  // syncDeployInfo("MultiSigner6", {
  //   name: "MultiSigner6",
  //   imple: "0xCf58ED19ccdB5f52ADDaFa6F46443be8A1E160F8",
  // });
  // syncDeployInfo("WETH", {
  //   name: "WETH",
  //   imple: "0x191E94fa59739e188dcE837F7f6978d84727AD01",
  // });
  // await deployMulticall()
  // await deployPriceFeedExt()

  // await deployGMX()
  // await deployVault()
  // await deployVaultReader()
  // await deployReader()
  // await deployRewardReader()
  // await deployTokens()
  // await deployRewardRouterV2()
  // await deployOrderBook()
  // await deployOrderBookReader()
  // await deployReferralStorage()
  // await deployReferralReader()
  // await deployTokenManager()
  // await deployPriceFeedTimelock()
  // await deployTimelock()
  // await deployShortsTrackerTimelock()
  // await deployPositionRouter()
  // await deployPositionManager()
  // await deployPriceFeed()
  // await deployGlpRewardRouter()

  // await directPoolDeposit('1000000000000000000') // 1 WETH
  // await configureNewToken()

  console.log("gas used:", getGasUsed());
};

module.exports = { deploy_bsctestnet };
