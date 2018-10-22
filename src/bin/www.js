#!/usr/bin/env node

const http = require('http');
const config = require('config');

const core = require('../core');
const {Logger} = require('../helpers');
const listeners = require('./event-listeners');

// init sentry - should be always initialized before everything else
core.sentry.init();

// get values from config
const WWW_PORT = config.get('www.port');

Logger.info(`www - init node environment - ${process.env.NODE_ENV}`);
Logger.info(`www - init config environment - ${process.env.NODE_CONFIG_ENV}`);
Logger.info(`www - init config instance - ${process.env.NODE_APP_INSTANCE}`);
Logger.info('www - loading app...');
const app = require('../app');

// hard bind port to app
app.set('port', WWW_PORT);

// init server
Logger.info('www - attempting to initialize server...');
const server = http.createServer(app);

// register event listeners
server.on('error', listeners.onError);
server.on('listening', listeners.onListening);

// register on SIGINT listener
process.on('SIGINT', () => {
  Logger.info('www - sigint event received, attempting to shut down application...');
  // close server
  server.close((err) => {
    if (err) {
      Logger.error('www - encountered error while shutting down server - %s', err.message);
      // exit with non 0 code
      process.exit(1);
    } else {
      Logger.info('www - server was closed gracefully, shutting down...');
      // all good, exit with 0
      process.exit(0);
    }
  });
});

Logger.info('www - server was initialized successfully, waiting for app to get ready...');

// server should start listening only when app is ready
app.on('ready', () => {
  Logger.info('www - app.ready event received, starting server...');
  server.listen(WWW_PORT);
  Logger.info('www - server was started successfully...');
});
