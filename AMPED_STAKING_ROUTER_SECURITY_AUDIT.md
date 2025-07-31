# AmpedStakingRouter Security Audit Report

**Date**: January 13, 2025  
**Auditors**: Claude (Primary), Grok-4, Gemini Pro  
**Contract**: AmpedStakingRouter.sol  
**Severity**: CRITICAL - Do not deploy in current state

## Executive Summary

The AmpedStakingRouter contract contains critical vulnerabilities that put all user funds at immediate risk. The most severe issues are the handler authorization bypass allowing theft of user funds and single-point governance failure. The contract requires fundamental architectural changes before deployment.

**Security Score: 2/10 (CRITICAL RISK)**

## Critical Vulnerabilities (2)

### 1. Handler Authorization Bypass
- **Severity**: CRITICAL
- **Location**: `AmpedStakingRouter.sol:104-106, 175-177`
- **Impact**: Complete theft of user funds by compromised handler

**Vulnerable Code**:
```solidity
function stakeAmpedForAccount(address _account, uint256 _amount) external nonReentrant onlyHandler returns (uint256) {
    return _stakeAmped(_account, _amount);
}
```

**Issue**: Any address designated as a 'handler' can stake or unstake tokens on behalf of ANY user without their consent or signature verification. The handler can call `IERC20(ampedToken).safeTransferFrom(_account, address(this), _amount)` to drain tokens from any user who has approved the contract.

**Proof of Concept**:
1. User approves AmpedStakingRouter for their AMPED tokens
2. Malicious handler calls `stakeAmpedForAccount(victim, balance)`
3. All victim's tokens are transferred without their consent

**Remediation**:
Implement EIP-712 signature verification for all delegated operations:
```solidity
function stakeAmpedForAccount(
    address _account,
    uint256 _amount,
    uint256 _deadline,
    uint8 v, bytes32 r, bytes32 s
) external nonReentrant returns (uint256) {
    require(block.timestamp <= _deadline, "Signature expired");
    bytes32 structHash = keccak256(abi.encode(
        STAKE_TYPEHASH,
        _account,
        _amount,
        nonces[_account]++,
        _deadline
    ));
    bytes32 digest = keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash));
    require(_account == ecrecover(digest, v, r, s), "Invalid signature");
    return _stakeAmped(_account, _amount);
}
```

### 2. Single Point of Governance Failure
- **Severity**: CRITICAL
- **Location**: `Governable.sol:17-19`
- **Impact**: Total protocol compromise if governance key is stolen

**Vulnerable Code**:
```solidity
modifier onlyGov() {
    require(msg.sender == gov, "Governable: forbidden");
    _;
}

function setGov(address _gov) external onlyGov {
    gov = _gov;
}
```

**Issue**: A single EOA controls all critical functions including:
- Setting handlers who can steal funds
- Changing critical contract addresses
- Withdrawing any tokens from the contract
- No timelock or multi-sig protection

**Remediation**:
1. Deploy a Gnosis Safe multi-signature wallet
2. Implement TimelockController for all governance actions
3. Update Governable contract:
```solidity
contract Governable {
    address public gov; // Gnosis Safe address
    address public pendingGov;
    address public timelock; // TimelockController
    uint256 public govTransferDelay = 48 hours;
    uint256 public govTransferTimestamp;
    
    modifier onlyGov() {
        require(msg.sender == timelock, "Must go through timelock");
        _;
    }
}
```

## High Severity Issues (6)

### 1. Unvalidated External Price Dependency
- **Location**: `AmpedStakingRouter.sol:118-120`
- **Impact**: Price manipulation and sandwich attacks

**Issue**: The contract trusts `SwapRouter.getAmountOut()` without independent validation:
```solidity
uint256 expectedOut = ISwapRouter(swapRouter).getAmountOut(ampedToken, ampToken, _amount);
uint256 minOut = _amount.mul(minAmountOut).div(BASIS_POINTS);
```

**Remediation**: Integrate Chainlink price oracle for validation

### 2. Approval Race Condition
- **Location**: `AmpedStakingRouter.sol:123-124, 200-201`
- **Impact**: Front-running theft of approved tokens

**Vulnerable Pattern**:
```solidity
IERC20(ampedToken).safeApprove(swapRouter, 0);
IERC20(ampedToken).safeApprove(swapRouter, _amount);
```

**Remediation**: Use `safeIncreaseAllowance` instead

### 3. No Emergency Pause Mechanism
- **Location**: Contract-wide
- **Impact**: Cannot halt operations during active exploit

**Remediation**: Implement OpenZeppelin's Pausable:
```solidity
import "@openzeppelin/contracts/security/Pausable.sol";

contract AmpedStakingRouter is ReentrancyGuard, Governable, Pausable {
    function pause() external onlyGov {
        _pause();
    }
    
    function unpause() external onlyGov {
        _unpause();
    }
}
```

### 4. Missing Timelock for Privileged Operations
- **Location**: All governance functions
- **Impact**: Instant malicious changes without user notice

### 5. Front-running Vulnerability in Swaps
- **Location**: All swap operations
- **Impact**: MEV extraction from user transactions

### 6. Excessive Trust in SwapRouter
- **Location**: `AmpedStakingRouter.sol:127`
- **Impact**: No validation between quoted and executed price

## Medium Severity Issues (7)

