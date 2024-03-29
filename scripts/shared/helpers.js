const fs = require('fs')
const path = require('path')
const parse = require('csv-parse')

const network = (process.env.HARDHAT_NETWORK || 'mainnet');

const ARBITRUM = 42161
const AVALANCHE = 43114
const GOERLI_TESTNET = 5
const CRONOS = 25

const {
  ARBITRUM_URL,
  AVAX_URL,
  GOERLI_URL,
  CRONOS_URL,
  ARBITRUM_DEPLOY_KEY,
  AVAX_DEPLOY_KEY,
  GOERLI_DEPLOY_KEY,
  CRONOS_DEPLOY_KEY,
  PEGASUS_DEPLOY_KEY,
  PEGASUS_URL,
  PHOENIX_DEPLOY_KEY,
  PHOENIX_URL,
} = require("../../env.json");
const { ADDRESS_ZERO } = require('@uniswap/v3-sdk');

const providers = {
  arbitrum: new ethers.providers.JsonRpcProvider(ARBITRUM_URL),
  avax: new ethers.providers.JsonRpcProvider(AVAX_URL),
  goerli: new ethers.providers.JsonRpcProvider(GOERLI_URL),
  cronos: new ethers.providers.JsonRpcProvider(CRONOS_URL),
  pegasus: new ethers.providers.JsonRpcProvider(PEGASUS_URL),
  phoenix: new ethers.providers.JsonRpcProvider(PHOENIX_URL)
}

const signers = {
  arbitrum: new ethers.Wallet(ARBITRUM_DEPLOY_KEY).connect(providers.arbitrum),
  avax: new ethers.Wallet(ARBITRUM_DEPLOY_KEY).connect(providers.avax),
  goerli: new ethers.Wallet(GOERLI_DEPLOY_KEY).connect(providers.goerli),
  cronos: new ethers.Wallet(CRONOS_DEPLOY_KEY).connect(providers.cronos),
  pegasus: new ethers.Wallet(PEGASUS_DEPLOY_KEY).connect(providers.pegasus),
  phoenix: new ethers.Wallet(PHOENIX_DEPLOY_KEY).connect(providers.phoenix),
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const readCsv = async (file) => {
  records = []
  const parser = fs
  .createReadStream(file)
  .pipe(parse({ columns: true, delimiter: ',' }))
  parser.on('error', function(err){
    console.error(err.message)
  })
  for await (const record of parser) {
    records.push(record)
  }
  return records
}

function getChainId(network) {
  if (network === "arbitrum") {
    return 42161
  }

  if (network === "avax") {
    return 43114
  }

  if (network === "goerli") {
    return 5
  }

  if (network === "cronos") {
    return 25
  }

  if (network === "pegasus") {
    return 78717
  }

  throw new Error("Unsupported network")
}

async function getFrameSigner() {
  try {
    const signer = signers[network]
    if (getChainId(network) !== await signer.getChainId()) {
      throw new Error("Incorrect frame network")
    }
    return signer
  } catch (e) {
    throw new Error(`getFrameSigner error: ${e.toString()}`)
  }
}

async function sendTxn(txnPromise, label) {
  const txn = await txnPromise
  console.info(`Sending ${label}...`)
  await txn.wait()
  console.info(`... Sent! ${txn.hash}`)
  await sleep(2000)
  return txn
}

async function callWithRetries(func, args, retriesCount = 3) {
  let i = 0
  while (true) {
    i++
    try {
      return await func(...args)
    } catch (ex) {
      if (i === retriesCount) {
        console.error("call failed %s times. throwing error", retriesCount)
        throw ex
      }
      console.error("call i=%s failed. retrying....", i)
      console.error(ex.message)
    }
  }
}

async function deployContract(name, args, label, options) {
  if (!options && typeof label === "object") {
    label = null
    options = label
  }

  let info = name
  if (label) { info = name + ":" + label }

  const contractFactory = await ethers.getContractFactory(name)
  let contract
  if (options) {
    contract = await contractFactory.deploy(...args, options)
  } else {
    contract = await contractFactory.deploy(...args)
  }
  const argStr = args.map((i) => `"${i}"`).join(" ")
  console.info(`Deploying ${info} ${contract.address} ${argStr}`)
  await contract.deployTransaction.wait()
  console.info("... Completed!")
  return contract
}

async function contractAt(name, address, provider) {
  let contractFactory = await ethers.getContractFactory(name)
  if (provider) {
    contractFactory = contractFactory.connect(provider)
  }
  return await contractFactory.attach(address)
}

const tmpAddressesFilepath = path.join(__dirname, '..', '..', `.tmp-addresses-${process.env.HARDHAT_NETWORK}.json`)

function readTmpAddresses() {
  if (fs.existsSync(tmpAddressesFilepath)) {
    return JSON.parse(fs.readFileSync(tmpAddressesFilepath))
  }
  return {}
}

function writeTmpAddresses(json) {
  const tmpAddresses = Object.assign(readTmpAddresses(), json)
  fs.writeFileSync(tmpAddressesFilepath, JSON.stringify(tmpAddresses))
}

// batchLists is an array of lists
async function processBatch(batchLists, batchSize, handler) {
  let currentBatch = []
  const referenceList = batchLists[0]

  for (let i = 0; i < referenceList.length; i++) {
    const item = []

    for (let j = 0; j < batchLists.length; j++) {
      const list = batchLists[j]
      item.push(list[i])
    }

    currentBatch.push(item)

    if (currentBatch.length === batchSize) {
      console.log("handling currentBatch", i, currentBatch.length, referenceList.length)
      await handler(currentBatch)
      currentBatch = []
    }
  }

  if (currentBatch.length > 0) {
    console.log("handling final batch", currentBatch.length, referenceList.length)
    await handler(currentBatch)
  }
}

async function updateTokensPerInterval(distributor, tokensPerInterval, label) {
  const prevTokensPerInterval = await distributor.tokensPerInterval()
  if (prevTokensPerInterval.eq(0)) {
    // if the tokens per interval was zero, the distributor.lastDistributionTime may not have been updated for a while
    // so the lastDistributionTime should be manually updated here
    await sendTxn(distributor.updateLastDistributionTime({ gasLimit: 500000 }), `${label}.updateLastDistributionTime`)
  }
  await sendTxn(distributor.setTokensPerInterval(tokensPerInterval, { gasLimit: 500000 }), `${label}.setTokensPerInterval`)
}

module.exports = {
  ARBITRUM,
  AVALANCHE,
  GOERLI_TESTNET,
  CRONOS,
  providers,
  signers,
  readCsv,
  getFrameSigner,
  sendTxn,
  deployContract,
  contractAt,
  writeTmpAddresses,
  readTmpAddresses,
  callWithRetries,
  processBatch,
  updateTokensPerInterval
}
