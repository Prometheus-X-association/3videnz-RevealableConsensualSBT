const { expect } = require('chai');
const { ethers } = require('hardhat');

const { name, symbol, data, hashedPinCode, hashedPublicKey, pinCode, publicKey } = require('../utils/constants.js');

describe('EvidenzRevealableConsensualSBT', () => {
  before(async () => {
    const [ owner, other ] = await ethers.getSigners(1);
    this.owner = owner;
    this.other = other;
    this.dummySignature = await this.other.signMessage("any");
  });

  beforeEach(async () => {
    const factory =  await ethers.getContractFactory('EvidenzRevealableConsensualSBT');
    this.contract = await factory.deploy(name, symbol, 'Both');
    this.contract.deployed();
  });

  describe('mint', () => {
    it('creates tokens assigned to the contract owner and emits an event', async () => {
      const mint = await this.contract.mint([{ data, hashedPinCode, hashedPublicKey }]);
      await mint.wait();
      await expect(this.contract.ownerOf(1)).to.eventually.equal(this.owner.address);
    });

    it('can be executed by the contract owner only', async () => {
      await expect(this.contract.connect(this.other).mint([{ data, hashedPinCode, hashedPublicKey }]))
        .to.be.revertedWith('Ownable: caller is not the owner');
    });
  });

  describe('claim', async () => {
    beforeEach(async () => {
      const mint = await this.contract.mint([{ data, hashedPinCode, hashedPublicKey }]);
      await mint.wait();
    });
  
    it('requires the recipient\'s signature', async () => {
      await expect(this.contract.claim(this.other.address, 1, pinCode, ethers.constants.HashZero))
        .to.be.revertedWith('ERC5484: invalid signature');
    });
  
    it('requires the token to be minted', async () => {
      await expect(this.contract.claim(this.other.address, 2, pinCode, this.dummySignature))
        .to.be.revertedWith('ERC721: invalid token ID');
    });
  
    it('requires the valid pin code', async () => {
      await expect(this.contract.claim(this.other.address, 1, '654321', this.dummySignature))
        .to.be.revertedWith('Evidenz: the pin code is invalid');
    });

    it('Issues the token to the new owner and emits an event', async () => {
      const message = await this.contract.getMessageToSign(1);
      const signature = await this.other.signMessage(ethers.utils.arrayify(message));
      await expect(this.contract.claim(this.other.address, 1, pinCode, signature))
        .to.emit(this.contract, 'Issued')
        .withArgs(this.owner.address, this.other.address, 1, 2);
      await expect(this.contract.ownerOf(1)).to.eventually.equal(this.other.address);
    });
  
    it('can be executed by the contract owner only', async () => {
      const message = await this.contract.getMessageToSign(1);
      const signature = await this.other.signMessage(ethers.utils.arrayify(message));
      await expect(this.contract.connect(this.other).claim(this.other.address, 1, pinCode, signature))
        .to.be.revertedWith('Ownable: caller is not the owner');
    });
  
    it('cannot be claimed again by the contract owner', async () => {
      const message = await this.contract.getMessageToSign(1);
      const signature = await this.other.signMessage(ethers.utils.arrayify(message));
      const claim = await this.contract.claim(this.other.address, 1, pinCode, signature);
      await claim.wait();
      await expect(this.contract.claim(this.owner.address, 1, pinCode, signature))
        .to.be.revertedWith('ERC721: transfer from incorrect owner');
    });
  });

  describe('claim and reveal at once', async () => {
    beforeEach(async () => {
        const mint = await this.contract.mint([{ data, hashedPinCode, hashedPublicKey }]);
        await mint.wait();
    });

    it('requires the recipient\'s signature', async () => {
        await expect(this.contract.claimAndReveal(this.other.address, 1, pinCode, publicKey, ethers.constants.HashZero))
            .to.be.revertedWith('ERC5484: invalid signature');
    });

    it('requires the valid pin code', async () => {
      const message = await this.contract.getMessageToSign(1);
      const signature = await this.other.signMessage(ethers.utils.arrayify(message));
        await expect(this.contract.claimAndReveal(this.other.address, 1, '654321', publicKey, signature))
            .to.be.revertedWith('Evidenz: the pin code is invalid');
    });

    it('Issues the token to the new owner and emits an event', async () => {
      const message = await this.contract.getMessageToSign(1);
      const signature = await this.other.signMessage(ethers.utils.arrayify(message));
      await expect(this.contract.claim(this.other.address, 1, pinCode, signature))
        .to.emit(this.contract, 'Issued')
        .withArgs(this.owner.address, this.other.address, 1, 2);
      await expect(this.contract.ownerOf(1)).to.eventually.equal(this.other.address);
    });

    it('can be executed by the contract owner only', async () => {
      const message = await this.contract.getMessageToSign(1);
      const signature = await this.other.signMessage(ethers.utils.arrayify(message));
      const claimAndReveal = this.contract.connect(this.other).claimAndReveal(this.other.address, 1, pinCode, publicKey, signature);
      await expect(claimAndReveal).to.be.revertedWith('Ownable: caller is not the owner');
    });

    it('cannot be claimed and revealed again by the contract owner', async () => {
      const message = await this.contract.getMessageToSign(1);
      const signature = await this.other.signMessage(ethers.utils.arrayify(message));
        const claimAndReveal = await this.contract.claimAndReveal(this.other.address, 1, pinCode, publicKey, signature);
        await claimAndReveal.wait();
        await expect(this.contract.claimAndReveal(this.owner.address, 1, pinCode, publicKey, signature))
            .to.be.revertedWith('ERC721: transfer from incorrect owner');
    });
  });

  it('return the total supply of the collection', async () => {
    const mint = await this.contract.mint([{ data, hashedPinCode, hashedPublicKey }]);
    await mint.wait();
    await expect(this.contract.totalSupply()).to.eventually.equal(1);
  });
});