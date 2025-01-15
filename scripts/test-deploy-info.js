const { getDeployFilteredInfo } = require('../utils/deploy')
const { networks } = require('../config/networks')

async function testDeployInfo() {
    try {
        // Get the current network (you might want to specify this via command line)
        const network = process.env.NETWORK || 'arbitrum'
        
        // Get deployment info for the specified network
        const deployInfo = await getDeployFilteredInfo(network)
        
        // List of critical contracts to check
        const requiredContracts = [
            'Vault',
            'VaultPriceFeed',
            'Timelock',
            'PriceFeedTimelock',
            'FastPriceFeed'
        ]

        console.log(`\nChecking contract addresses for network: ${network}\n`)

        // Check each required contract
        for (const contractName of requiredContracts) {
            const address = deployInfo[contractName]
            console.log(`${contractName}: ${address ? '✅ Found: ' + address : '❌ Missing'}`)
        }

    } catch (error) {
        console.error('\nError while testing deploy info:', error.message)
    }
}

// Execute the test
testDeployInfo()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    }) 