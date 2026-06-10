# 📚 Documentation Index

Welcome to the **Three-Tier DevSecOps Project** documentation. This folder contains step-by-step guides to help you understand, set up, and deploy the entire application — from local development to a production-grade AWS EKS deployment.

---

## 🗂️ Table of Contents

| Document | Description |
|---|---|
| [01 — Project Overview](./01-project-overview.md) | High-level architecture, tech stack, and goals |
| [02 — Local Development Setup](./02-local-development.md) | Run the app locally with Docker Compose or native Node |
| [03 — Infrastructure Provisioning](./03-infrastructure-provisioning.md) | Provision Jenkins Server & EKS Cluster with Terraform |
| [04 — CI/CD Pipeline Setup](./04-cicd-pipeline.md) | Configure Jenkins pipelines for frontend, backend & EKS |
| [05 — Kubernetes Deployment](./05-kubernetes-deployment.md) | Deploy the app to AWS EKS using Kubernetes manifests |
| [06 — GitOps with ArgoCD](./06-argocd-gitops.md) | Set up ArgoCD for continuous delivery via GitOps |
| [07 — Monitoring & Observability](./07-monitoring.md) | Set up Prometheus and Grafana for monitoring |
| [08 — Security Scanning](./08-security-scanning.md) | SonarQube, OWASP, and Trivy security integration |

---

## 🚀 Getting Started

If you're new to the project, start here:

1. Read the **[Project Overview](./01-project-overview.md)** to understand the architecture.
2. Follow the **[Local Development Setup](./02-local-development.md)** to run the app on your machine.
3. Proceed to **[Infrastructure Provisioning](./03-infrastructure-provisioning.md)** to set up AWS resources.
4. Configure **[CI/CD Pipelines](./04-cicd-pipeline.md)** with Jenkins.
5. Deploy to **[Kubernetes on EKS](./05-kubernetes-deployment.md)**.
6. Set up **[ArgoCD GitOps](./06-argocd-gitops.md)** for automated delivery.
7. Enable **[Monitoring](./07-monitoring.md)** with Prometheus & Grafana.

---

> 💡 **Tip:** Each document links to related guides so you can navigate naturally through the implementation journey.
