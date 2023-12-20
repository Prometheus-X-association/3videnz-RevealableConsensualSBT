// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {IERC165} from '@openzeppelin/contracts/utils/introspection/IERC165.sol';

interface IRevealable is IERC165 {
    event Reveal(uint256 tokenId);

    function reveal(uint256 tokenId, string calldata publicKey) external;

    function setDefaultImage(string calldata newDefaultImage) external;

    function getHashedPublicKey(
        uint256 tokenId
    ) external view returns (bytes32);
}
