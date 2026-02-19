import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './PlaceOrderPage.module.css';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51RkxLvCmNCk36eUSScZeaSctqGPGzdUNkuSCnPBkoW8d9Awpkju95riVeTC33xtg55VxQrgUGLCIz0jW7xYFIKs600QroSExBV');

const PlaceOrderPage = () => {
  const navigate = useNavigate();
  const shippingInfo = JSON.parse(localStorage.getItem('shippingInfo')) || {};
  const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');

  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const taxPrice = Number((0.15 * itemsPrice).toFixed(2));

  const [coupons, setCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState('');
  const [discount, setDiscount] = useState(0);

  const totalPrice = itemsPrice + shippingPrice + taxPrice - discount;

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const { data } = await axios.get('/api/v1/coupons');
        setCoupons(data);
      } catch (error) {
        console.error('Failed to fetch coupons:', error);
      }
    };
    fetchCoupons();
  }, []);

  const applyCoupon = () => {
    const coupon = coupons.find((c) => c.code === selectedCoupon);
    if (coupon) {
      const discountAmount = (coupon.discount / 100) * itemsPrice;
      setDiscount(discountAmount);
    } else {
      alert('Invalid coupon code');
      setDiscount(0);
    }
  };

  const placeOrderHandler = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };

      const orderPayload = {
        shippingInfo: {
          address: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.state,
          country: shippingInfo.country,
          phoneNo: shippingInfo.phoneNo,
          postalCode: shippingInfo.pinCode,
          fullName: shippingInfo.fullName || 'Guest',
        },
        orderItems: cartItems.map((item) => ({
          name: item.name,
          price: item.price,
          quantity: item.qty,
          image: item.image,
          product: item.product,
        })),
        paymentInfo: {
          id: 'temp',
          status: 'pending',
        },
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
      };

      const { data: orderData } = await axios.post(
        '/api/v1/order/new',
        orderPayload,
        config
      );

      const orderId = orderData.order._id;

      const { data: stripeData } = await axios.post(
        '/api/v1/payment/checkout',
        {
          orderItems: orderPayload.orderItems,
          shippingInfo,
          orderId,
        },
        config
      );

      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId: stripeData.sessionId });

    } catch (error) {
      alert(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Place Order</h2>

      <section className={styles.section}>
        <h4>Shipping Info:</h4>
        <p>
          {shippingInfo.address}, {shippingInfo.city}, {shippingInfo.state}, {shippingInfo.country}
        </p>
        <p>Pin Code: {shippingInfo.pinCode}</p>
        <p>Phone No: {shippingInfo.phoneNo}</p>
      </section>

      <section className={styles.section}>
        <h4>Order Items:</h4>
        {cartItems.length === 0 ? (
          <p>No items in cart.</p>
        ) : (
          <ul className={styles.itemList}>
            {cartItems.map((item) => (
              <li key={item.product} className={styles.item}>
                {item.name} - {item.qty} × ${item.price} = ${(item.qty * item.price).toFixed(2)}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={styles.section}>
        <h4>Apply Coupon:</h4>
        <select
          value={selectedCoupon}
          onChange={(e) => setSelectedCoupon(e.target.value)}
          className={styles.couponSelect}
        >
          <option value="">-- Select Coupon --</option>
          {coupons.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} - {c.discount}% off
            </option>
          ))}
        </select>
        <button onClick={applyCoupon} className={styles.button}>
          Apply
        </button>
        {discount > 0 && (
          <p style={{ color: 'green' }}>Discount Applied: -${discount.toFixed(2)}</p>
        )}
      </section>

      <section className={styles.section}>
        <h4>Order Summary:</h4>
        <p>Items: ${itemsPrice.toFixed(2)}</p>
        <p>Shipping: ${shippingPrice}</p>
        <p>Tax: ${taxPrice}</p>
        {discount > 0 && <p>Discount: -${discount.toFixed(2)}</p>}
        <p>
          <strong>Total: ${totalPrice.toFixed(2)}</strong>
        </p>
      </section>

      <button onClick={placeOrderHandler} className={styles.button}>
        Pay Now
      </button>
    </div>
  );
};

export default PlaceOrderPage;
