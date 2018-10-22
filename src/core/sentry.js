const Sentry = require('@sentry/node');
const config = require('config');

// get values from config
const SENTRY_DSN = config.get('sentry.dsn');
const SENTRY_ENVIRONMENT = config.get('sentry.env');

exports.init = () => {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,
  });
};

exports.interceptBegin = Sentry.Handlers.requestHandler;

exports.interceptEnd = Sentry.Handlers.errorHandler;
