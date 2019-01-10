// init cross-origin allowed headers
const ALLOWED_HEADERS = [
  'Authorization',
];
// init cross-origin allowed methods
const ALLOWED_METHODS = [
  'GET',
  'POST',
  'OPTIONS',
  'PUT',
  'PATCH',
  'DELETE',
];
// normalize allowed headers
const NORMALIZED_ALLOWED_HEADERS = ALLOWED_HEADERS.join(', ');
// normalize allowed methods
const NORMALIZED_ALLOWED_METHODS = ALLOWED_METHODS.join(', ');

exports.addHeaders = (req, res, next) => {
  // website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');
  // request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', NORMALIZED_ALLOWED_METHODS);
  // request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', NORMALIZED_ALLOWED_HEADERS);
  next();
};
