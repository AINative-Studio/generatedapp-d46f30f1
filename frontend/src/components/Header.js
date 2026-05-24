import React from 'react';

const Header = ({ title, user, onLogout }) => {
  return (
    <header className="header" data-testid="app-header">
      <div className="header-content">
        <h1 data-testid="app-title">{title}</h1>
        {user && (
          <div className="user-menu" data-testid="user-menu">
            <span data-testid="username">Welcome, {user.name}!</span>
            <button 
              onClick={onLogout} 
              className="logout-btn"
              data-testid="logout-button"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
