import React, { useState, useEffect, useCallback } from 'react';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTask, setNewTask] = useState({ title: '', description: '', assignee: '' });
  const [tasks, setTasks] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [projectMembers, setProjectMembers] = useState([]);

  const projectId = localStorage.getItem('project_id') || 'default-project';

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('ainative_token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(
        `https://api.ainative.studio/api/v1/projects/${projectId}/database/tables/dashboards/query`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setDashboardData(data);
      
      // Extract tasks, analytics, and members from response
      setTasks(data.tasks || []);
      setAnalytics(data.analytics || {});
      setProjectMembers(data.members || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    try {
      const token = localStorage.getItem('ainative_token');
      const response = await fetch(
        `https://api.ainative.studio/api/v1/projects/${projectId}/database/tables/tasks`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...newTask,
            project_id: projectId,
            status: 'pending',
            created_at: new Date().toISOString()
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const createdTask = await response.json();
      setTasks(prev => [...prev, createdTask]);
      setNewTask({ title: '', description: '', assignee: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTaskUpdate = async (taskId, updates) => {
    try {
      const token = localStorage.getItem('ainative_token');
      const response = await fetch(
        `https://api.ainative.studio/api/v1/projects/${projectId}/database/tables/tasks/${taskId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updates)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const updatedTask = await response.json();
      setTasks(prev => prev.map(task => task.id === taskId ? updatedTask : task));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTaskDelete = async (taskId) => {
    try {
      const token = localStorage.getItem('ainative_token');
      const response = await fetch(
        `https://api.ainative.studio/api/v1/projects/${projectId}/database/tables/tasks/${taskId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRetry = () => {
    fetchData();
  };

  if (loading) {
    return (
      <div data-testid="dashboard-container" className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div data-testid="dashboard-container" className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="dashboard-container" className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Welcome back!</span>
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
              U
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Total Tasks</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{analytics.totalTasks || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Completed</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{analytics.completedTasks || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">In Progress</h3>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{analytics.inProgressTasks || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">{projectMembers.length || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Task Creation Form */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Task</h2>
              <form onSubmit={handleTaskSubmit} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Task title"
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Task description"
                  />
                </div>
                <div>
                  <label htmlFor="assignee" className="block text-sm font-medium text-gray-700">
                    Assignee
                  </label>
                  <select
                    id="assignee"
                    value={newTask.assignee}
                    onChange={(e) => setNewTask({...newTask, assignee: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select assignee</option>
                    {projectMembers.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Create Task
                </button>
              </form>
            </div>

            {/* Team Members */}
            <div className="bg-white p-6 rounded-lg shadow mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Team Members</h2>
              <ul className="space-y-3">
                {projectMembers.map(member => (
                  <li key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-semibold mr-3">
                        {member.name.charAt(0)}
                      </div>
                      <span className="font-medium">{member.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">{member.role}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Task List */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Active Tasks</h2>
                <span className="text-sm text-gray-500">{tasks.length} tasks</span>
              </div>
              
              <div className="space-y-4">
                {tasks.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No tasks available</p>
                  </div>
                ) : (
                  tasks.map(task => (
                    <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between">
                        <h3 className="font-medium text-gray-900">{task.title}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          task.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : task.status === 'in_progress' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-2 text-sm">{task.description}</p>
                      <div className="mt-3 flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          Assigned to: {task.assignee || 'Unassigned'}
                        </span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleTaskUpdate(task.id, { status: 'completed' })}
                            className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => handleTaskUpdate(task.id, { status: 'in_progress' })}
                            className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                          >
                            In Progress
                          </button>
                          <button
                            onClick={() => handleTaskDelete(task.id)}
                            className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Analytics Section */}
            <div className="bg-white p-6 rounded-lg shadow mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Task Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Task Distribution</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="w-32 text-sm text-gray-600">Pending</div>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500" 
                          style={{ width: `${(analytics.pendingTasks / Math.max(analytics.totalTasks, 1)) * 100}%` }}
                        ></div>
                      </div>
                      <div className="w-10 text-right text-sm text-gray-600">
                        {analytics.pendingTasks || 0}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-32 text-sm text-gray-600">In Progress</div>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-500" 
                          style={{ width: `${(analytics.inProgressTasks / Math.max(analytics.totalTasks, 1)) * 100}%` }}
                        ></div>
                      </div>
                      <div className="w-10 text-right text-sm text-gray-600">
                        {analytics.inProgressTasks || 0}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-32 text-sm text-gray-600">Completed</div>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500" 
                          style={{ width: `${(analytics.completedTasks / Math.max(analytics.totalTasks, 1)) * 100}%` }}
                        ></div>
                      </div>
                      <div className="w-10 text-right text-sm text-gray-600">
                        {analytics.completedTasks || 0}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Recent Activity</h3>
                  <ul className="space-y-2">
                    <li className="text-sm text-gray-600">
                      <span className="font-medium">John Doe</span> completed task "Design Homepage"
                    </li>
                    <li className="text-sm text-gray-600">
                      <span className="font-medium">Jane Smith</span> assigned task "API Integration" to you
                    </li>
                    <li className="text-sm text-gray-600">
                      <span className="font-medium">Mike Johnson</span> started working on "User Testing"
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;