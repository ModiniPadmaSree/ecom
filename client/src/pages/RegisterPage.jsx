import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loader from '../components/Loader';
import Message from '../components/Message';
import styles from './RegisterPage.module.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null); // For success messages

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const { data } = await axios.post(
        '/api/v1/register',
        { name, email, password },
        config
      );

      localStorage.setItem('userInfo', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);

      setLoading(false);
      navigate('/'); // Redirect to home after successful registration
      window.location.reload(); // Force refresh header
    } catch (err) {
      setError(err.response && err.response.data.message
        ? err.response.data.message
        : err.message);
      setLoading(false);
    }
  };

  return (
   <div className={styles.registerContainer}>
  <div className={styles.registerCard}>

   <h1 className={styles.registerTitle}>Sign Up</h1>

        {error && <Message type="error" className="mb-4">{error}</Message>}
        {message && <Message type="info" className="mb-4">{message}</Message>}
        {loading && <Loader />}
        <form onSubmit={submitHandler}>
          <div className="mb-4">
            <label htmlFor="name" className="className={styles.registerLabel}">
              Name
            </label>
            <input
              type="text"
              id="name"
              className={styles.registerInput}
 placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className={styles.registerLabel}
>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className={styles.registerInput}
   placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" cclassName={styles.registerLabel}
>
              Password
            </label>
            <input
              type="password"
              id="password"
            className={styles.registerInput}
  placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="confirmPassword" className={styles.registerLabel}>
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
             className={styles.registerInput}
 placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
           className={styles.registerButton}
 disabled={loading}
          >
            Register
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-gray-700">
            Have an Account?{' '}
            <Link to="/login" className={styles.registerLink}
>
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;