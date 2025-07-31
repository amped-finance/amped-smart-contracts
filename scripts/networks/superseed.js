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
const { getGasUsed, syncDeployInfo, getDeployFilteredInfo } = require("../shared/syncParams");
const deployPriceFeedExt = require("../core/deployPriceFeedExt");
const deployGlpRewardRouter = require("../staking/deployGlpRewardRouter");
const deployMulticall = require("../core/deployMulticall");
const directPoolDeposit = require("../core/directPoolDeposit");
// const configureNewToken = require("../peripherals/configureNewToken");

// Helper function to check deployment status and log
function shouldDeploy(contractName) {
  const deployedInfo = getDeployFilteredInfo(contractName);
  if (deployedInfo && deployedInfo.imple) {
    console.log(`${contractName} already deployed at ${deployedInfo.imple}, skipping.`);
    return false;
  }
  console.log(`Deploying ${contractName}...`);
  return true;
}

async function deploy_superseed() {
  // These syncDeployInfo calls just set up initial info, they don't deploy
  syncDeployInfo("weth", { name: "weth", imple: "0x4200000000000000000000000000000000000006" });
  syncDeployInfo("usdc", { name: "usdc", imple: "0xC316C8252B5F2176d0135Ebb0999E99296998F2e" });
  syncDeployInfo("ousdt", { name: "ousdt", imple: "0x1217BfE6c773EEC6cc4A38b5Dc45B92292B6E189" });
  syncDeployInfo("MultiSigner1", { name: "MultiSigner1", imple: "0x2d11e1732b706689125ffc2c15ca7f3c1d7b5bd4" });
  syncDeployInfo("MultiSigner2", { name: "MultiSigner2", imple: "0x6acf648627db9f517d1fdc98dc95d942f0292ae3" });
  syncDeployInfo("MultiSigner3", { name: "MultiSigner3", imple: "0x453af48d3f78716acf09c5e56e7c426a7a736917" });
  syncDeployInfo("MultiSigner4", { name: "MultiSigner4", imple: "0x3dd6a9744f7cbcff786a98779f8f9dae1ccaef33" });
  syncDeployInfo("MultiSigner5", { name: "MultiSigner5", imple: "0xda3daf395860851c6a6f050e0eb5d8d1f3347d61" });
  syncDeployInfo("MultiSigner6", { name: "MultiSigner6", imple: "0x012202764b1f9cb8db602895a79e90df15abd08c" });
  syncDeployInfo("nativeToken", { name: "nativeToken", imple: "0x4200000000000000000000000000000000000006" });

  // Wrap each deployment step in a check
  if (shouldDeploy("Multicall3")) await deployMulticall(); // Deploys Multicall3

  if (shouldDeploy("GMX")) await deployGMX();

  if (shouldDeploy("Vault")) await deployVault(); // Vault is the primary contract here

  if (shouldDeploy("VaultReader")) await deployVaultReader();

  if (shouldDeploy("Reader")) await deployReader();

  if (shouldDeploy("RewardReader")) await deployRewardReader();

  if (shouldDeploy("EsGMX")) await deployTokens(); // EsGMX is a key token deployed here

  if (shouldDeploy("RewardRouterV2")) await deployRewardRouterV2();

  if (shouldDeploy("OrderBook")) await deployOrderBook();

  if (shouldDeploy("OrderBookReader")) await deployOrderBookReader();

  if (shouldDeploy("ReferralStorage")) await deployReferralStorage();

  if (shouldDeploy("ReferralReader")) await deployReferralReader();

  if (shouldDeploy("TokenManager")) await deployTokenManager();

  if (shouldDeploy("PriceFeedTimelock")) await deployPriceFeedTimelock();

  if (shouldDeploy("Timelock")) await deployTimelock(); // Check for the main Timelock contract

  if (shouldDeploy("ShortsTrackerTimelock")) await deployShortsTrackerTimelock();

  if (shouldDeploy("PositionRouter")) await deployPositionRouter();

  if (shouldDeploy("PositionManager")) await deployPositionManager();

  if (shouldDeploy("PriceFeed")) await deployPriceFeed(); // Check for PriceFeed from core

  if (shouldDeploy("GlpRewardRouter")) await deployGlpRewardRouter();

  // Optional steps like directPoolDeposit and configureNewToken don't have single contract names to check easily
  // These would likely need to be run manually or skipped if the deployment is resumed midway.
  // await directPoolDeposit('1000000000000000000') // 1 WETH
  // await configureNewToken()

  console.log("Deployment script finished or resumed.");
  console.log("Total gas used:", getGasUsed());
}

module.exports = { deploy_superseed };
