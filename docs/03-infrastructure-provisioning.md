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

The Jenkins Server is an EC2 instance provisioned with all required DevOps tools pre-installed via a startup script (`tools-install.sh`), including:
- Jenkins, Docker, Trivy, SonarQube, AWS CLI, kubectl, Terraform

### Step 1 — Navigate to the Terraform Directory

```bash
cd Infrastructure-Provisioning/Jenkins-Server-TF
```

### Step 2 — Review and Update Variables

Open `variables.tfvars` and update as needed:

```hcl
# variables.tfvars
region        = "us-east-1"
ami_id        = "ami-0c02fb55956c7d316"   # Amazon Linux 2 (us-east-1)
instance_type = "t2.large"
key_name      = "your-ec2-key-pair-name"
```

> ⚠️ **Important:** Make sure your EC2 key pair already exists in the target region.

### Step 3 — Initialize Terraform

```bash
terraform init
```

### Step 4 — Preview the Changes

```bash
terraform plan -var-file=variables.tfvars
```

### Step 5 — Apply the Infrastructure

```bash
terraform apply -var-file=variables.tfvars -auto-approve
```

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

### Step 2 — Configure the S3 Backend (Remote State)

Edit `backend.tf` to point to your S3 bucket:

```hcl
terraform {
  backend "s3" {
    bucket = "your-terraform-state-bucket"
    key    = "eks/terraform.tfstate"
    region = "us-east-1"
  }
}
```

> 💡 Create the S3 bucket first if it doesn't exist:
> ```bash
> aws s3 mb s3://your-terraform-state-bucket --region us-east-1
> ```

### Step 3 — Review the Dev Environment Variables

Open `dev.tfvars` to review or customize:

```hcl
cluster_name    = "Three-Tier-Cluster"
region          = "us-east-1"
node_group_name = "Three-Tier-Node-Group"
instance_type   = "t2.medium"
desired_size    = 2
min_size        = 1
max_size        = 3
```

### Step 4 — Initialize Terraform

```bash
terraform init
```

### Step 5 — Plan the Infrastructure

```bash
terraform plan -var-file=dev.tfvars
```

### Step 6 — Apply the Infrastructure

```bash
terraform apply -var-file=dev.tfvars -auto-approve
```

> ⏱️ This typically takes **10–15 minutes** to complete.

### Step 7 — Configure kubectl

After the cluster is created, update your local kubeconfig:

```bash
aws eks update-kubeconfig --region us-east-1 --name Three-Tier-Cluster
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

### EKS Cluster

```bash
cd Infrastructure-Provisioning/EKS-Cluster-TF
terraform destroy -var-file=dev.tfvars -auto-approve
```

---

## 📖 Next Steps

- Set up CI/CD pipelines → [CI/CD Pipeline Setup](./04-cicd-pipeline.md)
- Deploy the application → [Kubernetes Deployment](./05-kubernetes-deployment.md)
