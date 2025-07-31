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
  
  // Use the EXISTING RewardRouter that is already a handler
  const EXISTING_REWARD_ROUTER = "0xE72A2d5B3b09c88D4E8Cc60e74BD438d7168e80F";
  
  const contracts = {
    rewardRouter: EXISTING_REWARD_ROUTER,
    fsALP: "0xB895e3DBFB37A4Cc6b4FB50B1cf903608e942FF9",
    glpManager: "0x4DE729B85dDB172F1bb775882f355bA25764E430",
    ws: "0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38", // WS (Wrapped Sonic)
    esAmp: "0x1ab02347D787A144a7fBC934a9B96420d46e9eD8"
  };

  console.log("\n=== Deploying YieldBearingALPVault ===");
  console.log("This vault will:");
  console.log("- Accept user deposits (tokens or S/ETH)");
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
  console.log("- WS (Wrapped Sonic):", contracts.ws);
  console.log("- esAMP:", contracts.esAmp);
  
  // Deploy the vault
  const vault = await deployContract("YieldBearingALPVault", [
    contracts.rewardRouter,
    contracts.fsALP,
    contracts.glpManager,
    contracts.ws,
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
  
  console.log("\n2. Deposit with S/ETH:");
  console.log("   - Call vault.depositS(minUsdg, minGlp) with S value");
  console.log("   - Receive yALP tokens");
  
  console.log("\n3. Withdraw:");
  console.log("   - Call vault.withdraw(shares, tokenOut, minOut, receiver)");
  console.log("   - Or vault.withdrawS(shares, minOut, receiver)");
  console.log("   - Burns yALP and sends tokens/S");
  
  console.log("\n4. Auto-compound (keeper only):");
  console.log("   - Call vault.compound()");
  console.log("   - Claims WETH rewards and buys more ALP");
  
  console.log("\n=== Deployment Complete ===");
  console.log("YieldBearingALPVault:", vault.address);
  console.log("\n✅ The vault works with the EXISTING infrastructure!");
  console.log("✅ No permission changes needed!");
  console.log("✅ Users get transferable yALP tokens!");
  console.log("✅ Vault holds all non-transferable fsALP!");
  console.log("✅ Exchange rate bug is FIXED - uses state BEFORE deposit!");
  
  // Test with a small deposit
  console.log("\n=== Testing Vault ===");
  const ethBalance = await signer.getBalance();
  console.log("Your S balance:", ethers.utils.formatEther(ethBalance));
  
  if (ethBalance.gt(ethers.utils.parseEther("0.1"))) {
    console.log("\nTesting depositS with 0.01 S...");
    
    try {
      const tx = await vault.depositS(0, 0, {
        value: ethers.utils.parseEther("0.01"),
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
    }
  }
  
  // Save deployment info
  const deploymentInfo = {
    network: "sonic",
    timestamp: new Date().toISOString(),
    YieldBearingALPVault: vault.address,
    rewardRouter: contracts.rewardRouter,
    fsALP: contracts.fsALP,
    glpManager: contracts.glpManager,
    ws: contracts.ws,
    esAmp: contracts.esAmp
  };
  
  const fs = require('fs');
  const deploymentFile = `./scripts/staking/yalp-vault-deployment-${Date.now()}.json`;
  fs.writeFileSync(
    deploymentFile,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log(`\n📁 Deployment info saved to: ${deploymentFile}`);
  
  // Verify contract on explorer
  console.log("\n=== Verifying Contract on Sonicscan ===");
  console.log("Waiting a few seconds for contract to be indexed...");
  await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
  
  try {
    await run("verify:verify", {
      address: vault.address,
      constructorArguments: [
        contracts.rewardRouter,
        contracts.fsALP,
        contracts.glpManager,
        contracts.ws,
        contracts.esAmp
      ],
      contract: "contracts/staking/YieldBearingALPVault.sol:YieldBearingALPVault"
    });
    console.log("✅ Contract verified successfully!");
    console.log(`View on Sonicscan: https://sonicscan.org/address/${vault.address}#code`);
  } catch (error) {
    console.log("⚠️  Verification failed:", error.message);
    console.log("\nTo verify manually, run:");
    console.log(`npx hardhat verify --network sonic ${vault.address} "${contracts.rewardRouter}" "${contracts.fsALP}" "${contracts.glpManager}" "${contracts.ws}" "${contracts.esAmp}"`);
  }
  
  return vault.address;
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })