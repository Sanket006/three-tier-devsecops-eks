# 02 — Local Development Setup

> **Navigation:** [← Project Overview](./01-project-overview.md) | [Docs Index](./index.md) | Next: [Infrastructure Provisioning →](./03-infrastructure-provisioning.md)

---

## 🖥️ Overview

This guide walks you through running the full Three-Tier application (Frontend, Backend, MongoDB) on your local machine for development and testing.

There are two supported methods:

| Method | Best For |
|---|---|
| [Docker Compose](#method-1-docker-compose-recommended) | Quick local testing, no Node.js setup needed |
| [Native Node.js](#method-2-native-nodejs-processes) | Active development with hot-reload |

---

## ✅ Prerequisites

Ensure the following tools are installed:

- **Docker Desktop** (with Docker Compose) → [Download](https://www.docker.com/products/docker-desktop/)
- **Node.js v18+** (only for the native method) → [Download](https://nodejs.org/)
- **Git** → [Download](https://git-scm.com/)

---

## 📁 Application Structure

```
Application-Code/
├── frontend/           # ReactJS app (port 3000)
├── backend/            # NodeJS API  (port 3500)
└── docker-compose.yml  # Orchestrates all 3 services
```

---

## Method 1: Docker Compose (Recommended)

This method spins up all three services (MongoDB, Backend, Frontend) in containers with a single command.

### Step 1 — Clone the Repository

```bash
git clone https://github.com/AmanPathak-DevOps/End-to-End-Kubernetes-Three-Tier-DevSecOps-Project.git
cd End-to-End-Kubernetes-Three-Tier-DevSecOps-Project
```

### Step 2 — Navigate to the Application Code

```bash
cd Application-Code
```

### Step 3 — Build and Start All Services

```bash
docker compose up --build -d
```

> **What this does:**
> - Pulls the `mongo:latest` image
> - Builds the backend Docker image from `./backend/Dockerfile`
> - Builds the frontend Docker image from `./frontend/Dockerfile`
> - Starts all three services in detached mode (`-d`)

### Step 4 — Verify All Containers Are Running

```bash
docker compose ps
```

Expected output:

```
NAME          IMAGE                 STATUS         PORTS
tf-frontend   application-code-frontend   Up   0.0.0.0:3000->3000/tcp
tf-backend    application-code-backend    Up   0.0.0.0:3500->3500/tcp
tf-mongodb    mongo:latest                Up   0.0.0.0:27018->27017/tcp
```

### Step 5 — Access the Application

| Service | URL |
|---|---|
| **Frontend (TaskFlow UI)** | http://localhost:3000 |
| **Backend API** | http://localhost:3500/api/tasks |
| **Health Check** | http://localhost:3500/healthz |
| **Readiness Check** | http://localhost:3500/ready |

### Step 6 — View Logs (Optional)

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f frontend
docker compose logs -f backend
```

### Step 7 — Stop the Application

```bash
docker compose down
```

To also remove stored data volumes:

```bash
docker compose down -v
```

---

## Method 2: Native Node.js Processes

This method runs the backend and frontend directly on your host machine.

### Prerequisites

- **MongoDB** must be running locally on port `27017`
  - Install via [MongoDB Community](https://www.mongodb.com/try/download/community) or use Docker:
    ```bash
    docker run -d -p 27017:27017 --name mongo mongo:latest
    ```

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/AmanPathak-DevOps/End-to-End-Kubernetes-Three-Tier-DevSecOps-Project.git
cd End-to-End-Kubernetes-Three-Tier-DevSecOps-Project
```

### Step 2 — Start the Backend Server

```bash
cd Application-Code/backend
npm install
```

**Set environment variables and start (PowerShell):**

```powershell
$env:MONGO_CONN_STR = "mongodb://localhost:27017/tasks"
$env:PORT = "3500"
node index.js
```

**Set environment variables and start (Linux/macOS):**

```bash
MONGO_CONN_STR="mongodb://localhost:27017/tasks" PORT=3500 node index.js
```

✅ You should see:
```
Listening on port 3500...
Connected to database.
```

### Step 3 — Start the Frontend (new terminal)

```bash
cd Application-Code/frontend
npm install
```

**Start (PowerShell):**

```powershell
$env:REACT_APP_BACKEND_URL = "http://localhost:3500/api/tasks"
npm start
```

**Start (Linux/macOS):**

```bash
REACT_APP_BACKEND_URL="http://localhost:3500/api/tasks" npm start
```

✅ The browser should automatically open at `http://localhost:3000`.

---

## 🔧 Environment Variables Reference

### Backend

| Variable | Default | Description |
|---|---|---|
| `MONGO_CONN_STR` | *(required)* | MongoDB connection string |
| `PORT` | `3500` | Port the API server listens on |
| `USE_DB_AUTH` | `false` | Enable MongoDB authentication |
| `MONGO_USERNAME` | — | MongoDB username (if auth enabled) |
| `MONGO_PASSWORD` | — | MongoDB password (if auth enabled) |

### Frontend

| Variable | Default | Description |
|---|---|---|
| `REACT_APP_BACKEND_URL` | *(required)* | Full URL to the backend API |

---

## 🐞 Troubleshooting

| Issue | Solution |
|---|---|
| Port 3000 or 3500 already in use | Stop existing processes: `npx kill-port 3000 3500` |
| `npm install` fails with peer dependency errors | Remove `@material-ui/core` from `package.json` if present |
| Frontend can't reach backend | Check `REACT_APP_BACKEND_URL` is set correctly |
| MongoDB connection refused | Ensure MongoDB is running on port 27017 |
| Docker build fails with `ECONNRESET` | Retry — this is a transient network issue |

---

## 📖 Next Steps

- Deploy to the cloud → [Infrastructure Provisioning](./03-infrastructure-provisioning.md)
- Learn about CI/CD pipelines → [CI/CD Pipeline Setup](./04-cicd-pipeline.md)
