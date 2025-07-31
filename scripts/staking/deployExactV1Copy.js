const { deployContract } = require("../shared/helpers")

async function main() {
  // Using exact same parameters as the working V1 vault
  const rewardRouter = "0xE72A2d5B3b09c88D4E8Cc60e74BD438d7168e80F"
  const fsAlp = "0xB895e3DBFB37A4Cc6b4FB50B1cf903608e942FF9"
  const glpManager = "0x4DE729B85dDB172F1bb775882f355bA25764E430"
  const weth = "0x50c42dEAcD8Fc9773493ED674b675bE577f2634b"
  const esAmp = "0x1ab02347D787A144a7fBC934a9B96420d46e9eD8"

  console.log("Deploying exact copy of V1 vault with same parameters...")
  
  const vault = await deployContract("YieldBearingALPVaultFixed", [
    rewardRouter,
    fsAlp,
    glpManager,
    weth,
    esAmp
  ])

  console.log("YieldBearingALPVaultFixed (V1 copy) deployed to:", vault.address)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })