// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
import {Strings} from '@openzeppelin/contracts/utils/Strings.sol';
import {IERC165} from '@openzeppelin/contracts/utils/introspection/IERC165.sol';

import {IRevealable} from './IRevealable.sol';
import {OnChainAssets} from '../domain/OnChainAssets.sol';

abstract contract Revealable is OnChainAssets, IRevealable {
    using Strings for uint256;

    string public defaultImage;

    mapping(uint256 => bytes32) private _hashedPublicKeys;

    function reveal(uint256 tokenId, string calldata publicKey) external {
        require(ownerOf(tokenId) == msg.sender, 'Revealable: token not owned');
        _reveal(tokenId, publicKey);
    }

    function setDefaultImage(
        string calldata newDefaultImage
    ) external onlyOwner {
        defaultImage = newDefaultImage;
    }

    function getHashedPublicKey(
        uint256 tokenId
    ) external view returns (bytes32) {
        _requireMinted(tokenId);
        return _hashedPublicKeys[tokenId];
    }

    function getDefaultImage() external view returns (string memory) {
        return defaultImage;
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(IERC165, OnChainAssets) returns (bool) {
        return
            interfaceId == type(IRevealable).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    function isRevealed(uint256 id) public view returns (bool) {
        return bytes(publicKeys[id]).length != 0;
    }

    function _addKey(
        uint256 tokenId,
        bytes memory hashedPublicKey
    ) internal virtual override {
        bytes32 result;
        assembly {
            result := mload(add(hashedPublicKey, 32))
        }
        _hashedPublicKeys[tokenId] = result;
    }

    function _reveal(uint256 tokenId, string calldata publicKey) internal {
        _requireMinted(tokenId);
        require(ownerOf(tokenId) != owner(), 'Revealable: token not claimed');
        require(
            _hashedPublicKeys[tokenId] ==
                keccak256(abi.encodePacked(publicKey)),
            'Revealable: invalid public key'
        );
        require(!isRevealed(tokenId), 'Revealable: revealed already');
        publicKeys[tokenId] = publicKey;
        emit Reveal(tokenId);
    }

    function _burn(uint256 tokenId) internal virtual override {
        publicKeys[tokenId] = '';
        super._burn(tokenId);
    }

    function _getName(
        uint256 tokenId
    ) internal view virtual override returns (string memory) {
        if (isRevealed(tokenId)) return super._getName(tokenId);
        else
            return string(abi.encodePacked('Credential #', tokenId.toString()));
    }

    function _getDescription(
        uint256 tokenId
    ) internal view virtual override returns (string memory) {
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
        if (isRevealed(tokenId))
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
    ) internal view virtual override returns (string memory) {
        if (!isRevealed(tokenId)) return string(defaultImage);
        else return super._getImage(tokenId);
    }

    function _getExternalUrl(
        uint256 tokenId
    ) internal view virtual override returns (string memory) {
        if (!isRevealed(tokenId)) return issuer.url;
        else return super._getExternalUrl(tokenId);
    }

    function _getStatus(
        uint256 tokenId
    ) internal view virtual override returns (string memory) {
        if (isRevealed(tokenId)) return 'revealed';
        else return super._getStatus(tokenId);
    }
}
