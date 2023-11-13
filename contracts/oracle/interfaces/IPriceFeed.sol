// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IPriceFeed {
    struct PriceInfo {
        // Price
        uint256 price;
        // Confidence interval around the price
        uint256 conf;
    }

    function latestAnswer() external view returns (PriceInfo memory);
}