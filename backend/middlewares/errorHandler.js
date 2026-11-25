import env from '../config/env.js';

// Central error handler — always answers with { success: false, message, errors? }
// eslint-disable-next-line no-unused-vars
export default (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || 'Something went wrong.';

  if (err.code === 'ER_DUP_ENTRY') {
    status = 409;
    message = 'That record already exists.';
  } else if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    status = 400;
    message = 'Referenced record does not exist.';
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Invalid or expired token. Please log in again.';
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Malformed JSON in request body.';
  } else if (err.name === 'MulterError') {
    status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'File is too large.' : `Upload error: ${err.message}`;
  } else if (err.type === 'entity.too.large') {
    status = 413;
    message = 'Request body is too large.';
  } else if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST') {
    status = 503;
    message = 'Database is unavailable. Is MySQL running in XAMPP?';
  }

  if (status >= 500) console.error(err);

  res.status(status).json({
    success: false,
    message: status >= 500 && env.isProd ? 'Internal server error.' : message,
    ...(err.errors ? { errors: err.errors } : {}),
    ...(!env.isProd && status >= 500 ? { stack: err.stack } : {}),
  });
};
