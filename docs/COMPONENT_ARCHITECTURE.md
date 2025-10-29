# Basel Compliance App - React Component Architecture

**Version:** 1.0
**Date:** October 24, 2025
**Framework:** React 18 + TypeScript + Tailwind CSS
**Based on:** Project 1 (HSE Checklist) patterns + 18-section Basel form

---

## Project Structure

```
basel-compliance-app/
├── client/                          # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── RegisterForm.tsx
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── SectionNav.tsx      # 18-section navigation
│   │   │   │   └── Footer.tsx
│   │   │   ├── packages/
│   │   │   │   ├── PackageCard.tsx
│   │   │   │   ├── PackageList.tsx
│   │   │   │   ├── PackageHeader.tsx
│   │   │   │   ├── PackageStatus.tsx
│   │   │   │   └── CreatePackageModal.tsx
│   │   │   ├── documents/
│   │   │   │   ├── DocumentList.tsx
│   │   │   │   ├── DocumentCard.tsx
│   │   │   │   ├── DocumentUpload.tsx
│   │   │   │   └── DocumentViewer.tsx
│   │   │   ├── form/
│   │   │   │   ├── FormField.tsx       # Reusable input wrapper
│   │   │   │   ├── TextField.tsx
│   │   │   │   ├── CheckboxGroup.tsx
│   │   │   │   ├── DateField.tsx
│   │   │   │   ├── ContactBlock.tsx     # Reusable contact info (7 fields)
│   │   │   │   ├── ProgressIndicator.tsx
│   │   │   │   └── AutoSaveIndicator.tsx
│   │   │   ├── ui/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Spinner.tsx
│   │   │   │   └── Toast.tsx
│   │   │   └── validation/
│   │   │       ├── ValidationSummary.tsx
│   │   │       └── FieldError.tsx
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   └── RegisterPage.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── DashboardPage.tsx
│   │   │   ├── packages/
│   │   │   │   ├── PackageDetailPage.tsx
│   │   │   │   └── PackageSubmittedView.tsx
│   │   │   └── notification/
│   │   │       ├── NotificationFormContainer.tsx
│   │   │       └── sections/
│   │   │           ├── Section1_Exporter.tsx
│   │   │           ├── Section2_Importer.tsx
│   │   │           ├── Section3_NotificationDetails.tsx
│   │   │           ├── Section4_TotalShipments.tsx
│   │   │           ├── Section5_IntendedQuantity.tsx
│   │   │           ├── Section6_IntendedPeriod.tsx
│   │   │           ├── Section7_Packaging.tsx
│   │   │           ├── Section8_Carrier.tsx
│   │   │           ├── Section9_Generator.tsx
│   │   │           ├── Section10_Facility.tsx
│   │   │           ├── Section11_Operations.tsx
│   │   │           ├── Section12_WasteDesignation.tsx
│   │   │           ├── Section13_PhysicalCharacteristics.tsx
│   │   │           ├── Section14_WasteIdentification.tsx
│   │   │           ├── Section15_Countries.tsx
│   │   │           ├── Section16_Customs.tsx
│   │   │           ├── Section17_Declaration.tsx
│   │   │           └── Section18_Annexes.tsx
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx
│   │   │   ├── PackageContext.tsx       # Current package state
│   │   │   └── NotificationFormContext.tsx  # Form state + auto-save
│   │   ├── services/
│   │   │   ├── api.ts                   # Axios instance
│   │   │   ├── auth.service.ts
│   │   │   ├── package.service.ts
│   │   │   ├── notification.service.ts
│   │   │   └── document.service.ts
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── usePackage.ts
│   │   │   ├── useNotificationForm.ts
│   │   │   ├── useAutoSave.ts
│   │   │   └── useDocumentUpload.ts
│   │   ├── types/
│   │   │   ├── auth.types.ts
│   │   │   ├── package.types.ts
│   │   │   ├── notification.types.ts
│   │   │   └── document.types.ts
│   │   ├── utils/
│   │   │   ├── validation.ts
│   │   │   ├── formatters.ts
│   │   │   └── constants.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── server/                          # Express backend
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── packageController.ts
│   │   │   ├── notificationController.ts
│   │   │   └── documentController.ts
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   ├── packageService.ts
│   │   │   ├── notificationService.ts
│   │   │   ├── documentService.ts
│   │   │   ├── pdfService.ts
│   │   │   └── validationService.ts
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── SubmissionPackage.ts
│   │   │   ├── BaselNotification.ts
│   │   │   └── SubmissionDocument.ts
│   │   ├── middleware/
│   │   │   ├── authMiddleware.ts
│   │   │   ├── errorHandler.ts
│   │   │   ├── validation.ts
│   │   │   └── upload.ts (multer)
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   ├── packageRoutes.ts
│   │   │   ├── notificationRoutes.ts
│   │   │   └── documentRoutes.ts
│   │   ├── database/
│   │   │   ├── sqlite.ts
│   │   │   └── migrations/
│   │   ├── config.ts
│   │   └── server.ts
│   ├── uploads/                     # Temporary upload directory
│   ├── generated-pdfs/              # Generated PDF storage
│   ├── database/
│   │   └── dev.db
│   ├── package.json
│   └── tsconfig.json
│
├── shared/                          # Shared types (optional)
│   └── types/
│       └── basel.types.ts
│
├── docs/                            # Documentation
│   ├── DATABASE_SCHEMA.md
│   ├── ENHANCED_SCHEMA_MULTI_DOCUMENT.md
│   ├── API_SPECIFICATION.md
│   └── COMPONENT_ARCHITECTURE.md (this file)
│
├── README.md
└── package.json                     # Root package.json for npm scripts
```

