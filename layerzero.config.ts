import { EndpointId } from '@layerzerolabs/lz-definitions';
import { ExecutorOptionType } from '@layerzerolabs/lz-v2-utilities';
import { TwoWayConfig, generateConnectionsConfig } from '@layerzerolabs/metadata-tools';
import { OAppEnforcedOption, OmniPointHardhat } from '@layerzerolabs/toolbox-hardhat';

// Define your AMPED token deployments
const sepoliaContract: OmniPointHardhat = {
  eid: EndpointId.SEPOLIA_V2_TESTNET,
  contractName: 'AmpedOFT', // or 'AmpedToken' depending on which contract you deployed
};

const baseSepoliaContract: OmniPointHardhat = {
  eid: EndpointId.BASESEP_V2_TESTNET,
  contractName: 'AmpedOFT',
};

// For mainnet deployments, uncomment and use these:
/*
const ethereumContract: OmniPointHardhat = {
  eid: EndpointId.ETHEREUM_V2_MAINNET,
  contractName: 'AmpedToken',
};

const sonicContract: OmniPointHardhat = {
  eid: 30278, // Sonic endpoint ID - may need to import/define this
  contractName: 'AmpedOFT',
};
*/

// Enforced options for all chains
// Adjust gas values based on your contract's _lzReceive gas usage
const EVM_ENFORCED_OPTIONS: OAppEnforcedOption[] = [
  {
    msgType: 1,
    optionType: ExecutorOptionType.LZ_RECEIVE,
    gas: 200000, // Adjust based on your contract's gas needs
    value: 0,
  },
];

// Define pathways between chains
const pathways: TwoWayConfig[] = [
  [
    sepoliaContract,
    baseSepoliaContract,
    [['LayerZero Labs'], []], // DVN configuration
    [1, 1], // Confirmations required
    [EVM_ENFORCED_OPTIONS, EVM_ENFORCED_OPTIONS], // Enforced options for each direction
  ],
  // Add more pathways for mainnet:
  /*
  [
    ethereumContract,
    sonicContract,
    [['LayerZero Labs'], []],
    [1, 1],
    [EVM_ENFORCED_OPTIONS, EVM_ENFORCED_OPTIONS],
  ],
  */
];

export default async function () {
  const connections = await generateConnectionsConfig(pathways);
  return {
    contracts: [
      { contract: sepoliaContract },
      { contract: baseSepoliaContract },
      // Add mainnet contracts when ready:
      // { contract: ethereumContract },
      // { contract: sonicContract },
    ],
    connections,
  };
}