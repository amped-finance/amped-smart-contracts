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
  
  // Create WS contract with explicit interface since getContractAt("IERC20") isn't working
  const ws = new ethers.Contract(WS, [
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function balanceOf(address) view returns (uint256)",
    "function totalSupply() view returns (uint256)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function transfer(address to, uint256 amount) returns (bool)"
  ], signer);
  
  try {
    // Get token info
    let wsSymbol = "wS"; // From our verification
    let wsDecimals = 18; // Standard for wrapped native tokens
    
    // Try to get symbol - use direct call if needed
    try {
      const iface = new ethers.utils.Interface(["function symbol() view returns (string)"]);
      const data = iface.encodeFunctionData("symbol", []);
      const result = await ethers.provider.call({ to: WS, data });
      wsSymbol = iface.decodeFunctionResult("symbol", result)[0];
    } catch (e) {
      console.log("Using default symbol: wS");
    }
    
    console.log(`\n${wsSymbol} token decimals: ${wsDecimals}`);
    
    // Check balances
    const wsBefore = await ws.balanceOf(signer.address);
    const yalpBefore = await yalp.balanceOf(signer.address);
    
    console.log(`\nYour ${wsSymbol} balance: ${ethers.utils.formatUnits(wsBefore, wsDecimals)}`);
    console.log(`Your yALP balance: ${ethers.utils.formatEther(yalpBefore)}`);
    
    // Amount to zap - 10 WS
    const amount = parseUnits("10", wsDecimals);
    
    if (wsBefore.lt(amount)) {
      console.log(`\n❌ Insufficient ${wsSymbol} balance! You have ${ethers.utils.formatUnits(wsBefore, wsDecimals)} but need 10`);
      return;
    }
    
    console.log(`\n✅ Sufficient balance. Proceeding to zap in with 10 ${wsSymbol}...`);
    
    // Step 1: Check current allowance
    console.log("\n1. Checking allowance...");
    const currentAllowance = await ws.allowance(signer.address, ZAPPER);
    console.log(`Current allowance: ${ethers.utils.formatUnits(currentAllowance, wsDecimals)} ${wsSymbol}`);
    
    // Step 2: Approve if needed
    if (currentAllowance.lt(amount)) {
      console.log("\n2. Approving WS spending...");
      const approveTx = await ws.approve(ZAPPER, amount);
      console.log(`Approval tx: ${approveTx.hash}`);
      console.log("Waiting for confirmation...");
      await approveTx.wait();
      console.log("✅ Approved!");
      
      // Verify approval
      const newAllowance = await ws.allowance(signer.address, ZAPPER);
      console.log(`New allowance: ${ethers.utils.formatUnits(newAllowance, wsDecimals)} ${wsSymbol}`);
    } else {
      console.log("✅ Already approved!");
    }
    
    // Step 3: Zap in
    console.log("\n3. Zapping in...");
    console.log("Parameters:");
    console.log(`- Token: ${WS} (${wsSymbol})`);
    console.log(`- Amount: ${ethers.utils.formatUnits(amount, wsDecimals)} ${wsSymbol}`);
    console.log("- MinUsdg: 0 (accepting any amount)");
    console.log("- MinGlp: 0 (accepting any amount)");
    
    const gasEstimate = await zapper.estimateGas.zapIn(WS, amount, 0, 0);
    console.log(`Estimated gas: ${gasEstimate.toString()}`);
    
    const tx = await zapper.zapIn(
      WS,
      amount,
      0, // minUsdg
      0, // minGlp
      { 
        gasLimit: gasEstimate.mul(120).div(100) // 20% buffer
      }
    );
    
    console.log(`\nTransaction sent: ${tx.hash}`);
    console.log("Waiting for confirmation...");
    
    const receipt = await tx.wait();
    console.log(`✅ Confirmed in block ${receipt.blockNumber}`);
    console.log(`Gas used: ${receipt.gasUsed.toString()}`);
    
    // Check balances after
    const wsAfter = await ws.balanceOf(signer.address);
    const yalpAfter = await yalp.balanceOf(signer.address);
    
    const wsUsed = wsBefore.sub(wsAfter);
    const yalpReceived = yalpAfter.sub(yalpBefore);
    
    console.log(`\n=== Results ===`);
    console.log(`${wsSymbol} spent: ${ethers.utils.formatUnits(wsUsed, wsDecimals)}`);
    console.log(`yALP received: ${ethers.utils.formatEther(yalpReceived)}`);
    console.log(`\nNew balances:`);
    console.log(`- ${wsSymbol}: ${ethers.utils.formatUnits(wsAfter, wsDecimals)}`);
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
    
    if (error.data) {
      console.log("\nError data:", error.data);
      
      // Try to decode vault errors
      const vaultErrors = {
        "0x3d693ada": "Vault: forbidden",
        "0x7dc2da98": "Vault: token not whitelisted", 
        "0xb21b13f6": "Vault: insufficient pool amount",
        "0x1e88ad5d": "Vault: max USDG exceeded"
      };
      
      const errorSig = error.data.slice(0, 10);
      if (vaultErrors[errorSig]) {
        console.log("Decoded error:", vaultErrors[errorSig]);
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