# 04 — CI/CD Pipeline Setup

> **Navigation:** [← Infrastructure Provisioning](./03-infrastructure-provisioning.md) | [Docs Index](./index.md) | Next: [Kubernetes Deployment →](./05-kubernetes-deployment.md)

---

## 🔄 Overview

This project uses **Jenkins** to automate building, testing, scanning, and deploying the application. There are three pipeline definitions:

| Pipeline File | Purpose |
|---|---|
| `Jenkinsfile-Frontend` | Builds and delivers the ReactJS frontend |
| `Jenkinsfile-Backend` | Builds and delivers the NodeJS backend |
| `Jenkinsfile-EKS` | Provisions or destroys the AWS EKS cluster |

All pipelines follow a **secure, automated flow**:

```
Code Push → Checkout → SonarQube Analysis → OWASP Scan
→ Trivy File Scan → Docker Build → ECR Push → Trivy Image Scan
→ Update Kubernetes Manifest (triggers ArgoCD deployment)
```

---

## ✅ Prerequisites

- Jenkins server running (see [Infrastructure Provisioning](./03-infrastructure-provisioning.md))
- Jenkins plugins installed:
  - Git Plugin
  - Pipeline Plugin
  - Docker Pipeline Plugin
  - SonarQube Scanner Plugin
  - OWASP Dependency-Check Plugin
  - AWS Pipeline Plugin (`pipeline-aws`)
  - NodeJS Plugin
- Tools configured in **Jenkins → Manage Jenkins → Tools**:
  - JDK: `jdk`
  - NodeJS: `nodejs`
  - SonarQube Scanner: `sonar-scanner`
  - OWASP Dependency-Check: `DP-Check`
- SonarQube server running and accessible from Jenkins

---

## 🔐 Jenkins Credentials Setup

Go to **Jenkins → Manage Jenkins → Credentials** and add the following:

| Credential ID | Type | Value |
|---|---|---|
| `GITHUB` | Username with Password | GitHub username + Personal Access Token |
| `github` | Secret Text | GitHub Personal Access Token (for git push) |
| `GIT_USER_EMAIL` | Secret Text | Your GitHub email address (used for git commit author) |
| `ACCOUNT_ID` | Secret Text | Your AWS Account ID |
| `ECR_REPO1` | Secret Text | ECR repository name for frontend |
| `ECR_REPO2` | Secret Text | ECR repository name for backend |
| `aws-creds` | AWS Credentials | AWS Access Key + Secret Key |
| `sonar-token` | Secret Text | SonarQube authentication token |

> ⚠️ The `GIT_USER_EMAIL` credential is injected at runtime via `withCredentials` in both Jenkinsfiles.
> Do **not** hardcode your email in the pipeline files.

---

## 🏗️ Create ECR Repositories

Before running the pipelines, create two private ECR repositories:

```bash
# Frontend repository
aws ecr create-repository --repository-name frontend --region us-east-1

# Backend repository
aws ecr create-repository --repository-name backend --region us-east-1
```

---

## Pipeline 1 — Frontend CI/CD (`Jenkinsfile-Frontend`)

### Pipeline Stages

| Stage | Description |
|---|---|
| **Cleaning Workspace** | Clears old build artifacts |
| **Checkout from Git** | Clones `https://github.com/Sanket006/three-tier-devsecops-eks.git` |
| **SonarQube Analysis** | Runs static analysis on `Application-Code/frontend` (project key: `three-tier-frontend`) |
| **Quality Check** | Waits for SonarQube quality gate result using `sonar-token` |
| **OWASP Dependency-Check Scan** | Scans npm dependencies for CVEs using `DP-Check` |
| **Trivy File Scan** | Scans `Application-Code/frontend` filesystem → saves `trivyfs.txt` |
| **Docker Image Build** | Prunes Docker system, then builds image tagged as `ECR_REPO1` |
| **ECR Image Pushing** | Logs into ECR, tags image with `BUILD_NUMBER`, pushes to `REPOSITORY_URI` |
| **TRIVY Image Scan** | Scans the pushed ECR image for CVEs → saves `trivyimage.txt` |
| **Checkout Code** | Re-clones the repo to access Kubernetes manifests |
| **Update Deployment File** | Updates `image:tag` in `Kubernetes-Manifests-file/Frontend/deployment.yaml` and pushes to `HEAD:master` |

