const { ethers } = require("hardhat");
const { contractAt } = require("../shared/helpers");
require("dotenv").config();

// Configuration
const COMPOUND_INTERVAL = process.env.COMPOUND_INTERVAL_HOURS || 1; // Default 1 hour
const YALP_VAULT_ADDRESS = process.env.YALP_VAULT_ADDRESS || "0x9A2A5864b906D734dCc2a352FF22046Fa5C8dD13";
const KEEPER_PRIVATE_KEY = process.env.KEEPER_PRIVATE_KEY;

// Logging with timestamps
function log(message, ...args) {
  console.log(`[${new Date().toISOString()}] ${message}`, ...args);
}

function logError(message, ...args) {
  console.error(`[${new Date().toISOString()}] ERROR: ${message}`, ...args);
}

async function checkAndCompound() {
  try {
    // Create wallet from private key
    const provider = ethers.provider;
    const keeper = new ethers.Wallet(KEEPER_PRIVATE_KEY, provider);
    
    log(`Keeper bot running with address: ${keeper.address}`);
    log(`yALP Vault: ${YALP_VAULT_ADDRESS}`);
    
    // Connect to vault contract
    const vault = await contractAt("YieldBearingALPVault", YALP_VAULT_ADDRESS);
    
    // Check if caller is authorized keeper
    const authorizedKeeper = await vault.keeper();
    if (keeper.address.toLowerCase() !== authorizedKeeper.toLowerCase()) {
      logError(`Wallet ${keeper.address} is not the authorized keeper. Authorized: ${authorizedKeeper}`);
      return false;
    }
    
    // Get WS token address
    const wsAddress = await vault.ws();
    const ws = await ethers.getContractAt("IERC20", wsAddress);
    
    // Check claimable rewards from reward trackers
    const rewardRouter = await ethers.getContractAt("IRewardRouterV2Extended", await vault.rewardRouter());
    const feeGlpTracker = await ethers.getContractAt("IRewardTracker", await rewardRouter.feeGlpTracker());
    const claimableWs = await feeGlpTracker.claimable(vault.address);
    
    log(`Claimable WS rewards: ${ethers.utils.formatEther(claimableWs)} WS`);
    
    // Get gas price
    const gasPrice = await provider.getGasPrice();
    log(`Current gas price: ${ethers.utils.formatUnits(gasPrice, "gwei")} gwei`);
    
    // Estimate gas for compound
    let estimatedGas;
    try {
      estimatedGas = await vault.connect(keeper).estimateGas.compound();
      log(`Estimated gas: ${estimatedGas.toString()}`);
    } catch (error) {
      logError("Failed to estimate gas:", error.message);
      return false;
    }
    
    // Calculate transaction cost
    const txCost = gasPrice.mul(estimatedGas);
    log(`Estimated transaction cost: ${ethers.utils.formatEther(txCost)} ETH`);
    
    // Check keeper balance
    const keeperBalance = await provider.getBalance(keeper.address);
    log(`Keeper balance: ${ethers.utils.formatEther(keeperBalance)} ETH`);
    
    if (keeperBalance.lt(txCost.mul(2))) { // Require 2x gas cost for safety
      logError(`Insufficient keeper balance. Required: ${ethers.utils.formatEther(txCost.mul(2))} ETH`);
      return false;
    }
    
    // Execute compound
    log("Executing compound transaction...");
    const tx = await vault.connect(keeper).compound({
      gasLimit: estimatedGas.mul(120).div(100), // 20% buffer
      gasPrice: gasPrice
    });
    
    log(`Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    
    if (receipt.status === 1) {
      log(`✅ Compound successful! Gas used: ${receipt.gasUsed.toString()}`);
      
      // Parse Compound event
      const compoundEvent = receipt.events?.find(e => e.event === "Compound");
      if (compoundEvent) {
        const [wsAmount, alpGained] = compoundEvent.args;
        log(`Compounded ${ethers.utils.formatEther(wsAmount)} WS into ${ethers.utils.formatEther(alpGained)} ALP`);
      }
      
      return true;
    } else {
      logError("Transaction failed!");
      return false;
    }
    
  } catch (error) {
    logError("Compound failed:", error.message);
    if (error.data) {
      logError("Error data:", error.data);
    }
    return false;
  }
}

async function runKeeper() {
  if (!KEEPER_PRIVATE_KEY) {
    logError("KEEPER_PRIVATE_KEY not set in environment");
    process.exit(1);
  }
  
  log("=== yALP Keeper Bot Started ===");
  log(`Compound interval: ${COMPOUND_INTERVAL} hours`);
  log(`Vault address: ${YALP_VAULT_ADDRESS}`);
  
  // Initial compound attempt
  await checkAndCompound();
  
  // Set up interval
  const intervalMs = COMPOUND_INTERVAL * 60 * 60 * 1000; // Convert hours to milliseconds
  setInterval(async () => {
    log("\n=== Running scheduled compound check ===");
    await checkAndCompound();
  }, intervalMs);
  
  // Keep process alive
  process.on('SIGINT', () => {
    log("Keeper bot shutting down...");
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    log("Keeper bot shutting down...");
    process.exit(0);
  });
}

// Run the keeper
runKeeper().catch(error => {
  logError("Fatal error:", error);
  process.exit(1);
});