// the module itself
const mongoose = require('./private');
// public API
const Utils = require('./public/utils');

exports.init = mongoose.init;

exports.DbUtils = Utils;
