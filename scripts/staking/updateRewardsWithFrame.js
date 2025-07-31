const { getFrameSigner, contractAt, sendTxn, updateTokensPerInterval } = require("../shared/helpers")
const { ethers } = require("hardhat")

const network = process.argv[2] || process.env.HARDHAT_NETWORK || 'mainnet';

// Convert number to hex string for gas limits
function toHex(num) {
  if (typeof num === 'string') {
    num = parseInt(num)
  }
  return '0x' + num.toString(16)
}

// Gas limits as hex strings
const GAS_LIMITS = {
  UPDATE_LAST_DISTRIBUTION: toHex(500000),
  TRANSFER: toHex(1000000),
  SET_TOKENS_INTERVAL: toHex(1000000)
}

async function getPegasusValues(signer) {
  console.log("Setting up Pegasus values with signer:", signer.address)
  const rewardToken = await contractAt("Token", "0xF42991f02C07AB66cFEa282E7E482382aEB85461", signer)
  const tokenDecimals = 18

  const rewardTrackerArr = [
    {
      name: "feeGmxTracker",
      address: "0x2a8523678a709360bE70E1e3C26Ebc227FA2866F",
      transferAmount: "0"
    },
    {
      name: "feeGlpTracker",
      address: "0x02b50Ded7CB3a83b6cb7d2Ea2a6B2bb2ea5d982e",
      transferAmount: "0"
    }
  ]

  return { rewardToken, tokenDecimals, rewardTrackerArr }
}

async function getPhoenixValues(signer) {
  console.log("Setting up Phoenix values with signer:", signer.address)
  const rewardToken = await contractAt("Token", "0x7EbeF2A4b1B09381Ec5B9dF8C5c6f2dBECA59c73", signer)
  const tokenDecimals = 18

  const rewardTrackerArr = [
    {
      name: "feeGmxTracker",
      address: "0xB87bc8A763A7856C5806bB0920C00c97Ca5c00d3",
      transferAmount: "0"
    },
    {
      name: "feeGlpTracker",
      address: "0xEE5BD4c29f4cAC23554cc3965D7aE0E22FE84BD7",
      transferAmount: "0.233"
    }
  ]

  return { rewardToken, tokenDecimals, rewardTrackerArr }
}

async function getBscValues(signer) {
  console.log("Setting up BSC values with signer:", signer.address)
  const rewardToken = await contractAt("Token", "0x16DF3d8978d17fE725Dc307aD14FdE3B12E6Da75", signer)
  const tokenDecimals = 18

  const rewardTrackerArr = [
    {
      name: "feeGmxTracker",
      address: "0x87afD5ebBb27F83066766945B5DBe23E70C2b040",
      transferAmount: "0"
    },
    {
      name: "feeGlpTracker",
      address: "0x13161e1fFE546922F8fcEAA9a2A9acd4Fb14fE5e",
      transferAmount: "0"
    }
  ]

  return { rewardToken, tokenDecimals, rewardTrackerArr }
}

async function getBerachainValues(signer) {
  console.log("Setting up Berachain values with signer:", signer.address)
  const rewardToken = await contractAt("Token", "0x6969696969696969696969696969696969696969", signer) // wbera
  const tokenDecimals = 18

  const rewardTrackerArr = [
    {
      name: "feeGmxTracker",
      address: "0xb801c0a55F785d04AEF1445106Fb12E1DF61D9c2", // RewardTrackerStakedBonusFeeGMX
      transferAmount: "0"
    },
    {
      name: "feeGlpTracker",
      address: "0x99f31Eb65f8d6D32bBfb99f814c5e83cf75695B6", // RewardTrackerFeeGLP
      transferAmount: "332"
    }
  ]

  return { rewardToken, tokenDecimals, rewardTrackerArr }
}

async function getSonicValues(signer) {
  console.log("Setting up Sonic values with signer:", signer.address)
  const rewardToken = await contractAt("Token", "0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38", signer)
  const tokenDecimals = 18

  const rewardTrackerArr = [
    {
      name: "feeGmxTracker",
      address: "0x765d548229169E14b397c8c87FF7E8a64f36F469",
      transferAmount: "0"
    },
    {
      name: "feeGlpTracker",
      address: "0xF3d911F81c4A630e755B42C90942e278019709A7",
      transferAmount: "44500"
    }
  ]

  return { rewardToken, tokenDecimals, rewardTrackerArr }
}

