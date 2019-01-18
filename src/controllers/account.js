/* eslint-disable camelcase */
const {checkSchema} = require('express-validator/check');
const Promise = require('bluebird');

const {Error} = require('../helpers');
const {InputValidator} = require('../interceptors');

exports.updatePassword = [
  // validation schema
  checkSchema({
    password: {
      in: 'body',
      trim: true,
      isEmpty: {
        negated: true,
        errorMessage: (value, {req}) => req.__('VAL_ERRORS.USR_ACC_RESET_MISSING_PWD'),
      },
    },
    new_password: {
      in: 'body',
      trim: true,
      isEmpty: {
        negated: true,
        errorMessage: (value, {req}) => req.__('VAL_ERRORS.USR_ACC_RESET_MISSING_NEW_PWD'),
      },
    },
    cnf_password: {
      in: 'body',
      trim: true,
      isEmpty: {
        negated: true,
        errorMessage: (value, {req}) => req.__('VAL_ERRORS.USR_ACC_RESET_MISSING_CNF_PWD'),
      },
      custom: {
        options: (value, {req}) => {
          // org password
          const {new_password} = req.body;
          return new_password && new_password === value;
        },
        errorMessage: (value, {req}) => req.__('VAL_ERRORS.USR_ACC_NEW_CNF_PWD_MISMATCH'),
      },
    },
  }),
  // validation interceptor
  InputValidator(),
  // controller
  (req, res, next) => {
    const acc = req.user_acc;
    const {password, new_password} = req.body;
    // begin process
    new Promise(async (resolve, reject) => {
      try {
        // verify password
        // eslint-disable-next-line max-len
        if (acc.password.hash !== res.locals.accounts.generatePasswordHash(password, acc.password.salt)) {
          reject(Error.ValidationError([{
            param: 'password',
            msg: res.__('VAL_ERRORS.USR_ACC_INVALID_CURRENT_PASSWORD'),
          }]));
        } else {
          // all good, generate hash and salt for new password
          const {hash, salt} = res.locals.accounts.initPasswordHash(new_password);
          acc.password = {
            hash,
            salt,
          };
          // update account
          await acc.save();
          // conclude
          resolve();
        }
      } catch (e) {
        reject(e);
      }
    }).asCallback((err, response) => {
      if (err) {
        next(err);
      } else {
        res.json(response);
      }
    });
  },
];

exports.get = [
  // controller
  (req, res) => {
    const acc = req.user_acc;
    // conclude
    res.json({
      id: acc.id,
      email: acc.email,
    });
  },
];
