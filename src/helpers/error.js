exports.InvalidRequest = (msg) => {
  const eMsg = msg || 'Request could not be completed due to invalid request. Kindly check your request and try again.';
  const error = new Error(eMsg);
  error.api_code = 'invalid_request';
  error.api_status = 400;
  return error;
};

exports.NotFound = (msg) => {
  const eMsg = msg || 'Requested resource not found.';
  const error = new Error(eMsg);
  error.api_code = 'not_found';
  error.api_status = 404;
  return error;
};

exports.isHandled = err => err.api_code;
