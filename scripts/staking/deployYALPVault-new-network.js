const { deployContract, contractAt, sendTxn, getFrameSigner } = require("../shared/helpers");

async function main() {
  // Check if using Frame signer
  const useFrame = process.env.USE_FRAME_SIGNER === "true"
  
  let signer;
  if (useFrame) {
    console.log("Using Frame signer for deployment...")
    signer = await getFrameSigner()
  } else {
    [signer] = await ethers.getSigners();
  }
  
  console.log("Deploying YieldBearingALPVault with account:", signer.address || await signer.getAddress());
  
  // TODO: Update these addresses for your new network
  // These should be the addresses of the deployed Amped contracts on your new network
  const contracts = {
    rewardRouter: "0x0000000000000000000000000000000000000000", // UPDATE: RewardRouter address
    fsALP: "0x0000000000000000000000000000000000000000",        // UPDATE: fsALP (fee + staked ALP) address
    glpManager: "0x0000000000000000000000000000000000000000",    // UPDATE: GlpManager address
    nativeToken: "0x0000000000000000000000000000000000000000",   // UPDATE: Native wrapped token (WETH equivalent)
    esAmp: "0x0000000000000000000000000000000000000000"        // UPDATE: esAMP token address
  };

  console.log("\n=== Deploying YieldBearingALPVault ===");
  console.log("This vault will:");
  console.log("- Accept user deposits (tokens or native token)");
  console.log("- Call mintAndStakeGlp as the vault (msg.sender)");
  console.log("- Hold all fsALP tokens");
  console.log("- Issue yALP tokens to users");
  console.log("- Auto-compound rewards");
  
  console.log("\nUsing EXISTING RewardRouter:", contracts.rewardRouter);
  console.log("No need to deploy new contracts or change permissions!");
  
  console.log("\nDeploying with parameters:");
  console.log("- RewardRouter:", contracts.rewardRouter);
  console.log("- fsALP:", contracts.fsALP);
  console.log("- GlpManager:", contracts.glpManager);
  console.log("- Native Token:", contracts.nativeToken);
  console.log("- esAMP:", contracts.esAmp);
  
  // Validate addresses before deployment
  const requiredAddresses = Object.entries(contracts);
  const invalidAddresses = requiredAddresses.filter(([name, addr]) => 
    !addr || addr === "0x0000000000000000000000000000000000000000"
  );
  
  if (invalidAddresses.length > 0) {
    console.error("\n❌ ERROR: The following addresses need to be updated:");
    invalidAddresses.forEach(([name, addr]) => {
      console.error(`  - ${name}: ${addr}`);
    });
    console.error("\nPlease update the contract addresses in this script before deployment.");
    process.exit(1);
  }
  
  // Deploy the vault
  const vault = await deployContract("YieldBearingALPVault", [
    contracts.rewardRouter,
    contracts.fsALP,
    contracts.glpManager,
    contracts.nativeToken,
    contracts.esAmp
  ], undefined, undefined, undefined, signer);

  console.log("\n✅ YieldBearingALPVault deployed to:", vault.address)
  
  // Verify deployment
  const code = await ethers.provider.getCode(vault.address);
  console.log("Contract deployed successfully:", code.length > 2);
  
  console.log("\n=== How to Use ===");
  console.log("\n1. Deposit with tokens:");
  console.log("   - Approve tokens to vault");
  console.log("   - Call vault.deposit(token, amount, minUsdg, minGlp, receiver)");
  console.log("   - Receive yALP tokens");
  
  console.log("\n2. Deposit with native token:");
  console.log("   - Call vault.depositS(minUsdg, minGlp) with native token value");
  console.log("   - Receive yALP tokens");
  
  console.log("\n3. Withdraw:");
  console.log("   - Call vault.withdraw(shares, tokenOut, minOut, receiver)");
  console.log("   - Or vault.withdrawS(shares, minOut, receiver)");
  console.log("   - Burns yALP and sends tokens/native token");
  
  console.log("\n4. Auto-compound (keeper only):");
  console.log("   - Call vault.compound()");
  console.log("   - Claims rewards and buys more ALP");
  
  console.log("\n=== Deployment Complete ===");
  console.log("YieldBearingALPVault:", vault.address);
  console.log("\n✅ The vault works with the EXISTING infrastructure!");
  console.log("✅ No permission changes needed!");
  console.log("✅ Users get transferable yALP tokens!");
  console.log("✅ Vault holds all non-transferable fsALP!");
  
  // Save deployment info
  const deploymentInfo = {
    network: process.env.HARDHAT_NETWORK || "unknown",
    timestamp: new Date().toISOString(),
    YieldBearingALPVault: vault.address,
    rewardRouter: contracts.rewardRouter,
    fsALP: contracts.fsALP,
    glpManager: contracts.glpManager,
    nativeToken: contracts.nativeToken,
    esAmp: contracts.esAmp
  };
  
  const fs = require('fs');
  const deploymentFile = `./scripts/staking/yalp-vault-deployment-${process.env.HARDHAT_NETWORK || 'unknown'}-${Date.now()}.json`;
  fs.writeFileSync(
    deploymentFile,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log(`\n📁 Deployment info saved to: ${deploymentFile}`);
  
  console.log("\n=== Next Steps ===");
  console.log("1. Verify the contract on the block explorer");
  console.log("2. Set up the keeper bot with the vault address");
  console.log("3. Configure the keeper bot environment variables");
  console.log("4. Test deposits and withdrawals");
  console.log("5. Set up monitoring and alerts");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  }); 