---

## Component Hierarchy

```
App
├── AuthContext.Provider
│   ├── Router
│   │   ├── LoginPage
│   │   ├── RegisterPage
│   │   ├── DashboardPage
│   │   │   ├── Header
│   │   │   ├── PackageList
│   │   │   │   └── PackageCard (multiple)
│   │   │   └── CreatePackageModal
│   │   │
│   │   ├── PackageDetailPage
│   │   │   ├── PackageContext.Provider
│   │   │   │   ├── Header
│   │   │   │   ├── PackageHeader
│   │   │   │   ├── Tabs
│   │   │   │   │   ├── NotificationTab
│   │   │   │   │   │   └── NotificationFormContainer
│   │   │   │   │   │       ├── NotificationFormContext.Provider
│   │   │   │   │   │       │   ├── SectionNav (18 sections)
│   │   │   │   │   │       │   ├── ProgressIndicator
│   │   │   │   │   │       │   ├── AutoSaveIndicator
│   │   │   │   │   │       │   └── Section Components (Section1-18)
│   │   │   │   │   └── DocumentsTab
│   │   │   │   │       ├── DocumentUpload
│   │   │   │   │       └── DocumentList
│   │   │   │   │           └── DocumentCard (multiple)
│   │   │
│   │   └── PackageSubmittedView (read-only)
```

---

## Key Components Detail

### **1. Context: NotificationFormContext**

Manages form state, auto-save, and progress tracking.

```typescript
// client/src/contexts/NotificationFormContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { notificationService } from '../services/notification.service';

interface NotificationFormContextType {
  formData: BaselNotification;
  updateField: (fieldName: string, value: any) => void;
  saveForm: () => Promise<void>;
  currentSection: number;
  setCurrentSection: (section: number) => void;
  isLoading: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  progressPercentage: number;
  validationErrors: Record<string, string>;
}

export function NotificationFormProvider({
  children,
  packageId
}: {
  children: React.ReactNode;
  packageId: string;
}) {
  const [formData, setFormData] = useState<BaselNotification>({});
  const [currentSection, setCurrentSection] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [progressPercentage, setProgressPercentage] = useState(0);

  // Load form data on mount
  useEffect(() => {
    loadForm();
  }, [packageId]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      saveForm();
    }, 30000);
    return () => clearTimeout(timer);
  }, [formData]);

  const loadForm = async () => {
    const data = await notificationService.getNotification(packageId);
    setFormData(data);
    setProgressPercentage(data.progress_percentage);
  };

  const updateField = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const saveForm = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const result = await notificationService.updateNotification(packageId, formData);
      setLastSaved(new Date());
      setProgressPercentage(result.progress_percentage);
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <NotificationFormContext.Provider
      value={{
        formData,
        updateField,
        saveForm,
        currentSection,
        setCurrentSection,
        isLoading: false,
        isSaving,
        lastSaved,
        progressPercentage,
        validationErrors: {}
      }}
    >
      {children}
    </NotificationFormContext.Provider>
  );
}

export const useNotificationForm = () => {
  const context = useContext(NotificationFormContext);
  if (!context) throw new Error('useNotificationForm must be used within NotificationFormProvider');
  return context;
};
```

---

### **2. Component: ContactBlock (Reusable)**

Used in Sections 1, 2, 8, 9, 10 (5 times).

