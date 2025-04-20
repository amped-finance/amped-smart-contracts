const {
  getFrameSigner,
  deployContract,
  contractAt,
  sendTxn
} = require("../shared/helpers");
const { expandDecimals } = require("../../test/shared/utilities");
const { getNetwork, getDeployFilteredInfo } = require("../shared/syncParams");
const tokenList = require('./tokens')

async function deployPriceFeed() {
  const signer = await getFrameSigner();
  const tokenManagerAddr = await signer.getAddress();

  const network = getNetwork();
  const tokens = tokenList[network]

  let fastPriceTokens = []
  for (const coin in tokens) {
    fastPriceTokens = [...fastPriceTokens, tokens[coin]]
  }

  await deployContract("FastPriceEvents", [])

  const fastPriceEvents = await contractAt(
    "FastPriceEvents",
    getDeployFilteredInfo("FastPriceEvents").imple
  )

  const tokenManager = getDeployFilteredInfo("TokenManager").imple
  const positionUtilsAddr = getDeployFilteredInfo("PositionUtils").imple

  const positionRouter1 = await contractAt(
    "PositionRouter",
    getDeployFilteredInfo("PositionRouter").imple, undefined, {
      libraries: {
        PositionUtils: positionUtilsAddr
      }
    }
  )

  const positionRouter2 = await contractAt(
    "PositionRouter",
    getDeployFilteredInfo("PositionRouter").imple, undefined, {
      libraries: {
        PositionUtils: positionUtilsAddr
      }
    }
  )

  const chainlinkFlags = undefined
  
  let tokenArr = []
  for (const coin in tokens) {
    tokenArr = [...tokenArr, tokens[coin]]
  }

  const updaters = [
    getDeployFilteredInfo("MultiSigner1").imple,
    getDeployFilteredInfo("MultiSigner2").imple,
    getDeployFilteredInfo("MultiSigner3").imple,
    getDeployFilteredInfo("MultiSigner4").imple,
  ];

  const priceFeedTimelock = getDeployFilteredInfo("PriceFeedTimelock").imple;

  const signers = [
    getDeployFilteredInfo("MultiSigner1").imple, // coinflipcanada
    getDeployFilteredInfo("MultiSigner2").imple, // G Account 1
    getDeployFilteredInfo("MultiSigner3").imple, // G Account 2
    getDeployFilteredInfo("MultiSigner4").imple, // kr
    getDeployFilteredInfo("MultiSigner5").imple, // quat
    getDeployFilteredInfo("MultiSigner6").imple, // xhiroz
  ];

  if (fastPriceTokens.find((t) => !t?.fastPricePrecision)) {
    throw new Error("Invalid price precision");
  }

  if (fastPriceTokens.find((t) => !t?.maxCumulativeDeltaDiff)) {
    throw new Error("Invalid price maxCumulativeDeltaDiff");
  }

  const secondaryPriceFeed = await deployContract("FastPriceFeed", [
    5 * 60, // _priceDuration
    60 * 60, // _maxPriceUpdateDelay
    1, // _minBlockInterval
    250, // _maxDeviationBasisPoints
    fastPriceEvents.address, // _fastPriceEvents
    tokenManagerAddr, // _tokenManager
  ]);

  const vaultPriceFeed = await contractAt("VaultPriceFeed", getDeployFilteredInfo("VaultPriceFeed").imple)

  await sendTxn(
    vaultPriceFeed.setMaxStrictPriceDeviation(expandDecimals(1, 28)),
    "vaultPriceFeed.setMaxStrictPriceDeviation", signer
  ) // 0.01 USD

  await sendTxn(
    vaultPriceFeed.setPriceSampleSpace(1),
    "vaultPriceFeed.setPriceSampleSpace", signer
  )

  await sendTxn(
    vaultPriceFeed.setSecondaryPriceFeed(secondaryPriceFeed.address),
    "vaultPriceFeed.setSecondaryPriceFeed", signer
  )

  await sendTxn(
    vaultPriceFeed.setIsAmmEnabled(false),
    "vaultPriceFeed.setIsAmmEnabled", signer
  )


  if (chainlinkFlags) {
    await sendTxn(
      vaultPriceFeed.setChainlinkFlags(chainlinkFlags.address),
      "vaultPriceFeed.setChainlinkFlags", signer
    );
  }

  for (const [i, tokenItem] of tokenArr.entries()) {
    if (tokenItem === undefined || tokenItem.spreadBasisPoints === undefined) {
      continue;
    }
    await sendTxn(
      vaultPriceFeed.setSpreadBasisPoints(
        tokenItem.address, // _token
        tokenItem.spreadBasisPoints // _spreadBasisPoints
      ),
      `vaultPriceFeed.setSpreadBasisPoints(${tokenItem.name}) ${tokenItem.spreadBasisPoints}`, signer
    )
  }

  for (const token of tokenArr) {
    if (token === undefined) continue

    await sendTxn(
      vaultPriceFeed.setTokenConfig(
        token.address, // _token
        token.priceFeed, // _priceFeed
        token.priceDecimals, // _priceDecimals
        token.stable // _isStrictStable
      ),
      `vaultPriceFeed.setTokenConfig(${token.name}) ${token.address} ${token.priceFeed}`, signer
    );
  }

  await sendTxn(
    secondaryPriceFeed.initialize(1, signers, updaters),
    "secondaryPriceFeed.initialize", signer
  )

  await sendTxn(
    secondaryPriceFeed.setTokens(
      fastPriceTokens.filter(t => t !== undefined).map((t) => t.address),
      fastPriceTokens.filter(t => t !== undefined).map((t) => t.fastPricePrecision)
    ),
    "secondaryPriceFeed.setTokens", signer
  )

  await sendTxn(
    secondaryPriceFeed.setVaultPriceFeed(vaultPriceFeed.address),
    "secondaryPriceFeed.setVaultPriceFeed", signer
  )

  await sendTxn(
    secondaryPriceFeed.setMaxTimeDeviation(60 * 60),
    "secondaryPriceFeed.setMaxTimeDeviation", signer
  )

  await sendTxn(
    secondaryPriceFeed.setSpreadBasisPointsIfInactive(20), // +- 0.2%: min, max price inactive
    "secondaryPriceFeed.setSpreadBasisPointsIfInactive", signer
  )

  await sendTxn(
    secondaryPriceFeed.setSpreadBasisPointsIfChainError(50), // +-0.5%: min, max price for chain error.
    "secondaryPriceFeed.setSpreadBasisPointsIfChainError", signer
  )

  await sendTxn(
    secondaryPriceFeed.setMaxCumulativeDeltaDiffs(
      fastPriceTokens.filter(t => t !== undefined).map((t) => t.address),
      fastPriceTokens.filter(t => t !== undefined).map((t) => t.maxCumulativeDeltaDiff)
    ),
    "secondaryPriceFeed.setMaxCumulativeDeltaDiffs", signer
  )

  await sendTxn(
    secondaryPriceFeed.setPriceDataInterval(1 * 60),
    "secondaryPriceFeed.setPriceDataInterval", signer
  )

  await sendTxn(
    positionRouter1.setPositionKeeper(secondaryPriceFeed.address, true),
    "positionRouter.setPositionKeeper(secondaryPriceFeed)", signer
  )

  await sendTxn(
    positionRouter2.setPositionKeeper(secondaryPriceFeed.address, true),
    "positionRouter.setPositionKeeper(secondaryPriceFeed)", signer
  )

  await sendTxn(
    fastPriceEvents.setIsPriceFeed(secondaryPriceFeed.address, true),
    "fastPriceEvents.setIsPriceFeed", signer
  )

  await sendTxn(
    vaultPriceFeed.setGov(priceFeedTimelock),
    "vaultPriceFeed.setGov", signer
  )

  await sendTxn(
    secondaryPriceFeed.setGov(priceFeedTimelock),
    "secondaryPriceFeed.setGov", signer
  )
  
  await sendTxn(
    secondaryPriceFeed.setTokenManager(tokenManager),
    "secondaryPriceFeed.setTokenManager", signer
  );
}

module.exports = deployPriceFeed;
