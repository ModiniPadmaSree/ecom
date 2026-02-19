import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loader from '../components/Loader';
import Message from '../components/Message';
import styles from './ProductPage.module.css';
const API = process.env.REACT_APP_API_URL;
const ProductPage = () => {
  const { id } = useParams();
  const [reviews, setReviews] = useState([]);
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      try {
        setLoading(true);

        // Fetch product details
        const { data: productData } = await axios.get(`${API}/api/v1/product/${id}`);
        setProduct(productData.product);

        // Fetch product reviews
        const { data: reviewsData } = await axios.get(`${API}/api/reviews/${id}`);
        setReviews(reviewsData);

        setLoading(false);
      } catch (err) {
        setError(
          err.response && err.response.data.message
            ? err.response.data.message
            : err.message
        );
        setLoading(false);
      }
    };

    fetchProductAndReviews();
  }, [id]);

  const addToCartHandler = () => {
    navigate(`/cart/${id}?qty=${qty}`);
  };

  return (
    <div className={styles.wrapper}>
      <Link to="/" className={styles.backLink}>
        &larr; Go Back
      </Link>
      {loading ? (
        <Loader />
      ) : error ? (
        <Message type="error">{error}</Message>
      ) : (
        <div className={styles.container}>
          <div className={styles.imageWrapper}>
            <img src={product.images[0].url} alt={product.name} />
          </div>
          <div className={styles.details}>
            <div>
              <h1 className={styles.title}>{product.name}</h1>
              <p className={styles.description}>{product.description}</p>
              <div className={styles.price}>${product.price.toFixed(2)}</div>
              <div className={styles.rating}>
                <span>{'⭐'.repeat(Math.round(product.ratings))}</span>
                <span>({product.numOfReviews} reviews)</span>
              </div>
              <p
                className={`${styles.stock} ${
                  product.stock > 0 ? styles.inStock : styles.outOfStock
                }`}
              >
                Status: {product.stock > 0 ? 'In Stock' : 'Out Of Stock'} ({product.stock})
              </p>
            </div>
            {product.stock > 0 && (
              <div className={styles.qtyWrapper}>
                <label htmlFor="qty-select" className={styles.qtyLabel}>
                  Qty:
                </label>
                <select
                  id="qty-select"
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className={styles.qtySelect}
                >
                  {[...Array(product.stock).keys()].map((x) => (
                    <option key={x + 1} value={x + 1}>
                      {x + 1}
                    </option>
                  ))}
                </select>
                <button
                  onClick={addToCartHandler}
                  className={styles.addToCartBtn}
                  disabled={product.stock === 0}
                >
                  Add To Cart
                </button>
              </div>
            )}

            {/* ✅ Review Display Section */}
            {reviews.length > 0 ? (
              <div className={styles.reviewsSection}>
                <h2>Customer Reviews</h2>
                {reviews.map((review) => (
                  <div key={review._id} className={styles.reviewCard}>
                    <p className={styles.reviewRating}>
                      {'⭐'.repeat(review.rating)} ({review.rating})
                    </p>
                    <p className={styles.reviewComment}>{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.noReviews}>No reviews yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;
