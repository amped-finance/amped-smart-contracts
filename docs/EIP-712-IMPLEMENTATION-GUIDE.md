# EIP-712 Implementation Guide for AmpedStakingRouterV2

## Overview

The AmpedStakingRouterV2 implements EIP-712 typed data signing to secure all delegated operations. This prevents the critical vulnerability where handlers could arbitrarily move user funds without consent.

## Key Changes from V1 to V2

### Removed Features
- ❌ `isHandler` mapping - No longer needed
- ❌ `onlyHandler` modifier - Replaced with signature verification
- ❌ Ability for any address to act on behalf of users without consent

### Added Features
- ✅ EIP-712 domain separator
- ✅ Type hashes for all delegated operations
- ✅ Nonce management for replay protection
- ✅ Signature verification for all "ForAccount" functions
- ✅ Deadline parameter to prevent signature replay after expiry

## Contract Architecture

### Domain Configuration
```solidity
bytes32 public constant DOMAIN_TYPEHASH = keccak256(
    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
);

// Set in constructor
DOMAIN_SEPARATOR = keccak256(
    abi.encode(
        DOMAIN_TYPEHASH,
        keccak256(bytes("AmpedStakingRouter")),
        keccak256(bytes("2")),
        chainId,
        address(this)
    )
);
```

### Supported Operations

1. **Stake AMPED Tokens**
   - Direct: `stakeAmped(uint256 amount)`
   - Delegated: `stakeAmpedForAccount(address account, uint256 amount, uint256 deadline, uint8 v, bytes32 r, bytes32 s)`

2. **Unstake AMPED Tokens**
   - Direct: `unstakeAmped(uint256 amount)`
   - Delegated: `unstakeAmpedForAccount(address account, uint256 amount, uint256 deadline, uint8 v, bytes32 r, bytes32 s)`

3. **Mint and Stake GLP**
   - Direct: `mintAndStakeGlp(address token, uint256 amount, uint256 minUsdg, uint256 minGlp)`
   - Delegated: `mintAndStakeGlpForAccount(...signature params...)`

## Signature Generation

### JavaScript/TypeScript Example
```typescript
// Domain setup
const domain = {
  name: "AmpedStakingRouter",
  version: "2",
  chainId: 1, // Mainnet
  verifyingContract: routerAddress
};

// Type definition
const types = {
  Stake: [
    { name: "account", type: "address" },
    { name: "amount", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" }
  ]
};

// Get current nonce
const nonce = await router.nonces(userAddress);

// Set deadline (30 minutes from now)
const deadline = Math.floor(Date.now() / 1000) + 1800;

// Value to sign
const value = {
  account: userAddress,
  amount: ethers.utils.parseEther("100"),
  nonce: nonce,
  deadline: deadline
};

// Generate signature
const signature = await signer._signTypedData(domain, types, value);
const { v, r, s } = ethers.utils.splitSignature(signature);
```

### Solidity Verification
```solidity
// Reconstruct the signed message
bytes32 structHash = keccak256(
    abi.encode(
        STAKE_TYPEHASH,
        _account,
        _amount,
        nonces[_account]++,
        _deadline
    )
);

// Create digest
bytes32 digest = keccak256(
    abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash)
);

// Recover signer
address signer = ecrecover(digest, v, r, s);
require(signer == _account && signer != address(0), "Invalid signature");
```

## Security Features

### 1. Replay Protection
- Each user has a nonce that increments with every signature use
- Old signatures cannot be replayed after nonce increment

### 2. Deadline Protection
- Each signature includes a deadline timestamp
- Signatures expire and cannot be used after deadline

### 3. Chain Protection
- Domain separator includes chainId
- Signatures from testnet cannot be replayed on mainnet

### 4. Contract Protection
- Domain separator includes contract address
- Signatures for one router cannot be used on another

## Integration Guide

### For Frontend Developers

1. **Install Dependencies**
```bash
npm install ethers
```

