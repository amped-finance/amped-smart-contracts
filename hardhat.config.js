require('dotenv').config();
require("@cronos-labs/hardhat-cronoscan");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("@openzeppelin/hardhat-upgrades");

const {
  MAINNET_URL,
  MAINNET_DEPLOY_KEY,
  ETHERSCAN_API_KEY,
  
  BSC_URL,
  BSC_DEPLOY_KEY,
  BSCSCAN_API_KEY,
  
  BSC_TESTNET_URL,
  BSC_TESTNET_DEPLOY_KEY,
  
  ARBITRUM_TESTNET_URL,
  ARBITRUM_TESTNET_DEPLOY_KEY,
  ARBISCAN_API_KEY,

  ARBITRUM_URL,
  ARBITRUM_DEPLOY_KEY,

  AVAX_URL,
  AVAX_DEPLOY_KEY,
  SNOWTRACE_API_KEY,

  FUJI_URL,
  FUJI_DEPLOY_KEY,
  
  // POLYGON_URL,
  // POLYGON_DEPLOY_KEY,
  // POLYGONSCAN_API_KEY,
  
  GOERLI_URL,
  GOERLI_DEPLOY_KEY,
  
  CRONOS_URL,
  CRONOS_DEPLOY_KEY,
  CRONOSSCAN_API_KEY,

  CRONOS_TESTNET_URL,
  CRONOS_TESTNET_DEPLOY_KEY,

  PEGASUS_URL,
  PEGASUS_DEPLOY_KEY,
  PEGASUS_API_KEY
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
      timeout: 120000
    },
    hardhat: {
      allowUnlimitedContractSize: true
    },
    bsc: {
      url: BSC_URL,
      chainId: 56,
      gasPrice: 10000000000,
      accounts: [BSC_DEPLOY_KEY]
    },
    testnet: {
      url: BSC_TESTNET_URL,
      chainId: 97,
      gasPrice: 20000000000,
      accounts: [BSC_TESTNET_DEPLOY_KEY]
    },
    arbitrumTestnet: {
      url: ARBITRUM_TESTNET_URL,
      gasPrice: 10000000000,
      chainId: 421611,
      accounts: [ARBITRUM_TESTNET_DEPLOY_KEY]
    },
    arbitrum: {
      url: ARBITRUM_URL,
      gasPrice: 30000000000,
      chainId: 42161,
      accounts: [ARBITRUM_DEPLOY_KEY]
    },
    avax: {
      url: AVAX_URL,
      gasPrice: 25000000000, //5555020 25000000000 originvalue is 200000000000
      chainId: 43114,
      accounts: [AVAX_DEPLOY_KEY]
    },
    fuji: {
      url: FUJI_URL,
      gasPrice: 25000000000, //5555020 25000000000 originvalue is 200000000000
      chainId: 43113,
      accounts: [FUJI_DEPLOY_KEY]
    },
    // polygon: {
    //   url: POLYGON_URL,
    //   gasPrice: 100000000000,
    //   chainId: 137,
    //   accounts: [POLYGON_DEPLOY_KEY]
    // },
    mainnet: {
      url: MAINNET_URL,
      gasPrice: 50000000000,
      chainId: 1,
      accounts: [MAINNET_DEPLOY_KEY]
    },
    goerli: {
      url: GOERLI_URL,
      gasPrice: 50000000000,
      chainId: 5,
      accounts: [GOERLI_DEPLOY_KEY]
    },
    cronos: {
      url: CRONOS_URL,
      gasPrice: 5000000000000,
      chainId: 25,
      accounts:[CRONOS_DEPLOY_KEY]
    },
    cronostest: {
      url: CRONOS_TESTNET_URL,
      gasPrice: 5000000000000,
      chainId: 338,
      accounts:[CRONOS_TESTNET_DEPLOY_KEY]
    },
    pegasus: {
      url: PEGASUS_URL,
      chainId: 1891,
      accounts:[PEGASUS_DEPLOY_KEY]
    }
  },
  etherscan: {
    apiKey: {
      mainnet: MAINNET_DEPLOY_KEY,
      arbitrumOne: ARBISCAN_API_KEY,
      avalanche: SNOWTRACE_API_KEY,
      bsc: BSCSCAN_API_KEY,
      // polygon: POLYGONSCAN_API_KEY,
      goerli: ETHERSCAN_API_KEY,
      cronos: CRONOSSCAN_API_KEY,
      pegasus: PEGASUS_API_KEY,
    },
    customChains: [
      {
        network: "pegasus",
        chainId: 1891,
        urls: {
          apiURL: "https://pegasus.lightlink.io/api",
          browserURL: "https://pegasus.lightlink.io/"
        }
      }
    ]
  },
  solidity: {
    compilers: [
      {
        version: "0.6.12",
        settings: {
          optimizer: {
            enabled: false,
            runs: 200
          }
        },
      },
      {
        version: "0.8.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        },
      },
      {
        version: "0.8.5",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        },
      },
      {
        version: "0.8.7",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        },
      }
    ],
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
}
