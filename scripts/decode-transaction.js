const { ethers } = require("hardhat");

async function main() {
    // Transaction data from the failed transaction
    const txData = "0x0e0dc4260000000000000000000000005b8caae7cc6ea61fb96fd251c4bc13e48749c7da000000000000000000000000d3dce716f3ef535c5ff8d041c1a41c3bd89b97ae0000000000000000000000000000000000000000000000000000000000000fa000000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000000000000009c40000000000000000000000000000000000000000000000000000000012a05f200000000000000000000000000000000000000000000000704b0c20a2107357fbf";
    
    // Function signature for setTokenConfig
    const iface = new ethers.utils.Interface([
        "function setTokenConfig(address _vault, address _token, uint256 _tokenWeight, uint256 _minProfitBps, uint256 _maxUsdgAmount, uint256 _bufferAmount, uint256 _usdgAmount)"
    ]);
    
    console.log("Decoding failed transaction data...\n");
    
    try {
        const decoded = iface.parseTransaction({ data: txData });
        console.log("Function:", decoded.name);
        console.log("Parameters:");
        console.log("  _vault:", decoded.args._vault);
        console.log("  _token:", decoded.args._token);
        console.log("  _tokenWeight:", decoded.args._tokenWeight.toString());
        console.log("  _minProfitBps:", decoded.args._minProfitBps.toString());
        console.log("  _maxUsdgAmount:", decoded.args._maxUsdgAmount.toString());
        console.log("  _bufferAmount:", decoded.args._bufferAmount.toString());
        console.log("  _usdgAmount:", decoded.args._usdgAmount.toString());
        
        console.log("\nFormatted values:");
        console.log("  Token Weight:", decoded.args._tokenWeight.toString(), "(", (decoded.args._tokenWeight.toNumber() / 100).toFixed(2) + "% )");
        console.log("  Min Profit BPS:", decoded.args._minProfitBps.toString(), "(", (decoded.args._minProfitBps.toNumber() / 100).toFixed(2) + "% )");
        console.log("  Max USDG Amount:", ethers.utils.formatUnits(decoded.args._maxUsdgAmount, 18), "USDG");
        console.log("  Buffer Amount:", decoded.args._bufferAmount.toString(), "(raw)");
        console.log("  Current USDG Amount:", ethers.utils.formatUnits(decoded.args._usdgAmount, 18), "USDG");
        
        // Check if the issue might be with the USDG amount being too high
        const maxUsdgAmount = decoded.args._maxUsdgAmount;
        const currentUsdgAmount = decoded.args._usdgAmount;
        
        console.log("\n=== POTENTIAL ISSUES ===");
        
        if (currentUsdgAmount.gt(maxUsdgAmount)) {
            console.log("❌ PROBLEM: Current USDG amount exceeds max USDG amount!");
            console.log("  Current:", ethers.utils.formatUnits(currentUsdgAmount, 18));
            console.log("  Max:", ethers.utils.formatUnits(maxUsdgAmount, 18));
            console.log("  Difference:", ethers.utils.formatUnits(currentUsdgAmount.sub(maxUsdgAmount), 18));
        } else {
            console.log("✅ USDG amounts are within limits");
        }
        
        if (decoded.args._minProfitBps.gt(500)) {
            console.log("❌ PROBLEM: minProfitBps exceeds 500!");
        } else {
            console.log("✅ minProfitBps is valid");
        }
        
        // Check for potential overflow issues
        console.log("\n=== VALUE ANALYSIS ===");
        console.log("Buffer amount as SCUSD (6 decimals):", ethers.utils.formatUnits(decoded.args._bufferAmount, 6));
        
    } catch (error) {
        console.error("Error decoding transaction:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 