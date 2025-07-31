const { contractAt } = require("../shared/helpers");
const { ethers } = require("hardhat");

async function main() {
    console.log("=== Vester Balance Monitoring ===\n");
    
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
                name: "VesterGMX (AMP stakers)",
                address: "0xD7AdEac4c635F6e220945513f7a1a2adAdeB5257"
            },
            {
                name: "VesterGLP (ALP stakers)",
                address: "0x7989dD3a14959D7fD65612E6669B7d61D62F5899"
            }
        ];
    } else {
        throw new Error(`Unsupported network: ${network.name}`);
    }
    
    const esAmpToken = await contractAt("Token", esAmpTokenAddress);
    const ampToken = await contractAt("Token", ampTokenAddress);
    
    let alertsNeeded = false;
    const CRITICAL_RATIO = 0.5; // Alert if AMP balance < 50% of esAMP deposits
    const WARNING_RATIO = 0.75; // Warning if AMP balance < 75% of esAMP deposits
    
    for (const vesterConfig of vesters) {
        console.log(`\n${vesterConfig.name}:`);
        console.log(`Address: ${vesterConfig.address}`);
        console.log("─".repeat(50));
        
        const vester = await contractAt("Vester", vesterConfig.address);
        
        // Get esAMP deposits (total vesting)
        const totalSupply = await vester.totalSupply();
        const esAmpInVester = await esAmpToken.balanceOf(vesterConfig.address);
        
        console.log(`esAMP Deposited: ${ethers.utils.formatEther(totalSupply)} esAMP`);
        console.log(`esAMP Held: ${ethers.utils.formatEther(esAmpInVester)} esAMP`);
        
        if (ampToken) {
            // Get AMP balance
            const ampBalance = await ampToken.balanceOf(vesterConfig.address);
            console.log(`AMP Balance: ${ethers.utils.formatEther(ampBalance)} AMP`);
            
            // Calculate coverage ratio
            if (totalSupply.gt(0)) {
                const ratio = ampBalance.mul(100).div(totalSupply);
                console.log(`Coverage Ratio: ${ratio.toString()}%`);
                
                // Determine status
                if (ampBalance.gte(totalSupply)) {
                    console.log(`Status: ✅ Fully Funded (${ethers.utils.formatEther(ampBalance.sub(totalSupply))} AMP surplus)`);
                } else {
                    const shortfall = totalSupply.sub(ampBalance);
                    const ratioFloat = parseFloat(ethers.utils.formatEther(ampBalance)) / parseFloat(ethers.utils.formatEther(totalSupply));
                    
                    if (ratioFloat < CRITICAL_RATIO) {
                        console.log(`Status: 🚨 CRITICAL (${ethers.utils.formatEther(shortfall)} AMP shortfall)`);
                        alertsNeeded = true;
                    } else if (ratioFloat < WARNING_RATIO) {
                        console.log(`Status: ⚠️  WARNING (${ethers.utils.formatEther(shortfall)} AMP shortfall)`);
                        alertsNeeded = true;
                    } else {
                        console.log(`Status: ⚠️  Low (${ethers.utils.formatEther(shortfall)} AMP shortfall)`);
                    }
                }
                
                // Estimate days until depletion (rough estimate)
                if (ampBalance.gt(0) && totalSupply.gt(0)) {
                    // Assume linear vesting over 365 days
                    const dailyVesting = totalSupply.div(365);
                    const daysRemaining = ampBalance.div(dailyVesting);
                    console.log(`Estimated Days Until Empty: ${daysRemaining.toString()} days`);
                }
            }
        } else {
            console.log("AMP Balance: [AMP token not deployed]");
        }
        
        // Get vesting statistics
        try {
            const vestingDuration = await vester.vestingDuration();
            console.log(`Vesting Duration: ${vestingDuration.div(86400).toString()} days`);
        } catch (e) {
            console.log("Vesting Duration: 365 days");
        }
    }
    
    // Summary and recommendations
    console.log("\n" + "=".repeat(60));
    console.log("SUMMARY");
    console.log("=".repeat(60));
    
    if (alertsNeeded) {
        console.log("\n🚨 ACTION REQUIRED: One or more Vesters need AMP funding!");
        console.log("\nRecommended actions:");
        console.log("1. Run: npx hardhat run scripts/staking/fundVestersWithAMP.js --network " + network.name);
        console.log("2. Fund with at least 1:1 ratio of AMP to esAMP deposits");
        console.log("3. Consider adding buffer (1.5x) for safety");
    } else if (ampToken) {
        console.log("\n✅ All Vesters adequately funded");
        console.log("\nRecommendations:");
        console.log("1. Continue monitoring regularly");
        console.log("2. Set up automated alerts for low balances");
        console.log("3. Refill when coverage drops below 75%");
    } else {
        console.log("\n⚠️  Cannot fully assess - AMP token not deployed");
        console.log("\nNext steps:");
        console.log("1. Deploy AMP token");
        console.log("2. Update script with AMP address");
        console.log("3. Fund Vesters before users start vesting");
    }
    
    // Create alert script command
    console.log("\n📊 Quick Check Command:");
    console.log(`npx hardhat run scripts/staking/monitorVesterBalances.js --network ${network.name}`);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });