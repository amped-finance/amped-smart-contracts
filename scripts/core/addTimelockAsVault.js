const { getFrameSigner, contractAt, sendTxn } = require("../shared/helpers")

async function main() {
  const network = (process.env.HARDHAT_NETWORK || 'mainnet');
  console.log(`Adding Timelock as vault on ${network} network...`)
  
  // Contract addresses for Sonic
  const usdgAddress = "0x8846d38481f8e3F9a7dDCBE1DFf0981dB2bC04A3"
  const timelockAddress = "0xE97055C9087458434bf95dedA69531408cC210b5"
  
  // Connect to Frame signer
  const signer = await getFrameSigner()
  const signerAddress = await signer.getAddress()
  console.log("Using signer address:", signerAddress)
  
  // Get USDG contract
  const usdg = await contractAt("USDG", usdgAddress, signer)
  
  // Check current gov
  const currentGov = await usdg.gov()
  console.log("Current USDG gov:", currentGov)
  
  if (currentGov.toLowerCase() !== signerAddress.toLowerCase()) {
    throw new Error(`Signer ${signerAddress} is not the gov. Current gov is ${currentGov}`)
  }
  
  // Check if Timelock is already a vault
  const isVault = await usdg.isVault(timelockAddress)
  console.log("Is Timelock already a vault?", isVault)
  
  if (isVault) {
    console.log("Timelock is already a vault, no action needed")
    return
  }
  
  // Add Timelock as vault
  console.log("Adding Timelock as vault...")
  await sendTxn(
    usdg.addVault(timelockAddress),
    "usdg.addVault(timelock)"
  )
  
  // Verify
  const isVaultAfter = await usdg.isVault(timelockAddress)
  console.log("Is Timelock a vault now?", isVaultAfter)
  
  if (isVaultAfter) {
    console.log("✅ Successfully added Timelock as vault on USDG")
    console.log("You can now run updateUsdgSupply through the Timelock")
  } else {
    console.log("❌ Failed to add Timelock as vault")
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })