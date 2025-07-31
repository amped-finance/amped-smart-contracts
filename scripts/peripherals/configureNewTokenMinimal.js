const { deployContract, contractAt, sleep, sendTxn } = require("../shared/helpers")
const { getNetwork } = require("../shared/syncParams")
const tokenList = require('../core/tokens')

// Helper function to load deployments based on network
function loadDeployments(network) {
    try {
        const deployments = require(`../deploy-${network}.json`)
        console.log(`Loaded deployments for ${network}:`, deployments)
        return deployments
    } catch (error) {
        console.error(`Failed to load deployments for network ${network}:`, error.message)
        throw new Error(`Deployment file deploy-${network}.json not found`)
    }
}

async function configureNewTokenMinimal(tokenSymbol) {
    console.log("Starting minimal token configuration (no FastPriceFeed)...")
    
    // Get the network from hardhat's runtime environment
    const hre = require("hardhat");
    const network = getNetwork(hre.network.name);
    console.log("Network:", network)
    
    // Load deployments for the specific network
    const deployments = loadDeployments(network)
    
    // Helper function to get contract address
    function getContractAddress(contractName) {
        const contract = deployments.find(d => d.name === contractName)
        return contract ? contract.imple : undefined
    }
    
    // Get the Frame signer explicitly
    const { getFrameSigner } = require("../shared/helpers");
    const signer = await getFrameSigner();

    const tokens = tokenList[network]
    if (!tokens) {
        console.error(`No tokens found for network: ${network}`)
        return
    }

    // Handle specific token or all tokens
    let tokensToProcess = {}
    
    if (tokenSymbol) {
        // Process specific token
        const tokenSymbolLower = tokenSymbol.toLowerCase()
        if (!tokens[tokenSymbolLower]) {
            console.error(`Token ${tokenSymbol} not found in tokens.js for network ${network}`)
            console.log("Available tokens:", Object.keys(tokens))
            return
        }
        tokensToProcess[tokenSymbolLower] = tokens[tokenSymbolLower]
        console.log(`Processing single token: ${tokenSymbolLower}`)
    } else {
        // Process all tokens
        tokensToProcess = tokens
        console.log("Processing all tokens:", Object.keys(tokens))
    }
    
    try {
        const vaultAddress = getContractAddress("Vault")
        console.log("Vault address from deployments:", vaultAddress)
        const vaultContract = await contractAt("Vault", vaultAddress, signer)
        console.log("Vault contract found at:", vaultContract.address)
        
        const vaultPriceFeedContract = await contractAt("VaultPriceFeed", getContractAddress("VaultPriceFeed"), signer)
        console.log("VaultPriceFeed contract found at:", vaultPriceFeedContract.address)
        
        const timelockContract = await contractAt("Timelock", getContractAddress("Timelock"), signer)
        console.log("Timelock contract found at:", timelockContract.address)
        
        const priceFeedTimelockContract = await contractAt("PriceFeedTimelock", getContractAddress("PriceFeedTimelock"), signer)
        console.log("PriceFeedTimelock contract found at:", priceFeedTimelockContract.address)

        // Check current buffer values
        const tlbuffer = await timelockContract.buffer()
        console.log('Timelock buffer', tlbuffer.toString())

        const prtlbuffer = await priceFeedTimelockContract.buffer()
        console.log('PriceFeedTimelock buffer', prtlbuffer.toString())

        // Temporarily set buffers to 0 for immediate execution
        if (parseInt(tlbuffer.toString()) !== 0) {
            await sendTxn(timelockContract.setBuffer(0), 'timelock.setBuffer(0)', signer)
        }

        if (parseInt(prtlbuffer.toString()) !== 0) {
            await sendTxn(priceFeedTimelockContract.setBuffer(0), 'priceFeedTimelock.setBuffer(0)', signer)
        }

        // Configure tokens in Vault and VaultPriceFeed
        for (const t in tokensToProcess) {
            const info = tokensToProcess[t]
            if (info === undefined) continue

            const used = await vaultContract.whitelistedTokens(info.address)
            if (used === true) {
                console.log(`Token ${t} already whitelisted, skipping...`)
                continue
            }

            console.log(`\nAdding ${t} to Vault and PriceFeed...`)
            console.log(`Token address: ${info.address}`)
            console.log(`Price feed: ${info.priceFeed}`)

            // Signal token configuration for Vault
            await sendTxn(timelockContract.signalVaultSetTokenConfig(
                vaultContract.address, 
                info.address, 
                info.decimals, 
                info.tokenWeight, 
                info.minProfitBps, 
                info.maxUsdgAmount, 
                info.isStable, 
                info.isShortable
            ), `timelockContract.signalVaultSetTokenConfig(${t})`, signer)

            // Signal price feed configuration
            await sendTxn(priceFeedTimelockContract.signalPriceFeedSetTokenConfig(
                vaultPriceFeedContract.address, 
                info.address, 
                info.priceFeed, 
                info.priceDecimals, 
                info.stable
            ), `priceFeedTimelockContract.signalPriceFeedSetTokenConfig(${t})`, signer)

            // Wait for timelock delay
            await sleep(3000)

            // Execute token configuration for Vault
            await sendTxn(timelockContract.vaultSetTokenConfig(
                vaultContract.address, 
                info.address, 
                info.decimals, 
                info.tokenWeight, 
                info.minProfitBps, 
                info.maxUsdgAmount, 
                info.isStable, 
                info.isShortable
            ), `timelockContract.vaultSetTokenConfig(${t})`, signer)

            // Execute price feed configuration
            await sendTxn(priceFeedTimelockContract.priceFeedSetTokenConfig(
                vaultPriceFeedContract.address, 
                info.address, 
                info.priceFeed, 
                info.priceDecimals, 
                info.stable
            ), `priceFeedTimelockContract.priceFeedSetTokenConfig(${t})`, signer)

            console.log(`Successfully configured ${t}`)
        }

        // Restore original buffer values
        await sendTxn(timelockContract.setBuffer(86400), 'timelock.setBuffer(86400)', signer)
        await sendTxn(priceFeedTimelockContract.setBuffer(86400), 'priceFeedTimelock.setBuffer(86400)', signer)

        console.log("\nToken configuration complete!")
        console.log("Note: This script does NOT configure FastPriceFeed.")
        console.log("Ensure isSecondaryPriceEnabled is set to false on VaultPriceFeed.")

    } catch (error) {
        console.error("Error occurred:", error)
    }
}

