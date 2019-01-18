const Promise = require('bluebird');

module.exports = (req, res, next) => {
  new Promise(async (resolve, reject) => {
    try {
      // load account from req
      const acc = req.user_acc;
      // load profile based on loaded role
      resolve(await res.locals.db.profile.findOne({account_id: acc.id}));
    } catch (e) {
      reject(e);
    }
  }).asCallback((err, profile) => {
    if (err) {
      next(err);
    } else {
      req.user_profile = profile;
      next();
    }
  });
};
