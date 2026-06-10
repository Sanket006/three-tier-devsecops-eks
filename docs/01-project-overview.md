# 01 — Project Overview

> **Navigation:** [← Docs Index](./index.md) | Next: [Local Development Setup →](./02-local-development.md)

---

## 🎯 What is This Project?

This project demonstrates an **end-to-end DevSecOps implementation** of a Three-Tier MERN stack web application, deployed on **AWS EKS (Elastic Kubernetes Service)**. It integrates industry-standard tools for CI/CD, security scanning, GitOps, and observability.

The application is a **TaskFlow** Kanban board — a task management tool with To-Do, In-Progress, and Done columns.

---

## 🏗️ Architecture Overview

The project is organized into three distinct tiers:

| Tier | Technology | Description |
|---|---|---|
| **Frontend** | ReactJS | Kanban-style task management UI |
| **Backend** | NodeJS + Express | REST API server for task operations |
| **Database** | MongoDB | NoSQL persistent data storage |

---

## 🛠️ Complete Tech Stack

### Application
- **ReactJS** — Frontend UI framework
- **NodeJS / Express** — Backend REST API
- **MongoDB / Mongoose** — Database and ODM layer
- **Axios** — HTTP client for API communication

### Infrastructure & Cloud
- **AWS EKS** — Managed Kubernetes cluster
- **AWS ECR** — Private Docker image registry
- **AWS ALB** — Application Load Balancer (via ingress)
- **Terraform** — Infrastructure as Code for AWS provisioning

### DevOps & CI/CD
- **Jenkins** — CI/CD automation server
- **Docker** — Container build and packaging
- **ArgoCD** — GitOps-based continuous delivery

### Security (DevSecOps)
- **SonarQube** — Static code analysis & quality gates
- **OWASP Dependency-Check** — Vulnerability scanning for dependencies
- **Trivy** — Container image and filesystem vulnerability scanner

### Monitoring & Observability
- **Prometheus** — Metrics collection and alerting
- **Grafana** — Metrics visualization dashboards
- **Helm** — Kubernetes package manager for deploying monitoring stack

---

## 📁 Repository Structure

```
.
├── Application-Code/
│   ├── frontend/           # ReactJS frontend application
│   ├── backend/            # NodeJS backend API
│   └── docker-compose.yml  # Local development orchestration
│
├── Infrastructure-Provisioning/
│   ├── EKS-Cluster-TF/     # Terraform: AWS EKS cluster
│   └── Jenkins-Server-TF/  # Terraform: Jenkins EC2 server
│
├── Jenkins-Pipeline-Code/
│   ├── Jenkinsfile-Frontend # CI/CD pipeline for the frontend
│   ├── Jenkinsfile-Backend  # CI/CD pipeline for the backend
│   └── Jenkinsfile-EKS      # Pipeline to provision/destroy EKS
│
├── Kubernetes-Manifests-file/
│   ├── Frontend/           # K8s Deployment + Service for frontend
│   ├── Backend/            # K8s Deployment + Service for backend
│   ├── Database/           # K8s StatefulSet for MongoDB
│   └── ingress.yaml        # ALB Ingress controller configuration
│
├── docs/                   # 📚 This documentation folder
└── assets/                 # Project images and media
```

---

## 🔄 End-to-End Flow

```
Developer Push → GitHub
       ↓
Jenkins CI Pipeline
  ├── SonarQube Analysis
  ├── OWASP Dependency Scan
  ├── Trivy File Scan
  ├── Docker Build
  ├── ECR Image Push
  ├── Trivy Image Scan
  └── Update K8s Manifest (image tag)
       ↓
ArgoCD (GitOps)
  └── Detects manifest change → Deploys to EKS
       ↓
AWS EKS Cluster
  ├── Frontend Pods
  ├── Backend Pods
  └── MongoDB StatefulSet
       ↓
AWS ALB Ingress → End User
```

---

## 📋 Prerequisites

Before getting started, ensure you have the following:

- **AWS Account** with IAM permissions for EKS, ECR, EC2, and VPC
- **AWS CLI** installed and configured
- **Terraform** v1.0+ installed
- **kubectl** installed
- **Docker** installed and running
- **Git** installed

---

## 📖 Next Steps

- **Run locally?** → [Local Development Setup](./02-local-development.md)
- **Deploy to AWS?** → [Infrastructure Provisioning](./03-infrastructure-provisioning.md)
