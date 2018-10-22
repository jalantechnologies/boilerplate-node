# BoilerplateNode

## Scripts

- `npm build` - For building the app.
- `npm start` - For starting the app.
- `npm serve` - For building, starting and reloading on changes over the app.

## Configuration

The module uses [config](https://www.npmjs.com/package/config) for loading configuration entries.

In the `config` directory:

- Consult/update `custom-environment-variables.json` for loading values via environment. This overrides any value set in files defined below.
- Create `local.json` for local config.
- Consult/update `development.json` for values at development. (The default env)
- Consult/update `testing.json` for values at testing. `NODE_CONFIG_ENV` must be set to `testing` for this.
- Consult/update `staging.json` for values at staging. `NODE_CONFIG_ENV` must be set to `staging` for this.
- Consult/update `production.json` for values at production. `NODE_CONFIG_ENV` must be set to `production` for this.
- Consult/update `default.json` for **constant values only**.

**Entries**

Each entry here is an object notation and is provided with short description.

- `mongoDb.uri` `String` - URI connection string for MongoDb. If not provided, mongoose will not be configured.
- `mongoDb.debug` `Boolean` - Set this to `true` for logging mongodb requests via configured logger.
- `sentry.dsn` `String` - Sentry DSN for error reporting. If not provided, sentry will not be configured.
- `papertrail.host` `String` - If provided, logging via [Papertrail](https://papertrail.com) will be enabled.
- `papertrail.port` `String` - If provided, logging via [Papertrail](https://papertrail.com) will be enabled.
- `papertrail.program` `String` - Papertrail program. Useful for prefixing log messages with custom namespace.
- `papertrail.handleExceptions` `Boolean` - For enabling logging of un-handled exceptions via papertrail. (Default: `false`)
- `www.port` `String/Number` - Port for listening incoming HTTP connection. (Default: `8080`)

## Features

- Logging via papertrail.
- Error reporting via sentry.
- Database connection via mongoose.
- Heroku deployment ready (see `app.json` and `Procfile`)
- Internationalization support.
