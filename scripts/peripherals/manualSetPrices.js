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

async function manualSetPrices() {
    console.log("Starting manual price setting...")
    
    // Get the network from hardhat's runtime environment
    const hre = require("hardhat");
    const network = getNetwork(hre.network.name);
    console.log("Network:", network)
    
    // Get the Frame signer explicitly
    const { getFrameSigner } = require("../shared/helpers");
    const signer = await getFrameSigner();
    const signerAddress = await signer.getAddress();
    console.log("Signer address:", signerAddress);

    // const tokens = tokenList[network] // Keep if you need the token list for setPrices
    // console.log("Tokens found for network:", tokens ? Object.keys(tokens) : "none")
    
    try {
        // const vaultAddress = getContractAddress("Vault") // Removed Vault
        // console.log("Vault address from deployments:", vaultAddress)
        // const vaultContract = await contractAt("Vault", vaultAddress, signer)
        // console.log("Vault contract found at:", vaultContract.address)
        
        // const vaultPriceFeedContract = await contractAt("VaultPriceFeed", getContractAddress("VaultPriceFeed"), signer) // Removed VaultPriceFeed
        // console.log("VaultPriceFeed contract found at:", vaultPriceFeedContract.address)
        
        const timelockContract = await contractAt("Timelock", getContractAddress("Timelock"), signer)
        console.log("Timelock contract found at:", timelockContract.address)
        
        const priceFeedTimelockContract = await contractAt("PriceFeedTimelock", getContractAddress("PriceFeedTimelock"), signer)
        console.log("PriceFeedTimelock contract found at:", priceFeedTimelockContract.address)
        
        const fastPriceFeedContract = await contractAt("FastPriceFeed", getContractAddress("FastPriceFeed"), signer)
        console.log("FastPriceFeed contract found at:", fastPriceFeedContract.address)

        // === Part 1: Ensure Signer is GOV of FastPriceFeed ===
        let currentFastPriceFeedGov = await fastPriceFeedContract.gov();
        console.log('Current FastPriceFeed gov:', currentFastPriceFeedGov);
        const priceFeedTimelockAdmin = await priceFeedTimelockContract.admin();
        console.log('PriceFeedTimelock admin:', priceFeedTimelockAdmin);

        if (signerAddress.toLowerCase() !== currentFastPriceFeedGov.toLowerCase()) {
            console.log(`Current FastPriceFeed gov (${currentFastPriceFeedGov}) is not the signer (${signerAddress}). Attempting to set signer as gov.`);
            if (priceFeedTimelockAdmin.toLowerCase() === signerAddress.toLowerCase()) {
                console.log("Signer is admin of PriceFeedTimelock. Proceeding to set Gov on FastPriceFeed via Timelock.");
                
                const originalPFTLBuffer = await priceFeedTimelockContract.buffer();
                let pftlBufferChanged = false;
                if (!originalPFTLBuffer.isZero()) {
                    console.log(`Temporarily setting PriceFeedTimelock buffer to ${originalPFTLBuffer.toString()} for FPF gov change.`);
                    await sendTxn(priceFeedTimelockContract.connect(signer).setBuffer(0), 'priceFeedTimelock.setBuffer(0) [for FPF gov]', signer);
                    pftlBufferChanged = true;
                }

                try {
                    await sendTxn(priceFeedTimelockContract.connect(signer).signalSetGov(fastPriceFeedContract.address, signerAddress), `priceFeedTimelockContract.signalSetGov(fastPriceFeed, ${signerAddress})`, signer);
                    console.log("signalSetGov sent for FPF. Sleeping for 3 seconds...");
                    await sleep(3000); 
                    await sendTxn(priceFeedTimelockContract.connect(signer).setGov(fastPriceFeedContract.address, signerAddress), `priceFeedTimelockContract.setGov(fastPriceFeed, ${signerAddress})`, signer);
                    console.log(`Gov of FastPriceFeed successfully set to ${signerAddress}.`);
                } finally {
                    if (pftlBufferChanged) { 
                        console.log(`Restoring PriceFeedTimelock buffer to ${originalPFTLBuffer.toString()}.`);
                        await sendTxn(priceFeedTimelockContract.connect(signer).setBuffer(originalPFTLBuffer), `priceFeedTimelock.setBuffer(${originalPFTLBuffer.toString()}) [restoring]`, signer);
                    }
                }
            } else {
                console.error(`Signer (${signerAddress}) is not admin of PriceFeedTimelock (${priceFeedTimelockAdmin}). Cannot make signer gov of FastPriceFeed automatically.`);
                throw new Error("Signer must be PriceFeedTimelock admin to become FastPriceFeed gov for this script.");
            }
        } else {
            console.log(`Signer ${signerAddress} is already gov of FastPriceFeed.`);
        }
        
        // === Part 2: Ensure Signer is UPDATER on FastPriceFeed ===
        currentFastPriceFeedGov = await fastPriceFeedContract.gov(); // Re-fetch gov status
        if (signerAddress.toLowerCase() === currentFastPriceFeedGov.toLowerCase()) {
            const isUpdater = await fastPriceFeedContract.isUpdater(signerAddress);
            if (!isUpdater) {
                console.log(`Signer ${signerAddress} is gov but not an updater. Setting as updater.`);
                await sendTxn(fastPriceFeedContract.connect(signer).setUpdater(signerAddress, true), `fastPriceFeedContract.setUpdater(${signerAddress}, true)`, signer);
                console.log(`Signer ${signerAddress} set as updater.`);
            } else {
                console.log(`Signer ${signerAddress} is already an updater.`);
            }
        } else {
            console.error(`Signer ${signerAddress} is not gov of FastPriceFeed after attempt. Gov is ${currentFastPriceFeedGov}. Cannot ensure updater status.`);
            throw new Error("Failed to become FastPriceFeed gov, so cannot set updater status.");
        }

        console.log("Checking FastPriceFeed configuration before setPrices...");
        const currentTokenManager = await fastPriceFeedContract.tokenManager();
        const currentPriceDataInterval = await fastPriceFeedContract.priceDataInterval();
        console.log(`Current Token Manager: ${currentTokenManager}`);
        console.log(`Current Price Data Interval: ${currentPriceDataInterval.toString()}`);

        if (currentPriceDataInterval.isZero()) {
            console.log("Price Data Interval is zero.");
            if (signerAddress.toLowerCase() === currentTokenManager.toLowerCase()) {
                console.log("Signer is the Token Manager. Setting Price Data Interval to 60.");
                await sendTxn(fastPriceFeedContract.connect(signer).setPriceDataInterval(60), "fastPriceFeedContract.setPriceDataInterval(60)", signer);
                console.log("Price Data Interval set. Proceeding to setPrices.");
            } else {
                console.error("Price Data Interval is zero and signer is not the Token Manager.");
                console.error(`The Token Manager (${currentTokenManager}) must call setPriceDataInterval on FastPriceFeed (e.g., to 60).`);
                console.error("Halting script. Please ensure Price Data Interval is set by the Token Manager and rerun.");
                return; // Halt script
            }
        }
        
        // Detailed pre-setPrices check for token: (Ensure this logging is active for debugging if issues persist)
        // const vpfAddress = await fastPriceFeedContract.vaultPriceFeed();
        // console.log(`FastPriceFeed.vaultPriceFeed: ${vpfAddress}`);
        // const currentFastPriceForToken = await fastPriceFeedContract.prices(tokensToUpdate[0]);
        // console.log(`FastPriceFeed.prices["${tokensToUpdate[0]}"]: ${currentFastPriceForToken.toString()}`);
        // const currentPriceDataForToken = await fastPriceFeedContract.priceData(tokensToUpdate[0]);
        // console.log(`FastPriceFeed.priceData["${tokensToUpdate[0]}"] (refPrice): ${currentPriceDataForToken.refPrice.toString()}`);
        // if (vpfAddress !== "0x0000000000000000000000000000000000000000" && currentPriceDataForToken.refPrice.gt(0) && currentFastPriceForToken.isZero()) {
        //     console.warn("POTENTIAL DIVISION BY ZERO: vaultPriceFeed is set, token has a previous refPrice, but current fastPrice is 0.");
        // }

        const tokensToUpdate = ["0xd3DCe716f3eF535C5Ff8d041c1A41C3bd89b97aE"]; 
        const pricesToSet = ["999521910000000000000000000000"]; 
        const timestamp = Math.floor(Date.now() / 1000); 

        if (tokensToUpdate.length > 0 && pricesToSet.length > 0) {
             console.log("Attempting to call setPrices with temporarily disabled VaultPriceFeed linkage...");
             let originalVaultPriceFeed = "0x0000000000000000000000000000000000000000";
             try {
                originalVaultPriceFeed = await fastPriceFeedContract.vaultPriceFeed();
                if (originalVaultPriceFeed !== "0x0000000000000000000000000000000000000000") {
                    console.log(`Temporarily unsetting VaultPriceFeed from ${originalVaultPriceFeed}`);
                    await sendTxn(fastPriceFeedContract.connect(signer).setVaultPriceFeed("0x0000000000000000000000000000000000000000"), "fastPriceFeedContract.setVaultPriceFeed(0x0)", signer);
                    console.log("VaultPriceFeed temporarily unset.");
                }

                console.log("About to call setPrices...");
                await sendTxn(fastPriceFeedContract.connect(signer).setPrices(tokensToUpdate, pricesToSet, timestamp), "fastPriceFeedContract.setPrices([...])", signer);
                console.log("setPrices call has been sent and awaited by sendTxn.");

             } finally {
                if (originalVaultPriceFeed !== "0x0000000000000000000000000000000000000000") {
                    console.log(`Restoring VaultPriceFeed to ${originalVaultPriceFeed}`);
                    await sendTxn(fastPriceFeedContract.connect(signer).setVaultPriceFeed(originalVaultPriceFeed), `fastPriceFeedContract.setVaultPriceFeed(${originalVaultPriceFeed})`, signer);
                }
             }
        } else {
            console.log("No tokens and prices provided to set. Skipping setPrices call.");
        }

        console.log("Detailed pre-setPrices check for token:", tokensToUpdate[0]);
        const vpfAddress = await fastPriceFeedContract.vaultPriceFeed();
        console.log(`FastPriceFeed.vaultPriceFeed: ${vpfAddress}`);

        const currentFastPriceForToken = await fastPriceFeedContract.prices(tokensToUpdate[0]);
        console.log(`FastPriceFeed.prices["${tokensToUpdate[0]}"]: ${currentFastPriceForToken.toString()}`);

        const currentPriceDataForToken = await fastPriceFeedContract.priceData(tokensToUpdate[0]);
        console.log(`FastPriceFeed.priceData["${tokensToUpdate[0]}"] (refPrice): ${currentPriceDataForToken.refPrice.toString()}`);
        console.log(`FastPriceFeed.priceData["${tokensToUpdate[0]}"] (refTime): ${currentPriceDataForToken.refTime.toString()}`);
        console.log(`FastPriceFeed.priceData["${tokensToUpdate[0]}"] (cumulativeRefDelta): ${currentPriceDataForToken.cumulativeRefDelta.toString()}`);
        console.log(`FastPriceFeed.priceData["${tokensToUpdate[0]}"] (cumulativeFastDelta): ${currentPriceDataForToken.cumulativeFastDelta.toString()}`);

        if (vpfAddress !== "0x0000000000000000000000000000000000000000" && 
            currentPriceDataForToken.refPrice.gt(0) && 
            currentFastPriceForToken.isZero()) {
            console.warn("POTENTIAL DIVISION BY ZERO: vaultPriceFeed is set, token has a previous refPrice, but current fastPrice is 0.");
        }

        // Restore FastPriceFeed gov to PriceFeedTimelock
        console.log("Attempting to restore FastPriceFeed governance and Timelock buffers...");
        const priceFeedTimelockContractAddress = priceFeedTimelockContract.address;
        currentFastPriceFeedGov = await fastPriceFeedContract.gov();

        if (currentFastPriceFeedGov.toLowerCase() === signerAddress.toLowerCase()) {
            console.log(`Current FastPriceFeed gov is signer (${signerAddress}). Restoring to PriceFeedTimelock (${priceFeedTimelockContractAddress}).`);
            await sendTxn(fastPriceFeedContract.connect(signer).setGov(priceFeedTimelockContractAddress), `fastPriceFeedContract.setGov(${priceFeedTimelockContractAddress})`, signer);
            console.log("FastPriceFeed governance restored to PriceFeedTimelock.");
        } else {
            console.warn(`Signer (${signerAddress}) is not the current FastPriceFeed gov (${currentFastPriceFeedGov}). Skipping restoration of FastPriceFeed gov.`);
        }

        // Restore Timelock buffers
        const defaultBuffer = 86400;
        console.log(`Restoring Timelock buffer to ${defaultBuffer}`);
        await sendTxn(timelockContract.connect(signer).setBuffer(defaultBuffer), `timelock.setBuffer(${defaultBuffer})`, signer);
        console.log(`Restoring PriceFeedTimelock buffer to ${defaultBuffer}`);
        await sendTxn(priceFeedTimelockContract.connect(signer).setBuffer(defaultBuffer), `priceFeedTimelock.setBuffer(${defaultBuffer})`, signer);
        console.log("Timelock buffers restored.");

        console.log("Manual price setting script finished, including restoration steps.");

    } catch (error) {
        console.error("Error occurred during manual price setting:", error)
    }
}

module.exports = manualSetPrices; // Changed module export

if (require.main === module) {
    manualSetPrices() // Changed function call
        .then(() => process.exit(0))
        .catch(error => {
            console.error(error)
            process.exit(1)
        })
} 