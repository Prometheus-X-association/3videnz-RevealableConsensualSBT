const { expect } = require('chai');
const { ethers } = require('hardhat');
const base64 = require('../utils/base64.js');

const { symbol, name: contractName, template, issuer, defaultImage, data, hashedPinCode, hashedPublicKey, pinCode, publicKey } = require('../utils/constants.js');

describe(`Revealable`, () => {
  before(async () => {
    const [ _, other ] = await ethers.getSigners(1);
    this.other = other;
  });

  beforeEach(async () => {
    const factory =  await ethers.getContractFactory('EvidenzRevealableConsensualSBT');
    this.contract = await factory.deploy(contractName, symbol, 'Both');
    this.contract.deployed();
    
    await this.contract.setTemplate(template);
    await this.contract.setIssuer(issuer);
    await this.contract.setDefaultImage(defaultImage);
  });

  describe('reveal', async () => {
    beforeEach(async () => {
      let mint = await this.contract.mint([{ data, hashedPublicKey, hashedPinCode }]);
      await mint.wait();
      mint = await this.contract.mint([{ data, hashedPublicKey, hashedPinCode }]);
      await mint.wait();
      const message = await this.contract.getMessageToSign(1);
      const signature = await this.other.signMessage(ethers.utils.arrayify(message));
      const claim = await this.contract.claim(this.other.address, 1, pinCode, signature);
      await claim.wait();
    });

    it('requires the token to be minted', async () => {
      const reveal = this.contract.reveal(3, publicKey);
      await expect(reveal).to.be.revertedWith('ERC721: invalid token ID');
    });

    it('requires the token to be claimed', async () => {
      const reveal = this.contract.reveal(2, publicKey);
      await expect(reveal).to.be.revertedWith('Revealable: token not claimed');
    });

    it('requires the token to be owned', async () => {
      const reveal = this.contract.reveal(1, publicKey);
      await expect(reveal).to.be.revertedWith('Revealable: token not owned');
    });

    it('requires the valid public key', async () => {
      const reveal = this.contract.connect(this.other).reveal(1, 'this is NOT the public key');
      await expect(reveal).to.be.revertedWith('Revealable: invalid public key');
    });

    it('reveals the token public key and emits an event', async () => {
      const reveal = this.contract.connect(this.other).reveal(1, publicKey);
      await expect(reveal).to.emit(this.contract, 'Reveal').withArgs(1);
    });

    it('can be revealed once only', async () => {
      const reveal = await this.contract.connect(this.other).reveal(1, publicKey);
      reveal.wait();
      await expect(this.contract.connect(this.other).reveal(1, publicKey))
        .to.be.revertedWith('Revealable: revealed already')
    });
  });

  describe('defaultImage field', () => {
    let contract;
    before(async () => {
      const factory =  await ethers.getContractFactory('EvidenzRevealableConsensualSBT');
      contract = await factory.deploy(contractName, symbol, 'Both');
      contract.deployed();
    });

    it('is not initialized at the contract deployment', async () => {
      expect(contract.defaultImage()).to.eventually.equals('');
    });

    it('can be changed', async () => {
      await contract.setDefaultImage(defaultImage);
      await expect(contract.defaultImage()).to.eventually.equals(defaultImage);
    });

    it('can be changed by the contract owner only', async () => {
      await expect(this.contract.connect(this.other)
        .setDefaultImage('forbidden'))
        .to.be.revertedWith('Ownable: caller is not the owner');
    });

    it('has a getter', async () => {
      await expect(contract.getDefaultImage()).to.eventually.equals(defaultImage);
    });
  });

  it('returns the hashed public key from the token id', async () => {
    await this.contract.mint([{ data, hashedPublicKey, hashedPinCode }]);
    await expect(this.contract.getHashedPublicKey(1)).to.eventually.equal(hashedPublicKey);
  });

  it('supports IRevealable interface', async () => {
    await expect(this.contract.supportsInterface('0x92a9a241')).to.eventually.equals(true);
  });

  it('returns the tokenURI for revealed tokens', async () => {
    const mint = await this.contract.mint([{ data, hashedPublicKey, hashedPinCode }]);
    await mint.wait();
    const message = await this.contract.getMessageToSign(1);
    const signature = await this.other.signMessage(ethers.utils.arrayify(message));
    const claim = await this.contract.claim(this.other.address, 1, pinCode, signature);
    await claim.wait();
    const reveal = await this.contract.connect(this.other).reveal(1, publicKey);
    await reveal.wait();

    const tokenURI = await this.contract.tokenURI(1);
    const { name, description, external_url, image, status } = base64.parseJson(tokenURI);

    expect(name).to.equal(contractName);
    expect(description).to.equal(`Certificate issued by ${issuer.name}, owned by ${this.other.address.toLowerCase()}, accessible at https://certificate-demo.evidenz.io/check/${publicKey}`);
    expect(external_url).to.equal(`https://certificate-demo.evidenz.io/check/${publicKey}`);
    expect(image).to.equal(`https://toolbox.evidenz.io/render/${publicKey}?env=demo&type=png&s=1080x1080&u=1&inline&embedLargeQR`);
    expect(status).to.equal('revealed');
  });
});