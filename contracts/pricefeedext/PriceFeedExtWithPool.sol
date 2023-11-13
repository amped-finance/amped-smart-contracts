// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function decimals() external view returns (uint8);
    function balanceOf(address account) external view returns (uint256);
}

struct PriceInfo {
    uint256 price;
    uint256 conf;
}

contract PriceFeedExtWithPool {
    address public gov;

    uint8 public decimals = 8;
    string public description;

    bool public isStableCoin = false;
    address public tokenAddress;
    address public pairAddress;
    address public usdtAddress;

    modifier onlyGov() {
        require(msg.sender == gov, "Not Governor");
        _;
    }

    constructor(string memory _description, uint8 _decimals) {
        gov = msg.sender;
        description = _description;
        decimals = _decimals;
    }

    function initialize(
        bool _isStableCoin,
        address _token,
        address _pair,
        address _usdt
    ) external onlyGov {
        isStableCoin = _isStableCoin;
        tokenAddress = _token;
        pairAddress = _pair;
        usdtAddress = _usdt;
    }

    function latestAnswer() external view returns (PriceInfo memory priceInfo) {
        if (isStableCoin) {
            priceInfo.price = 1 * 10 ** decimals;
            priceInfo.conf = priceInfo.price / 5000;
            return priceInfo;
        }

        uint256 tokenAmount = IERC20(tokenAddress).balanceOf(pairAddress);
        uint8 tokenDecimal = IERC20(tokenAddress).decimals();
        uint256 usdtAmount = IERC20(usdtAddress).balanceOf(pairAddress);
        uint256 usdtDecimal = IERC20(usdtAddress).decimals();

        uint256 price = ((usdtAmount / (10 ** usdtDecimal)) * 1 *
            (10 ** decimals)) / (tokenAmount / (10 ** tokenDecimal));

        priceInfo.price = price;
        priceInfo.conf = price / 5000;
    }

    function setGov(address newGov) external onlyGov {
        require(gov != newGov, "Already Set");
        gov = newGov;
    }

    function setDescription(string calldata newDescription) external onlyGov {
        description = newDescription;
    }

    function setDecimals(uint8 newDecimals) external onlyGov {
        require(decimals != newDecimals, "Already Set");
        decimals = newDecimals;
    }

    function setTokenAddress(address _token) external onlyGov {
        tokenAddress = _token;
    }

    function setPairAddress(address _pair) external onlyGov {
        pairAddress = _pair;
    }

    function setUSDTAddress(address _usdt) external onlyGov {
        usdtAddress = _usdt;
    }
}
