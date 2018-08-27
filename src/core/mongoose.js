const mongoose = require('mongoose');
const config = require('config');

const {Logger} = require('../helpers');

module.exports = async () => {
  // skip installation if not configured
  if (!config.has('mongoDb.uri')) return;

  // add event listeners
  mongoose.connection.on('connected', () => {
    Logger.info('core.mongoose - connection - connected');
  });

  mongoose.connection.on('disconnected', () => {
    Logger.info('core.mongoose - connection - disconnected');
  });

  mongoose.connection.on('reconnect', () => {
    Logger.info('core.mongoose - connection - reconnect');
  });

  mongoose.connection.on('error', (err) => {
    Logger.error('core.mongoose - connection - error - ', err);
    // on any connection error, the app should crash
    throw err;
  });

  // set global props
  // enable debugging via logger if configured
  mongoose.set('debug', (config.has('mongoDb.debug') && config.get('mongoDb.debug') === true) ? (...args) => {
    Logger.info('core.mongoose - request - ', args);
  } : null);

  // disable bufferCommands
  // if not connected returns errors immediately rather than waiting for reconnect
  mongoose.set('bufferCommands', false);

  // any error on init should crash the app
  await mongoose.connect(config.get('mongoDb.uri'), {
    autoIndex: true,
    // reconnect if connection is lost
    autoReconnect: true,
    // never stop trying to reconnect
    reconnectTries: Number.MAX_VALUE,
    // reconnect interval in ms
    reconnectInterval: 500,
    // if not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0,
    useNewUrlParser: true,
    promiseLibrary: global.Promise,
  });
};
