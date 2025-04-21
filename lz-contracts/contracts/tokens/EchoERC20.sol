// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { ERC20Permit, ERC20 } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

// -------------------
// Standard ERC20 Token
// -------------------
contract EchoERC20 is ERC20Permit {
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply,
        address _recipient
    ) ERC20(_name, _symbol) ERC20Permit(_name) {
        _mint(_recipient, _totalSupply);
    }
}
