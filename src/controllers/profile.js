const {checkSchema} = require('express-validator/check');
const Promise = require('bluebird');
const _ = require('lodash');
const PhoneNumber = require('awesome-phonenumber');

const {ProfileResolver, InputValidator} = require('../interceptors');

exports.get = [
  // this will load the profile at req.user_profile
  ProfileResolver,
  // controller
  (req, res, next) => {
    // load profile
    const profile = req.user_profile;
    // begin process
    new Promise(async (resolve, reject) => {
      try {
        // select keys to pick up
        const keyMap = ['id', 'basic', 'address', 'contact', 'assets'];
        // conclude
        resolve(_.pick(profile, keyMap));
      } catch (err) {
        reject(err);
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

exports.updateUser = [
  // validation schema
  checkSchema({
    first_name: {
      in: 'body',
      trim: true,
      isEmpty: {
        negated: true,
        errorMessage: (value, {req}) => req.__('VAL_ERRORS.USR_PROFILE_MISSING_F_NAME'),
      },
    },
    last_name: {
      in: 'body',
      trim: true,
      optional: true,
    },
    contact_phone: {
      in: 'body',
      trim: true,
      optional: true,
      custom: {
        options: value => !value || PhoneNumber(value).isValid(),
        errorMessage: (value, {req}) => req.__('VAL_ERRORS.USR_PROFILE_INVALID_PHONE'),
      },
    },
  }),
  // validation interceptor
  InputValidator(),
  // this will load the profile at req.user_profile
  ProfileResolver,
  // controller
  (req, res, next) => {
    // host element from which params will be acquired
    const params = req.body;
    // load profile
    const profile = req.user_profile;
    // begin process
    new Promise(async (resolve, reject) => {
      try {
        // set to profile
        profile.set({
          basic: {
            first_name: params.first_name,
            last_name: params.last_name || null,
          },
          contact: {
            phone: params.contact_phone || null,
          },
        });
        // save
        await profile.save();
        // conclude
        resolve();
      } catch (err) {
        reject(err);
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
