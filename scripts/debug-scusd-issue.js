const { getFrameSigner, contractAt } = require("./shared/helpers");

async function main() {
    const signer = await getFrameSigner();
    const signerAddress = await signer.getAddress();
    
    // Sonic network addresses
    const vaultAddress = "0x5B8caae7cC6Ea61fb96Fd251C4Bc13e48749C7Da";
    const timelockAddress = "0xE97055C9087458434bf95dedA69531408cC210b5";
    const scusdAddress = "0xd3dce716f3ef535c5ff8d041c1a41c3bd89b97ae";
    
    console.log("Debugging SCUSD setTokenConfig failure...");
    console.log("Signer:", signerAddress);
    console.log("SCUSD address:", scusdAddress);
    
    // Connect to contracts
    const vault = await contractAt("Vault", vaultAddress, signer);
    const timelock = await contractAt("Timelock", timelockAddress, signer);
    
    console.log("\n=== PERMISSION CHECKS ===");
    const isHandler = await timelock.isHandler(signerAddress);
    const isKeeper = await timelock.isKeeper(signerAddress);
    const admin = await timelock.admin();
    
    console.log("Is Handler:", isHandler);
    console.log("Is Keeper:", isKeeper);
    console.log("Is Admin:", admin.toLowerCase() === signerAddress.toLowerCase());
    console.log("Timelock Admin:", admin);
    
    console.log("\n=== TOKEN VALIDATION CHECKS ===");
    
    // Check if SCUSD is whitelisted
    const isWhitelisted = await vault.whitelistedTokens(scusdAddress);
    console.log("Is SCUSD whitelisted:", isWhitelisted);
    
    if (!isWhitelisted) {
        console.log("❌ PROBLEM FOUND: SCUSD is not whitelisted in the vault!");
        console.log("You need to whitelist SCUSD first before setting its config.");
        return;
    }
    
    // Check token properties
    const tokenDecimals = await vault.tokenDecimals(scusdAddress);
    const isStable = await vault.stableTokens(scusdAddress);
    const isShortable = await vault.shortableTokens(scusdAddress);
    
    console.log("Token decimals:", tokenDecimals.toString());
    console.log("Is stable token:", isStable);
    console.log("Is shortable token:", isShortable);
    
    // Check current token config
    console.log("\n=== CURRENT TOKEN CONFIG ===");
    const currentWeight = await vault.tokenWeights(scusdAddress);
    const currentMaxUsdg = await vault.maxUsdgAmounts(scusdAddress);
    const currentMinProfit = await vault.minProfitBasisPoints(scusdAddress);
    const currentBuffer = await vault.bufferAmounts(scusdAddress);
    const currentUsdg = await vault.usdgAmounts(scusdAddress);
    
    console.log("Current weight:", currentWeight.toString());
    console.log("Current maxUsdgAmount:", currentMaxUsdg.toString());
    console.log("Current minProfitBps:", currentMinProfit.toString());
    console.log("Current bufferAmount:", currentBuffer.toString());
    console.log("Current usdgAmount:", currentUsdg.toString());
    
    console.log("\n=== PROPOSED CONFIG VALUES ===");
    // Values from the failed transaction
    const proposedWeight = 4000;
    const proposedMinProfit = 20;
    const proposedMaxUsdg = 40000;
    const proposedBuffer = "5000000000"; // This looks like it's for 6 decimal token
    const proposedUsdg = "115808631455191886011391"; // From transaction data
    
    console.log("Proposed weight:", proposedWeight);
    console.log("Proposed minProfitBps:", proposedMinProfit);
    console.log("Proposed maxUsdgAmount:", proposedMaxUsdg);
    console.log("Proposed bufferAmount:", proposedBuffer);
    console.log("Proposed usdgAmount:", proposedUsdg);
    
    // Validate proposed values
    console.log("\n=== VALIDATION CHECKS ===");
    console.log("MinProfitBps <= 500:", proposedMinProfit <= 500);
    
    // Check vault state
    console.log("\n=== VAULT STATE ===");
    const totalTokenWeights = await vault.totalTokenWeights();
    console.log("Total token weights:", totalTokenWeights.toString());
    
    // Try to identify the specific revert reason
    console.log("\n=== ATTEMPTING DRY RUN ===");
    try {
        // Try to call the function with callStatic to see the revert reason
        await timelock.callStatic.setTokenConfig(
            vaultAddress,
            scusdAddress,
            proposedWeight,
            proposedMinProfit,
            proposedMaxUsdg,
            proposedBuffer,
            proposedUsdg
        );
        console.log("✅ Dry run succeeded - the transaction should work!");
    } catch (error) {
        console.log("❌ Dry run failed with error:");
        console.log(error.reason || error.message);
        
        // Try to decode the error
        if (error.data) {
            console.log("Error data:", error.data);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 