#!/usr/bin/env node

const http = require('http');
const config = require('config');

const app = require('../app');
const listeners = require('./event-listeners');

const port = config.get('www.port');

// hard bind port to app
app.set('port', port);

// init server
const server = http.createServer(app);
server.listen(port);

// register event listeners
server.on('error', listeners.onError);
server.on('listening', listeners.onListening);
