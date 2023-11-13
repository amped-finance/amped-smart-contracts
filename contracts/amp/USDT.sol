// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../tokens/MintableBaseToken.sol";

contract USDT is MintableBaseToken {
    constructor() MintableBaseToken("USDT", "USDT", 10000000000000000000000000) {
    }

    function id() external pure returns (string memory _name) {
        return "USDT";
    }
}
