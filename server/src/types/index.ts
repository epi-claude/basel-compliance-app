// User types
export interface User {
  id: string;
  username: string;
  password_hash: string;
  email?: string;
  full_name?: string;
  organization?: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

// Submission Package types
export interface SubmissionPackage {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: 'draft' | 'submitted' | 'archived';
  created_at: string;
  updated_at: string;
  submitted_at?: string;
}

// Basel Notification types
export interface BaselNotification {
  id: string;
  submission_package_id: string;
  created_by_user_id: string;

  // Section 1 (7 fields)
  '1_exporter_notifier_registration_no'?: string;
  '1_exporter_notifier_name'?: string;
  '1_exporter_notifier_address'?: string;
  '1_exporter_notifier_contact_person'?: string;
  '1_exporter_notifier_tel'?: string;
  '1_exporter_notifier_fax'?: string;
  '1_exporter_notifier_email'?: string;

  // Section 2 (7 fields)
  '2_importer_consignee_registration_no'?: string;
  '2_importer_consignee_name'?: string;
  '2_importer_consignee_address'?: string;
  '2_importer_consignee_contact_person'?: string;
  '2_importer_consignee_tel'?: string;
  '2_importer_consignee_fax'?: string;
  '2_importer_consignee_email'?: string;

  // Section 3 (7 fields)
  '3_notification_details_notification_no'?: string;
  '3_notification_details_individual_shipment'?: number; // SQLite boolean
  '3_notification_details_multiple_shipments'?: number;
  '3_notification_details_operation_type_disposal'?: number;
  '3_notification_details_operation_type_recovery'?: number;
  '3_notification_details_pre_consented_recovery_facility_yes'?: number;
  '3_notification_details_pre_consented_recovery_facility_no'?: number;

  // Section 4 (1 field)
  '4_total_intended_shipments_count'?: number;

  // Section 5 (2 fields)
  '5_total_intended_quantity_tonnes'?: number;
  '5_total_intended_quantity_m3'?: number;

  // Section 6 (6 fields)
  '6_intended_period_first_departure_month'?: string;
  '6_intended_period_first_departure_day'?: string;
  '6_intended_period_first_departure_year'?: string;
  '6_intended_period_last_departure_month'?: string;
  '6_intended_period_last_departure_day'?: string;
  '6_intended_period_last_departure_year'?: string;

  // Section 7 (10 fields)
  '7_packaging_type_drum'?: number;
  '7_packaging_type_wooden_barrel'?: number;
  '7_packaging_type_jerrican'?: number;
  '7_packaging_type_box'?: number;
  '7_packaging_type_bag'?: number;
  '7_packaging_type_composite_packaging'?: number;
  '7_packaging_type_pressure_receptacle'?: number;
  '7_packaging_type_bulk'?: number;
  '7_packaging_type_other'?: string;
  '7_special_handling_yes'?: number;
  '7_special_handling_no'?: number;

  // Section 8 (12 fields)
  '8_intended_carrier_registration_no'?: string;
  '8_intended_carrier_name'?: string;
  '8_intended_carrier_address'?: string;
  '8_intended_carrier_contact_person'?: string;
  '8_intended_carrier_tel'?: string;
  '8_intended_carrier_fax'?: string;
  '8_intended_carrier_email'?: string;
  '8_intended_carrier_means_road'?: number;
  '8_intended_carrier_means_train'?: number;
  '8_intended_carrier_means_sea'?: number;
  '8_intended_carrier_means_air'?: number;
  '8_intended_carrier_means_inland_waterways'?: number;

  // Section 9 (8 fields)
  '9_waste_generator_registration_no'?: string;
  '9_waste_generator_name'?: string;
  '9_waste_generator_address'?: string;
  '9_waste_generator_contact_person'?: string;
  '9_waste_generator_tel'?: string;
  '9_waste_generator_fax'?: string;
  '9_waste_generator_email'?: string;
  '9_waste_generator_site_process_generation'?: string;

  // Section 10 (10 fields)
  '10_disposal_recovery_facility_type_disposal'?: number;
  '10_disposal_recovery_facility_type_recovery'?: number;
  '10_disposal_recovery_facility_registration_no'?: string;
  '10_disposal_recovery_facility_name'?: string;
  '10_disposal_recovery_facility_address'?: string;
  '10_disposal_recovery_facility_contact_person'?: string;
  '10_disposal_recovery_facility_tel'?: string;
  '10_disposal_recovery_facility_fax'?: string;
  '10_disposal_recovery_facility_email'?: string;
  '10_disposal_recovery_facility_actual_site'?: string;

