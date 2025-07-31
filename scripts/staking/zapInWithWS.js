const { ethers } = require("hardhat");
const { parseEther, parseUnits } = require("ethers/lib/utils");

async function main() {
  const [signer] = await ethers.getSigners();
  
  // Contract addresses
  const ZAPPER = "0x6e2E56Eb79B11a4D18e66Dc28cDaDdE8ffF5B727";
  const YALP = "0xe0FBB9A23649f93C479C8995a43302f12A223B62";
  const WS = "0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38"; // Wrapped Sonic
  
  console.log("Zapping in with Wrapped Sonic (WS)");
  console.log("Your address:", signer.address);
  
  const zapper = await ethers.getContractAt("YieldBearingALPZapper", ZAPPER);
  const yalp = await ethers.getContractAt("YieldBearingALP", YALP);
  const ws = await ethers.getContractAt("IERC20", WS);
  
  // Check WS token info
  const wsDecimals = await ws.decimals();
  const wsSymbol = await ws.symbol();
  console.log(`\n${wsSymbol} token decimals:`, wsDecimals);
  
  // Check balances before
  const wsBefore = await ws.balanceOf(signer.address);
  const yalpBefore = await yalp.balanceOf(signer.address);
  
  console.log(`\nYour WS balance: ${ethers.utils.formatUnits(wsBefore, wsDecimals)} ${wsSymbol}`);
  console.log(`Your yALP balance: ${ethers.utils.formatEther(yalpBefore)}`);
  
  // Amount to zap - 10 WS
  const amount = parseUnits("10", wsDecimals);
  
  if (wsBefore.lt(amount)) {
    console.log(`\n❌ Insufficient WS balance! You need at least 10 ${wsSymbol}`);
    console.log("\nTo get WS tokens, you can:");
    console.log("1. Wrap native Sonic (S) tokens at the WS contract");
    console.log("2. Swap for WS on a DEX");
    return;
  }
  
  console.log(`\n✅ Sufficient balance. Proceeding to zap in with 10 ${wsSymbol}...`);
  
  try {
    // Step 1: Approve WS spending
    console.log("\n1. Approving WS spending...");
    const currentAllowance = await ws.allowance(signer.address, ZAPPER);
    
    if (currentAllowance.lt(amount)) {
      const approveTx = await ws.approve(ZAPPER, amount);
      console.log(`Approval tx: ${approveTx.hash}`);
      await approveTx.wait();
      console.log("✅ Approved!");
    } else {
      console.log("✅ Already approved!");
    }
    
    // Step 2: Zap in
    console.log("\n2. Zapping in...");
    console.log("Parameters:");
    console.log(`- Token: ${WS} (${wsSymbol})`);
    console.log(`- Amount: ${ethers.utils.formatUnits(amount, wsDecimals)} ${wsSymbol}`);
    console.log("- MinUsdg: 0");
    console.log("- MinGlp: 0");
    
    const tx = await zapper.zapIn(
      WS,
      amount,
      0, // minUsdg
      0, // minGlp
      { gasLimit: 1500000 } // Increased gas limit
    );
    
    console.log(`\nTransaction sent: ${tx.hash}`);
    console.log("Waiting for confirmation...");
    
    const receipt = await tx.wait();
    console.log(`✅ Confirmed in block ${receipt.blockNumber}`);
    
    // Check balances after
    const wsAfter = await ws.balanceOf(signer.address);
    const yalpAfter = await yalp.balanceOf(signer.address);
    
    const wsUsed = wsBefore.sub(wsAfter);
    const yalpReceived = yalpAfter.sub(yalpBefore);
    
    console.log(`\n=== Results ===`);
    console.log(`WS spent: ${ethers.utils.formatUnits(wsUsed, wsDecimals)} ${wsSymbol}`);
    console.log(`yALP received: ${ethers.utils.formatEther(yalpReceived)}`);
    console.log(`\nNew balances:`);
    console.log(`- WS: ${ethers.utils.formatUnits(wsAfter, wsDecimals)} ${wsSymbol}`);
    console.log(`- yALP: ${ethers.utils.formatEther(yalpAfter)}`);
    
    // Check underlying value
    if (yalpAfter.gt(0)) {
      const underlyingValue = await yalp.convertToAssets(yalpAfter);
      console.log(`\nUnderlying fsALP value: ${ethers.utils.formatEther(underlyingValue)}`);
      
      const rate = underlyingValue.mul(parseEther("1")).div(yalpAfter);
      console.log(`Exchange rate: 1 yALP = ${ethers.utils.formatEther(rate)} fsALP`);
    }
    
  } catch (error) {
    console.error("\n❌ Error during zap in:", error.message);
    
    // Try to decode the error
    if (error.data) {
      console.log("\nError data:", error.data);
      
      // Common error signatures
      const errorSignatures = {
        "0x3d693ada": "Vault: forbidden",
        "0x7dc2da98": "Vault: token not whitelisted",
        "0xb21b13f6": "Vault: insufficient pool amount",
        "0x1e88ad5d": "Vault: max USDG exceeded",
        "0x": "Unknown error"
      };
      
      const errorSig = error.data.slice(0, 10);
      if (errorSignatures[errorSig]) {
        console.log("Decoded error:", errorSignatures[errorSig]);
      }
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });