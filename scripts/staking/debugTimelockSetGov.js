const { contractAt } = require("../shared/helpers");
const { ethers } = require("hardhat");

async function debugTimelockSetGov() {
  const timelockAddress = "0x51A083F57845409e501C1a608b2119eEBA2D51F9";
  const swapRouterAddress = "0xF481FBEF43568512EA211A249670A9E06397d350";
  
  console.log("Debugging Timelock setGov issue...");
  console.log("Timelock:", timelockAddress);
  console.log("SwapRouter:", swapRouterAddress);
  
  // Get contracts
  const timelock = await contractAt("Timelock", timelockAddress);
  const swapRouter = await contractAt("AmpedSwapRouter", swapRouterAddress);
  
  // Check current gov
  const currentGov = await swapRouter.gov();
  console.log("\nCurrent SwapRouter gov:", currentGov);
  
  // Check if timelock is the current gov
  if (currentGov.toLowerCase() === timelockAddress.toLowerCase()) {
    console.log("✓ Timelock is already the gov");
  } else {
    console.log("✗ Timelock is NOT the gov");
    console.log("You need to first set the Timelock as gov directly");
    return;
  }
  
  // Check timelock buffer
  const buffer = await timelock.buffer();
  console.log("\nTimelock buffer:", buffer.toString(), "seconds");
  
  // Calculate action hash for signalSetGov
  const newGov = "0x65dbea97786312c7107496413fa3689d38d16df0"; // Example: your address (lowercase from tx)
  const actionHash = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(
      ["string", "address", "address"],
      ["setGov", swapRouterAddress, newGov]
    )
  );
  console.log("\nAction hash for setGov:", actionHash);
  
  // Check if action is pending
  const pendingTime = await timelock.pendingActions(actionHash);
  console.log("Pending action time:", pendingTime.toString());
  
  if (pendingTime.eq(0)) {
    console.log("\n✗ Action not signaled yet");
    console.log("You need to call signalSetGov first:");
    console.log(`await timelock.signalSetGov("${swapRouterAddress}", "${newGov}")`);
  } else {
    const currentTime = Math.floor(Date.now() / 1000);
    const executeTime = pendingTime.add(buffer).toNumber();
    console.log("\nCurrent time:", currentTime);
    console.log("Can execute at:", executeTime);
    
    if (currentTime >= executeTime) {
      console.log("✓ Action can be executed now");
      console.log(`await timelock.setGov("${swapRouterAddress}", "${newGov}")`);
    } else {
      const waitTime = executeTime - currentTime;
      console.log(`✗ Need to wait ${waitTime} more seconds (${(waitTime / 60).toFixed(1)} minutes)`);
    }
  }
  
  // Check timelock admin
  const timelockAdmin = await timelock.admin();
  console.log("\nTimelock admin:", timelockAdmin);
  
  const [signer] = await ethers.getSigners();
  console.log("Current signer:", signer.address);
  
  if (timelockAdmin.toLowerCase() !== signer.address.toLowerCase()) {
    console.log("✗ You are not the timelock admin");
  } else {
    console.log("✓ You are the timelock admin");
  }
}

module.exports = {
  debugTimelockSetGov
};

if (require.main === module) {
  debugTimelockSetGov()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}