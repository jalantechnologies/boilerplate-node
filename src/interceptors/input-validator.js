const {validationResult} = require('express-validator/check');

const {Error} = require('../helpers');

module.exports = () => (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // errs - the final rendering of errors
    const errs = [];
    // tagged - holds refs to err already processed
    const tagged = [];
    // pre-process errors - remove location
    errors.array().forEach((err) => {
      const error = err;
      // single error for a param to be processed
      if (!tagged.includes(error.param)) {
        delete error.location;
        errs.push(error);
        tagged.push(error.param);
      }
    });
    next(Error.ValidationError(errs));
  } else {
    next();
  }
};
