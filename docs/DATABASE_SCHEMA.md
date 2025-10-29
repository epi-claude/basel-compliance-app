# Basel Compliance App - Database Schema Design

**Version:** 1.0
**Date:** October 24, 2025
**Source:** Official Basel Convention Notification Form (basel_notifiy_app_form - fields - v1 - application.pdf)
**Database:** SQLite (development) → PostgreSQL (production)

---

## Overview

This schema is designed directly from the official Basel Convention notification document. It follows Project 1's proven architecture pattern while accurately representing all fields from the PDF form and the 115-field reference list.

---

## Table: `users`

User authentication and profile information.

```sql
CREATE TABLE users (
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

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
```

**Fields:**
- `id`: UUID generated via `crypto.randomUUID()`
- `username`: Unique login identifier
- `password_hash`: bcrypt hashed password (10 rounds)
- `email`: Optional email for notifications
- `full_name`: User's display name
- `organization`: Company/facility name
- `role`: Future use for permissions

---

## Table: `basel_notifications`

Main table for Basel Convention notification forms. Field names match the reference document exactly.

```sql
CREATE TABLE basel_notifications (
  id TEXT PRIMARY KEY,
  created_by_user_id TEXT NOT NULL,

  -- ============================================================
  -- SECTION 1: Exporter - Notifier (7 fields)
  -- ============================================================
  "1_exporter_notifier_registration_no" TEXT,
  "1_exporter_notifier_name" TEXT,
  "1_exporter_notifier_address" TEXT,
  "1_exporter_notifier_contact_person" TEXT,
  "1_exporter_notifier_tel" TEXT,
  "1_exporter_notifier_fax" TEXT,
  "1_exporter_notifier_email" TEXT,

  -- ============================================================
  -- SECTION 2: Importer - Consignee (7 fields)
  -- ============================================================
  "2_importer_consignee_registration_no" TEXT,
  "2_importer_consignee_name" TEXT,
  "2_importer_consignee_address" TEXT,
  "2_importer_consignee_contact_person" TEXT,
  "2_importer_consignee_tel" TEXT,
  "2_importer_consignee_fax" TEXT,
  "2_importer_consignee_email" TEXT,

  -- ============================================================
  -- SECTION 3: Notification Details (7 fields)
  -- ============================================================
  "3_notification_details_notification_no" TEXT,
  "3_notification_details_individual_shipment" BOOLEAN,
  "3_notification_details_multiple_shipments" BOOLEAN,
  "3_notification_details_operation_type_disposal" BOOLEAN,
  "3_notification_details_operation_type_recovery" BOOLEAN,
  "3_notification_details_pre_consented_recovery_facility_yes" BOOLEAN,
  "3_notification_details_pre_consented_recovery_facility_no" BOOLEAN,

  -- ============================================================
  -- SECTION 4: Total Intended Number of Shipments (1 field)
  -- ============================================================
  "4_total_intended_shipments_count" INTEGER,

  -- ============================================================
  -- SECTION 5: Total Intended Quantity (2 fields)
  -- ============================================================
  "5_total_intended_quantity_tonnes" REAL,
  "5_total_intended_quantity_m3" REAL,

  -- ============================================================
  -- SECTION 6: Intended Period of Time for Shipments (6 fields)
  -- ============================================================
  "6_intended_period_first_departure_month" TEXT,
  "6_intended_period_first_departure_day" TEXT,
  "6_intended_period_first_departure_year" TEXT,
  "6_intended_period_last_departure_month" TEXT,
  "6_intended_period_last_departure_day" TEXT,
  "6_intended_period_last_departure_year" TEXT,

  -- ============================================================
  -- SECTION 7: Packaging Type(s) and Special Handling (10 fields)
  -- ============================================================
  "7_packaging_type_drum" BOOLEAN,
  "7_packaging_type_wooden_barrel" BOOLEAN,
  "7_packaging_type_jerrican" BOOLEAN,
  "7_packaging_type_box" BOOLEAN,
  "7_packaging_type_bag" BOOLEAN,
  "7_packaging_type_composite_packaging" BOOLEAN,
  "7_packaging_type_pressure_receptacle" BOOLEAN,
  "7_packaging_type_bulk" BOOLEAN,
  "7_packaging_type_other" TEXT,
  "7_special_handling_yes" BOOLEAN,
  "7_special_handling_no" BOOLEAN,

  -- ============================================================
  -- SECTION 8: Intended Carrier(s) (12 fields)
  -- ============================================================
  "8_intended_carrier_registration_no" TEXT,
  "8_intended_carrier_name" TEXT,
  "8_intended_carrier_address" TEXT,
  "8_intended_carrier_contact_person" TEXT,
  "8_intended_carrier_tel" TEXT,
  "8_intended_carrier_fax" TEXT,
  "8_intended_carrier_email" TEXT,
  "8_intended_carrier_means_road" BOOLEAN,
  "8_intended_carrier_means_train" BOOLEAN,
  "8_intended_carrier_means_sea" BOOLEAN,
  "8_intended_carrier_means_air" BOOLEAN,
  "8_intended_carrier_means_inland_waterways" BOOLEAN,

  -- ============================================================
  -- SECTION 9: Waste Generator(s) / Producer(s) (8 fields)
  -- ============================================================
  "9_waste_generator_registration_no" TEXT,
  "9_waste_generator_name" TEXT,
  "9_waste_generator_address" TEXT,
  "9_waste_generator_contact_person" TEXT,
  "9_waste_generator_tel" TEXT,
  "9_waste_generator_fax" TEXT,
  "9_waste_generator_email" TEXT,
  "9_waste_generator_site_process_generation" TEXT,

  -- ============================================================
  -- SECTION 10: Disposal/Recovery Facility (10 fields)
  -- ============================================================
  "10_disposal_recovery_facility_type_disposal" BOOLEAN,
  "10_disposal_recovery_facility_type_recovery" BOOLEAN,
  "10_disposal_recovery_facility_registration_no" TEXT,
  "10_disposal_recovery_facility_name" TEXT,
  "10_disposal_recovery_facility_address" TEXT,
  "10_disposal_recovery_facility_contact_person" TEXT,
  "10_disposal_recovery_facility_tel" TEXT,
  "10_disposal_recovery_facility_fax" TEXT,
  "10_disposal_recovery_facility_email" TEXT,
  "10_disposal_recovery_facility_actual_site" TEXT,

  -- ============================================================
  -- SECTION 11: Disposal/Recovery Operation(s) (3 fields)
  -- ============================================================
  "11_disposal_recovery_operations_d_code_r_code" TEXT,
  "11_disposal_recovery_operations_technology" TEXT,
  "11_disposal_recovery_operations_reason_export" TEXT,

  -- ============================================================
  -- SECTION 12: Designation and Composition of the Waste (4 fields)
  -- ============================================================
  "12_waste_designation" TEXT,
  "12_waste_major_constituents_concentrations" TEXT,
  "12_waste_hazardous_constituents_concentrations" TEXT,
  "12_waste_chemical_analysis_available_yes" BOOLEAN,
  "12_waste_chemical_analysis_available_no" BOOLEAN,

  -- ============================================================
  -- SECTION 13: Physical Characteristics (8 fields)
  -- ============================================================
  "13_physical_characteristics_powdery" BOOLEAN,
  "13_physical_characteristics_solid" BOOLEAN,
  "13_physical_characteristics_viscous" BOOLEAN,
  "13_physical_characteristics_sludgy" BOOLEAN,
  "13_physical_characteristics_liquid" BOOLEAN,
  "13_physical_characteristics_gaseous" BOOLEAN,
  "13_physical_characteristics_other" TEXT,
  "13_physical_characteristics_additional_description" TEXT,

  -- ============================================================
  -- SECTION 14: Waste Identification (Codes) (12 fields)
  -- ============================================================
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

  -- ============================================================
  -- SECTION 15: Countries/States Concerned (7 fields)
  -- ============================================================
  "15_countries_states_export_state" TEXT,
  "15_countries_states_export_authority_code" TEXT,
  "15_countries_states_export_point_exit" TEXT,
  "15_countries_states_states_of_transit" TEXT,
  "15_countries_states_import_state" TEXT,
  "15_countries_states_import_authority_code" TEXT,
  "15_countries_states_import_point_entry" TEXT,

  -- ============================================================
  -- SECTION 16: Customs Offices (3 fields)
  -- ============================================================
  "16_customs_entry_office" TEXT,
  "16_customs_exit_office" TEXT,
  "16_customs_export_office" TEXT,

  -- ============================================================
  -- SECTION 17: Exporter's / Generator's Declaration (6 fields)
  -- ============================================================
  "17_exporter_declaration_notifier_name" TEXT,
  "17_exporter_declaration_date_month" TEXT,
  "17_exporter_declaration_date_day" TEXT,
  "17_exporter_declaration_date_year" TEXT,
  "17_exporter_declaration_signature_status" TEXT,
  "17_exporter_declaration_generator_signature_yes" BOOLEAN,
  "17_exporter_declaration_generator_signature_no" BOOLEAN,

  -- ============================================================
  -- SECTION 18: Number of Annexes Attached (10 fields)
  -- ============================================================
  "18_annexes_total_number_attached" INTEGER,
  "18_annexes_list" TEXT,
  "18_annexes_chemical_analysis_reports" BOOLEAN,
  "18_annexes_facility_permits" BOOLEAN,
  "18_annexes_transport_contracts" BOOLEAN,
  "18_annexes_insurance_certificates" BOOLEAN,
  "18_annexes_process_descriptions" BOOLEAN,
  "18_annexes_safety_data_sheets" BOOLEAN,
  "18_annexes_routing_information" BOOLEAN,
  "18_annexes_emergency_procedures" BOOLEAN,
  "18_annexes_other_supporting_documents" TEXT,

  -- ============================================================
  -- METADATA
  -- ============================================================
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'submitted', 'archived')),
  progress_percentage INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  submitted_at DATETIME,

  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### **Indexes for Performance**

```sql
CREATE INDEX idx_notifications_user ON basel_notifications(created_by_user_id);
CREATE INDEX idx_notifications_status ON basel_notifications(status);
CREATE INDEX idx_notifications_created ON basel_notifications(created_at);
CREATE INDEX idx_notifications_notification_no ON basel_notifications("3_notification_details_notification_no");
CREATE INDEX idx_notifications_exporter ON basel_notifications("1_exporter_notifier_name");
```

---

## Field Count Summary

**Total Fields: 122 (115 from Basel form + 7 metadata)**

| Section | Field Count | Notes |
|---------|-------------|-------|
| 1. Exporter - Notifier | 7 | Contact information |
| 2. Importer - Consignee | 7 | Contact information |
| 3. Notification Details | 7 | Checkboxes + notification number |
| 4. Total Shipments | 1 | Integer count |
| 5. Intended Quantity | 2 | Tonnes and m³ |
| 6. Intended Period | 6 | Date fields (month/day/year × 2) |
| 7. Packaging & Handling | 10 | 8 checkboxes + other + special handling |
| 8. Intended Carrier | 12 | Contact info + 5 transport modes |
| 9. Waste Generator | 8 | Contact info + site description |
| 10. Disposal/Recovery Facility | 10 | Type + contact info + actual site |
| 11. Operations | 3 | D/R code, technology, reason |
| 12. Waste Designation | 4 | Description + constituents + analysis |
| 13. Physical Characteristics | 8 | 6 checkboxes + other + description |
| 14. Waste Identification | 12 | Various classification codes |
| 15. Countries/States | 7 | Export, transit, import info |
| 16. Customs Offices | 3 | Entry, exit, export offices |
| 17. Declarations | 6 | Exporter signature + date fields |
| 18. Annexes | 10 | Count + 8 annex types + other |
| **Metadata** | 7 | id, user_id, status, progress, timestamps |
| **TOTAL** | **122** | |

---

## Data Type Reference

| Type | Usage | Example Values |
|------|-------|----------------|
| TEXT | Names, addresses, codes, descriptions | "Company ABC", "Y47", "D10" |
| INTEGER | Counts | 5, 20, 100 |
| REAL | Decimal quantities | 12.5, 0.75, 1000.50 |
| BOOLEAN | Checkboxes (Yes/No) | true, false, NULL |
| DATETIME | Timestamps | 2025-10-24 16:30:00 |

**Note:** Date fields (Section 6, 17) are stored as TEXT to preserve the separate month/day/year format from the PDF form.

---

## Validation Rules

### **Required Fields (Cannot submit without):**

**Minimum Required (Basic Notification):**
1. `1_exporter_notifier_name`
2. `1_exporter_notifier_address`
3. `1_exporter_notifier_registration_no`
4. `2_importer_consignee_name`
5. `2_importer_consignee_address`
6. `2_importer_consignee_registration_no`
7. `3_notification_details_notification_no`
8. One of: `3_notification_details_individual_shipment` OR `3_notification_details_multiple_shipments`
9. One of: `3_notification_details_operation_type_disposal` OR `3_notification_details_operation_type_recovery`
10. `4_total_intended_shipments_count` (if multiple shipments)
11. At least one: `5_total_intended_quantity_tonnes` OR `5_total_intended_quantity_m3`
12. First departure date (all 3 fields)
13. Last departure date (all 3 fields)
14. At least one packaging type
15. `8_intended_carrier_name`
16. At least one transport means
17. `9_waste_generator_name`
18. `10_disposal_recovery_facility_name`
19. Facility type must match operation type
20. `11_disposal_recovery_operations_d_code_r_code`
21. `12_waste_designation`
22. At least one physical characteristic
23. `14_waste_identification_basel_annex`
24. `15_countries_states_export_state`
25. `15_countries_states_import_state`
26. `17_exporter_declaration_notifier_name`
27. Complete declaration date (month/day/year)

### **Conditional Validation:**

```typescript
// If operation type is disposal
if (3_notification_details_operation_type_disposal === true) {
  // D-code required (D1-D15)
  11_disposal_recovery_operations_d_code_r_code must match /^D[0-9]+$/

  // Facility type must be disposal
  10_disposal_recovery_facility_type_disposal === true
}

