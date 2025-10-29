# Basel Compliance App - API Specification

**Version:** 1.0
**Date:** October 24, 2025
**Architecture:** RESTful API with JWT Authentication
**Based on:** Project 1 (HSE Checklist) patterns + Enhanced 3-table schema

---

## API Overview

### **Base URL**
- Development: `http://localhost:3000/api`
- Production: `https://api.basel-compliance.com/api`

### **Authentication**
- Method: JWT (JSON Web Tokens)
- Header: `Authorization: Bearer <token>`
- Token expiry: 7 days (configurable)

### **Response Format**
```typescript
// Success response
{
  "success": true,
  "data": { ... }
}

// Error response
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": { ... }
  }
}
```

---

## 1. Authentication Endpoints

### **POST /api/auth/register**
Register a new user.

**Request:**
```typescript
{
  username: string;      // Required, 3-50 chars, unique
  password: string;      // Required, min 8 chars
  email?: string;        // Optional, valid email
  full_name?: string;    // Optional
  organization?: string; // Optional
}
```

**Response (201 Created):**
```typescript
{
  success: true,
  data: {
    user: {
      id: string;
      username: string;
      email: string;
      full_name: string;
      organization: string;
      role: 'user';
      created_at: string;
    }
  }
}
```

**Errors:**
- `400` - Validation error (username taken, weak password, etc.)
- `500` - Server error

---

### **POST /api/auth/login**
Login user and receive JWT token.

**Request:**
```typescript
{
  username: string;
  password: string;
}
```

**Response (200 OK):**
```typescript
{
  success: true,
  data: {
    token: string;  // JWT token
    user: {
      id: string;
      username: string;
      email: string;
      full_name: string;
      organization: string;
      role: string;
    }
  }
}
```

**Errors:**
- `401` - Invalid credentials
- `500` - Server error

---

