const express = require('express');

const userContro = require('../contro/userContro');
const authContro = require('../contro/authContro');
const reveiwcontro = require('../contro/reveiwcontro');

const routes = express.Router();

routes.post('/signup', authContro.signup, authContro.verc);
routes.post('/login', authContro.limitlogin, authContro.login);
routes.post('/checkOtp', authContro.checkOtp);
routes.get('/logout', authContro.logout);
routes.post('/forgotPassword', authContro.forgotPassword);
routes.patch('/resetPassword/:token', authContro.resetPassword);
routes.delete('/deleteMee', authContro.protect, userContro.deleteMee);
routes.delete('/deleteMeee', authContro.protect, userContro.deleteMeee);
//checking for valid routes
routes.param('id', userContro.checkID);

routes.use(authContro.protect);

routes.route('/').get(userContro.getAllUsers).post(userContro.createUser);
routes.get('/me', userContro.getMe, userContro.getUser);
routes.post(
  '/updateMe',
  userContro.uploadUserPhoto,
  userContro.resizeUserPhoto,
  userContro.updateMe,
);

routes.delete('/deleteMe', userContro.deleteMe);

routes
  .route('/:id')
  .get(userContro.getUser)
  .patch(userContro.updateUser)
  .delete(userContro.deleteUser);

routes.post('/updatePassword', authContro.updatePassword);
routes.post('/submitanemail', authContro.submitanemail);
routes.post('/verc', authContro.verc);
routes.patch('/accep/:tez', authContro.accep);

module.exports = routes;
