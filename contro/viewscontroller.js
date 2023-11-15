const AppError = require('../uti/appError');
const Tour = require('../modules/tourmodules');
const Booking = require('../modules/bookingModuel');
const User = require('../modules/useModule');
const Review = require('../modules/review');
const catchAsynce = require('../uti/catchAsynce');

exports.getOverview = catchAsynce(async (req, res, next) => {
  // get tour data from collection
  const tours = await Tour.find();

  // build templates
  // render that tamplate using tour data from 1
  res.status(200).render('overview', { title: 'All Tours', tours });
});

exports.getTour = catchAsynce(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    field: 'review user rating',
  });
  if (!tour) {
    return next(new AppError('There is no tour with that name ', 404));
  }

  res.status(200).render('tour', { title: tour.name, tour });
});

exports.loginForm = catchAsynce(async (req, res, next) => {
  res.status(200).render('login', { title: 'Log into your account' });
});
exports.checkOtpFrom = catchAsynce(async (req, res, next) => {
  res.status(200).render('checkotp', { title: 'checkOtp' });
});

exports.signupForm = catchAsynce(async (req, res, next) => {
  res.status(200).render('signup', { title: 'signup' });
});

exports.getAccount = (req, res) => {
  res.status(200).render('account', { title: 'Your account' });
};

exports.manageUsers = catchAsynce(async (req, res) => {
  await User.find({}).then((users) => {
    res.status(200).render('manageUsers', { title: 'Your manageUsers', users });
  });
});

exports.updateUserDate = catchAsynce(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    { new: true, runValidators: true },
  );
  res
    .status(200)
    .render('account', { title: 'Your account', user: updatedUser });
});

exports.getMyTours = catchAsynce(async (req, res, next) => {
  //1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });
  console.log(bookings);
  //2) Find all tours
  const tourIDs = bookings.map((el) => el.tour);

  const tour = await Tour.find({ _id: { $in: tourIDs } });
  res.status(200).render('overview', {
    title: 'My Tours',
    tours: tour,
  });
});
