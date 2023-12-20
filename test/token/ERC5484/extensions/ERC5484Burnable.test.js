const { expect } = require('chai');
const { ethers } = require('hardhat');

const { name, symbol, data, hashedPinCode, hashedPublicKey, pinCode } = require('../../../utils/constants.js');

describe(`ERC5484Burnable`, () => {
  before(async () => {
    const [_, other, third] = await ethers.getSigners(1);
    this.other = other;
    this.third = third;
    this.factory =  await ethers.getContractFactory('EvidenzRevealableConsensualSBT');
  });

  it('supports IssuerOnly, OwnerOnly, Both and Neither burn authorizations', async () => {
    await expect(this.factory.deploy(name, symbol, 'IssuerOnly')).to.not.be.reverted;
    await expect(this.factory.deploy(name, symbol, 'OwnerOnly')).to.not.be.reverted;
    await expect(this.factory.deploy(name, symbol, 'Both')).to.not.be.reverted;
    await expect(this.factory.deploy(name, symbol, 'Neither')).to.not.be.reverted;
    await expect(this.factory.deploy(name, symbol, 'Invalid')).to.be.revertedWith('ERC5484: invalid burn auth');
  });

  describe('burnAuth', () => {
    it('requires the token to be minted', async () => {
      this.contract = await this.factory.deploy(name, symbol, 'Both');
      this.contract.deployed();
      await expect(this.contract.burnAuth(1)).to.be.revertedWith('ERC721: invalid token ID');
    });
    
    it('returns the token burn authorization for IssuerOnly', async () => {
      this.contract = await this.factory.deploy(name, symbol, 'IssuerOnly');
      this.contract.deployed();

      await this.contract.mint([{ data, hashedPinCode, hashedPublicKey }]);
      await expect(this.contract.burnAuth(1)).to.eventually.equals(0);
    });
    
    it('returns the token burn authorization for OwnerOnly', async () => {
      this.contract = await this.factory.deploy(name, symbol, 'OwnerOnly');
      this.contract.deployed();

      await this.contract.mint([{ data, hashedPinCode, hashedPublicKey }]);
      await expect(this.contract.burnAuth(1)).to.eventually.equals(1);
    });
    
    it('returns the token burn authorization for Both', async () => {
      this.contract = await this.factory.deploy(name, symbol, 'Both');
      this.contract.deployed();

      await this.contract.mint([{ data, hashedPinCode, hashedPublicKey }]);
      await expect(this.contract.burnAuth(1)).to.eventually.equals(2);
    });
    
    it('returns the token burn authorization for Neither', async () => {
      this.contract = await this.factory.deploy(name, symbol, 'Neither');
      this.contract.deployed();

      await this.contract.mint([{ data, hashedPinCode, hashedPublicKey }]);
      await expect(this.contract.burnAuth(1)).to.eventually.equals(3);
    });
  });

  describe('burns token based on message sender burn authorization', () => {
    it('Allows the issuer to burn the token when burn authorization is set to IssuerOnly', async () => {
      this.contract = await this.factory.deploy(name, symbol, 'IssuerOnly');
      this.contract.deployed();
      
      await this.contract.mint([{ data, hashedPinCode, hashedPublicKey }]);
      
      const message = await this.contract.getMessageToSign(1);
      const signature = await this.other.signMessage(ethers.utils.arrayify(message));
      await this.contract.claim(this.other.address, 1, pinCode, signature);

      await expect(this.contract.connect(this.other).burn(1)).to.be.revertedWith('ERC5484: sender cannot burn');
      await expect(this.contract.burn(1)).to.not.be.reverted;
      await expect(this.contract.ownerOf(1)).to.be.revertedWith('ERC721: invalid token ID');
    });

    it('Allows the owner to burn the token when burn authorization is set to OwnerOnly', async () => {
      this.contract = await this.factory.deploy(name, symbol, 'OwnerOnly');
      this.contract.deployed();
      
      await this.contract.mint([{ data, hashedPinCode, hashedPublicKey }]);

      const message = await this.contract.getMessageToSign(1);
      const signature = await this.other.signMessage(ethers.utils.arrayify(message));
      await this.contract.claim(this.other.address, 1, pinCode, signature);

      await expect(this.contract.burn(1)).to.be.revertedWith('ERC5484: sender cannot burn');
      await expect(this.contract.connect(this.other).burn(1)).to.not.be.reverted;
      await expect(this.contract.ownerOf(1)).to.be.revertedWith('ERC721: invalid token ID');
    });

    it('Allows the issuer to burn the token when burn authorization is set to Both', async () => {
      this.contract = await this.factory.deploy(name, symbol, 'Both');
      this.contract.deployed();
      
      await this.contract.mint([{ data, hashedPinCode, hashedPublicKey }]);

      const message = await this.contract.getMessageToSign(1);
      const signature = await this.other.signMessage(ethers.utils.arrayify(message));
      await this.contract.claim(this.other.address, 1, pinCode, signature);

      await expect(this.contract.connect(this.third).burn(1)).to.be.revertedWith('ERC5484: sender cannot burn');
      await expect(this.contract.burn(1)).to.not.be.reverted;
      await expect(this.contract.tokenURI(1)).to.be.revertedWith('ERC721: invalid token ID (burnt)');
      await expect(this.contract.tokenData(1)).to.be.revertedWith('ERC721: invalid token ID (burnt)');
    });

    it('Allows the owner to burn the token when burn authorization is set to Both', async () => {
      this.contract = await this.factory.deploy(name, symbol, 'Both');
      this.contract.deployed();
      
      await this.contract.mint([{ data, hashedPinCode, hashedPublicKey }]);

      const message = await this.contract.getMessageToSign(1);
      const signature = await this.other.signMessage(ethers.utils.arrayify(message));
      await this.contract.claim(this.other.address, 1, pinCode, signature);

      await expect(this.contract.connect(this.third).burn(1)).to.be.revertedWith('ERC5484: sender cannot burn');
      await expect(this.contract.connect(this.other).burn(1)).to.not.be.reverted;
      await expect(this.contract.tokenURI(1)).to.be.revertedWith('ERC721: invalid token ID (burnt)');
      await expect(this.contract.tokenData(1)).to.be.revertedWith('ERC721: invalid token ID (burnt)');
    });

    it('Forbids anyone to burn the token when burn authorization is set to Neither', async () => {
      this.contract = await this.factory.deploy(name, symbol, 'Neither');
      this.contract.deployed();
      
      await this.contract.mint([{ data, hashedPinCode, hashedPublicKey }]);
      
      const message = await this.contract.getMessageToSign(1);
      const signature = await this.other.signMessage(ethers.utils.arrayify(message));
      await this.contract.claim(this.other.address, 1, pinCode, signature);

      await expect(this.contract.burn(1)).to.be.revertedWith('ERC5484: sender cannot burn');
      await expect(this.contract.connect(this.other).burn(1)).to.be.revertedWith('ERC5484: sender cannot burn');
    });
  });
});