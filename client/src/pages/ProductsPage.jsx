import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { Link } from 'react-router-dom';
import styles from './ProductsPage.module.css'; // Create this CSS module

const ProductsPage = () => {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract category from query string:
  const categoryParams = new URLSearchParams(location.search);
  const category = categoryParams.get('category');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let endpoint = '/api/v1/products';
        if (category) {
          endpoint += `?category=${encodeURIComponent(category)}`;
        }
        const { data } = await axios.get(endpoint);
        setProducts(data.products);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category]);

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>
        {category ? `Products in "${category}"` : 'All Products'}
      </h1>
      {loading ? (
        <Loader />
      ) : error ? (
        <Message type="error">{error}</Message>
      ) : (
        <div className={styles.grid}>
          {products.map((product) => (
            <div key={product._id} className={styles.card}>
              <Link to={`/product/${product._id}`}>
                <img
                  src={product.images?.[0]?.url || 'https://placehold.co/400x300?text=No+Image'}
                  alt={product.name}
                  className={styles.productImage}
                />
              </Link>
              <div className={styles.cardContent}>
                <h3 className={styles.productName}>{product.name}</h3>
                <p className={styles.productPrice}>${product.price.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
