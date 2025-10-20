import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import type { ServerToClientEvents, ClientToServerEvents } from '../shared/types.js';
import { SessionManager } from './services/SessionManager.js';
import { GameEngine } from './services/GameEngine.js';
import { setupSocketEvents } from './socket/socketEvents.js';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Crear servidor HTTP
const server = createServer(app);

// Configurar Socket.IO
const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : true,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Servicios globales
const sessionManager = new SessionManager();
const gameEngine = new GameEngine();

// Configurar eventos de Socket.IO
setupSocketEvents(io, sessionManager, gameEngine);

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    activeSessions: sessionManager.getActiveSessionsCount(),
    connectedPlayers: sessionManager.getTotalPlayersCount()
  });
});

app.get('/api/session/:sessionId', (req, res) => {
  const session = sessionManager.getSession(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Sesión no encontrada' });
  }
  res.json(session);
});

export { app, server, io, PORT, sessionManager, gameEngine };
export default app;