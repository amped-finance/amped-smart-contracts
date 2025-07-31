const fs = require('fs');
const path = require('path');
const hre = require('hardhat');

// --- Configuration ---
const LOG_FILE = './deployment-log-superseed.json';
const CONTRACT_BASE_DIRS = [
    'contracts/core',
    'contracts/peripherals',
    'contracts/staking',
    'contracts/gmx',
    'contracts/referrals',
    'contracts/access',
    'contracts/libraries', // Add other relevant dirs if needed
    'contracts/oracle',
    'contracts/tokens'
];
// Special cases where contract name doesn't directly match filename or location
const SPECIAL_CASES = {
    // Example: "MyProxy": "contracts/proxy/MyProxy.sol",
    "MintableBaseToken": "contracts/tokens/MintableBaseToken.sol", // Assuming location
    "RewardTracker": "contracts/staking/RewardTracker.sol",
    "RewardDistributor": "contracts/staking/RewardDistributor.sol",
    "BonusDistributor": "contracts/staking/BonusDistributor.sol",
    "Vester": "contracts/staking/Vester.sol",
    "GLPRewardRouterV2": "contracts/staking/RewardRouterV2.sol" // Deployed as RewardRouterV2
    // Add more special cases if the script fails to find contracts
};
// Contracts known *not* to have separate source files or that shouldn't be verified
const SKIP_VERIFICATION = [
    'Multicall3', // Often pre-deployed or standard library
    // Add other names if needed
];
// --- End Configuration ---

async function findContractPath(contractName) {
    console.log(`Searching for path for ${contractName}...`);
    if (SPECIAL_CASES[contractName]) {
        const p = path.join(hre.config.paths.root, SPECIAL_CASES[contractName]);
        if (fs.existsSync(p)) {
             console.log(` -> Found special case path: ${SPECIAL_CASES[contractName]}`);
             return SPECIAL_CASES[contractName];
        }
        console.warn(` -> Special case path not found: ${SPECIAL_CASES[contractName]}`);
    }

    for (const baseDir of CONTRACT_BASE_DIRS) {
        const possiblePath = path.join(baseDir, `${contractName}.sol`);
        const fullPath = path.join(hre.config.paths.root, possiblePath);
        if (fs.existsSync(fullPath)) {
            console.log(` -> Found path: ${possiblePath}`);
            return possiblePath;
        }
    }
    console.error(` -> Could not find source file for ${contractName} in configured directories.`);
    return null;
}

function cleanArguments(args) {
    if (!Array.isArray(args)) return [];
    // Remove the last argument if it looks like a fee override object
    if (args.length > 0) {
        const lastArg = args[args.length - 1];
        if (typeof lastArg === 'object' && lastArg !== null && ('maxPriorityFeePerGas' in lastArg || 'maxFeePerGas' in lastArg || 'gasPrice' in lastArg)) {
            return args.slice(0, -1);
        }
    }
    return args;
}

async function main() {
    console.log(`Starting verification process for network: ${hre.network.name}`);
    console.log(`Reading deployment log from: ${LOG_FILE}`);

    let deploymentLog;
    try {
        const logContent = fs.readFileSync(LOG_FILE, 'utf8');
        deploymentLog = JSON.parse(logContent);
        console.log(`Found ${deploymentLog.length} deployment entries in the log.`);
    } catch (error) {
        console.error(`Error reading or parsing log file ${LOG_FILE}:`, error);
        process.exit(1);
    }

    let verifiedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;
    // let foundStartContract = false; // Flag to track if we found the starting point
    // const START_CONTRACT_NAME = "FastPriceFeed"; // Contract to resume AFTER (start verification with this one)

    for (const entry of deploymentLog) {
        const { contractName, address, arguments: originalArgs } = entry;

        /* // Skip until we find the desired starting contract
        if (!foundStartContract && contractName !== START_CONTRACT_NAME) {
            console.log(`Skipping ${contractName} (waiting for ${START_CONTRACT_NAME})...`);
            skippedCount++;
            continue;
        }
        foundStartContract = true; // Start processing from now on
        */
        if (!contractName || !address) {
            console.warn('Skipping entry with missing contractName or address:', entry);
            skippedCount++;
            continue;
        }

        if (SKIP_VERIFICATION.includes(contractName)) {
             console.log(`Skipping verification for ${contractName} as per configuration.`);
             skippedCount++;
             continue;
        }

        console.log(`
--- Verifying ${contractName} at ${address} ---`);

        const constructorArgs = cleanArguments(originalArgs);
        const contractPath = await findContractPath(contractName);

        // Skip if path not found (error already logged by findContractPath)
        if (!contractPath) {
            failedCount++;
            continue;
        }

        // Extract the actual contract name from the file path
        const actualContractName = path.basename(contractPath, '.sol');

        // Construct the fully qualified name required by the verify task
        const fullyQualifiedName = `${contractPath}:${actualContractName}`;

        try {
            console.log(`Running verification for ${contractName}...`);
            console.log(`  Address: ${address}`);
            console.log(`  Contract Path: ${contractPath}`);
            console.log(`  Constructor Args: ${JSON.stringify(constructorArgs)}`);

            await hre.run('verify:verify', {
                address: address,
                constructorArguments: constructorArgs,
                contract: fullyQualifiedName,
                // noCompile: true, // Optional: uncomment if contracts are already compiled
            });
            console.log(`Successfully verified ${contractName} at ${address}`);
            verifiedCount++;
        } catch (error) {
            if (error.message.toLowerCase().includes('already verified') || error.message.toLowerCase().includes('contract source code already verified')) {
                console.log(`${contractName} at ${address} is already verified.`);
                verifiedCount++; // Count as success if already verified
            } else if (error.message.toLowerCase().includes('does not match the deployment bytecode')) {
                 console.error(`Verification failed for ${contractName} at ${address}: Bytecode mismatch.`);
                 console.error("  >> Check if the correct source file/commit is used or if arguments are mismatched.");
                 failedCount++;
            } else {
                console.error(`Verification failed for ${contractName} at ${address}:`, error.message);
                failedCount++;
            }
        }
         // Add a small delay to avoid hitting API rate limits
         await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second delay
    }

    console.log(`
--- Verification Summary ---`);
    console.log(`Successfully Verified (or already verified): ${verifiedCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log(`Failed: ${failedCount}`);
    console.log(`Total Entries Processed: ${deploymentLog.length}`);
}

main().catch((error) => {
    console.error("Unhandled error during verification script:", error);
    process.exitCode = 1;
}); 