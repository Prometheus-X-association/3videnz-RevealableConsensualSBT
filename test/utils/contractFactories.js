const { ethers } = require('hardhat');
const { 
  name, 
  symbol, 
  issuer, 
  template, 
  defaultImage, 
  description, 
  image, 
  termsOfUse, 
  data, 
  publicKey, 
  hashedPublicKey, 
  hashedPinCode 
} = require('./constants.js');

module.exports = {
  evidenzEnumerableSingleAssetNFT: { 
    name: 'EvidenzEnumerableSingleAssetNFT',
    deploy: async () => {
      const factory =  await ethers.getContractFactory('EvidenzEnumerableSingleAssetNFT');
      const contract = await factory.deploy(name, symbol);
      await contract.deployed();
      return contract;
    },
    init: async (contract) => {
      await contract.setTemplate(template);
      await contract.setDescription(description);
      await contract.setImage(image);
      await contract.setTermsOfUse(termsOfUse);
    }
  },
  evidenzEnumerableSingleAssetSBT: { 
    name: 'EvidenzEnumerableSingleAssetSBT',
    deploy: async (burnAuth = 'Both') => {
      const factory =  await ethers.getContractFactory('EvidenzEnumerableSingleAssetSBT');
      const contract = await factory.deploy(name, symbol, burnAuth);
      await contract.deployed();
      return contract;
    },
    init: async (contract) => {
      await contract.setTemplate(template);
      await contract.setDescription(description);
      await contract.setImage(image);
    }
  },
  evidenzRevealableConsensualSBT: { 
    name: 'EvidenzRevealableConsensualSBT',
    deploy: async (burnAuth = 'Both') => {
      const factory =  await ethers.getContractFactory('EvidenzRevealableConsensualSBT');
      const contract = await factory.deploy(name, symbol, burnAuth);
      await contract.deployed();
      return contract;
    },
    init: async (contract) => {
      await contract.setTemplate(template);
      await contract.setIssuer(issuer);
      await contract.setDefaultImage(defaultImage);
    }
  },
  evidenzConsensualSBT: { 
    name: 'EvidenzConsensualSBT',
    deploy: async (burnAuth = 'Neither') => {
      const factory =  await ethers.getContractFactory('EvidenzConsensualSBT');
      const contract = await factory.deploy(name, symbol, burnAuth);
      await contract.deployed();
      return contract;
    },
    init: async (contract) => {
      await contract.setTemplate(template);
      await contract.setIssuer(issuer);
    }
  },
  buildMintParams: async function (contract) {
    const [ isSingleAsset, isRevealable ] = await Promise.all([
      contract.supportsInterface('0x421f982f'),
      contract.supportsInterface('0x92a9a241')
    ]);
    if (isSingleAsset) return hashedPinCode;
    else if (isRevealable) return { data, hashedPublicKey, hashedPinCode };
    else return { data, publicKey: ethers.utils.toUtf8Bytes(publicKey), hashedPinCode };
  }
};