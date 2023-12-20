// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {ERC5484} from '../ERC5484.sol';
import {Asserts} from '../../../utils/Asserts.sol';

/**
 * @title ERC5484 Burnable Token
 * @dev ERC5484 Token that can be burned (destroyed).
 */
abstract contract ERC5484Burnable is ERC5484 {
    using Asserts for string;

    /**
     * @dev Initializes the contract by setting a `name` and a `symbol` to the token collection.
     */
    constructor(
        string memory name_,
        string memory symbol_,
        string memory burnAuth_
    ) ERC5484(name_, symbol_) {
        burnAuthorization = getBurnAuth(burnAuth_);
    }

    /**
     * @dev Burns `tokenId`. See {ERC5484-_burn}.
     *
     * Requirements:
     *
     * - The caller must have the burn authorization for `tokenId`.
     */
    function burn(uint256 tokenId) public virtual {
        require(_isAuthorizedToBurn(tokenId), 'ERC5484: sender cannot burn');
        _burn(tokenId);
    }

    function getBurnAuth(string memory auth) internal pure returns (BurnAuth) {
        require(
            auth._equals('IssuerOnly') ||
                auth._equals('OwnerOnly') ||
                auth._equals('Both') ||
                auth._equals('Neither'),
            'ERC5484: invalid burn auth'
        );
        if (auth._equals('IssuerOnly')) return BurnAuth.IssuerOnly;
        if (auth._equals('OwnerOnly')) return BurnAuth.OwnerOnly;
        if (auth._equals('Both')) return BurnAuth.Both;
        return BurnAuth.Neither;
    }

    function _isAuthorizedToBurn(uint256 tokenId) private view returns (bool) {
        return
            (msg.sender == owner() &&
                (burnAuthorization == BurnAuth.IssuerOnly ||
                    burnAuthorization == BurnAuth.Both)) ||
            (msg.sender == ownerOf(tokenId) &&
                (burnAuthorization == BurnAuth.OwnerOnly ||
                    burnAuthorization == BurnAuth.Both));
    }
}
