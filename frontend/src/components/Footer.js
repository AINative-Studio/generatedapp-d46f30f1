import React from 'react';

const Footer = () => {
  return (
    <footer className="footer" data-testid="app-footer">
      <div className="footer-content">
        <p data-testid="footer-text">
          © {new Date().getFullYear()} All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
