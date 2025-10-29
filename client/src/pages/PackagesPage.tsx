import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api, { getErrorMessage } from '../services/api';

interface SubmissionPackage {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: 'draft' | 'submitted' | 'archived';
  created_at: string;
  updated_at: string;
  submitted_at?: string;
}

interface PackagesResponse {
  packages: SubmissionPackage[];
  counts: {
    draft: number;
    submitted: number;
    archived: number;
    total: number;
  };
}

export default function PackagesPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [packages, setPackages] = useState<SubmissionPackage[]>([]);
  const [counts, setCounts] = useState({ draft: 0, submitted: 0, archived: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'submitted' | 'archived'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPackage, setNewPackage] = useState({ title: '', description: '' });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<{ success: boolean; data: PackagesResponse }>('/packages');
      if (response.data.success) {
        setPackages(response.data.data.packages);
        setCounts(response.data.data.counts);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPackage.title.trim()) return;

    setIsCreating(true);
    try {
      const response = await api.post('/packages', newPackage);
      if (response.data.success) {
        setShowCreateModal(false);
        setNewPackage({ title: '', description: '' });
        await loadPackages();
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeletePackage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return;

    try {
      await api.delete(`/packages/${id}`);
      await loadPackages();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const filteredPackages = filterStatus === 'all'
    ? packages
    : packages.filter(pkg => pkg.status === filterStatus);

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      submitted: 'bg-blue-100 text-blue-800',
      archived: 'bg-green-100 text-green-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

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
              {user?.username}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Create Package Button - Prominent */}
        <div className="mb-6">
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white text-base font-semibold rounded-lg hover:bg-blue-700 shadow-lg"
          >
            + Create New Package
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Total Packages</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{counts.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Drafts</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{counts.draft}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Submitted</div>
            <div className="mt-2 text-3xl font-bold text-blue-600">{counts.submitted}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Archived</div>
            <div className="mt-2 text-3xl font-bold text-green-600">{counts.archived}</div>
          </div>
        </div>

        {/* Actions and Filters */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  filterStatus === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('draft')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  filterStatus === 'draft'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Drafts
              </button>
              <button
                onClick={() => setFilterStatus('submitted')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  filterStatus === 'submitted'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Submitted
              </button>
              <button
                onClick={() => setFilterStatus('archived')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  filterStatus === 'archived'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Archived
              </button>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700"
            >
              + New Package
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Packages List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-gray-500">Loading packages...</div>
          ) : filteredPackages.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No packages found. Create your first package to get started!
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPackages.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{pkg.title}</div>
                      {pkg.description && (
                        <div className="text-sm text-gray-500">{pkg.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(pkg.status)}`}>
                        {pkg.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(pkg.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(pkg.updated_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => navigate(`/packages/${pkg.id}`)}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDeletePackage(pkg.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Create Package Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg mx-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Create New Package</h3>
            <form onSubmit={handleCreatePackage}>
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={newPackage.title}
                  onChange={(e) => setNewPackage({ ...newPackage, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              <div className="mb-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={newPackage.description}
                  onChange={(e) => setNewPackage({ ...newPackage, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewPackage({ title: '', description: '' });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {isCreating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
