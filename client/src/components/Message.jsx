import React from 'react';
import styles from './Message.module.css';

const Message = ({ type = 'info', children }) => {
  const classNames = `${styles.message} ${styles[type] || styles.info}`;

  return (
    <div className={classNames} role="alert">
      {children}
    </div>
  );
};

export default Message;