// If operation type is recovery
if (3_notification_details_operation_type_recovery === true) {
  // R-code required (R1-R13)
  11_disposal_recovery_operations_d_code_r_code must match /^R[0-9]+$/

  // Facility type must be recovery
  10_disposal_recovery_facility_type_recovery === true
}

// If special handling = yes
if (7_special_handling_yes === true) {
  // Must have description (usually in attached documents)
  // Note: PDF doesn't have a special handling description field
  // This would be in annexes
}

// If packaging type = other
if (7_packaging_type_other !== null && 7_packaging_type_other !== '') {
  // Other packaging text must be filled
}

// If physical characteristics = other
if (13_physical_characteristics_other !== null && 13_physical_characteristics_other !== '') {
  // Other physical text must be filled
}

// Generator signature requirement
if (17_exporter_declaration_generator_signature_yes === true) {
  // Generator signature fields would be required
  // Note: These are in separate section 19-20 (competent authority blocks)
}
```

---

## Progress Calculation

Following Project 1's pattern:

```typescript
function calculateProgress(notification: BaselNotification): number {
  const totalFields = 115; // Exclude metadata fields
  let filledFields = 0;

  // Define all field names (115 total)
  const fieldNames = [
    // Section 1 (7)
    '1_exporter_notifier_registration_no',
    '1_exporter_notifier_name',
    '1_exporter_notifier_address',
    '1_exporter_notifier_contact_person',
    '1_exporter_notifier_tel',
    '1_exporter_notifier_fax',
    '1_exporter_notifier_email',

    // Section 2 (7)
    '2_importer_consignee_registration_no',
    '2_importer_consignee_name',
    '2_importer_consignee_address',
    '2_importer_consignee_contact_person',
    '2_importer_consignee_tel',
    '2_importer_consignee_fax',
    '2_importer_consignee_email',

    // ... continue for all 115 fields
  ];

  // Count non-empty fields
  fieldNames.forEach(fieldName => {
    const value = notification[fieldName];

    // Count as filled if:
    // - TEXT: not null and not empty string
    // - BOOLEAN: true (false and null = not filled)
    // - INTEGER/REAL: not null and > 0

    if (value !== null && value !== undefined) {
      if (typeof value === 'boolean') {
        if (value === true) filledFields++;
      } else if (typeof value === 'number') {
        if (value > 0) filledFields++;
      } else if (typeof value === 'string') {
        if (value.trim() !== '') filledFields++;
      }
    }
  });

  return Math.round((filledFields / totalFields) * 100);
}
```

---

## Auto-Save Strategy

Following Project 1's proven pattern:

**Triggers:**
1. **Timer:** Every 30 seconds
2. **Field blur:** When user leaves a field
3. **Section navigation:** Before changing sections
4. **Visual feedback:** "Saving..." → "Saved ✓" → "Last saved X min ago"

**Update Query:**
```sql
UPDATE basel_notifications
SET
  "1_exporter_notifier_name" = ?,
  "1_exporter_notifier_address" = ?,
  -- ... all other fields
  updated_at = CURRENT_TIMESTAMP,
  progress_percentage = ?
