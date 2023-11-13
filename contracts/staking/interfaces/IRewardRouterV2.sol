// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IRewardRouterV2 {
    function feeAlpTracker() external view returns (address);
    function stakedAlpTracker() external view returns (address);
}