```typescript
// client/src/components/form/ContactBlock.tsx
interface ContactBlockProps {
  prefix: string;  // e.g., "1_exporter_notifier_", "2_importer_consignee_"
  title: string;   // e.g., "Exporter - Notifier"
}

export function ContactBlock({ prefix, title }: ContactBlockProps) {
  const { formData, updateField } = useNotificationForm();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>

      <TextField
        label="Registration No"
        name={`${prefix}registration_no`}
        value={formData[`${prefix}registration_no`] || ''}
        onChange={(value) => updateField(`${prefix}registration_no`, value)}
      />

      <TextField
        label="Name"
        name={`${prefix}name`}
        value={formData[`${prefix}name`] || ''}
        onChange={(value) => updateField(`${prefix}name`, value)}
        required
      />

      <TextField
        label="Address"
        name={`${prefix}address`}
        value={formData[`${prefix}address`] || ''}
        onChange={(value) => updateField(`${prefix}address`, value)}
        multiline
        rows={3}
      />

      <TextField
        label="Contact Person"
        name={`${prefix}contact_person`}
        value={formData[`${prefix}contact_person`] || ''}
        onChange={(value) => updateField(`${prefix}contact_person`, value)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          label="Tel"
          name={`${prefix}tel`}
          value={formData[`${prefix}tel`] || ''}
          onChange={(value) => updateField(`${prefix}tel`, value)}
        />
        <TextField
          label="Fax"
          name={`${prefix}fax`}
          value={formData[`${prefix}fax`] || ''}
          onChange={(value) => updateField(`${prefix}fax`, value)}
        />
      </div>

      <TextField
        label="E-mail"
        name={`${prefix}email`}
        type="email"
        value={formData[`${prefix}email`] || ''}
        onChange={(value) => updateField(`${prefix}email`, value)}
      />
    </div>
  );
}
```

---

### **3. Component: Section1_Exporter**

Example of a section component.

