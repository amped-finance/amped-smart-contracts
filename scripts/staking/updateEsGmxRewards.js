const { contractAt, signers, updateTokensPerInterval, getFrameSigner } = require("../shared/helpers")
const { expandDecimals, bigNumberify } = require("../../test/shared/utilities")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');

const shouldSendTxn = true

// Base Sepolia Configuration:
// esAMP Token: 0xe5AF4c03F23af85AC6732F2dE3afAed3dD712080
// RewardTrackerStakedGMX: 0xD7bD53F40F33721B05C8192B365952151af24e4C (for staked AMP)
// RewardDistributorStakedGMX: 0x9abD164Ab39Cd664538DAC08f16013Ddfb5d5c8a
// RewardTrackerFeeStakedGLP: 0x38A19A6078d7Dd180b136b31120687931e488b2B (for staked ALP)
// RewardDistributorFeeStakedGLP: 0xD230D541EaAF52B1a30Af5c324887c9E1AA72DE5

// Sonic Configuration:
// esAMP Token: 0x1ab02347D787A144a7fBC934a9B96420d46e9eD8
// RewardTrackerStakedGMX: 0xCe0a0e2BbA0F2168DD614b1414CfE707c13aa081 (for staked AMP)
// RewardDistributorStakedGMX: 0xD24c217230DAf4036E290133861EfF4B9aDB2b27
// RewardTrackerFeeStakedGLP: 0xB895e3DBFB37A4Cc6b4FB50B1cf903608e942FF9 (for staked ALP)
// RewardDistributorFeeStakedGLP: 0x2a7663A3e6961dC43bEcbF752DcC9798C1c22a6A

const monthlyEsGmxForGlpOnArb = expandDecimals(toInt("0"), 18)
const monthlyEsGmxForGlpOnAvax = expandDecimals(toInt("0"), 18)
const monthlyEsGmxForGlpOnBaseSepolia = expandDecimals(toInt("1000"), 18) // Set your desired monthly esAMP rewards here
const monthlyEsGmxForGlpOnSonic = expandDecimals(toInt("600000"), 18) // Monthly esAMP rewards for Sonic network

async function getStakedAmounts() {
  let pegasusStakedGmxAndEsGmx = bigNumberify(0)
  let phoenixStakedGmxAndEsGmx = bigNumberify(0)
  let baseSepoliaStakedGmxAndEsGmx = bigNumberify(0)
  let sonicStakedGmxAndEsGmx = bigNumberify(0)

  // Only query the network we're actually running on
  if (network === "pegasus") {
    const pegasusStakedGmxTracker = await contractAt("RewardTracker", "0x8210Da5171B10cB934CC8a658840c663aAFF43A4")
    pegasusStakedGmxAndEsGmx = await pegasusStakedGmxTracker.totalSupply()
  } else if (network === "phoenix") {
    const phoenixStakedGmxTracker = await contractAt("RewardTracker", "0x3c9586567a429BA0467Bc63FD38ea71bB6B912E0")
    phoenixStakedGmxAndEsGmx = await phoenixStakedGmxTracker.totalSupply()
  } else if (network === "basesepolia") {
    const baseSepoliaStakedGmxTracker = await contractAt("RewardTracker", "0xD7bD53F40F33721B05C8192B365952151af24e4C")
    baseSepoliaStakedGmxAndEsGmx = await baseSepoliaStakedGmxTracker.totalSupply()
  } else if (network === "sonic") {
    const sonicStakedGmxTracker = await contractAt("RewardTracker", "0xCe0a0e2BbA0F2168DD614b1414CfE707c13aa081")
    sonicStakedGmxAndEsGmx = await sonicStakedGmxTracker.totalSupply()
  }

  return {
    pegasusStakedGmxAndEsGmx: pegasusStakedGmxAndEsGmx,
    phoenixStakedGmxAndEsGmx: phoenixStakedGmxAndEsGmx,
    baseSepoliaStakedGmxAndEsGmx: baseSepoliaStakedGmxAndEsGmx,
    sonicStakedGmxAndEsGmx: sonicStakedGmxAndEsGmx
  }
}