### 1. Zero Address Validation Missing
**Location**: `initialize()` function (lines 57-72)
```solidity
function initialize(
    address _ampedToken,
    address _ampToken,
    address _rewardRouter,
    address _swapRouter,
    address _weth
) external onlyGov {
    // Missing validation
    ampedToken = _ampedToken;  // Could be 0x0
    ampToken = _ampToken;      // Could be 0x0
}
```

### 2. Sequential Reward Tracker DoS Risk
**Location**: Lines 143-164
- Multiple sequential external calls could exceed gas limit

### 3. Incomplete GLP Implementation
**Location**: Line 249
```solidity
revert("AmpedStakingRouter: AMPED to GLP not yet implemented");
```

### 4. Missing Event Emissions
- `initialize()` doesn't emit events
- `setRewardTrackers()` doesn't emit events

### 5. Fixed Slippage Tolerance
- 95% hardcoded may be inappropriate for all market conditions

### 6. Gas Griefing Potential
- Sequential calls to three reward trackers

### 7. No Access Control Granularity
- Only binary gov/handler roles

## Low Severity Issues (4)

1. **Fixed 5-minute deadline** in `AmpedSwapRouter.sol:192`
2. **Potential integer overflow** in swapRatio calculations
3. **No rate limiting** on operations
4. **Missing NatSpec documentation**

## Immediate Action Plan

### Phase 1: Critical Fixes (Before ANY deployment)
1. **Implement signature verification** for all handler operations
2. **Deploy multi-sig governance** with timelock
3. **Add emergency pause functionality**
4. **Integrate price oracle** for swap validation

### Phase 2: High Priority (Within 1 week)
1. Fix approval race conditions
2. Add comprehensive input validation
3. Implement event emissions
4. Complete or remove GLP functionality

### Phase 3: Medium Priority (Within 2 weeks)
1. Add rate limiting
2. Improve documentation
3. Gas optimization for reward trackers
4. Implement granular access control

## Code Examples for Critical Fixes

### 1. EIP-712 Signature Implementation
```solidity
bytes32 public constant STAKE_TYPEHASH = keccak256(
    "Stake(address account,uint256 amount,uint256 nonce,uint256 deadline)"
);

mapping(address => uint256) public nonces;

function stakeAmpedForAccount(
    address _account,
    uint256 _amount,
    uint256 _deadline,
    uint8 v,
    bytes32 r,
    bytes32 s
) external nonReentrant returns (uint256) {
    require(block.timestamp <= _deadline, "Expired signature");
    
    bytes32 structHash = keccak256(abi.encode(
        STAKE_TYPEHASH,
        _account,
        _amount,
        nonces[_account]++,
        _deadline
    ));
    
    bytes32 digest = keccak256(abi.encodePacked(
        "\x19\x01",
        DOMAIN_SEPARATOR(),
        structHash
    ));
    
    address signer = ecrecover(digest, v, r, s);
    require(signer == _account, "Invalid signature");
    
    return _stakeAmped(_account, _amount);
}
```

### 2. Price Oracle Integration
```solidity
interface IPriceOracle {
    function getPrice(address tokenA, address tokenB) external view returns (uint256);
}

function _validateSwapPrice(
    address tokenIn,
    address tokenOut,
    uint256 amountIn,
    uint256 amountOut
) private view {
    uint256 oraclePrice = IPriceOracle(priceOracle).getPrice(tokenIn, tokenOut);
    uint256 executionPrice = amountOut.mul(1e18).div(amountIn);
    
    // Allow 3% deviation
    uint256 maxDeviation = oraclePrice.mul(300).div(10000);
    
    require(
        executionPrice >= oraclePrice.sub(maxDeviation) &&
        executionPrice <= oraclePrice.add(maxDeviation),
        "Price deviation exceeds threshold"
    );
}
```

### 3. Multi-sig Governance Setup
```solidity
// Deploy process:
// 1. Deploy Gnosis Safe with 3+ signers
// 2. Deploy TimelockController with 48h delay
// 3. Set Gnosis Safe as proposer/executor
// 4. Update all contracts to use timelock as gov

contract TimelockGovernance {
    ITimelock public timelock;
    
    modifier onlyTimelock() {
        require(msg.sender == address(timelock), "Not timelock");
        _;
    }
    
    function scheduleTransaction(
        address target,
        uint256 value,
        bytes calldata data,
        bytes32 predecessor,
        bytes32 salt,
        uint256 delay
    ) external onlyGov {
        timelock.schedule(target, value, data, predecessor, salt, delay);
    }
}
```

## Testing Requirements

Before deployment, the following tests MUST pass:
1. Handler cannot act without user signature
2. Governance changes require multi-sig and timelock
3. Price manipulation is detected and rejected
4. Contract can be paused during emergency
5. All state changes emit appropriate events

## Conclusion

The AmpedStakingRouter contract is currently **UNSAFE FOR PRODUCTION USE**. The critical vulnerabilities, particularly the handler authorization bypass and single-point governance, create an unacceptable risk of total fund loss.

The contract requires fundamental architectural changes, not just patches. We strongly recommend:
1. Complete redesign of the authorization model
2. Implementation of decentralized governance
3. Comprehensive re-audit after fixes
4. Extensive testing on testnet with bug bounty program

**Do not deploy this contract until all critical and high-severity issues are resolved.**

---
*This audit report should be reviewed by additional security experts before making final decisions.*