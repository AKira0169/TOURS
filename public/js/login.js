/* eslint-disable */

import axios from 'axios';

import { showAlert } from './alert';

export const disableAconts = async (name) => {
  try {
    const res = await axios({
      method: 'delete',
      url: '/api/v1/users/deleteMeee',
      data: { name },
    });

    if (res.status == '204') {
      showAlert('success', 'deleted account successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (e) {
    showAlert('Error', e);
  }
};

export const login = async (email, password) => {
  console.log(email, password);
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: { email, password },
    });
    if (res.data.status === 'Pedding') {
      showAlert('success', 'loggend in successfully');
      location.assign('/checkOtp');
    }
    if (res.data.status === 'success') {
      showAlert('success', 'loggend in successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
export const checkOtppp = async (otp) => {
  console.log(otp);

  try {
    const res = await axios({
      method: 'post',
      url: '/api/v1/users/checkOtp',
      data: { otp },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'loggend in successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });
    if (res.data.status === 'success') {
      if (window.location.href === '/me') {
        location.assign('/');
      } else {
        location.reload(true);
      }
    }
  } catch (err) {
    showAlert('error', 'Error logging out try again');
  }
};

export const signup = async (name, email, password, passwordConfirm) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data: { name, email, password, passwordConfirm },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'loggend in successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const deletee = async (password) => {
  try {
    const res = await axios({
      method: 'delete',
      url: '/api/v1/users/deleteMee',
      data: { password },
    });
    console.log(res);
    if (res.status == '204') {
      showAlert('success', 'deleted account successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', 'Error logging out try again');
  }
};