  // Section 11 (3 fields)
  '11_disposal_recovery_operations_d_code_r_code'?: string;
  '11_disposal_recovery_operations_technology'?: string;
  '11_disposal_recovery_operations_reason_export'?: string;

  // Section 12 (4 fields)
  '12_waste_designation'?: string;
  '12_waste_major_constituents_concentrations'?: string;
  '12_waste_hazardous_constituents_concentrations'?: string;
  '12_waste_chemical_analysis_available_yes'?: number;
  '12_waste_chemical_analysis_available_no'?: number;

  // Section 13 (8 fields)
  '13_physical_characteristics_powdery'?: number;
  '13_physical_characteristics_solid'?: number;
  '13_physical_characteristics_viscous'?: number;
  '13_physical_characteristics_sludgy'?: number;
  '13_physical_characteristics_liquid'?: number;
  '13_physical_characteristics_gaseous'?: number;
  '13_physical_characteristics_other'?: string;
  '13_physical_characteristics_additional_description'?: string;

  // Section 14 (12 fields)
  '14_waste_identification_basel_annex'?: string;
  '14_waste_identification_oecd_code'?: string;
  '14_waste_identification_ec_list'?: string;
  '14_waste_identification_national_code_export'?: string;
  '14_waste_identification_national_code_import'?: string;
  '14_waste_identification_other_code'?: string;
  '14_waste_identification_y_code'?: string;
  '14_waste_identification_h_code'?: string;
  '14_waste_identification_un_class'?: string;
  '14_waste_identification_un_number'?: string;
  '14_waste_identification_un_shipping_name'?: string;
  '14_waste_identification_customs_code'?: string;

  // Section 15 (7 fields)
  '15_countries_states_export_state'?: string;
  '15_countries_states_export_authority_code'?: string;
  '15_countries_states_export_point_exit'?: string;
  '15_countries_states_states_of_transit'?: string;
  '15_countries_states_import_state'?: string;
  '15_countries_states_import_authority_code'?: string;
  '15_countries_states_import_point_entry'?: string;

  // Section 16 (3 fields)
  '16_customs_entry_office'?: string;
  '16_customs_exit_office'?: string;
  '16_customs_export_office'?: string;

  // Section 17 (6 fields)
  '17_exporter_declaration_notifier_name'?: string;
  '17_exporter_declaration_date_month'?: string;
  '17_exporter_declaration_date_day'?: string;
  '17_exporter_declaration_date_year'?: string;
  '17_exporter_declaration_signature_status'?: string;
  '17_exporter_declaration_generator_signature_yes'?: number;
  '17_exporter_declaration_generator_signature_no'?: number;

  // Section 18 (10 fields)
  '18_annexes_total_number_attached'?: number;
  '18_annexes_list'?: string;
  '18_annexes_chemical_analysis_reports'?: number;
  '18_annexes_facility_permits'?: number;
  '18_annexes_transport_contracts'?: number;
  '18_annexes_insurance_certificates'?: number;
  '18_annexes_process_descriptions'?: number;
  '18_annexes_safety_data_sheets'?: number;
  '18_annexes_routing_information'?: number;
  '18_annexes_emergency_procedures'?: number;
  '18_annexes_other_supporting_documents'?: string;

  // Metadata
  status: 'draft' | 'submitted' | 'archived';
  progress_percentage: number;
  created_at: string;
  updated_at: string;
  submitted_at?: string;
}

// Submission Document types
export interface SubmissionDocument {
  id: string;
  submission_package_id: string;
  created_by_user_id: string;
  document_type: 'notification' | 'movement' | 'chemical_analysis' | 'facility_permit' | 'transport_contract' | 'insurance_certificate' | 'process_description' | 'safety_data_sheet' | 'routing_information' | 'emergency_procedures' | 'other_supporting';
  document_name: string;
  document_description?: string;
  file_path?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  document_date?: string;
  expiry_date?: string;
  reference_number?: string;
  is_generated: number; // SQLite boolean
  generated_from_form_id?: string;
  status: 'uploaded' | 'submitted' | 'verified' | 'archived';
  uploaded_at: string;
  submitted_at?: string;
  verified_at?: string;
}

// JWT Payload
export interface JwtPayload {
  userId: string;
  username: string;
}

// Request with user
export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: string;
  };
}
