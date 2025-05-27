// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "./IRewardRouterV2.sol";

interface IRewardRouterV2Extended is IRewardRouterV2 {
    function mintAndStakeGlp(address _token, uint256 _amount, uint256 _minUsdg, uint256 _minGlp) external returns (uint256);
    function mintAndStakeGlpETH(uint256 _minUsdg, uint256 _minGlp) external payable returns (uint256);
    
    function unstakeAndRedeemGlp(address _tokenOut, uint256 _glpAmount, uint256 _minOut, address _receiver) external returns (uint256);
    function unstakeAndRedeemGlpETH(uint256 _glpAmount, uint256 _minOut, address payable _receiver) external returns (uint256);
    
    function claimFees() external;
    function claimEsGmx() external;
    function claim() external;
}