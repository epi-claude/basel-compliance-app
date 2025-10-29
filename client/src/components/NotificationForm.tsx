import React, { useState, useEffect, useRef } from 'react';
import api, { getErrorMessage } from '../services/api';

interface NotificationFormProps {
  packageId: string;
}

interface BaselNotification {
  id: string;
  submission_package_id: string;
  status: 'draft' | 'submitted' | 'archived';
  progress_percentage: number;
  [key: string]: any; // For all the Basel form fields
}

export default function NotificationForm({ packageId }: NotificationFormProps) {
  const [notification, setNotification] = useState<BaselNotification | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState(1);
  const autoSaveTimerRef = useRef<NodeJS.Timeout>();
  const formDataRef = useRef<Partial<BaselNotification>>({});

  // Load notification
  useEffect(() => {
    loadNotification();
  }, [packageId]);

  // Auto-save on blur and timer
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  const loadNotification = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/notifications/package/${packageId}`);
      if (response.data.success) {
        setNotification(response.data.data);
        formDataRef.current = response.data.data;
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    if (!notification) return;

    // Update local state immediately
    const updated = { ...notification, [fieldName]: value };
    setNotification(updated);
    formDataRef.current = { ...formDataRef.current, [fieldName]: value };

    // Debounce auto-save
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      autoSave();
    }, 2000); // Save after 2 seconds of inactivity
  };

  const handleFieldBlur = () => {
    // Save immediately on blur
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    autoSave();
  };

  const autoSave = async () => {
    if (!notification) return;

    try {
      setIsSaving(true);
      await api.patch(`/notifications/${notification.id}/autosave`, formDataRef.current);
      setLastSaved(new Date());
    } catch (err) {
      console.error('Auto-save failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const renderTextField = (fieldName: string, label: string, section: number) => {
    if (activeSection !== section) return null;

    return (
      <div key={fieldName} className="mb-4">
        <label htmlFor={fieldName} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <input
          type="text"
          id={fieldName}
          value={notification?.[fieldName] || ''}
          onChange={(e) => handleFieldChange(fieldName, e.target.value)}
          onBlur={handleFieldBlur}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        />
      </div>
    );
  };

  const renderTextArea = (fieldName: string, label: string, section: number) => {
    if (activeSection !== section) return null;

    return (
      <div key={fieldName} className="mb-4">
        <label htmlFor={fieldName} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <textarea
          id={fieldName}
          rows={3}
          value={notification?.[fieldName] || ''}
          onChange={(e) => handleFieldChange(fieldName, e.target.value)}
          onBlur={handleFieldBlur}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        />
      </div>
    );
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading form...</div>;
  }

  if (error || !notification) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error || 'Failed to load notification'}
      </div>
    );
  }

  const sections = [
    { number: 1, title: 'Exporter/Notifier' },
    { number: 2, title: 'Importer/Consignee' },
    { number: 3, title: 'Disposal Operations/Facility' },
    { number: 4, title: 'Carrier Information' },
    { number: 5, title: 'Waste Producers' },
    { number: 6, title: 'Waste Details' },
    { number: 7, title: 'Waste Classification' },
    { number: 8, title: 'Physical Characteristics' },
    { number: 9, title: 'Waste Identification' },
    { number: 10, title: 'Intended Disposal' },
    { number: 11, title: 'Packaging Type' },
    { number: 12, title: 'Quantity Information' },
    { number: 13, title: 'Shipment Dates' },
    { number: 14, title: 'Means of Transport' },
    { number: 15, title: 'Customs Offices' },
    { number: 16, title: 'Special Handling' },
    { number: 17, title: 'Declarations' },
    { number: 18, title: 'Attachments' },
  ];

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Progress Bar */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Basel Notification Form</h2>
            <p className="text-sm text-gray-600">
              Progress: {notification.progress_percentage}% complete
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {isSaving ? (
              <span className="text-blue-600">Saving...</span>
            ) : lastSaved ? (
              <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
            ) : null}
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${notification.progress_percentage}%` }}
          />
        </div>
      </div>

      <div className="flex">
        {/* Section Navigation */}
        <div className="w-64 border-r border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Sections</h3>
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.number}
                onClick={() => setActiveSection(section.number)}
                className={`w-full text-left px-3 py-2 text-sm rounded-md ${
                  activeSection === section.number
                    ? 'bg-primary-100 text-primary-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {section.number}. {section.title}
              </button>
            ))}
          </nav>
        </div>

        {/* Form Content */}
        <div className="flex-1 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            {sections.find(s => s.number === activeSection)?.title}
          </h3>

          {/* Section 1: Exporter/Notifier (7 fields) */}
          {activeSection === 1 && (
            <div>
              {renderTextField('1_exporter_notifier_registration_no', '1. Registration Number', 1)}
              {renderTextField('1_exporter_notifier_name', '2. Name', 1)}
              {renderTextArea('1_exporter_notifier_address', '3. Address', 1)}
              {renderTextField('1_exporter_notifier_contact_person', '4. Contact Person', 1)}
              {renderTextField('1_exporter_notifier_tel', '5. Telephone', 1)}
              {renderTextField('1_exporter_notifier_fax', '6. Fax', 1)}
              {renderTextField('1_exporter_notifier_email', '7. Email', 1)}
            </div>
          )}

          {/* Section 2: Importer/Consignee (7 fields) */}
          {activeSection === 2 && (
            <div>
              {renderTextField('2_importer_registration_no', '1. Registration Number', 2)}
              {renderTextField('2_importer_name', '2. Name', 2)}
              {renderTextArea('2_importer_address', '3. Address', 2)}
              {renderTextField('2_importer_contact_person', '4. Contact Person', 2)}
              {renderTextField('2_importer_tel', '5. Telephone', 2)}
              {renderTextField('2_importer_fax', '6. Fax', 2)}
              {renderTextField('2_importer_email', '7. Email', 2)}
            </div>
          )}

          {/* Section 3: Disposal Operations/Facility (7 fields) */}
          {activeSection === 3 && (
            <div>
              {renderTextField('3_disposal_facility_registration_no', '1. Registration Number', 3)}
              {renderTextField('3_disposal_facility_name', '2. Facility Name', 3)}
              {renderTextArea('3_disposal_facility_address', '3. Address', 3)}
              {renderTextField('3_disposal_facility_contact_person', '4. Contact Person', 3)}
              {renderTextField('3_disposal_facility_tel', '5. Telephone', 3)}
              {renderTextField('3_disposal_facility_fax', '6. Fax', 3)}
              {renderTextField('3_disposal_facility_email', '7. Email', 3)}
            </div>
          )}

          {/* Placeholder for other sections - will add more fields */}
          {activeSection > 3 && activeSection <= 18 && (
            <div className="text-gray-500 italic">
              Section {activeSection} fields will be added here...
              <br />
              <span className="text-sm">(This section contains additional Basel form fields)</span>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => setActiveSection(Math.max(1, activeSection - 1))}
              disabled={activeSection === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <button
              onClick={() => setActiveSection(Math.min(18, activeSection + 1))}
              disabled={activeSection === 18}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
