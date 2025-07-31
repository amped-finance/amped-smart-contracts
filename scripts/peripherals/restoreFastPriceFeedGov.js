const { contractAt, sendTxn } = require("../shared/helpers");
const { getNetwork } = require("../shared/syncParams");
const deployments = require('../deploy-sonic.json');

// Helper function to get contract address
function getContractAddress(contractName) {
    const contract = deployments.find(d => d.name === contractName);
    return contract ? contract.imple : undefined;
}

async function restoreFastPriceFeedGov() {
    console.log("Starting restoration of FastPriceFeed governance to PriceFeedTimelock...");

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

        const priceFeedTimelockContractAddress = priceFeedTimelockContract.address;
        const currentFastPriceFeedGov = await fastPriceFeedContract.gov();

        if (currentFastPriceFeedGov.toLowerCase() === priceFeedTimelockContractAddress.toLowerCase()) {
            console.log(`FastPriceFeed governance is already set to PriceFeedTimelock (${priceFeedTimelockContractAddress}). No action needed.`);
            return;
        }

        if (currentFastPriceFeedGov.toLowerCase() === signerAddress.toLowerCase()) {
            console.log(`Current FastPriceFeed gov is signer (${signerAddress}). Restoring to PriceFeedTimelock (${priceFeedTimelockContractAddress}).`);
            await sendTxn(fastPriceFeedContract.connect(signer).setGov(priceFeedTimelockContractAddress), `fastPriceFeedContract.setGov(${priceFeedTimelockContractAddress})`, signer);
            console.log("FastPriceFeed governance restored to PriceFeedTimelock.");
        } else {
            console.warn(`Current FastPriceFeed gov (${currentFastPriceFeedGov}) is not the signer.`);
            console.warn(`This script requires the signer to be the current governor of FastPriceFeed to restore it to PriceFeedTimelock.`);
            console.warn("Please ensure signer is governor or perform actions manually.");
            process.exit(1);
        }

        console.log("Restoration of FastPriceFeed governance finished.");

    } catch (error) {
        console.error("Error occurred during restoration:", error);
        process.exit(1);
    }
}

if (require.main === module) {
    restoreFastPriceFeedGov()
        .then(() => process.exit(0))
        .catch(error => {
            // Error is already logged in the function
            process.exit(1);
        });
} 