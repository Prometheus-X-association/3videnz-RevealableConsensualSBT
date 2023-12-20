const { expect } = require('chai');
const { ethers } = require('hardhat');

const { name, symbol, template } = require('../utils/constants.js');

describe(`CustomTemplate`, () => {
  before(async () => {
    const [ _, other ] = await ethers.getSigners(1);
    this.other = other;

    const factory =  await ethers.getContractFactory('EvidenzRevealableConsensualSBT');
    this.contract = await factory.deploy(name, symbol, 'Both');
    this.contract.deployed();
  });

  describe('template field', () => {
    it('is not initialized at the contract deployment', async () => {
      const actual = await this.contract.template();
      expect(actual.id).to.equals('');
    });

    it('can be updated', async () => {
      await this.contract.setTemplate(template);
      const actual = await this.contract.template();
      await expect(actual.id).to.equals(template.id);
    });

    it('can be changed by the contract owner only', async () => {
      await expect(this.contract.connect(this.other)
        .setTemplate(template))
        .to.be.revertedWith('Ownable: caller is not the owner');
    });

    it('has a getter', async () => {
      const { id, value, metadata, reader, toolbox } = await this.contract.getTemplate();
      await expect(id).to.equals(template.id);
      await expect(value).to.equals(template.value);
      await expect(metadata).to.equals(template.metadata);
      await expect(reader.url).to.equals(template.reader.url);
      await expect(reader.params).to.equals(template.reader.params);
      await expect(toolbox.url).to.equals(template.toolbox.url);
      await expect(toolbox.params).to.equals(template.toolbox.params);
    });
  });
});