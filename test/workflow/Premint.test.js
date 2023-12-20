const { expect } = require('chai');
const { ethers } = require('hardhat');

const { symbol, data, hashedPublicKey, hashedPinCode, pinCode } = require('../utils/constants.js');

describe(`Premint`, () => {
  before(async () => {
    const factory =  await ethers.getContractFactory('EvidenzRevealableConsensualSBT');
    this.contract = await factory.deploy('EvidenzRevealableConsensualSBT', symbol, 'Both');
    this.contract.deployed();

    const mint = await this.contract.mint([{ data, hashedPublicKey, hashedPinCode }]);
    await mint.wait();
  });

  describe('getHashedPinCode', () => {
    it('requires the token to be minted', async () => {
      await expect(this.contract.getHashedPinCode(2)).to.be.revertedWith('ERC721: invalid token ID');
    });

    it('returns the hashed pin code from the token id', async () => {
      await expect(this.contract.getHashedPinCode(1)).to.eventually.equal(hashedPinCode);
    });
  });
  
  it('cannot check the pin code outside the contract', async () => {
    expect(() => this.contract._requirePinCode(1, pinCode))
      .to.throw(TypeError, 'this.contract._requirePinCode is not a function');
  });
});