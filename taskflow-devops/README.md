# TaskFlow – DevOps Task Management Platform

[![CI Pipeline](https://img.shields.io/badge/CI-GitHub_Actions-blue?logo=github-actions)](https://github.com)
[![Docker](https://img.shields.io/badge/Containers-Docker-2496ED?logo=docker)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/Orchestration-kind%20%2F%20Kubernetes-326CE5?logo=kubernetes)](https://kubernetes.io/)
[![GitOps](https://img.shields.io/badge/GitOps-Argo_CD-EF7B4D?logo=argo)](https://argoproj.github.io/cd/)
[![IaC](https://img.shields.io/badge/IaC-Terraform-7B42BC?logo=terraform)](https://www.terraform.io/)
[![Observability](https://img.shields.io/badge/Monitoring-Prometheus%20%26%20Grafana-E6522C?logo=prometheus)](https://prometheus.io/)

TaskFlow is a production-grade, portfolio-ready DevOps platform project. The application itself is an intentionally straightforward, elegant task manager designed to demonstrate end-to-end modern DevOps practices: **containerization, multi-stage builds, automated CI pipelines, Shift-Left security scanning, Kubernetes orchestration via Helm, declarative GitOps continuous delivery, Infrastructure as Code, and production observability.**

---

## 🏗️ Architecture Overview

TaskFlow follows a 3-tier architecture:
- **Frontend**: Next.js with TypeScript, Tailwind CSS, and shadcn/ui.
- **Backend API**: Python FastAPI with SQLAlchemy and Pydantic validation.
- **Database**: PostgreSQL with persistent storage.

```text
[ Browser / Client ]
         │ (HTTP :3000)
         ▼
[ Next.js Frontend ] ──(REST API /api/tasks :8000)──► [ FastAPI Backend ]
                                                              │
                                                     (SQL Connection :5432)
                                                              ▼
                                                     [ PostgreSQL Database ]
```

### The DevOps Engine

```text
[ Developer Push ] ──► [ GitHub Actions CI ] ──► [ Trivy Security Scan ] ──► [ Docker Hub ]
                                                                                   │
[ Git Repository ] ◄── [ Argo CD (GitOps) ] ──────────────────────── (Image Sync) ─┘
         │
         ▼
[ kind Kubernetes Cluster ] ◄── [ Terraform IaC ]
         │
         ▼
[ Prometheus Scraper ] ──► [ Grafana Dashboards ]
```

---

## 🧰 Technology Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | Next.js, TypeScript, Tailwind CSS, shadcn/ui | Modern, responsive task interface |
| **Backend** | Python 3.11+, FastAPI, SQLAlchemy, Pydantic | High-performance RESTful API |
| **Database** | PostgreSQL 16 | Relational data persistence |
| **Containers** | Docker, Docker Compose | Local reproducible runtime environments |
| **CI Automation** | GitHub Actions | Automated linting, testing, and container build |
| **Security** | Trivy | Container vulnerability scanning (DevSecOps) |
| **Registry** | Docker Hub | Central container image repository |
| **Orchestration** | Kubernetes, kind | Local multi-node cluster runtime |
| **Packaging** | Helm (v3) | Declarative Kubernetes manifest templating |
| **Continuous Delivery** | Argo CD | Declarative GitOps reconciliation loop |
| **Infrastructure as Code** | Terraform | Automated local infrastructure provisioning |
| **Observability** | Prometheus & Grafana | Real-time metrics collection and dashboards |

---

## 📁 Repository Structure

```text
taskflow-devops/
├── frontend/                # Next.js client application & Dockerfiles
├── backend/                 # FastAPI REST API, SQLAlchemy models & tests
├── k8s/                     # Raw Kubernetes manifests (reference)
├── helm/                    # Production Helm chart definitions
├── terraform/               # Infrastructure as Code (cluster & namespaces)
├── monitoring/              # Prometheus configs & Grafana dashboards
├── docs/                    # Architecture diagrams & operational runbooks
├── .github/workflows/       # GitHub Actions CI/CD pipeline definitions
├── docker-compose.yml       # Local multi-container development stack
├── .gitignore               # Production-grade Git ignore rules
└── README.md                # Project documentation
```

---

## 🗺️ Roadmap & Current Status

- [x] **Phase 0**: Local Tooling & Prerequisites Setup
- [x] **Phase 1**: Git & Repository Scaffolding (Current)
- [ ] **Phase 2**: Backend API & Database Implementation (FastAPI + PostgreSQL)
- [ ] **Phase 3**: Frontend UI & Docker Compose Integration (Next.js)
- [ ] **Phase 4**: CI Pipeline & Security Scanning (GitHub Actions + Trivy)
- [ ] **Phase 5**: Kubernetes Manifests & Helm Chart Packaging
- [ ] **Phase 6**: Declarative GitOps Continuous Delivery (Argo CD)
- [ ] **Phase 7**: Infrastructure as Code (Terraform)
- [ ] **Phase 8**: Metrics & Observability (Prometheus + Grafana)
