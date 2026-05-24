import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AINativeProvider } from '@ainative/react-sdk';

// Import feature components
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import LoginPage from './components/LoginPage';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check authentication status on app load
  useEffect(() => {
    const token = localStorage.getItem('ainative_token');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('https://api.ainative.studio/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      localStorage.setItem('ainative_token', data.access_token);
      setIsAuthenticated(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ainative_token');
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <AINativeProvider apiKey={process.env.REACT_APP_AINATIVE_API_KEY || ''}>
      <Router>
        <div className="min-h-screen bg-gray-900 text-white">
          {/* Navigation Bar */}
          <nav className="bg-gray-800 border-b border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <div className="flex-shrink-0 flex items-center">
                    <span className="text-xl font-bold text-blue-400">GeneratedApp</span>
                  </div>
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                    <NavigationLink to="/dashboard" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                      Dashboard
                    </NavigationLink>
                    <NavigationLink to="/admin" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                      Admin Panel
                    </NavigationLink>
                  </div>
                </div>
                <div className="flex items-center">
                  {isAuthenticated && (
                    <button
                      onClick={handleLogout}
                      className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600"
                    >
                      Logout
                    </button>
                  )}
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main>
            <Routes>
              <Route 
                path="/login" 
                element={
                  <LoginPage 
                    onLogin={handleLogin} 
                    error={error}
                    loading={loading}
                  />
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />
                } 
              />
              <Route 
                path="/admin" 
                element={
                  isAuthenticated ? <AdminPanel /> : <Navigate to="/login" replace />
                } 
              />
              <Route 
                path="/" 
                element={<Navigate to="/dashboard" replace />} 
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AINativeProvider>
  );
};

// Navigation Link Component
const NavigationLink = ({ to, children, className }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (e) => {
    e.preventDefault();
    navigate(to);
  };

  const isActive = location.pathname === to;

  return (
    <a
      href={to}
      onClick={handleClick}
      className={`${className} ${isActive ? 'text-white bg-gray-900' : ''}`}
    >
      {children}
    </a>
  );
};

export default App;