### **GET /api/auth/me**
Get current user info (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```typescript
{
  success: true,
  data: {
    id: string;
    username: string;
    email: string;
    full_name: string;
    organization: string;
    role: string;
  }
}
```

**Errors:**
- `401` - Invalid/expired token
- `500` - Server error

---

## 2. Submission Package Endpoints

### **POST /api/packages**
Create a new submission package.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```typescript
{
  package_name: string;  // Required, e.g., "E-waste Export Oct 2025"
  package_notes?: string;
}
```

**Response (201 Created):**
```typescript
{
  success: true,
  data: {
    id: string;
    package_reference: string;  // Auto-generated: "PKG-2025-001"
    package_name: string;
    status: 'draft';
    created_by_user_id: string;
    created_at: string;
    updated_at: string;
    total_documents: 0;
    progress_percentage: 0;
  }
}
```

**Errors:**
- `401` - Unauthorized
- `400` - Validation error
- `500` - Server error

---

### **GET /api/packages**
List all submission packages for current user.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  status?: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'in_transit' | 'completed' | 'archived';
  limit?: number;   // Default: 50
  offset?: number;  // Default: 0
  sort?: 'created_at' | 'updated_at' | 'submitted_at';  // Default: 'updated_at'
  order?: 'asc' | 'desc';  // Default: 'desc'
}
```

**Response (200 OK):**
```typescript
{
  success: true,
  data: {
    packages: [
      {
        id: string;
        package_reference: string;
        package_name: string;
        status: string;
        notification_no: string | null;
        exporter_name: string | null;
        importer_name: string | null;
        waste_type: string | null;
        total_documents: number;
        progress_percentage: number;
        created_at: string;
        updated_at: string;
        submitted_at: string | null;
      }
    ],
    total: number;
    limit: number;
    offset: number;
  }
}
```

**Errors:**
- `401` - Unauthorized
- `500` - Server error

---

### **GET /api/packages/:packageId**
Get complete package details including notification and all documents.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```typescript
{
  success: true,
  data: {
    package: {
      id: string;
      package_reference: string;
      package_name: string;
      status: string;
      notification_no: string | null;
      exporter_name: string | null;
      importer_name: string | null;
      waste_type: string | null;
      total_documents: number;
      package_notes: string | null;
      authority_feedback: string | null;
      created_at: string;
      updated_at: string;
      submitted_at: string | null;
      reviewed_at: string | null;
      approved_at: string | null;
      completed_at: string | null;
    },
    notification: {
      id: string;
      progress_percentage: number;
      status: string;
      // ... all 115 Basel fields
    } | null,
    documents: [
      {
        id: string;
        document_type: string;
        document_name: string;
        document_description: string | null;
        file_name: string;
        file_size: number;
        file_type: string;
        is_generated: boolean;
        status: string;
        uploaded_at: string;
      }
    ]
  }
}
```

**Errors:**
- `401` - Unauthorized
- `403` - Forbidden (not owner)
- `404` - Package not found
- `500` - Server error

---

### **PATCH /api/packages/:packageId**
Update package metadata (name, notes).

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```typescript
{
  package_name?: string;
  package_notes?: string;
}
```

**Response (200 OK):**
```typescript
{
  success: true,
  data: {
    updated_at: string;
  }
}
```

**Errors:**
- `401` - Unauthorized
- `403` - Forbidden (not owner or already submitted)
- `404` - Package not found
- `400` - Validation error
- `500` - Server error

---

### **POST /api/packages/:packageId/submit**
Submit entire package (notification + documents) to authorities.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```typescript
{
  confirm: boolean;  // Must be true
}
```

**Validation Requirements:**
- Notification form must be 100% complete
- All required documents must be uploaded
- Package must be in 'draft' status

**Response (200 OK):**
```typescript
{
  success: true,
  data: {
    package_id: string;
    package_reference: string;
    submitted_at: string;
    notification_pdf_url: string;  // Generated PDF URL
    validation_report: {
      notification_complete: boolean;
      required_documents_present: boolean;
      all_checks_passed: boolean;
    }
  }
}
```

**Errors:**
- `401` - Unauthorized
- `403` - Forbidden (not owner)
- `404` - Package not found
- `400` - Validation failed (incomplete notification, missing documents)
- `500` - Server error

---

### **DELETE /api/packages/:packageId**
Delete a draft package (cannot delete submitted packages).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```typescript
{
  success: true,
  data: {
    message: "Package deleted successfully"
  }
}
```

**Errors:**
- `401` - Unauthorized
- `403` - Forbidden (not owner or already submitted)
- `404` - Package not found
- `500` - Server error

---

## 3. Notification Form Endpoints

### **POST /api/packages/:packageId/notification**
Create notification form for a package.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```typescript
{} // Empty - just creates the form
```

**Response (201 Created):**
```typescript
{
  success: true,
  data: {
    id: string;
    submission_package_id: string;
    status: 'draft';
    progress_percentage: 0;
    created_at: string;
  }
}
```

**Errors:**
- `401` - Unauthorized
- `403` - Forbidden (not owner)
- `404` - Package not found
- `409` - Conflict (notification already exists for package)
- `500` - Server error

---

### **GET /api/packages/:packageId/notification**
Get notification form data.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```typescript
{
  success: true,
  data: {
    id: string;
    submission_package_id: string;
    status: string;
    progress_percentage: number;

    // All 115 Basel fields
    "1_exporter_notifier_registration_no": string | null,
    "1_exporter_notifier_name": string | null,
    // ... (all fields)

    created_at: string;
    updated_at: string;
    submitted_at: string | null;
  }
}
```

**Errors:**
- `401` - Unauthorized
- `403` - Forbidden (not owner)
- `404` - Package or notification not found
- `500` - Server error

---

### **PATCH /api/packages/:packageId/notification**
Auto-save notification form data (triggered every 30s, on blur, on navigation).

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```typescript
{
  // Any subset of the 115 Basel fields
  "1_exporter_notifier_name"?: string;
  "2_importer_consignee_name"?: string;
  "5_total_intended_quantity_tonnes"?: number;
  // ... etc
}
```

**Response (200 OK):**
```typescript
{
  success: true,
  data: {
    updated_at: string;
    progress_percentage: number;
  }
}
```

**Notes:**
- Progress percentage auto-calculated on server
- Package summary fields (exporter_name, importer_name, etc.) auto-updated
- `updated_at` timestamp refreshed

**Errors:**
- `401` - Unauthorized
- `403` - Forbidden (not owner or already submitted)
- `404` - Package or notification not found
- `400` - Validation error
- `500` - Server error

---

### **POST /api/packages/:packageId/notification/submit**
Finalize and submit notification form (triggers PDF generation).

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```typescript
{
  confirm: boolean;  // Must be true
}
```

**Validation:**
- All required fields must be filled
- Progress must be 100%
- Form must be in 'draft' status

**Response (200 OK):**
```typescript
{
  success: true,
  data: {
    notification_id: string;
    submitted_at: string;
    pdf_generated: boolean;
    pdf_document_id: string;  // ID in submission_documents table
    validation_report: {
      required_fields_complete: boolean;
      progress_percentage: number;
      missing_fields: string[];
    }
  }
}
```

**Errors:**
- `401` - Unauthorized
- `403` - Forbidden (not owner)
- `404` - Package or notification not found
- `400` - Validation failed (incomplete form)
- `500` - Server error

---

## 4. Document Management Endpoints

### **POST /api/packages/:packageId/documents**
Upload a supporting document.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request (Form Data):**
```typescript
{
  file: File;  // PDF, JPEG, PNG, etc.
  document_type: 'chemical_analysis' | 'facility_permit' | 'transport_contract' |
                 'insurance_certificate' | 'process_description' |
                 'safety_data_sheet' | 'routing_information' |
                 'emergency_procedures' | 'other_supporting';
  document_name: string;
  document_description?: string;
  document_date?: string;  // ISO 8601 date
  expiry_date?: string;    // ISO 8601 date (for permits)
  reference_number?: string;
}
```

**Response (201 Created):**
```typescript
{
  success: true,
  data: {
    id: string;
    document_type: string;
    document_name: string;
    file_name: string;
    file_size: number;
    file_type: string;
    uploaded_at: string;
  }
}
```

**Errors:**
- `401` - Unauthorized
- `403` - Forbidden (not owner or package already submitted)
- `404` - Package not found
- `400` - Validation error (invalid file type, too large, etc.)
- `413` - File too large (max 25MB)
- `500` - Server error

---

### **GET /api/packages/:packageId/documents**
List all documents for a package.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```typescript
{
  success: true,
  data: {
    documents: [
      {
        id: string;
        document_type: string;
        document_name: string;
        document_description: string | null;
        file_name: string;
        file_size: number;
        file_type: string;
        document_date: string | null;
        expiry_date: string | null;
        reference_number: string | null;
        is_generated: boolean;
        status: string;
        uploaded_at: string;
      }
    ],
    total: number;
  }
}
```

**Errors:**
- `401` - Unauthorized
- `403` - Forbidden (not owner)
- `404` - Package not found
- `500` - Server error

---

### **GET /api/packages/:packageId/documents/:documentId**
Download a specific document.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```
Content-Type: application/pdf (or appropriate MIME type)
Content-Disposition: attachment; filename="document_name.pdf"

