# SkillSync AI — AI-Powered Skills Intelligence Platform

A production-ready hackathon project that uses Claude AI to extract skills from resumes, perform semantic natural language search, and build AI-recommended teams.

---

## Tech Stack

**Frontend:** React 18 + Vite + Tailwind CSS + Framer Motion + React Router  
**Backend:** Node.js + Express + MongoDB + JWT Auth + Multer + pdf-parse  
**AI:** Claude API (claude-opus-4-7) via @anthropic-ai/sdk

---

## Features

- **AI Resume Ingestion** — Upload PDF resumes, Claude extracts structured data (skills, experience, projects, certifications)
- **Skill Inference Engine** — Automatically infers related skills (e.g., Next.js → React + JavaScript)
- **AI Semantic Search** — Natural language HR search powered by Claude (e.g., "React developers with fintech experience in Pune")
- **Review & Approval Workflow** — HR can review, approve, or reject extracted profiles
- **Employee Directory** — Filterable, searchable grid with skill tags and modals
- **Team Builder** — AI recommends optimal teams based on project requirements
- **Dark/Light Mode** — Full theme support
- **JWT Authentication** — Role-based access (HR / Employee)

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Anthropic API key ([get one here](https://console.anthropic.com/))

### 1. Clone and setup

```bash
cd project
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY and MONGODB_URI
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 4. Seed the Database

```bash
cd backend
npm run seed
```

This creates:
- 2 HR users
- 15 realistic employee profiles (all approved, with skills)

### 5. Login Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| HR Manager | priya.hr@skillsync.ai | password123 |
| HR Manager | rohit.hr@skillsync.ai | password123 |
| Employee | rahul@example.com | password123 |
| Employee | sneha@example.com | password123 |
| *(all employees)* | *see seeds/seedData.js* | password123 |

---

## Environment Variables

**Backend (.env)**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/skillsync_ai
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
ANTHROPIC_API_KEY=sk-ant-api03-...
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | Public | Register user |
| POST | /api/auth/login | Public | Login |
| GET | /api/auth/me | Any | Get current user |
| GET | /api/employees | Any | List employees |
| GET | /api/employees/stats | HR | Dashboard stats |
| GET | /api/employees/me | Employee | My profile |
| POST | /api/upload/resume | Employee | Upload PDF resume |
| GET | /api/reviews/pending | HR | Pending review queue |
| PUT | /api/reviews/:id/approve | HR | Approve profile |
| PUT | /api/reviews/:id/reject | HR | Reject profile |
| POST | /api/search/semantic | HR | AI semantic search |
| POST | /api/team-builder/build | HR | Build team recommendation |

---

## Project Structure

```
project/
├── backend/
│   ├── controllers/      # Route handlers
│   ├── middleware/       # Auth, upload, error handling
│   ├── models/           # Mongoose schemas
│   ├── routes/           # Express routers
│   ├── seeds/            # Database seed data (15 employees)
│   ├── services/         # Claude AI service, skill inference
│   ├── uploads/          # PDF storage
│   └── server.js
│
└── frontend/
    └── src/
        ├── components/
        │   ├── employee/   # EmployeeCard, EmployeeModal
        │   ├── resume/     # ResumeUpload with progress
        │   └── ui/         # Navbar, Sidebar, Modal, etc.
        ├── context/        # AuthContext, ThemeContext
        ├── layouts/        # MainLayout, AuthLayout
        ├── pages/          # HRDashboard, AISearch, etc.
        ├── services/       # API client (axios)
        └── utils/          # Helpers, color maps
```

---

## AI Features in Detail

### Resume Extraction (Claude)
Sends PDF text to Claude → receives structured JSON:
- Name, role, location, summary
- Skills with category + proficiency level
- Projects with technologies
- Experience at companies
- Certifications and education

### Skill Inference Engine
Local rule-based system that infers related skills:
- `Next.js` → infers `React`, `JavaScript`
- `Express.js` → infers `Node.js`
- `Kubernetes` → infers `Docker`, `DevOps`
- 35+ rules covering major tech stacks

### Semantic Search (Claude)
Sends HR query + employee profiles to Claude → Claude returns:
- Ranked candidates with match % (0-100)
- Summary for each candidate
- Detailed reasoning
- Matching skills list
- Strength areas and concerns

### Team Builder (Claude)
Sends requirement + available employees → Claude recommends:
- Optimal team composition
- Role assignment for each member
- Why each person was selected
- Skill coverage analysis
- Gap identification

---

## Hackathon Demo Script

1. **Login as HR** → priya.hr@skillsync.ai / password123
2. **View Dashboard** → See stats, charts, pending reviews
3. **AI Search** → Try "React developers with fintech experience"
4. **Review Queue** → Approve/reject profiles
5. **Team Builder** → "Build a fintech team with frontend, backend, DevOps"
6. **Employee Directory** → Browse all profiles with filtering

7. **Register as Employee** → Upload a real PDF resume
8. **Watch AI extract skills** in real-time with progress
9. **View extracted profile** with inferred skills

---

Built with ❤️ for hackathon using Claude AI by Anthropic
