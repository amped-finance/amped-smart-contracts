const { contractAt } = require("../shared/helpers");
const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Interacting with yALP vault using account:", signer.address);
  
  // Replace with your deployed vault address
  const YALP_VAULT = process.env.YALP_VAULT_ADDRESS || "YOUR_VAULT_ADDRESS_HERE";
  
  if (YALP_VAULT === "YOUR_VAULT_ADDRESS_HERE") {
    console.log("❌ Error: Please set YALP_VAULT_ADDRESS environment variable");
    console.log("Example: YALP_VAULT_ADDRESS=0x... npx hardhat run scripts/staking/exampleYALPInteractions.js");
    return;
  }
  
  // Get contract instances
  const vault = await contractAt("YieldBearingALPVault", YALP_VAULT);
  const wethAddress = await vault.weth();
  const weth = await contractAt("IWETH", wethAddress);
  
  console.log("\n=== Reading Vault Information ===");
  
  // Basic vault info
  console.log("Vault address:", YALP_VAULT);
  console.log("Vault name:", await vault.name());
  console.log("Vault symbol:", await vault.symbol());
  console.log("Vault decimals:", await vault.decimals());
  console.log("WETH address:", wethAddress);
  
  // Vault state
  const totalSupply = await vault.totalSupply();
  const totalAssets = await vault.totalAssets();
  console.log("\nTotal yALP supply:", ethers.utils.formatEther(totalSupply));
  console.log("Total fsALP managed:", ethers.utils.formatEther(totalAssets));
  
  // User balance
  const userBalance = await vault.balanceOf(signer.address);
  console.log("\nYour yALP balance:", ethers.utils.formatEther(userBalance));
  
  // Conversion rates
  if (totalSupply.gt(0)) {
    const oneYALP = ethers.utils.parseEther("1");
    const assetsPerShare = await vault.convertToAssets(oneYALP);
    console.log("1 yALP =", ethers.utils.formatEther(assetsPerShare), "fsALP");
    
    const oneAsset = ethers.utils.parseEther("1");
    const sharesPerAsset = await vault.convertToShares(oneAsset);
    console.log("1 fsALP =", ethers.utils.formatEther(sharesPerAsset), "yALP");
  }
  
  // Check user's ETH balance
  const ethBalance = await ethers.provider.getBalance(signer.address);
  console.log("\nYour ETH balance:", ethers.utils.formatEther(ethBalance));
  
  console.log("\n=== Example: Deposit ETH ===");
  console.log("// Deposit 0.1 ETH");
  console.log(`await vault.depositETH(`);
  console.log(`  0,                                  // minUsdg (0 for no slippage protection)`);
  console.log(`  0,                                  // minGlp (0 for no slippage protection)`);
  console.log(`  "${signer.address}",                // receiver`);
  console.log(`  {`);
  console.log(`    value: ethers.utils.parseEther("0.1"),`);
  console.log(`    gasLimit: 1500000              // Required gas limit`);
  console.log(`  }`);
  console.log(`);`);
  
  console.log("\n=== Example: Withdraw to ETH ===");
  console.log("// Withdraw 50 yALP to ETH");
  console.log(`await vault.withdrawETH(`);
  console.log(`  ethers.utils.parseEther("50"),     // shares to burn`);
  console.log(`  0,                                  // minOut (0 for no slippage protection)`);
  console.log(`  "${signer.address}",                // receiver`);
  console.log(`  { gasLimit: 1500000 }              // Required gas limit`);
  console.log(`);`);
  
  console.log("\n=== Example: Compound Rewards ===");
  console.log("// Anyone can call compound to reinvest WETH rewards");
  console.log(`await vault.compound({ gasLimit: 2000000 });`);
  
  // Check configuration
  console.log("\n=== Vault Configuration ===");
  const keeper = await vault.keeper();
  const gov = await vault.gov();
  
  console.log("Keeper:", keeper);
  console.log("Gov:", gov);
  
  // Integration example
  console.log("\n=== Integration Example (JavaScript) ===");
  console.log(`
// Import ethers and get signer
const { ethers } = require("ethers");
const provider = new ethers.providers.JsonRpcProvider("YOUR_RPC_URL");
const signer = new ethers.Wallet("YOUR_PRIVATE_KEY", provider);

// Vault ABI (minimal)
const VAULT_ABI = [
  "function depositETH(uint256 minUsdg, uint256 minGlp, address receiver) payable returns (uint256)",
  "function withdrawETH(uint256 shares, uint256 minOut, address receiver) returns (uint256)",
  "function compound() external",
  "function balanceOf(address account) view returns (uint256)",
  "function totalAssets() view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function convertToAssets(uint256 shares) view returns (uint256)",
  "function convertToShares(uint256 assets) view returns (uint256)"
];

// Connect to vault
const vault = new ethers.Contract("${YALP_VAULT}", VAULT_ABI, signer);

// Deposit ETH
const tx = await vault.depositETH(0, 0, signer.address, {
  value: ethers.utils.parseEther("1.0"),
  gasLimit: 1500000
});
await tx.wait();

// Check balance
const balance = await vault.balanceOf(signer.address);
console.log("yALP balance:", ethers.utils.formatEther(balance));

// Withdraw ETH
const withdrawTx = await vault.withdrawETH(
  balance,           // withdraw all
  0,                 // no slippage protection
  signer.address,
  { gasLimit: 1500000 }
);
await withdrawTx.wait();
`);

  console.log("\n=== Gas Requirements ===");
  console.log("- depositETH: ~1,500,000 gas");
  console.log("- withdrawETH: ~1,500,000 gas");
  console.log("- compound: ~2,000,000 gas");
  console.log("\nAlways use these gas limits to avoid out-of-gas errors!");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });