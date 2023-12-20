// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {ERC721} from '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import {Counters} from '@openzeppelin/contracts/utils/Counters.sol';
import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';

abstract contract Evidenz is ERC721, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    constructor() {
        _tokenIdCounter.increment();
    }

    function _metadata(
        uint256 tokenId
    ) internal view virtual returns (bytes memory);

    function _mint() internal onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(owner(), tokenId);
        return tokenId;
    }

    /**
     * @dev Reverts if the `tokenId` has not been minted yet.
     */
    function _requireMinted(uint256 tokenId) internal view virtual override {
        uint256 nextTokenId = _tokenIdCounter.current();
        require(nextTokenId > tokenId, 'ERC721: invalid token ID');
        require(_exists(tokenId), 'ERC721: invalid token ID (burnt)');
    }
}
