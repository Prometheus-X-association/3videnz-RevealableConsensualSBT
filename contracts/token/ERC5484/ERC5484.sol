// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {IERC165} from '@openzeppelin/contracts/utils/introspection/IERC165.sol';
import {ERC165} from '@openzeppelin/contracts/utils/introspection/ERC165.sol';
import {ERC721} from '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
import {SignatureChecker} from '@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol';

import {IERC5484} from './IERC5484.sol';
import {Asserts} from '../../utils/Asserts.sol';

/**
 * @dev Implementation of https://eips.ethereum.org/EIPS/eip-5484[ERC5484] Consensual Soulbound Tokens.
 */
contract ERC5484 is ERC165, ERC721, IERC5484, Ownable {
    // Mapping from token ID to owner address
    BurnAuth internal burnAuthorization;

    /**
     * @dev Initializes the contract by setting a `name` and a `symbol` to the token collection.
     */
    constructor(
        string memory name_,
        string memory symbol_
    ) ERC721(name_, symbol_) {
        burnAuthorization = BurnAuth.Neither;
    }

    /**
     * @dev See {IERC721-ownerOf}.
     */
    function burnAuth(uint256 tokenId) external view returns (BurnAuth) {
        _requireMinted(tokenId);
        return burnAuthorization;
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC165, IERC165, ERC721) returns (bool) {
        return
            interfaceId == type(IERC5484).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    function getMessageToSign(
        uint256 tokenId
    ) public view virtual returns (bytes32) {
        return
            keccak256(abi.encodePacked(tokenURI(tokenId), burnAuthorization));
    }

    /**
     * @dev See {ERC721-_transfer}.
     */
    function _transfer(address, address, uint256) internal virtual override {
        revert('ERC5484: non-transferable token');
    }

    function _issue(
        address from,
        address to,
        uint256 tokenId,
        bytes calldata signature
    ) internal virtual {
        require(
            _checkSignature(to, tokenId, signature),
            'ERC5484: invalid signature'
        );
        super._transfer(from, to, tokenId);
        emit Issued(from, to, tokenId, burnAuthorization);
    }

    function _checkSignature(
        address to,
        uint256 tokenId,
        bytes calldata signature
    ) internal view virtual returns (bool) {
        bytes32 message = keccak256(
            abi.encodePacked(
                '\x19Ethereum Signed Message:\n32',
                getMessageToSign(tokenId)
            )
        );
        return SignatureChecker.isValidSignatureNow(to, message, signature);
    }
}
