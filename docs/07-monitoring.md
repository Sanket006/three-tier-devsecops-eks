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

## Step 3 — Install the Prometheus Stack (with Grafana disabled)

Install the `kube-prometheus-stack` Helm chart but disable the built-in Grafana since we are installing it separately:

```bash
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --set grafana.enabled=false \
  --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false
```

Verify the installation:

```bash
kubectl get pods -n monitoring
```

---

## Step 4 — Install Grafana Separately

Install the standalone Grafana Helm chart in the same namespace:

```bash
helm install grafana grafana/grafana --namespace monitoring
```

Verify that the Grafana pod is running:

```bash
kubectl get pods -n monitoring -l app.kubernetes.io/name=grafana
```

---

## Step 5 — Access the Grafana Dashboard

### Option A — Port Forward (Quick Access)

```bash
kubectl port-forward svc/grafana 3001:80 -n monitoring
```

Open your browser at `http://localhost:3001`

### Option B — Expose via LoadBalancer

```bash
kubectl patch svc grafana -n monitoring \
  -p '{"spec": {"type": "LoadBalancer"}}'

# Get the external IP / DNS Name
kubectl get svc grafana -n monitoring
```

---

## Step 6 — Log in to Grafana

Standalone Grafana generates a random password stored in a Kubernetes secret.

1. Retrieve the password by running:
   ```bash
   kubectl get secret --namespace monitoring grafana -o jsonpath="{.data.admin-password}" | base64 --decode ; echo
   ```
2. Log in using the credentials:

   | Field | Value |
   |---|---|
   | **Username** | `admin` |
   | **Password** | *The decoded password from the step above* |

---

## Step 7 — Connect Grafana to Prometheus Data Source

Since Grafana was installed separately, you need to manually connect it to Prometheus:

1. Log in to Grafana.
2. In the left-hand menu, navigate to **Connections** (or **Data Sources** under the gear icon) and click **Add data source**.
3. Select **Prometheus**.
4. In the **Connection URL** field, enter the Prometheus internal service address:
   ```text
   http://prometheus-kube-prometheus-prometheus.monitoring.svc.cluster.local:9090
   ```
5. Scroll to the bottom and click **Save & Test**. You should see a green success notification indicating that the data source is working.

---

## Step 8 — Explore Pre-Built Dashboards

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

## Step 9 — Access the Prometheus UI

The Prometheus Server exposes a built-in Expression Browser interface to run queries, check target status, and view alert configurations.

### Option A — Port Forward (Quick Access)

```bash
kubectl port-forward svc/prometheus-kube-prometheus-prometheus 9090:9090 -n monitoring
```
> 💡 **No Namespace Note:** If you installed Prometheus in the default namespace, run:
> `kubectl port-forward svc/prometheus-kube-prometheus-prometheus 9090:9090`

Open your browser at **`http://localhost:9090`**

### Option B — Expose via LoadBalancer

To access the Prometheus dashboard externally without port-forwarding:

```bash
kubectl patch svc prometheus-kube-prometheus-prometheus -n monitoring \
  -p '{"spec": {"type": "LoadBalancer"}}'

# Get the external IP / DNS name
kubectl get svc prometheus-kube-prometheus-prometheus -n monitoring
```
> 💡 **No Namespace Note:** If installed in the default namespace, run:
> `kubectl patch svc prometheus-kube-prometheus-prometheus -p '{"spec": {"type": "LoadBalancer"}}'`
> `kubectl get svc prometheus-kube-prometheus-prometheus`

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

## Step 10 — Import a Custom Dashboard (Optional)

You can import pre-configured community dashboards to visualize your EKS cluster and application stack without building panels from scratch:

1. In Grafana, go to **Dashboards → New → Import**.
2. Enter one of the following Dashboard IDs from the [Grafana Dashboard Library](https://grafana.com/grafana/dashboards/):

   * **Cluster & Node Metrics:**
     * **`1860`** — **Node Exporter Full** (Highly recommended: detailed CPU, memory, disk, network, and system stats for all EKS nodes).
     * **`15661`** — **Kubernetes Cluster Monitoring** (Overview of cluster capacity, usage, pod counts, and resource limits).
     * **`12740`** — **Kubernetes Monitoring Dashboard** (Visualizes workloads, pods, namespaces, and node statuses).

   * **Workload & Container Metrics:**
     * **`15760`** — **Kubernetes / Kube-State-Metrics** (Deep dive into pod health, replicas, restarts, CPU throttles, and memory limits).

   * **Database Metrics (MongoDB):**
     * **`16496`** — **MongoDB Dashboard** (Tracks database connections, memory usage, command operations, and throughput).

3. Click **Load**.
4. Select **Prometheus** as the data source in the dropdown, then click **Import**.

---

## Step 11 — Set Up Alertmanager (Optional)

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
helm uninstall grafana -n monitoring
kubectl delete namespace monitoring
```

---

## 📖 Next Steps

- Learn about security scanning → [Security Scanning](./08-security-scanning.md)
- Review the full project architecture → [Project Overview](./01-project-overview.md)
