const { getFrameSigner, contractAt, sendTxn, updateTokensPerInterval } = require("../shared/helpers")
const { ethers } = require("hardhat")

const network = process.argv[2] || process.env.HARDHAT_NETWORK || 'mainnet';

// Base Sepolia Fee Distribution Configuration:
// Reward Token: WETH (0x4200000000000000000000000000000000000006)
// RewardTrackerStakedBonusFeeGMX: 0x695eEF2bAC515Ae4dca16cbe3eC09162CB2b94DE (for AMP stakers)
// RewardDistributorStakedBonusFeeGMX: 0x858582784429ED061607bD3EAEE4b5c4162f8D23
// RewardTrackerFeeGLP: 0x11b6F82A6d7838A423ee623a477cefC8FF2D63EB (for ALP stakers)
// RewardDistributorFeeGLP: 0xBb1Dda7f5053CD8d0984c9c3831FE14259bD3371

function toHex(num) {
  if (typeof num === 'string') {
    const parsedNum = parseInt(num);
    if (!isNaN(parsedNum)) {
      num = parsedNum;
    } else {
      return num; 
    }
  }
  if (typeof num !== 'number' || isNaN(num)) {
    console.warn("toHex received non-numeric value:", num);
    return num;
  }
  return '0x' + num.toString(16);
}

async function getPegasusValues(signer) {
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
      transferAmount: "0.9"
    }
  ]

  return { rewardToken, tokenDecimals, rewardTrackerArr }
}

async function getBscValues(signer) {
  const rewardToken = await contractAt("Token", "0x2F29Bc0FFAF9bff337b31CBe6CB5Fb3bf12e5840", signer)
  const tokenDecimals = 18

  const rewardTrackerArr = [
    {
      name: "feeGmxTracker",
      address: "0x4d268Bf616c768F87333c15F377B8691F8e69007",
      transferAmount: "0"
    },
    {
      name: "feeGlpTracker",
      address: "0x5C04fa0B08c2BB5A69c91C6EF6E7ADD95E134c11",
      transferAmount: "0"
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
      transferAmount: "6597"
    },
    {
      name: "feeGlpTracker",
      address: "0xF3d911F81c4A630e755B42C90942e278019709A7",
      transferAmount: "15395"
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
      transferAmount: "4.7"
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
      transferAmount: "0"
    }
  ]

  return { rewardToken, tokenDecimals, rewardTrackerArr }
}

async function getBaseSepoliaValues(signer) {
  console.log("Setting up Base Sepolia values with signer:", signer.address)
  // WETH on Base Sepolia
  const rewardToken = await contractAt("Token", "0x4200000000000000000000000000000000000006", signer)
  const tokenDecimals = 18

  const rewardTrackerArr = [
    {
      name: "feeGmxTracker",
      address: "0x695eEF2bAC515Ae4dca16cbe3eC09162CB2b94DE", // RewardTrackerStakedBonusFeeGMX
      transferAmount: "0.05" // Set your desired weekly WETH rewards for AMP stakers
    },
    {
      name: "feeGlpTracker", 
      address: "0x11b6F82A6d7838A423ee623a477cefC8FF2D63EB", // RewardTrackerFeeGLP
      transferAmount: "0" // Set your desired weekly WETH rewards for ALP stakers
    }
  ]

  return { rewardToken, tokenDecimals, rewardTrackerArr }
}

