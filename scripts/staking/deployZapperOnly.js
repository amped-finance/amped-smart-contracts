const { deployContract, contractAt, sendTxn } = require("../shared/helpers")
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying YieldBearingALPZapper with account:", deployer.address);
  
  // Existing contract addresses
  const yALP = "0xe0FBB9A23649f93C479C8995a43302f12A223B62";
  const contracts = {
    rewardRouter: "0x5b600cBD1f0E6805088396555fe0eD32E34c9b49",
    glpManager: "0x4DE729B85dDB172F1bb775882f355bA25764E430",
    fsALP: "0xB895e3DBFB37A4Cc6b4FB50B1cf903608e942FF9",
    weth: "0x50c42deacd8fc9773493ed674b675be577f2634b"
  };

  console.log("\n=== Deploying YieldBearingALPZapper ===");
  console.log("Parameters:");
  console.log("- RewardRouter:", contracts.rewardRouter);
  console.log("- GlpManager:", contracts.glpManager);
  console.log("- YieldBearingALP:", yALP);
  console.log("- fsALP:", contracts.fsALP);
  console.log("- WETH:", contracts.weth);

  try {
    const zapper = await deployContract("YieldBearingALPZapper", [
      contracts.rewardRouter,
      contracts.glpManager,
      yALP,
      contracts.fsALP,
      contracts.weth
    ]);

    console.log("\n✅ YieldBearingALPZapper deployed at:", zapper.address);
    
    // Verify it deployed correctly
    const code = await ethers.provider.getCode(zapper.address);
    console.log("Contract bytecode length:", code.length);
    console.log("Deployment successful:", code.length > 2);
    
    // Set the zapper in yALP
    console.log("\n=== Configuring YieldBearingALP ===");
    const yieldBearingALP = await contractAt("YieldBearingALP", yALP);
    
    // Check current zapper
    try {
      const currentZapper = await yieldBearingALP.zapper();
      console.log("Current zapper:", currentZapper);
      
      if (currentZapper === ethers.constants.AddressZero || currentZapper !== zapper.address) {
        console.log("Setting new zapper address...");
        await sendTxn(
          yieldBearingALP.setZapper(zapper.address),
          "yieldBearingALP.setZapper"
        );
        console.log("✅ Zapper set successfully!");
      } else {
        console.log("✅ Zapper already set correctly");
      }
    } catch (e) {
      console.log("Error checking/setting zapper:", e.message);
    }
    
    console.log("\n=== Deployment Complete ===");
    console.log("YieldBearingALPZapper:", zapper.address);
    console.log("\nYou can now use this address for zapping in!");
    
    // Save the address
    const fs = require('fs');
    const deploymentInfo = {
      network: "sonic",
      YieldBearingALP: yALP,
      YieldBearingALPZapper: zapper.address,
      YieldBearingALPZapperOut: "0x015ed211A14Ee0C9B158A4d3BE0fB0Cc64B0F382",
      deployedAt: new Date().toISOString()
    };
    
    fs.writeFileSync(
      `./scripts/staking/zapper-deployment-${Date.now()}.json`,
      JSON.stringify(deploymentInfo, null, 2)
    );
    
    return zapper.address;
    
  } catch (error) {
    console.error("\n❌ Deployment failed:", error.message);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });