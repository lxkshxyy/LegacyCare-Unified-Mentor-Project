const notFound = (req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || 'Something went wrong';

  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid ID';
  } else if (err.code === 11000) {
    status = 409;
    message = `${Object.keys(err.keyValue || {}).join(', ') || 'Value'} already exists`;
  } else if (err.code === 'LIMIT_FILE_SIZE') {
    status = 400;
    message = 'File is too large (max 5 MB)';
  }

  if (status === 500) console.error(err);
  res.status(status).json({
    message,
    ...(process.env.NODE_ENV === 'development' && status === 500 ? { stack: err.stack } : {}),
  });
};

module.exports = { notFound, errorHandler };
