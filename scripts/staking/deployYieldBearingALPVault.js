const { deployContract, getFrameSigner } = require("../shared/helpers")

async function main() {
  // Check if using Frame signer
  console.log("Raw USE_FRAME_SIGNER env var:", process.env.USE_FRAME_SIGNER);
  const useFrame = process.env.USE_FRAME_SIGNER === "true"
  
  let signer;
  if (useFrame) {
    console.log("Using Frame signer for deployment...")
    signer = await getFrameSigner()
  }
  
  // Deployment parameters from sonic deployment
  const rewardRouter = "0xE72A2d5B3b09c88D4E8Cc60e74BD438d7168e80F"
  const fsAlp = "0xB895e3DBFB37A4Cc6b4FB50B1cf903608e942FF9"
  const glpManager = "0x4DE729B85dDB172F1bb775882f355bA25764E430"
  const ws = "0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38" // WS (Wrapped Sonic) - native token
  const esAmp = "0x1ab02347D787A144a7fBC934a9B96420d46e9eD8"

  console.log("\nDeploying YieldBearingALPVault with parameters:")
  console.log("- RewardRouter:", rewardRouter)
  console.log("- fsALP:", fsAlp)
  console.log("- GlpManager:", glpManager)
  console.log("- WS (Wrapped Sonic):", ws)
  console.log("- esAMP:", esAmp)
  
  // Deploy the vault
  const vault = await deployContract("YieldBearingALPVault", [
    rewardRouter,
    fsAlp,
    glpManager,
    ws,
    esAmp
  ], undefined, undefined, undefined, signer);

  console.log("\n✅ YieldBearingALPVault deployed to:", vault.address)
  
  // Save deployment info
  const deploymentInfo = {
    contractName: "YieldBearingALPVault",
    vault: vault.address,
    rewardRouter,
    fsAlp,
    glpManager,
    ws,
    esAmp,
    deploymentTime: new Date().toISOString(),
    deployer: vault.deployTransaction.from,
    features: {
      fixedExchangeRate: true,
      ethOnlyDeposits: true,
      ethOnlyWithdrawals: true,
      autoCompounding: true,
      requiredGasLimit: "1500000-2000000"
    }
  }
  
  const fs = require("fs")
  const filename = `scripts/staking/yalp-vault-sonic-deployment-${Date.now()}.json`
  fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2))
  console.log("\nDeployment info saved to:", filename)
  
  console.log("\n📝 Usage Instructions:")
  console.log("- Deposit: Call depositS() with S value and at least 1.5M gas")
  console.log("- Withdraw: Call withdrawS() with yALP amount and at least 1.5M gas")
  console.log("- Compound: Anyone can call compound() to reinvest rewards (when implemented)")
  console.log("\n⚠️  This vault has the exchange rate bug FIXED")
  console.log("- Uses state BEFORE deposit to calculate shares")
  console.log("- Second depositor will get correct proportional shares")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })