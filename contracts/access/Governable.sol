// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

contract Governable {
    address public gov;

    modifier onlyGov() {
        require(gov == msg.sender, "Governable: forbidden");
        _;
    }

    constructor() public {
        gov = msg.sender;
    }

    function setGov(address _gov) external virtual onlyGov {
        gov = _gov;
    }
}
