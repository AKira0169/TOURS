import axios from 'axios';

import { showAlert } from './alert';

export const updateMe = async (data, type) => {
  console.log(email, password);
  const url =
    type === 'password'
      ? '/api/v1/users/updatePassword'
      : '/api/v1/users/updateMe';
  try {
    const res = await axios({
      method: 'post',
      url,
      data,
    });
    if (res.data.status === 'success') {
      showAlert('success', ` ${type.toUpperCase()} successfully`);
      window.setTimeout(() => {
        location.reload(true);
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
