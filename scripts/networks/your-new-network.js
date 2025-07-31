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

async function deploy_your_new_network(signer) {
  // TODO: Update these addresses for your new network
  // These are the token addresses that need to exist on your target network
  syncDeployInfo("usdc", {
    name: "usdc",
    imple: "0x0000000000000000000000000000000000000000", // UPDATE: USDC address on new network
  });
  syncDeployInfo("weth", {
    name: "weth",
    imple: "0x0000000000000000000000000000000000000000", // UPDATE: WETH address on new network
  });
  syncDeployInfo("nativeToken", {
    name: "nativeToken",
    imple: "0x0000000000000000000000000000000000000000" // UPDATE: Native wrapped token address
  });
  
  // TODO: Update multisig addresses for your new network
  syncDeployInfo("MultiSigner1", {
    name: "MultiSigner1",
    imple: "0x0000000000000000000000000000000000000000", // UPDATE: Multisig signer 1
  });
  syncDeployInfo("MultiSigner2", {
    name: "MultiSigner2",
    imple: "0x0000000000000000000000000000000000000000", // UPDATE: Multisig signer 2
  });
  syncDeployInfo("MultiSigner3", {
    name: "MultiSigner3",
    imple: "0x0000000000000000000000000000000000000000", // UPDATE: Multisig signer 3
  });
  
  // TODO: If you have an existing AMP token, update this address
  syncDeployInfo("GMX", {
    name: "GMX",
    imple: "0x0000000000000000000000000000000000000000" // UPDATE: AMP token address or leave as 0x0 to deploy new
  });

  // Deploy core infrastructure
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
}

module.exports = { deploy_your_new_network }; 