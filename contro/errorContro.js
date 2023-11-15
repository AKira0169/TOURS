const AppError = require('../uti/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}:${err.value}`;
  return new AppError(message, 400);
};
const handleDuplicateErrorDB = (err) => {
  const message = `Dublcated name ,${err.keyValue.name}already exists`;
  return new AppError(message, 400);
};
const handleValidatorErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `invalid input data.${errors.join('. ')}`;
  return new AppError(message, 400);
};
const handleJWTError = () =>
  new AppError('Invalid Token please login again', 401);
const handleJWTExpired = () =>
  new AppError('Expired Token please login again', 401);

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,
    });
  } else {
    res
      .status(err.statusCode)
      .render('error', { title: 'Something went wrong', msg: err.message });
  }
};
const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    // isOperational,thrused error : send error message to the clint
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // send a generic error message
    return res
      .status(500)
      .json({ status: 'error', message: 'somthing went wrong' });
  }
  if (err.isOperational) {
    return res
      .status(err.statusCode)
      .render('error', { title: 'Something went wrong', msg: err.message });
  }
  // send a generic error message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: 'Please trying later',
  });
};
// Middleware to send error depending on the err name or code
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    console.log(error.name);
    if (err.name === 'CastError') {
      error = handleCastErrorDB(error);
    }
    if (err.code === 11000) {
      error = handleDuplicateErrorDB(error);
    }
    if (err.name === 'ValidationError') {
      error = handleValidatorErrorDB(error);
    }
    if (error.name === 'JsonWebTokenError') {
      error = handleJWTError();
    }
    if (error.name === 'TokenExpiredError') {
      error = handleJWTExpired();
    }
    sendErrorProd(error, req, res);
  }
};
