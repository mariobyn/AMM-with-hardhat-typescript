//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

contract Market {
    IERC20 public xToken;
    IERC20 public yToken;

    event Supply(uint256, uint256);
    event Trade(uint256);

    constructor(IERC20 _xToken, IERC20 _yToken) {
        xToken = _xToken;
        yToken = _yToken;
    }

    function supply(uint256 _xAmount, uint256 _yAmount) public {
        require(_xAmount > 0 && _yAmount > 0, "xAmount or yAmount is 0");
        require(
            xToken.balanceOf(msg.sender) >= _xAmount,
            "xAmount is greater than available balance of sender"
        );
        require(
            yToken.balanceOf(msg.sender) >= _yAmount,
            "yAmount is greater than available balance of sender"
        );
        xToken.transferFrom(msg.sender, address(this), _xAmount);
        yToken.transferFrom(msg.sender, address(this), _yAmount);
        emit Supply(_xAmount, _yAmount);
    }

    function trade(uint256 _xAmount) public {
        require(_xAmount > 0, "amount is 0");
        uint256 amount = (_xAmount * yToken.balanceOf((address(this)))) /
            xToken.balanceOf(address(this));
        xToken.transferFrom(msg.sender, address(this), _xAmount);
        yToken.transfer(msg.sender, amount);
        emit Trade(_xAmount);
    }
}
