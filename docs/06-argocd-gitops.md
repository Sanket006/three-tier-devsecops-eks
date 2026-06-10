# 06 — GitOps with ArgoCD

> **Navigation:** [← Kubernetes Deployment](./05-kubernetes-deployment.md) | [Docs Index](./index.md) | Next: [Monitoring & Observability →](./07-monitoring.md)

---

## 🔁 Overview

**ArgoCD** is a declarative GitOps continuous delivery tool for Kubernetes. Instead of manually running `kubectl apply`, ArgoCD watches your Git repository and **automatically synchronizes** the cluster state with the desired state defined in your manifests.

### How GitOps Works in This Project

```
Jenkins CI Pipeline
  └── Updates image tag in Kubernetes-Manifests-file/*/deployment.yaml
        └── Commits & pushes to GitHub
              └── ArgoCD detects the change
                    └── Automatically deploys new version to EKS ✅
```

---

## ✅ Prerequisites

- EKS cluster running (see [Infrastructure Provisioning](./03-infrastructure-provisioning.md))
- `kubectl` configured to point to the EKS cluster
- `helm` installed
- Jenkins pipelines set up (see [CI/CD Pipeline Setup](./04-cicd-pipeline.md))

---

## Step 1 — Install ArgoCD on EKS

```bash
# Create a dedicated namespace for ArgoCD
kubectl create namespace argocd

# Install ArgoCD using the official manifest
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

Verify all pods are running:

```bash
kubectl get pods -n argocd
```

Wait until all pods show `Running` status.

---

## Step 2 — Expose the ArgoCD UI

By default, ArgoCD's server is only accessible within the cluster. Expose it via a LoadBalancer:

```bash
kubectl patch svc argocd-server -n argocd \
  -p '{"spec": {"type": "LoadBalancer"}}'
```

Get the external address:

```bash
kubectl get svc argocd-server -n argocd
```

Note the `EXTERNAL-IP` — this is your ArgoCD UI address.

---

## Step 3 — Get the Initial Admin Password

```bash
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d && echo
```

---

## Step 4 — Log in to ArgoCD

1. Open your browser and navigate to `http://<ARGOCD_EXTERNAL_IP>`
2. Username: `admin`
3. Password: *(from Step 3)*

> 💡 **Tip:** Change the admin password after first login via **User Info → Update Password**.

---

## Step 5 — Connect Your Git Repository

1. Go to **Settings → Repositories → Connect Repo**
2. Fill in the details:
   - **Connection method:** HTTPS
   - **Repository URL:** `https://github.com/Sanket006/three-tier-devsecops-eks.git`
   - **Username:** Your GitHub username
   - **Password:** Your GitHub Personal Access Token
3. Click **Connect**

---

## Step 6 — Create ArgoCD Applications

You need to create two ArgoCD applications — one for the frontend and one for the backend.

### Frontend Application

1. Go to **Applications → New App**
2. Fill in:

   | Field | Value |
   |---|---|
   | **Application Name** | `three-tier-frontend` |
   | **Project** | `default` |
   | **Sync Policy** | `Automatic` |
   | **Repository URL** | Your GitHub repo URL |
   | **Revision** | `HEAD` |
   | **Path** | `Kubernetes-Manifests-file/Frontend` |
   | **Cluster URL** | `https://kubernetes.default.svc` |
   | **Namespace** | `three-tier` |

3. Click **Create**

### Backend Application

1. Go to **Applications → New App**
2. Fill in:

   | Field | Value |
   |---|---|
   | **Application Name** | `three-tier-backend` |
   | **Project** | `default` |
   | **Sync Policy** | `Automatic` |
   | **Repository URL** | Your GitHub repo URL |
   | **Revision** | `HEAD` |
   | **Path** | `Kubernetes-Manifests-file/Backend` |
   | **Cluster URL** | `https://kubernetes.default.svc` |
   | **Namespace** | `three-tier` |

3. Click **Create**

---

## Step 7 — Enable Auto-Sync

With **Automatic Sync Policy**, ArgoCD will:
- Watch the Git repository for changes
- Automatically apply updated manifests to the cluster
- Show the sync status in real-time in the UI

To enable auto-sync on an existing app:

```bash
argocd app set three-tier-frontend --sync-policy automated
argocd app set three-tier-backend --sync-policy automated
```

---

## Step 8 — Verify the Setup

After a Jenkins pipeline run updates a `deployment.yaml`:

1. ArgoCD detects the image tag change within ~3 minutes
2. It shows the app as `OutOfSync`
3. Auto-sync triggers and applies the new manifest
4. Status returns to `Synced` ✅

You can also manually trigger sync:

```bash
argocd app sync three-tier-frontend
argocd app sync three-tier-backend
```

---

## 🗺️ ArgoCD Application Dashboard

The ArgoCD UI shows:
- **Health status** of each pod and service
- **Sync status** (Synced / OutOfSync)
- **Deployment history** with the ability to rollback
- **Resource tree** showing all related Kubernetes objects

---

## 🔄 Rollback via ArgoCD

To roll back to a previous version:

1. Open the application in ArgoCD UI
2. Click **History and Rollback**
3. Select the previous deployment
4. Click **Rollback**

---

## 📖 Next Steps

- Set up monitoring → [Monitoring & Observability](./07-monitoring.md)
- Review security setup → [Security Scanning](./08-security-scanning.md)
