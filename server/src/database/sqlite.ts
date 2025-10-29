import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../database/dev.db');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log(`📁 Created database directory: ${dbDir}`);
}

// Initialize database
export const db: Database.Database = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
export function initializeDatabase() {
  const schema = `
    -- ============================================================
    -- Users table
    -- ============================================================
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      email TEXT,
      full_name TEXT,
      organization TEXT,
      role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

    -- ============================================================
    -- Submission packages table (Parent container)
    -- ============================================================
    CREATE TABLE IF NOT EXISTS submission_packages (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'submitted', 'archived')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      submitted_at DATETIME,

      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_packages_user ON submission_packages(user_id);
    CREATE INDEX IF NOT EXISTS idx_packages_status ON submission_packages(status);
    CREATE INDEX IF NOT EXISTS idx_packages_created ON submission_packages(created_at);

    -- ============================================================
    -- Basel notifications table (Main notification form)
    -- ============================================================
    CREATE TABLE IF NOT EXISTS basel_notifications (
      id TEXT PRIMARY KEY,
      submission_package_id TEXT NOT NULL UNIQUE,
      created_by_user_id TEXT NOT NULL,

      -- Section 1: Exporter - Notifier (7 fields)
      "1_exporter_notifier_registration_no" TEXT,
      "1_exporter_notifier_name" TEXT,
      "1_exporter_notifier_address" TEXT,
      "1_exporter_notifier_contact_person" TEXT,
      "1_exporter_notifier_tel" TEXT,
      "1_exporter_notifier_fax" TEXT,
      "1_exporter_notifier_email" TEXT,

      -- Section 2: Importer - Consignee (7 fields)
      "2_importer_consignee_registration_no" TEXT,
      "2_importer_consignee_name" TEXT,
      "2_importer_consignee_address" TEXT,
      "2_importer_consignee_contact_person" TEXT,
      "2_importer_consignee_tel" TEXT,
      "2_importer_consignee_fax" TEXT,
      "2_importer_consignee_email" TEXT,

      -- Section 3: Notification Details (7 fields)
      "3_notification_details_notification_no" TEXT,
      "3_notification_details_individual_shipment" INTEGER,
      "3_notification_details_multiple_shipments" INTEGER,
      "3_notification_details_operation_type_disposal" INTEGER,
      "3_notification_details_operation_type_recovery" INTEGER,
      "3_notification_details_pre_consented_recovery_facility_yes" INTEGER,
      "3_notification_details_pre_consented_recovery_facility_no" INTEGER,

      -- Section 4: Total Intended Number of Shipments (1 field)
      "4_total_intended_shipments_count" INTEGER,

      -- Section 5: Total Intended Quantity (2 fields)
      "5_total_intended_quantity_tonnes" REAL,
      "5_total_intended_quantity_m3" REAL,

      -- Section 6: Intended Period of Time for Shipments (6 fields)
      "6_intended_period_first_departure_month" TEXT,
      "6_intended_period_first_departure_day" TEXT,
      "6_intended_period_first_departure_year" TEXT,
      "6_intended_period_last_departure_month" TEXT,
      "6_intended_period_last_departure_day" TEXT,
      "6_intended_period_last_departure_year" TEXT,

      -- Section 7: Packaging Type(s) and Special Handling (10 fields)
      "7_packaging_type_drum" INTEGER,
      "7_packaging_type_wooden_barrel" INTEGER,
      "7_packaging_type_jerrican" INTEGER,
      "7_packaging_type_box" INTEGER,
      "7_packaging_type_bag" INTEGER,
      "7_packaging_type_composite_packaging" INTEGER,
      "7_packaging_type_pressure_receptacle" INTEGER,
      "7_packaging_type_bulk" INTEGER,
      "7_packaging_type_other" TEXT,
      "7_special_handling_yes" INTEGER,
      "7_special_handling_no" INTEGER,

      -- Section 8: Intended Carrier(s) (12 fields)
      "8_intended_carrier_registration_no" TEXT,
      "8_intended_carrier_name" TEXT,
      "8_intended_carrier_address" TEXT,
      "8_intended_carrier_contact_person" TEXT,
      "8_intended_carrier_tel" TEXT,
      "8_intended_carrier_fax" TEXT,
      "8_intended_carrier_email" TEXT,
      "8_intended_carrier_means_road" INTEGER,
      "8_intended_carrier_means_train" INTEGER,
      "8_intended_carrier_means_sea" INTEGER,
      "8_intended_carrier_means_air" INTEGER,
      "8_intended_carrier_means_inland_waterways" INTEGER,

      -- Section 9: Waste Generator(s) / Producer(s) (8 fields)
      "9_waste_generator_registration_no" TEXT,
      "9_waste_generator_name" TEXT,
      "9_waste_generator_address" TEXT,
      "9_waste_generator_contact_person" TEXT,
      "9_waste_generator_tel" TEXT,
      "9_waste_generator_fax" TEXT,
      "9_waste_generator_email" TEXT,
      "9_waste_generator_site_process_generation" TEXT,

      -- Section 10: Disposal/Recovery Facility (10 fields)
      "10_disposal_recovery_facility_type_disposal" INTEGER,
      "10_disposal_recovery_facility_type_recovery" INTEGER,
      "10_disposal_recovery_facility_registration_no" TEXT,
      "10_disposal_recovery_facility_name" TEXT,
      "10_disposal_recovery_facility_address" TEXT,
      "10_disposal_recovery_facility_contact_person" TEXT,
      "10_disposal_recovery_facility_tel" TEXT,
      "10_disposal_recovery_facility_fax" TEXT,
      "10_disposal_recovery_facility_email" TEXT,
      "10_disposal_recovery_facility_actual_site" TEXT,

      -- Section 11: Disposal/Recovery Operation(s) (3 fields)
      "11_disposal_recovery_operations_d_code_r_code" TEXT,
      "11_disposal_recovery_operations_technology" TEXT,
      "11_disposal_recovery_operations_reason_export" TEXT,

      -- Section 12: Designation and Composition of the Waste (4 fields)
      "12_waste_designation" TEXT,
      "12_waste_major_constituents_concentrations" TEXT,
      "12_waste_hazardous_constituents_concentrations" TEXT,
      "12_waste_chemical_analysis_available_yes" INTEGER,
      "12_waste_chemical_analysis_available_no" INTEGER,

      -- Section 13: Physical Characteristics (8 fields)
      "13_physical_characteristics_powdery" INTEGER,
      "13_physical_characteristics_solid" INTEGER,
      "13_physical_characteristics_viscous" INTEGER,
      "13_physical_characteristics_sludgy" INTEGER,
      "13_physical_characteristics_liquid" INTEGER,
      "13_physical_characteristics_gaseous" INTEGER,
      "13_physical_characteristics_other" TEXT,
      "13_physical_characteristics_additional_description" TEXT,

      -- Section 14: Waste Identification (Codes) (12 fields)
      "14_waste_identification_basel_annex" TEXT,
      "14_waste_identification_oecd_code" TEXT,
      "14_waste_identification_ec_list" TEXT,
      "14_waste_identification_national_code_export" TEXT,
      "14_waste_identification_national_code_import" TEXT,
      "14_waste_identification_other_code" TEXT,
      "14_waste_identification_y_code" TEXT,
      "14_waste_identification_h_code" TEXT,
      "14_waste_identification_un_class" TEXT,
      "14_waste_identification_un_number" TEXT,
      "14_waste_identification_un_shipping_name" TEXT,
      "14_waste_identification_customs_code" TEXT,

      -- Section 15: Countries/States Concerned (7 fields)
      "15_countries_states_export_state" TEXT,
      "15_countries_states_export_authority_code" TEXT,
      "15_countries_states_export_point_exit" TEXT,
      "15_countries_states_states_of_transit" TEXT,
      "15_countries_states_import_state" TEXT,
      "15_countries_states_import_authority_code" TEXT,
      "15_countries_states_import_point_entry" TEXT,

      -- Section 16: Customs Offices (3 fields)
      "16_customs_entry_office" TEXT,
      "16_customs_exit_office" TEXT,
      "16_customs_export_office" TEXT,

      -- Section 17: Exporter's / Generator's Declaration (6 fields)
      "17_exporter_declaration_notifier_name" TEXT,
      "17_exporter_declaration_date_month" TEXT,
      "17_exporter_declaration_date_day" TEXT,
      "17_exporter_declaration_date_year" TEXT,
      "17_exporter_declaration_signature_status" TEXT,
      "17_exporter_declaration_generator_signature_yes" INTEGER,
      "17_exporter_declaration_generator_signature_no" INTEGER,

      -- Section 18: Number of Annexes Attached (10 fields)
      "18_annexes_total_number_attached" INTEGER,
      "18_annexes_list" TEXT,
      "18_annexes_chemical_analysis_reports" INTEGER,
      "18_annexes_facility_permits" INTEGER,
      "18_annexes_transport_contracts" INTEGER,
      "18_annexes_insurance_certificates" INTEGER,
      "18_annexes_process_descriptions" INTEGER,
      "18_annexes_safety_data_sheets" INTEGER,
      "18_annexes_routing_information" INTEGER,
      "18_annexes_emergency_procedures" INTEGER,
      "18_annexes_other_supporting_documents" TEXT,

      -- Metadata
      status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'submitted', 'archived')),
      progress_percentage INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      submitted_at DATETIME,

      FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (submission_package_id) REFERENCES submission_packages(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_notifications_user ON basel_notifications(created_by_user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_package ON basel_notifications(submission_package_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_status ON basel_notifications(status);
    CREATE INDEX IF NOT EXISTS idx_notifications_created ON basel_notifications(created_at);

    -- ============================================================
    -- Submission documents table (All supporting documents)
    -- ============================================================
    CREATE TABLE IF NOT EXISTS submission_documents (
      id TEXT PRIMARY KEY,
      submission_package_id TEXT NOT NULL,
      created_by_user_id TEXT NOT NULL,

      -- Document identification
      document_type TEXT NOT NULL CHECK(document_type IN (
        'notification', 'movement', 'chemical_analysis', 'facility_permit',
        'transport_contract', 'insurance_certificate', 'process_description',
        'safety_data_sheet', 'routing_information', 'emergency_procedures',
        'other_supporting'
      )),

      document_name TEXT NOT NULL,
      document_description TEXT,

      -- File storage
      file_path TEXT,
      file_name TEXT,
      file_size INTEGER,
      file_type TEXT,

      -- Document metadata
      document_date DATE,
      expiry_date DATE,
      reference_number TEXT,

      -- Generation tracking
      is_generated INTEGER DEFAULT 0,
      generated_from_form_id TEXT,

      -- Status
      status TEXT DEFAULT 'uploaded' CHECK(status IN (
        'uploaded', 'submitted', 'verified', 'archived'
      )),

      -- Timestamps
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      submitted_at DATETIME,
      verified_at DATETIME,

      FOREIGN KEY (submission_package_id) REFERENCES submission_packages(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_documents_package ON submission_documents(submission_package_id);
    CREATE INDEX IF NOT EXISTS idx_documents_type ON submission_documents(document_type);
    CREATE INDEX IF NOT EXISTS idx_documents_user ON submission_documents(created_by_user_id);
    CREATE INDEX IF NOT EXISTS idx_documents_uploaded ON submission_documents(uploaded_at);
  `;

  db.exec(schema);
  console.log('✅ Database schema initialized - 4 tables created');
  console.log('   - users');
  console.log('   - submission_packages');
  console.log('   - basel_notifications (115 fields)');
  console.log('   - submission_documents');
}

export default db;
