import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

# Ensure backend and repo root are in python search path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
REPO_ROOT = os.path.dirname(BACKEND_DIR)
for p in [CURRENT_DIR, BACKEND_DIR, REPO_ROOT]:
    if p not in sys.path:
        sys.path.insert(0, p)

try:
    from backend.app.database import engine, Base
    from backend.app.seed import seed_database
    from backend.app.routers import forms, questions, public, responses, analytics, upload
except ImportError:
    from app.database import engine, Base
    from app.seed import seed_database
    from app.routers import forms, questions, public, responses, analytics, upload

UPLOAD_DIR = os.path.abspath(os.path.join(BACKEND_DIR, "uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables
    Base.metadata.create_all(bind=engine)
    # Automatically seed initial forms & sample responses if empty
    seed_database()
    yield


app = FastAPI(
    title="FormFlow API",
    description="Typeform-inspired conversational form-building platform API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS setup - allow all origins so deployed frontend (Vercel, Netlify, Render) can seamlessly communicate
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Static Uploads directory for downloadable PDF resumes and files
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(forms.router)
app.include_router(questions.router)
app.include_router(public.router)
app.include_router(responses.router)
app.include_router(analytics.router)
app.include_router(upload.router)


@app.get("/")
def root():
    return {
        "name": "FormFlow API",
        "status": "healthy",
        "docs_url": "/docs",
        "version": "1.0.0"
    }


@app.get("/api/health")
def health():
    return {"status": "ok"}