async function getPegasusValues() {
  const gmxRewardTracker = await contractAt("RewardTracker", "0x8210Da5171B10cB934CC8a658840c663aAFF43A4")
  const glpRewardTracker = await contractAt("RewardTracker", "0x066c39f7Cc4e702c49ecb23E10E83DFE58b0B59b")
  const tokenDecimals = 18
  const monthlyEsGmxForGlp = monthlyEsGmxForGlpOnArb

  return { tokenDecimals, gmxRewardTracker, glpRewardTracker, monthlyEsGmxForGlp }
}

async function getPhoenixValues() {
  const gmxRewardTracker = await contractAt("RewardTracker", "0x3c9586567a429BA0467Bc63FD38ea71bB6B912E0")
  const glpRewardTracker = await contractAt("RewardTracker", "0xf183ed203015B489B568d2BB5D3d9fDB9db8c442")
  const tokenDecimals = 18
  const monthlyEsGmxForGlp = monthlyEsGmxForGlpOnAvax

  return { tokenDecimals, gmxRewardTracker, glpRewardTracker, monthlyEsGmxForGlp }
}

async function getBaseSepoliaValues() {
  // From deploy-basesepolia.json:
  // RewardTrackerStakedGMX: 0xD7bD53F40F33721B05C8192B365952151af24e4C
  // RewardTrackerFeeStakedGLP: 0x38A19A6078d7Dd180b136b31120687931e488b2B
  const gmxRewardTracker = await contractAt("RewardTracker", "0xD7bD53F40F33721B05C8192B365952151af24e4C")
  const glpRewardTracker = await contractAt("RewardTracker", "0x38A19A6078d7Dd180b136b31120687931e488b2B")
  const tokenDecimals = 18
  const monthlyEsGmxForGlp = monthlyEsGmxForGlpOnBaseSepolia

  return { tokenDecimals, gmxRewardTracker, glpRewardTracker, monthlyEsGmxForGlp }
}

async function getSonicValues() {
  // From deploy-sonic.json:
  // RewardTrackerStakedGMX: 0xCe0a0e2BbA0F2168DD614b1414CfE707c13aa081
  // RewardTrackerFeeStakedGLP: 0xB895e3DBFB37A4Cc6b4FB50B1cf903608e942FF9
  const gmxRewardTracker = await contractAt("RewardTracker", "0xCe0a0e2BbA0F2168DD614b1414CfE707c13aa081")
  const glpRewardTracker = await contractAt("RewardTracker", "0xB895e3DBFB37A4Cc6b4FB50B1cf903608e942FF9")
  const tokenDecimals = 18
  const monthlyEsGmxForGlp = monthlyEsGmxForGlpOnSonic

  return { tokenDecimals, gmxRewardTracker, glpRewardTracker, monthlyEsGmxForGlp }
}

function getValues() {
  if (network === "pegasus") {
    return getPegasusValues()
  }

  if (network === "phoenix") {
    return getPhoenixValues()
  }

  if (network === "basesepolia") {
    return getBaseSepoliaValues()
  }

  if (network === "sonic") {
    return getSonicValues()
  }

  throw new Error(`Unsupported network: ${network}`)
}

function toInt(value) {
  return parseInt(value.replaceAll(",", ""))
}

