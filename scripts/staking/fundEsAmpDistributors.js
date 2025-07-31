const { contractAt, sendTxn } = require("../shared/helpers");
const { ethers } = require("hardhat");

async function main() {
    const signer = await ethers.getSigner();
    const esAMP = await contractAt("Token", "0xe5AF4c03F23af85AC6732F2dE3afAed3dD712080");
    
    // Configuration
    const distributions = [
        {
            name: "ALP Stakers Distributor",
            address: "0xD230D541EaAF52B1a30Af5c324887c9E1AA72DE5",
            monthlyAmount: "1000",
            monthsToFund: 3
        },
        {
            name: "AMP Stakers Distributor", 
            address: "0x9abD164Ab39Cd664538DAC08f16013Ddfb5d5c8a",
            monthlyAmount: "500",
            monthsToFund: 3
        }
    ];
    
    console.log("Signer address:", signer.address);
    console.log("Current esAMP balance:", ethers.utils.formatEther(await esAMP.balanceOf(signer.address)));
    
    for (const dist of distributions) {
        const amount = ethers.utils.parseEther((parseFloat(dist.monthlyAmount) * dist.monthsToFund).toString());
        if (amount.gt(0)) {
            const currentBalance = await esAMP.balanceOf(dist.address);
            console.log(`\n${dist.name}:`);
            console.log(`  Address: ${dist.address}`);
            console.log(`  Current Balance: ${ethers.utils.formatEther(currentBalance)} esAMP`);
            console.log(`  Funding Amount: ${ethers.utils.formatEther(amount)} esAMP`);
            
            await sendTxn(
                esAMP.transfer(dist.address, amount),
                `Transfer ${ethers.utils.formatEther(amount)} esAMP to ${dist.name}`
            );
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });