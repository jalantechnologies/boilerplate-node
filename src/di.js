/* eslint-disable func-names, prefer-arrow-callback */
const async = require('async');

const {Logger} = require('./helpers');

function registerEntryWithLoader(loader, entry) {
  loader.push(function (done) {
    const {module, namespace} = this;
    Logger.info(`di - attempting to initialize module for namespace - ${namespace}`);
    // init module
    module.init((err, instance) => {
      if (err) return done(err);
      Logger.info(`di - module for namespace ${namespace} was initialized successfully...`);
      return done(null, {instance, namespace});
    });
  }.bind(entry));
}

/**
 * @constructor initializes DI
 * @param entries - modules with config to be registered
 * @param {Function} [done] - optional callback fired when ready
 */
module.exports = (entries, done) => {
  Logger.info('di - initializing...');
  // init loader
  const loader = [];
  // register module with loader
  entries.forEach((entry, i) => {
    Logger.info(`di - processing entry at ${i}...`);
    // get stuff from entry
    const {module, namespace} = entry;
    // check for init handler, throw error if not present
    if (!module.init) throw new Error(`DI encountered error while registering module [${i}] with loader - missing init handler`);
    if (typeof module.init !== 'function') throw new Error(`DI encountered error while registering module [${i}] with loader - init must be a function`);
    // check for namespace
    if (!namespace) throw new Error(`DI encountered error while registering module [${i}] with loader - missing namespace`);
    if (typeof namespace !== 'string') throw new Error(`DI encountered error while registering module [${i}] with loader - namespace must be a string value`);
    // all good, register with loader
    registerEntryWithLoader(loader, entry);
  });
  Logger.info('di - modules were registered with the loader, running loader...');
  // hosting modules for future use
  const exModules = {};
  // initialize modules via loader
  async.series(loader, (err, iModules) => {
    if (err) throw err;
    Logger.info('di - modules were registered successfully...');
    // load exModules, iterate over iModules and register them via namespace
    iModules.forEach((mod) => {
      exModules[mod.namespace] = mod.instance;
    });
    // fire callback if provided
    if (done) done();
  });
  // NOTE: concluding the procedure here with active reference to exModules
  // exModules will be populated in near-future, and availability is not guaranteed
  // therefore, use of callback is highly recommended
  return (req, res, next) => {
    // inject
    Object.assign(res.locals, exModules);
    // conclude
    next();
  };
};
