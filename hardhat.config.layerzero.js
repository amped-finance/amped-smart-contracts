// LayerZero V2 specific Hardhat configuration
// Use this when working with LayerZero V2 commands

require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-verify");
require("hardhat-contract-sizer");
require('@typechain/hardhat');
require('@layerzerolabs/toolbox-hardhat');

const {
  BSCSCAN_API_KEY,
  ETHERSCAN_API_KEY,
  BSC_TESTNET_URL,
  BSC_TESTNET_DEPLOY_KEY,
  ETHEREUM_URL,
  ETHEREUM_DEPLOY_KEY,
  PEGASUS_RPC,
  PEGASUS_DEPLOY_KEY,
  PEGASUS_API_KEY,
  PHOENIX_RPC,
  PHOENIX_DEPLOY_KEY,
  PHOENIX_API_KEY,
  BSC_DEPLOY_KEY,
  BSC_RPC,
  SONIC_RPC,
  SONIC_DEPLOY_KEY,
  SONIC_API_KEY,
  BERACHAIN_RPC,
  BERACHAIN_DEPLOY_KEY,
  BERACHAIN_API_KEY,
  BASE_RPC,
  BASE_DEPLOY_KEY,
  BASE_API_KEY,
  BASESCAN_API_KEY,
  MEGAETH_TESTNET_RPC,
  MEGAETH_TESTNET_DEPLOY_KEY,
  MEGAETH_TESTNET_API_KEY,
  SUPERSEED_RPC,
  SUPERSEED_DEPLOY_KEY,
  SUPERSEED_API_KEY,
  SEPOLIA_RPC,
  SEPOLIA_DEPLOY_KEY,
  SONIC_BLAZE_TESTNET_RPC,
  SONIC_BLAZE_TESTNET_DEPLOY_KEY,
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
        mnemonic: "test test test test test test test test test test test test junk",
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 10,
        passphrase: ""
      }
    },
    hardhat: {
      allowUnlimitedContractSize: true
    },
    ethereum: {
      url: ETHEREUM_URL,
      chainId: 1,
      accounts: [ETHEREUM_DEPLOY_KEY],
      eid: 30101 // LayerZero endpoint ID
    },
    pegasus: {
      url: PEGASUS_RPC,
      chainId: 1891,
      accounts: [PEGASUS_DEPLOY_KEY],
    },
    phoenix: {
      url: PHOENIX_RPC,
      chainId: 1890,
      accounts: [PHOENIX_DEPLOY_KEY],
    },
    bsctestnet: {
      url: BSC_TESTNET_URL,
      chainId: 97,
      accounts: [BSC_TESTNET_DEPLOY_KEY]
    },
    bsc: {
      url: BSC_RPC,
      chainId: 56,
      accounts: [BSC_DEPLOY_KEY],
      eid: 30102 // LayerZero endpoint ID
    },
    sonic: {
      url: SONIC_RPC,
      chainId: 146,
      accounts: [SONIC_DEPLOY_KEY],
      eid: 30278 // LayerZero endpoint ID
    },
    berachain: {
      url: BERACHAIN_RPC,
      chainId: 80094,
      accounts: [BERACHAIN_DEPLOY_KEY]
    },
    base: {
      url: BASE_RPC,
      chainId: 8453,
      accounts: [BASE_DEPLOY_KEY],
      eid: 30184 // LayerZero endpoint ID
    },
    megaeth: {
      url: MEGAETH_TESTNET_RPC,
      chainId: 6342,
      accounts: [MEGAETH_TESTNET_DEPLOY_KEY]
    },
    superseed: {
      url: SUPERSEED_RPC,
      chainId: 5330,
      accounts: [SUPERSEED_DEPLOY_KEY],
      maxPriorityFeePerGas: 1100000,
      maxFeePerGas: 1000000000000
    },
    sepolia: {
      url: SEPOLIA_RPC || "https://api-ethereum-sepolia.n.dwellir.com/5a0bba02-0379-4cbc-87da-c7e5b29bb287",
      chainId: 11155111,
      accounts: [SEPOLIA_DEPLOY_KEY || BSC_TESTNET_DEPLOY_KEY],
      eid: 40161 // LayerZero endpoint ID
    },
    basesepolia: {
      url: "https://sepolia.base.org",
      chainId: 84532,
      accounts: [BASE_DEPLOY_KEY || SEPOLIA_DEPLOY_KEY || BSC_TESTNET_DEPLOY_KEY],
      eid: 40245 // LayerZero endpoint ID
    },
    sonicblazetestnet: {
      url: SONIC_BLAZE_TESTNET_RPC || "https://rpc.blaze.soniclabs.com",
      chainId: 57054,
      accounts: [SONIC_BLAZE_TESTNET_DEPLOY_KEY || BSC_TESTNET_DEPLOY_KEY]
    }
  },
  etherscan: {
    apiKey: {
      mainnet: ETHERSCAN_API_KEY,
      pegasus: PEGASUS_API_KEY,
      phoenix: PHOENIX_API_KEY,
      bsc: BSCSCAN_API_KEY,
      sonic: SONIC_API_KEY,
      berachain: BERACHAIN_API_KEY,
      megaeth: MEGAETH_TESTNET_API_KEY,
      superseed: SUPERSEED_API_KEY,
      base: BASE_API_KEY,
      sepolia: ETHERSCAN_API_KEY,
      basesepolia: BASESCAN_API_KEY,
      sonicblazetestnet: "placeholder"
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
      {
        network: "bsc",
        chainId: 56,
        urls: {
          apiURL: "https://api.bscscan.com/api",
          browserURL: "https://bscscan.com",
        },
      },
      {
        network: "sonic",
        chainId: 146,
        urls: {
          apiURL: "https://api.sonicscan.org/api",
          browserURL: "https://sonicscan.org"
        }
      },
      {
        network: "berachain",
        chainId: 80094,
        urls: {
          apiURL: "https://api.berascan.com/api",
          browserURL: "https://berascan.com"
        }
      },
      {
        network: "megaeth",
        chainId: 6342,
        urls: {
          apiURL: "https://testnet.megaeth.network/api",
          browserURL: "https://testnet.megaeth.network",
        }
      },
      {
        network: "superseed",
        chainId: 5330,
        urls: {
          apiURL: "https://explorer.superseed.xyz/api",
          browserURL: "https://explorer.superseed.xyz"
        }
      },
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org"
        }
      },
      {
        network: "sepolia",
        chainId: 11155111,
        urls: {
          apiURL: "https://api-sepolia.etherscan.io/api",
          browserURL: "https://sepolia.etherscan.io"
        }
      },
      {
        network: "basesepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org"
        }
      },
      {
        network: "sonicblazetestnet",
        chainId: 57054,
        urls: {
          apiURL: "https://api-blaze.sonicscan.org/api",
          browserURL: "https://blaze.sonicscan.org"
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
            enabled: true,
            runs: 10
          }
        }
      },
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ],
    overrides: {
      "contracts/tokens/AmpedToken.sol": {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      "contracts/tokens/AmpedTokenV2.sol": {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      "contracts/tokens/AmpedOFTV2.sol": {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    }
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
}