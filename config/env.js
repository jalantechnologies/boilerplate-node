module.exports = {
  www: {
    port: process.env.PORT,
  },
  sentry: {
    dsn: process.env.SENTRY_DSN,
  },
  mongoDb: {
    uri: process.env.MONGODB_URI,
  },
  papertrail: {
    host: process.env.PAPERTRAIL_HOST,
    port: process.env.PAPERTRAIL_PORT,
  },
};
