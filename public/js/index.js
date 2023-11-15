/* eslint -disable */

import '@babel/polyfill';

import {
  login,
  logout,
  signup,
  deletee,
  disableAconts,
  checkOtppp,
} from './login';
import { updateMe } from './updateSettings.js';
import { bookTour } from './stripe.js';

const loginFrom = document.querySelector('.form--login');
const signupFrom = document.querySelector('.form__signupp');
const logOutBtn = document.querySelector('.nav__el--logout');
const formUserData = document.querySelector('.form-user-data');
const formUserPass = document.querySelector('.form-user-settings');
const delet = document.querySelector('.tezk');
const restsra = document.querySelector('.restsra');
const bookBtn = document.getElementById('book-tour');
const sb = document.getElementById('select');
const btnnn = document.querySelector('.btn--delete-accountt');
const checkotp = document.querySelector('.form--checkOtp');

if (checkotp) {
  checkotp.addEventListener('submit', (e) => {
    e.preventDefault();
    let otp = document.getElementById('password123').value;

    checkOtppp(otp);
  });
}

if (btnnn) {
  btnnn.onclick = (e) => {
    e.preventDefault();
    const selectedValues = [].filter
      .call(sb.options, (option) => option.selected)
      .map((option) => option.text);
    disableAconts(selectedValues[0]);
  };
}

if (restsra) {
  restsra.addEventListener('submit', (e) => {
    e.preventDefault();
  });
}

if (delet) {
  delet.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('password1').value;
    deletee(password);
  });
}
if (loginFrom) {
  loginFrom.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}
if (logOutBtn) {
  logOutBtn.addEventListener('click', logout);
}
if (signupFrom) {
  signupFrom.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirm_password = document.getElementById('confirm_password').value;
    signup(username, email, password, confirm_password);
  });
}

if (formUserData) {
  formUserData.addEventListener('submit', (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    // console.log(form);
    updateMe(form, 'data');
  });
}

if (formUserPass) {
  formUserPass.addEventListener('submit', async (e) => {
    e.preventDefault();

    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    await updateMe({ passwordCurrent, password, passwordConfirm }, 'password');
    document.querySelector('.btn--save-password').textContent =
      'Saved Password';
    document.getElementById('password-Current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-Confirm').value = '';
  });
}

if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
}
