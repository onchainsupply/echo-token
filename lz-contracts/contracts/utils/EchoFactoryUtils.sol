// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { Create2 } from "@openzeppelin/contracts/utils/Create2.sol";

enum TokenType {
    Regular,
    RegularCreate2,
    OFT,
    OFTCreate2,
    OFTAdapter
}

struct TokenInfo {
    string name;
    string symbol;
    address token;
    TokenType kind;
    uint256 totalSupply;
}

library EchoFactoryUtils {
    /// @notice Generates a deterministic salt based on token name, symbol, and creator address
    function generateSalt(string memory name, string memory symbol, address creator) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(name, symbol, creator));
    }

    /// @notice Predicts the deployed contract address using CREATE2
    function predictAddress(bytes memory bytecode, bytes32 salt, address deployer) internal pure returns (address) {
        bytes32 hash = keccak256(abi.encodePacked(bytes1(0xff), deployer, salt, keccak256(bytecode)));
        return address(uint160(uint256(hash)));
    }
}