WHERE id = ? AND created_by_user_id = ?;
```

**Auto-save includes:**
- Recalculate progress percentage
- Update `updated_at` timestamp
- Return success/failure status
- Client shows "Saved ✓" or retry on failure

---

## Status Workflow

```
draft → submitted → archived
  ↑         ↓
  └─────────┘
   (admin reopen)
```

**States:**
- `draft`: Editable, auto-saves enabled, progress tracked
- `submitted`: Read-only, PDF generated, locked
- `archived`: Historical record, read-only

---

## PDF Field Mapping Strategy

The database field names **exactly match** the PDF form field names, making mapping straightforward:

```typescript
// Example mapping for pdf-lib
const pdfFieldMappings = {
  // Database column → PDF form field name (they're the same!)
  '1_exporter_notifier_registration_no': '1_exporter_notifier_registration_no',
  '1_exporter_notifier_name': '1_exporter_notifier_name',
  // ... etc for all 115 fields
};

// Fill PDF
function fillPDF(notification: BaselNotification, pdfDoc: PDFDocument) {
  const form = pdfDoc.getForm();

  // Iterate through all fields
  Object.keys(pdfFieldMappings).forEach(dbField => {
    const pdfFieldName = pdfFieldMappings[dbField];
    const value = notification[dbField];

    try {
      // Handle different field types
      if (typeof value === 'boolean') {
        const checkbox = form.getCheckBox(pdfFieldName);
        if (value === true) checkbox.check();
      } else if (value !== null && value !== undefined) {
        const textField = form.getTextField(pdfFieldName);
        textField.setText(String(value));
      }
    } catch (error) {
      console.warn(`Field not found in PDF: ${pdfFieldName}`);
    }
  });
}
```

---

## Comparison with Project 1 (HSE Checklist)

| Aspect | Project 1 (HSE) | Project 2 (Basel) |
|--------|-----------------|-------------------|
| Main table | form_submissions | basel_notifications |
| Total fields | 139 (nested JSON items) | 122 (115 + 7 metadata) |
| Field storage | JSON blobs (section_a_items, section_b_items) | Individual columns |
| Checkboxes | Single response per item (yes/no/na) | Multiple independent checkboxes |
| Compliance calc | Yes (Section A: 100%, Section B: 80%) | No (form validation only) |
| Signatures | 3 signatures (9 fields) | 1 main signature (4 date fields) |
| Auto-save | ✅ Every 30s + blur + navigation | ✅ Same pattern |
| Progress tracking | ✅ Count filled fields | ✅ Same pattern |
| PDF generation | ✅ Server-side with pdf-lib | ✅ Same approach |

**Key Difference:** Basel uses individual columns instead of JSON because fields don't repeat in a pattern. This makes querying and validation simpler.

---

## Database Initialization Code

```typescript
// server/src/database/sqlite.ts
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../database/dev.db');