<file binary data>
```

**Errors:**
- `401` - Unauthorized
- `403` - Forbidden (not owner)
- `404` - Package or document not found
- `500` - Server error

---

### **PATCH /api/packages/:packageId/documents/:documentId**
Update document metadata (name, description, dates).

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```typescript
{
  document_name?: string;
  document_description?: string;
  document_date?: string;
  expiry_date?: string;
  reference_number?: string;
}
```

**Response (200 OK):**
```typescript
{
  success: true,
  data: {
    updated_at: string;
  }
}
```

**Errors:**
- `401` - Unauthorized
- `403` - Forbidden (not owner or document submitted)
- `404` - Package or document not found
- `400` - Validation error
- `500` - Server error

---

### **DELETE /api/packages/:packageId/documents/:documentId**
Delete a document (only for draft packages and uploaded documents).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```typescript
{
  success: true,
  data: {
    message: "Document deleted successfully"
  }
}
```

**Errors:**
- `401` - Unauthorized
- `403` - Forbidden (not owner, package submitted, or generated document)
- `404` - Package or document not found
- `500` - Server error

---

## 5. PDF Generation Endpoints

### **POST /api/packages/:packageId/generate-pdf**
Generate notification PDF from form data.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```typescript
{
  success: true,
  data: {
    document_id: string;
    pdf_url: string;
    file_size: number;
    generated_at: string;
  }
}
```

**Errors:**
- `401` - Unauthorized
- `403` - Forbidden (not owner)
- `404` - Package or notification not found
- `400` - Notification incomplete
- `500` - PDF generation failed

---

### **GET /api/packages/:packageId/download-all**
Download all package documents as a ZIP file.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```
Content-Type: application/zip
Content-Disposition: attachment; filename="PKG-2025-001_documents.zip"

<ZIP binary data containing all documents>
```

**Errors:**
- `401` - Unauthorized
- `403` - Forbidden (not owner)
- `404` - Package not found
- `500` - Server error

---

## 6. Validation Endpoint

### **GET /api/packages/:packageId/validate**
Check if package is ready to submit.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```typescript
{
  success: true,
  data: {
    can_submit: boolean;
    validation_report: {
      notification: {
        exists: boolean;
        complete: boolean;
        progress_percentage: number;
        missing_required_fields: string[];
      },
      documents: {
        total_count: number;
        has_chemical_analysis: boolean;
        has_facility_permit: boolean;
        recommended_documents_present: string[];
        recommended_documents_missing: string[];
      },
      package: {
        status: string;
        is_draft: boolean;
      },
      errors: string[];
      warnings: string[];
    }
  }
}
```

**Errors:**
- `401` - Unauthorized
- `403` - Forbidden (not owner)
- `404` - Package not found
- `500` - Server error

---

## Error Codes Reference

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Missing or invalid authentication token |
| `FORBIDDEN` | User doesn't have permission |
| `NOT_FOUND` | Resource not found |
| `VALIDATION_ERROR` | Request data validation failed |
| `CONFLICT` | Resource already exists |
| `FILE_TOO_LARGE` | Uploaded file exceeds size limit |
| `INVALID_FILE_TYPE` | Unsupported file type |
| `FORM_INCOMPLETE` | Notification form not complete |
| `PACKAGE_SUBMITTED` | Cannot modify submitted package |
| `SERVER_ERROR` | Internal server error |

---

## Rate Limiting

- **Authentication endpoints:** 10 requests per minute per IP
- **Form auto-save:** 1 request per second per user
- **File uploads:** 5 requests per minute per user
- **All other endpoints:** 100 requests per minute per user

---

## File Upload Constraints

- **Max file size:** 25 MB per file
- **Allowed types:** PDF, JPEG, PNG, DOC, DOCX, XLS, XLSX
- **Total package size:** 250 MB (all documents combined)

---

## Next Steps

1. ✅ API specification complete
2. → Design React component architecture
3. → Create PDF field mapping configuration
4. → Build implementation timeline
5. → Begin implementation

---

**Status:** ✅ API specification complete and ready for implementation.
