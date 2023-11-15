const express = require('express');
const tourContro = require('../contro/tourContro');
const authContro = require('../contro/authContro');
const reveiwcontro = require('../contro/reveiwcontro');

const routes = express.Router({ mergeParams: true });

routes.use(authContro.protect);

// routes.post('/CreateReveiw', reveiwcontro.CreateReveiw);

routes
  .route('/')
  .get(reveiwcontro.gettingallreveiw)
  .post(reveiwcontro.setToursUsers, reveiwcontro.postNewReveiw);

routes
  .route('/:id')
  .delete(reveiwcontro.deleteReveiw)
  .get(reveiwcontro.getReveiw)
  .patch(reveiwcontro.updateReview);

module.exports = routes;
