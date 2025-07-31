# ERC20 OFT Governance Token Implementation Specification

## Overview
Implement a standard ERC20 token with LayerZero OFT (Omnichain Fungible Token) support and basic governance capabilities.

## Core Requirements

### 1. Base Token Implementation
- Use OpenZeppelin's ERC20 implementation
- Include ERC20Permit (EIP-2612) for gasless approvals
- Add ERC20Votes extension for governance delegation
- Implement ERC20Burnable for OFT compatibility
- Use ERC20Capped if a maximum supply is desired (optional)

### 2. LayerZero OFT Integration
- Inherit from LayerZero's OFT contract
- Override required functions to integrate with OpenZeppelin's ERC20
- Implement the standard OFT interface for cross-chain transfers
- Set up trusted remote addresses for each chain deployment

### 3. Governance Features
- Include vote delegation functionality (already in ERC20Votes)
- Implement checkpointing for historical balance queries
- Ensure compatibility with OpenZeppelin Governor contracts
- Include proper nonce tracking for signatures

## Technical Implementation

### Contract Structure
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@layerzerolabs/solidity-examples/contracts/token/oft/v2/OFTV2.sol";

contract GovernanceOFT is OFTV2, ERC20Burnable, ERC20Permit, ERC20Votes {
    // Constructor implementation
    // Override required functions from both OFT and ERC20 extensions
    // Implement _mint and _burn to work with OFT
}
```

### Key Functions to Implement

1. **Constructor**
   - Initialize token name, symbol, and decimals
   - Set up LayerZero endpoint
   - Initialize ERC20Permit domain separator
   - Consider initial mint if needed

2. **Required Overrides**
   - `_mint(address account, uint256 amount)` - Ensure compatibility with ERC20Votes
   - `_burn(address account, uint256 amount)` - Ensure compatibility with ERC20Votes
   - `_afterTokenTransfer()` - Required by ERC20Votes
   - `_debitFrom()` - OFT function for cross-chain transfers
   - `_creditTo()` - OFT function for cross-chain transfers

3. **OFT Specific Functions**
   - `sendFrom()` - Send tokens cross-chain
   - `estimateSendFee()` - Calculate cross-chain transfer fees
   - `setTrustedRemote()` - Configure trusted contracts on other chains
   - `setMinDstGas()` - Set minimum gas for destination chains

### Access Control
- Use Ownable for basic access control
- Owner can set trusted remotes and gas parameters
- Consider using a multisig for owner address
- No mint function unless specifically required (preserve fixed supply)

### Security Considerations
1. Implement reentrancy guards on cross-chain operations
2. Add pausable functionality for emergency situations
3. Validate all cross-chain parameters
4. Consider rate limiting for large transfers

### Deployment Instructions
1. Deploy on primary chain first
2. Deploy on secondary chains with same token parameters
3. Call `setTrustedRemote()` on each deployment to link contracts
4. Set appropriate `minDstGas` for each destination chain
5. Verify all contracts on block explorers

### Testing Requirements
- Test basic ERC20 functionality
- Test permit signatures
- Test delegation and voting power
- Test cross-chain transfers between at least 2 chains
- Test governance integration with a Governor contract
- Gas optimization tests

### Gas Optimizations
- Use custom errors instead of require strings
- Optimize storage layout
- Consider using immutable variables where possible
- Batch operations where appropriate

## Dependencies
```json
{
  "@openzeppelin/contracts": "^5.0.0",
  "@layerzerolabs/solidity-examples": "latest"
}
```

## Example Deployment Parameters
```javascript
{
  name: "GovernanceToken",
  symbol: "GOV",
  initialSupply: "1000000000000000000000000000", // 1 billion tokens
  lzEndpoint: "0x...", // LayerZero endpoint address for the chain
}
```

## Post-Deployment Checklist
- [ ] Verify contract on block explorer
- [ ] Set trusted remotes for all chain deployments
- [ ] Configure minimum destination gas
- [ ] Transfer ownership to multisig
- [ ] Test cross-chain transfer with small amount
- [ ] Deploy and configure Governor contract
- [ ] Document all deployed addresses

## Notes for Implementation
- Keep the implementation simple and standard
- Prioritize security over features
- Use well-tested libraries (OpenZeppelin + LayerZero)
- Avoid unnecessary complexity
- Document all assumptions and decisions