async function getBaseValues(signer) {
  console.log("Setting up Base values with signer:", signer.address)
  const rewardToken = await contractAt("Token", "0x4200000000000000000000000000000000000006", signer)
  const tokenDecimals = 18

  const rewardTrackerArr = [
    {
      name: "feeGmxTracker",
      address: "0x945f2677E5CCB4eeb98E16a3Eb416e1d0dcc0610",
      transferAmount: "0"
    },
    {
      name: "feeGlpTracker",
      address: "0x1dc520F6be4A24691a3FC40470d7C7620D1a07a3",
      transferAmount: "1"
    }
  ]

  return { rewardToken, tokenDecimals, rewardTrackerArr }
}

function getValues(signer) {
  if (network === "pegasus") {
    return getPegasusValues(signer)
  }

  if (network === "phoenix") {
    return getPhoenixValues(signer)
  }

  if (network === "bsc") {
    return getBscValues(signer)
  }

  if (network === "sonic") {
    return getSonicValues(signer)
  }

  if (network === "berachain") {
    return getBerachainValues(signer)
  }

  if (network === "base") {
    return getBaseValues(signer)
  }

  throw new Error("Unsupported network")
}

async function main() {
  console.log(`\nUpdating rewards for network: ${network}`)
  
  // Get Frame signer
  console.log("\nConnecting to Frame...")
  const signer = await getFrameSigner()
  console.log("Using Frame signer address:", await signer.getAddress())
  
  console.log("\nGetting network values...")
  const { rewardToken, tokenDecimals, rewardTrackerArr } = await getValues(signer)

  for (let i = 0; i < rewardTrackerArr.length; i++) {
    const rewardTrackerItem = rewardTrackerArr[i]
    const { transferAmount } = rewardTrackerItem
    console.log(`\nProcessing ${rewardTrackerItem.name}:`)
    console.log("- Address:", rewardTrackerItem.address)
    console.log("- Transfer Amount:", transferAmount)

    try {
      const rewardTracker = await contractAt("RewardTracker", rewardTrackerItem.address, signer)
      const rewardDistributorAddress = await rewardTracker.distributor()
      console.log("- Distributor Address:", rewardDistributorAddress)

      const rewardDistributor = await contractAt("RewardDistributor", rewardDistributorAddress, signer)
      
      // Check if distributor needs initialization
      try {
        const lastDistributionTime = await rewardDistributor.lastDistributionTime()
        console.log("- Last Distribution Time:", lastDistributionTime.toString())
        if (lastDistributionTime.eq(0)) {
          console.log("\nInitializing distributor...")
          await sendTxn(
            rewardDistributor.updateLastDistributionTime({ gasLimit: toHex(500000) }),
            "rewardDistributor.updateLastDistributionTime"
          )
        }
      } catch (e) {
        console.log("\nInitializing distributor...")
        await sendTxn(
          rewardDistributor.updateLastDistributionTime({ gasLimit: toHex(500000) }),
          "rewardDistributor.updateLastDistributionTime"
        )
      }

      const convertedTransferAmount = ethers.utils.parseUnits(transferAmount, tokenDecimals)
      const rewardsPerInterval = convertedTransferAmount.div(7 * 24 * 60 * 60)
      
      console.log("- Converted Amount:", convertedTransferAmount.toString())
      console.log("- Rewards Per Interval:", rewardsPerInterval.toString())

      if (convertedTransferAmount.gt(0)) {
        console.log("\nTransferring tokens to distributor...")
        const tx = await rewardToken.populateTransaction.transfer(rewardDistributorAddress, convertedTransferAmount);
        tx.gasLimit = toHex(1000000);
        await sendTxn(
          signer.sendTransaction(tx),
          `rewardToken.transfer ${i}`
        )
      }

      console.log("\nUpdating tokens per interval...")
      await updateTokensPerInterval(rewardDistributor, rewardsPerInterval, "rewardDistributor")
      console.log("✅ Successfully updated rewards for", rewardTrackerItem.name)
    } catch (error) {
      console.error(`\n❌ Error processing ${rewardTrackerItem.name}:`)
      console.error("Error message:", error.message)
      if (error.error) {
        console.error("Revert reason:", error.error.reason)
      }
      throw error
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  }) 
