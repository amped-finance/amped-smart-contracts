// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./interfaces/IAmpIou.sol";

contract AmpIou is IERC20, IAmpIou {
    using SafeMath for uint256;

    mapping (address => uint256) private _balances;
    uint256 public override totalSupply;

    string public name;
    string public symbol;
    uint8 public decimals;

    address public minter;

    constructor (address _minter, string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
        minter = _minter;
        decimals = 18;
    }

    function mint(address account, uint256 amount) public override returns (bool) {
        require(msg.sender == minter, "AmpIou: forbidden");
        _mint(account, amount);
        return true;
    }

    function balanceOf(address account) public view override returns (uint256) {
        return _balances[account];
    }

    // empty implementation, AmpIou tokens are non-transferrable
    function transfer(address /* recipient */, uint256 /* amount */) public override returns (bool) {
        revert("AmpIou: non-transferrable");
    }

    // empty implementation, AmpIou tokens are non-transferrable
    function allowance(address /* owner */, address /* spender */) public view virtual override returns (uint256) {
        return 0;
    }

    // empty implementation, AmpIou tokens are non-transferrable
    function approve(address /* spender */, uint256 /* amount */) public virtual override returns (bool) {
        revert("AmpIou: non-transferrable");
    }

    // empty implementation, AmpIou tokens are non-transferrable
    function transferFrom(address /* sender */, address /* recipient */, uint256 /* amount */) public virtual override returns (bool) {
        revert("AmpIou: non-transferrable");
    }

    function _mint(address account, uint256 amount) internal virtual {
        require(account != address(0), "AmpIou: mint to the zero address");

        totalSupply = totalSupply.add(amount);
        _balances[account] = _balances[account].add(amount);
        emit Transfer(address(0), account, amount);
    }
}
