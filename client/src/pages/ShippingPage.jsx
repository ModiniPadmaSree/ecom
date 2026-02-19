import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ShippingPage.module.css';

const ShippingPage = () => {
  const navigate = useNavigate();
  const [shippingInfo, setShippingInfo] = useState({
    address: '',
    city: '',
    state: '',
    country: '',
    pinCode: '',
    phoneNo: '',
  });

  const handleChange = (e) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('shippingInfo', JSON.stringify(shippingInfo)); // Save in localStorage
    navigate('/placeorder');
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Shipping Information</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        {['address', 'city', 'state', 'country', 'pinCode', 'phoneNo'].map((field) => (
          <div key={field} className={styles.formGroup}>
            <label className={styles.label}>
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </label>
            <input
              type={field === 'pinCode' || field === 'phoneNo' ? 'number' : 'text'}
              name={field}
              value={shippingInfo[field]}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>
        ))}
        <button type="submit" className={styles.button}>
          Continue to Place Order
        </button>
      </form>
    </div>
  );
};

export default ShippingPage;
