# 07 — Monitoring & Observability

> **Navigation:** [← GitOps with ArgoCD](./06-argocd-gitops.md) | [Docs Index](./index.md) | Next: [Security Scanning →](./08-security-scanning.md)

---

## 📊 Overview

This guide covers setting up a full observability stack using **Prometheus** and **Grafana** on the EKS cluster via **Helm**.

| Tool | Role |
|---|---|
| **Prometheus** | Collects and stores time-series metrics from the cluster and applications |
| **Grafana** | Visualizes metrics via rich, interactive dashboards |
| **Helm** | Used to deploy and manage the monitoring stack on Kubernetes |

---

## ✅ Prerequisites

- EKS cluster running and `kubectl` configured
- `helm` v3+ installed → [Install Helm](https://helm.sh/docs/intro/install/)
- Application deployed on the cluster (see [Kubernetes Deployment](./05-kubernetes-deployment.md))

---

## Step 1 — Add the Helm Repositories

```bash
# Add Prometheus community charts
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts

# Add Grafana charts
helm repo add grafana https://grafana.github.io/helm-charts

# Update Helm repos
helm repo update
```

---

## Step 2 — Create a Monitoring Namespace

```bash
kubectl create namespace monitoring
```

---

## Step 3 — Install the Prometheus Stack

The `kube-prometheus-stack` Helm chart bundles Prometheus, Grafana, and Alertmanager together:

```bash
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --set grafana.enabled=true \
  --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false
```

Verify the installation:

```bash
kubectl get pods -n monitoring
```

Expected pods:
```
prometheus-grafana-...                      Running
prometheus-kube-prometheus-operator-...    Running
prometheus-kube-state-metrics-...          Running
prometheus-prometheus-node-exporter-...    Running (one per node)
alertmanager-prometheus-kube-prometheus-... Running
```

---

## Step 4 — Access the Grafana Dashboard

### Option A — Port Forward (Quick Access)

```bash
kubectl port-forward svc/prometheus-grafana 3001:80 -n monitoring
```

Open your browser at `http://localhost:3001`

### Option B — Expose via LoadBalancer

```bash
kubectl patch svc prometheus-grafana -n monitoring \
  -p '{"spec": {"type": "LoadBalancer"}}'

# Get the external IP
kubectl get svc prometheus-grafana -n monitoring
```

---

## Step 5 — Log in to Grafana

| Field | Value |
|---|---|
| **Username** | `admin` |
| **Password** | `prom-operator` (default) |

> 💡 Change the password immediately after first login.

---

## Step 6 — Explore Pre-Built Dashboards

The `kube-prometheus-stack` comes with pre-built dashboards. Navigate to:

**Dashboards → Browse**

Key dashboards to explore:

| Dashboard | What it Shows |
|---|---|
| **Kubernetes / Cluster (Global)** | Overall cluster health, CPU, memory |
| **Kubernetes / Nodes** | Per-node resource utilization |
| **Kubernetes / Pods** | Pod-level metrics |
| **Kubernetes / Workloads** | Deployment, ReplicaSet health |
| **Node Exporter / Full** | Host-level OS metrics |

---

## Step 7 — Access the Prometheus UI

### Port Forward

```bash
kubectl port-forward svc/prometheus-kube-prometheus-prometheus 9090:9090 -n monitoring
```

Open `http://localhost:9090`

### Useful Prometheus Queries (PromQL)

```promql
# CPU usage per pod
sum(rate(container_cpu_usage_seconds_total{namespace="three-tier"}[5m])) by (pod)

# Memory usage per pod
sum(container_memory_usage_bytes{namespace="three-tier"}) by (pod)

# HTTP requests per second to backend
rate(http_requests_total{namespace="three-tier"}[5m])

# Pod restart count
kube_pod_container_status_restarts_total{namespace="three-tier"}
```

---

## Step 8 — Import a Custom Dashboard (Optional)

1. Go to **Dashboards → Import**
2. Enter a dashboard ID from [Grafana Dashboard Library](https://grafana.com/grafana/dashboards/):
   - **15661** — Kubernetes Cluster Monitoring
   - **12740** — Kubernetes Monitoring Dashboard
3. Click **Load** → Select `Prometheus` as data source → **Import**

---

## Step 9 — Set Up Alertmanager (Optional)

Alertmanager handles alerts from Prometheus. Configure notification receivers (email, Slack, PagerDuty):

```bash
# Edit Alertmanager config
kubectl edit secret alertmanager-prometheus-kube-prometheus-alertmanager -n monitoring
```

Example Slack receiver config:

```yaml
route:
  receiver: slack-notifications
receivers:
  - name: slack-notifications
    slack_configs:
      - api_url: https://hooks.slack.com/services/YOUR/WEBHOOK/URL
        channel: '#alerts'
        title: 'Kubernetes Alert'
        text: '{{ .CommonAnnotations.summary }}'
```

---

## 🔍 What to Monitor for This Project

| Metric | Why it Matters |
|---|---|
| Pod restart count | Detects crash-looping containers |
| CPU/Memory usage | Right-size your node groups |
| Backend `/ready` endpoint | Tracks DB connection health |
| HTTP error rate (5xx) | Application-level errors |
| MongoDB connections | Database health |

---

## 🧹 Uninstall Monitoring Stack

```bash
helm uninstall prometheus -n monitoring
kubectl delete namespace monitoring
```

---

## 📖 Next Steps

- Learn about security scanning → [Security Scanning](./08-security-scanning.md)
- Review the full project architecture → [Project Overview](./01-project-overview.md)
