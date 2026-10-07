from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from app.config import settings
from app.routes import api_router
from app.database import Base, engine

# Import models so SQLAlchemy registers them with Base before create_all()
import app.models  # noqa: F401

# Create all tables in PostgreSQL (safe to call on every startup — it's a no-op
# if the tables already exist)
Base.metadata.create_all(bind=engine)

# Configure Swagger UI & OpenAPI metadata
tags_metadata = [
    {
        "name": "Health & Probes",
        "description": "Kubernetes liveness, readiness, and database health endpoints.",
    },
    {
        "name": "Tasks",
        "description": "CRUD operations for DevOps tasks and pipeline items.",
    },
]

app = FastAPI(
    title="TaskFlow DevOps Platform API",
    description="""
# TaskFlow REST API

Production-ready backend API for the **TaskFlow** task management platform.
Built with **FastAPI**, **Pydantic v2**, **SQLAlchemy 2**, and **PostgreSQL**.

## Features
* **PostgreSQL**: Persistent relational storage via SQLAlchemy ORM.
* **Health Probes**: `/api/health` and `/api/health/db` for Kubernetes orchestration.
* **Declarative Validation**: Automated payload validation using Pydantic.
* **Interactive Documentation**: Auto-generated OpenAPI / Swagger UI specs.
    """,
    version=settings.APP_VERSION,
    openapi_tags=tags_metadata,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware (Allows Next.js frontend to interact with FastAPI)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Router under /api prefix
app.include_router(api_router, prefix="/api")


@app.get("/", include_in_schema=False)
async def root():
    """
    Redirects root requests directly to the interactive Swagger UI documentation.
    """
    return RedirectResponse(url="/docs")
