// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../tokens/MintableBaseToken.sol";

contract BTC is MintableBaseToken {
    constructor() MintableBaseToken("BTC", "BTC", 10000000000000000000000000) {
    }

    function id() external pure returns (string memory _name) {
        return "BTC";
    }
}
