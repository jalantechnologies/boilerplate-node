const crypto = require('crypto');
const uuidv1 = require('uuid/v1');

exports.generateSHA512Hash = string => crypto.createHash('sha512').update(string).digest('hex');

exports.generateUUID = () => uuidv1();