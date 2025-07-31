const { contractAt, sendTxn } = require("../shared/helpers");
const { ethers } = require("hardhat");

async function main() {
    const signer = await ethers.getSigner();
    console.log("Funding Vester contracts with AMP tokens");
    console.log("Signer address:", signer.address);
    
    // Get network
    const network = await ethers.provider.getNetwork();
    console.log("Network:", network.name, "Chain ID:", network.chainId);
    
    // Configuration based on network
    let ampTokenAddress;
    let vesterGMXAddress;
    let vesterGLPAddress;
    
    if (network.chainId === 84532) { // Base Sepolia
        ampTokenAddress = "0xd1Af6E098F7ee3282578862C3285F754D0128a6f"; // AMP token
        vesterGMXAddress = "0xD7AdEac4c635F6e220945513f7a1a2adAdeB5257";
        vesterGLPAddress = "0x7989dD3a14959D7fD65612E6669B7d61D62F5899";
    } else {
        throw new Error(`Unsupported network: ${network.name}`);
    }
    
    // Configuration for funding amounts
    const fundingConfig = [
        {
            name: "VesterGMX (for AMP stakers)",
            address: vesterGMXAddress,
            amountInTokens: "50000" // 50,000 AMP tokens
        },
        {
            name: "VesterGLP (for ALP stakers)", 
            address: vesterGLPAddress,
            amountInTokens: "50000" // 50,000 AMP tokens
        }
    ];
    
    // Get contracts
    const ampToken = await contractAt("Token", ampTokenAddress);
    
    // Check signer's AMP balance
    const signerBalance = await ampToken.balanceOf(signer.address);
    console.log("\nSigner AMP balance:", ethers.utils.formatEther(signerBalance), "AMP");
    
    // Calculate total required
    let totalRequired = ethers.BigNumber.from(0);
    for (const config of fundingConfig) {
        totalRequired = totalRequired.add(ethers.utils.parseEther(config.amountInTokens));
    }
    console.log("Total AMP required:", ethers.utils.formatEther(totalRequired), "AMP");
    
    if (signerBalance.lt(totalRequired)) {
        console.error("\nERROR: Insufficient AMP balance");
        console.error("Required:", ethers.utils.formatEther(totalRequired), "AMP");
        console.error("Available:", ethers.utils.formatEther(signerBalance), "AMP");
        console.error("Shortfall:", ethers.utils.formatEther(totalRequired.sub(signerBalance)), "AMP");
        return;
    }
    
    console.log("\n=== Current Vester Balances ===");
    
    // Check current balances and calculate requirements
    for (const config of fundingConfig) {
        const currentBalance = await ampToken.balanceOf(config.address);
        console.log(`\n${config.name}:`);
        console.log(`  Address: ${config.address}`);
        console.log(`  Current Balance: ${ethers.utils.formatEther(currentBalance)} AMP`);
        console.log(`  Target Funding: ${config.amountInTokens} AMP`);
        
        // Also check vesting statistics
        const vester = await contractAt("Vester", config.address);
        const totalSupply = await vester.totalSupply();
        console.log(`  Total esAMP Deposited: ${ethers.utils.formatEther(totalSupply)} esAMP`);
        
        // Calculate approximate AMP needed based on esAMP deposits
        if (totalSupply.gt(0)) {
            console.log(`  Recommended AMP Reserve: ${ethers.utils.formatEther(totalSupply)} AMP (1:1 with esAMP)`);
        }
    }
    
    // Confirmation
    console.log("\n=== Funding Plan ===");
    for (const config of fundingConfig) {
        console.log(`${config.name}: ${config.amountInTokens} AMP`);
    }
    
    console.log("\nProceed with funding? (Check amounts carefully)");
    console.log("Note: This will transfer AMP tokens to the Vester contracts");
    
    // Add 5 second delay for safety
    console.log("\nStarting in 5 seconds... (Ctrl+C to cancel)");
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Execute funding
    console.log("\n=== Executing Funding Transactions ===");
    
    for (const config of fundingConfig) {
        const amount = ethers.utils.parseEther(config.amountInTokens);
        const currentBalance = await ampToken.balanceOf(config.address);
        
        console.log(`\nFunding ${config.name}...`);
        console.log(`  Amount: ${config.amountInTokens} AMP`);
        console.log(`  Before: ${ethers.utils.formatEther(currentBalance)} AMP`);
        
        await sendTxn(
            ampToken.transfer(config.address, amount),
            `Transfer ${config.amountInTokens} AMP to ${config.name}`
        );
        
        // Verify new balance
        const newBalance = await ampToken.balanceOf(config.address);
        console.log(`  After: ${ethers.utils.formatEther(newBalance)} AMP`);
        console.log(`  Increase: ${ethers.utils.formatEther(newBalance.sub(currentBalance))} AMP`);
    }
    
    // Final verification
    console.log("\n=== Final Vester Balances ===");
    
    for (const config of fundingConfig) {
        const finalBalance = await ampToken.balanceOf(config.address);
        const vester = await contractAt("Vester", config.address);
        const totalSupply = await vester.totalSupply();
        
        console.log(`\n${config.name}:`);
        console.log(`  AMP Balance: ${ethers.utils.formatEther(finalBalance)} AMP`);
        console.log(`  esAMP Deposits: ${ethers.utils.formatEther(totalSupply)} esAMP`);
        
        if (finalBalance.gte(totalSupply)) {
            console.log(`  Status: ✅ Sufficient (${ethers.utils.formatEther(finalBalance.sub(totalSupply))} AMP surplus)`);
        } else {
            console.log(`  Status: ⚠️  Low (${ethers.utils.formatEther(totalSupply.sub(finalBalance))} AMP shortfall)`);
        }
    }
    
    console.log("\n✅ Vester funding complete!");
    console.log("\nNext steps:");
    console.log("1. Monitor vester balances as users deposit esAMP");
    console.log("2. Refill when balances get low");
    console.log("3. Set up monitoring alerts for low balances");
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });