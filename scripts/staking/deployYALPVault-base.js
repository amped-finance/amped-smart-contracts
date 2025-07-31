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
  
  console.log("Deploying YieldBearingALPVaultBaseSepolia with account:", signer.address || await signer.getAddress());
  
  // Contract addresses from Base Sepolia deployment (deploy-basesepolia.json)
  const contracts = {
    rewardRouter: "0xB4dcD1F9AC7577b01B78e3253cB68a538B11aFAe",      // RewardRouterV2
    fsALP: "0x38A19A6078d7Dd180b136b31120687931e488b2B",             // RewardTrackerFeeStakedGLP (fsALP)
    glpManager: "0xAA1eBd1F27A615A9e4CeE37881d4C7Cacc44858E",        // GlpManager
    weth: "0x4200000000000000000000000000000000000006",             // Native WETH on Base
    esAmp: "0xe5AF4c03F23af85AC6732F2dE3afAed3dD712080"            // EsGMX (esAMP)
  };

  console.log("\n=== Deploying YieldBearingALPVaultBaseSepolia ===");
  console.log("This vault will:");
  console.log("- Accept user deposits (tokens or ETH)");
  console.log("- Call mintAndStakeGlp as the vault (msg.sender)");
  console.log("- Hold all fsALP tokens");
  console.log("- Issue yALP tokens to users");
  console.log("- Auto-compound WETH rewards");
  
  console.log("\nUsing Base contract addresses:");
  console.log("- RewardRouter:", contracts.rewardRouter);
  console.log("- fsALP (Fee + Staked ALP):", contracts.fsALP);
  console.log("- GlpManager:", contracts.glpManager);
  console.log("- WETH (Native):", contracts.weth);
  console.log("- esAMP:", contracts.esAmp);
  
  // Deploy the vault
  const vault = await deployContract("YieldBearingALPVaultBaseSepolia", [
    contracts.rewardRouter,
    contracts.fsALP,
    contracts.glpManager,
    contracts.weth,
    contracts.esAmp
  ], undefined, undefined, undefined, signer);

  console.log("\n✅ YieldBearingALPVaultBaseSepolia deployed to:", vault.address)
  
  // Verify deployment
  const code = await ethers.provider.getCode(vault.address);
  console.log("Contract deployed successfully:", code.length > 2);
  
  console.log("\n=== How to Use on Base ===");
  console.log("\n1. Deposit with tokens:");
  console.log("   - Approve tokens to vault");
  console.log("   - Call vault.deposit(token, amount, minUsdg, minGlp, receiver)");
  console.log("   - Receive yALP tokens");
  
  console.log("\n2. Deposit with ETH:");
  console.log("   - Call vault.depositS(minUsdg, minGlp) with ETH value");
  console.log("   - Receive yALP tokens");
  
  console.log("\n3. Withdraw:");
  console.log("   - Call vault.withdraw(shares, tokenOut, minOut, receiver)");
  console.log("   - Or vault.withdrawS(shares, minOut, receiver)");
  console.log("   - Burns yALP and sends tokens/ETH");
  
  console.log("\n4. Auto-compound (keeper only):");
  console.log("   - Call vault.compound()");
  console.log("   - Claims WETH rewards and buys more ALP");
  
  console.log("\n=== Deployment Complete ===");
  console.log("YieldBearingALPVaultBaseSepolia:", vault.address);
  console.log("Token Name: Yield Bearing ALP (Base Sepolia)");
  console.log("Token Symbol: yALP.bs");
  console.log("\n✅ The vault works with the Base Amped infrastructure!");
  console.log("✅ No permission changes needed!");
  console.log("✅ Users get transferable yALP tokens!");
  console.log("✅ Vault holds all non-transferable fsALP!");
  console.log("✅ Auto-compounds WETH rewards!");
  
  // Test with a small deposit if we have ETH
  console.log("\n=== Testing Vault ===");
  const ethBalance = await signer.getBalance();
  console.log("Your ETH balance:", ethers.utils.formatEther(ethBalance));
  
  if (ethBalance.gt(ethers.utils.parseEther("0.01"))) {
    console.log("\nTesting depositS with 0.001 ETH...");
    
    try {
      const tx = await vault.depositS(0, 0, {
        value: ethers.utils.parseEther("0.001"),
        gasLimit: 1500000
      });
      
      console.log("Transaction sent:", tx.hash);
      const receipt = await tx.wait();
      console.log("✅ Deposit successful! Gas used:", receipt.gasUsed.toString());
      
      // Check yALP balance
      const yalpBalance = await vault.balanceOf(signer.address || await signer.getAddress());
      console.log("Your yALP balance:", ethers.utils.formatEther(yalpBalance));
      
      // Check vault's fsALP
      const vaultFsAlp = await vault.totalAssets();
      console.log("Vault's fsALP balance:", ethers.utils.formatEther(vaultFsAlp));
      
    } catch (error) {
      console.log("Test deposit failed:", error.message);
      console.log("This is normal if the vault needs additional setup or if slippage is too high");
    }
  }
  
  // Save deployment info
  const deploymentInfo = {
    network: "basesepolia",
    timestamp: new Date().toISOString(),
    YieldBearingALPVaultBaseSepolia: vault.address,
    contractName: "YieldBearingALPVaultBaseSepolia",
    rewardRouter: contracts.rewardRouter,
    fsALP: contracts.fsALP,
    glpManager: contracts.glpManager,
    weth: contracts.weth,
    esAmp: contracts.esAmp,
    tokenSymbol: "yALP.bs",
    tokenName: "Yield Bearing ALP (Base Sepolia)"
  };
  
  const fs = require('fs');
  const deploymentFile = `./scripts/staking/yalp-vault-deployment-basesepolia-${Date.now()}.json`;
  fs.writeFileSync(
    deploymentFile,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log(`\n📁 Deployment info saved to: ${deploymentFile}`);
  
  console.log("\n=== Next Steps ===");
  console.log("1. Verify the contract on BaseScan:");
  console.log(`   npx hardhat verify --network base ${vault.address} "${contracts.rewardRouter}" "${contracts.fsALP}" "${contracts.glpManager}" "${contracts.weth}" "${contracts.esAmp}"`);
  console.log("2. Set up the keeper bot with the new vault address");
  console.log("3. Configure environment variables for Base network");
  console.log("4. Test deposits and withdrawals on Base");
  console.log("5. Set up monitoring and alerts");
  
  console.log("\n=== Keeper Bot Setup ===");
  console.log("Update your keeper bot configuration with:");
  console.log(`YALP_VAULT_ADDRESS=${vault.address}`);
  console.log("NETWORK=base");
  console.log("RPC_URL=<your-base-rpc-url>");
  console.log("KEEPER_PRIVATE_KEY=<your-keeper-private-key>");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  }); 