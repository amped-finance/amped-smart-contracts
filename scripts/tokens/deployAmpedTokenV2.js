const { ethers } = require("hardhat");
const { getFrameSigner, deployContract, contractAt, expandDecimals, sleep } = require("../shared/helpers");

async function main() {
  const signer = await getFrameSigner();
  const network = (await ethers.provider.getNetwork()).name;
  
  console.log("Deploying AMPED Token V2 on", network);
  console.log("Deployer:", signer.address);

  // LayerZero V2 Endpoint addresses
  const endpoints = {
    ethereum: "0x1a44076050125825900e736c501f859c50fE728c",
    sepolia: "0x6EDCE65403992e310A62460808c4b910D972f10f",
    basesepolia: "0x6EDCE65403992e310A62460808c4b910D972f10f",
    sonic: "0x1a44076050125825900e736c501f859c50fE728c",
    bsc: "0x1a44076050125825900e736c501f859c50fE728c",
    // Add more as needed
  };

  const endpoint = endpoints[network];
  if (!endpoint) {
    throw new Error(`No LayerZero V2 endpoint configured for network: ${network}`);
  }

  console.log("Using LayerZero V2 Endpoint:", endpoint);

  // Deploy AMPED Token V2
  const ampedToken = await deployContract("AmpedTokenV2", [
    endpoint,         // LayerZero V2 endpoint
    signer.address    // Delegate address for initial voting power (can be address(0))
  ]);

  console.log("AMPED Token V2 deployed to:", ampedToken.address);
  
  // Verify initial supply
  const totalSupply = await ampedToken.totalSupply();
  console.log("Total Supply:", ethers.utils.formatEther(totalSupply));
  
  // Check deployer balance
  const balance = await ampedToken.balanceOf(signer.address);
  console.log("Deployer Balance:", ethers.utils.formatEther(balance));
  
  // Check token info
  const name = await ampedToken.name();
  const symbol = await ampedToken.symbol();
  const decimals = await ampedToken.decimals();
  console.log("Token Info:", { name, symbol, decimals });

  // Save deployment info
  const deploymentInfo = {
    network,
    ampedToken: ampedToken.address,
    layerZeroEndpoint: endpoint,
    deployer: signer.address,
    timestamp: new Date().toISOString()
  };

  console.log("\nDeployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Instructions for next steps
  console.log("\n=== Next Steps ===");
  console.log("1. Verify contract on explorer:");
  console.log(`   npx hardhat verify --network ${network} ${ampedToken.address} "${endpoint}" "${signer.address}"`);
  console.log("\n2. Configure cross-chain connections:");
  console.log("   - Update layerzero.config.ts with this contract address");
  console.log("   - Run: npx hardhat lz:oapp:wire --oapp-config layerzero.config.ts");
  console.log("\n3. Transfer ownership to multisig:");
  console.log("   - Call transferOwnership() with multisig address");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });