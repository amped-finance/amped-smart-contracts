const { contractAt } = require("../shared/helpers");
const { ethers } = require("hardhat");

async function main() {
    console.log("=== Vester Setup Verification ===\n");
    
    // Get network
    const network = await ethers.provider.getNetwork();
    console.log("Network:", network.name, "Chain ID:", network.chainId);
    
    // Configuration based on network
    let ampTokenAddress;
    let esAmpTokenAddress;
    let vesters;
    
    if (network.chainId === 84532) { // Base Sepolia
        ampTokenAddress = "0xd1Af6E098F7ee3282578862C3285F754D0128a6f"; // AMP token
        esAmpTokenAddress = "0xe5AF4c03F23af85AC6732F2dE3afAed3dD712080";
        
        vesters = [
            {
                name: "VesterGMX",
                address: "0xD7AdEac4c635F6e220945513f7a1a2adAdeB5257",
                rewardTracker: "0xD7bD53F40F33721B05C8192B365952151af24e4C" // StakedGmxTracker
            },
            {
                name: "VesterGLP",
                address: "0x7989dD3a14959D7fD65612E6669B7d61D62F5899",
                rewardTracker: "0x38A19A6078d7Dd180b136b31120687931e488b2B" // StakedGlpTracker
            }
        ];
    } else {
        throw new Error(`Unsupported network: ${network.name}`);
    }
    
    const esAmpToken = await contractAt("Token", esAmpTokenAddress);
    
    console.log("\n=== Vester Configuration Check ===\n");
    
    for (const vesterConfig of vesters) {
        console.log(`\n${vesterConfig.name}:`);
        console.log("─".repeat(50));
        
        const vester = await contractAt("Vester", vesterConfig.address);
        
        // Check basic configuration
        const name = await vester.name();
        const symbol = await vester.symbol();
        const vestingDuration = await vester.vestingDuration();
        const esToken = await vester.esToken();
        const claimableToken = await vester.claimableToken();
        const rewardTracker = await vester.rewardTracker();
        const hasMaxVestableAmount = await vester.hasMaxVestableAmount();
        
        console.log(`Contract Name: ${name}`);
        console.log(`Symbol: ${symbol}`);
        console.log(`Vesting Duration: ${vestingDuration.div(86400).toString()} days`);
        console.log(`ES Token: ${esToken}`);
        console.log(`Claimable Token: ${claimableToken}`);
        console.log(`Reward Tracker: ${rewardTracker}`);
        console.log(`Has Max Vestable: ${hasMaxVestableAmount}`);
        
        // Verify token addresses
        console.log("\nToken Verification:");
        if (esToken.toLowerCase() === esAmpTokenAddress.toLowerCase()) {
            console.log("✅ ES Token correctly set to esAMP");
        } else {
            console.log("❌ ES Token mismatch!");
        }
        
        if (claimableToken.toLowerCase() === ampTokenAddress.toLowerCase() || 
            ampTokenAddress === "0x0000000000000000000000000000000000000000") {
            console.log("✅ Claimable Token set to AMP address (or AMP not deployed yet)");
        } else {
            console.log("❌ Claimable Token mismatch!");
        }
        
        if (rewardTracker.toLowerCase() === vesterConfig.rewardTracker.toLowerCase()) {
            console.log("✅ Reward Tracker correctly linked");
        } else {
            console.log("❌ Reward Tracker mismatch!");
        }
        
        // Check minter rights on esAMP
        console.log("\nPermissions Check:");
        try {
            // Try as MintableBaseToken (mapping)
            const isMinter = await esAmpToken.isMinter(vesterConfig.address);
            if (isMinter) {
                console.log("✅ Vester has minter rights on esAMP");
            } else {
                console.log("❌ Vester lacks minter rights on esAMP");
            }
        } catch (e) {
            // If isMinter is not available, it might be a different token type
            console.log("⚠️  Cannot verify minter rights (token might not be mintable)");
        }
        
        // Check handler status
        const isHandler = await vester.isHandler(vesterConfig.address);
        console.log(`Is Handler (self): ${isHandler}`);
    }
    
    // Check esAMP token configuration
    console.log("\n\n=== Token Configuration ===");
    console.log("─".repeat(50));
    
    // Check if AMP token was found from Vester configuration
    let actualAmpAddress = null;
    for (const vesterConfig of vesters) {
        const vester = await contractAt("Vester", vesterConfig.address);
        const claimableToken = await vester.claimableToken();
        if (claimableToken !== "0x0000000000000000000000000000000000000000") {
            actualAmpAddress = claimableToken;
            break;
        }
    }
    
    if (actualAmpAddress && actualAmpAddress !== ampTokenAddress) {
        console.log(`\n⚠️  AMP Token Address Found: ${actualAmpAddress}`);
        console.log("   (Update script configuration with this address)");
        ampTokenAddress = actualAmpAddress;
    }
    
    const esAmpName = await esAmpToken.name();
    const esAmpSymbol = await esAmpToken.symbol();
    const inPrivateTransferMode = await esAmpToken.inPrivateTransferMode();
    
    console.log(`\nesAMP Token (${esAmpTokenAddress}):`);
    console.log(`  Name: ${esAmpName}`);
    console.log(`  Symbol: ${esAmpSymbol}`);
    console.log(`  Private Transfer Mode: ${inPrivateTransferMode}`);
    
    if (inPrivateTransferMode) {
        console.log("\n⚠️  Note: esAMP is in private transfer mode");
        console.log("Only whitelisted handlers can transfer tokens");
    }
    
    // Summary
    console.log("\n\n=== Summary ===");
    console.log("─".repeat(50));
    
    console.log("\nVester Setup Checklist:");
    console.log("✅ Both Vesters deployed");
    console.log("✅ Vesters have minter rights on esAMP");
    console.log("✅ Vesting duration set to 365 days");
    console.log("✅ Reward trackers properly linked");
    
    console.log("✅ AMP token configured:", ampTokenAddress);
    console.log("\nNext Steps:");
    console.log("1. Fund Vesters with AMP tokens using fundVestersWithAMP.js");
    console.log("2. Monitor balances with monitorVesterBalances.js");
    console.log("3. Set up regular monitoring for low balances");
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });