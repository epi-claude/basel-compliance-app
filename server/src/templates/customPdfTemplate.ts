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

  <!-- Additional pages would continue with two-column detailed layout -->
  <!-- For MVP, we'll keep this to page 1 only -->

</body>
</html>`;
}
