# Basel Compliance App - PDF Field Mapping Strategy

**Version:** 1.0
**Date:** October 24, 2025
**Library:** pdf-lib (same as Project 1)
**Source PDF:** basel_notifiy_app_form - fields - v1 - application.pdf

---

## Overview

This document describes the strategy for filling the official Basel Convention PDF form with data from our database using `pdf-lib`.

---

## PDF Generation Flow

```
User clicks "Generate PDF"
  ↓
Fetch notification data from database
  ↓
Load PDF template using pdf-lib
  ↓
Get PDF form fields
  ↓
Map database fields → PDF fields
  ↓
Fill text fields and checkboxes
  ↓
Save PDF bytes
  ↓
Store in submission_documents table
  ↓
Return PDF URL to user
```

---

## Field Mapping Strategy

### **Principle: 1-to-1 Mapping**

Our database field names **exactly match** the PDF form field names, making mapping straightforward:

```typescript
// Database column name
"1_exporter_notifier_registration_no"

// PDF form field name
"1_exporter_notifier_registration_no"

// They're identical!
```

---

## PDF Service Implementation

Based on Project 1's `pdfService.ts` pattern:

```typescript
// server/src/services/pdfService.ts
import { PDFDocument } from 'pdf-lib';
import { BaselNotification } from '../types/index.js';
import fs from 'fs/promises';
import path from 'path';

export class PdfService {
  private static TEMPLATE_PATH = path.join(
    __dirname,
    '../../../docs/basel_notifiy_app_form - fields - v1 - application.pdf'
  );
  private static OUTPUT_DIR = path.join(__dirname, '../../../server/generated-pdfs');

  /**
   * Generate filled PDF from notification data
   */
  static async generateFilledPDF(
    notification: BaselNotification
  ): Promise<{ filename: string; filepath: string; filesize: number }> {
    console.log('Starting PDF generation for notification:', notification.id);

    // Read PDF template
    const templateBytes = await fs.readFile(this.TEMPLATE_PATH);
    const pdfDoc = await PDFDocument.load(templateBytes);

    console.log('Template loaded, pages:', pdfDoc.getPageCount());

    // Get form
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    console.log('Total PDF form fields:', fields.length);

    // Fill all fields
    this.fillAllFields(form, notification);

    // Save PDF
    const pdfBytes = await pdfDoc.save();

    // Generate filename
    const timestamp = Date.now();
    const filename = `basel_notification_${notification.id}_${timestamp}.pdf`;
    const filepath = path.join(this.OUTPUT_DIR, filename);

    // Ensure output directory exists
    await fs.mkdir(this.OUTPUT_DIR, { recursive: true });

    // Write file
    await fs.writeFile(filepath, pdfBytes);

    console.log('PDF generated successfully:', filepath);

    return {
      filename,
      filepath,
      filesize: pdfBytes.length
    };
  }

  /**
   * Fill all PDF fields from notification data
   */
  private static fillAllFields(form: any, notification: BaselNotification) {
    // Section 1: Exporter - Notifier
    this.fillTextField(form, '1_exporter_notifier_registration_no', notification['1_exporter_notifier_registration_no']);
    this.fillTextField(form, '1_exporter_notifier_name', notification['1_exporter_notifier_name']);
    this.fillTextField(form, '1_exporter_notifier_address', notification['1_exporter_notifier_address']);
    this.fillTextField(form, '1_exporter_notifier_contact_person', notification['1_exporter_notifier_contact_person']);
    this.fillTextField(form, '1_exporter_notifier_tel', notification['1_exporter_notifier_tel']);
    this.fillTextField(form, '1_exporter_notifier_fax', notification['1_exporter_notifier_fax']);
    this.fillTextField(form, '1_exporter_notifier_email', notification['1_exporter_notifier_email']);

    // Section 2: Importer - Consignee
    this.fillTextField(form, '2_importer_consignee_registration_no', notification['2_importer_consignee_registration_no']);
    this.fillTextField(form, '2_importer_consignee_name', notification['2_importer_consignee_name']);
    this.fillTextField(form, '2_importer_consignee_address', notification['2_importer_consignee_address']);
    this.fillTextField(form, '2_importer_consignee_contact_person', notification['2_importer_consignee_contact_person']);
    this.fillTextField(form, '2_importer_consignee_tel', notification['2_importer_consignee_tel']);
    this.fillTextField(form, '2_importer_consignee_fax', notification['2_importer_consignee_fax']);
    this.fillTextField(form, '2_importer_consignee_email', notification['2_importer_consignee_email']);

    // Section 3: Notification Details
    this.fillTextField(form, '3_notification_details_notification_no', notification['3_notification_details_notification_no']);
    this.fillCheckbox(form, '3_notification_details_individual_shipment', notification['3_notification_details_individual_shipment']);
    this.fillCheckbox(form, '3_notification_details_multiple_shipments', notification['3_notification_details_multiple_shipments']);
    this.fillCheckbox(form, '3_notification_details_operation_type_disposal', notification['3_notification_details_operation_type_disposal']);
    this.fillCheckbox(form, '3_notification_details_operation_type_recovery', notification['3_notification_details_operation_type_recovery']);
    this.fillCheckbox(form, '3_notification_details_pre_consented_recovery_facility_yes', notification['3_notification_details_pre_consented_recovery_facility_yes']);
    this.fillCheckbox(form, '3_notification_details_pre_consented_recovery_facility_no', notification['3_notification_details_pre_consented_recovery_facility_no']);

    // Section 4: Total Shipments
    this.fillTextField(form, '4_total_intended_shipments_count', notification['4_total_intended_shipments_count']?.toString());

    // Section 5: Intended Quantity
    this.fillTextField(form, '5_total_intended_quantity_tonnes', notification['5_total_intended_quantity_tonnes']?.toString());
    this.fillTextField(form, '5_total_intended_quantity_m3', notification['5_total_intended_quantity_m3']?.toString());

    // Section 6: Intended Period (dates)
    this.fillTextField(form, '6_intended_period_first_departure_month', notification['6_intended_period_first_departure_month']);
    this.fillTextField(form, '6_intended_period_first_departure_day', notification['6_intended_period_first_departure_day']);
    this.fillTextField(form, '6_intended_period_first_departure_year', notification['6_intended_period_first_departure_year']);
    this.fillTextField(form, '6_intended_period_last_departure_month', notification['6_intended_period_last_departure_month']);
    this.fillTextField(form, '6_intended_period_last_departure_day', notification['6_intended_period_last_departure_day']);
    this.fillTextField(form, '6_intended_period_last_departure_year', notification['6_intended_period_last_departure_year']);

    // Section 7: Packaging
    this.fillCheckbox(form, '7_packaging_type_drum', notification['7_packaging_type_drum']);
    this.fillCheckbox(form, '7_packaging_type_wooden_barrel', notification['7_packaging_type_wooden_barrel']);
    this.fillCheckbox(form, '7_packaging_type_jerrican', notification['7_packaging_type_jerrican']);
    this.fillCheckbox(form, '7_packaging_type_box', notification['7_packaging_type_box']);
    this.fillCheckbox(form, '7_packaging_type_bag', notification['7_packaging_type_bag']);
    this.fillCheckbox(form, '7_packaging_type_composite_packaging', notification['7_packaging_type_composite_packaging']);
    this.fillCheckbox(form, '7_packaging_type_pressure_receptacle', notification['7_packaging_type_pressure_receptacle']);
    this.fillCheckbox(form, '7_packaging_type_bulk', notification['7_packaging_type_bulk']);
    this.fillTextField(form, '7_packaging_type_other', notification['7_packaging_type_other']);
    this.fillCheckbox(form, '7_special_handling_yes', notification['7_special_handling_yes']);
    this.fillCheckbox(form, '7_special_handling_no', notification['7_special_handling_no']);

    // Section 8: Carrier
    this.fillTextField(form, '8_intended_carrier_registration_no', notification['8_intended_carrier_registration_no']);
    this.fillTextField(form, '8_intended_carrier_name', notification['8_intended_carrier_name']);
    this.fillTextField(form, '8_intended_carrier_address', notification['8_intended_carrier_address']);
    this.fillTextField(form, '8_intended_carrier_contact_person', notification['8_intended_carrier_contact_person']);
    this.fillTextField(form, '8_intended_carrier_tel', notification['8_intended_carrier_tel']);
    this.fillTextField(form, '8_intended_carrier_fax', notification['8_intended_carrier_fax']);
    this.fillTextField(form, '8_intended_carrier_email', notification['8_intended_carrier_email']);
    this.fillCheckbox(form, '8_intended_carrier_means_road', notification['8_intended_carrier_means_road']);
    this.fillCheckbox(form, '8_intended_carrier_means_train', notification['8_intended_carrier_means_train']);
    this.fillCheckbox(form, '8_intended_carrier_means_sea', notification['8_intended_carrier_means_sea']);
    this.fillCheckbox(form, '8_intended_carrier_means_air', notification['8_intended_carrier_means_air']);
    this.fillCheckbox(form, '8_intended_carrier_means_inland_waterways', notification['8_intended_carrier_means_inland_waterways']);

    // Section 9: Waste Generator
    this.fillTextField(form, '9_waste_generator_registration_no', notification['9_waste_generator_registration_no']);
    this.fillTextField(form, '9_waste_generator_name', notification['9_waste_generator_name']);
    this.fillTextField(form, '9_waste_generator_address', notification['9_waste_generator_address']);
    this.fillTextField(form, '9_waste_generator_contact_person', notification['9_waste_generator_contact_person']);
    this.fillTextField(form, '9_waste_generator_tel', notification['9_waste_generator_tel']);
    this.fillTextField(form, '9_waste_generator_fax', notification['9_waste_generator_fax']);
    this.fillTextField(form, '9_waste_generator_email', notification['9_waste_generator_email']);
    this.fillTextField(form, '9_waste_generator_site_process_generation', notification['9_waste_generator_site_process_generation']);

    // Section 10: Facility
    this.fillCheckbox(form, '10_disposal_recovery_facility_type_disposal', notification['10_disposal_recovery_facility_type_disposal']);
    this.fillCheckbox(form, '10_disposal_recovery_facility_type_recovery', notification['10_disposal_recovery_facility_type_recovery']);
    this.fillTextField(form, '10_disposal_recovery_facility_registration_no', notification['10_disposal_recovery_facility_registration_no']);
    this.fillTextField(form, '10_disposal_recovery_facility_name', notification['10_disposal_recovery_facility_name']);
    this.fillTextField(form, '10_disposal_recovery_facility_address', notification['10_disposal_recovery_facility_address']);
    this.fillTextField(form, '10_disposal_recovery_facility_contact_person', notification['10_disposal_recovery_facility_contact_person']);
    this.fillTextField(form, '10_disposal_recovery_facility_tel', notification['10_disposal_recovery_facility_tel']);
    this.fillTextField(form, '10_disposal_recovery_facility_fax', notification['10_disposal_recovery_facility_fax']);
    this.fillTextField(form, '10_disposal_recovery_facility_email', notification['10_disposal_recovery_facility_email']);
    this.fillTextField(form, '10_disposal_recovery_facility_actual_site', notification['10_disposal_recovery_facility_actual_site']);

    // Section 11: Operations
    this.fillTextField(form, '11_disposal_recovery_operations_d_code_r_code', notification['11_disposal_recovery_operations_d_code_r_code']);
    this.fillTextField(form, '11_disposal_recovery_operations_technology', notification['11_disposal_recovery_operations_technology']);
    this.fillTextField(form, '11_disposal_recovery_operations_reason_export', notification['11_disposal_recovery_operations_reason_export']);

    // Section 12: Waste Designation
    this.fillTextField(form, '12_waste_designation', notification['12_waste_designation']);
    this.fillTextField(form, '12_waste_major_constituents_concentrations', notification['12_waste_major_constituents_concentrations']);
    this.fillTextField(form, '12_waste_hazardous_constituents_concentrations', notification['12_waste_hazardous_constituents_concentrations']);
    this.fillCheckbox(form, '12_waste_chemical_analysis_available_yes', notification['12_waste_chemical_analysis_available_yes']);
    this.fillCheckbox(form, '12_waste_chemical_analysis_available_no', notification['12_waste_chemical_analysis_available_no']);

    // Section 13: Physical Characteristics
    this.fillCheckbox(form, '13_physical_characteristics_powdery', notification['13_physical_characteristics_powdery']);
    this.fillCheckbox(form, '13_physical_characteristics_solid', notification['13_physical_characteristics_solid']);
    this.fillCheckbox(form, '13_physical_characteristics_viscous', notification['13_physical_characteristics_viscous']);
    this.fillCheckbox(form, '13_physical_characteristics_sludgy', notification['13_physical_characteristics_sludgy']);
    this.fillCheckbox(form, '13_physical_characteristics_liquid', notification['13_physical_characteristics_liquid']);
    this.fillCheckbox(form, '13_physical_characteristics_gaseous', notification['13_physical_characteristics_gaseous']);
    this.fillTextField(form, '13_physical_characteristics_other', notification['13_physical_characteristics_other']);
    this.fillTextField(form, '13_physical_characteristics_additional_description', notification['13_physical_characteristics_additional_description']);

    // Section 14: Waste Identification
    this.fillTextField(form, '14_waste_identification_basel_annex', notification['14_waste_identification_basel_annex']);
    this.fillTextField(form, '14_waste_identification_oecd_code', notification['14_waste_identification_oecd_code']);
    this.fillTextField(form, '14_waste_identification_ec_list', notification['14_waste_identification_ec_list']);
    this.fillTextField(form, '14_waste_identification_national_code_export', notification['14_waste_identification_national_code_export']);
    this.fillTextField(form, '14_waste_identification_national_code_import', notification['14_waste_identification_national_code_import']);
    this.fillTextField(form, '14_waste_identification_other_code', notification['14_waste_identification_other_code']);
    this.fillTextField(form, '14_waste_identification_y_code', notification['14_waste_identification_y_code']);
    this.fillTextField(form, '14_waste_identification_h_code', notification['14_waste_identification_h_code']);
    this.fillTextField(form, '14_waste_identification_un_class', notification['14_waste_identification_un_class']);
    this.fillTextField(form, '14_waste_identification_un_number', notification['14_waste_identification_un_number']);
    this.fillTextField(form, '14_waste_identification_un_shipping_name', notification['14_waste_identification_un_shipping_name']);
    this.fillTextField(form, '14_waste_identification_customs_code', notification['14_waste_identification_customs_code']);

    // Section 15: Countries
    this.fillTextField(form, '15_countries_states_export_state', notification['15_countries_states_export_state']);
    this.fillTextField(form, '15_countries_states_export_authority_code', notification['15_countries_states_export_authority_code']);
    this.fillTextField(form, '15_countries_states_export_point_exit', notification['15_countries_states_export_point_exit']);
    this.fillTextField(form, '15_countries_states_states_of_transit', notification['15_countries_states_states_of_transit']);
    this.fillTextField(form, '15_countries_states_import_state', notification['15_countries_states_import_state']);
    this.fillTextField(form, '15_countries_states_import_authority_code', notification['15_countries_states_import_authority_code']);
    this.fillTextField(form, '15_countries_states_import_point_entry', notification['15_countries_states_import_point_entry']);

    // Section 16: Customs
    this.fillTextField(form, '16_customs_entry_office', notification['16_customs_entry_office']);
    this.fillTextField(form, '16_customs_exit_office', notification['16_customs_exit_office']);
    this.fillTextField(form, '16_customs_export_office', notification['16_customs_export_office']);

    // Section 17: Declaration
    this.fillTextField(form, '17_exporter_declaration_notifier_name', notification['17_exporter_declaration_notifier_name']);
    this.fillTextField(form, '17_exporter_declaration_date_month', notification['17_exporter_declaration_date_month']);
    this.fillTextField(form, '17_exporter_declaration_date_day', notification['17_exporter_declaration_date_day']);
    this.fillTextField(form, '17_exporter_declaration_date_year', notification['17_exporter_declaration_date_year']);
    this.fillTextField(form, '17_exporter_declaration_signature_status', notification['17_exporter_declaration_signature_status']);
    this.fillCheckbox(form, '17_exporter_declaration_generator_signature_yes', notification['17_exporter_declaration_generator_signature_yes']);
    this.fillCheckbox(form, '17_exporter_declaration_generator_signature_no', notification['17_exporter_declaration_generator_signature_no']);

    // Section 18: Annexes
    this.fillTextField(form, '18_annexes_total_number_attached', notification['18_annexes_total_number_attached']?.toString());
    this.fillTextField(form, '18_annexes_list', notification['18_annexes_list']);
    this.fillCheckbox(form, '18_annexes_chemical_analysis_reports', notification['18_annexes_chemical_analysis_reports']);
    this.fillCheckbox(form, '18_annexes_facility_permits', notification['18_annexes_facility_permits']);
    this.fillCheckbox(form, '18_annexes_transport_contracts', notification['18_annexes_transport_contracts']);
    this.fillCheckbox(form, '18_annexes_insurance_certificates', notification['18_annexes_insurance_certificates']);
    this.fillCheckbox(form, '18_annexes_process_descriptions', notification['18_annexes_process_descriptions']);
    this.fillCheckbox(form, '18_annexes_safety_data_sheets', notification['18_annexes_safety_data_sheets']);
    this.fillCheckbox(form, '18_annexes_routing_information', notification['18_annexes_routing_information']);
    this.fillCheckbox(form, '18_annexes_emergency_procedures', notification['18_annexes_emergency_procedures']);
    this.fillTextField(form, '18_annexes_other_supporting_documents', notification['18_annexes_other_supporting_documents']);

    console.log('All fields filled successfully');
  }

  /**
   * Helper: Fill text field
   */
  private static fillTextField(form: any, fieldName: string, value: string | number | null | undefined) {
    if (value === null || value === undefined) return;

    try {
      const field = form.getTextField(fieldName);
      field.setText(String(value));
    } catch (error) {
      console.warn(`Text field not found in PDF: ${fieldName}`);
    }
  }

  /**
   * Helper: Fill checkbox
   */
  private static fillCheckbox(form: any, fieldName: string, value: boolean | null | undefined) {
    if (value !== true) return;  // Only check if explicitly true

    try {
      const field = form.getCheckBox(fieldName);
      field.check();
    } catch (error) {
      console.warn(`Checkbox not found in PDF: ${fieldName}`);
    }
  }
}
```

---

## Field Mapping JSON Config (Optional)

For easier maintenance, you could externalize the mapping:

```json
// server/src/config/pdf-field-mapping.json
{
  "text_fields": [
    "1_exporter_notifier_registration_no",
    "1_exporter_notifier_name",
    "1_exporter_notifier_address",
    "1_exporter_notifier_contact_person",
    "1_exporter_notifier_tel",
    "1_exporter_notifier_fax",
    "1_exporter_notifier_email",
    "2_importer_consignee_registration_no",
    "2_importer_consignee_name",
    "2_importer_consignee_address",
    "2_importer_consignee_contact_person",
    "2_importer_consignee_tel",
    "2_importer_consignee_fax",
    "2_importer_consignee_email",
    "3_notification_details_notification_no",
    "4_total_intended_shipments_count",
    "5_total_intended_quantity_tonnes",
    "5_total_intended_quantity_m3",
    "6_intended_period_first_departure_month",
    "6_intended_period_first_departure_day",
    "6_intended_period_first_departure_year",
    "6_intended_period_last_departure_month",
    "6_intended_period_last_departure_day",
    "6_intended_period_last_departure_year",
    "7_packaging_type_other",
    "8_intended_carrier_registration_no",
    "8_intended_carrier_name",
    "8_intended_carrier_address",
    "8_intended_carrier_contact_person",
    "8_intended_carrier_tel",
    "8_intended_carrier_fax",
    "8_intended_carrier_email",
    "9_waste_generator_registration_no",
    "9_waste_generator_name",
    "9_waste_generator_address",
    "9_waste_generator_contact_person",
    "9_waste_generator_tel",
    "9_waste_generator_fax",
    "9_waste_generator_email",
    "9_waste_generator_site_process_generation",
    "10_disposal_recovery_facility_registration_no",
    "10_disposal_recovery_facility_name",
    "10_disposal_recovery_facility_address",
    "10_disposal_recovery_facility_contact_person",
    "10_disposal_recovery_facility_tel",
    "10_disposal_recovery_facility_fax",
    "10_disposal_recovery_facility_email",
    "10_disposal_recovery_facility_actual_site",
    "11_disposal_recovery_operations_d_code_r_code",
    "11_disposal_recovery_operations_technology",
    "11_disposal_recovery_operations_reason_export",
    "12_waste_designation",
    "12_waste_major_constituents_concentrations",
    "12_waste_hazardous_constituents_concentrations",
    "13_physical_characteristics_other",
    "13_physical_characteristics_additional_description",
    "14_waste_identification_basel_annex",
    "14_waste_identification_oecd_code",
    "14_waste_identification_ec_list",
    "14_waste_identification_national_code_export",
    "14_waste_identification_national_code_import",
    "14_waste_identification_other_code",
    "14_waste_identification_y_code",
    "14_waste_identification_h_code",
    "14_waste_identification_un_class",
    "14_waste_identification_un_number",
    "14_waste_identification_un_shipping_name",
    "14_waste_identification_customs_code",
    "15_countries_states_export_state",
    "15_countries_states_export_authority_code",
    "15_countries_states_export_point_exit",
    "15_countries_states_states_of_transit",
    "15_countries_states_import_state",
    "15_countries_states_import_authority_code",
    "15_countries_states_import_point_entry",
    "16_customs_entry_office",
    "16_customs_exit_office",
    "16_customs_export_office",
    "17_exporter_declaration_notifier_name",
    "17_exporter_declaration_date_month",
    "17_exporter_declaration_date_day",
    "17_exporter_declaration_date_year",
    "17_exporter_declaration_signature_status",
    "18_annexes_total_number_attached",
    "18_annexes_list",
    "18_annexes_other_supporting_documents"
  ],
  "checkbox_fields": [
    "3_notification_details_individual_shipment",
    "3_notification_details_multiple_shipments",
    "3_notification_details_operation_type_disposal",
    "3_notification_details_operation_type_recovery",
    "3_notification_details_pre_consented_recovery_facility_yes",
    "3_notification_details_pre_consented_recovery_facility_no",
    "7_packaging_type_drum",
    "7_packaging_type_wooden_barrel",
    "7_packaging_type_jerrican",
    "7_packaging_type_box",
    "7_packaging_type_bag",
    "7_packaging_type_composite_packaging",
    "7_packaging_type_pressure_receptacle",
    "7_packaging_type_bulk",
    "7_special_handling_yes",
    "7_special_handling_no",
    "8_intended_carrier_means_road",
    "8_intended_carrier_means_train",
    "8_intended_carrier_means_sea",
    "8_intended_carrier_means_air",
    "8_intended_carrier_means_inland_waterways",
    "10_disposal_recovery_facility_type_disposal",
    "10_disposal_recovery_facility_type_recovery",
    "12_waste_chemical_analysis_available_yes",
    "12_waste_chemical_analysis_available_no",
    "13_physical_characteristics_powdery",
    "13_physical_characteristics_solid",
    "13_physical_characteristics_viscous",
    "13_physical_characteristics_sludgy",
    "13_physical_characteristics_liquid",
    "13_physical_characteristics_gaseous",
    "17_exporter_declaration_generator_signature_yes",
    "17_exporter_declaration_generator_signature_no",
    "18_annexes_chemical_analysis_reports",
    "18_annexes_facility_permits",
    "18_annexes_transport_contracts",
    "18_annexes_insurance_certificates",
    "18_annexes_process_descriptions",
    "18_annexes_safety_data_sheets",
    "18_annexes_routing_information",
    "18_annexes_emergency_procedures"
  ]
}
```

Then use it dynamically:

```typescript
private static fillAllFields(form: any, notification: BaselNotification) {
  const mapping = require('../config/pdf-field-mapping.json');

  // Fill text fields
  mapping.text_fields.forEach((fieldName: string) => {
    this.fillTextField(form, fieldName, notification[fieldName]);
  });

  // Fill checkboxes
  mapping.checkbox_fields.forEach((fieldName: string) => {
    this.fillCheckbox(form, fieldName, notification[fieldName]);
  });
}
```

---

## Testing PDF Generation

### **Test Endpoint:**

```typescript
// server/src/controllers/notificationController.ts
export async function generatePdf(req: Request, res: Response) {
  const { packageId } = req.params;
  const userId = req.user.id;

  try {
    // Get notification
    const notification = await NotificationService.getNotification(packageId, userId);

    // Generate PDF
    const { filename, filepath, filesize } = await PdfService.generateFilledPDF(notification);

    // Save to submission_documents
    const document = await DocumentService.createDocument({
      submission_package_id: packageId,
      created_by_user_id: userId,
      document_type: 'notification',
      document_name: `Basel Notification - ${notification['3_notification_details_notification_no']}`,
      file_path: filepath,
      file_name: filename,
      file_size: filesize,
      file_type: 'application/pdf',
      is_generated: true,
      generated_from_form_id: notification.id
    });

    res.json({
      success: true,
      data: {
        document_id: document.id,
        pdf_url: `/api/packages/${packageId}/documents/${document.id}`,
        file_size: filesize,
        generated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'PDF generation failed', details: error.message }
    });
  }
}
```

---

## Error Handling

### **Common Issues:**

1. **PDF field not found:**
   - PDF form field name doesn't match database column
   - Field is missing from PDF template
   - **Solution:** Log warning, continue with other fields

2. **Invalid field value:**
   - Trying to fill checkbox with non-boolean
   - Trying to fill number field with text
   - **Solution:** Validate and convert types before filling

3. **PDF template missing:**
   - Template file not found
   - **Solution:** Check TEMPLATE_PATH, ensure file exists

4. **File write permission:**
   - Cannot write to OUTPUT_DIR
   - **Solution:** Check directory permissions, create if needed

---

## Next Steps

1. ✅ PDF field mapping strategy complete
2. → Create implementation timeline
3. → Begin Phase 1 implementation

---

**Status:** ✅ PDF field mapping complete and ready for implementation.
