# 08 — Security Scanning (DevSecOps)

> **Navigation:** [← Monitoring & Observability](./07-monitoring.md) | [Docs Index](./index.md) | [← Back to Start](./01-project-overview.md)

---

## 🔐 Overview

This project follows a **DevSecOps** approach by embedding security scanning at multiple stages of the CI/CD pipeline. Security is not an afterthought — it is built into every step of the delivery process.

### Security Tools Used

| Tool | Stage | Purpose |
|---|---|---|
| **SonarQube** | Code Analysis | Static code quality & vulnerability detection |
| **OWASP Dependency-Check** | Build | Scans npm packages for known CVEs |
| **Trivy (File Scan)** | Build | Scans source files and filesystem |
| **Trivy (Image Scan)** | Post-Build | Scans the final Docker image for vulnerabilities |

---

## 🛡️ Security Pipeline Flow

```
Source Code
    │
    ▼
SonarQube Static Analysis
    │  (Quality Gate: must pass before proceeding)
    ▼
OWASP Dependency-Check
    │  (Scans package.json dependencies for CVEs)
    ▼
Trivy Filesystem Scan
    │  (Scans source files and configs)
    ▼
Docker Image Build
    │
    ▼
Push to AWS ECR
    │
    ▼
Trivy Image Scan
    │  (Scans the final container image)
    ▼
Update Kubernetes Manifest → ArgoCD Deploy
```

---

## Tool 1 — SonarQube (Static Code Analysis)

SonarQube scans the source code for:
- **Bugs** — Code defects that may cause failures
- **Vulnerabilities** — Security weaknesses (e.g., injection flaws, insecure configs)
- **Code Smells** — Maintainability issues
- **Duplications** — Repeated code blocks

### Setup SonarQube on Jenkins Server

SonarQube is typically run as a Docker container on the Jenkins server:

```bash
docker run -d \
  --name sonarqube \
  -p 9000:9000 \
  sonarqube:lts-community
```

Access the UI at `http://<JENKINS_SERVER_IP>:9000`  
Default credentials: `admin` / `admin`

### Configure Jenkins Integration

1. In SonarQube, go to **Administration → Security → Users → Tokens**
2. Generate a token and save it
3. In Jenkins, go to **Manage Jenkins → Configure System → SonarQube Servers**
4. Add server URL and the token credential

### Pipeline Configuration

The frontend and backend pipelines both include:

```groovy
stage('Sonarqube Analysis') {
    steps {
        dir('Application-Code/frontend') {
            withSonarQubeEnv('sonar-server') {
                sh '''$SCANNER_HOME/bin/sonar-scanner \
                    -Dsonar.projectName=three-tier-frontend \
                    -Dsonar.projectKey=three-tier-frontend'''
            }
        }
    }
}

stage('Quality Check') {
    steps {
        script {
            waitForQualityGate abortPipeline: false, credentialsId: 'sonar-token'
        }
    }
}
```

> 💡 The `Quality Check` stage waits for SonarQube's quality gate result. Set `abortPipeline: true` to fail the build on quality gate failure.

---

## Tool 2 — OWASP Dependency-Check

OWASP Dependency-Check scans your `node_modules` and `package.json` for dependencies with known **CVEs (Common Vulnerabilities and Exposures)**.

### Pipeline Configuration

```groovy
stage('OWASP Dependency-Check Scan') {
    steps {
        dir('Application-Code/frontend') {
            dependencyCheck additionalArguments: '--scan ./ --disableYarnAudit --disableNodeAudit',
                            odcInstallation: 'DP-Check'
            dependencyCheckPublisher pattern: '**/dependency-check-report.xml'
        }
    }
}
```

### View the Report

After each build, the OWASP Dependency-Check report is published in Jenkins:
- Go to the build → **Dependency-Check Report**
- View all identified CVEs, severity levels, and affected packages

### Install the Tool in Jenkins

1. Go to **Manage Jenkins → Tools → OWASP Dependency-Check installations**
2. Add new installation named `DP-Check`
3. Select **Install automatically** from the official releases

---

## Tool 3 — Trivy (Filesystem Scan)

**Trivy** is a comprehensive security scanner. The filesystem scan checks:
- Source code files
- Configuration files (Dockerfile, package.json)
- Secrets accidentally committed (API keys, passwords)

### Pipeline Configuration

```groovy
stage('Trivy File Scan') {
    steps {
        dir('Application-Code/frontend') {
            sh 'trivy fs . > trivyfs.txt'
        }
    }
}
```

The scan results are saved to `trivyfs.txt` and archived as a build artifact.

### Install Trivy on Jenkins Server

```bash
# On the Jenkins EC2 server (Amazon Linux)
sudo rpm -ivh https://github.com/aquasecurity/trivy/releases/download/v0.50.1/trivy_0.50.1_Linux-64bit.rpm

# Verify installation
trivy --version
```

---

## Tool 4 — Trivy (Container Image Scan)

After the Docker image is pushed to ECR, Trivy scans the **final container image** for OS-level and application-level vulnerabilities.

### Pipeline Configuration

```groovy
stage('TRIVY Image Scan') {
    steps {
        sh 'trivy image ${REPOSITORY_URI}${AWS_ECR_REPO_NAME}:${BUILD_NUMBER} > trivyimage.txt'
    }
}
```

Results are saved to `trivyimage.txt`.

### Run Trivy Locally

You can also run Trivy locally to scan the image before pushing:

```bash
# Scan a local Docker image
trivy image frontend-test:latest

# Scan with severity filter
trivy image --severity HIGH,CRITICAL frontend-test:latest

# Export as JSON
trivy image --format json --output results.json frontend-test:latest
```

---

## 📋 Security Scan Artifacts

Each Jenkins pipeline build produces the following security artifacts:

| File | Tool | Content |
|---|---|---|
| `trivyfs.txt` | Trivy | Filesystem vulnerability report |
| `trivyimage.txt` | Trivy | Docker image vulnerability report |
| `dependency-check-report.xml` | OWASP | Dependency CVE report |
| SonarQube Dashboard | SonarQube | Code quality and security metrics |

Access them via **Jenkins → Build → Artifacts**.

---

## 🔒 Security Best Practices Applied

- ✅ **Secrets managed via Kubernetes Secrets** (MongoDB credentials not hardcoded)
- ✅ **ECR private repositories** (images not publicly accessible)
- ✅ **Health probes implemented** (liveness, readiness, startup)
- ✅ **Rolling update strategy** (zero-downtime deployments)
- ✅ **Namespace isolation** (`three-tier` namespace separates app from system)
- ✅ **Trivy scanning at build time** (catch vulnerabilities before deployment)
- ✅ **SonarQube quality gates** (prevent insecure code from merging)

---

## 📖 Related Documentation

- [CI/CD Pipeline Setup](./04-cicd-pipeline.md) — How security stages are integrated into pipelines
- [Kubernetes Deployment](./05-kubernetes-deployment.md) — Secrets management in Kubernetes
- [Project Overview](./01-project-overview.md) — Full tech stack overview
- [Docs Index](./index.md) — Return to documentation home
