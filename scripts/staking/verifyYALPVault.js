const { run } = require("hardhat");

async function main() {
  console.log("=== Verifying YieldBearingALPVault on Sonicscan ===");
  
  // Contract addresses
  const vaultAddress = "0x2A7353242c2C0BbF9cB56bEe98b6b5f2Fa528Cfa";
  const constructorArgs = [
    "0xE72A2d5B3b09c88D4E8Cc60e74BD438d7168e80F", // rewardRouter
    "0xB895e3DBFB37A4Cc6b4FB50B1cf903608e942FF9", // fsALP
    "0x4DE729B85dDB172F1bb775882f355bA25764E430", // glpManager
    "0x50c42deacd8fc9773493ed674b675be577f2634b", // weth
    "0x1ab02347D787A144a7fBC934a9B96420d46e9eD8"  // esAmp
  ];
  
  console.log("Vault address:", vaultAddress);
  console.log("Constructor arguments:");
  console.log("- RewardRouter:", constructorArgs[0]);
  console.log("- fsALP:", constructorArgs[1]);
  console.log("- GlpManager:", constructorArgs[2]);
  console.log("- WETH:", constructorArgs[3]);
  console.log("- esAMP:", constructorArgs[4]);
  
  try {
    await run("verify:verify", {
      address: vaultAddress,
      constructorArguments: constructorArgs,
      contract: "contracts/staking/YieldBearingALPVault.sol:YieldBearingALPVault"
    });
    
    console.log("\n✅ Contract verified successfully!");
    console.log(`View on Sonicscan: https://sonicscan.org/address/${vaultAddress}#code`);
  } catch (error) {
    console.log("\n❌ Verification failed:", error.message);
    
    if (error.message.includes("Already Verified")) {
      console.log("✅ Contract is already verified!");
      console.log(`View on Sonicscan: https://sonicscan.org/address/${vaultAddress}#code`);
    } else {
      console.log("\nTo verify manually using command line:");
      console.log(`npx hardhat verify --network sonic ${vaultAddress} ${constructorArgs.map(arg => `"${arg}"`).join(" ")}`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });