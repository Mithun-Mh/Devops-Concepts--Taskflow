import os
from datetime import datetime, timezone
from fastapi import APIRouter, status
from app.schemas.health import HealthResponse

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
