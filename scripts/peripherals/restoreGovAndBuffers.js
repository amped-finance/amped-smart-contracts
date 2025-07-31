const { contractAt, sendTxn } = require("../shared/helpers");
const { getNetwork } = require("../shared/syncParams");
const deployments = require('../deploy-sonic.json');

// Helper function to get contract address
function getContractAddress(contractName) {
    const contract = deployments.find(d => d.name === contractName);
    return contract ? contract.imple : undefined;
}

async function restoreGovAndBuffers() {
    console.log("Starting restoration of FastPriceFeed governance and Timelock buffers...");

    const hre = require("hardhat");
    const network = getNetwork(hre.network.name);
    console.log("Network:", network);

    const { getFrameSigner } = require("../shared/helpers");
    const signer = await getFrameSigner();
    const signerAddress = await signer.getAddress();
    console.log("Signer address:", signerAddress);

    try {
        const timelockContract = await contractAt("Timelock", getContractAddress("Timelock"), signer);
        console.log("Timelock contract found at:", timelockContract.address);

        const priceFeedTimelockContract = await contractAt("PriceFeedTimelock", getContractAddress("PriceFeedTimelock"), signer);
        console.log("PriceFeedTimelock contract found at:", priceFeedTimelockContract.address);

        const fastPriceFeedContract = await contractAt("FastPriceFeed", getContractAddress("FastPriceFeed"), signer);
        console.log("FastPriceFeed contract found at:", fastPriceFeedContract.address);

        // Restore FastPriceFeed gov to PriceFeedTimelock
        const priceFeedTimelockContractAddress = priceFeedTimelockContract.address;
        const currentFastPriceFeedGov = await fastPriceFeedContract.gov();

        if (currentFastPriceFeedGov.toLowerCase() === signerAddress.toLowerCase()) {
            console.log(`Current FastPriceFeed gov is signer (${signerAddress}). Restoring to PriceFeedTimelock (${priceFeedTimelockContractAddress}).`);
            await sendTxn(fastPriceFeedContract.connect(signer).setGov(priceFeedTimelockContractAddress), `fastPriceFeedContract.setGov(${priceFeedTimelockContractAddress})`, signer);
            console.log("FastPriceFeed governance restored to PriceFeedTimelock.");
        } else if (currentFastPriceFeedGov.toLowerCase() === priceFeedTimelockContractAddress.toLowerCase()) {
            console.log(`FastPriceFeed governance is already set to PriceFeedTimelock (${priceFeedTimelockContractAddress}). No action needed.`);
        } else {
            console.warn(`Signer (${signerAddress}) is not the current FastPriceFeed gov (${currentFastPriceFeedGov}), nor is it already the PriceFeedTimelock. Manual intervention may be required to set gov to ${priceFeedTimelockContractAddress}.`);
        }

        // Restore Timelock buffers
        const defaultBuffer = 86400;
        console.log(`Restoring Timelock buffer to ${defaultBuffer}`);
        await sendTxn(timelockContract.connect(signer).setBuffer(defaultBuffer), `timelock.setBuffer(${defaultBuffer})`, signer);
        
        console.log(`Restoring PriceFeedTimelock buffer to ${defaultBuffer}`);
        await sendTxn(priceFeedTimelockContract.connect(signer).setBuffer(defaultBuffer), `priceFeedTimelock.setBuffer(${defaultBuffer})`, signer);
        console.log("Timelock buffers restored.");

        console.log("Restoration script finished.");

    } catch (error) {
        console.error("Error occurred during restoration:", error);
        process.exit(1);
    }
}

if (require.main === module) {
    restoreGovAndBuffers()
        .then(() => process.exit(0))
        .catch(error => {
            // Error is already logged in the function
            process.exit(1);
        });
} 