/* eslint-disable */

import axios from 'axios';

import { showAlert } from './alert';

const stripe = Stripe(
  'pk_test_51O1tEtHsLYMlu4aLdrH0MjRtthabCndbdJSuo3WQBO2oNKKY49zB33D5Zl9hBvPRHmiQ8qxBsiGGPMEPdSX3E8GW00R2C4sKhi',
);
export const bookTour = async (tourId) => {
  try {
    // 1 ) GET CHECKOUT SESSION FROM API
    const session = await axios(
      `http://127.0.0.1:8000/api/v1/bookings/checkout-session/${tourId}`,
    );
    // 2 ) Create check out form + charge credit card}
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err.response.data);
    showAlert('Error', err.response.data);
  }
};
