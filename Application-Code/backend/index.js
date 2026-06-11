const tasks = require("./routes/tasks");
const connection = require("./db");
const cors = require("cors");
const express = require("express");
const app = express();
const mongoose = require('mongoose');
const promClient = require('prom-client');

// Enable default metrics collection (CPU, Memory, etc.)
promClient.collectDefaultMetrics();

// Custom metrics
const httpRequestsTotal = new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status']
});

connection();

app.use(express.json());
app.use(cors());

// Middleware to track HTTP requests
app.use((req, res, next) => {
    res.on('finish', () => {
        const route = req.baseUrl || req.path;
        // Skip scraping metrics endpoint itself to avoid noise
        if (route !== '/metrics') {
            httpRequestsTotal.inc({
                method: req.method,
                route: route,
                status: res.statusCode
            });
        }
    });
    next();
});

// Health check endpoints

// Basic health check to see if the server is running
app.get('/healthz', (req, res) => {
    res.status(200).send('Healthy');
});

let lastReadyState = null;  
// Readiness check to see if the server is ready to serve requests
app.get('/ready', (req, res) => {
    // Here you can add logic to check database connection or other dependencies
    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected !== lastReadyState) {
        console.log(`Database readyState: ${mongoose.connection.readyState}`);
        lastReadyState = isDbConnected;
    }
    
    if (isDbConnected) {
        res.status(200).send('Ready');
    } else {
        res.status(503).send('Not Ready');
    }
});

// Startup check to ensure the server has started correctly
app.get('/started', (req, res) => {
    // Assuming the server has started correctly if this endpoint is reachable
    res.status(200).send('Started');
});

// Metrics endpoint for Prometheus to scrape
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', promClient.register.contentType);
    res.end(await promClient.register.metrics());
});

app.use("/api/tasks", tasks);

const port = process.env.PORT || 3500;
app.listen(port, () => console.log(`Listening on port ${port}...`));
