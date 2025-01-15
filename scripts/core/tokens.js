// price feeds https://docs.chain.link/docs/binance-smart-chain-addresses/
const addressZero = '0x0000000000000000000000000000000000000000'

module.exports = {
  localhost: {
    btc: {
      name: "btc",
      address: addressZero,
      decimals: 8,
      priceFeed: addressZero,
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.1 * 10 * 1000 * 1000, // 10%
      stable: false,
      tokenWeight: 15000,
      minProfitBps: 0,
      maxUsdgAmount: 85 * 1000 * 1000,
      bufferAmount: 2500,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 30 * 1000 * 1000,
      maxGlobalShortSize: 15 * 1000 * 1000,
      openInterestLimitLong: 80 * 1000 * 1000,
      openInterestLimitShort: 50 * 1000 * 1000,
      maxOpenInterestLong: 75 * 1000 * 1000,
      maxOpenInterestShort: 50 * 1000 * 1000,
      openInterestIncrementLong: 100 * 1000,
      openInterestIncrementShort: 50 * 1000,
      maxLiquidityThresholdLong: 15 * 1000 * 1000,
      maxLiquidityThresholdShort: 8 * 1000 * 1000,
      minLiquidityThresholdLong: 12 * 1000 * 1000,
      minLiquidityThresholdShort: 5 * 1000 * 1000,
    },
    eth: {
      name: "eth",
      address: addressZero,
      decimals: 18,
      priceFeed: addressZero,
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.1 * 10 * 1000 * 1000, // 10%
      stable: false,
      tokenWeight: 40000,
      minProfitBps: 0,
      maxUsdgAmount: 120 * 1000 * 1000,
      bufferAmount: 50000,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 35 * 1000 * 1000,
      maxGlobalShortSize: 20 * 1000 * 1000,
      openInterestLimitLong: 110 * 1000 * 1000,
      openInterestLimitShort: 70 * 1000 * 1000,
      maxOpenInterestLong: 95 * 1000 * 1000,
      maxOpenInterestShort: 70 * 1000 * 1000,
      openInterestIncrementLong: 100 * 1000,
      openInterestIncrementShort: 50 * 1000,
      maxLiquidityThresholdLong: 15 * 1000 * 1000,
      maxLiquidityThresholdShort: 8 * 1000 * 1000,
      minLiquidityThresholdLong: 12 * 1000 * 1000,
      minLiquidityThresholdShort: 5 * 1000 * 1000,
    },
    // usdc: {
    //   name: "usdc",
    //   address: addressZero,
    //   decimals: 6,
    //   priceFeed: addressZero,
    //   priceDecimals: 8,
    //   stable: true,
    //   tokenWeight: 34000,
    //   minProfitBps: 0,
    //   maxUsdgAmount: 212 * 1000 * 1000,
    //   bufferAmount: 180 * 1000 * 1000,
    //   isStable: true,
    //   isShortable: false,
    // },
    // usdt: {
    //   name: "usdt",
    //   address: addressZero,
    //   decimals: 6,
    //   priceFeed: addressZero,
    //   priceDecimals: 8,
    //   stable: true,
    //   tokenWeight: 2000,
    //   minProfitBps: 0,
    //   maxUsdgAmount: 10 * 1000 * 1000,
    //   bufferAmount: 1 * 1000 * 1000,
    //   isStable: true,
    //   isShortable: false,
    // },
    // nativeToken: {
    //   name: "weth",
    //   address: addressZero,
    //   decimals: 18,
    // },
  },
  pegasus: {
    usdt: {
      name: "usdt",
      address: "0x057e8e2bC40ECff87e6F9b28750D5E7AC004Eab9", // TODO
      decimals: 6,
      priceFeed: "0xBdB0FbB004E3a5C20c957a67AaD69a5eAEa9Ed64",
      priceDecimals: 8,
      stable: true,
      tokenWeight: 6000,
      minProfitBps: 0,
      maxUsdgAmount: 0, // 20 * 1000 * 1000,
      bufferAmount: 1 * 1000 * 1000,
      isStable: true,
      isShortable: false,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.1 * 10 * 1000 * 1000, // 10%
      maxGlobalLongSize: 30 * 1000 * 1000,
      maxGlobalShortSize: 15 * 1000 * 1000,
      openInterestLimitLong: 80 * 1000 * 1000,
      openInterestLimitShort: 50 * 1000 * 1000,
      maxOpenInterestLong: 75 * 1000 * 1000,
      maxOpenInterestShort: 50 * 1000 * 1000,
      openInterestIncrementLong: 100 * 1000,
      openInterestIncrementShort: 50 * 1000,
      maxLiquidityThresholdLong: 15 * 1000 * 1000,
      maxLiquidityThresholdShort: 8 * 1000 * 1000,
      minLiquidityThresholdLong: 12 * 1000 * 1000,
      minLiquidityThresholdShort: 5 * 1000 * 1000,
    },
    ll: {
      name: "ll",
      address: "0xB0AAaa41170Ad29b00FC166E41dA3100D11EdF68", // TODO
      decimals: 18,
      priceFeed: "0xea46e34b8F20e669BC0E5E3b5BB1540Faa23f015",
      priceDecimals: 8,
      stable: false,
      tokenWeight: 2000,
      minProfitBps: 0,
      maxUsdgAmount: 0, //10 * 1000 * 1000,
      bufferAmount: 1 * 1000 * 1000,
      isStable: false,
      isShortable: true,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.1 * 10 * 1000 * 1000, // 10%
      maxGlobalLongSize: 30 * 1000 * 1000,
      maxGlobalShortSize: 15 * 1000 * 1000,
      openInterestLimitLong: 80 * 1000 * 1000,
      openInterestLimitShort: 50 * 1000 * 1000,
      maxOpenInterestLong: 75 * 1000 * 1000,
      maxOpenInterestShort: 50 * 1000 * 1000,
      openInterestIncrementLong: 100 * 1000,
      openInterestIncrementShort: 50 * 1000,
      maxLiquidityThresholdLong: 15 * 1000 * 1000,
      maxLiquidityThresholdShort: 8 * 1000 * 1000,
      minLiquidityThresholdLong: 12 * 1000 * 1000,
      minLiquidityThresholdShort: 5 * 1000 * 1000,
    },
    wsol: {
      name: "wsol",
      address: "0xad45924555BE89f07019376Eeb4cB30e3D857cFd", // TODO
      decimals: 18,
      priceFeed: "0xbafc79b47D048fc7e231AF047b82015057034b8A",
      priceDecimals: 8,
      stable: false,
      tokenWeight: 2000,
      minProfitBps: 0,
      maxUsdgAmount: 0, //10 * 1000 * 1000,
      bufferAmount: 1 * 1000 * 1000,
      isStable: false,
      isShortable: true,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.1 * 10 * 1000 * 1000, // 10%
      maxGlobalLongSize: 30 * 1000 * 1000,
      maxGlobalShortSize: 15 * 1000 * 1000,
      openInterestLimitLong: 80 * 1000 * 1000,
      openInterestLimitShort: 50 * 1000 * 1000,
      maxOpenInterestLong: 75 * 1000 * 1000,
      maxOpenInterestShort: 50 * 1000 * 1000,
      openInterestIncrementLong: 100 * 1000,
      openInterestIncrementShort: 50 * 1000,
      maxLiquidityThresholdLong: 15 * 1000 * 1000,
      maxLiquidityThresholdShort: 8 * 1000 * 1000,
      minLiquidityThresholdLong: 12 * 1000 * 1000,
      minLiquidityThresholdShort: 5 * 1000 * 1000,
    },
    weth: {
      name: "weth",
      address: "0xF42991f02C07AB66cFEa282E7E482382aEB85461", // TODO
      decimals: 18,
      priceFeed: "0x63EBfdf8CA5F972859a0fCA62226950D02B6C294",
      priceDecimals: 8,
      stable: false,
      tokenWeight: 10000,
      minProfitBps: 300,
      maxUsdgAmount: 0, //10 * 1000 * 1000,
      bufferAmount: 1 * 1000 * 1000,
      isStable: false,
      isShortable: true,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.1 * 10 * 1000 * 1000, // 10%
      maxGlobalLongSize: 30 * 1000 * 1000,
      maxGlobalShortSize: 15 * 1000 * 1000,
      openInterestLimitLong: 80 * 1000 * 1000,
      openInterestLimitShort: 50 * 1000 * 1000,
      maxOpenInterestLong: 75 * 1000 * 1000,
      maxOpenInterestShort: 50 * 1000 * 1000,
      openInterestIncrementLong: 100 * 1000,
      openInterestIncrementShort: 50 * 1000,
      maxLiquidityThresholdLong: 15 * 1000 * 1000,
      maxLiquidityThresholdShort: 8 * 1000 * 1000,
      minLiquidityThresholdLong: 12 * 1000 * 1000,
      minLiquidityThresholdShort: 5 * 1000 * 1000,
    },
    wbtc: {
      name: "wbtc",
      address: "0x9Ee1Aa18F3FEB435f811d6AE2F71B7D2a4Adce0B", // TODO
      decimals: 8,
      priceFeed: "0x5124d3a782CA054eA5f04844D532E00f3d0F5D68",
      priceDecimals: 8,
      stable: false,
      tokenWeight: 10000,
      minProfitBps: 200,
      maxUsdgAmount: 0, //10 * 1000 * 1000,
      bufferAmount: 1 * 1000 * 1000,
      isStable: false,
      isShortable: true,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.1 * 10 * 1000 * 1000, // 10%
      maxGlobalLongSize: 30 * 1000 * 1000,
      maxGlobalShortSize: 15 * 1000 * 1000,
      openInterestLimitLong: 80 * 1000 * 1000,
      openInterestLimitShort: 50 * 1000 * 1000,
      maxOpenInterestLong: 75 * 1000 * 1000,
      maxOpenInterestShort: 50 * 1000 * 1000,
      openInterestIncrementLong: 100 * 1000,
      openInterestIncrementShort: 50 * 1000,
      maxLiquidityThresholdLong: 15 * 1000 * 1000,
      maxLiquidityThresholdShort: 8 * 1000 * 1000,
      minLiquidityThresholdLong: 12 * 1000 * 1000,
      minLiquidityThresholdShort: 5 * 1000 * 1000,
    },
  },
  phoenix: {
    usdt: {
      name: "usdt",
      address: "0x6308fa9545126237158778e74AE1b6b89022C5c0", // TODO
      decimals: 6,
      priceFeed: "0xC46D756E8346F3d0Fe1c8eEff6A8C98cf7359594",
      priceDecimals: 8,
      stable: true,
      tokenWeight: 6000,
      minProfitBps: 0,
      maxUsdgAmount: 0, // 20 * 1000 * 1000,
      bufferAmount: 1 * 1000 * 1000,
      isStable: true,
      isShortable: false,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.1 * 10 * 1000 * 1000, // 10%
      maxGlobalLongSize: 30 * 1000 * 1000,
      maxGlobalShortSize: 15 * 1000 * 1000,
      openInterestLimitLong: 80 * 1000 * 1000,
      openInterestLimitShort: 50 * 1000 * 1000,
      maxOpenInterestLong: 75 * 1000 * 1000,
      maxOpenInterestShort: 50 * 1000 * 1000,
      openInterestIncrementLong: 100 * 1000,
      openInterestIncrementShort: 50 * 1000,
      maxLiquidityThresholdLong: 15 * 1000 * 1000,
      maxLiquidityThresholdShort: 8 * 1000 * 1000,
      minLiquidityThresholdLong: 12 * 1000 * 1000,
      minLiquidityThresholdShort: 5 * 1000 * 1000,
    },
    usdc: {
      name: "usdc",
      address: "0x18fB38404DADeE1727Be4b805c5b242B5413Fa40", // TODO
      decimals: 6,
      priceFeed: "0x51CDDB90f73bA3176652A185A398Ba9767E7251A",
      priceDecimals: 8,
      stable: true,
      tokenWeight: 6000,
      minProfitBps: 0,
      maxUsdgAmount: 0, // 20 * 1000 * 1000,
      bufferAmount: 1 * 1000 * 1000,
      isStable: true,
      isShortable: false,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.1 * 10 * 1000 * 1000, // 10%
      maxGlobalLongSize: 30 * 1000 * 1000,
      maxGlobalShortSize: 15 * 1000 * 1000,
      openInterestLimitLong: 80 * 1000 * 1000,
      openInterestLimitShort: 50 * 1000 * 1000,
      maxOpenInterestLong: 75 * 1000 * 1000,
      maxOpenInterestShort: 50 * 1000 * 1000,
      openInterestIncrementLong: 100 * 1000,
      openInterestIncrementShort: 50 * 1000,
      maxLiquidityThresholdLong: 15 * 1000 * 1000,
      maxLiquidityThresholdShort: 8 * 1000 * 1000,
      minLiquidityThresholdLong: 12 * 1000 * 1000,
      minLiquidityThresholdShort: 5 * 1000 * 1000,
    },
    usdtsg: {
      name: "usdt.sg",
      address: "0x808d7c71ad2ba3FA531b068a2417C63106BC0949", // TODO
      decimals: 6,
      priceFeed: "0xC46D756E8346F3d0Fe1c8eEff6A8C98cf7359594",
      priceDecimals: 8,
      stable: true,
      tokenWeight: 6000,
      minProfitBps: 0,
      maxUsdgAmount: 0, // 20 * 1000 * 1000,
      bufferAmount: 1 * 1000 * 1000,
      isStable: true,
      isShortable: false,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.1 * 10 * 1000 * 1000, // 10%
      maxGlobalLongSize: 30 * 1000 * 1000,
      maxGlobalShortSize: 15 * 1000 * 1000,
      openInterestLimitLong: 80 * 1000 * 1000,
      openInterestLimitShort: 50 * 1000 * 1000,
      maxOpenInterestLong: 75 * 1000 * 1000,
      maxOpenInterestShort: 50 * 1000 * 1000,
      openInterestIncrementLong: 100 * 1000,
      openInterestIncrementShort: 50 * 1000,
      maxLiquidityThresholdLong: 15 * 1000 * 1000,
      maxLiquidityThresholdShort: 8 * 1000 * 1000,
      minLiquidityThresholdLong: 12 * 1000 * 1000,
      minLiquidityThresholdShort: 5 * 1000 * 1000,
    },
    usdcsg: {
      name: "usdc.e",
      address: "0xbCF8C1B03bBDDA88D579330BDF236B58F8bb2cFd", // TODO
      decimals: 6,
      priceFeed: "0x51CDDB90f73bA3176652A185A398Ba9767E7251A",
      priceDecimals: 8,
      stable: true,
      tokenWeight: 6000,
      minProfitBps: 0,
      maxUsdgAmount: 0, // 20 * 1000 * 1000,
      bufferAmount: 1 * 1000 * 1000,
      isStable: true,
      isShortable: false,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.1 * 10 * 1000 * 1000, // 10%
      maxGlobalLongSize: 30 * 1000 * 1000,
      maxGlobalShortSize: 15 * 1000 * 1000,
      openInterestLimitLong: 80 * 1000 * 1000,
      openInterestLimitShort: 50 * 1000 * 1000,
      maxOpenInterestLong: 75 * 1000 * 1000,
      maxOpenInterestShort: 50 * 1000 * 1000,
      openInterestIncrementLong: 100 * 1000,
      openInterestIncrementShort: 50 * 1000,
      maxLiquidityThresholdLong: 15 * 1000 * 1000,
      maxLiquidityThresholdShort: 8 * 1000 * 1000,
      minLiquidityThresholdLong: 12 * 1000 * 1000,
      minLiquidityThresholdShort: 5 * 1000 * 1000,
    },
    ll: {
      name: "ll",
      address: "0xd9d7123552fA2bEdB2348bB562576D67f6E8e96E", // TODO
      decimals: 18,
      priceFeed: "0x4ef96D36D83bc21b8f1877Ee7fC74054988543Dd",
      priceDecimals: 8,
      stable: false,
      tokenWeight: 12000,
      minProfitBps: 0,
      maxUsdgAmount: 0, //10 * 1000 * 1000,
      bufferAmount: 1 * 1000 * 1000,
      isStable: false,
      isShortable: true,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.1 * 10 * 1000 * 1000, // 10%
      maxGlobalLongSize: 30 * 1000 * 1000,
      maxGlobalShortSize: 15 * 1000 * 1000,
      openInterestLimitLong: 80 * 1000 * 1000,
      openInterestLimitShort: 50 * 1000 * 1000,
      maxOpenInterestLong: 75 * 1000 * 1000,
      maxOpenInterestShort: 50 * 1000 * 1000,
      openInterestIncrementLong: 100 * 1000,
      openInterestIncrementShort: 50 * 1000,
      maxLiquidityThresholdLong: 15 * 1000 * 1000,
      maxLiquidityThresholdShort: 8 * 1000 * 1000,
      minLiquidityThresholdLong: 12 * 1000 * 1000,
      minLiquidityThresholdShort: 5 * 1000 * 1000,
    },
    wbnb: {
      name: "wbnb",
      address: "0x81A1f39f7394c4849E4261Aa02AaC73865d13774", // TODO
      decimals: 18,
      priceFeed: "0x01Ef273892cbbE372a82e41f3589eDb3bC50dCC6",
      priceDecimals: 8,
      stable: false,
      tokenWeight: 4000,
      minProfitBps: 0,
      maxUsdgAmount: 0, //10 * 1000 * 1000,
      bufferAmount: 1 * 1000 * 1000,
      isStable: false,
      isShortable: true,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.1 * 10 * 1000 * 1000, // 10%
      maxGlobalLongSize: 30 * 1000 * 1000,
      maxGlobalShortSize: 15 * 1000 * 1000,
      openInterestLimitLong: 80 * 1000 * 1000,
      openInterestLimitShort: 50 * 1000 * 1000,
      maxOpenInterestLong: 75 * 1000 * 1000,
      maxOpenInterestShort: 50 * 1000 * 1000,
      openInterestIncrementLong: 100 * 1000,
      openInterestIncrementShort: 50 * 1000,
      maxLiquidityThresholdLong: 15 * 1000 * 1000,
      maxLiquidityThresholdShort: 8 * 1000 * 1000,
      minLiquidityThresholdLong: 12 * 1000 * 1000,
      minLiquidityThresholdShort: 5 * 1000 * 1000,
    },
    weth: {
      name: "weth",
      address: "0x7EbeF2A4b1B09381Ec5B9dF8C5c6f2dBECA59c73", // TODO
      decimals: 18,
      priceFeed: "0x1D43b5AF748ddf9C8114133837FE304Cf6f90d61",
      priceDecimals: 8,
      stable: false,
      tokenWeight: 10000,
      minProfitBps: 300,
      maxUsdgAmount: 0, //10 * 1000 * 1000,
      bufferAmount: 1 * 1000 * 1000,
      isStable: false,
      isShortable: true,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.1 * 10 * 1000 * 1000, // 10%
      maxGlobalLongSize: 30 * 1000 * 1000,
      maxGlobalShortSize: 15 * 1000 * 1000,
      openInterestLimitLong: 80 * 1000 * 1000,
      openInterestLimitShort: 50 * 1000 * 1000,
      maxOpenInterestLong: 75 * 1000 * 1000,
      maxOpenInterestShort: 50 * 1000 * 1000,
      openInterestIncrementLong: 100 * 1000,
      openInterestIncrementShort: 50 * 1000,
      maxLiquidityThresholdLong: 15 * 1000 * 1000,
      maxLiquidityThresholdShort: 8 * 1000 * 1000,
      minLiquidityThresholdLong: 12 * 1000 * 1000,
      minLiquidityThresholdShort: 5 * 1000 * 1000,
    },
    wbtc: {
      name: "wbtc",
      address: "0x46A5e3Fa4a02B9Ae43D9dF9408C86eD643144A67", // TODO
      decimals: 8,
      priceFeed: "0xAB95Db4B4FF0cc696562B81AddCB6ce36768f9F8",
      priceDecimals: 8,
      stable: false,
      tokenWeight: 10000,
      minProfitBps: 200,
      maxUsdgAmount: 0, //10 * 1000 * 1000,
      bufferAmount: 1 * 1000 * 1000,
      isStable: false,
      isShortable: true,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.1 * 10 * 1000 * 1000, // 10%
      maxGlobalLongSize: 30 * 1000 * 1000,
      maxGlobalShortSize: 15 * 1000 * 1000,
      openInterestLimitLong: 80 * 1000 * 1000,
      openInterestLimitShort: 50 * 1000 * 1000,
      maxOpenInterestLong: 75 * 1000 * 1000,
      maxOpenInterestShort: 50 * 1000 * 1000,
      openInterestIncrementLong: 100 * 1000,
      openInterestIncrementShort: 50 * 1000,
      maxLiquidityThresholdLong: 15 * 1000 * 1000,
      maxLiquidityThresholdShort: 8 * 1000 * 1000,
      minLiquidityThresholdLong: 12 * 1000 * 1000,
      minLiquidityThresholdShort: 5 * 1000 * 1000,
    },
  },
  bsctestnet: {
    usdt: {
      name: "usdt",
      address: "0x337610d27c682e347c9cd60bd4b3b107c9d34ddd", // TODO
      decimals: 6,
      priceFeed: "0xEca2605f0BCF2BA5966372C99837b1F182d3D620",
      priceDecimals: 8,
      stable: true,
      tokenWeight: 6000,
      minProfitBps: 0,
      maxUsdgAmount: 0, // 20 * 1000 * 1000,
      bufferAmount: 1 * 1000 * 1000,
      isStable: true,
      isShortable: false,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.1 * 10 * 1000 * 1000, // 10%
      maxGlobalLongSize: 30 * 1000 * 1000,
      maxGlobalShortSize: 15 * 1000 * 1000,
      openInterestLimitLong: 80 * 1000 * 1000,
      openInterestLimitShort: 50 * 1000 * 1000,
      maxOpenInterestLong: 75 * 1000 * 1000,
      maxOpenInterestShort: 50 * 1000 * 1000,
      openInterestIncrementLong: 100 * 1000,
      openInterestIncrementShort: 50 * 1000,
      maxLiquidityThresholdLong: 15 * 1000 * 1000,
      maxLiquidityThresholdShort: 8 * 1000 * 1000,
      minLiquidityThresholdLong: 12 * 1000 * 1000,
      minLiquidityThresholdShort: 5 * 1000 * 1000,
    },
    eth: {
      name: "eth",
      address: "0x1958f7C067226c7C8Ac310Dc994D0cebAbfb2B02", // TODO
      decimals: 18,
      priceFeed: "0x143db3CEEfbdfe5631aDD3E50f7614B6ba708BA7",
      priceDecimals: 8,
      stable: false,
      tokenWeight: 10000,
      minProfitBps: 300,
      maxUsdgAmount: 0, //10 * 1000 * 1000,
      bufferAmount: 1 * 1000 * 1000,
      isStable: false,
      isShortable: true,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.1 * 10 * 1000 * 1000, // 10%
      maxGlobalLongSize: 30 * 1000 * 1000,
      maxGlobalShortSize: 15 * 1000 * 1000,
      openInterestLimitLong: 80 * 1000 * 1000,
      openInterestLimitShort: 50 * 1000 * 1000,
      maxOpenInterestLong: 75 * 1000 * 1000,
      maxOpenInterestShort: 50 * 1000 * 1000,
      openInterestIncrementLong: 100 * 1000,
      openInterestIncrementShort: 50 * 1000,
      maxLiquidityThresholdLong: 15 * 1000 * 1000,
      maxLiquidityThresholdShort: 8 * 1000 * 1000,
      minLiquidityThresholdLong: 12 * 1000 * 1000,
      minLiquidityThresholdShort: 5 * 1000 * 1000,
    },
    wbnb: {
      name: "wbnb",
      address: "0x612777Eea37a44F7a95E3B101C39e1E2695fa6C2", // TODO
      decimals: 18,
      priceFeed: "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526",
      priceDecimals: 8,
      stable: false,
      tokenWeight: 10000,
      minProfitBps: 300,
      maxUsdgAmount: 0, //10 * 1000 * 1000,
      bufferAmount: 1 * 1000 * 1000,
      isStable: false,
      isShortable: true,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.1 * 10 * 1000 * 1000, // 10%
      maxGlobalLongSize: 30 * 1000 * 1000,
      maxGlobalShortSize: 15 * 1000 * 1000,
      openInterestLimitLong: 80 * 1000 * 1000,
      openInterestLimitShort: 50 * 1000 * 1000,
      maxOpenInterestLong: 75 * 1000 * 1000,
      maxOpenInterestShort: 50 * 1000 * 1000,
      openInterestIncrementLong: 100 * 1000,
      openInterestIncrementShort: 50 * 1000,
      maxLiquidityThresholdLong: 15 * 1000 * 1000,
      maxLiquidityThresholdShort: 8 * 1000 * 1000,
      minLiquidityThresholdLong: 12 * 1000 * 1000,
      minLiquidityThresholdShort: 5 * 1000 * 1000,
    },
    btc: {
      name: "btc",
      address: "0xb19C12715134bee7c4b1Ca593ee9E430dABe7b56", // TODO
      decimals: 8,
      priceFeed: "0x5741306c21795FdCBb9b265Ea0255F499DFe515C",
      priceDecimals: 8,
      stable: false,
      tokenWeight: 10000,
      minProfitBps: 200,
      maxUsdgAmount: 0, //10 * 1000 * 1000,
      bufferAmount: 1 * 1000 * 1000,
      isStable: false,
      isShortable: true,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.1 * 10 * 1000 * 1000, // 10%
      maxGlobalLongSize: 30 * 1000 * 1000,
      maxGlobalShortSize: 15 * 1000 * 1000,
      openInterestLimitLong: 80 * 1000 * 1000,
      openInterestLimitShort: 50 * 1000 * 1000,
      maxOpenInterestLong: 75 * 1000 * 1000,
      maxOpenInterestShort: 50 * 1000 * 1000,
      openInterestIncrementLong: 100 * 1000,
      openInterestIncrementShort: 50 * 1000,
      maxLiquidityThresholdLong: 15 * 1000 * 1000,
      maxLiquidityThresholdShort: 8 * 1000 * 1000,
      minLiquidityThresholdLong: 12 * 1000 * 1000,
      minLiquidityThresholdShort: 5 * 1000 * 1000,
    },
  },
  bsc: {
    wbnb: {
      name: "wbnb",
      address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // TODO
      decimals: 18,
      priceFeed: "0x22eFEB944d65D982cA871Ff702a2eA8a0BCFBafC",
      priceDecimals: 10,
      stable: false,
      tokenWeight: 10000,
      minProfitBps: 300,
      maxUsdgAmount: 0, //10 * 1000 * 1000,
      bufferAmount: 1 * 1000 * 1000,
      isStable: false,
      isShortable: true,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.1 * 10 * 1000 * 1000, // 10%
      maxGlobalLongSize: 30 * 1000 * 1000,
      maxGlobalShortSize: 15 * 1000 * 1000,
      openInterestLimitLong: 80 * 1000 * 1000,
      openInterestLimitShort: 50 * 1000 * 1000,
      maxOpenInterestLong: 75 * 1000 * 1000,
      maxOpenInterestShort: 50 * 1000 * 1000,
      openInterestIncrementLong: 100 * 1000,
      openInterestIncrementShort: 50 * 1000,
      maxLiquidityThresholdLong: 15 * 1000 * 1000,
      maxLiquidityThresholdShort: 8 * 1000 * 1000,
      minLiquidityThresholdLong: 12 * 1000 * 1000,
      minLiquidityThresholdShort: 5 * 1000 * 1000,
    },
    bscusd: {
      name: "bscusd",
      address: "0x55d398326f99059ff775485246999027b3197955", // TODO
      decimals: 18,
      priceFeed: "0xDaBD956FDf97b381e5358DB93b1C772e5Bdcc504",
      priceDecimals: 10,
      stable: true,
      tokenWeight: 6000,
      minProfitBps: 0,
      maxUsdgAmount: 0, // 20 * 1000 * 1000,
      bufferAmount: 1 * 1000 * 1000,
      isStable: true,
      isShortable: false,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.1 * 10 * 1000 * 1000, // 10%
      maxGlobalLongSize: 30 * 1000 * 1000,
      maxGlobalShortSize: 15 * 1000 * 1000,
      openInterestLimitLong: 80 * 1000 * 1000,
      openInterestLimitShort: 50 * 1000 * 1000,
      maxOpenInterestLong: 75 * 1000 * 1000,
      maxOpenInterestShort: 50 * 1000 * 1000,
      openInterestIncrementLong: 100 * 1000,
      openInterestIncrementShort: 50 * 1000,
      maxLiquidityThresholdLong: 15 * 1000 * 1000,
      maxLiquidityThresholdShort: 8 * 1000 * 1000,
      minLiquidityThresholdLong: 12 * 1000 * 1000,
      minLiquidityThresholdShort: 5 * 1000 * 1000,
    },
    cake: {
      name: "cake",
      address: "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82", // TODO
      decimals: 18,
      priceFeed: "0x4726f3dffe233E63b3eBA6B06Dc1Ce8A7c4e7283",
      priceDecimals: 10,
      stable: false,
      tokenWeight: 10000,
      minProfitBps: 300,
      maxUsdgAmount: 0, //10 * 1000 * 1000,
      bufferAmount: 1 * 1000 * 1000,
      isStable: false,
      isShortable: true,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.1 * 10 * 1000 * 1000, // 10%
      maxGlobalLongSize: 30 * 1000 * 1000,
      maxGlobalShortSize: 15 * 1000 * 1000,
      openInterestLimitLong: 80 * 1000 * 1000,
      openInterestLimitShort: 50 * 1000 * 1000,
      maxOpenInterestLong: 75 * 1000 * 1000,
      maxOpenInterestShort: 50 * 1000 * 1000,
      openInterestIncrementLong: 100 * 1000,
      openInterestIncrementShort: 50 * 1000,
      maxLiquidityThresholdLong: 15 * 1000 * 1000,
      maxLiquidityThresholdShort: 8 * 1000 * 1000,
      minLiquidityThresholdLong: 12 * 1000 * 1000,
      minLiquidityThresholdShort: 5 * 1000 * 1000,
    },
    pepe: {
      name: "pepe",
      address: "0x25d887ce7a35172c62febfd67a1856f20faebb00", // TODO
      decimals: 18,
      priceFeed: "0xD71b40bf55736bC6D80Ff4c54610Fd4ff3c83E03",
      priceDecimals: 10,
      stable: false,
      tokenWeight: 10000,
      minProfitBps: 300,
      maxUsdgAmount: 0, //10 * 1000 * 1000,
      bufferAmount: 1 * 1000 * 1000,
      isStable: false,
      isShortable: true,
      fastPricePrecision: 10000000000,
      maxCumulativeDeltaDiff: 0.1 * 10 * 1000 * 1000, // 10%
      maxGlobalLongSize: 30 * 1000 * 1000,
      maxGlobalShortSize: 15 * 1000 * 1000,
      openInterestLimitLong: 80 * 1000 * 1000,
      openInterestLimitShort: 50 * 1000 * 1000,
      maxOpenInterestLong: 75 * 1000 * 1000,
      maxOpenInterestShort: 50 * 1000 * 1000,
      openInterestIncrementLong: 100 * 1000,
      openInterestIncrementShort: 50 * 1000,
      maxLiquidityThresholdLong: 15 * 1000 * 1000,
      maxLiquidityThresholdShort: 8 * 1000 * 1000,
      minLiquidityThresholdLong: 12 * 1000 * 1000,
      minLiquidityThresholdShort: 5 * 1000 * 1000,
    },
    floki: {
      name: "floki",
      address: "0xfb5b838b6cfeedc2873ab27866079ac55363d37e", // TODO
      decimals: 9,
      priceFeed: "0xa0d4305D6af06CE426EdC0a4DCEc43619D513C91",
      priceDecimals: 10,
      stable: false,
      tokenWeight: 10000,
      minProfitBps: 300,
      maxUsdgAmount: 0, //10 * 1000 * 1000,
      bufferAmount: 1 * 1000 * 1000,
      isStable: false,
      isShortable: true,
      fastPricePrecision: 10000000000,
      maxCumulativeDeltaDiff: 0.1 * 10 * 1000 * 1000, // 10%
      maxGlobalLongSize: 30 * 1000 * 1000,
      maxGlobalShortSize: 15 * 1000 * 1000,
      openInterestLimitLong: 80 * 1000 * 1000,
      openInterestLimitShort: 50 * 1000 * 1000,
      maxOpenInterestLong: 75 * 1000 * 1000,
      maxOpenInterestShort: 50 * 1000 * 1000,
      openInterestIncrementLong: 100 * 1000,
      openInterestIncrementShort: 50 * 1000,
      maxLiquidityThresholdLong: 15 * 1000 * 1000,
      maxLiquidityThresholdShort: 8 * 1000 * 1000,
      minLiquidityThresholdLong: 12 * 1000 * 1000,
      minLiquidityThresholdShort: 5 * 1000 * 1000,
    }
  }
};
