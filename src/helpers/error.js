exports.InvalidRequest = (msg) => {
  const eMsg = msg || '';
  const error = new Error(eMsg);
  error.api_code = 'invalid_request';
  error.api_status = 400;
  // noinspection JSUndefinedPropertyAssignment
  error.locale_tag = 'INVALID_REQUEST';
  return error;
};

exports.NotFound = (msg) => {
  const eMsg = msg || '';
  const error = new Error(eMsg);
  error.api_code = 'not_found';
  error.api_status = 404;
  // noinspection JSUndefinedPropertyAssignment
  error.locale_tag = 'NOT_FOUND';
  return error;
};

exports.isHandled = err => err.api_code;
