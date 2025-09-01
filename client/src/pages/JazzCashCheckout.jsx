import React, { useEffect } from 'react';
import axios from 'axios';

const JazzCashCheckout = ({ cart }) => {
  const initiateJazzCashPayment = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/checkout/create-jazzcash-checkout', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const { action, formData } = response.data;

      // Create form dynamically
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = action;

      Object.keys(formData).forEach(key => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = formData[key];
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      console.error('Error initiating JazzCash payment:', error);
      alert('Failed to initiate JazzCash payment');
    }
  };

  return (
    <button onClick={initiateJazzCashPayment} disabled={!cart.length}>
      Pay with JazzCash
    </button>
  );
};

export default JazzCashCheckout;