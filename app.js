const path = require('path');
const express = require('express');
const compression = require('compression');

const cookieParser = require('cookie-parser');

const rateLimit = require('express-rate-Limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const AppError = require('./uti/appError');
const globalErrorHandler = require('./contro/errorContro');

const app = express();

const tourRoutes = require('./routers/tourRouters');
const userRoutes = require('./routers/userRouters');
const viewRoutes = require('./routers/viewRoutes');
const bookingRouters = require('./routers/bookingRouters');

const reveiwRoutes = require('./routers/reveiw');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
// const { Console } = require('console');
//1st middlewares
//recsurity http headers
helmet.contentSecurityPolicy({
  useDefaults: false,
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", 'example.com'], // scripts from example.com are now trusted
    objectSrc: ["'none'"],
    upgradeInsecureRequests: [],
  },
});
//develpoment logging

if (process.env.NODE_ENV === 'development') {
  // app.use(morgan('dev'));
}
app.use(compression());
//limit requests from same api

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'too many requestes from this api please try again in an hour',
});
app.use('/api', limiter);
// body parser readying data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
//data sanitization against NoSQL QUERY parameters
app.use(mongoSanitize());
// data sanitization against XSS
app.use(xss());
// prevent prameter pollution

//serving stitic files

// test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

app.use('/', viewRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/reviews', reveiwRoutes);
app.use('/api/v1/bookings', bookingRouters);

app.all('*', (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl}`, 404));
});
app.use(globalErrorHandler);

//4st start server
module.exports = app;
