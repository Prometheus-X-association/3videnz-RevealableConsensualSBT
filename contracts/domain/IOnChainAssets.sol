// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {IERC165} from '@openzeppelin/contracts/utils/introspection/IERC165.sol';

interface IOnChainAssets is IERC165 {
    struct Issuer {
        string name;
        string url;
    }

    function setIssuer(Issuer calldata issuer_) external;

    function tokenData(uint256 tokenId) external view returns (string memory);
}
