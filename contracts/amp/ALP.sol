// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../tokens/MintableBaseToken.sol";

contract ALP is MintableBaseToken {
    constructor() MintableBaseToken("Amped Finance LP", "ALP", 0) {
    }

    function id() external pure returns (string memory _name) {
        return "ALP";
    }
}
