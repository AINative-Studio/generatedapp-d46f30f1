import React from 'react';

const Loading = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-container" data-testid="loading-spinner">
      <div className="spinner" data-testid="spinner"></div>
      <p data-testid="loading-message">{message}</p>
    </div>
  );
};

export default Loading;
