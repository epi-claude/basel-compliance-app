# Getting Started - Basel Compliance App

**Welcome!** You're ready to begin building the Basel Compliance application. This guide will help you get started with implementation.

---

## ✅ Design Phase Complete

All architecture and planning documents have been created:

- [x] Database schema designed (3 tables, 122 fields)
- [x] API endpoints specified (32 endpoints)
- [x] Component architecture planned (18 sections)
- [x] PDF field mapping strategy defined
- [x] 15-day implementation timeline created
- [x] Complete architecture summary documented

---

## 📚 Required Reading Before Starting

**Must read (in order):**

1. **[ARCHITECTURE_SUMMARY.md](docs/ARCHITECTURE_SUMMARY.md)** (15 min)
   - Overview of entire system
   - Key decisions and rationale
   - Technology stack

2. **[IMPLEMENTATION_TIMELINE.md](docs/IMPLEMENTATION_TIMELINE.md)** (20 min)
   - Day-by-day build plan
   - Detailed task breakdown
   - Timeline and milestones

3. **[DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)** (15 min)
   - 3-table architecture
   - All 115 Basel form fields
   - Relationships and indexes

**Reference as needed:**

- [API_SPECIFICATION.md](docs/API_SPECIFICATION.md) - When building endpoints
- [COMPONENT_ARCHITECTURE.md](docs/COMPONENT_ARCHITECTURE.md) - When building React components
- [PDF_FIELD_MAPPING.md](docs/PDF_FIELD_MAPPING.md) - When implementing PDF generation

---

## 🎯 Pre-Implementation Checklist

Before starting Day 1, ensure you have:

### **Development Environment**
- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm or yarn installed (`npm --version`)
- [ ] Git installed (`git --version`)
- [ ] Code editor (VSCode recommended)
- [ ] Terminal/command line access

### **Knowledge Prerequisites**
- [ ] Comfortable with TypeScript
- [ ] Familiar with React Hooks
- [ ] Understand Express.js basics
- [ ] Know SQL basics
- [ ] Can use git for version control

### **Reference Materials**
- [ ] Project 1 (HSE Checklist) available at `../hse-checklist/`
- [ ] Basel PDF form at `./archive/Basel_Notification_App/basel_notifiy_app_form - fields - v1 - application.pdf`
- [ ] Field list at `./archive/Basel_Notification_App/Basel Convention Notification Form - Text fields.txt`

### **Decisions Made**
- [ ] Deployment platform chosen (Railway? Render? AWS?)
- [ ] Production database decided (PostgreSQL on Railway? Supabase?)
- [ ] Domain name selected (optional for MVP)

---

## 🚀 Day 1 - Getting Started

### **Morning: Project Setup (4 hours)**

#### **Step 1: Initialize Root Project**

```bash
# Navigate to project directory
cd basel-compliance-app

# Initialize root package.json
npm init -y

# Configure as workspace
# Edit package.json and add:
{
  "name": "basel-compliance-app",
  "version": "1.0.0",
  "private": true,
  "workspaces": ["client", "server"],
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:server": "cd server && npm run dev",
    "dev:client": "cd client && npm run dev",
    "install:all": "npm install && cd client && npm install && cd ../server && npm install"
  }
}

# Install concurrently for running both servers
npm install --save-dev concurrently
```

#### **Step 2: Initialize Server**

```bash
# Create server directory
mkdir -p server/src/{controllers,services,models,middleware,routes,database,types,utils}

# Initialize server package.json
cd server
npm init -y

# Install dependencies
npm install express cors dotenv bcrypt jsonwebtoken better-sqlite3 pdf-lib multer
npm install --save-dev typescript @types/express @types/cors @types/bcrypt @types/jsonwebtoken @types/better-sqlite3 @types/node @types/multer ts-node nodemon

# Create tsconfig.json
npx tsc --init

# Edit tsconfig.json with these key settings:
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}

# Create .env file
cat > .env << EOF
NODE_ENV=development
PORT=3000
DATABASE_PATH=./database/dev.db
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=7d
CORS_ORIGIN=http://localhost:5173
EOF

# Update package.json scripts:
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

#### **Step 3: Initialize Client**

```bash
# Go back to root
cd ..

# Create React app with Vite
npm create vite@latest client -- --template react-ts

# Install client dependencies
cd client
npm install
npm install axios react-router-dom
npm install --save-dev tailwindcss postcss autoprefixer

# Initialize Tailwind
npx tailwindcss init -p

# Configure Tailwind (edit tailwind.config.js):
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      }
    },
  },
  plugins: [],
}

# Add Tailwind directives to src/index.css:
@tailwind base;
@tailwind components;
@tailwind utilities;

# Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:3000/api
EOF

# Update vite.config.ts:
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  }
})
```

#### **Step 4: Create Directory Structure**

```bash
# Still in client directory
mkdir -p src/{components/{auth,layout,packages,documents,form,ui},pages/{auth,dashboard,packages,notification/sections},contexts,services,hooks,types,utils}

# Go back to root
cd ..

# Create other directories
mkdir -p docs server/database server/uploads server/generated-pdfs
```

**✅ Morning Complete!** You now have:
- Root workspace configured
- Server initialized with TypeScript
- Client initialized with React + Vite + Tailwind
- Directory structure created

---

### **Afternoon: Database & Types (4 hours)**

#### **Step 5: Implement Database**

```bash
cd server

