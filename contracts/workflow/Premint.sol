// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Evidenz} from '../domain/Evidenz.sol';

abstract contract Premint is Evidenz {
    mapping(uint256 => bytes32) internal hashedPinCodes;

    function getHashedPinCode(uint256 tokenId) external view returns (bytes32) {
        _requireMinted(tokenId);
        return hashedPinCodes[tokenId];
    }

    function _requirePinCode(
        uint256 tokenId,
        string calldata pinCode
    ) internal view {
        require(
            hashedPinCodes[tokenId] == keccak256(abi.encodePacked(pinCode)),
            'Evidenz: the pin code is invalid'
        );
    }
}