async function getSuperseedValues(signer) {
  console.log("Setting up Superseed values with signer:", signer.address)
  // Use WETH as reward token (from tokens.js)
  const rewardToken = await contractAt("Token", "0x4200000000000000000000000000000000000006", signer)
  const tokenDecimals = 18

  // RewardTracker addresses from deploy-superseed.json
  const rewardTrackerArr = [
    {
      name: "feeGmxTracker",
      address: "0x4b207Cfb78B7c565216F8521C02Ef3797a924516", // RewardTrackerStakedBonusFeeGMX
      transferAmount: "0"
    },
    {
      name: "feeGlpTracker",
      address: "0x8751f50DaeB9C93E7E0dc5577e85F600BcD9f76e", // RewardTrackerFeeGLP
      transferAmount: "0.023"
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

  if (network === "base") {
    return getBaseValues(signer)
  }

  if (network === "basesepolia") {
    return getBaseSepoliaValues(signer)
  }

  if (network === "berachain") {
    return getBerachainValues(signer)
  }

  if (network === "superseed") {
    return getSuperseedValues(signer)
  }

  throw new Error("Unsupported network")
}

async function main() {
  const signer = await getFrameSigner()
  console.log("Using Frame signer address:", await signer.getAddress())
  const { rewardToken, tokenDecimals, rewardTrackerArr } = await getValues(signer)

  for (let i = 0; i < rewardTrackerArr.length; i++) {
    const rewardTrackerItem = rewardTrackerArr[i]
    const { transferAmount } = rewardTrackerItem
    console.log(`
Processing ${rewardTrackerItem.name}:`)
    console.log("- Address:", rewardTrackerItem.address)
    console.log("- Transfer Amount:", transferAmount)

    try {
      const rewardTracker = await contractAt("RewardTracker", rewardTrackerItem.address)
      const rewardDistributorAddress = await rewardTracker.distributor()
      console.log("- Distributor Address:", rewardDistributorAddress)
      const rewardDistributor = await contractAt("RewardDistributor", rewardDistributorAddress, signer)

      try {
        const lastDistributionTime = await rewardDistributor.lastDistributionTime()
        console.log("- Last Distribution Time:", lastDistributionTime.toString())
        if (lastDistributionTime.eq(0)) {
          console.log("\nInitializing distributor...")
          await sendTxn(
            rewardDistributor.updateLastDistributionTime({ gasLimit: toHex(500000) }),
            "rewardDistributor.updateLastDistributionTime"
          )
          console.log("Distributor initialized.")
        }
      } catch (e) {
         console.log("\nAttempting to initialize distributor (initial check failed or contract might be new)...")
         try {
            await sendTxn(
              rewardDistributor.updateLastDistributionTime({ gasLimit: toHex(500000) }),
              "rewardDistributor.updateLastDistributionTime"
            )
            console.log("Distributor initialized.")
         } catch (initError) {
             console.error("Error initializing distributor:", initError.message);
         }
      }

      const convertedTransferAmount = ethers.utils.parseUnits(transferAmount, tokenDecimals)
      const rewardsPerInterval = convertedTransferAmount.div(7 * 24 * 60 * 60)
      console.log("- Converted Amount:", convertedTransferAmount.toString())
      console.log("- Rewards Per Interval:", rewardsPerInterval.toString())

      if (convertedTransferAmount.gt(0)) {
        console.log("\nPopulating transfer transaction...")
        const tx = await rewardToken.populateTransaction.transfer(rewardDistributorAddress, convertedTransferAmount);
        console.log("Setting gas limit for transfer...")
        tx.gasLimit = toHex(1000000);
        // EIP-1559 gas overrides for superseed
        if (network === "superseed") {
          tx.maxPriorityFeePerGas = ethers.BigNumber.from("1100000");
          tx.maxFeePerGas = ethers.utils.parseUnits("10", "gwei");
        }
        console.log("Sending transfer transaction via Frame signer...")
        await sendTxn(
          signer.sendTransaction(tx),
          `rewardToken.transfer ${i}`
        )
        console.log("Transfer transaction sent.")
      } else {
         console.log("\nSkipping transfer (amount is 0).")
      }

      console.log("\nUpdating tokens per interval...")
      // EIP-1559 gas overrides for superseed
      if (network === "superseed") {
        await updateTokensPerInterval(rewardDistributor, rewardsPerInterval, "rewardDistributor", signer, {
          maxPriorityFeePerGas: ethers.BigNumber.from("1100000"),
          maxFeePerGas: ethers.utils.parseUnits("10", "gwei")
        });
      } else {
        await updateTokensPerInterval(rewardDistributor, rewardsPerInterval, "rewardDistributor")
      }
      console.log("✅ Successfully updated rewards for", rewardTrackerItem.name)

    } catch (error) {
        console.error(`\n❌ Error processing ${rewardTrackerItem.name}:`)
        console.error("Error message:", error.message)
        if (error.error && error.error.reason) {
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
