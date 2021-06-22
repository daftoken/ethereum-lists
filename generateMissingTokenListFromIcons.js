const ethIcons = './src/icons';
const web3 = require('web3');
const utils = web3.utils;
const fs = require('fs');

function generateMissingToken() {
  const icons = fs.readdirSync(ethIcons);
  const exclusion = [
    '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee-eth',
    '0xef68e7c694f40c8202821edf525de3782458639f-eth',
    '0x85e076361cc813a908ff672f9bad1541474402b2-eth', // TEL token migrated
    '0xd4260e4Bfb354259F5e30279cb0D7F784Ea5f37A-eth', // contract getting included from icons
    '0xacfc95585d80ab62f67a14c566c1b7a49fe91167-eth', // not erc tokens
    '0x71850b7e9ee3f13ab46d67167341e4bdc905eef9-eth' // not erc tokens
  ];

  const addressOnly = icons.map(icon => {
    const idxOf = icon.indexOf('-0x');
    const getAddr = icon.substring(idxOf + 1, icon.length);
    const noExtension = getAddr.substr(0, getAddr.length - 4);
    const network = noExtension.substr(43, noExtension.length);
    if (getAddr.length !== 42) {
      const actualAddress = getAddr.substring(getAddr.indexOf('0x'), 42);
      return { address: actualAddress, network: network };
    } else {
      return { address: getAddr, network: network };
    }
  });

  const notInList = addressOnly.filter(obj => {
    const addr = obj.address;
    if (utils.isAddress(addr)) {
      const inExclusionList = exclusion.find(item => {
        const noExtension = item.substr(0, item.length - 4);
        return (
          utils.toChecksumAddress(noExtension) === utils.toChecksumAddress(addr)
        );
      });
      const list = JSON.parse(
        fs.readFileSync(
          `./dist/tokens/${obj.network}/tokens-${obj.network}.json`,
          'utf8'
        )
      );
      const found = list.find(item => {
        if (addr.substring(0, 2) === '0x' && addr.length === 42) {
          return (
            utils.toChecksumAddress(item.address) ===
            utils.toChecksumAddress(addr)
          );
        }
      });
      if (
        !found &&
        addr.substring(0, 2) === '0x' &&
        addr.length === 42 &&
        !inExclusionList
      )
        console.log(`processed: ${addr} in ${obj.network}`);
      return obj;
    } else {
      console.log('errored:', addr);
    }
  });
  fs.writeFileSync('notinlist.json', JSON.stringify(notInList));
}

generateMissingToken();