# Create server/src/database/sqlite.ts
# Copy schema from DATABASE_SCHEMA.md
```

Create `server/src/database/sqlite.ts`:

```typescript
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../database/dev.db');

export const db: Database.Database = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

export function initializeDatabase() {
  const schema = `
    -- Copy full schema from DATABASE_SCHEMA.md
    -- Users table
    CREATE TABLE IF NOT EXISTS users (...);

    -- Submission packages table
    CREATE TABLE IF NOT EXISTS submission_packages (...);

    -- Basel notifications table
    CREATE TABLE IF NOT EXISTS basel_notifications (...);

    -- Submission documents table
    CREATE TABLE IF NOT EXISTS submission_documents (...);

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    -- ... (all other indexes)
  `;

  db.exec(schema);
  console.log('✅ Database schema initialized');
}

export default db;
```

#### **Step 6: Create TypeScript Types**

Create `server/src/types/index.ts`:

```typescript
// Copy type definitions from DATABASE_SCHEMA.md

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

export interface SubmissionPackage {
  id: string;
  created_by_user_id: string;
  package_reference: string;
  package_name: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'in_transit' | 'completed' | 'archived';
  // ... (all other fields)
}

export interface BaselNotification {
  id: string;
  submission_package_id: string;
  created_by_user_id: string;
  // All 115 Basel fields
  '1_exporter_notifier_registration_no'?: string;
  '1_exporter_notifier_name'?: string;
  // ... (all other fields)
  status: 'draft' | 'submitted' | 'archived';
  progress_percentage: number;
  created_at: string;
  updated_at: string;
  submitted_at?: string;
}

export interface SubmissionDocument {
  id: string;
  submission_package_id: string;
  created_by_user_id: string;
  document_type: 'notification' | 'movement' | 'chemical_analysis' | 'facility_permit' | 'transport_contract' | 'insurance_certificate' | 'process_description' | 'safety_data_sheet' | 'routing_information' | 'emergency_procedures' | 'other_supporting';
  // ... (all other fields)
}
```

#### **Step 7: Test Database Initialization**

Create `server/src/server.ts` (basic version):

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './database/sqlite';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
initializeDatabase();

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
  console.log(`✅ Health check: http://localhost:${port}/health`);
});
```

Test it:

```bash
# From server directory
npm run dev

# In another terminal, test health check:
curl http://localhost:3000/health

# You should see:
# {"status":"ok","timestamp":"2025-10-24T..."}
```

**✅ Day 1 Complete!** You have:
- Working project structure
- Database initialized
- TypeScript types defined
- Basic server running

---

## 📋 Day 2-15 Checklist

Follow **[IMPLEMENTATION_TIMELINE.md](docs/IMPLEMENTATION_TIMELINE.md)** for detailed day-by-day tasks.

**Quick reference:**
- **Day 2:** Authentication system
- **Day 3:** Package management
- **Days 4-5:** Form infrastructure
- **Days 6-9:** Build 18 sections
- **Day 10:** Validation & testing
- **Days 11-12:** Documents & PDF
- **Days 13-15:** Submission & polish

---

## 🐛 Troubleshooting

### **Common Issues:**

**"Cannot find module 'express'"**
- Run `npm install` in the server directory

**"Port 3000 already in use"**
- Change PORT in `.env` file
- Or kill process on port 3000

**"Database file not found"**
- Check DATABASE_PATH in `.env`
- Ensure `server/database/` directory exists

**"Module not found" in React**
- Run `npm install` in client directory
- Restart Vite dev server

**TypeScript errors**
- Check tsconfig.json settings
- Ensure all types are properly imported

---

## 💡 Tips for Success

1. **Commit frequently**
   - After each feature
   - Use meaningful commit messages
   - Push to GitHub regularly

2. **Test as you go**
   - Don't wait until the end
   - Test each endpoint in Postman/Thunder Client
   - Test each component in browser

3. **Follow Project 1 patterns**
   - Reference `../hse-checklist/` for examples
   - Copy proven patterns (auth, auto-save, etc.)

4. **Keep components small**
   - Max 200-300 lines per component
   - Extract reusable pieces (ContactBlock!)
   - Use custom hooks

5. **Ask for help when stuck**
   - Refer back to design docs
   - Check Project 1 implementation
   - Take breaks when frustrated

---

## 📞 Need Help?

**Refer to:**
- Design docs in `/docs/`
- Project 1 in `../hse-checklist/`
- Implementation timeline for guidance

**If stuck on:**
- **Database:** See DATABASE_SCHEMA.md
- **API:** See API_SPECIFICATION.md
- **Components:** See COMPONENT_ARCHITECTURE.md
- **PDF:** See PDF_FIELD_MAPPING.md

---

## 🎉 Ready to Start!

You've completed the pre-implementation checklist and Day 1 setup. You're now ready to:

1. **Continue with Day 2** of IMPLEMENTATION_TIMELINE.md
2. Build authentication system
3. Start building the application

**Good luck! 🚀**

---

**Remember:** The design is complete. Follow the timeline, refer to the docs, and you'll have a working application in 3 weeks!
