import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import './styles.css';

/**
 * AdminPanel Component
 * Feature: admin_panel
 * Refactored for better performance and maintainability
 */
const AdminPanel = ({ initialState = null, onAction = null }) => {
  const [state, setState] = useState(initialState);

  const handleClick = useCallback(() => {
    setState('active');
    onAction?.('clicked');
  }, [onAction]);

  return (
    <div
      data-testid="admin_panel-container"
      className="admin_panel-component"
      aria-label="Admin Panel"
    >
      <h2>Admin Panel</h2>
      <button
        onClick={handleClick}
        role="button"
        aria-pressed={state === 'active'}
      >
        Action
      </button>
    </div>
  );
};

AdminPanel.propTypes = {
  initialState: PropTypes.string,
  onAction: PropTypes.func,
};

export default React.memo(AdminPanel);
