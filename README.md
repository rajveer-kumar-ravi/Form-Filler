# FormFlow (Form-Filler) ⚡

> A production-quality, Typeform-inspired conversational form-building platform built with Next.js 14, TypeScript, Tailwind CSS, FastAPI, and SQLAlchemy.

---

## ✨ Features

### 🛠️ 1. Professional 3-Panel Form Builder
* **Left Panel:** Drag-and-drop question reordering (`@dnd-kit`), Welcome Screen, Question Steps, and Thank-You Screen.
* **Center Panel:** In-depth question configuration:
  * Title & Subtitle / Help text
  * Required / Optional toggle
  * Type-specific settings (choices, min/max numbers, rating scale, accepted file formats)
  * Duplicate, delete, and navigation
* **Right Panel:** Interactive real-time live preview matching the exact respondent interface.

### 📋 2. Nine Supported Question Types
1. **Short Text:** Single-line inputs (Names, Titles, handles).
2. **Long Text:** Multi-line textarea (Feedback, details, essays).
3. **Multiple Choice:** Customizable options with single-select and hotkey navigation (A, B, C, D).
4. **Dropdown:** Compact selection menu for large option lists.
5. **Email Address:** Automatic format validation with error alerts.
6. **Number:** Numeric-only inputs with optional Min/Max range constraints.
7. **Yes / No:** Binary selection with keyboard shortcuts (`Y` / `N`).
8. **Rating Scale:** Configurable rating scales (1–5, 1–7, 1–10) with custom Min/Max labels.
9. **File / PDF Resume:** Drag-and-drop or browse PDF/document file upload (up to 15MB) with real-time upload progress, preview badge, and download links.

### 🎯 3. Conversational Respondent Experience (`/form/[shareId]`)
* One-question-at-a-time focus to maximize completion rates.
* Smooth Framer Motion transitions between questions.
* Full keyboard navigation (Enter to proceed, Up/Down arrows, letter hotkeys).
* Real-time progress bar.
* Responsive on desktop, tablet, and mobile screens.
* Celebratory confetti animation upon submission.

### 📊 4. Results & Analytics Dashboard (`/forms/[id]/results`)
* Key metrics: Total responses, Completion Rate, Average Completion Time.
* Interactive question-by-question breakdown charts.
* Submissions data table with quick preview drawer.
* Dedicated single-response view (`/forms/[id]/responses/[responseId]`).
* Direct download/view links for uploaded PDF resumes.
* 1-Click CSV data export.

### 🧭 5. Interactive Visual User Guide & Guided Tour (`/guide`)
* 10 complete chapters teaching the platform end-to-end.
* Real UI screenshots captured directly from the running application.
* Interactive guided tour with Driver.js that highlights working elements.
* Beginner-friendly explanations.

---

## 🏗️ Architecture & Tech Stack

```
Form-Filler/
├── backend/                  # FastAPI Python backend
│   ├── app/
│   │   ├── routers/          # API endpoints (forms, questions, responses, analytics, upload, public)
│   │   ├── crud.py           # Database operations
│   │   ├── database.py       # SQLAlchemy engine & session
│   │   ├── main.py           # FastAPI application entrypoint & static mount
│   │   ├── models.py         # SQLAlchemy relational database models
│   │   ├── schemas.py        # Pydantic v2 validation schemas
│   │   └── seed.py           # Initial sample data seed
│   ├── scripts/              # Helper utilities
│   ├── tests/                # Automated API & E2E pytest suite
│   ├── uploads/              # Static file storage for uploaded resumes
│   └── requirements.txt      # Python dependencies
├── frontend/                 # Next.js 14 App Router frontend
│   ├── src/
│   │   ├── app/              # Routes (/dashboard, /forms/new, /forms/[id]/builder, /form/[shareId], /guide, etc.)
│   │   ├── components/       # Builder, Respondent, Dashboard, Results, Common UI components
│   │   ├── lib/              # API client and helper utilities
│   │   └── types/            # TypeScript data models and interfaces
│   ├── public/               # Static assets & guide screenshots
│   ├── package.json          # Dependencies & npm scripts
│   └── tailwind.config.ts    # Styling configuration
└── README.md
```

### Stack Details
* **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS, Framer Motion, @dnd-kit, Lucide React, Axios, Canvas Confetti.
* **Backend:** FastAPI, Python 3.10+, SQLAlchemy 2.0, Pydantic v2, SQLite (relational schema with foreign keys and cascading deletes), Uvicorn.

---

## 🚀 Quick Start Guide

### Prerequisites
* Python 3.10 or higher
* Node.js 18.x or higher
* npm or yarn

---

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create a virtual environment
python3 -m venv .venv

# Activate the virtual environment
# On macOS/Linux:
source .venv/bin/activate
# On Windows:
# .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

* Backend API runs at: `http://127.0.0.1:8000`
* Interactive API Documentation (Swagger UI): `http://127.0.0.1:8000/docs`

---

### 2. Frontend Setup

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Start the development server
npm run dev
```

* Frontend Application runs at: `http://localhost:3000`

---

## 🧪 Running Automated Tests

The backend includes a comprehensive test suite covering form CRUD, question reordering, submissions, analytics, CSV export, and file uploads:

```bash
cd backend
source .venv/bin/activate
pytest tests/ -v
```

---

## 📄 API Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/forms` | List all created forms with response counts |
| `POST` | `/api/forms` | Create a new form |
| `GET` | `/api/forms/{id}` | Get form details including questions |
| `PUT` | `/api/forms/{id}` | Update form settings and title |
| `POST` | `/api/forms/{id}/publish` | Publish form and generate shareable link |
| `POST` | `/api/forms/{id}/unpublish` | Unpublish form |
| `POST` | `/api/forms/{id}/duplicate` | Duplicate an existing form |
| `DELETE` | `/api/forms/{id}` | Delete form and all associated questions/responses |
| `POST` | `/api/forms/{id}/questions` | Add a new question to a form |
| `PUT` | `/api/forms/{id}/questions/reorder` | Update question order |
| `POST` | `/api/upload` | Upload resume / PDF file (up to 15MB) |
| `GET` | `/api/public/form/{share_id}` | Public form fetch for respondents |
| `POST` | `/api/public/form/{share_id}/submit` | Public form response submission |
| `GET` | `/api/forms/{id}/analytics` | Overall form performance metrics & question breakdown |
| `GET` | `/api/forms/{id}/responses/export` | Download submissions as CSV file |

---

## 📝 License

This project is licensed under the MIT License.
