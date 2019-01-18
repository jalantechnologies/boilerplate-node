const sgMail = require('@sendgrid/mail');
const config = require('config');

const {Logger, CryptoUtils} = require('../../helpers');

// load from config
const SENDGRID_API_KEY = config.get('sendgrid.APIKey');
const SENDGRID_TEMPLATES = config.get('sendgrid.template');
const MAIL_ENABLED = config.get('mail.enabled');
const MAIL_SENDERS = config.get('mail.sender');
const MAIL_LOCALE = config.get('mail.locale');

// set up sgMail
sgMail.setApiKey(SENDGRID_API_KEY);

/**
 * @function - sends mail
 * TODO: Depreciate usage of params.sender {Object}
 * @param params
 * @param {{name: string, email: string} | string} params.sender
 * @param {{email: string}} params.recipient
 * @param {string} params.template
 * @param {Object} [params.data]
 * @param {locale} [params.locale]
 * @returns Promise
 */
exports.sendEmail = params => new Promise((resolve, reject) => {
  // generate request id for tracking
  const requestId = CryptoUtils.generateUUID();
  // resolve from params
  const {
    recipient, data, locale, template,
  } = params;
  // resolve sender
  // if a string was provided, resolve sender from config
  const sender = typeof params.sender === 'string' ? MAIL_SENDERS[params.sender] : params.sender;
  // log
  Logger.info('Module.Mail.sendMail: %s - Attempting to send mail to: %s, from: %s, template: %s', requestId, recipient.email, sender.email, template);
  // resolve templateId via provided locale or default one
  const templateId = SENDGRID_TEMPLATES[locale || MAIL_LOCALE][template];
  // start process
  if (!MAIL_ENABLED) {
    Logger.warn('Module.Mail.sendMail: %s - Aborting procedure as mailing is disabled');
    resolve();
  } else {
    Logger.info('Module.Mail.sendMail: %s - Attempting to send mail via template: %s', requestId, templateId);
    // send mail
    sgMail
      .send({
        from: {
          email: sender.email,
          name: sender.name,
        },
        templateId,
        personalizations: [{
          to: [{
            email: recipient.email,
          }],
          dynamic_template_data: data,
        }],
      })
      .then((res) => {
        // log
        // dump res for debugging purposes
        Logger.info('Module.Mail.sendMail: %s - Procedure ended successfully - %j', requestId, res);
        // conclude successfully
        resolve();
      }, (err) => {
        // log
        Logger.error('Module.Mail.sendMail: %s - Procedure ended with error - %s', requestId, err.message);
        // add tracking to error
        err.trackId = `mod.mail:${requestId}`;
        // conclude with error
        reject(err);
      });
  }
});
