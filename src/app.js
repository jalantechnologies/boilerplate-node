const express = require('express');
const i18n = require('i18n');
const path = require('path');
const cookieParser = require('cookie-parser');
const expressWinston = require('express-winston');
const bodyParser = require('body-parser');
const cors = require('cors');

// our in-house dependency injection framework
const DI = require('./di');
const core = require('./core');
const routes = require('./routes');
const modules = require('./modules');
const {Logger, Error} = require('./helpers');
// from modules
const {DbUtils} = modules.mongoose;

// init i18n
i18n.configure({
  locales: ['en', 'de'],
  defaultLocale: 'en',
  directory: path.join(__dirname, 'locales'),
  objectNotation: true,
});

// init app
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// init dependency injection
// register modules with respective namespace
// module then can be accessible via req.locals.namespace within the controller
app.use(DI([
  {module: modules.mongoose, namespace: 'db'},
  {module: modules.accounts, namespace: 'accounts'},
], () => {
  // fire app.ready
  // do it in next iteration to avoid server from not picking up the event
  process.nextTick(() => app.emit('ready'));
}));

// set up cors
app.use(cors());

// preflight request
app.options('*', cors());

// interception start for sentry
app.use(core.sentry.interceptBegin());

// set up winston logger as middleware
app.use(expressWinston.logger({
  winstonInstance: Logger,
  // no pre-build meta
  meta: false,
  msg: 'API HTTP REQUEST {{req.ip}} - {{res.statusCode}} - {{req.method}} - {{res.responseTime}}ms - {{req.url}} - {{req.headers[\'user-agent\']}}',
  // use the default express/morgan request formatting
  // enabling this will override any msg if true
  expressFormat: false,
  // force colorize when using custom msg
  colorize: true,
  // set log level according to response status
  statusLevels: true,
}));

// set up cookie parser
app.use(cookieParser());

// set up serving of static files
app.use(express.static(path.join(__dirname, 'public')));

// set up i18n
app.use(i18n.init);

// parse application/json payload
app.use(bodyParser.json());


// add headers
app.use((req, res, next) => {
  // website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');
  // request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  // request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, content-type, Accept');
  // set to true if you need the website to include cookies in the requests sent
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

// set up routes
app.use('/accounts', routes.accounts);

// not found handler
app.use((req, res, next) => {
  next(Error.NotFound());
});

// error handler for handled error
app.use((err, req, res, next) => {
  if (Error.isHandled(err)) {
    // handled error
    res.status(err.api_status);
    const obj = {
      error: err.message || res.__(`DEFAULT_ERRORS.${err.locale_tag}`),
      error_code: err.api_code,
    };
    if (err.errors) {
      obj.errors = err.errors;
    }
    res.send(obj);
  } else if (DbUtils.checkConnectionErr(err)) {
    // mongoose connection error
    res.status(503);
    res.send({
      error: res.__('DEFAULT_ERRORS.TEMPORARILY_UNAVAILABLE'),
      error_code: 'temporarily_unavailable',
    });
  } else {
    // un-handled error
    res.status(500);
    res.send({
      error: res.__('DEFAULT_ERRORS.SERVER_ERROR'),
      error_code: 'server_error',
    });
    // continue to next error handler
    next(err);
  }
});

// interception end for sentry
app.use(core.sentry.interceptEnd());

// error logging via winston
app.use(expressWinston.errorLogger({
  winstonInstance: Logger,
}));

module.exports = app;
