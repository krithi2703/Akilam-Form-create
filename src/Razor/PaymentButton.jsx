import React from 'react';
import { Button } from '@mui/material';
import api from '../axiosConfig'; // Axios instance configured with baseURL

const PaymentButton = ({ description, userId, formId, formValues, onPaymentSuccess, onPaymentFailure }) => {
  const handlePayment = async () => {
    try {
      // 1. Create Razorpay order
      const orderResponse = await api.post('/create-order', {
        formId,
        currency: 'INR',
        notes: { userId, formId, description }
      });

      if (!orderResponse.data.success) {
        throw new Error(orderResponse.data.error || 'Failed to create order');
      }

      const { id: order_id, amount: order_amount, currency: order_currency } = orderResponse.data.order;

      // 2. Initialize Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order_amount,
        currency: order_currency,
        name: "Akilam Technology",
        description,
        order_id,
        handler: async function (response) {
          try {
            // 3. Verify payment on backend
            const verifyResponse = await api.post('/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              formId: formId,
              columnValues: JSON.stringify(formValues),
              emailOrPhone: userId
            });

            if (verifyResponse.data.success) {
              alert('Payment Successful!');
              onPaymentSuccess(verifyResponse.data.paymentId, order_id);
            } else {
              alert('Payment Verification Failed: ' + verifyResponse.data.error);
              onPaymentFailure(verifyResponse.data.error);
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed.');
            onPaymentFailure(error.message);
          }
        },
        prefill: {
          name: "Palanivel",
          email: "palanivelrajendiran158@gmail.com",
          contact: "9597412394"
        },
        notes: {
          address: "Trichy"
        },
        theme: {
          color: "#3399cc"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

      rzp.on('payment.failed', function (response) {
        alert('Payment Failed: ' + response.error.description);
        console.error('Payment Failed:', response.error);
        onPaymentFailure(response.error.description);
      });

    } catch (error) {
      console.error('Error initiating payment:', error);
      alert('Error initiating payment: ' + error.message);
      onPaymentFailure(error.message);
    }
  };

  return (
    <Button variant="contained" color="primary" onClick={handlePayment}>
      Pay Now
    </Button>
  );
};

export default PaymentButton;
