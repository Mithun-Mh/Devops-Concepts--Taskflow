#!/usr/bin/env python3
"""
migrate_add_in_progress.py — One-time migration script
=======================================================
Adds 'in_progress' to the task_status_enum PostgreSQL enum type.

Run this ONCE before restarting the FastAPI backend:
    python migrate_add_in_progress.py

This is idempotent — safe to run multiple times (checks first).
"""

import sys
from sqlalchemy import create_engine, text

try:
    from app.config import settings
    DATABASE_URL = settings.DATABASE_URL
except Exception:
    DATABASE_URL = "postgresql://taskflow_user:taskflow_password@localhost:5432/taskflow_db"

def run_migration():
    engine = create_engine(DATABASE_URL)

    with engine.connect() as conn:
        # Check if 'in_progress' already exists in the enum
        result = conn.execute(text(
            "SELECT 1 FROM pg_enum e "
            "JOIN pg_type t ON e.enumtypid = t.oid "
            "WHERE t.typname = 'task_status_enum' AND e.enumlabel = 'in_progress'"
        ))
        already_exists = result.fetchone() is not None

        if already_exists:
            print("✓ 'in_progress' already exists in task_status_enum — nothing to do.")
            return

        # Add the new enum value (PostgreSQL ALTER TYPE ... ADD VALUE)
        # This must run outside a transaction block
        conn.execute(text("COMMIT"))
        conn.execute(text(
            "ALTER TYPE task_status_enum ADD VALUE 'in_progress'"
        ))
        print("✓ Successfully added 'in_progress' to task_status_enum.")
        print("  Restart FastAPI for the change to take effect.")

if __name__ == "__main__":
    try:
        run_migration()
    except Exception as e:
        print(f"✗ Migration failed: {e}", file=sys.stderr)
        print("\nMake sure PostgreSQL is running (docker compose up -d db)", file=sys.stderr)
        sys.exit(1)
