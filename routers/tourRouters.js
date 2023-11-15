const express = require('express');
const tourContro = require('../contro/tourContro');
const authContro = require('../contro/authContro');
const reveiwcontro = require('../contro/reveiwcontro');
const reveiwRouter = require('./reveiw');

const routes = express.Router();

routes.use('/:tourId/reviews', reveiwRouter);

routes.route('/tourstats').get(tourContro.getTourStats);
routes.route('/elplan/:year').get(tourContro.getMonthlyplan);
routes
  .route('/top-5-cheap')
  .get(tourContro.aliasTopTours, tourContro.getAllTours);
//checking for valid routes
// routes.param('id', tourContro.checkID);

routes
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourContro.getToursWithin);
routes.route('/distances/:latlng/unit/:unit').get(tourContro.getdistances);
routes
  .route('/')
  .get(tourContro.getAllTours)
  .post(
    authContro.protect,
    authContro.restrictTo('admin', 'Lead-guide'),
    tourContro.createTour,
  );
routes
  .route('/:id')
  .get(tourContro.getTour)
  .patch(
    authContro.protect,
    authContro.restrictTo('admin', 'Lead-guide'),
    tourContro.uploadTourImages,
    tourContro.resizeTourImages,
    tourContro.updateTour,
  )
  .delete(
    authContro.protect,
    authContro.restrictTo('admin', 'Lead-guide'),
    tourContro.deleteTour,
  );
routes
  .route('/:tourId/reviews')
  .post(authContro.protect, reveiwcontro.postNewReveiw);

module.exports = routes;
//
