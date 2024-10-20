require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-contract-sizer")
require('@typechain/hardhat')

const {
  // BSC_URL,
  // BSC_DEPLOY_KEY,
  BSCSCAN_API_KEY,
  // POLYGONSCAN_API_KEY,
  // SNOWTRACE_API_KEY,
  // ARBISCAN_API_KEY,
  // ETHERSCAN_API_KEY,
  BSC_TESTNET_URL,
  BSC_TESTNET_DEPLOY_KEY,
  // ARBITRUM_TESTNET_DEPLOY_KEY,
  // ARBITRUM_TESTNET_URL,
  // ARBITRUM_DEPLOY_KEY,
  // ARBITRUM_URL,
  // AVAX_DEPLOY_KEY,
  // AVAX_URL,
  // POLYGON_DEPLOY_KEY,
  // POLYGON_URL,
  // MAINNET_URL,
  // MAINNET_DEPLOY_KEY,
  PEGASUS_RPC,
  PEGASUS_DEPLOY_KEY,
  PEGASUS_API_KEY,
  PHOENIX_RPC,
  PHOENIX_DEPLOY_KEY,
  PHOENIX_API_KEY,
  BSC_DEPLOY_KEY,
  BSC_URL
} = require("./env.json")

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners()

  for (const account of accounts) {
    console.info(account.address)
  }
})

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  networks: {
    localhost: {
      url: 'http://127.0.0.1:8545/',
      timeout: 120000,
      accounts: {
        // mnemonic: "near cruel jar space pond motion evidence shed coach more drama pyramid",
        mnemonic: "test test test test test test test test test test test junk",
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 10,
        passphrase: ""
      }
    },
    hardhat: {
      allowUnlimitedContractSize: true
    },
    pegasus: {
      url: PEGASUS_RPC,
      // gasPrice: 2000000000,
      chainId: 1891,
      accounts: [PEGASUS_DEPLOY_KEY],
    },
    phoenix: {
      url: PHOENIX_RPC,
      // gasPrice: 2000000000,
      chainId: 1890,
      accounts: [PHOENIX_DEPLOY_KEY],
    },
    bsctestnet: {
      url: BSC_TESTNET_URL,
      gasPrice: 3000000000,
      chainId: 97,
      accounts: [BSC_TESTNET_DEPLOY_KEY]
    },
    bsc: {
      url: BSC_URL,
      chainId: 56,
      accounts: [BSC_DEPLOY_KEY]
    }
  },
  etherscan: {
    apiKey: {
      pegasus: PEGASUS_API_KEY,
      phoenix: PHOENIX_API_KEY,
      apiKey: BSCSCAN_API_KEY
    },
    customChains: [
      {
        network: "pegasus",
        chainId: 1891,
        urls: {
          apiURL: "https://pegasus.lightlink.io/api",
          browserURL: "https://pegasus.lightlink.io",
        },
      },
      {
        network: "phoenix",
        chainId: 1890,
        urls: {
          apiURL: "https://phoenix.lightlink.io/api",
          browserURL: "https://phoenix.lightlink.io",
        },
      },
    ]
  },
  solidity: {
    version: "0.6.12",
    settings: {
      optimizer: {
        enabled: true,
        runs: 10
      }
    }
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
}