async function main() {
  const { pegasusStakedGmxAndEsGmx, phoenixStakedGmxAndEsGmx, baseSepoliaStakedGmxAndEsGmx, sonicStakedGmxAndEsGmx } = await getStakedAmounts()
  const { tokenDecimals, gmxRewardTracker, glpRewardTracker, monthlyEsGmxForGlp } = await getValues()

  const stakedAmounts = {
    pegasus: {
      total: pegasusStakedGmxAndEsGmx
    },
    phoenix: {
      total: phoenixStakedGmxAndEsGmx
    },
    basesepolia: {
      total: baseSepoliaStakedGmxAndEsGmx
    },
    sonic: {
      total: sonicStakedGmxAndEsGmx
    }
  }

  let totalStaked = bigNumberify(0)

  for (const net in stakedAmounts) {
    totalStaked = totalStaked.add(stakedAmounts[net].total)
  }

  const totalEsGmxRewards = expandDecimals(500, tokenDecimals)
  const secondsPerMonth = 28 * 24 * 60 * 60

  // Get the signer first if we're going to send transactions
  let signer;
  if (shouldSendTxn) {
    signer = await getFrameSigner()
    console.log("Using signer:", await signer.getAddress())
  }

  // Connect contracts to the signer if we have one
  const gmxRewardDistributor = await contractAt("RewardDistributor", await gmxRewardTracker.distributor(), signer)

  const gmxCurrentTokensPerInterval = await gmxRewardDistributor.tokensPerInterval()
  const gmxNextTokensPerInterval = totalEsGmxRewards.mul(stakedAmounts[network].total).div(totalStaked).div(secondsPerMonth)
  // const gmxDelta = gmxNextTokensPerInterval.sub(gmxCurrentTokensPerInterval).mul(10000).div(gmxCurrentTokensPerInterval)

  console.log(`\n=== Updating esAMP Rewards on ${network} ===`)
  console.log("Network:", network)
  console.log("Staked AMP Tracker:", gmxRewardTracker.address)
  console.log("Staked AMP Distributor:", gmxRewardDistributor.address)
  console.log("gmxCurrentTokensPerInterval", gmxCurrentTokensPerInterval.toString())
  // console.log("gmxNextTokensPerInterval", gmxNextTokensPerInterval.toString(), `${gmxDelta.toNumber() / 100.00}%`)

  const glpRewardDistributor = await contractAt("RewardDistributor", await glpRewardTracker.distributor(), signer)

  const glpCurrentTokensPerInterval = await glpRewardDistributor.tokensPerInterval()
  const glpNextTokensPerInterval = monthlyEsGmxForGlp.div(secondsPerMonth)

  console.log("\nStaked ALP Tracker:", glpRewardTracker.address)
  console.log("Staked ALP Distributor:", glpRewardDistributor.address)
  console.log("glpCurrentTokensPerInterval", glpCurrentTokensPerInterval.toString())
  console.log("glpNextTokensPerInterval", glpNextTokensPerInterval.toString())
  console.log("Monthly esAMP for ALP stakers:", monthlyEsGmxForGlp.div(expandDecimals(1, 18)).toString(), "esAMP")

  if (shouldSendTxn) {
    // Check admin permissions
    const gmxDistributorAdmin = await gmxRewardDistributor.admin()
    const glpDistributorAdmin = await glpRewardDistributor.admin()
    
    console.log("\n=== Admin Check ===")
    console.log("GMX RewardDistributor admin:", gmxDistributorAdmin)
    console.log("GLP RewardDistributor admin:", glpDistributorAdmin)
    const signerAddress = await signer.getAddress()
    console.log("Current signer:", signerAddress)
    
    if (signerAddress.toLowerCase() !== gmxDistributorAdmin.toLowerCase()) {
      throw new Error(`Signer ${signerAddress} is not the admin of GMX RewardDistributor (admin is ${gmxDistributorAdmin})`)
    }
    
    if (signerAddress.toLowerCase() !== glpDistributorAdmin.toLowerCase()) {
      throw new Error(`Signer ${signerAddress} is not the admin of GLP RewardDistributor (admin is ${glpDistributorAdmin})`)
    }
    
    console.log("Admin check passed! Proceeding with updates...\n")
    
    await updateTokensPerInterval(gmxRewardDistributor, gmxNextTokensPerInterval, "gmxRewardDistributor", signer)
    await updateTokensPerInterval(glpRewardDistributor, glpNextTokensPerInterval, "glpRewardDistributor", signer)
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
