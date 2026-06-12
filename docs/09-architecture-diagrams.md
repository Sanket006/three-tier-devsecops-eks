# 📐 Project Architecture & Workflow Diagrams

This page contains simple, clean, and easy-to-understand diagrams along with workflow explanations for the **Three-Tier DevSecOps** project.

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

### 📋 AWS Workflow Explanation:
1. **User Request**: The end user accesses the application. Route 53 DNS resolves the domain (`devopswithsanket.space`) and routes the traffic to the **AWS Application Load Balancer (ALB)**.
2. **Traffic Routing**: The ALB forwards the incoming user request to the **AWS EKS Cluster**.
3. **Deployment Orchestration**: The EKS worker nodes run the application workloads, pulling the necessary container images from the private **AWS ECR** registry.
4. **Infrastructure Management**: Jenkins runs on an EC2 instance, managing the cluster's lifecycle using **Terraform** (with configuration state saved in **S3**) and pushing built container images to ECR.

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

### 📋 CI/CD Workflow Explanation:
1. **Developer Push**: A developer pushes code changes to the application repository on **GitHub**.
2. **Build Trigger**: GitHub sends a Webhook notification to **Jenkins** to start the CI/CD pipeline run.
3. **Security Scanning**: Jenkins runs code quality checkups via **SonarQube** and vulnerability assessments on the project filesystem using **Trivy**.
4. **Build & Push**: If scans pass, Jenkins builds the Docker images and pushes them to the **AWS ECR** private registry.
5. **GitOps Sync**: Jenkins updates the Kubernetes deployment manifests with the new image tags and pushes them back to GitHub. **ArgoCD** detects this change, pulls the new image from ECR, and triggers a rolling update on **AWS EKS** with zero downtime.

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

### 📋 Kubernetes Namespace Workflow Explanation:
1. **Traffic Admission**: The **AWS ALB Ingress Controller** acts as the ingress traffic router, routing `/api` traffic to the Backend NodeJS application and `/` traffic to the Frontend ReactJS application.
2. **Frontend Tier**: The **Frontend Service** handles internal load-balancing for frontend traffic and routes requests to the ReactJS **Frontend Pods**.
3. **Backend Tier**: The **Backend Service** routes API requests to the NodeJS **Backend Pods**.
4. **Database Access**: The Backend Pods query the database through the **MongoDB Service**, which exposes the **MongoDB Pod**.
5. **Storage Persistence**: MongoDB mounts a **Persistent Volume Claim (PVC)**, which utilizes the AWS EBS CSI driver to persist state on a secure, external **AWS EBS Volume**.
