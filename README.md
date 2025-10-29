# Basel Compliance App

A full-stack web application for managing Basel Convention hazardous waste notification submissions with multi-document package support.

---

## 📋 Project Status

**Design Phase:** ✅ **COMPLETE**
**Implementation Phase:** 🔄 **READY TO START**

---

## 🎯 Overview

This application digitizes the Basel Convention notification process, enabling organizations to:
- Create and manage notification packages
- Fill out the 18-section, 115-field Basel notification form
- Upload supporting documents (permits, analysis reports, contracts, etc.)
- Generate filled PDF forms automatically
- Submit complete packages to authorities
- Track submission status

---

## 🏗️ Architecture

**Full-Stack Application:**
- **Frontend:** React 18 + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript
- **Database:** SQLite (development) → PostgreSQL (production)
- **PDF Generation:** pdf-lib (server-side)
- **Authentication:** JWT with bcrypt
- **File Upload:** multer

**Key Features:**
- ✅ Multi-document package management
- ✅ 18-section notification form with auto-save
- ✅ Progress tracking (real-time completion percentage)
- ✅ Document upload/management
- ✅ Automated PDF generation
- ✅ Package-level submission workflow
- ✅ Read-only views for submitted packages

---

## 📚 Design Documentation

Complete architecture design documents are available in `/docs/`:

| Document | Description |
|----------|-------------|
| **[ARCHITECTURE_SUMMARY.md](docs/ARCHITECTURE_SUMMARY.md)** | 📊 **Start here!** Complete overview |
| [DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) | Database design (3 tables, 122 fields) |
| [ENHANCED_SCHEMA_MULTI_DOCUMENT.md](docs/ENHANCED_SCHEMA_MULTI_DOCUMENT.md) | Multi-document architecture rationale |
| [API_SPECIFICATION.md](docs/API_SPECIFICATION.md) | 32 API endpoints with request/response |
| [COMPONENT_ARCHITECTURE.md](docs/COMPONENT_ARCHITECTURE.md) | React component structure |
| [PDF_FIELD_MAPPING.md](docs/PDF_FIELD_MAPPING.md) | PDF generation strategy |
| [IMPLEMENTATION_TIMELINE.md](docs/IMPLEMENTATION_TIMELINE.md) | 15-day build plan |

---

## 🚀 Quick Start (When Implementation Begins)

### **Prerequisites**
- Node.js 18+ LTS
- npm or yarn
- Git

### **Installation** (Future)
```bash
# Clone repository
git clone <repository-url>
cd basel-compliance-app

# Install all dependencies
npm install

# Start development servers
npm run dev

# Frontend: http://localhost:5173
# Backend: http://localhost:3000
```

---

## 📖 Implementation Guide

Follow the **[IMPLEMENTATION_TIMELINE.md](docs/IMPLEMENTATION_TIMELINE.md)** for a day-by-day build plan:

### **Phase 1: Foundation (Days 1-3)**
- Project setup, database, authentication
- Package management backend + frontend

### **Phase 2: Notification Form (Days 4-10)**
- Form infrastructure with auto-save
- Build all 18 section components
- Validation & testing

### **Phase 3: Document Management (Days 11-12)**
- Document upload/download
- PDF generation integration

### **Phase 4: Polish & Deploy (Days 13-15)**
- Package submission workflow
- UI polish & error handling
- Production deployment

**Estimated Time:** 3 weeks (15 working days)

---

## 🗂️ Project Structure (Planned)

```
basel-compliance-app/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/            # Page components
│   │   ├── contexts/         # React Context providers
│   │   ├── services/         # API service layer
│   │   ├── hooks/            # Custom React hooks
│   │   ├── types/            # TypeScript types
│   │   └── utils/            # Utility functions
│   └── package.json
│
├── server/                    # Express backend
│   ├── src/
│   │   ├── controllers/      # HTTP request handlers
│   │   ├── services/         # Business logic
│   │   ├── models/           # Database models
│   │   ├── middleware/       # Express middleware
│   │   ├── routes/           # API routes
│   │   ├── database/         # Database setup & migrations
│   │   └── types/            # TypeScript types
│   ├── uploads/              # Uploaded documents
│   ├── generated-pdfs/       # Generated PDFs
│   └── package.json
│
├── docs/                      # Architecture documentation
├── archive/                   # Original Project 2 files
└── README.md                  # This file
```

---

## 🔑 Key Technologies

### **Frontend**
- React 18 with TypeScript
- Vite (build tool)
- React Router v6 (routing)
- Context API (state management)
- Tailwind CSS (styling)
- Axios (HTTP client)

### **Backend**
- Express.js with TypeScript
- Better-sqlite3 (development database)
- JWT + bcrypt (authentication)
- pdf-lib (PDF generation)
- multer (file uploads)

---

## 📊 Database Schema

### **3-Table Architecture:**

**1. users**
- Authentication and user profiles
- Support for organizations

**2. submission_packages**
- Parent container for notifications + documents
- Package-level status tracking
- Unique reference IDs (PKG-2025-001)

