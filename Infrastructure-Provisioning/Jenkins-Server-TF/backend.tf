terraform {
  backend "s3" {
    bucket         = "my-ews-baket1"
    region         = "us-east-1"
    key            = "End-to-End-Kubernetes-Three-Tier-DevSecOps-Project/Jenkins-Server-TF/terraform.tfstate"
    dynamodb_table = "Lock-Files"
    encrypt        = true
  }
  required_version = "~> 1.15.5"
  required_providers {
    aws = {
      version = "~> 6.49.0"
      source  = "hashicorp/aws"
    }
  }
}