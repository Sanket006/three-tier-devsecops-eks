# 🚀 End-to-End Three-Tier DevSecOps on AWS EKS

[![LinkedIn](https://img.shields.io/badge/Connect%20with%20me%20on-LinkedIn-blue.svg)](https://www.linkedin.com/in/aman-devops/)
[![Discord](https://img.shields.io/badge/Discord-7289DA?style=for-the-badge&logo=discord&logoColor=white)](https://discord.com/invite/jdzF8kTtw2)
[![Medium](https://img.shields.io/badge/Medium-12100E?style=for-the-badge&logo=medium&logoColor=white)](https://medium.com/@amanpathakdevops)
[![GitHub Stars](https://img.shields.io/github/stars/Sanket006/three-tier-devsecops-eks.svg?style=social)](https://github.com/Sanket006/three-tier-devsecops-eks)
[![AWS](https://img.shields.io/badge/AWS-Powered-orange?logo=amazon-aws)](https://aws.amazon.com)
[![Terraform](https://img.shields.io/badge/IaC-Terraform-blueviolet?logo=terraform)](https://www.terraform.io)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](./LICENSE)

![Three-Tier Banner](assets/Three-Tier.gif)

> A production-grade, cloud-native deployment of a MERN stack application on **AWS EKS** with full **CI/CD automation**, **DevSecOps security scanning**, **GitOps delivery**, and **real-time monitoring** — built for engineers who want the complete picture.

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Problem Statement](#-problem-statement)
- [Architecture Summary](#-architecture-summary)
- [Tool Stack](#-tool-stack)
- [Repository Structure](#-repository-structure)
- [Implementation Steps](#-implementation-steps)
- [End-to-End Workflow](#-end-to-end-workflow)
- [What I Learned](#-what-i-learned)
- [Conclusion](#-conclusion)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## 📌 Project Overview

This project is a **complete DevSecOps implementation** of a Three-Tier web application — **TaskFlow**, a Kanban-style task manager. The application is built with **ReactJS**, **NodeJS**, and **MongoDB**, and deployed on **AWS EKS (Elastic Kubernetes Service)**.

The goal is to demonstrate how modern engineering teams build, secure, and operate cloud-native applications in production — covering everything from writing code to deploying and monitoring it at scale.

**What makes this project special:**

- 🏗️ **Infrastructure as Code** — Every AWS resource is provisioned with Terraform. No manual clicking.
- 🔒 **Security at Every Step** — Code, dependencies, and container images are all scanned before deployment.
- 🤖 **Fully Automated CI/CD** — A single `git push` triggers the entire pipeline from build to deploy.
- 🔁 **GitOps Delivery** — ArgoCD continuously reconciles the cluster state with the Git repository.
- 📊 **Real-Time Observability** — Prometheus and Grafana provide live metrics and alerting.

---

## 🧩 Problem Statement

Modern software delivery involves multiple layers of complexity:

- How do you **provision cloud infrastructure reliably** without manual errors?
- How do you **ship code changes quickly** without breaking production?
- How do you **catch security vulnerabilities** before they reach end users?
- How do you **deploy to Kubernetes** without downtime or manual intervention?
- How do you **know when something goes wrong** in production — before your users do?

This project answers all of these questions by stitching together industry-standard open-source tools into a cohesive, working system.

---

## 🏗️ Architecture Summary

The project is organized into three application tiers and a supporting DevOps layer:

```
┌─────────────────────────────────────────────────────────┐
│                    End User (Browser)                    │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP via AWS ALB
┌───────────────────────▼─────────────────────────────────┐
│               AWS EKS — three-tier Namespace             │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────┐  │
│  │  Frontend Pod  │  │  Backend Pod   │  │  MongoDB  │  │
│  │  (ReactJS)     │  │  (NodeJS API)  │  │ StatefulSet│  │
│  │  Port: 3000    │  │  Port: 3500    │  │ Port:27017│  │
│  └────────────────┘  └────────────────┘  └───────────┘  │
└─────────────────────────────────────────────────────────┘
                        ▲
           ┌────────────┴────────────┐
           │     Jenkins CI/CD       │
           │  ┌──────────────────┐   │
           │  │ SonarQube Scan   │   │
           │  │ OWASP Dep-Check  │   │
           │  │ Trivy FS Scan    │   │
           │  │ Docker Build     │   │
           │  │ ECR Push         │   │
           │  │ Trivy Image Scan │   │
           │  │ Update K8s YAML  │   │
           │  └──────────────────┘   │
           └────────────┬────────────┘
                        │
           ┌────────────▼────────────┐
           │    ArgoCD (GitOps)      │
           │  Watches Git → Deploys  │
           └─────────────────────────┘
```

### Application Ports

| Service | Internal Port | External Access |
|---|---|---|
| Frontend (ReactJS) | `3000` | Via ALB Ingress `/` |
| Backend (NodeJS API) | `3500` | Via ALB Ingress `/api` |
| MongoDB | `27017` | Internal only |

---

## 🛠️ Tool Stack

### Application Layer

| Category | Technology |
|---|---|
| Frontend | ReactJS 18, Axios |
| Backend | NodeJS, Express.js, Mongoose |
| Database | MongoDB |
| Containerization | Docker |

### Infrastructure & Cloud

| Category | Technology |
|---|---|
| Cloud Provider | AWS (EKS, ECR, ALB, EC2, VPC, S3) |
| Infrastructure as Code | Terraform |
| Container Orchestration | Kubernetes (AWS EKS) |
| Image Registry | AWS ECR (Private) |
| Load Balancer | AWS ALB + AWS Load Balancer Controller |

### CI/CD & GitOps

| Category | Technology |
|---|---|
| CI/CD Server | Jenkins |
| GitOps | ArgoCD |
| Source Control | Git / GitHub |

### Security (DevSecOps)

| Tool | Purpose |
|---|---|
| SonarQube | Static code analysis & quality gates |
| OWASP Dependency-Check | npm dependency CVE scanning |
| Trivy | Filesystem & Docker image vulnerability scanning |

### Monitoring & Observability

| Tool | Purpose |
|---|---|
| Prometheus | Metrics collection & alerting |
| Grafana | Dashboard visualization |
| Helm | Kubernetes package management |

---

## 📁 Repository Structure

```
.
├── Application-Code/
│   ├── frontend/               # ReactJS Kanban UI
│   │   ├── src/                # React components and services
│   │   ├── Dockerfile          # Frontend container definition
│   │   └── package.json        # NPM dependencies
│   ├── backend/                # NodeJS REST API
│   │   ├── routes/             # API route handlers
│   │   ├── models/             # Mongoose data models
│   │   ├── db.js               # MongoDB connection
│   │   ├── index.js            # Express server entry point
│   │   └── Dockerfile          # Backend container definition
│   └── docker-compose.yml      # Local development orchestration
│
├── Infrastructure-Provisioning/
│   ├── EKS-Cluster-TF/         # Terraform: AWS EKS cluster + VPC
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── dev.tfvars
│   │   └── module/             # Reusable Terraform modules
│   └── Jenkins-Server-TF/      # Terraform: Jenkins EC2 server
│       ├── ec2.tf
│       ├── vpc.tf
│       └── tools-install.sh    # Auto-installs Jenkins, Docker, Trivy, etc.
│
├── Jenkins-Pipeline-Code/
│   ├── Jenkinsfile-Frontend    # CI/CD for ReactJS frontend
│   ├── Jenkinsfile-Backend     # CI/CD for NodeJS backend
│   └── Jenkinsfile-EKS         # Terraform pipeline for EKS cluster
│
├── Kubernetes-Manifests-file/
│   ├── Frontend/               # Deployment + Service
│   ├── Backend/                # Deployment + Service (with health probes)
│   ├── Database/               # MongoDB StatefulSet + Service
│   └── ingress.yaml            # AWS ALB Ingress configuration
│
├── docs/                       # 📚 Step-by-step implementation guides
├── assets/                     # Project images
└── README.md                   # You are here
```

---

## ⚙️ Implementation Steps

> 💡 Each step links to a detailed guide in the `docs/` folder.

### Step 1 — Run Locally (Optional)

Quickly verify the app works before deploying to the cloud.

```bash
cd Application-Code
docker compose up --build -d
```

Open **http://localhost:3000** — the TaskFlow Kanban board should be running.

📖 Full guide → [Local Development Setup](./docs/02-local-development.md)

---

### Step 2 — Provision the Jenkins Server

Use Terraform to spin up a pre-configured EC2 instance with Jenkins, Docker, Trivy, and all required tools installed automatically.

```bash
cd Infrastructure-Provisioning/Jenkins-Server-TF
terraform init
terraform apply -var-file=variables.tfvars -auto-approve
```

Access Jenkins at `http://<EC2_PUBLIC_IP>:8080`

📖 Full guide → [Infrastructure Provisioning](./docs/03-infrastructure-provisioning.md)

---

### Step 3 — Provision the AWS EKS Cluster

Use Terraform (or the Jenkins EKS pipeline) to create a production-ready Kubernetes cluster on AWS.

```bash
cd Infrastructure-Provisioning/EKS-Cluster-TF
terraform init
terraform apply -var-file=dev.tfvars -auto-approve
```

Update your kubeconfig:

```bash
aws eks update-kubeconfig --region us-east-1 --name Three-Tier-Cluster
kubectl get nodes
```

📖 Full guide → [Infrastructure Provisioning](./docs/03-infrastructure-provisioning.md)

---

### Step 4 — Configure Jenkins CI/CD Pipelines

Set up three Jenkins pipelines using the Jenkinsfiles in this repository:

| Pipeline | Jenkinsfile | What it does |
|---|---|---|
| Frontend | `Jenkinsfile-Frontend` | Scan → Build → Push → Deploy |
| Backend | `Jenkinsfile-Backend` | Scan → Build → Push → Deploy |
| EKS Infra | `Jenkinsfile-EKS` | Provision / Destroy the EKS cluster |

📖 Full guide → [CI/CD Pipeline Setup](./docs/04-cicd-pipeline.md)

---

### Step 5 — Deploy to Kubernetes

Apply the manifests to create all workloads in the `three-tier` namespace:

```bash
kubectl create namespace three-tier
kubectl apply -f Kubernetes-Manifests-file/Database/ -n three-tier
kubectl apply -f Kubernetes-Manifests-file/Backend/ -n three-tier
kubectl apply -f Kubernetes-Manifests-file/Frontend/ -n three-tier
kubectl apply -f Kubernetes-Manifests-file/ingress.yaml -n three-tier
```

📖 Full guide → [Kubernetes Deployment](./docs/05-kubernetes-deployment.md)

---

### Step 6 — Set Up ArgoCD (GitOps)

Install ArgoCD on the cluster and create apps that watch the `Kubernetes-Manifests-file/` directory. Every Jenkins build that updates a manifest tag will automatically be deployed to EKS.

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

📖 Full guide → [GitOps with ArgoCD](./docs/06-argocd-gitops.md)

---

### Step 7 — Set Up Monitoring

Deploy Prometheus and Grafana using Helm to get full cluster and application observability.

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack --namespace monitoring --create-namespace
```

📖 Full guide → [Monitoring & Observability](./docs/07-monitoring.md)

---

## 🔄 End-to-End Workflow

This is how a complete delivery cycle works — from a developer pushing code to the end user seeing the change:

```
1. Developer pushes code to GitHub
       │
       ▼
2. Jenkins pipeline triggers automatically
       ├── Cleans workspace
       ├── Checks out the latest code
       ├── Runs SonarQube static code analysis
       ├── Waits for quality gate result
       ├── Runs OWASP Dependency-Check scan
       ├── Runs Trivy filesystem scan
       ├── Builds Docker image
       ├── Pushes image to AWS ECR (tagged with build number)
       ├── Runs Trivy image scan
       └── Updates image tag in Kubernetes deployment.yaml → pushes to GitHub
       │
       ▼
3. ArgoCD detects the manifest change in GitHub
       └── Automatically applies the updated deployment.yaml to EKS
       │
       ▼
4. Kubernetes performs a rolling update
       ├── New pods start with the new image
       ├── Health probes (liveness, readiness, startup) verify the pod is healthy
       └── Old pods are terminated only after new ones are ready
       │
       ▼
5. End user accesses the application via AWS ALB
       └── Zero downtime ✅
```

---

## 🧠 What I Learned

Working through this project provided hands-on experience with the following:

**Cloud & Infrastructure**
- Designing VPCs, subnets, and IAM roles with Terraform for EKS
- Understanding EKS node groups, managed node groups, and networking
- Working with AWS ALB Ingress Controller and path-based routing

**Kubernetes**
- Writing production-grade Kubernetes manifests with health probes
- Using Kubernetes Secrets for sensitive data (MongoDB credentials)
- Rolling updates, rollback strategies, and pod disruption budgets
- Namespace-based workload isolation

**CI/CD & Automation**
- Building multi-stage Jenkins pipelines with parallel security scanning
- Integrating SonarQube quality gates as pipeline blockers
- Automating ECR image push and Kubernetes manifest updates from Jenkins

**GitOps**
- Understanding the pull-based deployment model vs. traditional push
- Setting up ArgoCD applications and auto-sync policies
- Using Git as the single source of truth for cluster state

**Security (DevSecOps)**
- Embedding security scanning into the delivery pipeline (shift-left security)
- Using Trivy to catch CVEs before images reach production
- Managing secrets with Kubernetes Secrets instead of environment variables

**Observability**
- Deploying the `kube-prometheus-stack` with Helm
- Writing PromQL queries for custom metrics
- Building Grafana dashboards for real-time visibility

---

## 🎯 Conclusion

This project demonstrates that building a secure, automated, and observable production system is achievable with the right tools and architecture. The combination of **Terraform + Jenkins + Docker + Kubernetes + ArgoCD + Prometheus** creates a delivery pipeline that is:

- ⚡ **Fast** — From code to production in minutes
- 🔒 **Secure** — Every artifact is scanned before it ships
- 📈 **Observable** — Issues are caught with metrics and alerts, not user complaints
- 🔁 **Reliable** — GitOps ensures the cluster always matches the desired state
- ♻️ **Repeatable** — Infrastructure is code — tear down and rebuild with a single command

Whether you're a developer looking to understand DevOps, or a DevOps engineer building a reference architecture, this project is a comprehensive starting point.

---

## 📚 Documentation

Detailed step-by-step guides are available in the [`docs/`](./docs/) folder:

| Guide | Link |
|---|---|
| Project Overview | [docs/01-project-overview.md](./docs/01-project-overview.md) |
| Local Development Setup | [docs/02-local-development.md](./docs/02-local-development.md) |
| Infrastructure Provisioning | [docs/03-infrastructure-provisioning.md](./docs/03-infrastructure-provisioning.md) |
| CI/CD Pipeline Setup | [docs/04-cicd-pipeline.md](./docs/04-cicd-pipeline.md) |
| Kubernetes Deployment | [docs/05-kubernetes-deployment.md](./docs/05-kubernetes-deployment.md) |
| GitOps with ArgoCD | [docs/06-argocd-gitops.md](./docs/06-argocd-gitops.md) |
| Monitoring & Observability | [docs/07-monitoring.md](./docs/07-monitoring.md) |
| Security Scanning | [docs/08-security-scanning.md](./docs/08-security-scanning.md) |

---

## 🤝 Contributing

Contributions are welcome! If you spot an issue, have a suggestion, or want to add a feature:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "Add: description of change"`
4. Push to your branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please make sure your changes are well-documented and tested locally before submitting.

---

## 📄 License

This project is licensed under the **[Apache License, Version 2.0](./LICENSE)**.

```
Copyright 2024 Aman Pathak (Original Author)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

### Attribution Notice (Apache 2.0 — Section 4)

This repository is a **derivative work** based on the original project by **[Aman Pathak](https://github.com/AmanPathak-DevOps)**.
As required by the Apache 2.0 License:

- ✅ The original copyright notice and attribution have been **retained**.
- ✅ This notice states that **files have been modified** from the original.
- ✅ A full copy of the [Apache 2.0 License](./LICENSE) is included in this repository.
- ✅ All original author credits remain intact throughout the documentation.

> **Original Project:** [End-to-End-Kubernetes-Three-Tier-DevSecOps-Project](https://github.com/AmanPathak-DevOps/End-to-End-Kubernetes-Three-Tier-DevSecOps-Project) by [Aman Pathak](https://www.linkedin.com/in/aman-devops/)
> **This Repository:** [three-tier-devsecops-eks](https://github.com/Sanket006/three-tier-devsecops-eks)

---

<div align="center">

**Adapted and extended by Sanket Chopade**

Based on the original work by **[Aman Pathak](https://www.linkedin.com/in/aman-devops/)** — licensed under [Apache 2.0](./LICENSE)

⭐ If this project helped you, please consider giving it a star on GitHub!

</div>
