/**
 * Generate HTML for the custom Basel notification PDF
 */
export function generateCustomPdfHtml(data: any): string {
  // Helper functions
  const escape = (text: any): string => {
    if (text === null || text === undefined || text === '') return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/\n/g, '<br>');
  };

  const checkbox = (value: any): string => {
    return (value === 1 || value === true || value === 'true')
      ? '<span class="checkbox checked"></span>'
      : '<span class="checkbox"></span>';
  };

  const formatDate = (month?: string, day?: string, year?: string): string => {
    if (!month && !day && !year) return '';
    return `${month || ''}/${day || ''}/${year || ''}`.replace(/^\/|\/$/g, '');
  };

  // Format dates
  const firstDeparture = formatDate(
    data['6_intended_period_first_departure_month'],
    data['6_intended_period_first_departure_day'],
    data['6_intended_period_first_departure_year']
  );
  const lastDeparture = formatDate(
    data['6_intended_period_last_departure_month'],
    data['6_intended_period_last_departure_day'],
    data['6_intended_period_last_departure_year']
  );
  const declarationDate = formatDate(
    data['17_exporter_declaration_date_month'],
    data['17_exporter_declaration_date_day'],
    data['17_exporter_declaration_date_year']
  );

  const notificationId = escape(data['3_notification_details_notification_no'] || 'N/A');
  const wasteDesignation = escape(data['12_waste_designation'] || '');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Basel Notification ${notificationId}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 11pt;
      line-height: 1.4;
    }

    .page {
      background: white;
      width: 8.5in;
      min-height: 11in;
      padding: 0.75in;
      page-break-after: always;
    }

    .exec-header {
      text-align: center;
      background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%);
      color: white;
      padding: 25px;
      margin: -0.75in -0.75in 30px;
      border-bottom: 5px solid #1e3a8a;
    }

    .exec-header h1 {
      font-size: 24pt;
      font-weight: bold;
      margin-bottom: 8px;
    }

    .exec-header .notification-id {
      font-size: 16pt;
      font-weight: bold;
      letter-spacing: 1px;
    }

    .exec-summary-box {
      background: #f8fafc;
      border: 3px solid #2563eb;
      border-radius: 8px;
      padding: 25px;
      margin-bottom: 25px;
    }

    .exec-summary-title {
      font-size: 16pt;
      font-weight: bold;
      color: #1e40af;
      margin-bottom: 15px;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .exec-grid {
      display: grid;
      grid-template-columns: 140px 1fr;
      gap: 15px;
      margin-bottom: 20px;
    }

    .exec-label {
      font-weight: bold;
      font-size: 12pt;
      color: #1e40af;
    }

    .exec-value {
      font-size: 12pt;
      color: #000;
      font-weight: 500;
    }

    .exec-divider {
      height: 2px;
      background: linear-gradient(to right, #2563eb, transparent);
      margin: 20px 0;
    }

    .scenario-box {
      background: #eff6ff;
      border-left: 4px solid #2563eb;
      padding: 15px;
      margin-bottom: 20px;
      font-style: italic;
      color: #1e3a8a;
    }

    .key-parties {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
      margin-top: 20px;
    }

    .party-card {
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 6px;
      padding: 10px;
    }

    .party-card-title {
      font-size: 10pt;
      font-weight: bold;
      color: #1e40af;
      margin-bottom: 6px;
      padding-bottom: 4px;
      border-bottom: 2px solid #2563eb;
    }

    .party-card-content {
      font-size: 9pt;
      line-height: 1.4;
    }

    .header {
      text-align: center;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }

    .header h1 {
      font-size: 18pt;
      font-weight: bold;
      color: #1e40af;
      margin-bottom: 5px;
    }

    .header .notification-id {
      font-size: 14pt;
      font-weight: bold;
      color: #333;
    }

    .two-column {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }

    .section {
      margin-bottom: 20px;
    }

    .section-title {
      font-size: 13pt;
      font-weight: bold;
      color: #1e40af;
      background: #eff6ff;
      padding: 8px 12px;
      margin-bottom: 10px;
      border-left: 4px solid #2563eb;
    }

    .field {
      margin-bottom: 12px;
    }

    .field-label {
      font-weight: bold;
      color: #374151;
      margin-bottom: 3px;
      font-size: 10pt;
    }

    .field-value {
      color: #000;
      padding-left: 8px;
      font-size: 11pt;
    }

    .checkbox-group {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      padding-left: 8px;
    }

    .checkbox-item {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .checkbox {
      width: 14px;
      height: 14px;
      border: 2px solid #666;
      display: inline-block;
      position: relative;
    }

    .checkbox.checked::after {
      content: '✓';
      position: absolute;
      top: -3px;
      left: 1px;
      font-size: 14px;
      color: #2563eb;
      font-weight: bold;
    }

    .page-number {
      text-align: center;
      margin-top: 20px;
      font-size: 10pt;
      color: #666;
    }
  </style>
</head>
<body>

  <!-- PAGE 1: EXECUTIVE SUMMARY -->
  <div class="page">
    <div class="exec-header">
      <h1>BASEL CONVENTION NOTIFICATION</h1>
      <div class="notification-id">${notificationId}</div>
    </div>

    <div class="scenario-box">
      <strong>Waste Description:</strong> ${wasteDesignation}
    </div>

    <div class="exec-summary-box">
      <div class="exec-summary-title">Executive Summary</div>

      <div class="exec-grid">
        <div class="exec-label">WHAT:</div>
        <div class="exec-value">${wasteDesignation}</div>

        <div class="exec-label">HOW MUCH:</div>
        <div class="exec-value">${escape(data['5_total_intended_quantity_tonnes'])} tonnes (${escape(data['5_total_intended_quantity_m3'])} m³) across ${escape(data['4_total_intended_shipments_count'])} shipments</div>

        <div class="exec-label">WHEN:</div>
        <div class="exec-value">${firstDeparture} - ${lastDeparture}</div>

        <div class="exec-label">FROM:</div>
        <div class="exec-value">${escape(data['15_countries_states_export_state'])} (${escape(data['15_countries_states_export_point_exit'])}) → ${escape(data['15_countries_states_import_state'])} (${escape(data['15_countries_states_import_point_entry'])})</div>

        <div class="exec-label">PURPOSE:</div>
        <div class="exec-value">${data['3_notification_details_operation_type_recovery'] ? 'Recovery' : 'Disposal'} - ${escape(data['11_disposal_recovery_operations_d_code_r_code'])}</div>

        <div class="exec-label">WHY EXPORT:</div>
        <div class="exec-value">${escape(data['11_disposal_recovery_operations_reason_export'])}</div>

        <div class="exec-label">TRANSPORT:</div>
        <div class="exec-value">${data['8_intended_carrier_means_road'] ? 'Road' : ''}${data['8_intended_carrier_means_train'] ? 'Train' : ''}${data['8_intended_carrier_means_sea'] ? 'Sea' : ''}${data['8_intended_carrier_means_air'] ? 'Air' : ''} transport via ${escape(data['8_intended_carrier_name'])}. ${escape(data['15_countries_states_states_of_transit'])}</div>

        <div class="exec-label">HAZARDS:</div>
        <div class="exec-value">${escape(data['12_waste_hazardous_constituents_concentrations'])}<br>UN Class ${escape(data['14_waste_identification_un_class'])}, UN ${escape(data['14_waste_identification_un_number'])}</div>

        <div class="exec-label">PACKAGING:</div>
        <div class="exec-value">${data['7_packaging_type_drum'] ? 'Drums ' : ''}${data['7_packaging_type_box'] ? 'Boxes ' : ''}${data['7_packaging_type_other'] ? escape(data['7_packaging_type_other']) : ''}. ${data['7_special_handling_yes'] ? 'Special handling required' : 'No special handling'}.</div>

        <div class="exec-label">STATUS:</div>
        <div class="exec-value">${escape(data['status'] || 'Draft')} - ${data['3_notification_details_pre_consented_recovery_facility_yes'] ? 'Pre-consented recovery facility' : 'Not pre-consented'}</div>
      </div>

      <div class="exec-divider"></div>

      <div class="key-parties">
        <div class="party-card">
          <div class="party-card-title">EXPORTER</div>
          <div class="party-card-content">
            <strong>${escape(data['1_exporter_notifier_name'])}</strong><br>
            ${escape(data['1_exporter_notifier_contact_person'])}<br>
            ${escape(data['1_exporter_notifier_address'])}<br>
            ${escape(data['1_exporter_notifier_email'])}<br>
            ${escape(data['1_exporter_notifier_tel'])}
          </div>
        </div>

        <div class="party-card">
          <div class="party-card-title">IMPORTER</div>
          <div class="party-card-content">
            <strong>${escape(data['2_importer_consignee_name'])}</strong><br>
            ${escape(data['2_importer_consignee_contact_person'])}<br>
            ${escape(data['2_importer_consignee_address'])}<br>
            ${escape(data['2_importer_consignee_email'])}<br>
            ${escape(data['2_importer_consignee_tel'])}
          </div>
        </div>

        <div class="party-card">
          <div class="party-card-title">FACILITY</div>
          <div class="party-card-content">
            <strong>${escape(data['10_disposal_recovery_facility_name'])}</strong><br>
            ${escape(data['10_disposal_recovery_facility_contact_person'])}<br>
            ${escape(data['10_disposal_recovery_facility_address'])}<br>
            ${escape(data['10_disposal_recovery_facility_email'])}<br>
            ${escape(data['10_disposal_recovery_facility_tel'])}
          </div>
        </div>
      </div>
    </div>

    <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 15px; border-radius: 6px; margin-top: 20px;">
      <strong style="color: #92400e; font-size: 12pt;">📋 CLASSIFICATION CODES</strong><br>
      <div style="margin-top: 10px; color: #78350f; font-size: 10pt; line-height: 1.8;">
        <strong>Basel:</strong> ${escape(data['14_waste_identification_basel_annex'])} &nbsp;|&nbsp;
        <strong>OECD:</strong> ${escape(data['14_waste_identification_oecd_code'])} &nbsp;|&nbsp;
        <strong>Y-Code:</strong> ${escape(data['14_waste_identification_y_code'])} &nbsp;|&nbsp;
        <strong>H-Code:</strong> ${escape(data['14_waste_identification_h_code'])}<br>
        <strong>Export Code:</strong> ${escape(data['14_waste_identification_national_code_export'])} &nbsp;|&nbsp;
        <strong>Import Code:</strong> ${escape(data['14_waste_identification_national_code_import'])} &nbsp;|&nbsp;
        <strong>Customs:</strong> ${escape(data['14_waste_identification_customs_code'])}
      </div>
    </div>

    <div style="background: #dcfce7; border: 2px solid #16a34a; padding: 15px; border-radius: 6px; margin-top: 15px;">
      <strong style="color: #166534; font-size: 12pt;">📎 SUPPORTING DOCUMENTS (${escape(data['18_annexes_total_number_attached'])} total)</strong><br>
      <div style="margin-top: 8px; color: #14532d; font-size: 10pt; line-height: 1.6;">
        ${data['18_annexes_chemical_analysis_reports'] ? '✓ Chemical analysis report' : ''}
        ${data['18_annexes_facility_permits'] ? '&nbsp;|&nbsp; ✓ Facility permits' : ''}
        ${data['18_annexes_transport_contracts'] ? '&nbsp;|&nbsp; ✓ Transport contract' : ''}<br>
        ${data['18_annexes_insurance_certificates'] ? '✓ Insurance certificates' : ''}
        ${data['18_annexes_process_descriptions'] ? '&nbsp;|&nbsp; ✓ Process descriptions' : ''}
        ${data['18_annexes_safety_data_sheets'] ? '&nbsp;|&nbsp; ✓ Safety Data Sheets' : ''}<br>
        ${data['18_annexes_routing_information'] ? '✓ Routing information' : ''}
        ${data['18_annexes_emergency_procedures'] ? '&nbsp;|&nbsp; ✓ Emergency procedures' : ''}
      </div>
    </div>

    <div class="page-number">Page 1 of 4 - Executive Summary</div>
  </div>

  <!-- PAGE 2: PARTIES -->
  <div class="page">
    <div class="header">
      <h1>Basel Convention Notification</h1>
      <div class="notification-id">${notificationId}</div>
    </div>

    <div class="two-column">
      <!-- LEFT COLUMN -->
      <div>
        <div class="section">
          <div class="section-title">1. Exporter/Notifier</div>
          <div class="field">
            <div class="field-label">Registration No.</div>
            <div class="field-value">${escape(data['1_exporter_notifier_registration_no'])}</div>
          </div>
          <div class="field">
            <div class="field-label">Name</div>
            <div class="field-value">${escape(data['1_exporter_notifier_name'])}</div>
          </div>
          <div class="field">
            <div class="field-label">Address</div>
            <div class="field-value">${escape(data['1_exporter_notifier_address'])}</div>
          </div>
          <div class="field">
            <div class="field-label">Contact Person</div>
            <div class="field-value">${escape(data['1_exporter_notifier_contact_person'])}</div>
          </div>
          <div class="field">
            <div class="field-label">Tel / Fax</div>
            <div class="field-value">${escape(data['1_exporter_notifier_tel'])} / ${escape(data['1_exporter_notifier_fax'])}</div>
          </div>
          <div class="field">
            <div class="field-label">Email</div>
            <div class="field-value">${escape(data['1_exporter_notifier_email'])}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">9. Waste Generator</div>
          <div class="field">
            <div class="field-label">Registration No.</div>
            <div class="field-value">${escape(data['9_waste_generator_registration_no'])}</div>
          </div>
          <div class="field">
            <div class="field-label">Name</div>
            <div class="field-value">${escape(data['9_waste_generator_name'])}</div>
          </div>
          <div class="field">
            <div class="field-label">Address</div>
            <div class="field-value">${escape(data['9_waste_generator_address'])}</div>
          </div>
          <div class="field">
            <div class="field-label">Contact Person</div>
            <div class="field-value">${escape(data['9_waste_generator_contact_person'])}</div>
          </div>
          <div class="field">
            <div class="field-label">Tel / Fax</div>
            <div class="field-value">${escape(data['9_waste_generator_tel'])} / ${escape(data['9_waste_generator_fax'])}</div>
          </div>
          <div class="field">
            <div class="field-label">Email</div>
            <div class="field-value">${escape(data['9_waste_generator_email'])}</div>
          </div>
          <div class="field">
            <div class="field-label">Site & Process</div>
            <div class="field-value">${escape(data['9_waste_generator_site_process_generation'])}</div>
          </div>
        </div>
      </div>

      <!-- RIGHT COLUMN -->
      <div>
        <div class="section">
          <div class="section-title">2. Importer/Consignee</div>
          <div class="field">
            <div class="field-label">Registration No.</div>
            <div class="field-value">${escape(data['2_importer_consignee_registration_no'])}</div>
          </div>
          <div class="field">
            <div class="field-label">Name</div>
            <div class="field-value">${escape(data['2_importer_consignee_name'])}</div>
          </div>
          <div class="field">
            <div class="field-label">Address</div>
            <div class="field-value">${escape(data['2_importer_consignee_address'])}</div>
          </div>
          <div class="field">
            <div class="field-label">Contact Person</div>
            <div class="field-value">${escape(data['2_importer_consignee_contact_person'])}</div>
          </div>
          <div class="field">
            <div class="field-label">Tel / Fax</div>
            <div class="field-value">${escape(data['2_importer_consignee_tel'])} / ${escape(data['2_importer_consignee_fax'])}</div>
          </div>
          <div class="field">
            <div class="field-label">Email</div>
            <div class="field-value">${escape(data['2_importer_consignee_email'])}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">10. Disposal/Recovery Facility</div>
          <div class="field">
            <div class="field-label">Type</div>
            <div class="checkbox-group">
              <div class="checkbox-item">
                ${checkbox(data['10_disposal_recovery_facility_type_disposal'])}
                <span>Disposal</span>
              </div>
              <div class="checkbox-item">
                ${checkbox(data['10_disposal_recovery_facility_type_recovery'])}
                <span>Recovery</span>
              </div>
            </div>
          </div>
          <div class="field">
            <div class="field-label">Registration No.</div>
            <div class="field-value">${escape(data['10_disposal_recovery_facility_registration_no'])}</div>
          </div>
          <div class="field">
            <div class="field-label">Name</div>
            <div class="field-value">${escape(data['10_disposal_recovery_facility_name'])}</div>
          </div>
          <div class="field">
            <div class="field-label">Address</div>
            <div class="field-value">${escape(data['10_disposal_recovery_facility_address'])}</div>
          </div>
          <div class="field">
            <div class="field-label">Contact Person</div>
            <div class="field-value">${escape(data['10_disposal_recovery_facility_contact_person'])}</div>
          </div>
          <div class="field">
            <div class="field-label">Tel / Fax</div>
            <div class="field-value">${escape(data['10_disposal_recovery_facility_tel'])} / ${escape(data['10_disposal_recovery_facility_fax'])}</div>
          </div>
          <div class="field">
            <div class="field-label">Email</div>
            <div class="field-value">${escape(data['10_disposal_recovery_facility_email'])}</div>
          </div>
          <div class="field">
            <div class="field-label">Actual Site</div>
            <div class="field-value">${escape(data['10_disposal_recovery_facility_actual_site'])}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="page-number">Page 2 of 4</div>
  </div>

  <!-- PAGE 3: WASTE & SHIPMENT DETAILS -->
  <div class="page">
    <div class="header">
      <h1>Basel Convention Notification</h1>
      <div class="notification-id">${notificationId}</div>
    </div>

    <div class="two-column">
      <!-- LEFT COLUMN -->
      <div>
        <div class="section">
          <div class="section-title">12. Waste Designation</div>
          <div class="field">
            <div class="field-label">Description</div>
            <div class="field-value">${wasteDesignation}</div>
          </div>
          <div class="field">
            <div class="field-label">Major Constituents & Concentrations</div>
            <div class="field-value">${escape(data['12_waste_major_constituents_concentrations'])}</div>
          </div>
          <div class="field">
            <div class="field-label">Hazardous Constituents & Concentrations</div>
            <div class="field-value">${escape(data['12_waste_hazardous_constituents_concentrations'])}</div>
          </div>
          <div class="field">
            <div class="field-label">Chemical Analysis Available</div>
            <div class="checkbox-group">
              <div class="checkbox-item">
                ${checkbox(data['12_waste_chemical_analysis_available_yes'])}
                <span>Yes</span>
              </div>
              <div class="checkbox-item">
                ${checkbox(data['12_waste_chemical_analysis_available_no'])}
                <span>No</span>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">13. Physical Characteristics</div>
          <div class="field">
            <div class="checkbox-group">
              <div class="checkbox-item">
                ${checkbox(data['13_physical_characteristics_powdery'])}
                <span>Powdery</span>
              </div>
              <div class="checkbox-item">
                ${checkbox(data['13_physical_characteristics_solid'])}
                <span>Solid</span>
              </div>
              <div class="checkbox-item">
                ${checkbox(data['13_physical_characteristics_viscous'])}
                <span>Viscous</span>
              </div>
              <div class="checkbox-item">
                ${checkbox(data['13_physical_characteristics_sludgy'])}
                <span>Sludgy</span>
              </div>
              <div class="checkbox-item">
                ${checkbox(data['13_physical_characteristics_liquid'])}
                <span>Liquid</span>
              </div>
              <div class="checkbox-item">
                ${checkbox(data['13_physical_characteristics_gaseous'])}
                <span>Gaseous</span>
              </div>
            </div>
          </div>
          <div class="field">
            <div class="field-label">Other</div>
            <div class="field-value">${escape(data['13_physical_characteristics_other'])}</div>
          </div>
          <div class="field">
            <div class="field-label">Additional Description</div>
            <div class="field-value">${escape(data['13_physical_characteristics_additional_description'])}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">11. Disposal/Recovery Operations</div>
          <div class="field">
            <div class="field-label">D Code / R Code</div>
            <div class="field-value">${escape(data['11_disposal_recovery_operations_d_code_r_code'])}</div>
          </div>
          <div class="field">
            <div class="field-label">Technology</div>
            <div class="field-value">${escape(data['11_disposal_recovery_operations_technology'])}</div>
          </div>
          <div class="field">
            <div class="field-label">Reason for Export</div>
            <div class="field-value">${escape(data['11_disposal_recovery_operations_reason_export'])}</div>
          </div>
        </div>
      </div>

      <!-- RIGHT COLUMN -->
      <div>
        <div class="section">
          <div class="section-title">3-6. Shipment Details</div>
          <div class="field">
            <div class="field-label">Shipment Type</div>
            <div class="checkbox-group">
              <div class="checkbox-item">
                ${checkbox(data['3_notification_details_individual_shipment'])}
                <span>Individual</span>
              </div>
              <div class="checkbox-item">
                ${checkbox(data['3_notification_details_multiple_shipments'])}
                <span>Multiple</span>
              </div>
            </div>
          </div>
          <div class="field">
            <div class="field-label">Total Intended Shipments</div>
            <div class="field-value">${escape(data['4_total_intended_shipments_count'])}</div>
          </div>
          <div class="field">
            <div class="field-label">Total Quantity</div>
            <div class="field-value">${escape(data['5_total_intended_quantity_tonnes'])} tonnes / ${escape(data['5_total_intended_quantity_m3'])} m³</div>
          </div>
          <div class="field">
            <div class="field-label">Intended Period</div>
            <div class="field-value">First Departure: ${firstDeparture}<br>Last Departure: ${lastDeparture}</div>
          </div>
          <div class="field">
            <div class="field-label">Pre-Consented Recovery Facility</div>
            <div class="checkbox-group">
              <div class="checkbox-item">
                ${checkbox(data['3_notification_details_pre_consented_recovery_facility_yes'])}
                <span>Yes</span>
              </div>
              <div class="checkbox-item">
                ${checkbox(data['3_notification_details_pre_consented_recovery_facility_no'])}
                <span>No</span>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">7. Packaging Type</div>
          <div class="field">
            <div class="checkbox-group">
              <div class="checkbox-item">
                ${checkbox(data['7_packaging_type_drum'])}
                <span>Drum</span>
              </div>
              <div class="checkbox-item">
                ${checkbox(data['7_packaging_type_wooden_barrel'])}
                <span>Wooden Barrel</span>
              </div>
              <div class="checkbox-item">
                ${checkbox(data['7_packaging_type_jerrican'])}
                <span>Jerrican</span>
              </div>
              <div class="checkbox-item">
                ${checkbox(data['7_packaging_type_box'])}
                <span>Box</span>
              </div>
              <div class="checkbox-item">
                ${checkbox(data['7_packaging_type_bag'])}
                <span>Bag</span>
              </div>
              <div class="checkbox-item">
                ${checkbox(data['7_packaging_type_composite_packaging'])}
                <span>Composite</span>
              </div>
              <div class="checkbox-item">
                ${checkbox(data['7_packaging_type_pressure_receptacle'])}
                <span>Pressure</span>
              </div>
              <div class="checkbox-item">
                ${checkbox(data['7_packaging_type_bulk'])}
                <span>Bulk</span>
              </div>
            </div>
          </div>
          <div class="field">
            <div class="field-label">Other</div>
            <div class="field-value">${escape(data['7_packaging_type_other'])}</div>
          </div>
          <div class="field">
            <div class="field-label">Special Handling Required</div>
            <div class="checkbox-group">
              <div class="checkbox-item">
                ${checkbox(data['7_special_handling_yes'])}
                <span>Yes</span>
              </div>
              <div class="checkbox-item">
                ${checkbox(data['7_special_handling_no'])}
                <span>No</span>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">8. Intended Carrier</div>
          <div class="field">
            <div class="field-label">Registration No.</div>
            <div class="field-value">${escape(data['8_intended_carrier_registration_no'])}</div>
          </div>
          <div class="field">
            <div class="field-label">Name</div>
            <div class="field-value">${escape(data['8_intended_carrier_name'])}</div>
          </div>
          <div class="field">
            <div class="field-label">Address</div>
            <div class="field-value">${escape(data['8_intended_carrier_address'])}</div>
          </div>
          <div class="field">
            <div class="field-label">Contact Person</div>
            <div class="field-value">${escape(data['8_intended_carrier_contact_person'])}</div>
          </div>
          <div class="field">
            <div class="field-label">Tel / Fax</div>
            <div class="field-value">${escape(data['8_intended_carrier_tel'])} / ${escape(data['8_intended_carrier_fax'])}</div>
          </div>
          <div class="field">
            <div class="field-label">Email</div>
            <div class="field-value">${escape(data['8_intended_carrier_email'])}</div>
          </div>
          <div class="field">
            <div class="field-label">Means of Transport</div>
            <div class="checkbox-group">
              <div class="checkbox-item">
                ${checkbox(data['8_intended_carrier_means_road'])}
                <span>Road</span>
              </div>
              <div class="checkbox-item">
                ${checkbox(data['8_intended_carrier_means_train'])}
                <span>Train</span>
              </div>
              <div class="checkbox-item">
                ${checkbox(data['8_intended_carrier_means_sea'])}
                <span>Sea</span>
              </div>
              <div class="checkbox-item">
                ${checkbox(data['8_intended_carrier_means_air'])}
                <span>Air</span>
              </div>
              <div class="checkbox-item">
                ${checkbox(data['8_intended_carrier_means_inland_waterways'])}
                <span>Inland</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="page-number">Page 3 of 4</div>
  </div>

  <!-- PAGE 4: CODES, ROUTES, ANNEXES -->
  <div class="page">
    <div class="header">
      <h1>Basel Convention Notification</h1>
      <div class="notification-id">${notificationId}</div>
    </div>

    <div class="two-column">
      <!-- LEFT COLUMN -->
      <div>
        <div class="section">
          <div class="section-title">14. Waste Identification</div>
          <div class="field">
            <div class="field-label">Basel Annex</div>
            <div class="field-value">${escape(data['14_waste_identification_basel_annex'])}</div>
          </div>
          <div class="field">
            <div class="field-label">OECD Code</div>
            <div class="field-value">${escape(data['14_waste_identification_oecd_code'])}</div>
          </div>
          <div class="field">
            <div class="field-label">EC List</div>
            <div class="field-value">${escape(data['14_waste_identification_ec_list'])}</div>
          </div>
          <div class="field">
            <div class="field-label">National Code (Export)</div>
            <div class="field-value">${escape(data['14_waste_identification_national_code_export'])}</div>
          </div>
          <div class="field">
            <div class="field-label">National Code (Import)</div>
            <div class="field-value">${escape(data['14_waste_identification_national_code_import'])}</div>
          </div>
          <div class="field">
            <div class="field-label">Y Code</div>
            <div class="field-value">${escape(data['14_waste_identification_y_code'])}</div>
          </div>
          <div class="field">
            <div class="field-label">H Code</div>
            <div class="field-value">${escape(data['14_waste_identification_h_code'])}</div>
          </div>
          <div class="field">
            <div class="field-label">UN Class</div>
            <div class="field-value">${escape(data['14_waste_identification_un_class'])}</div>
          </div>
          <div class="field">
            <div class="field-label">UN Number</div>
            <div class="field-value">${escape(data['14_waste_identification_un_number'])}</div>
          </div>
          <div class="field">
            <div class="field-label">UN Shipping Name</div>
            <div class="field-value">${escape(data['14_waste_identification_un_shipping_name'])}</div>
          </div>
          <div class="field">
            <div class="field-label">Customs Code</div>
            <div class="field-value">${escape(data['14_waste_identification_customs_code'])}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">15. Countries/States</div>
          <div class="field">
            <div class="field-label">Export State</div>
            <div class="field-value">${escape(data['15_countries_states_export_state'])}</div>
          </div>
          <div class="field">
            <div class="field-label">Export Authority Code</div>
            <div class="field-value">${escape(data['15_countries_states_export_authority_code'])}</div>
          </div>
          <div class="field">
            <div class="field-label">Point of Exit</div>
            <div class="field-value">${escape(data['15_countries_states_export_point_exit'])}</div>
          </div>
          <div class="field">
            <div class="field-label">States of Transit</div>
            <div class="field-value">${escape(data['15_countries_states_states_of_transit'])}</div>
          </div>
          <div class="field">
            <div class="field-label">Import State</div>
            <div class="field-value">${escape(data['15_countries_states_import_state'])}</div>
          </div>
          <div class="field">
            <div class="field-label">Import Authority Code</div>
            <div class="field-value">${escape(data['15_countries_states_import_authority_code'])}</div>
          </div>
          <div class="field">
            <div class="field-label">Point of Entry</div>
            <div class="field-value">${escape(data['15_countries_states_import_point_entry'])}</div>
          </div>
        </div>
      </div>

      <!-- RIGHT COLUMN -->
      <div>
        <div class="section">
          <div class="section-title">16. Customs Offices</div>
          <div class="field">
            <div class="field-label">Entry Office</div>
            <div class="field-value">${escape(data['16_customs_entry_office'])}</div>
          </div>
          <div class="field">
            <div class="field-label">Exit Office</div>
            <div class="field-value">${escape(data['16_customs_exit_office'])}</div>
          </div>
          <div class="field">
            <div class="field-label">Export Office</div>
            <div class="field-value">${escape(data['16_customs_export_office'])}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">17. Exporter Declaration</div>
          <div class="field">
            <div class="field-label">Notifier Name</div>
            <div class="field-value">${escape(data['17_exporter_declaration_notifier_name'])}</div>
          </div>
          <div class="field">
            <div class="field-label">Date</div>
            <div class="field-value">${declarationDate}</div>
          </div>
          <div class="field">
            <div class="field-label">Signature Status</div>
            <div class="field-value">${escape(data['17_exporter_declaration_signature_status'])}</div>
          </div>
          <div class="field">
            <div class="field-label">Generator Signature</div>
            <div class="checkbox-group">
              <div class="checkbox-item">
                ${checkbox(data['17_exporter_declaration_generator_signature_yes'])}
                <span>Yes</span>
              </div>
              <div class="checkbox-item">
                ${checkbox(data['17_exporter_declaration_generator_signature_no'])}
                <span>No</span>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">18. Annexes</div>
          <div class="field">
            <div class="field-label">Total Number Attached</div>
            <div class="field-value">${escape(data['18_annexes_total_number_attached'])}</div>
          </div>
          <div class="field">
            <div class="field-label">Types</div>
            <div class="checkbox-group">
              <div class="checkbox-item">
                ${checkbox(data['18_annexes_chemical_analysis_reports'])}
                <span>Chemical Analysis</span>
              </div>
              <div class="checkbox-item">
                ${checkbox(data['18_annexes_facility_permits'])}
                <span>Facility Permits</span>
              </div>
              <div class="checkbox-item">
                ${checkbox(data['18_annexes_transport_contracts'])}
                <span>Transport</span>
              </div>
              <div class="checkbox-item">
                ${checkbox(data['18_annexes_insurance_certificates'])}
                <span>Insurance</span>
              </div>
              <div class="checkbox-item">
                ${checkbox(data['18_annexes_process_descriptions'])}
                <span>Process Docs</span>
              </div>
              <div class="checkbox-item">
                ${checkbox(data['18_annexes_safety_data_sheets'])}
                <span>Safety Sheets</span>
              </div>
              <div class="checkbox-item">
                ${checkbox(data['18_annexes_routing_information'])}
                <span>Routing</span>
              </div>
              <div class="checkbox-item">
                ${checkbox(data['18_annexes_emergency_procedures'])}
                <span>Emergency</span>
              </div>
            </div>
          </div>
          <div class="field">
            <div class="field-label">List of Documents</div>
            <div class="field-value">${escape(data['18_annexes_list'])}</div>
          </div>
          <div class="field">
            <div class="field-label">Other Supporting Documents</div>
            <div class="field-value">${escape(data['18_annexes_other_supporting_documents'])}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="page-number">Page 4 of 4</div>
  </div>

</body>
</html>`;
}
