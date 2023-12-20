const { utils } = require('ethers');

module.exports.parseJson = function (base64Json) {
  return JSON.parse(
    utils.toUtf8String(
      utils.base64.decode(
        base64Json.replace(/^(data:application\/json;base64,)/, '')
      )
    )
  );
}

module.exports.decodeSvg = function (base64Svg) {
  return utils.toUtf8String(
    utils.base64.decode(
      base64Svg.replace(/^(data:image\/svg\+xml;base64,)/, '')
    )
  );
}