const { contractAt } = require("../shared/helpers");
const { ethers } = require("hardhat");

async function main() {
  console.log("Verifying the RewardRouter bug...");
  
  // Contract addresses
  const rewardRouterAddress = "0xE72A2d5B3b09c88D4E8Cc60e74BD438d7168e80F";
  const glpManagerAddress = "0x4DE729B85dDB172F1bb775882f355bA25764E430";
  
  console.log("\n=== Understanding the Bug ===");
  console.log("In RewardRouterV2.sol line 133:");
  console.log("uint256 glpAmount = IGlpManager(glpManager).addLiquidityForAccount(account, account, _token, _amount, _minUsdg, _minGlp);");
  
  console.log("\nThe problem is that it passes:");
  console.log("- _fundingAccount: account (msg.sender)");
  console.log("- _account: account (msg.sender)"); 
  console.log("- _token: _token");
  console.log("- _amount: _amount");
  
  console.log("\nBut when msg.sender is a contract, the GlpManager tries to:");
  console.log("IERC20(_token).safeTransferFrom(_fundingAccount, address(vault), _amount);");
  
  console.log("\nThis means it tries to transfer from the VAULT instead of from the RewardRouter!");
  console.log("The vault doesn't have approval to spend tokens from itself, causing the error.");
  
  console.log("\n=== The Fix ===");
  console.log("The RewardRouter should be changed from:");
  console.log("IGlpManager(glpManager).addLiquidityForAccount(account, account, _token, _amount, _minUsdg, _minGlp);");
  
  console.log("\nTo:");
  console.log("IGlpManager(glpManager).addLiquidityForAccount(address(this), account, _token, _amount, _minUsdg, _minGlp);");
  
  console.log("\nThis way:");
  console.log("- _fundingAccount: address(this) - The RewardRouter that has the tokens");
  console.log("- _account: account - The user/vault that should receive the GLP");
  
  console.log("\n=== Testing the Theory ===");
  
  // Let's trace through what happens when vault calls mintAndStakeGlp
  console.log("\nWhen YieldBearingALPVault calls mintAndStakeGlp:");
  console.log("1. Vault transfers USDC from user to vault");
  console.log("2. Vault approves RewardRouter to spend USDC");
  console.log("3. Vault calls rewardRouter.mintAndStakeGlp(USDC, amount, ...)");
  console.log("4. RewardRouter has msg.sender = vault address");
  console.log("5. RewardRouter calls glpManager.addLiquidityForAccount(vault, vault, USDC, ...)");
  console.log("6. GlpManager tries: USDC.transferFrom(vault, vault, amount)");
  console.log("7. ❌ FAILS because vault doesn't have approval to transfer from itself!");
  
  console.log("\n=== Required Governance Actions ===");
  console.log("1. Deploy a new RewardRouterV2 with the fix");
  console.log("2. Update all handler permissions");
  console.log("3. Update frontend to use new RewardRouter");
  console.log("4. Or deploy a minimal fix contract");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });