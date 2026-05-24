import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from '../components/Dashboard';

// Mock fetch globally
global.fetch = jest.fn();

describe('Dashboard Component', () => {
  const mockTasks = [
    { id: 1, title: 'Task 1', description: 'Description 1', status: 'pending' },
    { id: 2, title: 'Task 2', description: 'Description 2', status: 'completed' }
  ];

  const mockAnalytics = {
    totalTasks: 10,
    completedTasks: 7,
    pendingTasks: 3,
    teamMembers: 5
  };

  beforeEach(() => {
    fetch.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders dashboard container with correct testid', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ tasks: mockTasks, analytics: mockAnalytics })
    });

    render(<Dashboard />);

    const dashboardContainer = screen.getByTestId('dashboard-container');
    expect(dashboardContainer).toBeInTheDocument();
  });

  test('displays loading state initially', async () => {
    fetch.mockImplementationOnce(() =>
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ tasks: mockTasks, analytics: mockAnalytics })
      }), 1000))
    );

    render(<Dashboard />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('fetches and displays tasks and analytics on mount', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ tasks: mockTasks, analytics: mockAnalytics })
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
      expect(screen.getByText('Total Tasks: 10')).toBeInTheDocument();
    });
  });

  test('handles API error gracefully', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Error loading dashboard data')).toBeInTheDocument();
    });
  });

  test('handles user interaction to add new task', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ tasks: mockTasks, analytics: mockAnalytics })
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    const addTaskButton = screen.getByRole('button', { name: /add task/i });
    
    // Mock the new task response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        tasks: [...mockTasks, { id: 3, title: 'New Task', description: 'New Description', status: 'pending' }],
        analytics: { ...mockAnalytics, totalTasks: 11 }
      })
    });

    await user.click(addTaskButton);
    
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  test('passes accessibility checks', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ tasks: mockTasks, analytics: mockAnalytics })
    });

    const { container } = render(<Dashboard />);
    
    expect(container).toHaveAccessibleName(/dashboard/i);
    expect(screen.getByTestId('dashboard-container')).toBeVisible();
  });
});