2. **Use the Signature Helper**
```typescript
import AmpedStakingSignatureHelper from './signatureHelper';

const helper = new AmpedStakingSignatureHelper(provider, routerAddress, chainId);

// Stake with signature
const tx = await helper.stakeWithSignature(signer, amount);
```

3. **Handle Errors**
```typescript
try {
  const tx = await helper.stakeWithSignature(signer, amount);
  await tx.wait();
} catch (error) {
  if (error.message.includes("expired signature")) {
    // Regenerate signature with new deadline
  } else if (error.message.includes("invalid signature")) {
    // Check signer address matches account
  }
}
```

### For Smart Contract Developers

1. **Approve Tokens First**
```solidity
IERC20(ampedToken).approve(router, amount);
```

2. **Call with Signature**
```solidity
router.stakeAmpedForAccount(account, amount, deadline, v, r, s);
```

3. **Monitor Events**
```solidity
event StakeAmped(address indexed account, uint256 ampedAmount, uint256 ampAmount);
```

## Testing

### Unit Test Example
```javascript
it("Should stake with valid signature", async function () {
  const amount = ethers.utils.parseEther("100");
  const deadline = Math.floor(Date.now() / 1000) + 3600;
  
  // Approve tokens
  await ampedToken.connect(user).approve(router.address, amount);
  
  // Generate signature
  const { v, r, s } = await generateStakeSignature(user, router, amount, deadline);
  
  // Execute stake
  await router.stakeAmpedForAccount(user.address, amount, deadline, v, r, s);
});
```

### Security Tests
1. ✅ Test expired signatures are rejected
2. ✅ Test signatures from wrong signer are rejected
3. ✅ Test replay attacks are prevented
4. ✅ Test nonce increments correctly
5. ✅ Test cross-chain replay is prevented

## Migration from V1

### For Users
1. Existing stakes remain unaffected
2. New stakes require signature or direct interaction
3. No more handler-based operations without consent

### For Integrators
1. Remove handler registration code
2. Implement signature generation
3. Update UI to collect user signatures
4. Add deadline selection (recommended: 30 minutes)

## Common Issues and Solutions

### Issue: "Invalid signature"
**Causes:**
- Wrong signer address
- Incorrect domain parameters
- Nonce mismatch

**Solution:**
- Verify signer matches account parameter
- Check domain matches contract deployment
- Ensure nonce hasn't been used

### Issue: "Expired signature"
**Cause:** Deadline has passed

**Solution:** Generate new signature with future deadline

### Issue: "Slippage exceeded"
**Cause:** Price movement during signature generation

**Solution:** Increase slippage tolerance or regenerate signature

## Best Practices

1. **Set Reasonable Deadlines**
   - Too short: User might not complete transaction in time
   - Too long: Signature could be pending for extended period
   - Recommended: 30 minutes

2. **Handle Nonce Carefully**
   - Always fetch current nonce before signing
   - Don't cache nonces
   - Handle nonce increment failures

3. **Secure Private Keys**
   - Never expose private keys in frontend
   - Use hardware wallets when possible
   - Implement secure key management

4. **Monitor Gas Costs**
   - Signature verification adds ~3000 gas
   - Still more efficient than multiple transactions
   - Batch operations when possible

## Audit Recommendations

The EIP-712 implementation addresses the critical handler vulnerability, but additional security measures are recommended:

1. **Add Multi-sig Governance** - See governance upgrade guide
2. **Implement Price Oracles** - Prevent swap manipulation
3. **Add Emergency Pause** - Allow halting during attacks
4. **Enable Slippage Configuration** - Let users set their tolerance

## Resources

- [EIP-712 Specification](https://eips.ethereum.org/EIPS/eip-712)
- [OpenZeppelin EIP-712 Guide](https://docs.openzeppelin.com/contracts/4.x/utilities#eip712)
- [Ethers.js Typed Data Signing](https://docs.ethers.io/v5/api/signer/#Signer-signTypedData)