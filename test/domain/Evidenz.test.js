const { expect } = require('chai');
const { ethers } = require('hardhat');

const { name, symbol, data, hashedPublicKey, hashedPinCode } = require('../utils/constants.js');

describe(`Evidenz`, () => {
  before(async () => {
    const [ owner, other ] = await ethers.getSigners(1);
    this.owner = owner;
    this.other = other;
  });

  beforeEach(async () => {
    const factory =  await ethers.getContractFactory('EvidenzRevealableConsensualSBT');
    this.contract = await factory.deploy(name, symbol, 'Both');
    this.contract.deployed();
  });

  describe('_mint', () => {
    it('creates tokens assigned to the contract owner and emits an event', async () => {
      await expect(this.contract.mint([{ data, hashedPublicKey, hashedPinCode }]))
        .to.emit(this.contract, 'Transfer')
        .withArgs(ethers.constants.AddressZero, this.owner.address, 1);
      await expect(this.contract.ownerOf(1)).to.eventually.equal(this.owner.address);
    });

    it('can be executed by the contract owner only', async () => {
      await expect(this.contract.connect(this.other).mint([{ data, hashedPublicKey, hashedPinCode }]))
        .to.be.revertedWith('Ownable: caller is not the owner');
    });
  });

  describe('_requireMinted', () => {
    beforeEach(async () => {
      const mint = await this.contract.mint([{ data, hashedPublicKey, hashedPinCode }]);
      await mint.wait();
    });

    it('requires the token to be minted', async () => {
      await expect(this.contract.tokenURI(2)).to.be.revertedWith('ERC721: invalid token ID');
    });

    it('requires the token to not be burnt', async () => { 
      const burn = await this.contract.burn(1);
      await burn.wait();
      await expect(this.contract.tokenURI(1)).to.be.revertedWith('ERC721: invalid token ID (burnt)');
    });

    it('is ok otherwise', async () => {
      await expect(this.contract.tokenURI(1)).to.not.be.undefined;
    });
  });
});