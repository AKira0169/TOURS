const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-Limit');
const { error } = require('console');
const User = require('../modules/useModule');
const catchAsynce = require('../uti/catchAsynce');
const AppError = require('../uti/appError');
const nodemailer = require('nodemailer');
const Email = require('../uti/email');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
const createSendToken = (user, statusCode, res) => {
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  const token = signToken(user._id);
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    date: {
      user,
    },
  });
};

exports.signup = catchAsynce(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });

  const url = `${req.protocol}://${req.get('host')}/me`;
  console.log(url);
  newUser.totaprota = Date.now() + 2592000 * 1000;
  await newUser.save({ validateBeforeSave: false });
  await new Email(newUser, url).sendWelcome();
  createSendToken(newUser, 201, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'logged out', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

exports.login = catchAsynce(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Invalid email or password', 400));
  }
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctpassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  if (user.totaprota > Date.now()) {
    createSendToken(user, 201, res);
  }

  const otptoken = user.createOtp();
  await user.save({ validateBeforeSave: false });
  console.log(otptoken);

  await new Email(user, otptoken).sendOt();

  res.status(200).json({
    status: 'Pedding',
    message: 'please go to /v1/users/checkOtp to login ',
  });
});

exports.checkOtp = catchAsynce(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.body.otp)
    .digest('hex');
  const user = await User.findOne({
    otp: hashedToken,
    otpExpores: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError('Token is invalid or has expired'), 400);
  }
  user.otp = undefined;
  user.otpExpores = undefined;
  user.totaprota = Date.now() + 2592000 * 1000;
  await user.save({ validateBeforeSave: false });
  createSendToken(user, 200, res);
});

exports.protect = catchAsynce(async (req, res, next) => {
  //step one get the token check if it there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(
      new AppError('you are not logged in! please loging to gain access', 401),
    );
  }
  //verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // check if the user is still exists
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError('The user belongs to this token does no longer exist', 401),
    );
  }
  //check if the user changed password after the token was issued
  if (freshUser.changepasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'The user IS RECENTLY CHANGED HIS PASSWORD! PLEASE LOGIN AGAIN',
        401,
      ),
    );
  }
  req.user = freshUser;
  res.locals.user = freshUser;
  next();
});
// only for rendered pages , no errors!
exports.isLoggedIn = catchAsynce(async (req, res, next) => {
  //step one get the token check if it there
  if (req.cookies.jwt) {
    // 1) verification token
    try {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );
      // check if the user is still exists
      const freshUser = await User.findById(decoded.id);
      if (!freshUser) {
        return next();
      }
      //check if the user changed password after the token was issued
      if (freshUser.changepasswordAfter(decoded.iat)) {
        return next();
      }
      //There is a logged in user
      res.locals.user = freshUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to preform this action', 403),
      );
    }
    next();
  };

exports.forgotPassword = catchAsynce(async (req, res, next) => {
  //Get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with that email address', 404));
  }
  //generate a random token
  const resetToken = user.createPasswordRestToken();
  await user.save({ validateBeforeSave: false });
  // send it to user
  try {
    const resetURL = `${req.protocol}://${req.get(
      'host',
    )}/api/v1/users/resetPassword/${resetToken}`;

    await new Email(user, resetURL).sendPasswordReset();
    res
      .status(200)
      .json({ status: 'success', message: 'Token sent to email!' });
  } catch (err) {
    user.passwordRestToken = undefined;
    user.passwordResetExpores = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError('There was an error sending the email.Try again later!'),
      500,
    );
  }
});

exports.resetPassword = catchAsynce(async (req, res, next) => {
  //get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordRestToken: hashedToken,
    passwordResetExpores: { $gt: Date.now() },
  });

  //if token is not expired , and there is user , set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired'), 400);
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordRestToken = undefined;
  user.passwordResetExpores = undefined;
  await user.save();
  //update changepasssowrdAt proparty for the user

  //log the user in, send the JSONWEBTOKEN'JWT'
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsynce(async (req, res, next) => {
  // get the user from the colection
  const user = await User.findById(req.user.id).select('+password');

  // chech if the posted password is correct
  if (!(await user.correctpassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Incorrect password', 401));
  }
  // if so update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  //log the user in, send the JSONWEBTOKEN'
  createSendToken(user, 200, res);
});

exports.submitanemail = catchAsynce(async (req, res, next) => {
  //Get user based on posted email
  const user = await User.findOne({ email: req.body.to });
  if (!user) {
    return next(new AppError('There is no user with that email address', 404));
  }
  const sub = req.body.subject;
  //gain the from email from the login
  const fromMail = req.user.email;
  // send it to user
  const contentOfmessage = req.body.message;
  const message = `${contentOfmessage}`;
  // try {
  //   await sendEmailHeader(
  //     {
  //       email: user.email,
  //       subject: sub,
  //       message,
  //     },
  //     fromMail,
  //   );
  //   res
  //     .status(200)
  //     .json({ status: 'success', message: 'successfuly sent to the email' });
  // } catch (err) {
  //   return next(
  //     new AppError('There was an error sending the email.Try again later!'),
  //     500,
  //   );
  // }
});

exports.verc = catchAsynce(async (req, res, next) => {
  //Get user based on posted email
  const user = await User.findOne({ email: req.user.email });
  if (!user) {
    return next(new AppError('There is no user with that email address', 404));
  }
  //generate a random token
  user.rand = Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;
  user.verfaExpores = Date.now() + 10 * 60 * 1000;
  await user.save({ validateBeforeSave: false });
  // send it to user
  const message = `the code is :${user.rand}.`;
  // try {
  //   await sendEmailHeader(
  //     {
  //       email: user.email,
  //       subject: 'invaled for 10 min',
  //       message,
  //     },
  //     'zbyelgamed@gmail.com',
  //   );
  //   res
  //     .status(200)
  //     .json({ status: 'success', message: 'verfay sent to email!' });
  // } catch (err) {
  //   await user.save({ validateBeforeSave: false });
  //   return next(
  //     new AppError('There was an error sending the email.Try again later!'),
  //     500,
  //   );
  // }
});
exports.accep = catchAsynce(async (req, res, next) => {
  const user = await User.findOne({
    email: req.user.email,
    rand: req.params.tez,
    verfaExpores: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError('Token is invalid or the time is passed'), 400);
  }

  user.verfa = true;
  user.rand = undefined;
  user.verfaExpores = undefined;
  await user.save({ validateBeforeSave: false });
  res.status(200).json({
    status: 'success',
    message: 'your email has benn successfuly verfaed',
  });
});
exports.limitlogin = rateLimit({
  max: 5,
  windowMs: 5 * 60 * 1000,
  message: 'tryed wrong five times',
});
