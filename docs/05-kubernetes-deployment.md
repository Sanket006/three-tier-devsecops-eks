# 05 — Kubernetes Deployment

> **Navigation:** [← CI/CD Pipeline Setup](./04-cicd-pipeline.md) | [Docs Index](./index.md) | Next: [GitOps with ArgoCD →](./06-argocd-gitops.md)

---

## ☸️ Overview

This guide covers how to deploy the Three-Tier application to **AWS EKS** using the Kubernetes manifests in `Kubernetes-Manifests-file/`.

The deployment includes:
- A dedicated **namespace** (`three-tier`)
- **Frontend** Deployment and Service
- **Backend** Deployment and Service (with health probes)
- **MongoDB** StatefulSet and Service
- **ALB Ingress** for external access

---

## ✅ Prerequisites

- EKS cluster provisioned and running (see [Infrastructure Provisioning](./03-infrastructure-provisioning.md))
- `kubectl` configured to point to the EKS cluster:
  ```bash
  aws eks update-kubeconfig --region us-east-1 --name eks-cluster
  kubectl get nodes   # Should show Running nodes
  ```
- Docker images built and pushed to ECR (see [CI/CD Pipeline Setup](./04-cicd-pipeline.md))
- AWS Load Balancer Controller installed on the cluster (for ALB Ingress)

---

## 📁 Manifest Structure

```
Kubernetes-Manifests-file/
├── Frontend/
│   ├── deployment.yaml   # Frontend Deployment (2 replicas)
│   └── service.yaml      # Frontend ClusterIP Service (port 3000)
├── Backend/
│   ├── deployment.yaml   # Backend Deployment (2 replicas + health probes)
│   └── service.yaml      # Backend ClusterIP Service (port 3500)
├── Database/
│   └── ...               # MongoDB StatefulSet + Service
└── ingress.yaml          # ALB Ingress (routes traffic to frontend + backend)
```

---

## Step 1 — Install the AWS Load Balancer Controller

The ALB Ingress requires the AWS Load Balancer Controller to be installed:

```bash
# Add the EKS Helm chart repo
helm repo add eks https://aws.github.io/eks-charts
helm repo update

# Install the controller
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=eks-cluster \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller
```

---

## Step 2 — Create the Namespace

All application resources live in the `three-tier` namespace:

```bash
kubectl create namespace three-tier
```

Verify:

```bash
kubectl get namespaces | grep three-tier
```

---

## Step 3 — Create ECR Image Pull Secret

The backend deployment uses ECR private images and requires a pull secret:

```bash
# Get ECR login token
aws ecr get-login-password --region us-east-1 | \
  kubectl create secret docker-registry ecr-registry-secret \
  --docker-server=<AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com \
  --docker-username=AWS \
  --docker-password=$(aws ecr get-login-password --region us-east-1) \
  --namespace=three-tier
```

---

## Step 4 — Create MongoDB Secret

The backend reads MongoDB credentials from a Kubernetes secret:

```bash
kubectl create secret generic mongo-sec \
  --from-literal=username=admin \
  --from-literal=password=yourSecurePassword \
  --namespace=three-tier
```

---

## Step 5 — Deploy MongoDB

```bash
kubectl apply -f Kubernetes-Manifests-file/Database/ -n three-tier
```

Verify MongoDB is running:

```bash
kubectl get pods -n three-tier -l app=mongodb
```

---

## Step 6 — Deploy the Backend

```bash
kubectl apply -f Kubernetes-Manifests-file/Backend/ -n three-tier
```

The backend deployment includes three health probes:

| Probe | Endpoint | Purpose |
|---|---|---|
| **Liveness** | `GET /healthz` | Restarts pod if unhealthy |
| **Readiness** | `GET /ready` | Removes pod from load balancer if not ready |
| **Startup** | `GET /started` | Gives extra time on startup (30 × 10s = 5min max) |

Verify the backend is running:

```bash
kubectl get pods -n three-tier -l role=api
kubectl get svc -n three-tier
```

---

## Step 7 — Deploy the Frontend

Before applying, update the image in `Frontend/deployment.yaml` to use your ECR image:

```yaml
# Kubernetes-Manifests-file/Frontend/deployment.yaml
containers:
  - name: frontend
    image: <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/frontend:<BUILD_NUMBER>
```

Apply the manifests:

```bash
kubectl apply -f Kubernetes-Manifests-file/Frontend/ -n three-tier
```

Verify:

```bash
kubectl get pods -n three-tier -l role=frontend
```

---

## Step 8 — Apply the Ingress

The ingress routes traffic through an AWS ALB:

- `/api/*` and health check paths → Backend service (port 3500)
- `/` (all other paths) → Frontend service (port 3000)

```bash
kubectl apply -f Kubernetes-Manifests-file/ingress.yaml -n three-tier
```

Verify the ingress and get the ALB DNS name:

```bash
kubectl get ingress -n three-tier
```

Wait for the `ADDRESS` field to populate (may take 2–3 minutes):

```
NAME     CLASS   HOSTS                        ADDRESS                                          PORTS
mainlb   alb     devopswithsanket.space       k8s-threetier-xxxx.us-east-1.elb.amazonaws.com   80
```

---

## Step 9 — Configure DNS

Create a **CNAME** record in your DNS provider (`devopswithsanket.space`) pointing to the ALB DNS name from the ingress output above.

Example (Route 53 or any DNS provider):
```
devopswithsanket.space  CNAME  k8s-threetier-xxxx.us-east-1.elb.amazonaws.com
```

---

## ✅ Verifying the Full Deployment

```bash
# Check all pods are running
kubectl get pods -n three-tier

# Check all services
kubectl get svc -n three-tier

# Check ingress
kubectl get ingress -n three-tier

# View backend logs
kubectl logs -l role=api -n three-tier --tail=50

# View frontend logs
kubectl logs -l role=frontend -n three-tier --tail=50
```

---

## 🔄 Rolling Updates

When a new image is pushed via CI/CD, update the deployment:

```bash
# Manual image update
kubectl set image deployment/api api=<ECR_URI>/backend:<NEW_TAG> -n three-tier

# Watch the rollout
kubectl rollout status deployment/api -n three-tier
```

With **ArgoCD** configured, this happens automatically. See → [GitOps with ArgoCD](./06-argocd-gitops.md)

---

## 🔁 Rollback

If a deployment causes issues, roll back instantly:

```bash
kubectl rollout undo deployment/api -n three-tier
kubectl rollout undo deployment/frontend -n three-tier
```

---

## 📖 Next Steps

- Automate deployments with GitOps → [ArgoCD GitOps](./06-argocd-gitops.md)
- Set up monitoring → [Monitoring & Observability](./07-monitoring.md)
