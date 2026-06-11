#!/bin/bash
# For Ubuntu 22.04
# Last reviewed: June 2026

# Installing Java (OpenJDK 21 LTS - latest stable required by Jenkins)
sudo apt update -y
sudo apt install openjdk-21-jre -y
sudo apt install openjdk-21-jdk -y
java --version

# Installing Jenkins (always installs latest stable from official repo)
sudo mkdir -p /etc/apt/keyrings
sudo wget -O /etc/apt/keyrings/jenkins-keyring.asc \
  https://pkg.jenkins.io/debian-stable/jenkins.io-2026.key
echo "deb [signed-by=/etc/apt/keyrings/jenkins-keyring.asc]" \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt-get update -y
sudo apt install jenkins -y

# Installing Docker
sudo apt update
sudo apt install docker.io -y
sudo usermod -aG docker jenkins
sudo usermod -aG docker ubuntu
sudo systemctl restart docker
sudo chmod 777 /var/run/docker.sock

# If you don't want to install Jenkins, you can create a container of Jenkins
# docker run -d -p 8080:8080 -p 50000:50000 --name jenkins-container jenkins/jenkins:lts

# Run Docker Container of Sonarqube
# NOTE: 'lts-community' tag is no longer maintained. SonarQube Community Build
# now uses calendar versioning (YY.M.0.BuildNumber). Use a pinned tag for stability.
# Latest Community Build as of June 2026: 26.6.0.123539-community
docker run -d --name sonar -p 9000:9000 sonarqube:26.6.0.123539-community

# Installing AWS CLI v2 (always installs latest via official installer)
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
sudo apt install unzip -y
unzip awscliv2.zip
sudo ./aws/install
aws --version

# Installing Kubectl
# Pin to a version within one minor version of your EKS cluster.
# Latest stable as of June 2026: v1.36.1
# Use dynamic latest: $(curl -L -s https://dl.k8s.io/release/stable.txt)
sudo apt update
sudo apt install curl -y
sudo curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo chmod +x kubectl
sudo mv kubectl /usr/local/bin/
kubectl version --client

# Installing eksctl (always installs latest via GitHub releases - v0.227.0 as of June 2026)
curl --silent --location "https://github.com/eksctl-io/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin
eksctl version

# Installing Terraform (always installs latest from HashiCorp APT repo - v1.15.6 as of June 2026)
sudo apt-get install -y gnupg software-properties-common
wget -O- https://apt.releases.hashicorp.com/gpg | \
  gpg --dearmor | \
  sudo tee /usr/share/keyrings/hashicorp-archive-keyring.gpg > /dev/null
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | \
  sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update
sudo apt install terraform -y
terraform --version

# Installing Trivy (always installs latest from Aqua Security repo)
# NOTE: apt-key is deprecated on Ubuntu 22.04+. Using modern signed-by method.
sudo apt-get install wget apt-transport-https gnupg -y
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | \
  gpg --dearmor | \
  sudo tee /usr/share/keyrings/trivy.gpg > /dev/null
echo "deb [signed-by=/usr/share/keyrings/trivy.gpg] https://aquasecurity.github.io/trivy-repo/deb generic main" | \
  sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt update
sudo apt install trivy -y
trivy --version

# Installing Helm (latest stable via snap - v4.2.0 as of June 2026)
# NOTE: Helm 3 reaches security EOL in November 2026. Snap installs Helm 4 now.
sudo snap install helm --classic
helm version