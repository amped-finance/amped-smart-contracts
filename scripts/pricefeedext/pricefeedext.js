const { utils } = require("ethers");
const crypto = require( 'crypto' );
const { deployContract, contractAt , sendTxn } = require("../shared/helpers")

async function main() {
    // const PriceFeedExt_bbc = await deployContract("PriceFeedExt", ["BBC Price", "8"])

    // await sendTxn(PriceFeedExt_bbc.initialize(
    //     false,
    //     "0x35d04AA7c2205CBf11b040e0243BF896Dd2a4FFb",
    //     "0x0ee328f7040DB2AA181a3E976dB00E53759149b3",
    //     "0xB261D56b2b7E520544cf1624dCD379C8C1390E46"), "BBC PriceFeedExt.initialize")
    
    // const PriceFeedExt_usdt = await deployContract("PriceFeedExt", ["GUSD Price", "8"])

    // await sendTxn(PriceFeedExt_usdt.initialize(
    //     true,
    //     "0xB261D56b2b7E520544cf1624dCD379C8C1390E46",
    //     "0x0ee328f7040DB2AA181a3E976dB00E53759149b3",
    //     "0xB261D56b2b7E520544cf1624dCD379C8C1390E46"), "GUSD PriceFeedExt.initialize")

    const PriceFeedExtETH = await deployContract("PriceFeedExt", ["eth price feed", "8"])
    await sendTxn(PriceFeedExtETH.setAdmin("0x03413564187AD43DB5024b0E6D7E1d24b1d0bE23", true), "PriceFeedExtETH setAdmin")
    await sendTxn(PriceFeedExtETH.transmit("194300000000"), "PriceFeedExtETH transmit")

    const PriceFeedExtBTC = await deployContract("PriceFeedExt", ["btc price feed", "8"])
    await sendTxn(PriceFeedExtBTC.setAdmin("0x03413564187AD43DB5024b0E6D7E1d24b1d0bE23", true), "PriceFeedExtBTC setAdmin")
    await sendTxn(PriceFeedExtBTC.transmit("3775000000000"), "PriceFeedExtBTC transmit")

    const PriceFeedExtUSDT = await deployContract("PriceFeedExt", ["usdt price feed", "8"])
    await sendTxn(PriceFeedExtUSDT.setAdmin("0x03413564187AD43DB5024b0E6D7E1d24b1d0bE23", true), "PriceFeedExtUSDT setAdmin")
    await sendTxn(PriceFeedExtUSDT.transmit("100000000"), "PriceFeedExtUSDT transmit")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });