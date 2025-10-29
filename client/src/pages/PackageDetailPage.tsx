import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api, { getErrorMessage } from '../services/api';
import NotificationFormComplete from '../components/NotificationFormComplete';

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

export default function PackageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [pkg, setPkg] = useState<SubmissionPackage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPackage();
  }, [id]);

  const loadPackage = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/packages/${id}`);
      if (response.data.success) {
        setPkg(response.data.data);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={() => navigate('/packages')}
              className="text-primary-600 hover:text-primary-900"
            >
              ← Back to Packages
            </button>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error || 'Package not found'}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/packages')}
              className="text-primary-600 hover:text-primary-900"
            >
              ← Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{pkg.title}</h1>
              {pkg.description && (
                <p className="text-sm text-gray-600">{pkg.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.username}</span>
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
        <NotificationFormComplete packageId={pkg.id} />
      </main>
    </div>
  );
}
