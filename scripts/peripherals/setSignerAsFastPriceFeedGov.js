const { contractAt, sendTxn, sleep } = require("../shared/helpers");
const { getNetwork } = require("../shared/syncParams");
const deployments = require('../deploy-sonic.json');

// Helper function to get contract address
function getContractAddress(contractName) {
    const contract = deployments.find(d => d.name === contractName);
    return contract ? contract.imple : undefined;
}

async function setSignerAsFastPriceFeedGov() {
    console.log("Starting script to set signer as FastPriceFeed governor...");

    const hre = require("hardhat");
    const network = getNetwork(hre.network.name);
    console.log("Network:", network);

    const { getFrameSigner } = require("../shared/helpers");
    const signer = await getFrameSigner();
    const signerAddress = await signer.getAddress();
    console.log("Signer address:", signerAddress);

    try {
        const priceFeedTimelockContract = await contractAt("PriceFeedTimelock", getContractAddress("PriceFeedTimelock"), signer);
        console.log("PriceFeedTimelock contract found at:", priceFeedTimelockContract.address);

        const fastPriceFeedContract = await contractAt("FastPriceFeed", getContractAddress("FastPriceFeed"), signer);
        console.log("FastPriceFeed contract found at:", fastPriceFeedContract.address);

        const currentFastPriceFeedGov = await fastPriceFeedContract.gov();
        console.log("Current FastPriceFeed governor:", currentFastPriceFeedGov);

        if (currentFastPriceFeedGov.toLowerCase() === signerAddress.toLowerCase()) {
            console.log(`Signer (${signerAddress}) is already the governor of FastPriceFeed. No action needed.`);
            return;
        }

        const priceFeedTimelockAdmin = await priceFeedTimelockContract.admin();
        console.log("PriceFeedTimelock admin:", priceFeedTimelockAdmin);

        if (priceFeedTimelockAdmin.toLowerCase() !== signerAddress.toLowerCase()) {
            console.error(`Signer (${signerAddress}) is not the admin of PriceFeedTimelock (${priceFeedTimelockAdmin}).`);
            console.error("This script requires the signer to be the admin of PriceFeedTimelock to transfer FastPriceFeed governance.");
            console.error("Please ensure signer is admin or perform actions manually.");
            process.exit(1);
        }

        console.log("Signer is admin of PriceFeedTimelock. Proceeding with governance transfer.");

        const originalBuffer = await priceFeedTimelockContract.buffer();
        console.log("Original PriceFeedTimelock buffer:", originalBuffer.toString());

        if (!originalBuffer.isZero()) {
            console.log("Temporarily setting PriceFeedTimelock buffer to 0...");
            await sendTxn(priceFeedTimelockContract.connect(signer).setBuffer(0), "priceFeedTimelock.setBuffer(0)", signer);
            console.log("PriceFeedTimelock buffer set to 0.");
        }

        try {
            console.log(`Signaling to set FastPriceFeed governor to signer (${signerAddress}) via PriceFeedTimelock...`);
            await sendTxn(priceFeedTimelockContract.connect(signer).signalSetGov(fastPriceFeedContract.address, signerAddress), `priceFeedTimelock.signalSetGov(fastPriceFeed, ${signerAddress})`, signer);
            
            // Sleep only if buffer was non-zero, though it's set to 0 now. A small delay might still be prudent for network propagation.
            const sleepDuration = originalBuffer.isZero() ? 1000 : 3000; // Adjust if necessary
            console.log(`Sleeping for ${sleepDuration / 1000} seconds...`);
            await sleep(sleepDuration); 

            console.log(`Executing to set FastPriceFeed governor to signer (${signerAddress}) via PriceFeedTimelock...`);
            await sendTxn(priceFeedTimelockContract.connect(signer).setGov(fastPriceFeedContract.address, signerAddress), `priceFeedTimelock.setGov(fastPriceFeed, ${signerAddress})`, signer);
            console.log(`FastPriceFeed governor successfully set to signer (${signerAddress}).`);

        } finally {
            if (!originalBuffer.isZero()) {
                console.log(`Restoring PriceFeedTimelock buffer to ${originalBuffer.toString()}...`);
                await sendTxn(priceFeedTimelockContract.connect(signer).setBuffer(originalBuffer), `priceFeedTimelock.setBuffer(${originalBuffer.toString()})`, signer);
                console.log("PriceFeedTimelock buffer restored.");
            }
        }

        console.log("Script to set signer as FastPriceFeed governor finished successfully.");

    } catch (error) {
        console.error("Error occurred:", error);
        process.exit(1);
    }
}

if (require.main === module) {
    setSignerAsFastPriceFeedGov()
        .then(() => process.exit(0))
        .catch(error => {
            // Error is already logged in the function
            process.exit(1);
        });
} 