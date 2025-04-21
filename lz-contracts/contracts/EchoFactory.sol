// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Address } from "@openzeppelin/contracts/utils/Address.sol";
import { Create2 } from "@openzeppelin/contracts/utils/Create2.sol";
import { EchoOFTAdapter } from "./tokens/EchoOFTAdapter.sol";
import { EchoERC20 } from "./tokens/EchoERC20.sol";
import { EchoOFT } from "./tokens/EchoOFT.sol";

contract EchoFactory is Ownable {
    enum TokenType {
        Regular,
        RegularCreate2,
        OFT,
        OFTCreate2,
        OFTAdapter
    }

    struct TokenInfo {
        address token;
        TokenType kind;
        uint256 totalSupply;
    }

    uint256 public deployFee = 0.1 ether;
    address public lzEndpoint;

    mapping(address => address[]) public userTokens;
    mapping(address => TokenInfo) public tokenRegistry;

    event TokenRegistered(address indexed user, address token, TokenType kind);
    event FeeCollected(address indexed by, uint256 amount);

    constructor(address _lzEndpoint) Ownable(msg.sender) {
        lzEndpoint = _lzEndpoint;
    }

    function launchToken(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        address recipient
    ) external payable returns (address token) {
        require(msg.value >= deployFee, "Insufficient deploy fee");

        token = address(new EchoERC20(name, symbol, totalSupply, recipient));
        _register(msg.sender, token, TokenType.Regular, totalSupply);
    }

    function launchToken2(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        bytes32 salt
    ) external payable returns (address token) {
        require(msg.value >= deployFee, "Insufficient deploy fee");

        bytes memory bytecode = abi.encodePacked(type(EchoERC20).creationCode, abi.encode(name, symbol, totalSupply));
        token = Create2.deploy(0, salt, bytecode);

        _register(msg.sender, token, TokenType.RegularCreate2, totalSupply);
    }

    function launchOFT(
        string memory name,
        string memory symbol,
        uint256 totalSupply
    ) external payable returns (address token) {
        require(msg.value >= deployFee, "Insufficient deploy fee");

        token = address(new EchoOFT(name, symbol, totalSupply, lzEndpoint, owner(), msg.sender));
        _register(msg.sender, token, TokenType.OFT, totalSupply);
    }

    function launchOFT2(
        string memory name,
        string memory symbol,
        uint8 sharedDecimals,
        uint256 totalSupply,
        bytes32 salt
    ) external payable returns (address token) {
        require(msg.value >= deployFee, "Insufficient deploy fee");

        bytes memory bytecode = abi.encodePacked(
            type(EchoOFT).creationCode,
            abi.encode(name, symbol, lzEndpoint, sharedDecimals, totalSupply)
        );
        token = Create2.deploy(0, salt, bytecode);

        _register(msg.sender, token, TokenType.OFTCreate2, totalSupply);
    }

    function wrapAsOFT(address existingToken) external payable returns (address adapter) {
        require(msg.value >= deployFee, "Insufficient deploy fee");

        adapter = address(new EchoOFTAdapter(existingToken, lzEndpoint, msg.sender));
        _register(msg.sender, adapter, TokenType.OFTAdapter, 0);
    }

    function _register(address user, address token, TokenType kind, uint256 supply) internal {
        tokenRegistry[token] = TokenInfo({ token: token, kind: kind, totalSupply: supply });
        userTokens[user].push(token);

        Address.sendValue(payable(owner()), deployFee);
        emit TokenRegistered(user, token, kind);
        emit FeeCollected(user, deployFee);
    }

    function tokenExists(address user, address token) internal view returns (bool) {
        address[] memory tokens = userTokens[user];
        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokens[i] == token) return true;
        }
        return false;
    }

    function getUserTokens(address user) external view returns (address[] memory) {
        return userTokens[user];
    }

    function getTokenInfo(address token) external view returns (address, TokenType, uint256) {
        TokenInfo memory info = tokenRegistry[token];
        return (info.token, info.kind, info.totalSupply);
    }

    function changeDeployFee(uint256 newFee) external onlyOwner {
        deployFee = newFee;
    }

    receive() external payable {}
}
