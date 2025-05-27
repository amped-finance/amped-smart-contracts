const { contractAt } = require("../shared/helpers");
const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  
  // Contract addresses
  const YALP_VAULT = process.env.YALP_VAULT || process.env.YALP_VAULT_ADDRESS || "0xd2e4b0cC3FB79ef958137206cbEd94C7a5C7972d";
  const GLP_MANAGER = "0x4DE729B85dDB172F1bb775882f355bA25764E430";
  
  console.log("Calculating yALP value...\n");
  
  // Get contract instances
  const vault = await contractAt("YieldBearingALPVault", YALP_VAULT);
  const glpManager = await contractAt("GlpManager", GLP_MANAGER);
  
  // Step 1: Get yALP to fsALP exchange rate
  const yalpSupply = await vault.totalSupply();
  const fsAlpInVault = await vault.totalAssets();
  
  console.log("=== yALP Vault Stats ===");
  console.log("Total yALP supply:", ethers.utils.formatEther(yalpSupply));
  console.log("Total fsALP in vault:", ethers.utils.formatEther(fsAlpInVault));
  
  // Calculate yALP to fsALP rate
  let yalpToFsAlpRate;
  if (yalpSupply.gt(0)) {
    // 1 yALP = X fsALP
    yalpToFsAlpRate = fsAlpInVault.mul(ethers.utils.parseEther("1")).div(yalpSupply);
    console.log("1 yALP =", ethers.utils.formatEther(yalpToFsAlpRate), "fsALP");
  } else {
    yalpToFsAlpRate = ethers.utils.parseEther("1");
    console.log("1 yALP = 1 fsALP (no supply yet)");
  }
  
  // Step 2: Get fsALP to USD price
  // fsALP price = Total AUM / Total fsALP supply
  const totalAum = await glpManager.getAum(true); // true for maximum price
  const fsAlpAddress = await vault.fsAlp();
  const fsAlp = await ethers.getContractAt("IERC20", fsAlpAddress);
  const totalFsAlpSupply = await fsAlp.totalSupply();
  
  console.log("\n=== ALP/fsALP Stats ===");
  console.log("Total AUM:", ethers.utils.formatUnits(totalAum, 30), "USD");
  console.log("Total fsALP supply:", ethers.utils.formatEther(totalFsAlpSupply));
  
  // Calculate fsALP price in USD (with 30 decimals)
  const fsAlpPriceUsd = totalAum.mul(ethers.utils.parseEther("1")).div(totalFsAlpSupply);
  console.log("1 fsALP =", ethers.utils.formatUnits(fsAlpPriceUsd, 30), "USD");
  
  // Step 3: Calculate yALP price in USD
  // yALP price = (yALP to fsALP rate) * (fsALP price)
  // Need to be careful with decimals: yalpToFsAlpRate has 18 decimals, fsAlpPriceUsd has 30 decimals
  const yalpPriceUsd = yalpToFsAlpRate.mul(fsAlpPriceUsd).div(ethers.utils.parseEther("1"));
  
  console.log("\n=== yALP Value ===");
  console.log("1 yALP =", ethers.utils.formatUnits(yalpPriceUsd, 30), "USD");
  
  // Calculate total value locked in yALP vault
  const totalValueLocked = yalpSupply.mul(yalpPriceUsd).div(ethers.utils.parseEther("1"));
  console.log("\nTotal Value Locked in yALP:", ethers.utils.formatUnits(totalValueLocked, 30), "USD");
  
  // If user has balance, show their value
  const userBalance = await vault.balanceOf(signer.address);
  if (userBalance.gt(0)) {
    const userValue = userBalance.mul(yalpPriceUsd).div(ethers.utils.parseEther("1"));
    console.log("\n=== Your Holdings ===");
    console.log("Your yALP balance:", ethers.utils.formatEther(userBalance));
    console.log("Your USD value:", ethers.utils.formatUnits(userValue, 30), "USD");
  }
  
  // Show growth metrics
  if (yalpSupply.gt(0) && !yalpToFsAlpRate.eq(ethers.utils.parseEther("1"))) {
    const growthPercent = yalpToFsAlpRate.sub(ethers.utils.parseEther("1")).mul(10000).div(ethers.utils.parseEther("1"));
    console.log("\n=== Growth Metrics ===");
    console.log("yALP has grown:", growthPercent.toNumber() / 100, "% since inception");
    console.log("This growth comes from auto-compounded rewards");
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });