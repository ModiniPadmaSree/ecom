import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Header.module.css';

const Header = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef(null);

  // Load user info
  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) setUserInfo(JSON.parse(storedUserInfo));
  }, []);

  // Logout
  const logoutHandler = () => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('token');
    setUserInfo(null);
    setDropdownOpen(false);
    navigate('/login');
    window.location.reload();
  };

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  // Search form submit
  const searchHandler = (e) => {
    e.preventDefault();

    if (!keyword.trim()) {
      // If empty, go home
      navigate('/');
      setResults([]);
      setShowSearchDropdown(false);
      return;
    }

    // Navigate to first product if exists
    if (results.length > 0) {
      navigate(`/product/${results[0]._id}`);
      setKeyword('');
      setShowSearchDropdown(false);
    }
  };

  // Fetch matching products
  useEffect(() => {
    const fetchResults = async () => {
      if (!keyword.trim()) {
        setResults([]);
        setShowSearchDropdown(false);
        return;
      }

      try {
        const { data } = await axios.get(`/api/v1/products?keyword=${keyword}`);
        setResults(data.products || []);
        setShowSearchDropdown(true);
      } catch (err) {
        console.error(err);
        setResults([]);
        setShowSearchDropdown(false);
      }
    };

    const debounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounce);
  }, [keyword]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles['header-container']}>
        <Link to="/" className={styles['header-logo']}>NexMart</Link>

        {/* Search */}
        <div className={styles.searchWrapper} ref={searchRef}>
          <form onSubmit={searchHandler} className={styles.searchForm}>
            <input
              type="text"
              placeholder="Search for products..."
              value={keyword}
              onChange={(e) => {
                const value = e.target.value;
                setKeyword(value);

                if (value.trim() === '') {
                  navigate('/'); // go home if cleared
                  setResults([]);
                  setShowSearchDropdown(false);
                }
              }}
              onFocus={() => keyword && setShowSearchDropdown(true)}
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchButton}> 
              <img src="/images/9679136.png" alt="search"/>
            </button>
          </form>

          {/* Dropdown */}
          {showSearchDropdown && results.length > 0 && (
            <div className={styles.searchDropdown}>
              {results.map((product) => (
                <Link
                  key={product._id}
                  to={`/product/${product._id}`}
                  className={styles.searchItem}
                  onClick={() => {
                    setKeyword('');
                    setShowSearchDropdown(false);
                  }}
                >
                  <img src={product.images[0].url} alt={product.name} className={styles.searchItemImg} />
                  <div className={styles.searchItemInfo}>
                    <span className={styles.searchItemName}>{product.name}</span>
                    <span className={styles.searchItemPrice}>${product.price.toFixed(2)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className={styles['header-nav']}>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><a href="#contact" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>Contact Us</a></li>
            <li><Link to="/cart">Cart</Link></li>

            {userInfo ? (
              <li className={`${styles['header-dropdown']} ${dropdownOpen ? styles.open : ''}`}>
                <button onClick={toggleDropdown} className={styles['header-dropdown-toggle']}>
                  {userInfo.name} <span style={{ marginLeft: '5px' }}>▼</span>
                </button>
                <div className={styles['header-dropdown-menu']}>
                  <Link to="/profile" onClick={() => setDropdownOpen(false)}>Profile</Link>
                  <Link to="/orders/me" onClick={() => setDropdownOpen(false)}>Orders</Link>
                  <button onClick={logoutHandler}>Logout</button>
                </div>
              </li>
            ) : (
              <li><Link to="/login">Login</Link></li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;

