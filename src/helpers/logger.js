const winston = require('winston');
const config = require('config');

// noinspection BadExpressionStatementJS
require('winston-papertrail').Papertrail;

const logLevel = 'info';
// load values from config
const PAPERTRAIL_HOST = config.get('papertrail.host');
const PAPERTRAIL_PORT = config.get('papertrail.port');

// init log transports
const transports = [
  new winston.transports.Console(),
];

// add papertrail transport if configured
if (PAPERTRAIL_HOST && PAPERTRAIL_PORT) {
  transports.push(new winston.transports.Papertrail({
    host: config.get('papertrail.host'),
    port: config.get('papertrail.port'),
    colorize: true,
  }));
}

// expose winston logger
module.exports = new winston.Logger({
  level: logLevel,
  transports,
});
