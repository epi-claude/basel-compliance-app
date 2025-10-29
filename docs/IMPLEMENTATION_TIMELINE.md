# Basel Compliance App - Implementation Timeline

**Version:** 1.0
**Date:** October 24, 2025
**Estimated Duration:** 3 weeks (15 working days)
**Architecture:** Full-stack (React + TypeScript + Express + SQLite/PostgreSQL)

---

## Overview

This timeline follows the proven approach from Project 1 (HSE Checklist) adapted for the Basel Compliance application with enhanced 3-table architecture.

---

## Phase 1: Foundation (Days 1-3)

**Goal:** Project setup, database, authentication

### **Day 1: Project Structure & Database**

**Morning (4 hours):**
- [ ] Create monorepo structure
  - Root `package.json` with workspace setup
  - `/client` directory (React + Vite)
  - `/server` directory (Express + TypeScript)
  - `/docs` directory (move existing docs)
  - `/shared` directory (optional - shared types)

- [ ] Initialize server
  ```bash
  cd server
  npm init -y
  npm install express cors dotenv bcrypt jsonwebtoken better-sqlite3
  npm install --save-dev @types/express @types/cors @types/bcrypt @types/jsonwebtoken @types/better-sqlite3 typescript ts-node nodemon
  ```
  - Create `tsconfig.json`
  - Create `src/` structure (controllers, services, models, routes, middleware, database)

- [ ] Initialize client
  ```bash
  cd client
  npm create vite@latest . -- --template react-ts
  npm install axios react-router-dom
  npm install --save-dev tailwindcss postcss autoprefixer
  npx tailwindcss init -p
  ```

**Afternoon (4 hours):**
- [ ] Implement database schema
  - Create `server/src/database/sqlite.ts`
  - Implement `initializeDatabase()` function
  - Create 3 tables: `users`, `submission_packages`, `basel_notifications`, `submission_documents`
  - Create indexes
  - Test database initialization

- [ ] Create TypeScript types
  - `server/src/types/index.ts`
  - Define `User`, `SubmissionPackage`, `BaselNotification`, `SubmissionDocument` interfaces
  - Match database schema exactly

**Deliverable:** ✅ Project structure + database + types

---

### **Day 2: Authentication System**

**Morning (4 hours):**
- [ ] Build auth backend
  - `server/src/models/User.ts` - CRUD operations
  - `server/src/services/authService.ts` - Register, login, JWT generation
  - `server/src/controllers/authController.ts` - HTTP handlers
  - `server/src/middleware/authMiddleware.ts` - JWT verification
  - `server/src/routes/authRoutes.ts` - Route definitions

**Afternoon (4 hours):**
- [ ] Build auth frontend
  - `client/src/contexts/AuthContext.tsx` - Auth state management
  - `client/src/services/api.ts` - Axios instance with interceptors
  - `client/src/services/auth.service.ts` - API calls
  - `client/src/pages/auth/LoginPage.tsx`
  - `client/src/pages/auth/RegisterPage.tsx`
  - `client/src/components/auth/LoginForm.tsx`
  - `client/src/components/auth/RegisterForm.tsx`

- [ ] Test authentication flow
  - Register new user
  - Login
  - JWT token storage
  - Protected routes

**Deliverable:** ✅ Working authentication system

---

### **Day 3: Package Management Backend**

**Morning (4 hours):**
- [ ] Build package backend
  - `server/src/models/SubmissionPackage.ts` - CRUD operations
  - `server/src/services/packageService.ts` - Business logic
  - `server/src/controllers/packageController.ts` - HTTP handlers
  - `server/src/routes/packageRoutes.ts` - Route definitions

- [ ] Implement endpoints:
  - `POST /api/packages` - Create package
  - `GET /api/packages` - List packages
  - `GET /api/packages/:id` - Get package details
  - `PATCH /api/packages/:id` - Update package
  - `DELETE /api/packages/:id` - Delete draft package

**Afternoon (4 hours):**
- [ ] Build dashboard frontend
  - `client/src/pages/dashboard/DashboardPage.tsx`
  - `client/src/components/packages/PackageList.tsx`
  - `client/src/components/packages/PackageCard.tsx`
  - `client/src/components/packages/CreatePackageModal.tsx`
  - `client/src/contexts/PackageContext.tsx`
  - `client/src/services/package.service.ts`

- [ ] Test package creation and listing

**Deliverable:** ✅ Package management working

---

## Phase 2: Notification Form (Days 4-10)

**Goal:** 18-section Basel notification form with auto-save

### **Day 4: Notification Form Backend**

**Morning (4 hours):**
- [ ] Build notification backend
  - `server/src/models/BaselNotification.ts` - CRUD operations
  - `server/src/services/notificationService.ts` - Business logic
  - `server/src/controllers/notificationController.ts` - HTTP handlers
  - `server/src/routes/notificationRoutes.ts` - Route definitions

- [ ] Implement endpoints:
  - `POST /api/packages/:packageId/notification`
  - `GET /api/packages/:packageId/notification`
  - `PATCH /api/packages/:packageId/notification` (auto-save)

**Afternoon (4 hours):**
- [ ] Build form infrastructure frontend
  - `client/src/contexts/NotificationFormContext.tsx`
  - `client/src/services/notification.service.ts`
  - `client/src/hooks/useNotificationForm.ts`
  - `client/src/hooks/useAutoSave.ts`
  - `client/src/pages/notification/NotificationFormContainer.tsx`

- [ ] Implement auto-save logic (30s timer + blur + navigation)
- [ ] Progress percentage calculation

**Deliverable:** ✅ Form infrastructure + auto-save

---

### **Day 5: Reusable Form Components**

**Full Day (8 hours):**
- [ ] Build reusable components
  - `client/src/components/form/TextField.tsx`
  - `client/src/components/form/CheckboxGroup.tsx`
  - `client/src/components/form/DateField.tsx`
  - `client/src/components/form/ContactBlock.tsx` (7 fields - reused 5 times!)
  - `client/src/components/form/ProgressIndicator.tsx`
  - `client/src/components/form/AutoSaveIndicator.tsx`

- [ ] Build navigation
  - `client/src/components/layout/SectionNav.tsx` (18 sections)
  - `client/src/components/layout/Header.tsx`

- [ ] Test components with mock data

**Deliverable:** ✅ All reusable components ready

---

### **Days 6-9: Build 18 Section Components (4.5 sections per day)**

**Day 6:**
- [ ] Section 1: Exporter (ContactBlock)
- [ ] Section 2: Importer (ContactBlock)
- [ ] Section 3: Notification Details (checkboxes + text)
- [ ] Section 4: Total Shipments (number input)
- [ ] Section 5: Intended Quantity (2 number inputs)

**Day 7:**
- [ ] Section 6: Intended Period (6 date fields)
- [ ] Section 7: Packaging (9 checkboxes + text + special handling)
- [ ] Section 8: Carrier (ContactBlock + 5 transport checkboxes)
- [ ] Section 9: Waste Generator (ContactBlock + site field)

**Day 8:**
- [ ] Section 10: Facility (type + ContactBlock + actual site)
- [ ] Section 11: Operations (3 text fields)
- [ ] Section 12: Waste Designation (4 text fields + checkboxes)
- [ ] Section 13: Physical Characteristics (7 checkboxes + text)

**Day 9:**
- [ ] Section 14: Waste Identification (12 text fields)
- [ ] Section 15: Countries/States (7 text fields)
- [ ] Section 16: Customs Offices (3 text fields)
- [ ] Section 17: Declaration (name + date + checkboxes)
- [ ] Section 18: Annexes (number + list + 8 checkboxes)

**Deliverable:** ✅ All 18 sections functional

---

### **Day 10: Form Validation & Testing**

**Morning (4 hours):**
- [ ] Implement validation
  - `server/src/services/validationService.ts`
  - Required field validation
  - Conditional validation (disposal vs recovery)
  - Progress percentage validation
  - `/api/packages/:packageId/validate` endpoint

**Afternoon (4 hours):**
- [ ] Test complete form flow
  - Create package
  - Fill all 18 sections
  - Verify auto-save working
  - Check progress tracking
  - Validate form completion
  - Fix any bugs

**Deliverable:** ✅ Complete, tested notification form

---

## Phase 3: Document Management (Days 11-12)

**Goal:** Upload, manage, and download supporting documents

### **Day 11: Document Upload Backend**

**Morning (4 hours):**
- [ ] Setup file upload
  - Install `multer`: `npm install multer @types/multer`
  - Create `server/src/middleware/upload.ts` (file validation, size limits)
  - Create `server/uploads/` directory
  - Configure file storage

- [ ] Build document backend
  - `server/src/models/SubmissionDocument.ts` - CRUD operations
  - `server/src/services/documentService.ts` - Business logic
  - `server/src/controllers/documentController.ts` - HTTP handlers
  - `server/src/routes/documentRoutes.ts` - Route definitions

- [ ] Implement endpoints:
  - `POST /api/packages/:packageId/documents` (upload)
  - `GET /api/packages/:packageId/documents` (list)
  - `GET /api/packages/:packageId/documents/:docId` (download)
  - `DELETE /api/packages/:packageId/documents/:docId`

**Afternoon (4 hours):**
- [ ] Build document frontend
  - `client/src/components/documents/DocumentUpload.tsx`
  - `client/src/components/documents/DocumentList.tsx`
  - `client/src/components/documents/DocumentCard.tsx`
  - `client/src/services/document.service.ts`
  - `client/src/hooks/useDocumentUpload.ts`

- [ ] Test file upload flow

**Deliverable:** ✅ Document upload/download working

---

### **Day 12: PDF Generation**

**Morning (4 hours):**
- [ ] Setup PDF generation
  - Install `pdf-lib`: `npm install pdf-lib`
  - Copy Basel PDF template to `server/docs/`
  - Create `server/generated-pdfs/` directory

- [ ] Build PDF service
  - `server/src/services/pdfService.ts`
  - Implement `generateFilledPDF()` function
  - Map all 115 fields (copy from PDF_FIELD_MAPPING.md)
  - Test PDF generation with sample data

**Afternoon (4 hours):**
- [ ] Integrate PDF generation with notification submit
  - Update `POST /api/packages/:packageId/notification/submit`
  - Generate PDF automatically on submit
  - Save to `submission_documents` table
  - Return PDF URL

- [ ] Test end-to-end PDF generation

**Deliverable:** ✅ PDF generation working

---

## Phase 4: Package Submission & Polish (Days 13-15)

**Goal:** Complete submission flow, read-only views, deployment

### **Day 13: Package Submission**

**Morning (4 hours):**
- [ ] Implement package submission
  - Update `POST /api/packages/:packageId/submit`
  - Validate notification complete
  - Check required documents present
  - Update all statuses (package, notification, documents)
  - Generate PDF if not already generated

- [ ] Build submission UI
  - Submit button with confirmation modal
  - Validation error display
  - Success message with PDF download link

**Afternoon (4 hours):**
- [ ] Build read-only view
  - `client/src/pages/packages/PackageSubmittedView.tsx`
  - Display all form data (read-only)
  - Show all documents with download links
  - Show submission timestamp
  - "Return to Dashboard" button

- [ ] Test submission flow end-to-end

**Deliverable:** ✅ Complete submission workflow

---

### **Day 14: UI Polish & Error Handling**

**Morning (4 hours):**
- [ ] Polish UI
  - Responsive design (mobile, tablet, desktop)
  - Loading spinners
  - Empty states
  - Error messages
  - Toast notifications
  - Consistent styling

**Afternoon (4 hours):**
- [ ] Error handling
  - Network error recovery
  - Auto-save failure handling
  - File upload error messages
  - Form validation feedback
  - 404 pages
  - Unauthorized redirects

**Deliverable:** ✅ Polished, professional UI

---

### **Day 15: Testing & Deployment**

**Morning (4 hours):**
- [ ] End-to-end testing
  - Register → Login
  - Create package
  - Fill notification form (all 18 sections)
  - Upload documents
  - Submit package
  - View submitted package
  - Download PDF
  - Logout

- [ ] Fix any remaining bugs

