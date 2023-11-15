const express = require('express');
const tourContro = require('../contro/tourContro');

const authContro = require('../contro/authContro');
const bookingcontro = require('../contro/bookingcontro');
const bodyParser = require('body-parser');

const routes = express.Router();
const tez = bodyParser.json();

routes.post(
  '/CreateReveiw/:id',
  tez,
  authContro.protect,
  bookingcontro.CreateReveiw,
);

routes
  .route('/checkout-session/:tourId')
  .get(authContro.protect, bookingcontro.getCheckoutSession);

routes.get('/getallbookings', authContro.protect, bookingcontro.getAllBookings);
routes.get('/getBooking', authContro.protect, bookingcontro.getBooking);
routes.post('/CreateBooking', authContro.protect, bookingcontro.CreateBooking);
routes.patch('/updateBooking', authContro.protect, bookingcontro.updateBooking);
routes.delete(
  '/deleteBooking',
  authContro.protect,
  bookingcontro.deleteBooking,
);

module.exports = routes;
