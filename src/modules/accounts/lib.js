const {CryptoUtils} = require('../../helpers');

exports.initPasswordHash = (pwd) => {
  const salt = CryptoUtils.generateUUID();
  const hash = CryptoUtils.generateSHA512Hash(`${pwd}:${salt}`);
  return {hash, salt};
};

exports.generatePasswordHash = (pwd, salt) => CryptoUtils.generateSHA512Hash(`${pwd}:${salt}`);
