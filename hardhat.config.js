require('@nomicfoundation/hardhat-toolbox');
require('@nomiclabs/hardhat-etherscan');
require('hardhat-contract-sizer');

module.exports = {
  solidity: {
    version: '0.8.18',
    settings: {
      optimizer: { enabled: true, runs: 200 }
    }
  }
};
