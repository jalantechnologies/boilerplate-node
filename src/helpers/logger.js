const winston = require('winston');
const config = require('config');

const logLevel = 'info';

// noinspection BadExpressionStatementJS
require('winston-papertrail').Papertrail;

// init log transports
const transports = [
  new winston.transports.Console(),
];

// add papertrail transport if configured
if (config.has('papertrail.host') && config.has('papertrail.port')) {
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
