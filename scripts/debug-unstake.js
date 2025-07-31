const { ethers } = require("hardhat");

async function main() {
    const userAddress = "0x65DbeA97786312C7107496413fa3689d38d16Df0";
    const stakingRouterAddress = "0xF006D92BD50Ba0Ee7bE2ACa40a004958c75CF3B3";
    const unstakeAmount = ethers.utils.parseEther("2000"); // 2000 tokens from the error data
    
    console.log("Debugging unstake issue for user:", userAddress);
    console.log("Unstake amount:", ethers.utils.formatEther(unstakeAmount));
    
    // Get the staking router contract
    const stakingRouter = await ethers.getContractAt("AmpedStakingRouter", stakingRouterAddress);
    
    // Get reward tracker addresses
    const stakedGmxTracker = await stakingRouter.stakedGmxTracker();
    const bonusGmxTracker = await stakingRouter.bonusGmxTracker();
    const feeGmxTracker = await stakingRouter.feeGmxTracker();
    
    console.log("\nReward Tracker Addresses:");
    console.log("stakedGmxTracker:", stakedGmxTracker);
    console.log("bonusGmxTracker:", bonusGmxTracker);
    console.log("feeGmxTracker:", feeGmxTracker);
    
    // Check if trackers are set
    if (stakedGmxTracker === ethers.constants.AddressZero ||
        bonusGmxTracker === ethers.constants.AddressZero ||
        feeGmxTracker === ethers.constants.AddressZero) {
        console.log("\n❌ ERROR: One or more reward trackers are not set!");
        return;
    }
    
    // Get reward tracker contracts
    const stakedTracker = await ethers.getContractAt("RewardTracker", stakedGmxTracker);
    const bonusTracker = await ethers.getContractAt("RewardTracker", bonusGmxTracker);
    const feeTracker = await ethers.getContractAt("RewardTracker", feeGmxTracker);
    
    // Check user balances in each tracker
    console.log("\nUser Balances in Reward Trackers:");
    
    const stakedBalance = await stakedTracker.balanceOf(userAddress);
    console.log("stakedGmxTracker balance:", ethers.utils.formatEther(stakedBalance));
    
    const bonusBalance = await bonusTracker.balanceOf(userAddress);
    console.log("bonusGmxTracker balance:", ethers.utils.formatEther(bonusBalance));
    
    const feeBalance = await feeTracker.balanceOf(userAddress);
    console.log("feeGmxTracker balance:", ethers.utils.formatEther(feeBalance));
    
    // Check which tracker has insufficient balance
    console.log("\nBalance Check:");
    console.log("Unstake amount:", ethers.utils.formatEther(unstakeAmount));
    
    if (feeBalance.lt(unstakeAmount)) {
        console.log("❌ feeGmxTracker has insufficient balance!");
        console.log("Required:", ethers.utils.formatEther(unstakeAmount));
        console.log("Available:", ethers.utils.formatEther(feeBalance));
        console.log("Shortfall:", ethers.utils.formatEther(unstakeAmount.sub(feeBalance)));
    } else {
        console.log("✅ feeGmxTracker has sufficient balance");
    }
    
    if (bonusBalance.lt(unstakeAmount)) {
        console.log("❌ bonusGmxTracker has insufficient balance!");
        console.log("Required:", ethers.utils.formatEther(unstakeAmount));
        console.log("Available:", ethers.utils.formatEther(bonusBalance));
        console.log("Shortfall:", ethers.utils.formatEther(unstakeAmount.sub(bonusBalance)));
    } else {
        console.log("✅ bonusGmxTracker has sufficient balance");
    }
    
    if (stakedBalance.lt(unstakeAmount)) {
        console.log("❌ stakedGmxTracker has insufficient balance!");
        console.log("Required:", ethers.utils.formatEther(unstakeAmount));
        console.log("Available:", ethers.utils.formatEther(stakedBalance));
        console.log("Shortfall:", ethers.utils.formatEther(unstakeAmount.sub(stakedBalance)));
    } else {
        console.log("✅ stakedGmxTracker has sufficient balance");
    }
    
    // Check staked amounts in each tracker
    console.log("\nStaked Amounts in Reward Trackers:");
    
    const stakedAmount = await stakedTracker.stakedAmounts(userAddress);
    console.log("stakedGmxTracker staked amount:", ethers.utils.formatEther(stakedAmount));
    
    const bonusStakedAmount = await bonusTracker.stakedAmounts(userAddress);
    console.log("bonusGmxTracker staked amount:", ethers.utils.formatEther(bonusStakedAmount));
    
    const feeStakedAmount = await feeTracker.stakedAmounts(userAddress);
    console.log("feeGmxTracker staked amount:", ethers.utils.formatEther(feeStakedAmount));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 