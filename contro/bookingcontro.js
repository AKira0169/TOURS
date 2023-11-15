const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../modules/tourmodules');
const Booking = require('../modules/bookingModuel');
const AppError = require('../uti/appError');
const Review = require('../modules/review');
const APIFeatures = require('../uti/apiFeatures');
const catchAsynce = require('../uti/catchAsynce');
const factory = require('./handler');

exports.getCheckoutSession = catchAsynce(async (req, res, next) => {
  //1) Get the Currently booking tour
  const tour = await Tour.findById(req.params.tourId);
  console.log(tour);

  //2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_referance_id: req.params.tourid,
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [
              `https://img.freepik.com/free-photo/html-system-website-concept_23-2150376770.jpg?size=626&ext=jpg&ga=GA1.1.1499955440.1696951915&semt=ais`,
            ],
          },
        },
        quantity: 1,
      },
    ],
  });

  //3) Create session as a response

  res.status(200).json({ status: 'success', session });
});

exports.CreateBookingCheckout = catchAsynce(async (req, res, next) => {
  //this is only temporary, because it's unSECURE :every can make bookings without paying

  const { tour, user, price } = req.query;
  if (!tour && !user && !price) {
    return next();
  }
  await Booking.create({ tour, user, price });
  res.redirect(req.originalUrl.split('?')[0]);
});

exports.CreateBooking = factory.createOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.getBooking = factory.getOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);

exports.CreateReveiw = catchAsynce(async (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.id;
  if (!req.body.user) req.body.user = req.user.id;

  const bookings = await Booking.find({
    user: req.user.id,
    tour: req.params.id,
  });
  if (bookings.length === 0) {
    next(
      new AppError(
        `You can't make a review of tours that you didn't book`,
        404,
      ),
    );
  }
  const review = await Review.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      review,
    },
  });
});
