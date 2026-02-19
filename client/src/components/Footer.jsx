import React from 'react';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer id="contact" className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.section}>
          <h3>About NexMart</h3>
          <p>Your trusted online store for electronics, fashion, home essentials, and more.</p>
        </div>

        <div className={styles.section}>
          <h3>Quick Links</h3>
          <ul className={styles.linkList}>
            <li><a href="/about">About Us</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/terms">Terms & Conditions</a></li>
          </ul>
        </div>

        <div className={styles.section}>
          <h3>Contact</h3>
          <p>Email: support@nexmart.com</p>
          <p>Phone: +91 98765 43210</p>
        </div>

        <div className={styles.section}>
          <h3>Follow Us</h3>
          <div className={styles.socialIcons}>
            {/* Placeholder icons - you can use react-icons or images */}
            <a href="#"><img src="/images/download.jpg" alt="facebook"/></a>
            <a href="#"><img src="/images/twitter.png" alt="Twitter" /></a>
            <a href="#"><img src="/images/ins.jpg" alt="Instagram" /></a>
          </div>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <p>&copy; {new Date().getFullYear()} NexMart. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
