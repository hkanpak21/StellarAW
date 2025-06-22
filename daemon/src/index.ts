/**
 * Main entry point for the Stellar Wallet App Daemon
 */

import * as http from 'http';
import express from 'express';
import { Request, Response } from 'express';
import cors from 'cors';
import { loadConfig } from './config';
import { WebSocketServer } from './services/websocket';

// Load configuration
const config = loadConfig();

// Create express app
const app = express();

// Enable CORS for all routes
app.use(cors());

// Middleware for JSON support
app.use(express.json());

// Simple status endpoint
app.get('/status', (_req: Request, res: Response) => {
  res.json({ status: 'ok', version: '1.0.0' });
});

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
new WebSocketServer(server, config);

// Start the server
server.listen(config.port, config.host, () => {
  console.log(`Server running at http://${config.host}:${config.port}/`);
  console.log('WebSocket server ready for connections');
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
}); 