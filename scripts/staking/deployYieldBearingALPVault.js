const { deployContract } = require("../shared/helpers")

async function main() {
  // Check if using Frame signer
  const useFrame = process.env.USE_FRAME_SIGNER === "true"
  
  if (useFrame) {
    console.log("Using Frame signer for deployment...")
  }
  
  // Deployment parameters from sonic deployment (same as working V1 vault)
  const rewardRouter = "0xE72A2d5B3b09c88D4E8Cc60e74BD438d7168e80F"
  const fsAlp = "0xB895e3DBFB37A4Cc6b4FB50B1cf903608e942FF9"
  const glpManager = "0x4DE729B85dDB172F1bb775882f355bA25764E430"
  const weth = "0x50c42dEAcD8Fc9773493ED674b675bE577f2634b"
  const esAmp = "0x1ab02347D787A144a7fBC934a9B96420d46e9eD8"

  console.log("\nDeploying YieldBearingALPVault with parameters:")
  console.log("- RewardRouter:", rewardRouter)
  console.log("- fsALP:", fsAlp)
  console.log("- GlpManager:", glpManager)
  console.log("- WETH:", weth)
  console.log("- esAMP:", esAmp)
  
  // Deploy the vault
  const vault = await deployContract("YieldBearingALPVault", [
    rewardRouter,
    fsAlp,
    glpManager,
    weth,
    esAmp
  ])

  console.log("\n✅ YieldBearingALPVault deployed to:", vault.address)
  
  // Save deployment info
  const deploymentInfo = {
    contractName: "YieldBearingALPVault",
    vault: vault.address,
    rewardRouter,
    fsAlp,
    glpManager,
    weth,
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
  const filename = `scripts/staking/yalp-vault-eth-deployment-${Date.now()}.json`
  fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2))
  console.log("\nDeployment info saved to:", filename)
  
  console.log("\n📝 Usage Instructions:")
  console.log("- Deposit: Call depositETH() with value and at least 1.5M gas")
  console.log("- Withdraw: Call withdrawETH() with yALP amount and at least 1.5M gas")
  console.log("- Compound: Anyone can call compound() to reinvest rewards")
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