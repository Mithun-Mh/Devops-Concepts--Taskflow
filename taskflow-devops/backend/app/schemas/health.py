from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class HealthResponse(BaseModel):
    """
    Schema for system health probe responses.
    Used by Kubernetes liveness/readiness probes and monitoring tools.
    """
    status: str = Field(..., examples=["healthy"], description="Current service health state")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="UTC timestamp of the health check")
    environment: str = Field(..., examples=["development"], description="Runtime environment")
    version: str = Field(..., examples=["0.1.0"], description="Application semantic version")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "status": "healthy",
                "timestamp": "2026-10-05T08:30:00Z",
                "environment": "development",
                "version": "0.1.0",
            }
        }
    )