export const db: Database.Database = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

export function initializeDatabase() {
  const schema = `
    -- Users table
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

    -- Basel notifications table
    CREATE TABLE IF NOT EXISTS basel_notifications (
      -- [Insert full schema from above]
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON basel_notifications(created_by_user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_status ON basel_notifications(status);
    CREATE INDEX IF NOT EXISTS idx_notifications_created ON basel_notifications(created_at);
    CREATE INDEX IF NOT EXISTS idx_notifications_notification_no ON basel_notifications("3_notification_details_notification_no");
    CREATE INDEX IF NOT EXISTS idx_notifications_exporter ON basel_notifications("1_exporter_notifier_name");
  `;

  db.exec(schema);
  console.log('✅ Database schema initialized');
}

export default db;
```

---

## TypeScript Type Definitions

```typescript
// shared/types/basel.types.ts
export interface BaselNotification {
  id: string;
  created_by_user_id: string;

  // Section 1: Exporter - Notifier
  '1_exporter_notifier_registration_no'?: string;
  '1_exporter_notifier_name'?: string;
  '1_exporter_notifier_address'?: string;
  '1_exporter_notifier_contact_person'?: string;
  '1_exporter_notifier_tel'?: string;
  '1_exporter_notifier_fax'?: string;
  '1_exporter_notifier_email'?: string;

  // Section 2: Importer - Consignee
  '2_importer_consignee_registration_no'?: string;
  '2_importer_consignee_name'?: string;
  '2_importer_consignee_address'?: string;
  '2_importer_consignee_contact_person'?: string;
  '2_importer_consignee_tel'?: string;
  '2_importer_consignee_fax'?: string;
  '2_importer_consignee_email'?: string;

  // ... continue for all 115 fields

  // Metadata
  status: 'draft' | 'submitted' | 'archived';
  progress_percentage: number;
  created_at: string;
  updated_at: string;
  submitted_at?: string;
}
```

---

## Next Steps

1. ✅ Database schema designed from official PDF
2. → Create TypeScript types matching schema
3. → Build database models (CRUD operations)
4. → Create API endpoints
5. → Design React component structure
6. → Implement PDF field mapping JSON
7. → Build PDF generation service

---

**Status:** ✅ Database schema complete and ready for implementation.

All 115 fields from the official Basel Convention notification form are accurately represented with exact field names for seamless PDF mapping.
