# System Architecture & Design Details

This document outlines the architecture, data flow, and components of the **TaskFlow** platform.

## Application Architecture

TaskFlow implements a decoupled 3-tier architecture:

1. **Client Tier (Frontend)**:
   - Next.js 14+ (App Router)
   - React components styled with Tailwind CSS and shadcn/ui primitives.
   - Client sends JSON HTTP requests to the backend REST API.

2. **Application Tier (Backend)**:
   - Python FastAPI application exposing RESTful JSON endpoints.
   - Pydantic models for strict payload validation.
   - SQLAlchemy ORM for database queries and migrations.
   - Health check endpoint at `/api/health` for Kubernetes probes.

3. **Data Tier (Database)**:
   - PostgreSQL 16 relational database.
   - Persisted on dedicated volumes across container and pod lifecycles.

## API Specifications

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health and database connectivity probe |
| `GET` | `/api/tasks` | Retrieve all tasks (supports `?status=` filter) |
| `GET` | `/api/tasks/{id}` | Retrieve specific task by ID |
| `POST` | `/api/tasks` | Create a new task |
| `PUT` | `/api/tasks/{id}` | Update existing task details or status |
| `DELETE` | `/api/tasks/{id}` | Delete a task |

## Data Model

```text
Task:
  - id: integer (primary key, auto-increment)
  - title: string (1-100 characters, required)
  - description: string (optional)
  - status: enum ('TODO', 'IN_PROGRESS', 'DONE') (default: 'TODO')
  - created_at: timestamp with timezone (auto-generated)
  - updated_at: timestamp with timezone (auto-updated)
```
