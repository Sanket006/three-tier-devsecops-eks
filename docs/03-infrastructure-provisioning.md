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

### Step 7 — Configure kubectl

After the cluster is created, update your local kubeconfig:

```bash
aws eks update-kubeconfig --region us-east-1 --name eks-cluster
```

Verify the cluster nodes are ready:

```bash
kubectl get nodes
```

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
