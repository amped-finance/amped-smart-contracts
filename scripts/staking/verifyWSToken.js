const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  
  // The WS address from deployment
  const WS = "0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38";
  
  console.log("Verifying Wrapped Sonic (WS) token on Sonic network");
  console.log("Connected to network:", (await ethers.provider.getNetwork()).name);
  console.log("Chain ID:", (await ethers.provider.getNetwork()).chainId);
  console.log("WS Address:", WS);
  console.log("Your address:", signer.address);
  
  // Check if contract exists
  const code = await ethers.provider.getCode(WS);
  console.log("\nContract bytecode length:", code.length);
  console.log("Contract exists:", code.length > 2);
  
  if (code.length <= 2) {
    console.log("❌ No contract at this address!");
    return;
  }
  
  try {
    // Use standard ERC20 interface
    const ws = await ethers.getContractAt("IERC20", WS);
    
    console.log("\n=== Testing Standard ERC20 Functions ===");
    
    // Test each function individually with try-catch
    try {
      const name = await ws.name();
      console.log("✅ name():", name);
    } catch (e) {
      console.log("❌ name() failed:", e.message);
    }
    
    try {
      const symbol = await ws.symbol();
      console.log("✅ symbol():", symbol);
    } catch (e) {
      console.log("❌ symbol() failed:", e.message);
    }
    
    try {
      const decimals = await ws.decimals();
      console.log("✅ decimals():", decimals);
    } catch (e) {
      console.log("❌ decimals() failed:", e.message);
    }
    
    try {
      const totalSupply = await ws.totalSupply();
      console.log("✅ totalSupply():", ethers.utils.formatEther(totalSupply));
    } catch (e) {
      console.log("❌ totalSupply() failed:", e.message);
    }
    
    try {
      const balance = await ws.balanceOf(signer.address);
      console.log("✅ balanceOf():", ethers.utils.formatEther(balance));
    } catch (e) {
      console.log("❌ balanceOf() failed:", e.message);
    }
    
    // Test allowance
    try {
      const allowance = await ws.allowance(signer.address, signer.address);
      console.log("✅ allowance():", allowance.toString());
    } catch (e) {
      console.log("❌ allowance() failed:", e.message);
    }
    
    // Test approve with a small amount
    console.log("\n=== Testing Approve Function ===");
    try {
      const testAmount = ethers.utils.parseEther("0.001");
      console.log("Attempting to approve 0.001 tokens...");
      const tx = await ws.approve(signer.address, testAmount);
      console.log("✅ approve() transaction sent:", tx.hash);
      await tx.wait();
      console.log("✅ approve() confirmed!");
      
      // Check the allowance was set
      const newAllowance = await ws.allowance(signer.address, signer.address);
      console.log("New allowance:", ethers.utils.formatEther(newAllowance));
    } catch (e) {
      console.log("❌ approve() failed:", e.message);
    }
    
    // Let's also check what the actual contract ABI might be
    console.log("\n=== Checking Contract Interface ===");
    
    // Try to call functions directly with ethers.provider.call
    const iface = new ethers.utils.Interface([
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function decimals() view returns (uint8)",
      "function approve(address spender, uint256 amount) returns (bool)",
      "function transfer(address to, uint256 amount) returns (bool)"
    ]);
    
    try {
      // Try symbol() with direct call
      const symbolData = iface.encodeFunctionData("symbol", []);
      const symbolResult = await ethers.provider.call({
        to: WS,
        data: symbolData
      });
      const decodedSymbol = iface.decodeFunctionResult("symbol", symbolResult);
      console.log("Direct call symbol():", decodedSymbol[0]);
    } catch (e) {
      console.log("Direct call to symbol() failed:", e.message);
    }
    
  } catch (error) {
    console.error("\n❌ Unexpected error:", error.message);
  }
  
  // Double check we're on the right network
  console.log("\n=== Network Verification ===");
  const network = await ethers.provider.getNetwork();
  console.log("Network name:", network.name);
  console.log("Chain ID:", network.chainId);
  console.log("RPC URL being used:", ethers.provider.connection.url);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });