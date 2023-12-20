// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

library Asserts {
    function _equals(
        string memory s1,
        string memory s2
    ) internal pure returns (bool) {
        if (bytes(s1).length != bytes(s2).length) return false;
        return
            keccak256(abi.encodePacked(s1)) == keccak256(abi.encodePacked(s2));
    }
}
