// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { EchoFactoryUtils, Create2, TokenInfo, TokenType } from "./utils/EchoFactoryUtils.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Address } from "@openzeppelin/contracts/utils/Address.sol";
import { EchoOFTAdapter } from "./tokens/EchoOFTAdapter.sol";
import { EchoERC20 } from "./tokens/EchoERC20.sol";
import { EchoOFT } from "./tokens/EchoOFT.sol";

contract EchoFactory is Ownable {
    uint256 public defaultDeployFee = 0.1 ether;
    address public immutable lzEndpoint;
    uint256 public totalTokens;

    mapping(address => address[]) public userTokens;
    mapping(address => TokenInfo) public tokenRegistry;
    mapping(uint256 => address) public indexToToken;
    mapping(TokenType => uint256) public deployFees;

    event TokenRegistered(address indexed user, address token, TokenType kind);
    event FeeCollected(address indexed by, uint256 amount);

    constructor(address _lzEndpoint) Ownable(msg.sender) {
        require(_lzEndpoint != address(0), "Invalid endpoint");
        lzEndpoint = _lzEndpoint;

        // Set default deploy fees
        deployFees[TokenType.Regular] = defaultDeployFee;
        deployFees[TokenType.RegularCreate2] = defaultDeployFee;
        deployFees[TokenType.OFT] = defaultDeployFee;
        deployFees[TokenType.OFTCreate2] = defaultDeployFee;
        deployFees[TokenType.OFTAdapter] = defaultDeployFee;
    }

    function launchToken(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        address recipient
    ) external payable returns (address token) {
        _collectFee(TokenType.Regular);
        token = address(new EchoERC20(name, symbol, totalSupply, recipient));
        _register(msg.sender, token, TokenType.Regular, totalSupply, name, symbol);
    }

    function launchToken2(
        string memory name,
        string memory symbol,
        uint256 totalSupply
    ) external payable returns (address token) {
        _collectFee(TokenType.RegularCreate2);
        token = _create2Deploy(
            abi.encodePacked(type(EchoERC20).creationCode, abi.encode(name, symbol, totalSupply)),
            EchoFactoryUtils.generateSalt(name, symbol, msg.sender)
        );
        _register(msg.sender, token, TokenType.RegularCreate2, totalSupply, name, symbol);
    }

    function launchOFT(
        string memory name,
        string memory symbol,
        uint256 totalSupply
    ) external payable returns (address token) {
        _collectFee(TokenType.OFT);
        token = address(new EchoOFT(name, symbol, totalSupply, lzEndpoint, owner(), msg.sender));
        _register(msg.sender, token, TokenType.OFT, totalSupply, name, symbol);
    }

    function launchOFT2(
        string memory name,
        string memory symbol,
        uint256 totalSupply
    ) external payable returns (address token) {
        _collectFee(TokenType.OFTCreate2);
        token = _create2Deploy(
            abi.encodePacked(
                type(EchoOFT).creationCode,
                abi.encode(name, symbol, totalSupply, lzEndpoint, owner(), msg.sender)
            ),
            EchoFactoryUtils.generateSalt(name, symbol, msg.sender)
        );
        _register(msg.sender, token, TokenType.OFTCreate2, totalSupply, name, symbol);
    }

    function wrapAsOFT(address existingToken) external payable returns (address adapter) {
        _collectFee(TokenType.OFTAdapter);
        adapter = address(new EchoOFTAdapter(existingToken, lzEndpoint, msg.sender));
        _register(msg.sender, adapter, TokenType.OFTAdapter, 0, "Wrapped", "Adapter");
    }

    function _register(
        address user,
        address token,
        TokenType kind,
        uint256 supply,
        string memory name,
        string memory symbol
    ) internal {
        tokenRegistry[token] = TokenInfo({ name: name, symbol: symbol, token: token, kind: kind, totalSupply: supply });
        userTokens[user].push(token);
        indexToToken[totalTokens] = token;
        totalTokens++;

        emit TokenRegistered(user, token, kind);
    }

    function _create2Deploy(bytes memory bytecode, bytes32 salt) internal returns (address addr) {
        addr = Create2.deploy(0, salt, bytecode);
    }

    function _collectFee(TokenType kind) internal {
        uint256 fee = deployFees[kind];
        require(msg.value >= fee, "Insufficient deploy fee");
        Address.sendValue(payable(owner()), fee);
    }

    function tokenExists(address user, address token) public view returns (bool) {
        address[] memory tokens = userTokens[user];
        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokens[i] == token) return true;
        }
        return false;
    }

    function changeDeployFee(TokenType kind, uint256 newFee) external onlyOwner {
        deployFees[kind] = newFee;
    }

    receive() external payable {}
}
