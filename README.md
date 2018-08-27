# BoilerplateNode

## Scripts

- `npm build` - For building the app.
- `npm start` - For starting the app.
- `npm server` - For building, starting and reloading on changes over the app.

## Configuration

The module uses [config](https://www.npmjs.com/package/config) for loading configuration entries.

In the `config` directory:

- Create `local.json` for local config.
- Consult/update `env.js` for loading values via env. `NODE_CONFIG_ENV` environment variable must be set to `env` for this.
- Consult/update `default.json` for default values.

**Entries**

Each entry here is an object notation and is provided with short description.

- `mongoDb.uri` `String` - URI connection string for MongoDb. If not provided, mongoose will not be configured.
- `mongoDb.debug` `Boolean` - Set this to `true` for logging mongodb requests via configured logger.
- `sentry.dsn` `String` - Sentry DSN for error reporting. If not provided, sentry will not be configured.
- `papertrail.host` `String` - If provided, logging via [Papertrail](https://papertrail.com) will be enabled.
- `papertrail.port` `String` - If provided, logging via [Papertrail](https://papertrail.com) will be enabled.
- `www.port` `String/Number` - Port for listening incoming HTTP connection. (Default: `8080`)

## Features

- Logging via papertrail.
- Error reporting via sentry.
- Database connection via mongoose.
- Heroku deployment ready (see `app.json` and `Procfile`)
- Internationalization support.
