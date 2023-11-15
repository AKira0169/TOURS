const Review = require('../modules/review');
const APIFeatures = require('../uti/apiFeatures');
const catchAsynce = require('../uti/catchAsynce');
const AppError = require('../uti/appError');
const Booking = require('../modules/bookingModuel');
const factory = require('./handler');
const Tour = require('../modules/tourmodules');
const User = require('../modules/useModule');

exports.setToursUsers = (req, res, next) => {
  //allaow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.gettingallreveiw = factory.getAll(Review);
exports.postNewReveiw = factory.createOne(Review);
exports.getReveiw = factory.getOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReveiw = factory.deleteOne(Review);
