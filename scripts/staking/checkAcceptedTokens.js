const { contractAt } = require("../shared/helpers");
const { ethers } = require("hardhat");

async function main() {
  console.log("Checking accepted tokens for ALP minting...");
  
  // Contract addresses
  const vaultAddress = "0xB91735aE255403B9ab9d97dF671a63807a89f08c"; // Fixed vault
  const glpManagerAddress = "0x4DE729B85dDB172F1bb775882f355bA25764E430";
  const vaultContractAddress = "0x5B8caae7cC6Ea61fb96Fd251C4Bc13e48749C7Da"; // Main vault from deploy-sonic.json
  
  const glpManager = await ethers.getContractAt("IGlpManager", glpManagerAddress);
  const vault = await ethers.getContractAt("IVault", vaultContractAddress);
  
  // Known token addresses on Sonic
  const tokens = {
    "USDC": "0x29219dd400f2bf60e5a23d13be72b486d4038894",
    "WS": "0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38",
    "stS": "0xE5DA20F15420aD15DE0fa650600aFc998bbE3955",
    "WETH": "0x50c42deacd8fc9773493ed674b675be577f2634b",
    "SHADOW": "0x3333b97138d4b086720b5ae8a7844b1345a33333",
    "ANON": "0x79bbf4508b1391af3a0f4b30bb5fc4aa9ab0e07c",
    "scUSD": "0xd3DCe716f3eF535C5Ff8d041c1A41C3bd89b97aE"
  };
  
  console.log("\n=== Checking Token Whitelist Status ===");
  
  for (const [name, address] of Object.entries(tokens)) {
    try {
      // Check if token is whitelisted in vault
      const isWhitelisted = await vault.whitelistedTokens(address);
      console.log(`\n${name} (${address}):`);
      console.log("- Whitelisted in Vault:", isWhitelisted);
      
      if (isWhitelisted) {
        // Get token info from vault
        const tokenDecimals = await vault.tokenDecimals(address);
        const tokenWeight = await vault.tokenWeights(address);
        const maxUsdgAmount = await vault.maxUsdgAmounts(address);
        const isStable = await vault.stableTokens(address);
        
        console.log("- Decimals:", tokenDecimals.toString());
        console.log("- Token Weight:", tokenWeight.toString());
        console.log("- Max USDG Amount:", ethers.utils.formatUnits(maxUsdgAmount, 30));
        console.log("- Is Stable:", isStable);
      }
    } catch (error) {
      console.log(`\n${name}: Error checking - ${error.message}`);
    }
  }
  
  console.log("\n=== Checking GlpManager Status ===");
  
  try {
    // Check cooldown duration
    const cooldownDuration = await glpManager.cooldownDuration();
    console.log("Cooldown duration:", cooldownDuration.toString(), "seconds");
    
  } catch (error) {
    console.log("Error checking GlpManager:", error.message);
  }
  
  console.log("\n=== Testing stS Specifically ===");
  
  try {
    const stSAddress = "0xE5DA20F15420aD15DE0fa650600aFc998bbE3955";
    
    // Check if we can query the token config
    const isWhitelisted = await vault.whitelistedTokens(stSAddress);
    console.log("stS whitelisted:", isWhitelisted);
    
    if (!isWhitelisted) {
      console.log("\n❌ stS is NOT whitelisted in the Vault!");
      console.log("This is why the deposit failed - the token needs to be whitelisted first.");
    }
    
  } catch (error) {
    console.log("Error checking stS:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });