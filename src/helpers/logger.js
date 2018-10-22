const winston = require('winston');
const config = require('config');

const DEFAULT_LOG_LEVEL = 'info';

// load values from config
const LOGGER_CONSOLE = config.get('logger.console') === true;
const PAPERTRAIL_HOST = config.get('papertrail.host');
const PAPERTRAIL_PORT = config.get('papertrail.port');
const PAPERTRAIL_HANDLE_EXCEPTIONS = config.get('papertrail.handleExceptions') === true;
const PAPERTRAIL_PROGRAM = config.get('papertrail.program');

// in order to use winston.transports.Papertrail
// eslint-disable-next-line no-unused-expressions
require('winston-papertrail').Papertrail;

// init log transports
const transports = [];

// register console transport if allowed
if (LOGGER_CONSOLE) {
  transports.push(new winston.transports.Console());
}

// register papertrail transport if configured
if (PAPERTRAIL_HOST && PAPERTRAIL_PORT) {
  transports.push(new winston.transports.Papertrail({
    host: PAPERTRAIL_HOST,
    port: PAPERTRAIL_PORT,
    colorize: true,
    handleExceptions: PAPERTRAIL_HANDLE_EXCEPTIONS,
    program: PAPERTRAIL_PROGRAM,
  }));
}

// expose winston logger
module.exports = new winston.Logger({
  level: DEFAULT_LOG_LEVEL,
  transports,
});
