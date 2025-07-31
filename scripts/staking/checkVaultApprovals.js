const { contractAt } = require("../shared/helpers");
const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Checking vault approvals with account:", signer.address);
  
  // Contract addresses
  const vaultAddress = "0xB91735aE255403B9ab9d97dF671a63807a89f08c"; // Fixed vault
  const rewardRouterAddress = "0xE72A2d5B3b09c88D4E8Cc60e74BD438d7168e80F";
  
  const vault = await contractAt("YieldBearingALPVaultFixed", vaultAddress);
  
  // Token addresses
  const tokens = {
    "USDC": "0x29219dd400f2bf60e5a23d13be72b486d4038894",
    "WS": "0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38",
    "stS": "0xE5DA20F15420aD15DE0fa650600aFc998bbE3955",
    "WETH": "0x50c42deacd8fc9773493ed674b675be577f2634b",
    "SHADOW": "0x3333b97138d4b086720b5ae8a7844b1345a33333",
    "ANON": "0x79bbf4508b1391af3a0f4b30bb5fc4aa9ab0e07c",
    "scUSD": "0xd3DCe716f3eF535C5Ff8d041c1A41C3bd89b97aE"
  };
  
  console.log("\n=== Checking Vault's Approvals to RewardRouter ===");
  console.log("RewardRouter:", rewardRouterAddress);
  console.log("Vault:", vaultAddress);
  
  for (const [name, address] of Object.entries(tokens)) {
    try {
      const token = await ethers.getContractAt("IERC20", address);
      const allowance = await token.allowance(vaultAddress, rewardRouterAddress);
      console.log(`\n${name}: ${ethers.utils.formatEther(allowance)} (raw: ${allowance.toString()})`);
      
      if (allowance.eq(0)) {
        console.log("  ⚠️  No approval set");
      } else if (allowance.eq(ethers.constants.MaxUint256)) {
        console.log("  ✅ Max approval set");
      } else {
        console.log("  ✓ Partial approval set");
      }
    } catch (error) {
      console.log(`\n${name}: Error checking - ${error.message}`);
    }
  }
  
  console.log("\n=== Understanding the Issue ===");
  console.log("\nThe vault contract approves tokens to the RewardRouter INSIDE the deposit function.");
  console.log("This happens at line 117 of YieldBearingALPVaultFixed.sol:");
  console.log('  IERC20(_token).safeApprove(address(rewardRouter), _amount);');
  console.log("\nSo the approval should be set automatically when depositing.");
  
  console.log("\n=== The Real Issue ===");
  console.log("The problem is that stS is not accepted by the GlpManager for minting ALP.");
  console.log("Even though stS is whitelisted in the Vault (for trading), it cannot be used to mint ALP.");
  console.log("\nTokens that CAN be used to mint ALP:");
  console.log("- Native S (ETH) ✅");
  console.log("- WETH ✅");
  console.log("- USDC ✅");
  console.log("- WS (wrapped S) ✅");
  console.log("- SHADOW (likely) ✅");
  console.log("- ANON (likely) ✅");
  console.log("- scUSD (likely) ✅");
  console.log("- stS ❌ (whitelisted for trading but not for minting ALP)");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });