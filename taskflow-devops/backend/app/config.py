# ==============================================================================
# config.py — Application Settings via Environment Variables
# ==============================================================================
# pydantic-settings reads values from environment variables (or a .env file)
# and validates them automatically. This is the single source of truth for
# all configuration — NO hard-coded credentials anywhere in the codebase.
# ==============================================================================

from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application configuration loaded from environment variables.

    Priority order (highest → lowest):
      1. Real environment variables (e.g. set in shell / Docker / Kubernetes)
      2. Values in a local .env file (development convenience)
      3. Default values defined below

    Never commit a .env file with real credentials to version control.
    Use .env.example as the template and add .env to .gitignore.
    """

    # ----- Database --------------------------------------------------------
    # Full PostgreSQL connection URL.
    # Format: postgresql://<user>:<password>@<host>:<port>/<dbname>
    DATABASE_URL: str = "postgresql://taskflow_user:taskflow_password@localhost:5432/taskflow_db"

    # Echo every SQL statement to stdout (useful for debugging, disable in prod)
    SQL_ECHO: bool = False

    # ----- CORS ---------------------------------------------------------------
    # Comma-separated list of allowed frontend origins.
    # Example (production): CORS_ORIGINS=https://app.example.com,https://www.example.com
    # Never use "*" in production with allow_credentials=True.
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: object) -> List[str]:
        """Accept either a comma-separated string or an already-parsed list."""
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        raise ValueError(f"CORS_ORIGINS must be a string or list, got {type(v)}")

    # ----- App ---------------------------------------------------------------
    APP_VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"

    model_config = SettingsConfigDict(
        env_file=".env",          # Load from .env if it exists
        env_file_encoding="utf-8",
        case_sensitive=True,      # DATABASE_URL != database_url
        extra="ignore",           # Silently ignore unknown env vars
    )


# Singleton instance — import this throughout the application
settings = Settings()
