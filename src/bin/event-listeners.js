/* eslint-disable func-names */
const {Logger} = require('../helpers');

exports.onError = function (error) {
  const server = this;
  // simply throw error if evt not related to listening
  if (error.syscall !== 'listen') {
    throw error;
  }
  const address = server.address();
  // fallback to err.port in case address is not available
  const port = address ? address.port : error.port;
  const bind = typeof port === 'string'
    ? `Pipe ${port}`
    : `Port ${port}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      Logger.error(`www - ${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      Logger.error(`www - ${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
};

exports.onListening = function () {
  const server = this;
  const address = server.address();
  const bind = typeof address === 'string'
    ? `pipe ${address}`
    : `port ${address.port}`;
  Logger.info(`www - server started listening on ${bind}`);
};
