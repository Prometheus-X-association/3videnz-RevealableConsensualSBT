const { expect } = require('chai');
const { ethers } = require('hardhat');

const { name, symbol } = require('../../../utils/constants.js');

describe(`ERC721Renamable`, () => {
  before(async () => {
    const [_, other] = await ethers.getSigners(1);
    this.other = other;
  });

  beforeEach(async () => {
    const factory =  await ethers.getContractFactory('EvidenzRevealableConsensualSBT');
    this.contract = await factory.deploy(name, symbol, 'Both');
    this.contract.deployed();
  });

  it('supports IRenamable interface', async () => {
    await expect(this.contract.supportsInterface('0xc47f0027')).to.eventually.equals(true);
  });

  describe('name field', () => {
    it('is initialized at the contract deployment', async () => {
      await expect(this.contract.name()).to.eventually.equals(name);
    });

    it('can be changed', async () => {
      await this.contract.setName('updated_name');
      await expect(this.contract.name()).to.eventually.equal('updated_name');
    });

    it('can be changed by the contract owner only', async () => {
      await expect(this.contract.connect(this.other)
        .setName('forbidden'))
        .to.be.revertedWith('Ownable: caller is not the owner');
    });
  });
});