**3. basel_notifications**
- 115 fields from official Basel form
- One notification per package
- Progress percentage tracking

**4. submission_documents**
- Uploaded documents
- Generated PDFs
- Document type categorization

See [DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) for complete details.

---

## 🌐 API Endpoints (32 Total)

### **Authentication (3)**
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

### **Packages (6)**
- POST /api/packages
- GET /api/packages
- GET /api/packages/:packageId
- PATCH /api/packages/:packageId
- POST /api/packages/:packageId/submit
- DELETE /api/packages/:packageId

### **Notifications (4)**
- POST /api/packages/:packageId/notification
- GET /api/packages/:packageId/notification
- PATCH /api/packages/:packageId/notification
- POST /api/packages/:packageId/notification/submit

### **Documents (5)**
- POST /api/packages/:packageId/documents
- GET /api/packages/:packageId/documents
- GET /api/packages/:packageId/documents/:docId
- PATCH /api/packages/:packageId/documents/:docId
- DELETE /api/packages/:packageId/documents/:docId

See [API_SPECIFICATION.md](docs/API_SPECIFICATION.md) for complete details.

---

## 📝 Form Sections (18 Total)

Based on official Basel Convention notification document:

1. Exporter - Notifier
2. Importer - Consignee
3. Notification Details
4. Total Intended Number of Shipments
5. Total Intended Quantity
6. Intended Period of Time for Shipments
7. Packaging Type(s) and Special Handling
8. Intended Carrier(s)
9. Waste Generator(s) / Producer(s)
10. Disposal/Recovery Facility
11. Disposal/Recovery Operation(s)
12. Designation and Composition of the Waste
13. Physical Characteristics
14. Waste Identification (Codes)
15. Countries/States Concerned, Authorities, and Border Crossings
16. Customs Offices of Entry/Exit/Export
17. Exporter's / Generator's Declaration
18. Number of Annexes Attached

---

## 🎨 Key Features

### **Auto-Save System**
- Saves every 30 seconds automatically
- Saves on field blur
- Saves before section navigation
- Visual feedback: "Saving..." → "Saved ✓"

### **Package Management**
- Group notification + documents together
- Track package status (draft → submitted → approved)
- Unique package reference numbers
- Dashboard view of all packages

### **Document Upload**
- Support for PDFs, images, Word docs, Excel
- Document type categorization
- File size validation (25MB limit)
- Metadata tracking

### **PDF Generation**
- Server-side generation using pdf-lib
- 1:1 field mapping (database ↔ PDF)
- Auto-generated on submission
- Downloadable from documents list

---

## 🧪 Development Workflow (Future)

```bash
# Development mode (both client & server)
npm run dev

# Run only server
npm run dev:server

# Run only client
npm run dev:client

# Build for production
npm run build

# Run tests
npm test
```

---

## 🚢 Deployment (Future)

**Recommended Platforms:**
- **Backend + Database:** Railway, Render, or AWS
- **Frontend:** Vercel, Netlify, or same as backend
- **File Storage:** AWS S3, Azure Blob, or GCS (for production)

See deployment instructions in `/docs/DEPLOYMENT.md` (to be created during Phase 4).

---

## 🔒 Security Features

- JWT-based authentication
- bcrypt password hashing (10 rounds)
- File upload validation (type, size)
- SQL injection prevention (parameterized queries)
- CORS configuration
- Rate limiting (planned)

---

## 📈 Future Enhancements

**Phase 2 (Post-Launch):**
- Movement document support
- Admin dashboard
- Email notifications
- Audit trail
- User roles and permissions

**Phase 3:**
- Multi-language support
- Advanced search/filtering
- Bulk export (CSV, Excel)
- Mobile app (React Native)

---

## 🤝 Contributing

This project is currently in the design/implementation phase. Once the MVP is complete, contribution guidelines will be added.

---

## 📜 License

TBD

---

## 📞 Support

For questions or issues during development, refer to:
- Architecture docs in `/docs/`
- Implementation timeline for guidance
- Project 1 (HSE Checklist) in `../hse-checklist/` for patterns

---

## 🎯 Success Criteria

The application is complete when:

- ✅ Users can register and login
- ✅ Users can create submission packages
- ✅ Users can fill out all 18 form sections
- ✅ Auto-save works reliably
- ✅ Users can upload supporting documents
- ✅ System generates filled PDFs
- ✅ Users can submit complete packages
- ✅ Submitted packages become read-only
- ✅ Application is deployed to production

---

## 📅 Timeline

- **Design Phase:** Complete ✅
- **Implementation:** 3 weeks (15 working days)
- **Testing & Polish:** Included in implementation
- **Deployment:** Day 15
- **Production Launch:** Week 3, Day 15

---

## 🙏 Acknowledgments

- Architecture patterns adapted from Project 1 (HSE Checklist)
- Official Basel Convention notification form as reference
- pdf-lib library for PDF generation

---

**Status:** Design complete, ready to begin implementation!

**Next Step:** Follow Day 1 of [IMPLEMENTATION_TIMELINE.md](docs/IMPLEMENTATION_TIMELINE.md)
