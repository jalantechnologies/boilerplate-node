// https://pm2.io/doc/en/runtime/reference/ecosystem-file/
// configurable options via env:
// PM2_MAX_INSTANCES
// PM2_AUTO_RESTART

// normalizes value for PM2_MAX_INSTANCES
function normalizeMaxInstances(val) {
  // if value was provided and is a number, parse it
  // else, do nothing
  return val && !Number.isNaN(val) ? parseInt(val, 10) : val;
}

module.exports = {
  apps: [{
    name: 'API',
    // run npm start
    script: 'npm',
    args: 'start',
    // use maximum number of CPUs available, defaults to 1
    // https://pm2.io/doc/en/runtime/guide/load-balancing/
    instances: normalizeMaxInstances(process.env.PM2_MAX_INSTANCES),
    // auto restart on app crash
    autorestart: process.env.PM2_AUTO_RESTART === 'true',
    watch: false,
    // auto restart if heap size exceeds 1GB
    max_memory_restart: '1G',
    // rename the NODE_APP_INSTANCE as it will conflict with our config module
    instance_var: 'NODE_DEPLOY_INSTANCE',
  }],
};
