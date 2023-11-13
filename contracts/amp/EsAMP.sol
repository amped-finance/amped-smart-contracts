// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../tokens/MintableBaseToken.sol";

contract EsAMP is MintableBaseToken {
    constructor() MintableBaseToken("Escrowed AMP", "esAMP", 0) {
    }

    function id() external pure returns (string memory _name) {
        return "esAMP";
    }
}
