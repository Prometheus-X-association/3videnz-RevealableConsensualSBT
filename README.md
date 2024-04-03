# Evidenz Revealable Consensual SBT

## Overview
Evidenz Revealable Consensual SBT is a smart contract system for managing Prometheus-X verified identities. It provides a mechanism for issuing and managing soulbound tokens (SBTs) with the ability to reveal public keys associated with tokens after they have been claimed. This system ensures authenticity and privacy for the token holders while allowing for selective disclosure of their public keys.

## Features
- **Issue soulbound tokens (SBTs)** with the hashed public keys to be revealed and pin codes to be claimed.
- **Reveal public keys** associated with tokens after they have been claimed.
- **Support for ERC721 token standards** with additional functionalities for revealable and burnable tokens.

## NPM scripts

### Compile the smart contracts:

```bash
npx hardhat compile
```
### Run tests:

```bash
npx hardhat test
```

### Check code style and security:

```bash
npm run check
```

## Deployment
The contract can be deployed to the desired network using [Remix IDE](https://remix.ethereum.org/) or [Hardhat network configurations](https://hardhat.org/hardhat-runner/docs/guides/deploying).

Compile the contracts using ```Solidity version `0.8.18` and with the following optimizations:

```javascript
settings: {
  optimizer: { enabled: true, runs: 200 }
}
```

When deploying the `EvidenzRevealableConsensualSBT` contract, you need to provide the following constructor parameters:
- **name:** This parameter represents the name of the token collection. It is a string that identifies the tokens being managed by the contract.
- **symbol:** This parameter represents the symbol of the token collection. It is a short string that represents the tokens being managed by the contract, typically in uppercase letters.
- **burnAuth:** This parameter specifies the burn authorization for the tokens. It determines who has the authority to burn or destroy the tokens. The possible values for this parameter are:
  - **IssuerOnly:** Only the issuer of the token can burn it.
  - **OwnerOnly:** Only the owner of the token can burn it.
  - **Both:** Both the issuer and the owner of the token can burn it.
  - **Neither:** Nobody can burn the token.

When deploying the contract, you should provide appropriate values for these parameters based on your specific requirements and use case. For example:

```javascript
// Deploying EvidenzRevealableConsensualSBT contract with constructor parameters
const name = "MyToken";
const symbol = "MTK";
const burnAuth = "IssuerOnly"; // or "OwnerOnly", "Both", "Neither"

await deployer.deploy(EvidenzRevealableConsensualSBT, name, symbol, burnAuth);
```

## Configuration
To ensure proper operation, instances of `EvidenzRevealableConsensualSBT` require configuration with the following parameters:

- **Template:** Set the template contract address using the `setTemplate` function.
- **Default Image:** Define the default image for unrevealed tokens using the `setDefaultImage` function.
- **Issuer Information:** Provide issuer details, such as name and URL, using the `setIssuer` function.

### setTemplate

```solidity
/**
 * @dev Sets the template for creating new tokens.
 * @param template_ The template struct containing token metadata.
 */
function setTemplate(Template calldata template_) external onlyOwner
```

This function enables the contract owner to establish the template for generating new tokens.

The `template_` parameter is a struct representing the template for creating new tokens, comprising the following fields:

- **id:** Unique identifier for the template.
- **value:** Value associated with the template.
- **metadata:** Additional metadata for the template.
- **reader:** An Environment.Endpoint struct for reading token data.
- **toolbox:** An Environment.Endpoint struct for accessing the token's revealed image.

```solidity
struct Template {
    string id;
    string value;
    string metadata;
    Environment.Endpoint reader;
    Environment.Endpoint toolbox;
}
```

Both `reader` and `toolbox` are structures representing an `Endpoint` for interaction with external resources, encompassing the following fields:

- **url:** URL of the endpoint.
- **params:**  Additional parameters to append to the URL.

```solidity
struct Endpoint {
    string url;
    string params;
}
```

The resulting URL is generated by the contract as `Endpoint.url/token_publicKey?Endpoint.params`.

### setIssuer

```solidity
/**
 * @dev Sets the issuer information.
 * @param issuer_ The struct containing the issuer's name and URL.
 */
function setIssuer(Issuer calldata issuer_) external onlyOwner
```

This function enables the contract owner to set the issuer's information. 

The `issuer_` parameter is a structure encapsulating information about the entity issuing the tokens, including the name and URL:

- **name:** Represents the name of the issuer entity.
- **url:** Signifies the Uniform Resource Locator (URL) pointing to the issuer's website or relevant information.

```solidity
struct Issuer {
    string name;  
    string url;   
}
```

### setDefaultImage

```solidity
/**
 * @dev Sets the default image for unrevealed tokens.
 * @param defaultImage_ The URL of the default image.
 */
function setDefaultImage(string calldata defaultImage_) external onlyOwner
```

This function allows the contract owner to define the default image for unrevealed tokens.

The `defaultImage_` parameter is a string representing the URL of the default image to be associated with unrevealed tokens.

By calling this function, the contract owner can specify a default image to be displayed for tokens that have not yet been revealed by their owners.

## Usage

### mint

```solidity
/**
 * @dev Mints tokens with provided data, hashed public key, and hashed pin code.
 * @param toMint Array containing data, hashed public key, and hashed pin code for each token to be minted.
 */
function mint(ToMint[] calldata toMint) external onlyOwner
```

This function mints tokens with provided data, hashed public key, and hashed pin code.

The `toMint` parameter is an array of structs containing data, hashed public key, and hashed pin code for each token to be minted.

### claim

```solidity
/**
 * @dev Claims ownership of a token and issues it to a specified address after validating the pin code and signature.
 * @param to Address to claim the token for.
 * @param tokenId ID of the token to claim.
 * @param pinCode Pin code used for verification.
 * @param signature Signature for validation.
 */
function claim(
    address to,
    uint256 tokenId,
    string calldata pinCode,
    bytes calldata signature
) public onlyOwner
```

This function claims ownership of a token and issues it to a specified address after validating the pin code and signature.

- **to:** Address to claim the token for.
- **tokenId:** ID of the token to claim.
- **pinCode:** Pin code used for verification.
- **signature:** Signature for validation.

### claimAndReveal

```solidity
/**
 * @dev Claims ownership of a token, issues it to a specified address, and reveals the token's public key.
 * @param to Address to claim the token for.
 * @param tokenId ID of the token to claim.
 * @param pinCode Pin code used for verification.
 * @param publicKey Public key to reveal.
 * @param signature Signature for validation.
 */
function claimAndReveal(
    address to,
    uint256 tokenId,
    string calldata pinCode,
    string calldata publicKey,
    bytes calldata signature
) external onlyOwner
```

This function claims ownership of a token, issues it to a specified address, and reveals the token's public key.

- **to:** Address to claim the token for.
- **tokenId:** ID of the token to claim.
- **pinCode:** Pin code used for verification.
- **publicKey:** Public key to reveal.
- **signature:** Signature for validation.

### burn

```solidity
/**
 * @dev Destroys the token with the specified ID.
 * @param tokenId ID of the token to burn.
 */
function burn(uint256 tokenId) external
```

This function destroys the token with the specified ID.

- **tokenId:** ID of the token to burn.

### tokenURI

```solidity
/**
 * @dev Returns the URI of the token metadata.
 * @param tokenId ID of the token.
 * @return uri URI of the token metadata.
 */
function tokenURI(uint256 tokenId) public view override
```

This function returns the URI of the token metadata.

- **tokenId:** ID of the token.
- **uri:** URI of the token metadata.

### tokanData

```solidity
/**
 * @dev Returns the data associated with the token.
 * @param tokenId ID of the token.
 * @return data Data associated with the token.
 */
function tokanData(uint256 tokenId) external view returns (string memory data)
```

This function returns the data associated with the token.

- **tokenId:** ID of the token.
- **data:** Data associated with the token.

### getHashedPublicKey

```solidity
/**
 * @dev Returns the hashed public key of a token.
 * @param tokenId ID of the token.
 * @return hashedPublicKey Hashed public key of the token.
 */
function getHashedPublicKey(uint256 tokenId) external view returns (bytes32 hashedPublicKey)
```

This function returns the hashed public key of a token.

- **tokenId:** ID of the token.
- **hashedPublicKey:** Hashed public key of the token.

### getHashedPinCode

```solidity
/**
 * @dev Returns the hashed pin code of a token.
 * @param tokenId ID of the token.
 * @return hashedPinCode Hashed pin code of the token.
 */
function getHashedPinCode(uint256 tokenId) external view returns (bytes32 hashedPinCode)
```

This function returns the hashed pin code of a token.

- **tokenId:** ID of the token.
- **hashedPinCode:** Hashed pin code of the token.

### name

```solidity
/**
 * @dev Returns the name of the token collection.
 * @return name Name of the token collection.
 */
function name() external view returns (string memory)
```

This function returns the name of the token collection.

- **name:** Name of the token collection.

### getTemplate

```solidity
/**
 * @dev Returns the template struct of the token.
 * @param tokenId ID of the token.
 * @return template Template struct of the token.
 */
function getTemplate(uint256 tokenId) external view returns (Template memory template)
```

This function returns the template struct of the token.

- **tokenId:** ID of the token.
- **template:** Template struct of the token.


### getIssuer

```solidity
/**
 * @dev Returns the issuer struct of the token.
 * @param tokenId ID of the token.
 * @return issuer Issuer struct of the token.
 */
function getIssuer(uint256 tokenId) external view returns (Issuer memory issuer)
```

This function returns the issuer struct of the token.

- **tokenId:** ID of the token.
- **issuer:** Issuer struct of the token.

### getDefaultImage

```solidity
/**
 * @dev Returns the default image URL.
 * @return defaultImage Default image URL.
 */
function getDefaultImage() external view returns (string memory defaultImage)
```

This function returns the default image URL.

- **defaultImage:** Default image URL.

### supportsInterface

```solidity
/**
 * @dev Checks if a contract implements a given interface.
 * @param interfaceId Interface identifier.
 * @return supportsInterface True if the contract supports the interface, false otherwise.
 */
function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool supportsInterface)
```

This function checks if a contract implements a given interface.

- **interfaceId:** Interface identifier.
- **supportsInterface:** True if the contract supports the interface, false otherwise.

> - `IOnChainAssests` interface id is `0x07d4e947`
> - `IERC5484` interface id is `0x0489b56f`
> - `IRenamable` interface id is `0xc47f0027`
> - `IRevealable` interface id is `0x92a9a241`

## Contracts Details

The system comprises the following contracts:

- `EvidenzRevealableConsensualSBT.sol`: Main contract implementing the SBT issuance, claiming, revealing, and management functionalities.
- `ERC5484.sol`: Implements the ERC5484 standard for consensual soulbound tokens.
- `ERC5484Burnable.sol`: Extends ERC5484 to provide burnable token functionalities.
- `ERC721Base64URI.sol`: Extends ERC721 to provide base64-encoded token URI functionalities.
- `ERC721Renamable.sol`: Extends ERC721 to provide token renaming functionalities.
- `IRevealable.sol`: Interface defining the revealable functionalities.
- `Premint.sol`: Contract defining premint functionalities for SBT issuance.
- `Revealable.sol`: Contract implementing revealable functionalities for SBTs.
- Other utility and interface contracts: `Asserts.sol`, `Environment.sol`.