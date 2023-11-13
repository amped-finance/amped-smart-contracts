// price feeds https://docs.chain.link/docs/binance-smart-chain-addresses/
// const { expandDecimals } = require("../../test/shared/utilities")

module.exports = {
  bsc: {
    btcPriceFeed: { address: "0x264990fbd0A4796A3E3d8E37C4d5F87a3aCa5Ebf" },
    ethPriceFeed: { address: "0x9ef1B8c0E4F7dc8bF5719Ea496883DC6401d5b2e" },
    bnbPriceFeed: { address: "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE" },
    busdPriceFeed: { address: "0xcBb98864Ef56E9042e7d2efef76141f15731B82f" },
    usdcPriceFeed: { address: "0x51597f405303C4377E36123cBc172b13269EA163" },
    usdtPriceFeed: { address: "0xB97Ad0E74fa7d920791E90258A6E2085088b4320" },
    btc: {
      name: "btc",
      address: "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c",
      decimals: 18,
      priceFeed: "0x264990fbd0A4796A3E3d8E37C4d5F87a3aCa5Ebf",
      priceDecimals: 8,
      isStrictStable: false
    },
    eth: {
      name: "eth",
      address: "0x2170ed0880ac9a755fd29b2688956bd959f933f8",
      decimals: 18,
      priceFeed: "0x9ef1B8c0E4F7dc8bF5719Ea496883DC6401d5b2e",
      priceDecimals: 8,
      isStrictStable: false
    },
    bnb: {
      name: "bnb",
      address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      decimals: 18,
      priceFeed: "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE",
      priceDecimals: 8,
      isStrictStable: false
    },
    busd: {
      name: "busd",
      address: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
      decimals: 18,
      priceFeed: "0xcBb98864Ef56E9042e7d2efef76141f15731B82f",
      priceDecimals: 8,
      isStrictStable: true
    },
    usdc: {
      name: "usdc",
      address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
      decimals: 18,
      priceFeed: "0x51597f405303C4377E36123cBc172b13269EA163",
      priceDecimals: 8,
      isStrictStable: true
    },
    usdt: {
      name: "usdt",
      address: "0x55d398326f99059fF775485246999027B3197955",
      decimals: 18,
      priceFeed: "0xB97Ad0E74fa7d920791E90258A6E2085088b4320",
      priceDecimals: 8,
      isStrictStable: true
    },
    nativeToken: {
      address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      decimals: 18
    }
  },
  testnet: {
    btcPriceFeed: { address: "0x5741306c21795FdCBb9b265Ea0255F499DFe515C" },
    ethPriceFeed: { address: "0x143db3CEEfbdfe5631aDD3E50f7614B6ba708BA7" },
    bnbPriceFeed: { address: "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526" },
    busdPriceFeed: { address: "0x8F460c4F4Fa9F87AeA4f29B4Ee91d1b8e97163BA" },
    usdcPriceFeed: { address: " 0x90c069C4538adAc136E051052E14c1cD799C41B7" },
    usdtPriceFeed: { address: "0xEca2605f0BCF2BA5966372C99837b1F182d3D620" },
    btc: {
      address: "0xb19C12715134bee7c4b1Ca593ee9E430dABe7b56",
      decimals: 18
    },
    eth: {
      address: "0x1958f7C067226c7C8Ac310Dc994D0cebAbfb2B02",
      decimals: 18
    },
    bnb: {
      address: "0x612777Eea37a44F7a95E3B101C39e1E2695fa6C2",
      decimals: 18
    },
    busd: {
      address: "0x3F223C4E5ac67099CB695834b20cCd5E5D5AA9Ef",
      decimals: 18
    },
    usdc: {
      address: "0x9780881bf45b83ee028c4c1de7e0c168df8e9eef",
      decimals: 18
    },
    usdt: {
      address: "0x337610d27c682e347c9cd60bd4b3b107c9d34ddd",
      decimals: 18
    },
    nativeToken: {
      address: "0x612777Eea37a44F7a95E3B101C39e1E2695fa6C2",
      decimals: 18
    }
  },
  arbitrumTestnet: {
    // https://docs.chain.link/docs/arbitrum-price-feeds/
    btcPriceFeed: { address: "0x0c9973e7a27d00e656B9f153348dA46CaD70d03d" },
    ethPriceFeed: { address: "0x5f0423B1a6935dc5596e7A24d98532b67A0AeFd8" },
    usdtPriceFeed: { address: "0xb1Ac85E779d05C2901812d812210F6dE144b2df0" },
    usdcPriceFeed: { address: "0xb1Ac85E779d05C2901812d812210F6dE144b2df0" }, // this is USDT price feed, chainlink doesn't have one for USDC
    btc: {
      address: "0xab952e6801daB7920B65b8aC918FF0F66a8a0F44",
      decimals: 18
    },
    eth: {
      address: "0xB47e6A5f8b33b3F17603C83a0535A9dcD7E32681",
      decimals: 18
    },
    usdc: {
      address: "0xb93cb5F5c6a56e060A5e5A9691229D2a7e2D234A",
      decimals: 18
    },
    usdt: {
      address: "0xaB7ee1A7D5bc677e3A7ac694f2c156b3fFCaABC1",
      decimals: 18
    },
    nativeToken: {
      address: "0xB47e6A5f8b33b3F17603C83a0535A9dcD7E32681",
      decimals: 18
    }
  },
  arbitrum: {
    btc: {
      name: "btc",
      address: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
      decimals: 8,
      priceFeed: "0x6ce185860a4963106506C203335A2910413708e9",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.10 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 20000,
      minProfitBps: 0,
      maxUsdgAmount: 100 * 1000 * 1000,
      bufferAmount: 2000,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 30 * 1000 * 1000,
      maxGlobalShortSize: 35 * 1000 * 1000,
    },
    eth: {
      name: "eth",
      address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
      decimals: 18,
      priceFeed: "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.10 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 33000,
      minProfitBps: 0,
      maxUsdgAmount: 150 * 1000 * 1000,
      bufferAmount: 65000,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 55 * 1000 * 1000,
      maxGlobalShortSize: 50 * 1000 * 1000,
    },
    usdc: {
      name: "usdc",
      address: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
      decimals: 6,
      priceFeed: "0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 36000,
      minProfitBps: 0,
      maxUsdgAmount: 180 * 1000 * 1000,
      bufferAmount: 120 * 1000 * 1000,
      isStable: true,
      isShortable: false
    },
    link: {
      name: "link",
      address: "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4",
      decimals: 18,
      priceFeed: "0x86E53CF1B870786351Da77A57575e79CB55812CB",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.10 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 1000,
      minProfitBps: 0,
      maxUsdgAmount: 6 * 1000 * 1000,
      bufferAmount: 200000,
      isStable: false,
      isShortable: true,
      spreadBasisPoints: 20,
      maxGlobalShortSize: 500 * 1000,
      maxGlobalLongSize: 500 * 1000
    },
    uni: {
      name: "uni",
      address: "0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0",
      decimals: 18,
      priceFeed: "0x9C917083fDb403ab5ADbEC26Ee294f6EcAda2720",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.10 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 1000,
      minProfitBps: 0,
      maxUsdgAmount: 5 * 1000 * 1000,
      bufferAmount: 100000,
      isStable: false,
      isShortable: true,
      spreadBasisPoints: 20,
      maxGlobalShortSize: 500 * 1000,
      maxGlobalLongSize: 500 * 1000
    },
    usdt: {
      name: "usdt",
      address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
      decimals: 6,
      priceFeed: "0x3f3f5dF88dC9F13eac63DF89EC16ef6e7E25DdE7",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 2000,
      minProfitBps: 0,
      maxUsdgAmount: 10 * 1000 * 1000,
      bufferAmount: 1 * 1000 * 1000,
      isStable: true,
      isShortable: false
    },
    mim: {
      name: "mim",
      address: "0xFEa7a6a0B346362BF88A9e4A88416B77a57D6c2A",
      decimals: 18,
      priceFeed: "0x87121F6c9A9F6E90E59591E4Cf4804873f54A95b",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 1,
      minProfitBps: 0,
      maxUsdgAmount: 1,
      bufferAmount: 0,
      isStable: true,
      isShortable: false
    },
    frax: {
      name: "frax",
      address: "0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F",
      decimals: 18,
      priceFeed: "0x0809E3d38d1B4214958faf06D8b1B1a2b73f2ab8",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 2000,
      minProfitBps: 0,
      maxUsdgAmount: 8 * 1000 * 1000,
      bufferAmount: 0,
      isStable: true,
      isShortable: false
    },
    dai: {
      name: "dai",
      address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
      decimals: 18,
      priceFeed: "0xc5C8E77B397E531B8EC06BFb0048328B30E9eCfB",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 5000,
      minProfitBps: 0,
      maxUsdgAmount: 25 * 1000 * 1000,
      bufferAmount: 6 * 1000 * 1000,
      isStable: true,
      isShortable: false
    },
    nativeToken: {
      name: "weth",
      address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
      decimals: 18
    }
  },
  avax: {
    avax: {
      name: "avax",
      address: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
      decimals: 18,
      priceFeed: "0x0A77230d17318075983913bC2145DB16C7366156",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.10 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 7000,
      minProfitBps: 0,
      maxUsdgAmount: 6 * 1000 *1000,
      bufferAmount: 200000,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 2 * 1000 * 1000,
      maxGlobalShortSize: 1 * 1000 * 1000,
      spreadBasisPoints: 10
    },
    eth: {
      name: "eth",
      address: "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB",
      decimals: 18,
      priceFeed: "0x976B3D034E162d8bD72D6b9C989d545b839003b0",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.10 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 20000,
      minProfitBps: 0,
      maxUsdgAmount: 30 * 1000 * 1000,
      bufferAmount: 5500,
      isStable: false,
      isShortable: true,
      maxGlobalShortSize: 10 * 1000 * 1000
    },
    btc: {
      name: "btc",
      address: "0x50b7545627a5162f82a992c33b87adc75187b218",
      decimals: 8,
      priceFeed: "0x2779D32d5166BAaa2B2b658333bA7e6Ec0C65743",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.10 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 8000,
      minProfitBps: 0,
      maxUsdgAmount: 30 * 1000 * 1000,
      bufferAmount: 200,
      isStable: false,
      isShortable: true,
      maxGlobalShortSize: 1 * 1000 * 1000
    },
    btcb: {
      name: "btcb",
      address: "0x152b9d0FdC40C096757F570A51E494bd4b943E50",
      decimals: 8,
      priceFeed: "0x2779D32d5166BAaa2B2b658333bA7e6Ec0C65743",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.10 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 15000,
      minProfitBps: 0,
      maxUsdgAmount: 30 * 1000 * 1000,
      bufferAmount: 100,
      isStable: false,
      isShortable: true,
      maxGlobalShortSize: 10 * 1000 * 1000
    },
    mim: {
      name: "mim",
      address: "0x130966628846BFd36ff31a822705796e8cb8C18D",
      decimals: 18,
      priceFeed: "0x54EdAB30a7134A16a54218AE64C73e1DAf48a8Fb",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 1,
      minProfitBps: 0,
      maxUsdgAmount: 1,
      bufferAmount: 0,
      isStable: true,
      isShortable: false
    },
    usdce: {
      name: "usdce",
      address: "0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664",
      decimals: 6,
      priceFeed: "0xF096872672F44d6EBA71458D74fe67F9a77a23B9",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 17000,
      minProfitBps: 0,
      maxUsdgAmount: 70 * 1000 * 1000,
      bufferAmount: 10 * 1000 * 1000,
      isStable: true,
      isShortable: false
    },
    usdc: {
      name: "usdc",
      address: "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
      decimals: 6,
      priceFeed: "0xF096872672F44d6EBA71458D74fe67F9a77a23B9",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 33000,
      minProfitBps: 0,
      maxUsdgAmount: 50 * 1000 * 1000,
      bufferAmount: 17 * 1000 * 1000,
      isStable: true,
      isShortable: false
    },
    nativeToken: {
      name: "wavax",
      address: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
      decimals: 18
    }
  },
  goerli: {
    eth: {
      name: "eth",
      address: "0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6",
      decimals: 18,
      priceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.10 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 20000,
      minProfitBps: 0,
      maxUsdgAmount: 30 * 1000 * 1000,
      bufferAmount: 5500,
      isStable: false,
      isShortable: true,
      maxGlobalShortSize: 10 * 1000 * 1000
    },
    btc: {
      name: "btc",
      address: "0x007e87964b416d0398b768f23c61c9ae5b83d62a",
      decimals: 8,
      priceFeed: "0xA39434A63A52E749F02807ae27335515BA4b07F7",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.10 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 8000,
      minProfitBps: 0,
      maxUsdgAmount: 30 * 1000 * 1000,
      bufferAmount: 200,
      isStable: false,
      isShortable: true,
      maxGlobalShortSize: 1 * 1000 * 1000
    },
    usdc: {
      name: "usdc",
      address: "0x4d5e7d456f0a6814053c114bee47ba322ca1a8ec",
      decimals: 6,
      priceFeed: "0xAb5c49580294Aff77670F839ea425f5b78ab3Ae7",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 33000,
      minProfitBps: 0,
      maxUsdgAmount: 50 * 1000 * 1000,
      bufferAmount: 17 * 1000 * 1000,
      isStable: false,
      isShortable: true
    },
    nativeToken: {
      name: "weth",
      address: "0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6",
      decimals: 18
    }
  },
  cronos: {
    wcro: {
      name: "wcro",
      address: "0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23",
      decimals: 18,
      priceFeed: "0x5B55012bC6DBf545B6a5ab6237030f79b1E38beD",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.20 * 10 * 1000 * 1000, // 20%
      isStrictStable: false,
      tokenWeight: 33000,
      minProfitBps: 0,
      maxUsdgAmount: 50 * 1000 * 1000,
      bufferAmount: 17 * 1000 * 1000,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 2 * 1000 * 1000,
      maxGlobalShortSize: 1 * 1000 * 1000,
      spreadBasisPoints: 0
    },
    wbtc: {
      name: "wbtc",
      address: "0x062E66477Faf219F25D27dCED647BF57C3107d52",
      decimals: 8,
      priceFeed: "0x920B86aee9DE9a490c77BE7E1B2bf72132409Fa2",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.20 * 10 * 1000 * 1000, // 20%
      isStrictStable: false,
      tokenWeight: 8000,
      minProfitBps: 0,
      maxUsdgAmount: 30 * 1000 * 1000,
      bufferAmount: 200,
      spreadBasisPoints: 0,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 10 * 1000 * 1000,
      maxGlobalShortSize: 15 * 1000 * 1000
    },
    weth: {
      name: "weth",
      address: "0xe44Fd7fCb2b1581822D0c862B68222998a0c299a",
      decimals: 18,
      priceFeed: "0x7a4a17E7Fe6804758002BFBF2bAEAf967FFAb334",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.20 * 10 * 1000 * 1000, // 20%
      isStrictStable: false,
      tokenWeight: 20000,
      minProfitBps: 0,
      maxUsdgAmount: 30 * 1000 * 1000,
      bufferAmount: 5500,
      spreadBasisPoints: 0,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 15 * 1000 * 1000,
      maxGlobalShortSize: 10 * 1000 * 1000
    }, 
    atom: {
      name: "atom",
      address: "0xB888d8Dd1733d72681b30c00ee76BDE93ae7aa93",
      decimals: 6,
      priceFeed: "0x6f4e7f8a336aba3b5d2a9219345e80c1a1d21e99",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.20 * 10 * 1000 * 1000, // 20%
      isStrictStable: false,
      tokenWeight: 33000,
      minProfitBps: 0,
      maxUsdgAmount: 50 * 1000 * 1000,
      bufferAmount: 17 * 1000 * 1000,
      spreadBasisPoints: 0,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 1 * 1000 * 1000,
      maxGlobalShortSize: 1 * 1000 * 1000
    },
    ada: {
      name: "ada",
      address: "0x0e517979C2c1c1522ddB0c73905e0D39b3F990c0",
      decimals: 6,
      priceFeed: "0x3B005960adFbF3FC37dF1Bbe5e6FC4b965b1d9F9",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.20 * 10 * 1000 * 1000, // 20%
      isStrictStable: false,
      tokenWeight: 33000,
      minProfitBps: 0,
      maxUsdgAmount: 50 * 1000 * 1000,
      bufferAmount: 17 * 1000 * 1000,
      spreadBasisPoints: 0,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 1 * 1000 * 1000,
      maxGlobalShortSize: 1 * 1000 * 1000
    },
    doge: {
      name: "doge",
      address: "0x1a8E39ae59e5556B56b76fCBA98d22c9ae557396",
      decimals: 8,
      priceFeed: "0xA61ec480729207a4ee38376Ae567CAdd49F29070",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.20 * 10 * 1000 * 1000, // 20%
      isStrictStable: false,
      tokenWeight: 33000,
      minProfitBps: 0,
      maxUsdgAmount: 50 * 1000 * 1000,
      bufferAmount: 17 * 1000 * 1000,
      spreadBasisPoints: 0,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 1 * 1000 * 1000,
      maxGlobalShortSize: 1 * 1000 * 1000
    },
    dai: {
      name: "dai",
      address: "0xF2001B145b43032AAF5Ee2884e456CCd805F677D",
      decimals: 18,
      priceFeed: "0x0F9A22f13f234373099B0D65368947e592bB0978",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 33000,
      minProfitBps: 0,
      maxUsdgAmount: 50 * 1000 * 1000,
      bufferAmount: 17 * 1000 * 1000,
      spreadBasisPoints: 0,
      isStable: true,
      isShortable: false
    },
    usdt: {
      name: "usdt",
      address: "0x66e428c3f67a68878562e79A0234c1F83c208770",
      decimals: 6,
      priceFeed: "0x4183Bf5FE63Eb8fec2bD0FFBa91c0a51C6F48D64",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 33000,
      minProfitBps: 0,
      maxUsdgAmount: 50 * 1000 * 1000,
      bufferAmount: 17 * 1000 * 1000,
      spreadBasisPoints: 0,
      isStable: true,
      isShortable: false
    },
    usdc: {
      name: "usdc",
      address: "0xc21223249CA28397B4B6541dfFaEcC539BfF0c59",
      decimals: 6,
      priceFeed: "0x578dB42a7532c2596Ce2fBDf2687E6Cc98b0539F",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 33000,
      minProfitBps: 0,
      maxUsdgAmount: 50 * 1000 * 1000,
      bufferAmount: 17 * 1000 * 1000,
      spreadBasisPoints: 0,
      isStable: true,
      isShortable: false
    },
    nativeToken: {
      name: "wcro",
      address: "0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23",
      decimals: 18
    }
  },
  pegasus: {
    weth: {
      name: "weth",
      address: "0xF42991f02C07AB66cFEa282E7E482382aEB85461",
      decimals: 18,
      priceFeed: "0x09a445Ca8Cb7dF321DA076b170e76385Ae6C509E",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.50 * 10 * 1000 * 1000, // 50%
      isStrictStable: false,
      tokenWeight: 33000,
      minProfitBps: 0,
      maxUsdgAmount: 50 * 1000 * 1000,
      bufferAmount: 17 * 1000 * 1000,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 50 * 1000 * 1000,
      maxGlobalShortSize: 50 * 1000 * 1000,
      spreadBasisPoints: 0
    },
    btc: {
      name: "btc",
      address: "0x9Ee1Aa18F3FEB435f811d6AE2F71B7D2a4Adce0B",
      decimals: 8,
      priceFeed: "0xeD8a888CD034938c817320494F4B18B59A09A533",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.50 * 10 * 1000 * 1000, // 50%
      isStrictStable: false,
      tokenWeight: 8000,
      minProfitBps: 0,
      maxUsdgAmount: 30 * 1000 * 1000,
      bufferAmount: 200,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 50 * 1000 * 1000,
      maxGlobalShortSize: 50 * 1000 * 1000
    },
    usdt: {
      name: "usdt",
      address: "0x057e8e2bC40ECff87e6F9b28750D5E7AC004Eab9",
      decimals: 6,
      priceFeed: "0xA0185D3c75080e78959c576a75785B3633E39f60",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 33000,
      minProfitBps: 0,
      maxUsdgAmount: 50 * 1000 * 1000,
      bufferAmount: 17 * 1000 * 1000,
      spreadBasisPoints: 0,
      isStable: true,
      isShortable: false
    },
    nativeToken: {
      name: "weth",
      address: "0xF42991f02C07AB66cFEa282E7E482382aEB85461",
      decimals: 18
    }
  }
}
