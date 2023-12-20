const { expect } = require('chai');
const { ethers } = require('hardhat');

const { name, symbol, data, hashedPublicKey, hashedPinCode, pinCode } = require('../../utils/constants.js');

describe(`ERC5484`, () => {
  before(async () => {
    const [owner, other] = await ethers.getSigners(1);
    this.owner = owner;
    this.other = other;
    
    const factory =  await ethers.getContractFactory('EvidenzRevealableConsensualSBT');
    this.contract = await factory.deploy(name, symbol, 'Neither');
    this.contract.deployed();

    const mint = await this.contract.mint([{ data, hashedPublicKey, hashedPinCode }]);
    await mint.wait();
  });

  describe('supports interfaces', async () => {
    it('IERC5484', async () => {
      await expect(this.contract.supportsInterface('0x0489b56f')).to.eventually.equals(true);
    });

    it('IERC721', async () => {
      await expect(this.contract.supportsInterface('0x80ac58cd')).to.eventually.equals(true);
    });

    it('IERC721Metadata ', async () => {
      await expect(this.contract.supportsInterface('0x5b5e139f')).to.eventually.equals(true);
    });

    it('IERC165', async () => {
      await expect(this.contract.supportsInterface('0x01ffc9a7')).to.eventually.equals(true);
    });
  });

  it('is non-tranferable', async () => {
    await expect(this.contract.transferFrom(this.owner.address, this.other.address, 1))
      .to.be.revertedWith('ERC5484: non-transferable token');
    await expect(this.contract['safeTransferFrom(address,address,uint256)'](this.owner.address, this.other.address, 1))
      .to.be.revertedWith('ERC5484: non-transferable token');
    await expect(this.contract['safeTransferFrom(address,address,uint256,bytes)'](this.owner.address, this.other.address, 1, ethers.utils.toUtf8Bytes('')))
      .to.be.revertedWith('ERC5484: non-transferable token');
  });

  describe('burnAuth', () => {
    it('requires the token to be minted', async () => {
      await expect(this.contract.burnAuth(2)).to.be.revertedWith('ERC721: invalid token ID');
    });
    
    it('returns the token burn authorization', async () => {
      await expect(this.contract.burnAuth(1)).to.eventually.equals(3);
    });
  });

  describe('issues token to recipient', () => {
    it('emits an Issued event', async () => {
      const message = await this.contract.getMessageToSign(1);
      const signature = await this.other.signMessage(ethers.utils.arrayify(message));
      await expect(this.contract.claim(this.other.address, 1, pinCode, signature))
        .to.emit(this.contract, 'Issued')
        .withArgs(this.owner.address, this.other.address, 1, 3);
    });
  });

  it('Cannot burn token', async () => {
    expect(() => this.contract._burn(0)).to.throw(TypeError, 'this.contract._burn is not a function');
  });
});