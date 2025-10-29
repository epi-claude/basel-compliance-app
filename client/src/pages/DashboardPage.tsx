import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Basel Compliance App
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Welcome, <span className="font-medium">{user?.username}</span>
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Dashboard
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* User Info Card */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">User Information</h3>
              <dl className="space-y-1 text-sm">
                <div>
                  <dt className="text-gray-500">Username:</dt>
                  <dd className="text-gray-900">{user?.username}</dd>
                </div>
                {user?.email && (
                  <div>
                    <dt className="text-gray-500">Email:</dt>
                    <dd className="text-gray-900">{user.email}</dd>
                  </div>
                )}
                {user?.full_name && (
                  <div>
                    <dt className="text-gray-500">Full Name:</dt>
                    <dd className="text-gray-900">{user.full_name}</dd>
                  </div>
                )}
                {user?.organization && (
                  <div>
                    <dt className="text-gray-500">Organization:</dt>
                    <dd className="text-gray-900">{user.organization}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-gray-500">Role:</dt>
                  <dd className="text-gray-900">{user?.role}</dd>
                </div>
              </dl>
            </div>

            {/* Quick Actions Card */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 text-sm bg-primary-50 text-primary-700 rounded hover:bg-primary-100">
                  Create New Notification
                </button>
                <button className="w-full text-left px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded hover:bg-gray-100">
                  View Submissions
                </button>
                <button className="w-full text-left px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded hover:bg-gray-100">
                  Upload Documents
                </button>
              </div>
            </div>

            {/* Status Card */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Draft Notifications:</span>
                  <span className="font-medium text-gray-900">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Submitted:</span>
                  <span className="font-medium text-gray-900">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Archived:</span>
                  <span className="font-medium text-gray-900">0</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Getting Started</h3>
            <p className="text-sm text-blue-700">
              Welcome to the Basel Compliance App! This application helps you manage Basel Convention
              hazardous waste notification submissions. Start by creating a new notification package.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
