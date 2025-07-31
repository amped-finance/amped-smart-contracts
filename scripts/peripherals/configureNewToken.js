const { deployContract, contractAt, sleep, sendTxn } = require("../shared/helpers")
const { getNetwork } = require("../shared/syncParams")
const tokenList = require('../core/tokens')
const deployments = require('../deploy-sonic.json')
console.log("Loaded deployments:", deployments)

// Helper function to get contract address
function getContractAddress(contractName) {
    const contract = deployments.find(d => d.name === contractName)
    return contract ? contract.imple : undefined
}

async function configureNewToken() {
    console.log("Starting configuration...")
    
    // Get the network from hardhat's runtime environment
    const hre = require("hardhat");
    const network = getNetwork(hre.network.name);
    console.log("Network:", network)
    
    // Get the Frame signer explicitly
    const { getFrameSigner } = require("../shared/helpers");
    const signer = await getFrameSigner();

    const tokens = tokenList[network]
    console.log("Tokens found for network:", tokens ? Object.keys(tokens) : "none")
    
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
        
        const fastPriceFeedContract = await contractAt("FastPriceFeed", getContractAddress("FastPriceFeed"), signer)
        console.log("FastPriceFeed contract found at:", fastPriceFeedContract.address)
        
        const admin = await priceFeedTimelockContract.admin()
        console.log('admin', admin)

        const tlbuffer = await timelockContract.buffer()
        console.log('Timelock buffer', tlbuffer.toString())

        const prtlbuffer = await priceFeedTimelockContract.buffer()
        console.log('PriceFeedTimelock buffer', prtlbuffer.toString())

        if (parseInt(tlbuffer.toString()) !== 0) {
            await sendTxn(timelockContract.setBuffer(0), 'timelock.setBuffer(0)', signer)
        }

        if (parseInt(prtlbuffer.toString()) !== 0) {
            await sendTxn(priceFeedTimelockContract.setBuffer(0), 'priceFeedTimelock.setBuffer(0)', signer)
        }

        if (admin !== await fastPriceFeedContract.gov()) {
            await sendTxn(priceFeedTimelockContract.signalSetGov(fastPriceFeedContract.address, admin), "priceFeedTimelockContract.signalSetGov(fastPriceFeed, admin)", signer)
            await sleep(3000)
            await sendTxn(priceFeedTimelockContract.setGov(fastPriceFeedContract.address, admin), "priceFeedTimelockContract.setGov(fastPriceFeed, admin)", signer)
        }

        let fastPriceTokenArray = []
        let fastPricePrecisionArray = []
        for (const t in tokens) {
            if (tokens[t] === undefined) continue

            fastPriceTokenArray = [...fastPriceTokenArray, tokens[t].address]
            fastPricePrecisionArray = [...fastPricePrecisionArray, tokens[t].fastPricePrecision ?? 1000]
        }

        await sendTxn(fastPriceFeedContract.setTokens(fastPriceTokenArray, fastPricePrecisionArray), "fastPriceFeedContract.setTokens([...])", signer)

        await sendTxn(fastPriceFeedContract.setGov(priceFeedTimelockContract.address), 'fastPriceFeedContract.setGov(priceFeedTimelockContract)', signer)

        for (const t in tokens) {
            const info = tokens[t]
            const used = await vaultContract.whitelistedTokens(info.address)
            if (used === true) continue

            console.log('Adding', t, '***')

            await sendTxn(timelockContract.signalVaultSetTokenConfig(
                vaultContract.address, info.address, info.decimals, info.tokenWeight, info.minProfitBps, info.maxUsdgAmount, info.isStable, info.isShortable
            ), `timelockContract.signalVaultSetTokenConfig(${t})`, signer)

            await sendTxn(priceFeedTimelockContract.signalPriceFeedSetTokenConfig(
                vaultPriceFeedContract.address, info.address, info.priceFeed, info.priceDecimals, info.stable
            ), `priceFeedTimelockContract.signalPriceFeedSetTokenConfig(${t})`, signer)

            await sleep(3000)

            await sendTxn(timelockContract.vaultSetTokenConfig(
                vaultContract.address, info.address, info.decimals, info.tokenWeight, info.minProfitBps, info.maxUsdgAmount, info.isStable, info.isShortable
            ), `timelockContract.vaultSetTokenConfig(${t})`, signer)
            await sendTxn(priceFeedTimelockContract.priceFeedSetTokenConfig(
                vaultPriceFeedContract.address, info.address, info.priceFeed, info.priceDecimals, info.stable
            ), `priceFeedTimelockContract.priceFeedSetTokenConfig(${t})`, signer)
        }

        await sendTxn(timelockContract.setBuffer(86400), 'timelock.setBuffer(86400)', signer)
        await sendTxn(priceFeedTimelockContract.setBuffer(86400), 'priceFeedTimelock.setBuffer(86400)', signer)
    } catch (error) {
        console.error("Error occurred:", error)
    }
}

module.exports = configureNewToken

if (require.main === module) {
    configureNewToken()
        .then(() => process.exit(0))
        .catch(error => {
            console.error(error)
            process.exit(1)
        })
}