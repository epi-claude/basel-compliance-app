# Enhanced Database Schema - Multi-Document Submission Tracking

**Version:** 2.0
**Date:** October 24, 2025
**Enhancement:** Parent-child document tracking for complete submission packages

---

## Problem Statement

The Basel Convention process involves **multiple related documents**:

1. **Notification Document** (main form - what we've designed)
2. **Movement Documents** (one per shipment - tracks actual transport)
3. **Annex Documents** (supporting materials referenced in Section 18):
   - Chemical analysis reports
   - Facility permits
   - Transport contracts
   - Insurance certificates
   - Process descriptions
   - Safety data sheets
   - Routing information
   - Emergency procedures
   - Other supporting documents

**Current Issue:** Our schema only tracks the notification form. We need to track the entire submission package as a unit.

---

## Proposed Solution: 3-Table Architecture

### **Table 1: `submission_packages` (NEW - Parent)**
Groups all related documents under one submission ID

### **Table 2: `basel_notifications` (Enhanced - Child)**
Main notification form (one per package)

### **Table 3: `submission_documents` (NEW - Child)**
All supporting documents attached to a package

---

## Enhanced Schema Design

### **Table 1: `submission_packages`**

```sql
CREATE TABLE submission_packages (
  id TEXT PRIMARY KEY,
  created_by_user_id TEXT NOT NULL,

  -- Package identification
  package_reference TEXT UNIQUE NOT NULL, -- User-friendly: "PKG-2025-001"
  package_name TEXT, -- "E-waste Export to USA - Oct 2025"

  -- Package status
  status TEXT DEFAULT 'draft' CHECK(status IN (
    'draft',           -- Being prepared
    'submitted',       -- Submitted to authorities
    'under_review',    -- Being reviewed
    'approved',        -- Approved by authorities
    'rejected',        -- Rejected by authorities
    'in_transit',      -- Shipment(s) in progress
    'completed',       -- All shipments completed
    'archived'         -- Historical record
  )),

  -- Key dates
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  submitted_at DATETIME,
  reviewed_at DATETIME,
  approved_at DATETIME,
  completed_at DATETIME,

  -- Summary information (denormalized for dashboard performance)
  notification_no TEXT, -- From notification form Section 3
  exporter_name TEXT,   -- From notification form Section 1
  importer_name TEXT,   -- From notification form Section 2
  waste_type TEXT,      -- From notification form Section 12
  total_documents INTEGER DEFAULT 0, -- Count of attached documents

  -- Notes and history
  package_notes TEXT,
  authority_feedback TEXT,

  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_packages_user ON submission_packages(created_by_user_id);
CREATE INDEX idx_packages_status ON submission_packages(status);
CREATE INDEX idx_packages_reference ON submission_packages(package_reference);
CREATE INDEX idx_packages_notification_no ON submission_packages(notification_no);
CREATE INDEX idx_packages_created ON submission_packages(created_at);
```

---

### **Table 2: `basel_notifications` (Enhanced)**

Add foreign key to link to parent package:

```sql
CREATE TABLE basel_notifications (
  id TEXT PRIMARY KEY,
  submission_package_id TEXT NOT NULL, -- NEW: Link to parent package
  created_by_user_id TEXT NOT NULL,

  -- [All 115 Basel fields remain the same]
  "1_exporter_notifier_registration_no" TEXT,
  "1_exporter_notifier_name" TEXT,
  -- ... (all fields from previous schema)

  -- Metadata
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'submitted', 'archived')),
  progress_percentage INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  submitted_at DATETIME,

  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (submission_package_id) REFERENCES submission_packages(id) ON DELETE CASCADE
);

-- Constraint: One notification per package
CREATE UNIQUE INDEX idx_notifications_package ON basel_notifications(submission_package_id);
```

---

### **Table 3: `submission_documents` (NEW)**

Tracks all supporting documents attached to a submission package:

```sql
CREATE TABLE submission_documents (
  id TEXT PRIMARY KEY,
  submission_package_id TEXT NOT NULL,
  created_by_user_id TEXT NOT NULL,

  -- Document identification
  document_type TEXT NOT NULL CHECK(document_type IN (
    'notification',              -- Main notification PDF
    'movement',                  -- Movement document
    'chemical_analysis',         -- Annex type from Section 18
    'facility_permit',
    'transport_contract',
    'insurance_certificate',
    'process_description',
    'safety_data_sheet',
    'routing_information',
    'emergency_procedures',
    'other_supporting'
  )),

  document_name TEXT NOT NULL, -- "Chemical Analysis - Batch A123"
  document_description TEXT,

  -- File storage
  file_path TEXT, -- Server file path or cloud storage URL
  file_name TEXT, -- Original filename
  file_size INTEGER, -- Bytes
  file_type TEXT, -- MIME type: application/pdf, image/jpeg

  -- Document metadata
  document_date DATE, -- Date on the document itself
  expiry_date DATE, -- For permits, certificates
  reference_number TEXT, -- External document reference

  -- Generation tracking
  is_generated BOOLEAN DEFAULT false, -- true = auto-generated PDF, false = uploaded
  generated_from_form_id TEXT, -- If generated, which form?

  -- Status
  status TEXT DEFAULT 'uploaded' CHECK(status IN (
    'uploaded',   -- File uploaded, not yet submitted
    'submitted',  -- Submitted with package
    'verified',   -- Verified by authorities
    'archived'    -- Historical
  )),

  -- Timestamps
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  submitted_at DATETIME,
  verified_at DATETIME,

  FOREIGN KEY (submission_package_id) REFERENCES submission_packages(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_documents_package ON submission_documents(submission_package_id);
CREATE INDEX idx_documents_type ON submission_documents(document_type);
CREATE INDEX idx_documents_user ON submission_documents(created_by_user_id);
CREATE INDEX idx_documents_uploaded ON submission_documents(uploaded_at);
```

---

## Complete Relationship Diagram

```
users (1) ──────┬──────> (M) submission_packages
                │
                └──────> (M) basel_notifications
                │
                └──────> (M) submission_documents

submission_packages (1) ─> (1) basel_notifications
                        └─> (M) submission_documents
```

**Relationships:**
- One user can have many packages
- One package has exactly ONE notification form
- One package can have many supporting documents
- One notification generates one PDF document entry

---

## Example Data Flow

### **Step 1: User creates a new submission**

```sql
-- Create package
INSERT INTO submission_packages (id, created_by_user_id, package_reference, package_name)
VALUES ('pkg_123', 'user_456', 'PKG-2025-001', 'E-waste Export Oct 2025');

-- Create notification form (linked to package)
INSERT INTO basel_notifications (id, submission_package_id, created_by_user_id)
VALUES ('notif_789', 'pkg_123', 'user_456');
```

### **Step 2: User fills out notification form**

```sql
-- Auto-save updates notification
UPDATE basel_notifications
SET
  "1_exporter_notifier_name" = 'ABC Company',
  "2_importer_consignee_name" = 'XYZ Recovery',
  progress_percentage = 45,
  updated_at = CURRENT_TIMESTAMP
WHERE id = 'notif_789';

-- Also update package summary
UPDATE submission_packages
SET
  exporter_name = 'ABC Company',
  importer_name = 'XYZ Recovery',
  updated_at = CURRENT_TIMESTAMP
WHERE id = 'pkg_123';
```

### **Step 3: User uploads supporting documents**

```sql
-- Upload chemical analysis report
INSERT INTO submission_documents (
  id, submission_package_id, created_by_user_id,
  document_type, document_name, file_path, file_name, file_size, file_type
)
VALUES (
  'doc_001', 'pkg_123', 'user_456',
  'chemical_analysis', 'Lab Report - Batch A123',
  '/uploads/pkg_123/chem_report.pdf', 'lab_report_20251024.pdf',
  245678, 'application/pdf'
);

-- Upload facility permit
INSERT INTO submission_documents (...)
VALUES (...);

-- Update package document count
UPDATE submission_packages
SET total_documents = 3, updated_at = CURRENT_TIMESTAMP
WHERE id = 'pkg_123';
```

### **Step 4: System generates notification PDF**

```sql
-- When notification form is submitted, generate PDF
INSERT INTO submission_documents (
  id, submission_package_id, created_by_user_id,
  document_type, document_name,
  file_path, file_name, file_size, file_type,
  is_generated, generated_from_form_id
)
VALUES (
  'doc_002', 'pkg_123', 'user_456',
  'notification', 'Basel Notification - PKG-2025-001',
  '/generated/pkg_123/notification.pdf', 'notification_pkg_2025_001.pdf',
  145823, 'application/pdf',
  true, 'notif_789'
);
```

### **Step 5: User submits entire package**

```sql
-- Submit package
UPDATE submission_packages
SET
  status = 'submitted',
  submitted_at = CURRENT_TIMESTAMP
WHERE id = 'pkg_123';

-- Mark notification as submitted
UPDATE basel_notifications
SET
  status = 'submitted',
  submitted_at = CURRENT_TIMESTAMP
WHERE id = 'notif_789';

-- Mark all documents as submitted
UPDATE submission_documents
SET
  status = 'submitted',
  submitted_at = CURRENT_TIMESTAMP
WHERE submission_package_id = 'pkg_123';
```

---

## API Endpoint Implications

### **New Endpoints Needed:**

```typescript
// Package management
POST   /api/packages              // Create new submission package
GET    /api/packages              // List all packages for user
GET    /api/packages/:id          // Get package details + all documents
PATCH  /api/packages/:id          // Update package metadata
POST   /api/packages/:id/submit   // Submit entire package
DELETE /api/packages/:id          // Delete draft package

// Notification form (scoped to package)
POST   /api/packages/:packageId/notification         // Create notification
GET    /api/packages/:packageId/notification         // Get notification
PATCH  /api/packages/:packageId/notification         // Auto-save notification
POST   /api/packages/:packageId/notification/submit  // Finalize notification

// Supporting documents (scoped to package)
POST   /api/packages/:packageId/documents            // Upload document
GET    /api/packages/:packageId/documents            // List all documents
GET    /api/packages/:packageId/documents/:docId     // Download document
DELETE /api/packages/:packageId/documents/:docId     // Delete document
PATCH  /api/packages/:packageId/documents/:docId     // Update metadata

// PDF generation
POST   /api/packages/:packageId/generate-pdf         // Generate notification PDF
GET    /api/packages/:packageId/download-all         // ZIP of all documents
```

---

## Dashboard View Implications

### **Old View (Single Form):**
```
My Forms
├─ School Building A - 45% complete
├─ School Building B - 100% submitted
└─ School Building C - 12% draft
```

### **New View (Packages with Documents):**
```
My Submission Packages
├─ PKG-2025-001: E-waste Export Oct 2025 [Submitted]
│  ├─ Notification Form (100% complete)
│  ├─ Chemical Analysis Report ✓
│  ├─ Facility Permit ✓
│  ├─ Insurance Certificate ✓
│  └─ [4 documents total]
│
├─ PKG-2025-002: Battery Recycling [Draft - 67%]
│  ├─ Notification Form (67% complete)
│  ├─ Chemical Analysis Report ✓
│  └─ [1 document, missing permits]
│
└─ PKG-2025-003: Plastic Waste [Draft - 23%]
   ├─ Notification Form (23% complete)
   └─ [No supporting documents yet]
```

---

## Query Examples

### **Get complete package with all documents:**

```sql
SELECT
  p.*,
  n.progress_percentage as notification_progress,
  COUNT(d.id) as total_documents
FROM submission_packages p
LEFT JOIN basel_notifications n ON p.id = n.submission_package_id
LEFT JOIN submission_documents d ON p.id = d.submission_package_id
WHERE p.id = 'pkg_123'
GROUP BY p.id;

-- Also get document list
SELECT * FROM submission_documents
WHERE submission_package_id = 'pkg_123'
ORDER BY uploaded_at DESC;
```

### **Check if package is ready to submit:**

```sql
-- Validation query
SELECT
  p.id,
  p.package_reference,
  n.progress_percentage,
  n.status as notification_status,
  COUNT(d.id) as document_count,

  -- Required checks
  CASE WHEN n.progress_percentage >= 100 THEN 1 ELSE 0 END as notification_complete,
  CASE WHEN COUNT(d.id) >= 1 THEN 1 ELSE 0 END as has_documents

FROM submission_packages p
JOIN basel_notifications n ON p.id = n.submission_package_id
LEFT JOIN submission_documents d ON p.id = d.submission_package_id
WHERE p.id = 'pkg_123'
GROUP BY p.id;
```

### **Dashboard summary (all packages for user):**

```sql
SELECT
  p.id,
  p.package_reference,
  p.package_name,
  p.status,
  p.exporter_name,
  p.importer_name,
  p.notification_no,
  p.total_documents,
  p.created_at,
  p.updated_at,
  p.submitted_at,
  n.progress_percentage
FROM submission_packages p
LEFT JOIN basel_notifications n ON p.id = n.submission_package_id
WHERE p.created_by_user_id = 'user_456'
ORDER BY p.updated_at DESC;
```

---

## Migration Strategy

If you already have data in the old schema:

```sql
-- Step 1: Create submission_packages from existing notifications
INSERT INTO submission_packages (
  id, created_by_user_id, package_reference, package_name,
  notification_no, exporter_name, importer_name,
  status, created_at, updated_at, submitted_at
)
SELECT
  'pkg_' || id,  -- Generate package ID
  created_by_user_id,
  'PKG-2025-' || substr(id, -3),  -- Generate reference
  '1_exporter_notifier_name' || ' - ' || '3_notification_details_notification_no',
  '3_notification_details_notification_no',
  '1_exporter_notifier_name',
  '2_importer_consignee_name',
  status,
  created_at,
  updated_at,
  submitted_at
FROM basel_notifications;

-- Step 2: Update notifications to link to packages
UPDATE basel_notifications
SET submission_package_id = 'pkg_' || id
WHERE submission_package_id IS NULL;

-- Step 3: Generate document entries for existing notifications
INSERT INTO submission_documents (
  id, submission_package_id, created_by_user_id,
  document_type, document_name, is_generated, generated_from_form_id
)
SELECT
  'doc_' || id,
  'pkg_' || id,
  created_by_user_id,
  'notification',
  'Basel Notification - ' || '3_notification_details_notification_no',
  true,
  id
FROM basel_notifications
WHERE status = 'submitted';
```

---

## Benefits of Enhanced Schema

✅ **Organized document management** - All related documents grouped together
✅ **Clear submission tracking** - Package-level status (draft → submitted → approved)
✅ **Document version control** - Upload, replace, delete supporting documents
✅ **Better dashboard UX** - See complete submission packages, not just forms
✅ **Audit trail** - Track when documents were uploaded, submitted, verified
✅ **Scalability** - Easy to add more document types (Movement Documents, etc.)
✅ **Compliance** - Matches real-world Basel process (package of documents)
✅ **Flexibility** - Can add Movement Documents table later without breaking changes

---

## Recommended Approach

### **Option A: Implement Enhanced Schema Now (Recommended)**
- Start with 3-table architecture
- Build package management UI
- Implement document upload/management
- **Result:** Complete, professional solution from day 1

### **Option B: Start Simple, Migrate Later**
- Start with single notification table
- Add packages + documents in Phase 2
- Migrate existing data
- **Result:** Faster initial launch, migration work later

---

## My Recommendation: **Option A**

**Rationale:**
1. You just discovered this requirement - better to design it right now
2. Migration is painful - let's avoid it
3. The schema isn't much more complex (just 2 extra tables)
4. The UX is actually BETTER (users think in "submissions" not "forms")
5. Matches real-world workflow (Basel requires document packages)

**What do you think?** Should we:
- **A:** Use the enhanced 3-table schema (packages + notifications + documents)?
- **B:** Start with simple single-table and migrate later?
- **C:** Something else?

Let me know and I'll proceed with the rest of the architecture design accordingly!
