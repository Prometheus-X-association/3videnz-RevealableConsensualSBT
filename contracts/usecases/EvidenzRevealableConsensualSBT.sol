// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {ERC721} from '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import {ERC721Enumerable} from '@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol';

import {Evidenz} from '../domain/Evidenz.sol';
import {ERC5484} from '../token/ERC5484/ERC5484.sol';
import {ERC5484Burnable} from '../token/ERC5484/extensions/ERC5484Burnable.sol';
import {ERC721Base64URI} from '../token/ERC721/extensions/ERC721Base64URI.sol';
import {ERC721Renamable} from '../token/ERC721/extensions/ERC721Renamable.sol';
import {Revealable} from '../workflow/Revealable.sol';
import {Premint} from '../workflow/Premint.sol';

contract EvidenzRevealableConsensualSBT is
    Evidenz,
    Revealable,
    Premint,
    ERC5484Burnable,
    ERC721Base64URI,
    ERC721Enumerable,
    ERC721Renamable
{
    struct ToMint {
        string data;
        bytes hashedPublicKey;
        bytes32 hashedPinCode;
    }

    constructor(
        string memory name_,
        string memory symbol,
        string memory burnAuth
    ) ERC5484Burnable(name_, symbol, burnAuth) ERC721Renamable(name_) {}

    function mint(ToMint[] calldata toMint) external onlyOwner {
        for (uint256 i = 0; i < toMint.length; i++) {
            uint256 tokenId = _mint();
            data[tokenId] = toMint[i].data;
            _addKey(tokenId, toMint[i].hashedPublicKey);
            hashedPinCodes[tokenId] = toMint[i].hashedPinCode;
        }
    }

    function claim(
        address to,
        uint256 tokenId,
        string calldata pinCode,
        bytes calldata signature
    ) public onlyOwner {
        _requireMinted(tokenId);
        _requirePinCode(tokenId, pinCode);
        _issue(owner(), to, tokenId, signature);
    }

    function claimAndReveal(
        address to,
        uint256 tokenId,
        string calldata pinCode,
        string calldata publicKey,
        bytes calldata signature
    ) external onlyOwner {
        claim(to, tokenId, pinCode, signature);
        _reveal(tokenId, publicKey);
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(ERC721, ERC721Enumerable, ERC721Renamable, ERC5484, Revealable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(
        uint256 tokenId
    )
        public
        view
        virtual
        override(ERC721, ERC721Base64URI)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    /**
     * @dev See {ERC721-name}.
     */
    function name()
        public
        view
        virtual
        override(ERC721, ERC721Renamable)
        returns (string memory)
    {
        return super.name();
    }

    /**
     * @dev See {ERC721-_transfer}.
     */
    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(ERC721, ERC5484) {
        return super._transfer(from, to, tokenId);
    }

    /**
     * @dev See {ERC721-_beforeTokenTransfer}.
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal virtual override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
    }

    /**
     * @dev See {IERC721Metadata-_burn}.
     */
    function _burn(
        uint256 tokenId
    ) internal virtual override(ERC721, Revealable) {
        return super._burn(tokenId);
    }

    /**
     * @dev See {ERCERC5484-_checkSignature}.
     */
    function _checkSignature(
        address,
        uint256,
        bytes calldata signature
    ) internal view virtual override returns (bool) {
        return signature[0] != 0;
    }

    /**
     * @dev See {ERC721-_requireMinted}.
     */
    function _requireMinted(
        uint256 tokenId
    ) internal view override(ERC721, Evidenz) {
        return super._requireMinted(tokenId);
    }
}
