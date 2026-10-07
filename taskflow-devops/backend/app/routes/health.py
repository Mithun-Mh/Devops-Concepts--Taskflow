import os
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.schemas.health import HealthResponse
from app.database import get_db, check_db_connection

router = APIRouter(tags=["Health & Probes"])


@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Service Health Probe",
    description="Returns service availability, environment, and version for Kubernetes liveness & readiness probes.",
)
async def get_health():
    """
    Health check endpoint returning 200 OK when service is operational.
    """
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now(timezone.utc),
        environment=os.getenv("ENVIRONMENT", "development"),
        version=os.getenv("APP_VERSION", "0.1.0"),
    )


@router.get(
    "/health/db",
    status_code=status.HTTP_200_OK,
    summary="Database Connection Probe",
    description="Executes a lightweight SELECT 1 against PostgreSQL to verify the database is reachable.",
)
async def get_db_health(db: Session = Depends(get_db)):
    """
    Verifies the FastAPI backend can successfully connect to PostgreSQL.
    Returns 200 on success, 503 if the database is unreachable.
    """
    try:
        check_db_connection()
        return {
            "status": "connected",
            "database": "postgresql",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database unreachable: {exc}",
        )
