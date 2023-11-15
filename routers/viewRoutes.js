const express = require('express');
const viewController = require('../contro/viewscontroller');
const bookingcontro = require('../contro/bookingcontro');
const authContro = require('../contro/authContro');

const router = express.Router();

router.get(
  '/',
  bookingcontro.CreateBookingCheckout,
  authContro.isLoggedIn,
  viewController.getOverview,
);

router.get('/tour/:slug', authContro.isLoggedIn, viewController.getTour);

router.get('/loging', authContro.isLoggedIn, viewController.loginForm);
router.get('/checkOtp', viewController.checkOtpFrom);

router.get('/signupform', viewController.signupForm);

router.get('/me', authContro.protect, viewController.getAccount);
router.get('/my-tours', authContro.protect, viewController.getMyTours);
router.get('/manageUsers', authContro.protect, viewController.manageUsers);

router.post(
  '/submit-user-date',
  authContro.protect,
  viewController.updateUserDate,
);

module.exports = router;
