# 03 — Infrastructure Provisioning

> **Navigation:** [← Local Development](./02-local-development.md) | [Docs Index](./index.md) | Next: [CI/CD Pipeline Setup →](./04-cicd-pipeline.md)

---

## 🏗️ Overview

This guide covers provisioning the cloud infrastructure required for production deployment using **Terraform**. Two components need to be set up:

| Component | Directory | Purpose |
|---|---|---|
| **Jenkins Server** | `Infrastructure-Provisioning/Jenkins-Server-TF/` | EC2 instance running Jenkins CI/CD |
| **EKS Cluster** | `Infrastructure-Provisioning/EKS-Cluster-TF/` | AWS managed Kubernetes cluster |

---

## ✅ Prerequisites

Before starting, ensure the following are set up:

1. **AWS CLI** installed and configured:
   ```bash
   aws configure
   # Enter: AWS Access Key, Secret Key, Region (us-east-1), Output format (json)
   ```

2. **Terraform v1.0+** installed → [Download](https://developer.hashicorp.com/terraform/downloads)

3. **An IAM User** with the following permissions:
   - `AmazonEC2FullAccess`
   - `AmazonEKSFullAccess`
   - `AmazonVPCFullAccess`
   - `IAMFullAccess`
   - `AmazonS3FullAccess` (for Terraform state backend)

---

## Part 1 — Provision the Jenkins Server

The Jenkins Server is an EC2 instance (`t2.2xlarge`, Ubuntu 22.04) provisioned with all required DevOps tools pre-installed via `tools-install.sh`, including:
- Jenkins (latest stable), Java 21 (OpenJDK), Docker, SonarQube (26.6.0-community), Trivy (latest), AWS CLI v2, kubectl (latest stable), eksctl (v0.227.0), Helm (v4.x), Terraform (v1.15.x)

### Step 1 — Navigate to the Terraform Directory

```bash
cd Infrastructure-Provisioning/Jenkins-Server-TF
```

### Step 2 — Review and Update Variables

Open `variables.tfvars` and confirm values — current configuration:

```hcl
# Infrastructure-Provisioning/Jenkins-Server-TF/variables.tfvars
vpc-name      = "Jenkins-vpc"
igw-name      = "Jenkins-igw"
subnet-name   = "Jenkins-subnet"
rt-name       = "Jenkins-route-table"
sg-name       = "Jenkins-sg"
instance-name = "Jenkins-server"
key-name      = "my-us-east-key-pair"   # ← your EC2 key pair in us-east-1
iam-role      = "Jenkins-iam-role"
```

> ⚠️ **Important:** Make sure the key pair `my-us-east-key-pair` exists in `us-east-1` before applying.

### Step 3 — Initialize Terraform

```bash
terraform init
```

### Step 4 — Preview the Changes

```bash
terraform plan -var-file=variables.tfvars
```

> 💡 **PowerShell / Windows User Note:** If you receive a `Too many command line arguments` error, PowerShell may be splitting the argument at the `=` sign. Use a space instead, or wrap the argument in quotes:
> ```powershell
> terraform plan -var-file variables.tfvars
> # OR: terraform plan "-var-file=variables.tfvars"
> ```

### Step 5 — Apply the Infrastructure

```bash
terraform apply -var-file=variables.tfvars -auto-approve
```

> 💡 **PowerShell / Windows User Note:** Likewise, if you encounter the same issue during apply, run:
> ```powershell
> terraform apply -var-file variables.tfvars -auto-approve
> ```

### Step 6 — Access Jenkins

1. Find the EC2 public IP in the Terraform output or the AWS Console.
2. Open your browser: `http://<EC2_PUBLIC_IP>:8080`
3. Get the initial admin password:
   ```bash
   ssh -i your-key.pem ec2-user@<EC2_PUBLIC_IP>
   sudo cat /var/lib/jenkins/secrets/initialAdminPassword
   ```
4. Complete the Jenkins setup wizard.

---

## Part 2 — Provision the EKS Cluster

The EKS cluster can be provisioned either manually (Terraform CLI) or automatically via the **Jenkins EKS Pipeline** (recommended for production).

### Key Terraform Files

| File | Purpose |
|---|---|
| `main.tf` | Main EKS cluster, VPC, subnets, node group definitions |
| `variables.tf` | Input variable declarations |
| `dev.tfvars` | Variable values for the `dev` environment |
| `backend.tf` | S3 backend for remote Terraform state |
| `module/` | Reusable modules for VPC, IAM, and EKS |

### Step 1 — Navigate to the EKS Terraform Directory

```bash
cd Infrastructure-Provisioning/EKS-Cluster-TF
```

### Step 0 — Create the S3 State Backend Bucket (One-Time)

```powershell
aws s3api create-bucket --bucket dev-sanket-tf-bucket --region us-east-1
aws s3api put-bucket-versioning --bucket dev-sanket-tf-bucket --versioning-configuration Status=Enabled
```

> 💡 No DynamoDB table required — `backend.tf` uses `use_lockfile = true` (S3-native locking).

### Step 2 — Review `backend.tf` (current config)

```hcl
# Infrastructure-Provisioning/EKS-Cluster-TF/backend.tf
terraform {
  required_version = "~> 1.15.0"
  backend "s3" {
    bucket       = "dev-sanket-tf-bucket"
    key          = "End-to-End-Kubernetes-Three-Tier-DevSecOps-Project/EKS-Cluster-TF/terraform.tfstate"
    region       = "us-east-1"
    use_lockfile = true
    encrypt      = true
  }
}

### Step 3 — Review the Dev Environment Variables

The actual `dev.tfvars` configuration (current values):

```hcl
env              = "dev"
aws-region       = "us-east-1"
cluster-version  = "1.36"
cluster-name     = "eks-cluster"
is-eks-cluster-enabled  = true
endpoint-private-access = true
endpoint-public-access  = false
ondemand_instance_types = ["t3a.medium"]
spot_instance_types     = ["c5a.large", "m5a.large", "t3a.large", ...]
# Addons pinned to K8s 1.36 compatible versions
```

### Step 4 — Initialize Terraform

```bash
terraform init
```

### Step 5 — Plan the Infrastructure

```bash
terraform plan -var-file=dev.tfvars
```

> 💡 **PowerShell / Windows User Note:** If you get an argument parsing error, use a space instead:
> ```powershell
> terraform plan -var-file dev.tfvars
> ```

### Step 6 — Apply the Infrastructure

```bash
terraform apply -var-file=dev.tfvars -auto-approve
```

> 💡 **PowerShell / Windows User Note:** Likewise, for apply, run:
> ```powershell
> terraform apply -var-file dev.tfvars -auto-approve
> ```

> ⏱️ This typically takes **10–15 minutes** to complete.

### Step 7 — Configure Cluster Access (Jump Server / Bastion Host)

Because the EKS cluster is provisioned with private-only endpoint access (`endpoint-private-access = true` and `endpoint-public-access = false`), you cannot run `kubectl` commands from your local machine directly. You must configure and use a **Jump Server (Bastion Host)** in the EKS VPC to access the cluster's private API server endpoint.

#### 1. Provision the Jump Server
1. Go to the AWS EC2 Console and launch a new instance:
   - **Name**: `dev-ap-medium-jump-server`
   - **AMI**: Ubuntu 22.04 LTS (or Amazon Linux 2023)
   - **Instance Type**: `t3.micro` or `t3a.micro` (eligible for Free Tier)
   - **Network Settings**:
     - **VPC**: `dev-ap-medium-vpc` (the VPC created by the EKS Terraform stack)
     - **Subnet**: Select one of the public subnets (e.g., `dev-ap-medium-subnet-public-1`)
     - **Auto-assign public IP**: **Enable**
     - **Security Group**: Create a new security group (`jump-server-sg`) that allows **SSH (Port 22)** restricted to **My IP** (your local machine's IP) for security.
   - **Key Pair**: Select your existing key pair (e.g., `my-us-east-key-pair`).

#### 2. Update EKS Security Group Inbound Rules
To allow the Jump Server to communicate with the EKS API server:
1. In the AWS Console, locate the Security Group for the EKS Cluster (named `eks-sg` in `dev.tfvars`).
2. Add an **Inbound Rule**:
   - **Type**: HTTPS (Port 443)
   - **Source**: Select the security group of the Jump Server (`jump-server-sg`) or input its private IP (e.g., `10.16.x.x/32`).
   - **Description**: `Allow 443 from Jump Server`
   *(Note: The Terraform script defines `eks-cluster-sg` in `module/vpc.tf` allowing inbound HTTPS. Ensure this rule is locked down to the Jump Server's IP/security group for security instead of `0.0.0.0/0` in production environments).*

#### 3. Install Tools & Configure kubeconfig on the Jump Server
1. SSH into your Jump Server from your local machine:
   ```bash
   ssh -i your-key.pem ubuntu@<JUMP_SERVER_PUBLIC_IP>
   ```
2. Install the **AWS CLI** and configure it with your AWS credentials:
   ```bash
   sudo apt-get update && sudo apt-get install -y unzip curl
   curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
   unzip awscliv2.zip
   sudo ./aws/install
   aws configure
   # Provide your AWS Access Key ID, Secret Access Key, Default Region (us-east-1), and Output format (json)
   ```
3. Install **kubectl**:
   ```bash
   curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
   sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
   ```
4. Install **eksctl**:
   ```bash
   curl --silent --location "https://github.com/eksctl-io/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
   sudo mv /tmp/eksctl /usr/local/bin
   ```
5. Update kubeconfig on the Jump Server (using the correct cluster name `dev-ap-medium-eks-cluster`):
   ```bash
   aws eks update-kubeconfig --region us-east-1 --name dev-ap-medium-eks-cluster
   ```
6. Verify access and tools:
   ```bash
   kubectl get nodes
   eksctl version
   ```
   *If successful, you will see your cluster nodes and the installed eksctl version.*

#### 4. Optional: Accessing the Private API Server Locally (SSH Tunneling)
If you prefer running `kubectl` commands from your local machine, you can route the traffic through the Jump Server using local port forwarding:
1. Establish the SSH tunnel:
   ```bash
   ssh -i your-key.pem -N -L 8443:<EKS_PRIVATE_API_ENDPOINT_URL>:443 ubuntu@<JUMP_SERVER_PUBLIC_IP>
   ```
   *(Retrieve `<EKS_PRIVATE_API_ENDPOINT_URL>` from EKS cluster details in AWS Console or `aws eks describe-cluster --name dev-ap-medium-eks-cluster`).*
2. Update your local `~/.kube/config` to point to `https://localhost:8443` and disable TLS verification for local routing, or use `--insecure-skip-tls-verify` when running commands locally.

---

## 🔁 Using the Jenkins EKS Pipeline (Recommended)

Instead of running Terraform manually, you can use the `Jenkinsfile-EKS` pipeline for automated, parameterized provisioning.

See → [CI/CD Pipeline Setup](./04-cicd-pipeline.md#eks-infrastructure-pipeline)

---

## 🧹 Destroying the Infrastructure

To tear down resources and avoid AWS charges:

### Jenkins Server

```bash
cd Infrastructure-Provisioning/Jenkins-Server-TF
terraform destroy -var-file=variables.tfvars -auto-approve
```

> 💡 **PowerShell / Windows User Note:** If needed, run:
> ```powershell
> terraform destroy -var-file variables.tfvars -auto-approve
> ```

### EKS Cluster

```bash
cd Infrastructure-Provisioning/EKS-Cluster-TF
terraform destroy -var-file=dev.tfvars -auto-approve
```

> 💡 **PowerShell / Windows User Note:** If needed, run:
> ```powershell
> terraform destroy -var-file dev.tfvars -auto-approve
> ```

---

## 📖 Next Steps

- Set up CI/CD pipelines → [CI/CD Pipeline Setup](./04-cicd-pipeline.md)
- Deploy the application → [Kubernetes Deployment](./05-kubernetes-deployment.md)