```typescript
// client/src/pages/notification/sections/Section1_Exporter.tsx
import { ContactBlock } from '../../../components/form/ContactBlock';

export function Section1_Exporter() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Section 1: Exporter - Notifier
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Provide information about the exporter/notifier of the waste
          </p>
        </div>

        <ContactBlock
          prefix="1_exporter_notifier_"
          title="Exporter Information"
        />

        {/* Navigation buttons */}
        <div className="mt-8 flex justify-between">
          <button className="btn-secondary" disabled>
            Previous
          </button>
          <button className="btn-primary" onClick={() => navigateToSection(2)}>
            Next: Importer
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

### **4. Component: Section7_Packaging**

Example with checkboxes.

```typescript
// client/src/pages/notification/sections/Section7_Packaging.tsx
export function Section7_Packaging() {
  const { formData, updateField } = useNotificationForm();

  const packagingTypes = [
    { id: 'drum', label: 'Drum' },
    { id: 'wooden_barrel', label: 'Wooden Barrel' },
    { id: 'jerrican', label: 'Jerrican' },
    { id: 'box', label: 'Box' },
    { id: 'bag', label: 'Bag' },
    { id: 'composite_packaging', label: 'Composite Packaging' },
    { id: 'pressure_receptacle', label: 'Pressure Receptacle' },
    { id: 'bulk', label: 'Bulk' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6">
          Section 7: Packaging Type(s) and Special Handling
        </h2>

        {/* Packaging types checkboxes */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Packaging Type(s) *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {packagingTypes.map((type) => (
              <label key={type.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData[`7_packaging_type_${type.id}`] || false}
                  onChange={(e) =>
                    updateField(`7_packaging_type_${type.id}`, e.target.checked)
                  }
                  className="rounded border-gray-300"
                />
                <span className="text-sm">{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Other packaging type */}
        <TextField
          label="Other Packaging (specify)"
          name="7_packaging_type_other"
          value={formData['7_packaging_type_other'] || ''}
          onChange={(value) => updateField('7_packaging_type_other', value)}
        />

        {/* Special handling */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Special Handling Requirements *
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="special_handling"
                checked={formData['7_special_handling_yes'] || false}
                onChange={() => {
                  updateField('7_special_handling_yes', true);
                  updateField('7_special_handling_no', false);
                }}
                className="mr-2"
              />
              Yes
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="special_handling"
                checked={formData['7_special_handling_no'] || false}
                onChange={() => {
                  updateField('7_special_handling_yes', false);
                  updateField('7_special_handling_no', true);
                }}
                className="mr-2"
              />
              No
            </label>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <button className="btn-secondary" onClick={() => navigateToSection(6)}>
            Previous
          </button>
          <button className="btn-primary" onClick={() => navigateToSection(8)}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

### **5. Component: SectionNav**

18-section navigation sidebar.

```typescript
// client/src/components/layout/SectionNav.tsx
const sections = [
  { number: 1, title: 'Exporter - Notifier', icon: '📦' },
  { number: 2, title: 'Importer - Consignee', icon: '📥' },
  { number: 3, title: 'Notification Details', icon: '📋' },
  { number: 4, title: 'Total Shipments', icon: '🚚' },
  { number: 5, title: 'Intended Quantity', icon: '⚖️' },
  { number: 6, title: 'Intended Period', icon: '📅' },
  { number: 7, title: 'Packaging', icon: '📦' },
  { number: 8, title: 'Intended Carrier', icon: '🚛' },
  { number: 9, title: 'Waste Generator', icon: '🏭' },
  { number: 10, title: 'Disposal/Recovery Facility', icon: '♻️' },
  { number: 11, title: 'Operations', icon: '⚙️' },
  { number: 12, title: 'Waste Designation', icon: '🧪' },
  { number: 13, title: 'Physical Characteristics', icon: '🔬' },
  { number: 14, title: 'Waste Identification', icon: '🏷️' },
  { number: 15, title: 'Countries/States', icon: '🌍' },
  { number: 16, title: 'Customs Offices', icon: '🏛️' },
  { number: 17, title: 'Declaration', icon: '✍️' },
  { number: 18, title: 'Annexes', icon: '📎' },
];

export function SectionNav() {
  const { currentSection, setCurrentSection, progressPercentage } = useNotificationForm();

  return (
    <nav className="w-64 bg-white shadow-lg h-full overflow-y-auto">
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">Form Progress</h3>
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Complete</span>
            <span className="font-semibold">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.number}
              onClick={() => setCurrentSection(section.number)}
              className={`
                w-full text-left px-3 py-2 rounded-lg transition-colors
                ${currentSection === section.number
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-100'
                }
              `}
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">{section.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs opacity-75">Section {section.number}</div>
                  <div className="text-sm font-medium truncate">{section.title}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
```

---

### **6. Component: DocumentUpload**

For uploading supporting documents.

```typescript
// client/src/components/documents/DocumentUpload.tsx
export function DocumentUpload({ packageId }: { packageId: string }) {
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState('');

  const documentTypes = [
    { value: 'chemical_analysis', label: 'Chemical Analysis Report' },
    { value: 'facility_permit', label: 'Facility Permit' },
    { value: 'transport_contract', label: 'Transport Contract' },
    { value: 'insurance_certificate', label: 'Insurance Certificate' },
    { value: 'process_description', label: 'Process Description' },
    { value: 'safety_data_sheet', label: 'Safety Data Sheet' },
    { value: 'routing_information', label: 'Routing Information' },
    { value: 'emergency_procedures', label: 'Emergency Procedures' },
    { value: 'other_supporting', label: 'Other Supporting Document' },
  ];

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', selectedType);
      formData.append('document_name', file.name);

      await documentService.uploadDocument(packageId, formData);
      toast.success('Document uploaded successfully');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Upload Supporting Document</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Document Type *</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select document type...</option>
            {documentTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Select File *</label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
            disabled={!selectedType || uploading}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            Accepted: PDF, JPEG, PNG, DOC, DOCX (max 25MB)
          </p>
        </div>

        {uploading && <Spinner text="Uploading..." />}
      </div>
    </div>
  );
}
```

---

## Routing Structure

```typescript
// client/src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route path="/" element={<ProtectedRoute />}>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="packages/:packageId" element={<PackageDetailPage />} />
            <Route path="packages/:packageId/notification" element={<NotificationFormContainer />} />
            <Route path="packages/:packageId/submitted" element={<PackageSubmittedView />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

---

## State Management Summary

### **Global State (Context API):**
1. **AuthContext** - User authentication, token, logout
2. **PackageContext** - Current package details, documents list
3. **NotificationFormContext** - Form data, auto-save, validation

### **No Redux Needed:**
Following Project 1's pattern, Context API is sufficient for this application's complexity level.

---

## Styling Approach

### **Tailwind CSS Utility Classes:**
- Use Tailwind for all styling (like Project 1)
- No custom CSS files beyond index.css
- Responsive breakpoints: `sm:`, `md:`, `lg:`, `xl:`

### **Color Palette:**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
      }
    }
  }
}
```

---

## Next Steps

1. ✅ Component architecture designed
2. → Create PDF field mapping JSON
3. → Build implementation timeline
4. → Begin Phase 1 implementation

---

**Status:** ✅ Component architecture complete and ready for implementation.
