// client/src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { Link } from 'react-router-dom';
import styles from './HomePage.module.css'; 

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('/api/v1/products');
        setProducts(data.products);
        console.log("Fetched Products:", data.products); // Keep this for debugging
        setLoading(false);
      } catch (err) {
        setError(err.response && err.response.data.message
          ? err.response.data.message
          : err.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Data for categories
  const categories = [
    { name: 'Electronics', imageUrl: 'https://feeds.abplive.com/onecms/images/uploaded-images/2022/10/30/9cabeacaf13ae35cef67a86a6f8b2fb51667143402677460_original.jpg' },
    { name: 'Fashion', imageUrl: 'https://i.pinimg.com/736x/69/ed/a7/69eda752e21e8fd1356c111bf4a37cec.jpg'},
    { name: 'Home Appliances', imageUrl: 'https://www.idfcfirstbank.com/content/dam/idfcfirstbank/images/blog/credit-card/smart-home-appliances-save-time-717x404.jpg' },
    { name: 'Gaming', imageUrl: 'https://i0.wp.com/newdigitalage.co/wp-content/uploads/2022/06/iStock-1334436084-jpg.webp?fit=1024%2C683&ssl=1' },
    
    { name: 'Sports', imageUrl: 'https://www.silicon.co.uk/wp-content/uploads/2015/12/sports.jpg' },
  ];

  // Data for "Why Choose Us" features
  const features = [
    { icon: '🚚', title: 'Fast & Free Shipping', description: 'Enjoy quick delivery on all orders, with free shipping options available.' },
    { icon: '⭐', title: 'Top-Rated Products', description: 'Browse a curated selection of high-quality, customer-favorite items.' },
    { icon: '🔒', title: 'Secure Payments', description: 'Shop with confidence using our encrypted and secure payment gateway.' },
    { icon: '📞', title: '24/7 Customer Support', description: 'Our dedicated team is always here to help with any questions or issues.' },
  ];

  return (
    <div className={styles.wrapper}> {/* Original wrapper class, now using styles */}

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Discover Your Next Favorite Product</h1>
          <p className={styles.heroSubtitle}>Shop the latest trends and essential items for every need.</p>
          <Link to="/products" className={styles.heroButton}>
            Shop All Products
          </Link>
        </div>
      </section>

      {/* Featured Categories Section */}
      <section className={`${styles.categoriesSection} ${styles.sectionContainer}`}>
        <h2 className={styles.sectionTitle}>Explore Top Categories</h2>
        <div className={styles.categoryGrid}>
          {categories.map((category, index) => (
            <Link to={`/products?category=${category.name}`} key={index} className={styles.categoryCard}>
              <img src={category.imageUrl} alt={category.name} className={styles.categoryImage} />
              <h3 className={styles.categoryName}>{category.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Why Choose Us Section (NEW) */}
      <section className={`${styles.whyChooseUsSection} ${styles.sectionContainer}`}>
        <h2 className={styles.sectionTitle}>Why Choose Us?</h2>
        <div className={styles.whyChooseUsGrid}>
          {features.map((feature, index) => (
            <div key={index} className={styles.featureCard}>
              <div className={styles.featureIcon}>{feature.icon}</div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Products Section (Your existing content) */}
      <section className={`${styles.productsSection} ${styles.sectionContainer}`}>
        <h2 className={styles.sectionTitle}>Our Products</h2>
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
                    src={product.images && product.images.length > 0 ? product.images[0].url : 'https://placehold.co/400x300/cccccc/ffffff?text=No+Image'}
                    alt={product.name}
                  />
                </Link>
                <div className={styles.cardContent}>
                  <Link to={`/product/${product._id}`}>
                    <h3 className={styles.productName}>{product.name}</h3>
                  </Link>
                  <p className={styles.productPrice}>${product.price.toFixed(2)}</p>
                  <div className={styles.productRating}>
                    <span className={styles.productStars}>{'⭐'.repeat(Math.round(product.ratings))}</span>
                    <span className={styles.productReviews}>({product.numOfReviews} reviews)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
