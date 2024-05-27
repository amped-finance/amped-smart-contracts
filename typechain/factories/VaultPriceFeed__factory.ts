/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  VaultPriceFeed,
  VaultPriceFeedInterface,
} from "../VaultPriceFeed";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "BASIS_POINTS_DIVISOR",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MAX_ADJUSTMENT_BASIS_POINTS",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MAX_ADJUSTMENT_INTERVAL",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MAX_SPREAD_BASIS_POINTS",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "ONE_USD",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "PRICE_PRECISION",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "adjustmentBasisPoints",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "bnb",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "bnbBusd",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "btc",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "btcBnb",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "chainlinkFlags",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "eth",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "ethBnb",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "favorPrimaryPrice",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_token",
        type: "address",
      },
    ],
    name: "getAmmPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_token",
        type: "address",
      },
      {
        internalType: "bool",
        name: "_maximise",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "_primaryPrice",
        type: "uint256",
      },
    ],
    name: "getAmmPriceV2",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_token",
        type: "address",
      },
    ],
    name: "getLatestPrimaryPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_pair",
        type: "address",
      },
      {
        internalType: "bool",
        name: "_divByReserve0",
        type: "bool",
      },
    ],
    name: "getPairPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_token",
        type: "address",
      },
      {
        internalType: "bool",
        name: "_maximise",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "_includeAmmPrice",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    name: "getPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_token",
        type: "address",
      },
      {
        internalType: "bool",
        name: "_maximise",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "_includeAmmPrice",
        type: "bool",
      },
    ],
    name: "getPriceV1",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_token",
        type: "address",
      },
      {
        internalType: "bool",
        name: "_maximise",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "_includeAmmPrice",
        type: "bool",
      },
    ],
    name: "getPriceV2",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_token",
        type: "address",
      },
      {
        internalType: "bool",
        name: "_maximise",
        type: "bool",
      },
    ],
    name: "getPrimaryPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_referencePrice",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "_maximise",
        type: "bool",
      },
    ],
    name: "getSecondaryPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "gov",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "isAdjustmentAdditive",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "isAmmEnabled",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "isSecondaryPriceEnabled",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "lastAdjustmentTimings",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "maxStrictPriceDeviation",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "priceDecimals",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "priceFeeds",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "priceSampleSpace",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "secondaryPriceFeed",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_token",
        type: "address",
      },
      {
        internalType: "bool",
        name: "_isAdditive",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "_adjustmentBps",
        type: "uint256",
      },
    ],
    name: "setAdjustment",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_chainlinkFlags",
        type: "address",
      },
    ],
    name: "setChainlinkFlags",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bool",
        name: "_favorPrimaryPrice",
        type: "bool",
      },
    ],
    name: "setFavorPrimaryPrice",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_gov",
        type: "address",
      },
    ],
    name: "setGov",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bool",
        name: "_isEnabled",
        type: "bool",
      },
    ],
    name: "setIsAmmEnabled",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bool",
        name: "_isEnabled",
        type: "bool",
      },
    ],
    name: "setIsSecondaryPriceEnabled",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_maxStrictPriceDeviation",
        type: "uint256",
      },
    ],
    name: "setMaxStrictPriceDeviation",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_bnbBusd",
        type: "address",
      },
      {
        internalType: "address",
        name: "_ethBnb",
        type: "address",
      },
      {
        internalType: "address",
        name: "_btcBnb",
        type: "address",
      },
    ],
    name: "setPairs",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_priceSampleSpace",
        type: "uint256",
      },
    ],
    name: "setPriceSampleSpace",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_secondaryPriceFeed",
        type: "address",
      },
    ],
    name: "setSecondaryPriceFeed",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_spreadBasisPoints",
        type: "uint256",
      },
    ],
    name: "setSpreadBasisPoints",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_spreadThresholdBasisPoints",
        type: "uint256",
      },
    ],
    name: "setSpreadThresholdBasisPoints",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_token",
        type: "address",
      },
      {
        internalType: "address",
        name: "_priceFeed",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_priceDecimals",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "_isStrictStable",
        type: "bool",
      },
    ],
    name: "setTokenConfig",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_btc",
        type: "address",
      },
      {
        internalType: "address",
        name: "_eth",
        type: "address",
      },
      {
        internalType: "address",
        name: "_bnb",
        type: "address",
      },
    ],
    name: "setTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bool",
        name: "_useV2Pricing",
        type: "bool",
      },
    ],
    name: "setUseV2Pricing",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "spreadBasisPoints",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "spreadThresholdBasisPoints",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "strictStableTokens",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "useV2Pricing",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x60806040526001805461ffff60b01b1960ff60a81b1960ff60a01b19909216600160a01b1791909116600160a81b171690556003600281905560009055601e60055534801561004d57600080fd5b50600080546001600160a01b03191633179055611f408061006f6000396000f3fe608060405234801561001057600080fd5b50600436106102675760003560e01c80630957aed91461026c5780631193c80914610286578063126082cf146102aa57806312d43a51146102b25780632fa03b8f146102ba5780632fbfe3d3146102d95780632fc3a70a146102f657806330536ee514610334578063378e7bf7146103505780633d949c5f146103585780633eba8d361461038e5780633ebbc601146103c25780633f0c3bb7146103ca578063443be209146103d257806348cac2771461040a57806349a876e4146104305780634a4b1f4f146104385780634b9ade471461044057806356bf9de41461047e57806356c8c2c1146104a4578063593d9e80146104d2578063604f37e9146104da57806367781c0e146104f95780636ce8a44b146105015780636fc8070814610527578063717cfe7a1461052f578063732391b414610555578063826e055f1461058b5780638b86616c146105b15780638c7c9e0c146105b957806393f69074146105c157806395082d25146104f9578063971bd396146105f957806397dfade7146106015780639917dc74146106095780639a0a6635146106285780639b18dc471461064e5780639b889380146106565780639dcb511a14610682578063a27ea386146106a8578063a28d57d8146106ce578063a2ad7b93146106d6578063a39c73a314610704578063b02a2de41461070c578063b731dd8714610740578063b8f611051461075d578063c2138d8c14610783578063cefe0f21146107a9578063cfad57a2146107cf578063d694376c146107f5578063e4440e0214610829578063eb1c92a914610831578063fd34ec4014610850575b600080fd5b61027461086f565b60408051918252519081900360200190f35b61028e610874565b604080516001600160a01b039092168252519081900360200190f35b610274610883565b61028e610889565b6102d7600480360360208110156102d057600080fd5b5035610898565b005b6102d7600480360360208110156102ef57600080fd5b5035610929565b6102746004803603608081101561030c57600080fd5b506001600160a01b03813516906020810135151590604081013515159060600135151561097b565b61033c610a39565b604080519115158252519081900360200190f35b610274610a49565b6102746004803603606081101561036e57600080fd5b506001600160a01b03813516906020810135151590604001351515610a4f565b610274600480360360608110156103a457600080fd5b506001600160a01b0381351690602081013590604001351515610c23565b61033c610cd1565b61033c610ce1565b6102d7600480360360608110156103e857600080fd5b506001600160a01b038135811691602081013582169160409091013516610cf1565b6102746004803603602081101561042057600080fd5b50356001600160a01b0316610d7d565b61028e610d8f565b610274610d9e565b6102d76004803603608081101561045657600080fd5b506001600160a01b038135811691602081013590911690604081013590606001351515610da3565b6102746004803603602081101561049457600080fd5b50356001600160a01b0316610e45565b610274600480360360408110156104ba57600080fd5b506001600160a01b0381351690602001351515610f56565b61033c6111bd565b6102d7600480360360208110156104f057600080fd5b503515156111cd565b610274611238565b61033c6004803603602081101561051757600080fd5b50356001600160a01b0316611248565b61027461125d565b6102746004803603602081101561054557600080fd5b50356001600160a01b0316611263565b6102746004803603606081101561056b57600080fd5b506001600160a01b03813516906020810135151590604001351515611275565b6102d7600480360360208110156105a157600080fd5b50356001600160a01b03166112ca565b61028e611339565b61028e611348565b6102d7600480360360608110156105d757600080fd5b506001600160a01b038135811691602081013582169160409091013516611357565b61028e6113e3565b61028e6113f2565b6102d76004803603602081101561061f57600080fd5b50351515611401565b6102d76004803603602081101561063e57600080fd5b50356001600160a01b031661146c565b6102746114db565b6102d76004803603604081101561066c57600080fd5b506001600160a01b0381351690602001356114e1565b61028e6004803603602081101561069857600080fd5b50356001600160a01b031661158a565b610274600480360360208110156106be57600080fd5b50356001600160a01b03166115a5565b61028e6115b7565b610274600480360360408110156106ec57600080fd5b506001600160a01b03813516906020013515156115c6565b6102746116b3565b6102746004803603606081101561072257600080fd5b506001600160a01b03813516906020810135151590604001356116b9565b6102d76004803603602081101561075657600080fd5b5035611781565b61033c6004803603602081101561077357600080fd5b50356001600160a01b03166117d3565b6102746004803603602081101561079957600080fd5b50356001600160a01b03166117e8565b610274600480360360208110156107bf57600080fd5b50356001600160a01b03166118e6565b6102d7600480360360208110156107e557600080fd5b50356001600160a01b03166118f8565b6102d76004803603606081101561080b57600080fd5b506001600160a01b0381351690602081013515159060400135611967565b61028e611aaa565b6102d76004803603602081101561084757600080fd5b50351515611ab9565b6102d76004803603602081101561086657600080fd5b50351515611b24565b603281565b600a546001600160a01b031681565b61271081565b6000546001600160a01b031681565b6000546001600160a01b031633146108e5576040805162461bcd60e51b81526020600482015260196024820152600080516020611e5a833981519152604482015290519081900360640190fd5b600081116109245760405162461bcd60e51b8152600401808060200182810382526029815260200180611dbe6029913960400191505060405180910390fd5b600255565b6000546001600160a01b03163314610976576040805162461bcd60e51b81526020600482015260196024820152600080516020611e5a833981519152604482015290519081900360640190fd5b600355565b6001546000908190600160b01b900460ff166109a15761099c868686610a4f565b6109ac565b6109ac868686611275565b6001600160a01b0387166000908152601060205260409020549091508015610a2f576001600160a01b03871660009081526011602052604090205460ff168015610a1757610a10612710610a0a610a038286611b8f565b8690611be7565b90611c40565b9250610a2d565b610a2a612710610a0a610a038286611c7f565b92505b505b5095945050505050565b600154600160b01b900460ff1681565b60035481565b600080610a5c8585610f56565b9050828015610a745750600154600160a01b900460ff165b15610ab9576000610a84866117e8565b90508015610ab757848015610a9857508181115b15610aa1578091505b84158015610aae57508181105b15610ab7578091505b505b600154600160a81b900460ff1615610ad957610ad6858286610c23565b90505b6001600160a01b0385166000908152600f602052604090205460ff1615610bc257600068327cb2734119d3b7a9601e1b8211610b2a57610b2568327cb2734119d3b7a9601e1b83611c7f565b610b40565b610b408268327cb2734119d3b7a9601e1b611c7f565b90506003548111610b615768327cb2734119d3b7a9601e1b92505050610c1c565b848015610b79575068327cb2734119d3b7a9601e1b82115b15610b8657509050610c1c565b84158015610b9f575068327cb2734119d3b7a9601e1b82105b15610bac57509050610c1c565b68327cb2734119d3b7a9601e1b92505050610c1c565b6001600160a01b0385166000908152600e60205260409020548415610c0457610bfb612710610a0a610bf48285611b8f565b8590611be7565b92505050610c1c565b610c17612710610a0a610bf48285611c7f565b925050505b9392505050565b6004546000906001600160a01b0316610c3d575081610c1c565b6004805460408051630ffd9c6d60e31b81526001600160a01b038881169482019490945260248101879052851515604482015290519290911691637fece36891606480820192602092909190829003018186803b158015610c9d57600080fd5b505afa158015610cb1573d6000803e3d6000fd5b505050506040513d6020811015610cc757600080fd5b5051949350505050565b600154600160a81b900460ff1681565b600154600160a01b900460ff1681565b6000546001600160a01b03163314610d3e576040805162461bcd60e51b81526020600482015260196024820152600080516020611e5a833981519152604482015290519081900360640190fd5b600680546001600160a01b039485166001600160a01b031991821617909155600780549385169382169390931790925560088054919093169116179055565b60106020526000908152604090205481565b6008546001600160a01b031681565b601481565b6000546001600160a01b03163314610df0576040805162461bcd60e51b81526020600482015260196024820152600080516020611e5a833981519152604482015290519081900360640190fd5b6001600160a01b039384166000908152600c6020908152604080832080546001600160a01b0319169690971695909517909555600d855283812092909255600f90935220805460ff1916911515919091179055565b6001600160a01b038082166000908152600c602052604081205490911680610e9e5760405162461bcd60e51b8152600401808060200182810382526022815260200180611ee96022913960400191505060405180910390fd5b60008190506000816001600160a01b03166350d25bcd6040518163ffffffff1660e01b815260040160206040518083038186803b158015610ede57600080fd5b505afa158015610ef2573d6000803e3d6000fd5b505050506040513d6020811015610f0857600080fd5b5051905080610f4c576040805162461bcd60e51b815260206004820152601d6024820152600080516020611ec9833981519152604482015290519081900360640190fd5b925050505b919050565b6001600160a01b038083166000908152600c602052604081205490911680610faf5760405162461bcd60e51b8152600401808060200182810382526022815260200180611ee96022913960400191505060405180910390fd5b6001546001600160a01b03161561108c5760015460408051631abf23ff60e11b815273a438451d6458044c3c8cd2f6f31c91ac882a6d91600482015290516000926001600160a01b03169163357e47fe916024808301926020929190829003018186803b15801561101f57600080fd5b505afa158015611033573d6000803e3d6000fd5b505050506040513d602081101561104957600080fd5b50519050801561108a5760405162461bcd60e51b8152600401808060200182810382526025815260200180611e7a6025913960400191505060405180910390fd5b505b60008190506000816001600160a01b03166350d25bcd6040518163ffffffff1660e01b815260040160206040518083038186803b1580156110cc57600080fd5b505afa1580156110e0573d6000803e3d6000fd5b505050506040513d60208110156110f657600080fd5b505190508061113a576040805162461bcd60e51b815260206004820152601d6024820152600080516020611ec9833981519152604482015290519081900360640190fd5b600081116111795760405162461bcd60e51b8152600401808060200182810382526025815260200180611de76025913960400191505060405180910390fd5b6001600160a01b0386166000908152600d60205260409020546111b0600a82900a610a0a8468327cb2734119d3b7a9601e1b611be7565b9450505050505b92915050565b600154600160b81b900460ff1681565b6000546001600160a01b0316331461121a576040805162461bcd60e51b81526020600482015260196024820152600080516020611e5a833981519152604482015290519081900360640190fd5b60018054911515600160b81b0260ff60b81b19909216919091179055565b68327cb2734119d3b7a9601e1b81565b60116020526000908152604090205460ff1681565b60025481565b60126020526000908152604090205481565b6000806112828585610f56565b905082801561129a5750600154600160a01b900460ff165b15610ab9576112aa8585836116b9565b905060015460ff600160a81b9091041615610ad957610ad6858286610c23565b6000546001600160a01b03163314611317576040805162461bcd60e51b81526020600482015260196024820152600080516020611e5a833981519152604482015290519081900360640190fd5b600180546001600160a01b0319166001600160a01b0392909216919091179055565b6004546001600160a01b031681565b6007546001600160a01b031681565b6000546001600160a01b031633146113a4576040805162461bcd60e51b81526020600482015260196024820152600080516020611e5a833981519152604482015290519081900360640190fd5b600980546001600160a01b039485166001600160a01b031991821617909155600a805493851693821693909317909255600b8054919093169116179055565b600b546001600160a01b031681565b6009546001600160a01b031681565b6000546001600160a01b0316331461144e576040805162461bcd60e51b81526020600482015260196024820152600080516020611e5a833981519152604482015290519081900360640190fd5b60018054911515600160a01b0260ff60a01b19909216919091179055565b6000546001600160a01b031633146114b9576040805162461bcd60e51b81526020600482015260196024820152600080516020611e5a833981519152604482015290519081900360640190fd5b600480546001600160a01b0319166001600160a01b0392909216919091179055565b611c2081565b6000546001600160a01b0316331461152e576040805162461bcd60e51b81526020600482015260196024820152600080516020611e5a833981519152604482015290519081900360640190fd5b603281111561156e5760405162461bcd60e51b815260040180806020018281038252602a815260200180611e9f602a913960400191505060405180910390fd5b6001600160a01b039091166000908152600e6020526040902055565b600c602052600090815260409020546001600160a01b031681565b600e6020526000908152604090205481565b6006546001600160a01b031681565b6000806000846001600160a01b0316630902f1ac6040518163ffffffff1660e01b815260040160606040518083038186803b15801561160457600080fd5b505afa158015611618573d6000803e3d6000fd5b505050506040513d606081101561162e57600080fd5b5080516020909101516001600160701b0391821693501690508315611680578161165d576000925050506111b7565b61167782610a0a8368327cb2734119d3b7a9601e1b611be7565b925050506111b7565b80611690576000925050506111b7565b6116aa81610a0a8468327cb2734119d3b7a9601e1b611be7565b95945050505050565b60055481565b6000806116c5856117e8565b9050806116d55782915050610c1c565b60008382116116ed576116e88483611c7f565b6116f7565b6116f78285611c7f565b905061170e60055485611be790919063ffffffff16565b61171a82612710611be7565b101561174457600154600160b81b900460ff161561173c578392505050610c1c565b509050610c1c565b84801561175057508382115b1561175d57509050610c1c565b8415801561176a57508382105b1561177757509050610c1c565b5091949350505050565b6000546001600160a01b031633146117ce576040805162461bcd60e51b81526020600482015260196024820152600080516020611e5a833981519152604482015290519081900360640190fd5b600555565b600f6020526000908152604090205460ff1681565b6008546000906001600160a01b038381169116141561181f57600954611818906001600160a01b031660016115c6565b9050610f51565b6007546001600160a01b03838116911614156118915760095460009061184f906001600160a01b031660016115c6565b600a5490915060009061186c906001600160a01b031660016115c6565b905061188868327cb2734119d3b7a9601e1b610a0a8484611be7565b92505050610f51565b6006546001600160a01b03838116911614156118de576009546000906118c1906001600160a01b031660016115c6565b600b5490915060009061186c906001600160a01b031660016115c6565b506000919050565b600d6020526000908152604090205481565b6000546001600160a01b03163314611945576040805162461bcd60e51b81526020600482015260196024820152600080516020611e5a833981519152604482015290519081900360640190fd5b600080546001600160a01b0319166001600160a01b0392909216919091179055565b6000546001600160a01b031633146119b4576040805162461bcd60e51b81526020600482015260196024820152600080516020611e5a833981519152604482015290519081900360640190fd5b6001600160a01b03831660009081526012602052604090205442906119db90611c20611b8f565b10611a175760405162461bcd60e51b815260040180806020018281038252602d815260200180611e2d602d913960400191505060405180910390fd5b6014811115611a66576040805162461bcd60e51b8152602060048201526016602482015275696e76616c6964205f61646a7573746d656e7442707360501b604482015290519081900360640190fd5b6001600160a01b03929092166000908152601160209081526040808320805460ff191694151594909417909355601081528282209390935560129092529020429055565b6001546001600160a01b031681565b6000546001600160a01b03163314611b06576040805162461bcd60e51b81526020600482015260196024820152600080516020611e5a833981519152604482015290519081900360640190fd5b60018054911515600160a81b0260ff60a81b19909216919091179055565b6000546001600160a01b03163314611b71576040805162461bcd60e51b81526020600482015260196024820152600080516020611e5a833981519152604482015290519081900360640190fd5b60018054911515600160b01b0260ff60b01b19909216919091179055565b600082820183811015610c1c576040805162461bcd60e51b815260206004820152601b60248201527a536166654d6174683a206164646974696f6e206f766572666c6f7760281b604482015290519081900360640190fd5b600082611bf6575060006111b7565b82820282848281611c0357fe5b0414610c1c5760405162461bcd60e51b8152600401808060200182810382526021815260200180611e0c6021913960400191505060405180910390fd5b6000610c1c83836040518060400160405280601a815260200179536166654d6174683a206469766973696f6e206279207a65726f60301b815250611cc1565b6000610c1c83836040518060400160405280601e81526020017f536166654d6174683a207375627472616374696f6e206f766572666c6f770000815250611d63565b60008183611d4d5760405162461bcd60e51b81526004018080602001828103825283818151815260200191508051906020019080838360005b83811015611d12578181015183820152602001611cfa565b50505050905090810190601f168015611d3f5780820380516001836020036101000a031916815260200191505b509250505060405180910390fd5b506000838581611d5957fe5b0495945050505050565b60008184841115611db55760405162461bcd60e51b8152602060048201818152835160248401528351909283926044909101919085019080838360008315611d12578181015183820152602001611cfa565b50505090039056fe5661756c745072696365466565643a20696e76616c6964205f707269636553616d706c6553706163655661756c745072696365466565643a20636f756c64206e6f74206665746368207072696365536166654d6174683a206d756c7469706c69636174696f6e206f766572666c6f775661756c745072696365466565643a2061646a7573746d656e74206672657175656e63792065786365656465645661756c745072696365466565643a20666f7262696464656e00000000000000436861696e6c696e6b20666565647320617265206e6f74206265696e6720757064617465645661756c745072696365466565643a20696e76616c6964205f7370726561644261736973506f696e74735661756c745072696365466565643a20696e76616c69642070726963650000005661756c745072696365466565643a20696e76616c69642070726963652066656564a2646970667358221220e7e3694229f558ab15f0c3d3db426bdc95328f4cd09611f3d63332aa35573b9b64736f6c634300060c0033";

export class VaultPriceFeed__factory extends ContractFactory {
  constructor(
    ...args: [signer: Signer] | ConstructorParameters<typeof ContractFactory>
  ) {
    if (args.length === 1) {
      super(_abi, _bytecode, args[0]);
    } else {
      super(...args);
    }
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<VaultPriceFeed> {
    return super.deploy(overrides || {}) as Promise<VaultPriceFeed>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): VaultPriceFeed {
    return super.attach(address) as VaultPriceFeed;
  }
  connect(signer: Signer): VaultPriceFeed__factory {
    return super.connect(signer) as VaultPriceFeed__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): VaultPriceFeedInterface {
    return new utils.Interface(_abi) as VaultPriceFeedInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): VaultPriceFeed {
    return new Contract(address, _abi, signerOrProvider) as VaultPriceFeed;
  }
}
