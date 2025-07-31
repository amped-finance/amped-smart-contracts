const { expandDecimals } = require("../../test/shared/utilities")
const fetch = require('node-fetch')
const tokens = require("../core/tokens.js")

// Token addresses from Sonic network configuration
const WS_ADDRESS = tokens.sonic.ws.address
const USDC_ADDRESS = tokens.sonic.usdc.address
const SCUSD_ADDRESS = tokens.sonic.scusd.address
const STS_ADDRESS = tokens.sonic.sts.address
const ANON_ADDRESS = tokens.sonic.anon.address

// Token info for display and calculations
const TOKEN_INFO = {
  [WS_ADDRESS.toLowerCase()]: { symbol: "WS", decimals: 18 },
  [USDC_ADDRESS.toLowerCase()]: { symbol: "USDC", decimals: 6 },
  [SCUSD_ADDRESS.toLowerCase()]: { symbol: "scUSD", decimals: 6 },
  [STS_ADDRESS.toLowerCase()]: { symbol: "stS", decimals: 18 },
  [ANON_ADDRESS.toLowerCase()]: { symbol: "ANON", decimals: 18 }
}

// Odos API endpoint
const ODOS_API_URL = "https://api.odos.xyz"

// Amount to swap (1 WS)
const AMOUNT_IN = "1000000000000000000" // 1 with 18 zeros (1 WS with 18 decimals)

// Queries Odos API for quote information
async function getQuoteInfo(fromToken, toToken, amountIn) {
  const endpoint = `${ODOS_API_URL}/sor/quote/v2`
  
  const requestBody = {
    chainId: 167005, // Sonic chain ID
    inputTokens: [
      {
        tokenAddress: fromToken,
        amount: amountIn.toString()
      }
    ],
    outputTokens: [
      {
        tokenAddress: toToken,
        proportion: 1
      }
    ],
    slippageLimitPercent: 1,
    userAddr: "0x0000000000000000000000000000000000000000",
    referralCode: "amped", // You can set your own referral code here
    disableRFQs: false,
    compact: false
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Error fetching quote for ${TOKEN_INFO[fromToken.toLowerCase()].symbol} to ${TOKEN_INFO[toToken.toLowerCase()].symbol}:`, error)
    return null
  }
}

// Extracts and formats liquidity source information from the quote
function extractLiquiditySources(quoteData, fromSymbol, toSymbol) {
  if (!quoteData || !quoteData.pathViz) {
    return []
  }

  const sources = []
  
  // Extract information from the path visualization
  try {
    for (const path of quoteData.pathViz.paths) {
      const dexName = path.protocol || "Unknown DEX"
      const inputAmount = path.inputAmount
      const outputAmount = path.outputAmount
      
      // Calculate the percentage of total input this path represents
      const percentOfTotal = (parseFloat(path.inputAmount) / parseFloat(quoteData.inAmounts[0])) * 100
      
      sources.push({
        source: dexName,
        inputAmount,
        outputAmount,
        percentOfTotal: percentOfTotal.toFixed(2),
        rate: (parseFloat(outputAmount) / parseFloat(inputAmount)).toFixed(6)
      })
    }
    
    // Sort by percentage (descending)
    return sources.sort((a, b) => parseFloat(b.percentOfTotal) - parseFloat(a.percentOfTotal))
  } catch (error) {
    console.error("Error extracting liquidity sources:", error)
    return []
  }
}

// Formats the output into a readable table
function formatSourcesTable(sources, fromSymbol, toSymbol) {
  if (sources.length === 0) {
    return `No liquidity sources found for ${fromSymbol}/${toSymbol}`
  }

  console.log(`\n=== Liquidity Sources for ${fromSymbol}/${toSymbol} ===`)
  console.log("Source".padEnd(20) + "% of Total".padEnd(12) + `Rate (${toSymbol}/${fromSymbol})`.padEnd(20))
  console.log("─".repeat(60))

  for (const source of sources) {
    console.log(
      `${source.source.padEnd(20)}${source.percentOfTotal.padEnd(12)}${source.rate.padEnd(20)}`
    )
  }
  
  return ""
}

// Main function
async function main() {
  const pairs = [
    { from: WS_ADDRESS, to: USDC_ADDRESS },
    { from: WS_ADDRESS, to: SCUSD_ADDRESS },
    { from: WS_ADDRESS, to: STS_ADDRESS },
    { from: WS_ADDRESS, to: ANON_ADDRESS }
  ]

  console.log("\n=== Odos Swap Rate Check ===")
  console.log(`Checking swap rates for 1 WS to various tokens...\n`)

  let ampedRanking = {}

  for (const pair of pairs) {
    const fromSymbol = TOKEN_INFO[pair.from.toLowerCase()].symbol
    const toSymbol = TOKEN_INFO[pair.to.toLowerCase()].symbol
    
    console.log(`Fetching ${fromSymbol}/${toSymbol} swap rate...`)
    const quoteData = await getQuoteInfo(pair.from, pair.to, AMOUNT_IN)
    
    if (!quoteData) {
      console.log(`Failed to get quote for ${fromSymbol}/${toSymbol}`)
      continue
    }
    
    const expectedOut = quoteData.outAmounts[0]
    const fromDecimals = TOKEN_INFO[pair.from.toLowerCase()].decimals
    const toDecimals = TOKEN_INFO[pair.to.toLowerCase()].decimals
    
    // Adjust for decimals to get the actual rate
    const adjustedRate = (parseFloat(expectedOut) / 10**toDecimals) / (parseFloat(AMOUNT_IN) / 10**fromDecimals)
    
    console.log(`Rate: 1 ${fromSymbol} = ${adjustedRate.toFixed(6)} ${toSymbol}`)
    
    // Extract and display liquidity sources
    const sources = extractLiquiditySources(quoteData, fromSymbol, toSymbol)
    formatSourcesTable(sources, fromSymbol, toSymbol)
    
    // Check if Amped is among the sources and record its ranking
    const ampedIndex = sources.findIndex(source => source.source.toLowerCase().includes("amped"))
    
    if (ampedIndex !== -1) {
      ampedRanking[`${fromSymbol}/${toSymbol}`] = {
        rank: ampedIndex + 1,
        outOf: sources.length,
        percentage: sources[ampedIndex].percentOfTotal
      }
    } else {
      ampedRanking[`${fromSymbol}/${toSymbol}`] = {
        rank: "Not found",
        outOf: sources.length,
        percentage: "0"
      }
    }
    
    console.log("\n" + "─".repeat(60))
  }
  
  // Display Amped's ranking summary
  console.log("\n=== Amped Ranking Summary ===")
  console.log("Pair".padEnd(15) + "Rank".padEnd(15) + "% of Volume".padEnd(15))
  console.log("─".repeat(45))
  
  for (const [pair, ranking] of Object.entries(ampedRanking)) {
    console.log(
      `${pair.padEnd(15)}${(ranking.rank === "Not found" ? ranking.rank : `${ranking.rank}/${ranking.outOf}`).padEnd(15)}${ranking.percentage.padEnd(15)}`
    )
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  }) 