# 📐 Project Architecture & Workflow Diagrams

This page contains simple, clean, and easy-to-understand diagrams for the **Three-Tier DevSecOps** project.

---

## ☁️ 1. AWS Architecture Diagram
Shows the high-level relationship between the user, the core AWS resources, and the supporting DevOps tools.

```mermaid
graph TD
    User([🖥️ End User]) -->|1. Request| Route53[Route 53 DNS]
    Route53 -->|2. Route Traffic| ALB[AWS Application Load Balancer]
    ALB -->|3. Forward Traffic| EKS[AWS EKS Cluster]

    subgraph AWS Cloud
        ALB
        EKS
        Jenkins[💻 Jenkins Server - EC2]
        ECR[(📦 AWS ECR - Image Registry)]
        S3[(🪣 AWS S3 - Terraform State)]
    end

    Jenkins -.->|Provision & Manage| EKS
    Jenkins -.->|Push Docker Images| ECR
    Jenkins -.->|Store State| S3
    EKS -.->|Pull Images| ECR
```

---

## 🔄 2. CI/CD DevSecOps Workflow Diagram
Illustrates the pipeline flow from a developer's code push to the final deployment on the EKS cluster.

```mermaid
graph LR
    Dev[💻 Developer] -->|1. Push Code| Git[🐙 GitHub Repo]
    Git -->|2. Trigger Build| Jenkins[🤖 Jenkins CI/CD]
    
    subgraph Jenkins Pipeline
        direction LR
        Jenkins --> Scan[🔍 Security Scans<br/>SonarQube & Trivy]
        Scan --> Build[🔨 Docker Build]
        Build --> Push[📤 ECR Push]
        Push --> Update[📝 Update Manifests]
    end

    Update -->|3. Commit Manifests| Git
    Git -->|4. Detect Change| Argo[🐙 ArgoCD GitOps]
    Argo -->|5. Sync & Deploy| EKS[☸️ AWS EKS Cluster]
```

---

## ☸️ 3. Kubernetes Architecture Diagram
Displays the application components deployed inside the EKS cluster and how traffic flows through the namespaces.

```mermaid
graph TD
    ALB[🌐 AWS ALB Ingress] -->|Path: /| FrontendSvc[⚙️ Frontend Service]
    ALB -->|Path: /api| BackendSvc[⚙️ Backend Service]

    subgraph three-tier Namespace
        FrontendSvc --> FrontendPod[📦 Frontend Pod - ReactJS]
        BackendSvc --> BackendPod[📦 Backend Pod - NodeJS]
        BackendPod -->|Connect| MongoSvc[⚙️ MongoDB Service]
        MongoSvc --> MongoPod[📦 MongoDB Pod]
        MongoPod --> PVC[💾 Volume Claim]
        PVC --> EBS[(💿 AWS EBS Volume)]
    end
```