**Afternoon (4 hours):**
- [ ] Deployment prep
  - Update README.md
  - Create `.env.example` files
  - Write deployment instructions
  - Build production bundles
  - Deploy to Railway/Render/Vercel

- [ ] Production testing

**Deliverable:** ✅ Deployed application

---

## Summary Timeline

| Phase | Days | Deliverable |
|-------|------|-------------|
| **Phase 1: Foundation** | 1-3 | Auth + Package management |
| **Phase 2: Notification Form** | 4-10 | 18-section form with auto-save |
| **Phase 3: Document Management** | 11-12 | Upload/download + PDF generation |
| **Phase 4: Submission & Polish** | 13-15 | Complete workflow + deployment |
| **Total** | **15 days** | **Production application** |

---

## Daily Schedule (Example)

```
Day 1 (Monday)
09:00 - 10:00  Setup project structure
10:00 - 12:00  Configure client & server
12:00 - 13:00  Lunch
13:00 - 15:00  Implement database schema
15:00 - 17:00  Create TypeScript types + test

Day 2 (Tuesday)
09:00 - 12:00  Build auth backend
12:00 - 13:00  Lunch
13:00 - 16:00  Build auth frontend
16:00 - 17:00  Test authentication flow

...etc
```

---

## Risk Mitigation

### **Potential Delays:**

1. **PDF field mapping issues** (Day 12)
   - Risk: PDF fields don't match database
   - Mitigation: We've pre-designed exact field names
   - Buffer: 2 hours allocated for debugging

2. **18 sections taking longer than expected** (Days 6-9)
   - Risk: Complex sections slow down progress
   - Mitigation: ContactBlock reusable component saves time
   - Buffer: Day 10 can be used for overflow

3. **File upload bugs** (Day 11)
   - Risk: Multer configuration issues
   - Mitigation: Follow Project 1 patterns closely
   - Buffer: Day 12 afternoon can help if needed

---

## Success Metrics

**End of Week 1 (Day 5):**
- [ ] Auth working
- [ ] Package CRUD working
- [ ] Form infrastructure ready
- [ ] 5+ sections complete

**End of Week 2 (Day 10):**
- [ ] All 18 sections complete
- [ ] Auto-save working
- [ ] Validation working
- [ ] Progress tracking accurate

**End of Week 3 (Day 15):**
- [ ] Document upload/download working
- [ ] PDF generation working
- [ ] Submission workflow complete
- [ ] Application deployed

---

## Post-Launch Enhancements (Future)

**Week 4-5 (Optional):**
- [ ] Admin dashboard for reviewing submissions
- [ ] Email notifications
- [ ] Audit trail/version history
- [ ] Movement document support (separate PDF)
- [ ] Multi-language support
- [ ] Advanced search/filtering
- [ ] Export to CSV/Excel
- [ ] User roles and permissions

---

## Development Environment Setup

### **Prerequisites:**
- Node.js 18+ LTS
- npm or yarn
- VSCode (recommended)
- Git

### **Quick Start:**
```bash
# Clone/create repo
mkdir basel-compliance-app
cd basel-compliance-app

# Initialize root package.json
npm init -y

# Create workspace structure
mkdir client server docs shared

# Follow Day 1 morning steps...
```

---

## Notes for Implementation

1. **Commit frequently** - After each major feature
2. **Test as you go** - Don't wait until the end
3. **Follow Project 1 patterns** - They're proven to work
4. **Use TypeScript strictly** - Type everything properly
5. **Keep components small** - Max 200-300 lines
6. **Comment complex logic** - Especially validation rules
7. **Handle errors gracefully** - User-friendly messages
8. **Mobile-first CSS** - Use Tailwind responsive classes

---

## Next Steps

**Ready to start?**

1. Create the repository
2. Follow Day 1 morning checklist
3. Commit after each step
4. Move to Day 1 afternoon

**Need help?** Refer to:
- `DATABASE_SCHEMA.md` - For database structure
- `API_SPECIFICATION.md` - For endpoint details
- `COMPONENT_ARCHITECTURE.md` - For React structure
- `PDF_FIELD_MAPPING.md` - For PDF generation

---

**Status:** ✅ Implementation timeline complete. Ready to build!
