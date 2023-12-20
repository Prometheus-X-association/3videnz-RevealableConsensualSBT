const { ethers } = require('hardhat');

const name = 'Blockchain Expert';
const symbol = '3VIDENZ';
const template = { 
  id: '0x35',  
  value: 'template', 
  metadata: 'metadata', 
  reader: { url: 'https://certificate-demo.evidenz.io/check/', params: '' }, 
  toolbox: { url: 'https://toolbox.evidenz.io/render/', params: 'env=demo&type=png&s=1080x1080&u=1&inline&embedLargeQR' }
};
const issuer = { name: 'Leaston University', url: 'https://www.leaston.org' };
const defaultImage = 'https://www.leaston.org/img/leaston-logo.svg';

const description = 'This is the description.';
const image = 'https://www.evidenz.io/img/core-img/evidenz-logo-header.svg';
const termsOfUse = 'https://www.evidenz.io/';

const data = 'this is an encrypted data';
const hashedPinCode = '0xc888c9ce9e098d5864d3ded6ebcc140a12142263bace3a23a36f9905f12bd64a';
const hashedPublicKey = '0x07878dd3187340785151ddee4246005eb2eaee325d8f090eda99373e07007a99';

const pinCode = '123456';
const publicKey = '03F1106CBA82526360C81A74E8DBC8048DC1BD3AB112762751ED6CDAD05B2504Tk1uMm9zWnhrTnQ4dGswOUNKL2VwSm1yS3VVMlh6TExoV2QxSlN6MWZQK0FTdFps';

module.exports = { name, symbol, template, issuer, defaultImage, data, hashedPinCode, hashedPublicKey, pinCode, publicKey, description, image, termsOfUse };