// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Base64} from '@openzeppelin/contracts/utils/Base64.sol';

import {Evidenz} from '../../../domain/Evidenz.sol';

abstract contract ERC721Base64URI is Evidenz {
    /**
     * @dev See {ERC721-tokenURI}.
     */
    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        _requireMinted(tokenId);
        bytes memory metadata = _metadata(tokenId);
        return
            string(
                abi.encodePacked(
                    'data:application/json;base64,',
                    Base64.encode(metadata)
                )
            );
    }
}
