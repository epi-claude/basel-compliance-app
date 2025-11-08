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
  [key: string]: any;
}

export default function NotificationFormComplete({ packageId }: NotificationFormProps) {
  const [notification, setNotification] = useState<BaselNotification | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState(1);
  const autoSaveTimerRef = useRef<NodeJS.Timeout>();
  const formDataRef = useRef<Partial<BaselNotification>>({});

  useEffect(() => {
    loadNotification();
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [packageId]);

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

  const handleFieldChange = (fieldName: string, value: string | number) => {
    if (!notification) return;
    const updated = { ...notification, [fieldName]: value };
    setNotification(updated);
    formDataRef.current = { ...formDataRef.current, [fieldName]: value };

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => autoSave(), 2000);
  };

  const handleFieldBlur = () => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
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

  const handleLoadTestData = async () => {
    if (!notification) return;
    if (!confirm('This will overwrite all current data with test data. Continue?')) return;

    try {
      setIsSaving(true);
      const response = await api.post(`/notifications/${notification.id}/load-test-data`);
      if (response.data.success) {
        setNotification(response.data.data);
        formDataRef.current = response.data.data;
        setLastSaved(new Date());
        alert('Test data loaded successfully!');
        // Reload to show updated data
        await loadNotification();
      }
    } catch (err) {
      alert('Failed to load test data: ' + getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!notification) return;

    try {
      setIsGeneratingPDF(true);

      // Get the JWT token from localStorage
      const token = localStorage.getItem('basel_auth_token');

      // Use fetch to get the PDF as a blob
      const response = await fetch(`/api/notifications/${notification.id}/generate-pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate PDF');
      }

      // Get the PDF blob
      const blob = await response.blob();

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Basel_Notification_${notification.id}.pdf`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert('PDF generated successfully!');
    } catch (err) {
      alert('Failed to generate PDF: ' + getErrorMessage(err));
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleSubmit = async () => {
    if (!notification) return;

    const confirmMessage = `Are you sure you want to submit this notification?\n\nThis will mark the package as "submitted" and can no longer be edited.\n\nCurrent progress: ${notification.progress_percentage}%`;

    if (!confirm(confirmMessage)) return;

    try {
      setIsSaving(true);

      // Update notification status to submitted
      const response = await api.put(`/notifications/${notification.id}`, {
        status: 'submitted'
      });

      // Also update the package status
      await api.put(`/packages/${notification.submission_package_id}`, {
        status: 'submitted'
      });

      if (response.data.success) {
        alert('Notification submitted successfully!');
        // Redirect back to packages page
        window.location.href = '/packages';
      }
    } catch (err) {
      alert('Failed to submit notification: ' + getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const renderTextField = (fieldName: string, label: string) => (
    <div className="mb-4">
      <label htmlFor={fieldName} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type="text"
        id={fieldName}
        value={notification?.[fieldName] || ''}
        onChange={(e) => handleFieldChange(fieldName, e.target.value)}
        onBlur={handleFieldBlur}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
    </div>
  );

  const renderTextArea = (fieldName: string, label: string, rows = 3) => (
    <div className="mb-4">
      <label htmlFor={fieldName} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <textarea
        id={fieldName}
        rows={rows}
        value={notification?.[fieldName] || ''}
        onChange={(e) => handleFieldChange(fieldName, e.target.value)}
        onBlur={handleFieldBlur}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
    </div>
  );

  const renderNumberField = (fieldName: string, label: string, step = "1") => (
    <div className="mb-4">
      <label htmlFor={fieldName} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type="number"
        step={step}
        id={fieldName}
        value={notification?.[fieldName] || ''}
        onChange={(e) => handleFieldChange(fieldName, e.target.value ? parseFloat(e.target.value) : '')}
        onBlur={handleFieldBlur}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
    </div>
  );

  const renderCheckbox = (fieldName: string, label: string) => (
    <div className="mb-2 flex items-center">
      <input
        type="checkbox"
        id={fieldName}
        checked={!!notification?.[fieldName]}
        onChange={(e) => handleFieldChange(fieldName, e.target.checked ? 1 : 0)}
        onBlur={handleFieldBlur}
        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
      />
      <label htmlFor={fieldName} className="ml-2 block text-sm text-gray-700">
        {label}
      </label>
    </div>
  );

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
    { number: 3, title: 'Notification Details' },
    { number: 4, title: 'Total Intended Shipments' },
    { number: 5, title: 'Total Intended Quantity' },
    { number: 6, title: 'Intended Period' },
    { number: 7, title: 'Packaging Type' },
    { number: 8, title: 'Intended Carrier(s)' },
    { number: 9, title: 'Waste Generator(s)' },
    { number: 10, title: 'Disposal/Recovery Facility' },
    { number: 11, title: 'Disposal/Recovery Operations' },
    { number: 12, title: 'Waste Designation' },
    { number: 13, title: 'Physical Characteristics' },
    { number: 14, title: 'Waste Identification' },
    { number: 15, title: 'Countries/States Concerned' },
    { number: 16, title: 'Customs Offices' },
    { number: 17, title: 'Exporter\'s Declaration' },
    { number: 18, title: 'Annexes Attached' },
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
          <div className="flex items-center gap-4">
            <button
              onClick={handleLoadTestData}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Load Test Data
            </button>
            <button
              onClick={handleGeneratePDF}
              disabled={isGeneratingPDF}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingPDF ? 'Generating...' : 'Generate PDF'}
            </button>
            <div className="text-sm text-gray-500">
              {isSaving ? (
                <span className="text-blue-600">Saving...</span>
              ) : lastSaved ? (
                <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
              ) : null}
            </div>
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
        <div className="w-64 border-r border-gray-200 p-4 max-h-screen overflow-y-auto">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Sections</h3>
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.number}
                onClick={() => setActiveSection(section.number)}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
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
        <div className="flex-1 p-6 max-h-screen overflow-y-auto">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Section {activeSection}: {sections.find(s => s.number === activeSection)?.title}
          </h3>

          {/* Section 1: Exporter/Notifier */}
          {activeSection === 1 && (
            <div>
              {renderTextField('1_exporter_notifier_registration_no', 'Registration Number')}
              {renderTextField('1_exporter_notifier_name', 'Name')}
              {renderTextArea('1_exporter_notifier_address', 'Address')}
              {renderTextField('1_exporter_notifier_contact_person', 'Contact Person')}
              {renderTextField('1_exporter_notifier_tel', 'Telephone')}
              {renderTextField('1_exporter_notifier_fax', 'Fax')}
              {renderTextField('1_exporter_notifier_email', 'Email')}
            </div>
          )}

          {/* Section 2: Importer/Consignee */}
          {activeSection === 2 && (
            <div>
              {renderTextField('2_importer_consignee_registration_no', 'Registration Number')}
              {renderTextField('2_importer_consignee_name', 'Name')}
              {renderTextArea('2_importer_consignee_address', 'Address')}
              {renderTextField('2_importer_consignee_contact_person', 'Contact Person')}
              {renderTextField('2_importer_consignee_tel', 'Telephone')}
              {renderTextField('2_importer_consignee_fax', 'Fax')}
              {renderTextField('2_importer_consignee_email', 'Email')}
            </div>
          )}

          {/* Section 3: Notification Details */}
          {activeSection === 3 && (
            <div>
              {renderTextField('3_notification_details_notification_no', 'Notification Number')}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Shipment Type</label>
                {renderCheckbox('3_notification_details_individual_shipment', 'Individual Shipment')}
                {renderCheckbox('3_notification_details_multiple_shipments', 'Multiple Shipments')}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Operation Type</label>
                {renderCheckbox('3_notification_details_operation_type_disposal', 'Disposal')}
                {renderCheckbox('3_notification_details_operation_type_recovery', 'Recovery')}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Pre-consented Recovery Facility</label>
                {renderCheckbox('3_notification_details_pre_consented_recovery_facility_yes', 'Yes')}
                {renderCheckbox('3_notification_details_pre_consented_recovery_facility_no', 'No')}
              </div>
            </div>
          )}

          {/* Section 4: Total Intended Shipments */}
          {activeSection === 4 && (
            <div>
              {renderNumberField('4_total_intended_shipments_count', 'Total Number of Intended Shipments')}
            </div>
          )}

          {/* Section 5: Total Intended Quantity */}
          {activeSection === 5 && (
            <div>
              {renderNumberField('5_total_intended_quantity_tonnes', 'Total Quantity (Tonnes)', '0.01')}
              {renderNumberField('5_total_intended_quantity_m3', 'Total Quantity (Cubic Meters)', '0.01')}
            </div>
          )}

          {/* Section 6: Intended Period */}
          {activeSection === 6 && (
            <div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">First Departure Date</label>
                <div className="grid grid-cols-3 gap-4">
                  {renderTextField('6_intended_period_first_departure_month', 'Month')}
                  {renderTextField('6_intended_period_first_departure_day', 'Day')}
                  {renderTextField('6_intended_period_first_departure_year', 'Year')}
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Departure Date</label>
                <div className="grid grid-cols-3 gap-4">
                  {renderTextField('6_intended_period_last_departure_month', 'Month')}
                  {renderTextField('6_intended_period_last_departure_day', 'Day')}
                  {renderTextField('6_intended_period_last_departure_year', 'Year')}
                </div>
              </div>
            </div>
          )}

          {/* Section 7: Packaging Type */}
          {activeSection === 7 && (
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Packaging Types</label>
                {renderCheckbox('7_packaging_type_drum', 'Drum')}
                {renderCheckbox('7_packaging_type_wooden_barrel', 'Wooden Barrel')}
                {renderCheckbox('7_packaging_type_jerrican', 'Jerrican')}
                {renderCheckbox('7_packaging_type_box', 'Box')}
                {renderCheckbox('7_packaging_type_bag', 'Bag')}
                {renderCheckbox('7_packaging_type_composite_packaging', 'Composite Packaging')}
                {renderCheckbox('7_packaging_type_pressure_receptacle', 'Pressure Receptacle')}
                {renderCheckbox('7_packaging_type_bulk', 'Bulk')}
              </div>
              {renderTextField('7_packaging_type_other', 'Other Packaging Type (specify)')}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Special Handling Required?</label>
                {renderCheckbox('7_special_handling_yes', 'Yes')}
                {renderCheckbox('7_special_handling_no', 'No')}
              </div>
            </div>
          )}

          {/* Section 8: Intended Carrier(s) */}
          {activeSection === 8 && (
            <div>
              {renderTextField('8_intended_carrier_registration_no', 'Registration Number')}
              {renderTextField('8_intended_carrier_name', 'Name')}
              {renderTextArea('8_intended_carrier_address', 'Address')}
              {renderTextField('8_intended_carrier_contact_person', 'Contact Person')}
              {renderTextField('8_intended_carrier_tel', 'Telephone')}
              {renderTextField('8_intended_carrier_fax', 'Fax')}
              {renderTextField('8_intended_carrier_email', 'Email')}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Means of Transport</label>
                {renderCheckbox('8_intended_carrier_means_road', 'Road')}
                {renderCheckbox('8_intended_carrier_means_train', 'Train')}
                {renderCheckbox('8_intended_carrier_means_sea', 'Sea')}
                {renderCheckbox('8_intended_carrier_means_air', 'Air')}
                {renderCheckbox('8_intended_carrier_means_inland_waterways', 'Inland Waterways')}
              </div>
            </div>
          )}

          {/* Section 9: Waste Generator(s) */}
          {activeSection === 9 && (
            <div>
              {renderTextField('9_waste_generator_registration_no', 'Registration Number')}
              {renderTextField('9_waste_generator_name', 'Name')}
              {renderTextArea('9_waste_generator_address', 'Address')}
              {renderTextField('9_waste_generator_contact_person', 'Contact Person')}
              {renderTextField('9_waste_generator_tel', 'Telephone')}
              {renderTextField('9_waste_generator_fax', 'Fax')}
              {renderTextField('9_waste_generator_email', 'Email')}
              {renderTextArea('9_waste_generator_site_process_generation', 'Site of Process of Waste Generation')}
            </div>
          )}

          {/* Section 10: Disposal/Recovery Facility */}
          {activeSection === 10 && (
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Facility Type</label>
                {renderCheckbox('10_disposal_recovery_facility_type_disposal', 'Disposal')}
                {renderCheckbox('10_disposal_recovery_facility_type_recovery', 'Recovery')}
              </div>
              {renderTextField('10_disposal_recovery_facility_registration_no', 'Registration Number')}
              {renderTextField('10_disposal_recovery_facility_name', 'Name')}
              {renderTextArea('10_disposal_recovery_facility_address', 'Address')}
              {renderTextField('10_disposal_recovery_facility_contact_person', 'Contact Person')}
              {renderTextField('10_disposal_recovery_facility_tel', 'Telephone')}
              {renderTextField('10_disposal_recovery_facility_fax', 'Fax')}
              {renderTextField('10_disposal_recovery_facility_email', 'Email')}
              {renderTextArea('10_disposal_recovery_facility_actual_site', 'Actual Site of Disposal/Recovery')}
            </div>
          )}

          {/* Section 11: Disposal/Recovery Operations */}
          {activeSection === 11 && (
            <div>
              {renderTextField('11_disposal_recovery_operations_d_code_r_code', 'D-Code / R-Code')}
              {renderTextArea('11_disposal_recovery_operations_technology', 'Technology Employed')}
              {renderTextArea('11_disposal_recovery_operations_reason_export', 'Reason for Export')}
            </div>
          )}

          {/* Section 12: Waste Designation */}
          {activeSection === 12 && (
            <div>
              {renderTextArea('12_waste_designation', 'Designation and Composition of the Waste', 4)}
              {renderTextArea('12_waste_major_constituents_concentrations', 'Major Constituents and Concentrations', 4)}
              {renderTextArea('12_waste_hazardous_constituents_concentrations', 'Hazardous Constituents and Concentrations', 4)}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Chemical Analysis Available?</label>
                {renderCheckbox('12_waste_chemical_analysis_available_yes', 'Yes')}
                {renderCheckbox('12_waste_chemical_analysis_available_no', 'No')}
              </div>
            </div>
          )}

          {/* Section 13: Physical Characteristics */}
          {activeSection === 13 && (
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Physical State</label>
                {renderCheckbox('13_physical_characteristics_powdery', 'Powdery/Granular')}
                {renderCheckbox('13_physical_characteristics_solid', 'Solid')}
                {renderCheckbox('13_physical_characteristics_viscous', 'Viscous')}
                {renderCheckbox('13_physical_characteristics_sludgy', 'Sludgy')}
                {renderCheckbox('13_physical_characteristics_liquid', 'Liquid')}
                {renderCheckbox('13_physical_characteristics_gaseous', 'Gaseous')}
              </div>
              {renderTextField('13_physical_characteristics_other', 'Other (specify)')}
              {renderTextArea('13_physical_characteristics_additional_description', 'Additional Description', 3)}
            </div>
          )}

          {/* Section 14: Waste Identification */}
          {activeSection === 14 && (
            <div>
              {renderTextField('14_waste_identification_basel_annex', 'Basel Annex')}
              {renderTextField('14_waste_identification_oecd_code', 'OECD Code')}
              {renderTextField('14_waste_identification_ec_list', 'EC List')}
              {renderTextField('14_waste_identification_national_code_export', 'National Code (Export)')}
              {renderTextField('14_waste_identification_national_code_import', 'National Code (Import)')}
              {renderTextField('14_waste_identification_other_code', 'Other Code')}
              {renderTextField('14_waste_identification_y_code', 'Y-Code')}
              {renderTextField('14_waste_identification_h_code', 'H-Code')}
              {renderTextField('14_waste_identification_un_class', 'UN Class')}
              {renderTextField('14_waste_identification_un_number', 'UN Number')}
              {renderTextField('14_waste_identification_un_shipping_name', 'UN Shipping Name')}
              {renderTextField('14_waste_identification_customs_code', 'Customs Code')}
            </div>
          )}

          {/* Section 15: Countries/States Concerned */}
          {activeSection === 15 && (
            <div>
              {renderTextField('15_countries_states_export_state', 'State of Export')}
              {renderTextField('15_countries_states_export_authority_code', 'Export Competent Authority Code')}
              {renderTextField('15_countries_states_export_point_exit', 'Point of Exit')}
              {renderTextArea('15_countries_states_states_of_transit', 'State(s) of Transit')}
              {renderTextField('15_countries_states_import_state', 'State of Import')}
              {renderTextField('15_countries_states_import_authority_code', 'Import Competent Authority Code')}
              {renderTextField('15_countries_states_import_point_entry', 'Point of Entry')}
            </div>
          )}

          {/* Section 16: Customs Offices */}
          {activeSection === 16 && (
            <div>
              {renderTextField('16_customs_entry_office', 'Customs Office of Entry')}
              {renderTextField('16_customs_exit_office', 'Customs Office of Exit')}
              {renderTextField('16_customs_export_office', 'Customs Office of Export')}
            </div>
          )}

          {/* Section 17: Exporter's Declaration */}
          {activeSection === 17 && (
            <div>
              {renderTextField('17_exporter_declaration_notifier_name', 'Exporter/Notifier Name')}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Declaration Date</label>
                <div className="grid grid-cols-3 gap-4">
                  {renderTextField('17_exporter_declaration_date_month', 'Month')}
                  {renderTextField('17_exporter_declaration_date_day', 'Day')}
                  {renderTextField('17_exporter_declaration_date_year', 'Year')}
                </div>
              </div>
              {renderTextField('17_exporter_declaration_signature_status', 'Signature Status')}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Generator Signature on Separate Sheet?</label>
                {renderCheckbox('17_exporter_declaration_generator_signature_yes', 'Yes')}
                {renderCheckbox('17_exporter_declaration_generator_signature_no', 'No')}
              </div>
            </div>
          )}

          {/* Section 18: Annexes Attached */}
          {activeSection === 18 && (
            <div>
              {renderNumberField('18_annexes_total_number_attached', 'Total Number of Annexes Attached')}
              {renderTextArea('18_annexes_list', 'List of Annexes', 4)}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Types of Annexes</label>
                {renderCheckbox('18_annexes_chemical_analysis_reports', 'Chemical Analysis Reports')}
                {renderCheckbox('18_annexes_facility_permits', 'Facility Permits')}
                {renderCheckbox('18_annexes_transport_contracts', 'Transport Contracts')}
                {renderCheckbox('18_annexes_insurance_certificates', 'Insurance Certificates')}
                {renderCheckbox('18_annexes_process_descriptions', 'Process Descriptions')}
                {renderCheckbox('18_annexes_safety_data_sheets', 'Safety Data Sheets')}
                {renderCheckbox('18_annexes_routing_information', 'Routing Information')}
                {renderCheckbox('18_annexes_emergency_procedures', 'Emergency Procedures')}
              </div>
              {renderTextArea('18_annexes_other_supporting_documents', 'Other Supporting Documents', 3)}
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
            {activeSection === 18 ? (
              <button
                onClick={handleSubmit}
                disabled={isSaving || notification.status === 'submitted'}
                className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {notification.status === 'submitted' ? 'Already Submitted' : 'Submit Notification'}
              </button>
            ) : (
              <button
                onClick={() => setActiveSection(Math.min(18, activeSection + 1))}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