### Create the Pipeline in Jenkins

1. Click **New Item** → Enter name: `Frontend-Pipeline` → Select **Pipeline**
2. Under **Pipeline**, set **Definition** to `Pipeline script from SCM`
3. Set **SCM** to `Git` and enter: `https://github.com/Sanket006/three-tier-devsecops-eks.git`
4. Set **Credentials** to `GITHUB`
5. Set **Script Path** to `Jenkins-Pipeline-Code/Jenkinsfile-Frontend`
6. Click **Save** and then **Build Now**

---

## Pipeline 2 — Backend CI/CD (`Jenkinsfile-Backend`)

The backend pipeline mirrors the frontend with the same stages, but operates on `Application-Code/backend`, uses SonarQube project key `three-tier-backend`, and uses `ECR_REPO2` for the backend image. The manifest update targets `Kubernetes-Manifests-file/Backend/deployment.yaml`.

### Create the Pipeline in Jenkins

1. Click **New Item** → Enter name: `Backend-Pipeline` → Select **Pipeline**
2. Under **Pipeline**, set **Definition** to `Pipeline script from SCM`
3. Set **SCM** to `Git` and enter: `https://github.com/Sanket006/three-tier-devsecops-eks.git`
4. Set **Credentials** to `GITHUB`
5. Set **Script Path** to `Jenkins-Pipeline-Code/Jenkinsfile-Backend`
6. Click **Save** and then **Build Now**

---

## Pipeline 3 — EKS Infrastructure (`Jenkinsfile-EKS`) {#eks-infrastructure-pipeline}

This pipeline lets you **provision, plan, or destroy** the AWS EKS cluster via a parameterized Jenkins job.

### Parameters

| Parameter | Options | Description |
|---|---|---|
| `Environment` | `dev` (default) | The Terraform `.tfvars` environment file to use |
| `Terraform_Action` | `plan`, `apply`, `destroy` | The Terraform action to execute |

### Pipeline Stages

| Stage | Description |
|---|---|
| **Preparing** | Initialization step |
| **Git Pulling** | Checks out the current repository |
| **Init** | Runs `terraform init` in `EKS-Cluster-TF/` |
| **Validate** | Runs `terraform validate` |
| **Action** | Runs the selected Terraform action (`plan`/`apply`/`destroy`) |

### Create the Pipeline in Jenkins

1. Click **New Item** → Enter name: `EKS-Pipeline` → Select **Pipeline**
2. Under **Pipeline**, set **Definition** to `Pipeline script from SCM`
3. Set **Script Path** to `Jenkins-Pipeline-Code/Jenkinsfile-EKS`
4. Click **Save**

### Run the Pipeline

1. Click **Build with Parameters**
2. Set `Environment` = `dev`
3. Set `Terraform_Action` = `apply`
4. Click **Build**

> ⚠️ Use `destroy` action only when you want to tear down the entire EKS cluster.

---

## 🔁 End-to-End Automation Flow

Once both pipelines are set up, every code push triggers:

1. Jenkins builds and scans the code
2. Docker image is pushed to ECR with a new build number tag
3. Jenkins updates the Kubernetes `deployment.yaml` with the new image tag
4. ArgoCD detects the manifest change and deploys the new version to EKS

See → [GitOps with ArgoCD](./06-argocd-gitops.md)

---

## 📖 Next Steps

- Deploy to Kubernetes → [Kubernetes Deployment](./05-kubernetes-deployment.md)
- Set up GitOps → [ArgoCD GitOps](./06-argocd-gitops.md)
- View security details → [Security Scanning](./08-security-scanning.md)
