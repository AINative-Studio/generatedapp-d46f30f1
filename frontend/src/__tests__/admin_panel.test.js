import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminPanel from '../components/AdminPanel';

// Mock fetch globally
global.fetch = jest.fn();

describe('AdminPanel', () => {
  const mockUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user' }
  ];

  const mockAnalytics = {
    totalTasks: 150,
    completedTasks: 120,
    activeUsers: 25,
    pendingInvitations: 3
  };

  beforeEach(() => {
    fetch.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders admin panel container with correct testid', () => {
    render(<AdminPanel />);
    
    const container = screen.getByTestId('admin_panel-container');
    expect(container).toBeInTheDocument();
  });

  test('displays loading state initially', () => {
    render(<AdminPanel />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('loads and displays users and analytics data successfully', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/users')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUsers)
        });
      }
      if (url.includes('/analytics')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockAnalytics)
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    render(<AdminPanel />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Total Tasks: 150')).toBeInTheDocument();
      expect(screen.getByText('Completed Tasks: 120')).toBeInTheDocument();
      expect(screen.getByText('Active Users: 25')).toBeInTheDocument();
      expect(screen.getByText('Pending Invitations: 3')).toBeInTheDocument();
    });
  });

  test('handles API error gracefully', async () => {
    fetch.mockImplementation(() => 
      Promise.reject(new Error('Network error'))
    );

    render(<AdminPanel />);
    
    await waitFor(() => {
      expect(screen.getByText('Error loading data')).toBeInTheDocument();
    });
  });

  test('handles user interaction for adding new user', async () => {
    const user = userEvent.setup();
    
    fetch.mockImplementation((url) => {
      if (url.includes('/users')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([...mockUsers, { id: 3, name: 'New User', email: 'new@example.com', role: 'user' }])
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAnalytics)
      });
    });

    render(<AdminPanel />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Simulate form submission
    const addButton = screen.getByRole('button', { name: /add user/i });
    await user.click(addButton);
    
    expect(fetch).toHaveBeenCalledWith(
      'https://api.ainative.studio/api/v1/users',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'X-API-Key': expect.any(String)
        })
      })
    );
  });

  test('has proper accessibility attributes', () => {
    render(<AdminPanel />);
    
    const container = screen.getByTestId('admin_panel-container');
    expect(container).toHaveAttribute('role', 'main');
    expect(container).toHaveAttribute('aria-label', 'Admin Panel');
  });
});