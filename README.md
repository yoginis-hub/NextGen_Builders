# SkillSync AI — AI-Powered Skills Intelligence Platform

An AI-powered HR platform that extracts skills from resumes, runs semantic talent search, and builds project teams using Claude AI.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Backend Setup](#2-backend-setup)
- [All Commands Reference](#all-commands-reference)
  - [3. Frontend Setup](#3-frontend-setup)
  - [4. Seed the Database](#4-seed-the-database)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [Default Login Credentials](#default-login-credentials)
- [User Roles & Permissions](#user-roles--permissions)
- [API Endpoints](#api-endpoints)
- [AI Features](#ai-features)
- [Production Build](#production-build)
- [Troubleshooting](#troubleshooting)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, React Router v6 |
| Backend | Node.js, Express.js, MongoDB, Mongoose, JWT |
| AI | Anthropic Claude API (`claude-opus-4-7`) via `@anthropic-ai/sdk` |
| File Handling | Multer, pdf-parse |
| Auth | JWT (JSON Web Tokens), bcryptjs |

---

## Features

- **AI Resume Ingestion** — Upload PDF resumes; Claude extracts skills, experience, projects, and certifications
- **Skill Inference Engine** — Automatically infers related skills (e.g. Next.js → React, JavaScript)
- **AI Semantic Search** — Natural language search (e.g. "React developers with fintech experience in Pune")
- **HR Review Workflow** — Approve or reject employee profiles with notes
- **Team Builder** — AI recommends optimal project teams based on requirements
- **Employee Directory** — Filterable, searchable grid with skill tags and profile modals
- **Manage HR** — HR users can create new HR accounts from inside the dashboard
- **Company Email Enforcement** — All users (HR and employees) must set a `@skillsync.ai` company email after first login
- **Role-based Access Control** — Separate dashboards and permissions for HR and Employee roles
- **Dark / Light Mode** — Full theme support across all pages

---

## Prerequisites

Make sure the following are installed on your machine before starting:

| Tool | Minimum Version | Download |
|---|---|---|
| Node.js | 18.x or higher | https://nodejs.org |
| npm | 9.x or higher | Included with Node.js |
| MongoDB | 6.x or higher | https://www.mongodb.com/try/download/community |
| Git | Any recent version | https://git-scm.com |

You also need:
- An **Anthropic API key** — get one at https://console.anthropic.com (required for AI features)

---

## Project Structure

```
NextGen_Builders/
├── backend/                      # Express.js API server
│   ├── controllers/              # Route handler functions
│   │   ├── authController.js     # Register, login, profile, create HR
│   │   ├── employeeController.js # Employee CRUD and stats
│   │   ├── uploadController.js   # Resume upload and AI extraction
│   │   ├── reviewController.js   # HR review queue
│   │   ├── searchController.js   # AI semantic search
│   │   ├── teamBuilderController.js # AI team builder
│   │   └── importController.js   # Bulk CSV/PDF import
│   ├── middleware/
│   │   ├── auth.js               # JWT protect + role authorize
│   │   ├── upload.js             # Multer file upload config
│   │   └── errorHandler.js       # Global error handler
│   ├── models/
│   │   ├── User.js               # Auth user (HR / Employee)
│   │   ├── Employee.js           # Employee profile + skills
│   │   ├── Review.js             # HR review records
│   │   └── SearchHistory.js      # AI search history
│   ├── routes/                   # Express routers
│   ├── seeds/
│   │   └── seedData.js           # Demo data: 2 HR + 15 employees
│   ├── services/
│   │   ├── claudeService.js      # Anthropic API calls
│   │   ├── skillInference.js     # Skill inference rule engine
│   │   └── emailService.js       # Email notifications (optional)
│   ├── uploads/                  # Uploaded PDFs and avatars
│   ├── .env.example              # Environment variable template
│   └── server.js                 # App entry point
│
└── frontend/                     # React + Vite application
    ├── src/
    │   ├── components/
    │   │   ├── employee/         # EmployeeCard, EditEmployeeModal
    │   │   ├── resume/           # ResumeUpload with progress steps
    │   │   └── ui/               # Navbar, Sidebar, Modal, ThemeToggle
    │   ├── context/
    │   │   ├── AuthContext.jsx   # Auth state, login, register, logout
    │   │   └── ThemeContext.jsx  # Dark/light mode
    │   ├── layouts/
    │   │   ├── MainLayout.jsx    # Sidebar + Navbar wrapper
    │   │   └── AuthLayout.jsx    # Login/register wrapper
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── SetupCompanyEmail.jsx
    │   │   ├── HRDashboard.jsx
    │   │   ├── AISearch.jsx
    │   │   ├── ReviewQueue.jsx
    │   │   ├── TeamBuilder.jsx
    │   │   ├── ImportEmployees.jsx
    │   │   ├── ManageHR.jsx      # HR-only: create new HR accounts
    │   │   ├── EmployeeDashboard.jsx
    │   │   ├── EmployeeDirectory.jsx
    │   │   └── Profile.jsx
    │   ├── services/
    │   │   └── api.js            # Axios instance with auth headers
    │   └── utils/
    │       └── helpers.js        # Initials, avatar colors, date helpers
    ├── index.html
    ├── vite.config.js            # Dev server on port 3000, proxies /api → 5000
    └── tailwind.config.js
```

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yoginis-hub/NextGen_Builders.git
cd NextGen_Builders
```

---

### 2. Backend Setup

```bash
# Navigate to the backend folder
cd backend

# Install dependencies
npm install

# Copy the environment variable template
cp .env.example .env
```

Now open `backend/.env` in a text editor and fill in your values:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/skillsync_ai
JWT_SECRET=replace_this_with_a_long_random_string
JWT_EXPIRE=7d
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
FRONTEND_URL=http://localhost:3000

# Email is optional — if not set, email content prints to the console
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
```

> **ANTHROPIC_API_KEY** is required for resume extraction, AI search, and team builder.
> Get one at https://console.anthropic.com

Start the backend server:

```bash
# Development (auto-restarts on file change)
npm run dev

# Production
npm start
```

The backend runs at **http://localhost:5000**

---

### 3. Frontend Setup

Open a **new terminal** and run:

```bash
# Navigate to the frontend folder
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The frontend runs at **http://localhost:3000**

> The Vite dev server automatically proxies `/api/*` requests to the backend at `http://localhost:5000`, so no CORS issues during development.

---

### 4. Seed the Database

In a new terminal (with the backend running):

```bash
cd backend
npm run seed
```

This creates:
- **2 HR Manager** accounts
- **15 Employee** profiles (all approved, with realistic skills and experience)

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `5000` | Port the API server listens on |
| `MONGODB_URI` | Yes | — | MongoDB connection string |
| `JWT_SECRET` | Yes | — | Secret key for signing JWT tokens (make it long and random) |
| `JWT_EXPIRE` | No | `7d` | How long JWT tokens are valid |
| `ANTHROPIC_API_KEY` | Yes* | — | Anthropic Claude API key (*required for all AI features) |
| `FRONTEND_URL` | No | `http://localhost:3000` | Allowed CORS origin |
| `UPLOAD_PATH` | No | `./uploads` | Directory to store uploaded files |
| `MAX_FILE_SIZE` | No | `10485760` | Max upload size in bytes (default 10 MB) |
| `EMAIL_HOST` | No | — | SMTP host for email notifications |
| `EMAIL_PORT` | No | — | SMTP port |
| `EMAIL_USER` | No | — | SMTP username |
| `EMAIL_PASS` | No | — | SMTP password or app password |

---

## Running the Project

You need **two terminals** running at the same time:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Then open your browser at **http://localhost:3000**

---

## Default Login Credentials

After running `npm run seed` in the backend:

| Role | Email | Password |
|---|---|---|
| HR Manager | priya.hr@skillsync.ai | `password123` |
| HR Manager | rohit.hr@skillsync.ai | `password123` |
| Employee | rahul@example.com | `password123` |
| Employee | sneha@example.com | `password123` |
| All other employees | see `backend/seeds/seedData.js` | `password123` |

> **Note:** After first login, all users are required to set a company email (`@skillsync.ai`) before accessing the dashboard. The seeded HR accounts already have this set.

---

## User Roles & Permissions

### HR Manager
- View dashboard with stats and charts
- AI semantic search across all employees
- Review, approve, or reject employee profiles
- Build teams using AI
- Bulk import employees via PDF or CSV
- Browse and edit the employee directory
- Create new HR accounts (`/hr/manage-hr`)

### Employee
- Upload PDF resume (triggers AI extraction)
- View and edit own profile (bio, skills, links, availability)
- Browse approved employee directory
- Must set a company email (`@skillsync.ai`) after first login

---

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a new employee account |
| POST | `/api/auth/login` | Public | Login and receive JWT token |
| GET | `/api/auth/me` | Any | Get logged-in user's profile |
| PUT | `/api/auth/profile` | Any | Update name, avatar, phone, location |
| PATCH | `/api/auth/company-email` | Any | Set company email (`@skillsync.ai`) |
| POST | `/api/auth/create-hr` | HR only | Create a new HR Manager account |

### Employees
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/employees` | Any | List employees (HR sees all, employees see approved) |
| GET | `/api/employees/me` | Employee | Get own employee profile |
| GET | `/api/employees/stats` | HR | Dashboard statistics |
| GET | `/api/employees/:id` | Any | Get a single employee profile |
| PUT | `/api/employees/:id` | Any | Update employee profile (employees update own only) |
| DELETE | `/api/employees/:id` | HR | Delete an employee profile |

### Upload
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/upload/resume` | Employee | Upload PDF resume, trigger AI extraction |

### Reviews
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/reviews/pending` | HR | Get pending review queue |
| PUT | `/api/reviews/:id/approve` | HR | Approve an employee profile |
| PUT | `/api/reviews/:id/reject` | HR | Reject a profile with notes |

### Search
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/search/semantic` | HR | AI-powered natural language talent search |
| GET | `/api/search/history` | HR | Get recent search history |

### Team Builder
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/team-builder/build` | HR | AI team recommendation based on requirements |

### Import
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/import/pdf` | HR | Bulk import employee profiles from multiple PDFs |
| POST | `/api/import/csv` | HR | Import employee data from CSV file |

### Misc
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | Public | Server health check |

---

## AI Features

### Resume Extraction
When an employee uploads a PDF resume, the backend:
1. Extracts raw text using `pdf-parse`
2. Sends text to Claude with a structured prompt
3. Claude returns a JSON object with name, role, location, summary, skills (with category + proficiency), projects, certifications, education, and previous companies
4. Falls back to a regex-based local extractor if the API is unavailable

### Skill Inference Engine
A local rule-based system (`services/skillInference.js`) infers related skills:
- `Next.js` → React, JavaScript
- `Express.js` → Node.js, JavaScript
- `Docker` → Kubernetes, DevOps
- `TensorFlow` → Machine Learning, Python
- 40+ rules covering major tech stacks

### Semantic Search
HR types a natural language query → Claude receives the query plus all employee profiles → Returns ranked candidates with match percentage, reasoning, matching skills, and concerns.

### Team Builder
HR describes a project → Claude receives requirements plus available employees → Returns an optimal team composition with role assignments and skill gap analysis.

---

## Production Build

To build the frontend for production:

```bash
cd frontend
npm run build
```

This creates a `frontend/dist/` folder with optimised static files. You can preview the production build locally:

```bash
npm run preview
```

For the backend in production, set `NODE_ENV=production` in your `.env` and use a process manager like PM2:

```bash
npm install -g pm2
cd backend
pm2 start server.js --name skillsync-api
```

---

## All Commands Reference

### Backend Commands

```bash
# Go to backend folder
cd backend

# Install all dependencies
npm install

# Start in development mode (auto-restarts on file change using nodemon)
npm run dev

# Start in production mode
npm start

# Seed the database with demo HR and employee data
npm run seed
```

### Frontend Commands

```bash
# Go to frontend folder
cd frontend

# Install all dependencies
npm install

# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production (output goes to frontend/dist/)
npm run build

# Preview the production build locally
npm run preview
```

### Git Commands

```bash
# Check status of changed files
git status

# Stage all changes
git add .

# Commit with a message
git commit -m "your commit message"

# Push to GitHub
git push

# Pull latest changes from GitHub
git pull
```

### MongoDB Commands (if running locally)

```bash
# Start MongoDB server (Windows)
mongod

# Start MongoDB server (Mac/Linux)
sudo systemctl start mongod

# Open MongoDB shell
mongosh

# List all databases
show dbs

# Switch to the project database
use skillsync_ai

# View all users
db.users.find()

# View all employees
db.employees.find()

# Drop and reseed the database (run from backend folder)
npm run seed
```

### Useful One-Liners

```bash
# Run backend and frontend together (Mac/Linux — requires two terminals or use & to background)
cd backend && npm run dev & cd ../frontend && npm run dev

# Check if ports are in use (Windows)
netstat -ano | findstr :5000
netstat -ano | findstr :3000

# Check if ports are in use (Mac/Linux)
lsof -i :5000
lsof -i :3000

# Kill a process on a port (Windows — replace PID with actual number from above)
taskkill /PID <PID> /F

# Kill a process on a port (Mac/Linux)
kill -9 $(lsof -t -i:5000)
```

---

## Troubleshooting

**MongoDB connection error**
- Make sure MongoDB is running locally: `mongod` or check your Atlas URI
- Verify `MONGODB_URI` in `backend/.env` is correct

**AI features not working (search, resume extraction, team builder)**
- Check that `ANTHROPIC_API_KEY` is set correctly in `backend/.env`
- Verify the key is active at https://console.anthropic.com
- The app falls back to regex-based extraction for resumes if the key is missing

**Frontend shows blank page or 404 on refresh**
- In development this should not happen (Vite handles it)
- In production, configure your web server (Nginx/Apache) to serve `index.html` for all routes

**CORS errors in the browser**
- Make sure `FRONTEND_URL` in `backend/.env` matches exactly where the frontend is running
- In development, Vite's proxy handles this automatically — no change needed

**Port already in use**
- Backend default port is `5000` — change `PORT` in `backend/.env`
- Frontend default port is `3000` — change `server.port` in `frontend/vite.config.js`

**File upload fails**
- Check the `uploads/` folder exists inside `backend/` (it's created automatically on first run)
- Verify `MAX_FILE_SIZE` allows your file size (default 10 MB)
- Only PDF files are accepted for resume upload

---

Built with React, Express, MongoDB, and Claude AI by Anthropic.
