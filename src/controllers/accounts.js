/* eslint-disable camelcase */
const {checkSchema} = require('express-validator/check');
const Promise = require('bluebird');
const _ = require('lodash');
const config = require('config');
const PhoneNumber = require('awesome-phonenumber');

const {Error, CryptoUtils, Utils} = require('../helpers');
const {InputValidator} = require('../interceptors');

// config
const PASSWORD_RESET_CODE_EXP = config.get('accounts.reset.exp');
const WEB_APP_ROOT = config.get('app.webAppRoot');

// urls
const ACCOUNT_RESET_URL = '{web_root}/accounts/recover/{code}';

// mailing
const MAIL_ACCOUNTS_SENDER = 'accounts';
const MAIL_ACCOUNTS_TEMPLATE_RESET = 'accountsResetPassword';

exports.accountsReg = [
  // validation schema
  checkSchema({
    first_name: {
      in: 'body',
      trim: true,
      isEmpty: {
        negated: true,
        errorMessage: (value, {req}) => req.__('VAL_ERRORS.USR_ACC_NEW_MISSING_F_NAME'),
      },
      isInt: {
        negated: true,
        errorMessage: (value, {req}) => req.__('VAL_ERRORS.USR_ACC_NEW_INVALID_F_NAME'),
      },
    },
    last_name: {
      in: 'body',
      optional: true,
      trim: true,
      isInt: {
        negated: true,
        errorMessage: (value, {req}) => req.__('VAL_ERRORS.USR_ACC_NEW_INVALID_F_NAME'),
      },
    },
    contact_phone: {
      in: 'body',
      trim: true,
      optional: true,
      custom: {
        options: value => !value || PhoneNumber(value).isValid(),
        errorMessage: (value, {req}) => req.__('VAL_ERRORS.USR_ACC_NEW_INVALID_PHONE'),
      },
    },
    email: {
      in: 'body',
      trim: true,
      isEmpty: {
        negated: true,
        errorMessage: (value, {req}) => req.__('VAL_ERRORS.USR_ACC_NEW_MISSING_EMAIL'),
      },
      isEmail: {
        errorMessage: (value, {req}) => req.__('VAL_ERRORS.USR_ACC_NEW_INVALID_EMAIL'),
      },
    },
    password: {
      in: 'body',
      trim: true,
      isEmpty: {
        negated: true,
        errorMessage: (value, {req}) => req.__('VAL_ERRORS.USR_ACC_NEW_MISSING_PWD'),
      },
    },
    cnf_password: {
      in: 'body',
      trim: true,
      isEmpty: {
        negated: true,
        errorMessage: (value, {req}) => req.__('VAL_ERRORS.USR_ACC_NEW_MISSING_CNF_PWD'),
      },
      custom: {
        options: (value, {req}) => {
          // org password
          const {password} = req.body;
          return password && password === value;
        },
        errorMessage: (value, {req}) => req.__('VAL_ERRORS.USR_ACC_NEW_CNF_PWD_MISMATCH'),
      },
    },
  }),
  // validation interceptor
  InputValidator(),
  // controller
  (req, res, next) => {
    // host element from which params will be acquired
    const params = req.body;
    // begin process
    new Promise(async (resolve, reject) => {
      try {
        // check for any existing account
        const existingAcc = await res.locals.db.accounts.findOne({email: params.email});
        if (existingAcc) {
          reject(Error.ValidationError([{param: 'email', msg: res.__('VAL_ERRORS.USR_ACC_NEW_EMAIL_EXISTS')}]));
        } else {
          // init hash and salt for new password
          const {hash, salt} = res.locals.accounts.initPasswordHash(params.password);
          // create new account
          const account = await res.locals.db.accounts.create({
            email: params.email,
            password: {hash, salt},
          });
          // create new profile for the account
          const profile = await res.locals.db.profile.create({
            account_id: account.id,
            basic: {
              first_name: params.first_name,
              last_name: params.last_name,
            },
            contact: {
              phone: params.contact_phone,
            },
          });
          // conclude
          resolve({
            account: _.pick(account.toJSON(), ['email', 'created_at', 'updated_at', 'id']),
            profile: profile.toJSON(),
          });
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

exports.accountsLogin = [
  // validation schema
  checkSchema({
    email: {
      in: 'body',
      trim: true,
      isEmpty: {
        negated: true,
        errorMessage: (value, {req}) => req.__('VAL_ERRORS.USR_ACC_LOGIN_MISSING_EMAIL'),
      },
      isEmail: {
        errorMessage: (value, {req}) => req.__('VAL_ERRORS.USR_ACC_LOGIN_INVALID_EMAIL'),
      },
    },
    password: {
      in: 'body',
      trim: true,
      isEmpty: {
        negated: true,
        errorMessage: (value, {req}) => req.__('VAL_ERRORS.USR_ACC_LOGIN_MISSING_PWD'),
      },
    },
  }),
  // validation interceptor
  InputValidator(),
  // controller
  (req, res, next) => {
    // get params from body
    const {email, password} = req.body;
    // begin process
    new Promise(async (resolve, reject) => {
      try {
        // load account
        const account = await res.locals.db.accounts.findOne({email});
        if (!account) {
          return reject(Error.InvalidRequest(res.__('VAL_ERRORS.USR_ACC_LOGIN_INVALID_CRE')));
        }
        // generate password hash
        const passwordHash = res.locals.accounts.generatePasswordHash(password, account.password.salt);
        // verify it
        if (account.password.hash !== passwordHash) {
          return reject(Error.InvalidRequest(res.__('VAL_ERRORS.USR_ACC_LOGIN_INVALID_CRE')));
        }
        // all good
        const access = await res.locals.accounts.generateJWT({
          id: account.id,
        });
        // conclude
        return resolve({
          access_token: access.token,
          expires_in: access.expiry,
        });
      } catch (e) {
        return reject(e);
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

exports.reset = (req, res, next) => {
  // get params from body
  // if email is set then, api call will send password reset request
  // if code is set then, api call will update password
  // if both are not set then this call will throw invalid request error
  const {email, code} = req.body;
  // begin process
  new Promise(async (resolve, reject) => {
    try {
      if (email) {
        // load account
        const acc = await res.locals.db.accounts.findOne({email});
        if (!acc) {
          reject(Error.ValidationError([{
            param: 'email',
            msg: res.__('VAL_ERRORS.USR_ACC_RESET_INVALID_EMAIL'),
          }]));
        } else {
          const resetCode = CryptoUtils.generateUUID();
          acc.reset = {
            code: resetCode,
            issued_at: Date.now(),
            expires_at: Date.now() + PASSWORD_RESET_CODE_EXP,
          };
          await acc.save();
          await res.locals.mail.sendEmail({
            sender: MAIL_ACCOUNTS_SENDER,
            recipient: {
              email: acc.email,
            },
            data: {
              emailAddress: email,
              passwordResetLink: Utils.buildStringFromMappings(ACCOUNT_RESET_URL, {
                web_root: WEB_APP_ROOT,
                code: resetCode,
              }),
            },
            template: MAIL_ACCOUNTS_TEMPLATE_RESET,
            locale: req.getLocale(),
          });
          resolve();
        }
      } else if (code) {
        // load account
        const acc = await res.locals.db.accounts.findOne({'reset.code': code});
        if (acc) {
          if (acc.reset && acc.reset.expires_at && Date.now() < acc.reset.expires_at) {
            const {password, cnf_password} = req.body;
            if (password) {
              if (cnf_password) {
                if (password === cnf_password) {
                  const {hash, salt} = res.locals.accounts.initPasswordHash(password);
                  // update password
                  acc.password = {
                    hash,
                    salt,
                  };
                  acc.reset.code = '';
                  await acc.save();
                  // all good
                  resolve();
                } else {
                  reject(Error.ValidationError([{
                    param: 'cnf_password',
                    msg: res.__('VAL_ERRORS.USR_ACC_NEW_CNF_PWD_MISMATCH'),
                  }]));
                }
              } else {
                reject(Error.ValidationError([{
                  param: 'cnf_password',
                  msg: res.__('VAL_ERRORS.USR_ACC_RESET_MISSING_CNF_PWD'),
                }]));
              }
            } else {
              reject(Error.ValidationError([{
                param: 'password',
                msg: res.__('VAL_ERRORS.USR_ACC_RESET_MISSING_PWD'),
              }]));
            }
          } else {
            reject(Error.InvalidRequest(res.__('VAL_ERRORS.USR_ACC_RESET_LINK_EXPIRE')));
          }
        } else {
          reject(Error.InvalidRequest(res.__('VAL_ERRORS.USR_ACC_RESET_INVALID_RESET_CODE')));
        }
      } else {
        reject(Error.InvalidRequest());
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
};

exports.validateResetRequest = (req, res, next) => {
  // load from query
  const {code} = req.query;
  // begin process
  new Promise(async (resolve, reject) => {
    try {
      if (code) {
        // load account
        const acc = await res.locals.db.accounts.findOne({'reset.code': code});
        if (acc) {
          if (acc.reset && acc.reset.expires_at && Date.now() < acc.reset.expires_at) {
            resolve();
          } else {
            reject(Error.InvalidRequest(res.__('VAL_ERRORS.USR_ACC_RESET_LINK_EXPIRE')));
          }
        } else {
          reject(Error.InvalidRequest(res.__('VAL_ERRORS.USR_ACC_RESET_INVALID_RESET_CODE')));
        }
      } else {
        reject(Error.InvalidRequest(res.__('VAL_ERRORS.USR_ACC_RESET_INVALID_RESET_CODE')));
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
};
