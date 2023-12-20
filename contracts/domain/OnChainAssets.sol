// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
import {ERC721} from '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import {Strings} from '@openzeppelin/contracts/utils/Strings.sol';
import {IERC165} from '@openzeppelin/contracts/utils/introspection/IERC165.sol';

import {CustomTemplate} from './CustomTemplate.sol';
import {Evidenz} from './Evidenz.sol';
import {IOnChainAssets} from './IOnChainAssets.sol';
import {Environment} from '../utils/Environment.sol';

abstract contract OnChainAssets is Evidenz, CustomTemplate, IOnChainAssets {
    using Strings for uint256;
    using Environment for Environment.Endpoint;

    Issuer public issuer;

    mapping(uint256 => string) internal data;
    mapping(uint256 => string) internal publicKeys;

    function setIssuer(Issuer calldata issuer_) external onlyOwner {
        issuer = issuer_;
    }

    function tokenData(uint256 tokenId) external view returns (string memory) {
        _requireMinted(tokenId);
        return data[tokenId];
    }

    function getIssuer() external view returns (Issuer memory) {
        return issuer;
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721, IERC165) returns (bool) {
        return
            interfaceId == type(IOnChainAssets).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    function _addKey(uint256 tokenId, bytes memory publicKey) internal virtual {
        publicKeys[tokenId] = string(abi.encodePacked(publicKey));
    }

    /**
     * @dev See {Evidenz-_metadata}.
     */
    function _metadata(
        uint256 tokenId
    ) internal view virtual override returns (bytes memory) {
        return
            abi.encodePacked(
                '{"name": "',
                _getName(tokenId),
                '","description": "',
                _getDescription(tokenId),
                '","image": "',
                _getImage(tokenId),
                '","external_url": "',
                _getExternalUrl(tokenId),
                '","status": "',
                _getStatus(tokenId),
                '"}'
            );
    }

    function _getName(uint256) internal view virtual returns (string memory) {
        return name();
    }

    function _getDescription(
        uint256 tokenId
    ) internal view virtual returns (string memory) {
        address dataOwner = ownerOf(tokenId);
        string memory description = string(
            abi.encodePacked('Certificate issued by ', issuer.name)
        );
        if (dataOwner != owner())
            description = string(
                abi.encodePacked(
                    description,
                    ', owned by ',
                    Strings.toHexString(dataOwner)
                )
            );
        description = string(
            abi.encodePacked(
                description,
                ', accessible at ',
                _getExternalUrl(tokenId)
            )
        );
        return description;
    }

    function _getImage(
        uint256 tokenId
    ) internal view virtual returns (string memory) {
        return template.toolbox.buildURL(publicKeys[tokenId]);
    }

    function _getExternalUrl(
        uint256 tokenId
    ) internal view virtual returns (string memory) {
        return template.reader.buildURL(publicKeys[tokenId]);
    }

    function _getStatus(
        uint256 tokenId
    ) internal view virtual returns (string memory) {
        if (ownerOf(tokenId) != owner()) return 'claimed';
        else return 'minted';
    }
}
