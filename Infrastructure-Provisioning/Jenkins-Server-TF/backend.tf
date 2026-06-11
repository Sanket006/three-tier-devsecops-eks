terraform {
  backend "s3" {
    bucket         = "sanket-jenkins-tf-bucket"
    region         = "us-east-1"
    key            = "End-to-End-Kubernetes-Three-Tier-DevSecOps-Project/Jenkins-Server-TF/terraform.tfstate"
    use_lockfile   = true
    encrypt        = true
  }
  required_version = "~> 1.15.0"
  required_providers {
    aws = {
      version = "~> 6.49.0"
      source  = "hashicorp/aws"
    }
  }
}