const { expect } = require('chai');
const { ethers } = require('hardhat');

const base64 = require('../utils/base64.js');
const { name: contractName, symbol, template, issuer, defaultImage, data, hashedPublicKey, hashedPinCode, pinCode } = require('../utils/constants.js');

describe(`OnChainAssets`, () => {
  before(async () => {
    const [ _, other ] = await ethers.getSigners(1);
    this.other = other;
    
    this.factory =  await ethers.getContractFactory('EvidenzRevealableConsensualSBT');
    this.contract = await this.factory.deploy(contractName, symbol, 'Both');
    this.contract.deployed();

    await this.contract.setTemplate(template);
    await this.contract.setIssuer(issuer);
    await this.contract.setDefaultImage(defaultImage);
    
    const mint = await this.contract.mint([{ data, hashedPublicKey, hashedPinCode }]);
    await mint.wait();
  });
  
  describe('issuer field', () => {
    let contract;
    before(async () => {
      contract = await this.factory.deploy(contractName, symbol, 'Both');
      contract.deployed();
    });

    it('is not initialized at deployment', async () => {
      const actual = await contract.issuer();
      expect(actual.name).to.equal('');
    });

    it('can be changed', async () => {
      await contract.setIssuer(issuer);
      const { name } = await contract.issuer();
      expect(name).to.equal(issuer.name);
    });

    it('can be changed by the contract owner only', async () => {
      await expect(contract.connect(this.other)
        .setIssuer(issuer))
        .to.be.revertedWith('Ownable: caller is not the owner');
    });

    it('has a getter', async () => {
      const { name, url } = await contract.getIssuer();
      expect(name).to.equal(issuer.name);
      expect(url).to.equal(issuer.url);
    })
  });

  describe('tokenData', () => {
    it('requires the token to be minted', async () => {
      await expect(this.contract.tokenData(2)).to.be.revertedWith('ERC721: invalid token ID');
    });

    it('returns the token data from the token id', async () => {
      await expect(this.contract.tokenData(1)).to.eventually.equal(data);
    });
  });
  
  it('supports IOnChainAsset interface', async () => {
    await expect(this.contract.supportsInterface('0x07d4e947')).to.eventually.equals(true);
  });

  describe('tokenURI returns dynamic data according to the token status', async () => {
    it('requires the token to be minted', async () => {
      await expect(this.contract.tokenURI(2)).to.be.revertedWith('ERC721: invalid token ID');
    });

    it('returns the token URI for minted tokens', async () => {
      const tokenURI = await this.contract.tokenURI(1);
      const { name, description, external_url, image, status } = base64.parseJson(tokenURI);
      expect(status).to.equal('minted');

      expect(name).to.equal('Credential #1');
      expect(description).to.equal(`Certificate issued by ${issuer.name}`);
      expect(external_url).to.equal(issuer.url);
      expect(image).to.equal(defaultImage);
      
    });

    it('returns the token URI for claimed revealable tokens', async () => {
      const signature = this.other.signMessage(ethers.utils.arrayify(await this.contract.getMessageToSign(1)));
      const claim = await this.contract.claim(this.other.address, 1, pinCode, signature);
      await claim.wait();
      
      const tokenURI = await this.contract.tokenURI(1);
      const { name, description, external_url, image, status } = base64.parseJson(tokenURI);
      expect(status).to.equal('claimed');
      
      expect(name).to.equal('Credential #1');
      expect(description).to.equal(`Certificate issued by ${issuer.name}, owned by ${this.other.address.toLowerCase()}`);
      expect(external_url).to.equal(issuer.url);
      expect(image).to.equal(defaultImage);
    });
  });
});