import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loader from '../components/Loader';
import Message from '../components/Message';
import styles from './ProfilePage.module.css';
const API = process.env.REACT_APP_API_URL;
const ProfilePage = () => {
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState(null);
  const [token, setToken] = useState(null);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updateMessage, setUpdateMessage] = useState(null);

  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    const storedToken = localStorage.getItem('token');
    if (storedUserInfo && storedToken) {
      setUserInfo(JSON.parse(storedUserInfo));
      setToken(storedToken);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (userInfo && token) {
      const fetchUserProfile = async () => {
        setLoading(true);
        try {
          const config = {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          };
          const { data } = await axios.get(`${API}/api/v1/me`, config);
          setUser(data.user);
          setName(data.user.name);
          setEmail(data.user.email);
          setLoading(false);
        } catch (err) {
          setError(err.response?.data?.message || err.message);
          setLoading(false);
          if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            localStorage.removeItem('userInfo');
            localStorage.removeItem('token');
            navigate('/login');
          }
        }
      };
      fetchUserProfile();
    }
  }, [userInfo, token, navigate]);

  const updateProfileHandler = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateError(null);
    setUpdateMessage(null);

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.put(`${API}/api/v1/me/update`, { name, email }, config);

      setUpdateMessage('Profile updated successfully!');
      const updatedUserInfo = { ...userInfo, name: data.user.name, email: data.user.email };
      localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
      setUser(data.user);
      setUserInfo(updatedUserInfo);
      setUpdateLoading(false);
    } catch (err) {
      setUpdateError(err.response?.data?.message || err.message);
      setUpdateLoading(false);
    }
  };

  const updatePasswordHandler = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateError(null);
    setUpdateMessage(null);

    if (newPassword !== confirmPassword) {
      setUpdateMessage('New password and confirm password do not match');
      setUpdateLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.put(`${API}/api/v1/password/update`, { oldPassword, newPassword, confirmPassword }, config);

      setUpdateMessage('Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setUpdateLoading(false);
    } catch (err) {
      setUpdateError(err.response?.data?.message || err.message);
      setUpdateLoading(false);
    }
  };

  const logoutHandler = () => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  if (loading) return <Loader />;
  if (error) return <Message type="error">{error}</Message>;

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileCard}>
        <div className={styles.profileSidebar}>
          <h2 className={styles.profileName}>{user?.name}</h2>
          <p className={styles.profileEmail}>{user?.email}</p>
          <p className={styles.profileRole}>{user?.role === 'admin' ? 'Administrator' : 'Customer'}</p>
          <button onClick={logoutHandler} className={`${styles.btn} ${styles.btnRed}`}>Logout</button>
          <button onClick={() => navigate('/orders')} className={`${styles.btn} ${styles.btnPurple}`}>My Orders</button>
        </div>

        <div className={styles.formSection}>
          {updateLoading && <Loader />}
          {updateError && <Message type="error" className="mb-4">{updateError}</Message>}
          {updateMessage && <Message type="success" className="mb-4">{updateMessage}</Message>}

          <div className="mb-8">
            <h3 className={styles.formHeading}>Update Profile Details</h3>
            <form onSubmit={updateProfileHandler}>
              <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.formLabel}>Name</label>
                <input type="text" id="name" className={styles.formInput} value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.formLabel}>Email Address</label>
                <input type="email" id="email" className={styles.formInput} value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <button type="submit" className={styles.formButton} disabled={updateLoading}>Update Profile</button>
            </form>
          </div>

          <div>
            <h3 className={styles.formHeading}>Update Password</h3>
            <form onSubmit={updatePasswordHandler}>
              <div className={styles.formGroup}>
                <label htmlFor="oldPassword" className={styles.formLabel}>Old Password</label>
                <input type="password" id="oldPassword" className={styles.formInput} value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="newPassword" className={styles.formLabel}>New Password</label>
                <input type="password" id="newPassword" className={styles.formInput} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword" className={styles.formLabel}>Confirm New Password</label>
                <input type="password" id="confirmPassword" className={styles.formInput} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
              <button type="submit" className={styles.formButton} disabled={updateLoading}>Update Password</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