module.exports = configureNewTokenMinimal

if (require.main === module) {
    // Get token symbol from environment variable or command line arguments
    const tokenSymbol = process.env.NEW_TOKEN || process.argv[2]
    
    if (process.argv.length > 2 && process.argv[2] === '--help') {
        console.log("Usage:")
        console.log("  npx hardhat run scripts/peripherals/configureNewTokenMinimal.js --network <network>")
        console.log("    - Configures ALL tokens in tokens.js for the network")
        console.log("")
        console.log("  NEW_TOKEN=<token> npx hardhat run scripts/peripherals/configureNewTokenMinimal.js --network <network>")
        console.log("    - Configures only the specified token using environment variable")
        console.log("")
        console.log("  npx hardhat run scripts/peripherals/configureNewTokenMinimal.js --network <network> <token>")
        console.log("    - Configures only the specified token using command line argument")
        console.log("")
        console.log("Example:")
        console.log("  NEW_TOKEN=zora npx hardhat run scripts/peripherals/configureNewTokenMinimal.js --network base")
        console.log("  npx hardhat run scripts/peripherals/configureNewTokenMinimal.js --network sonic usdc")
        process.exit(0)
    }
    
    configureNewTokenMinimal(tokenSymbol)
        .then(() => process.exit(0))
        .catch(error => {
            console.error(error)
            process.exit(1)
        })
}