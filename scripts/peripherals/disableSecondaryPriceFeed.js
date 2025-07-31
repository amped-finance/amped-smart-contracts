const { contractAt, sendTxn } = require("../shared/helpers")
const deployments = require('../deploy-sonic.json')

// Helper function to get contract address
function getContractAddress(contractName) {
    const contract = deployments.find(d => d.name === contractName)
    return contract ? contract.imple : undefined
}

async function disableSecondaryPriceFeed() {
    console.log("Checking and disabling secondary price feed...")
    
    // Get the Frame signer explicitly
    const { getFrameSigner } = require("../shared/helpers");
    const signer = await getFrameSigner();
    
    try {
        const vaultPriceFeedAddress = getContractAddress("VaultPriceFeed")
        console.log("VaultPriceFeed address:", vaultPriceFeedAddress)
        
        const vaultPriceFeedContract = await contractAt("VaultPriceFeed", vaultPriceFeedAddress, signer)
        
        // Check current settings
        const isSecondaryEnabled = await vaultPriceFeedContract.isSecondaryPriceEnabled()
        console.log("Is secondary price enabled:", isSecondaryEnabled)
        
        const secondaryPriceFeedAddress = await vaultPriceFeedContract.secondaryPriceFeed()
        console.log("Secondary price feed address:", secondaryPriceFeedAddress)
        
        if (isSecondaryEnabled) {
            console.log("Disabling secondary price feed...")
            await sendTxn(
                vaultPriceFeedContract.setIsSecondaryPriceEnabled(false), 
                "vaultPriceFeed.setIsSecondaryPriceEnabled(false)", 
                signer
            )
            console.log("Secondary price feed disabled successfully!")
        } else {
            console.log("Secondary price feed is already disabled.")
        }
        
        // Also check AMM settings
        const isAmmEnabled = await vaultPriceFeedContract.isAmmEnabled()
        console.log("\nIs AMM enabled:", isAmmEnabled)
        
        if (isAmmEnabled) {
            console.log("Note: AMM pricing is enabled. You may want to disable it for pure Chainlink pricing.")
            console.log("To disable, run: vaultPriceFeed.setIsAmmEnabled(false)")
        }
        
    } catch (error) {
        console.error("Error occurred:", error)
    }
}

module.exports = disableSecondaryPriceFeed

if (require.main === module) {
    disableSecondaryPriceFeed()
        .then(() => process.exit(0))
        .catch(error => {
            console.error(error)
            process.exit(1)
        })
}