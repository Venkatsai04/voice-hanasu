import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';
import { initSocket } from './config/socket.js';
import { initCampaignQueue } from './queues/campaignQueue.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const server = http.createServer(app);

// Security & Middleware
app.use(helmet({
  crossOriginResourcePolicy: false
}));

app.use(cors({
  origin: [config.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-sarvam-signature', 'x-webhook-signature', 'x-event-id']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (config.env === 'development') {
  app.use(morgan('dev'));
}

// Mount REST API
app.use('/api', apiRouter);

// Centralized error handler
app.use(errorHandler);

// Bootstrap backend services
const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Initialize Real-Time WebSockets
    initSocket(server);

    // 3. Initialize Background Campaign Queue & Worker
    initCampaignQueue();

    // 4. Start listening
    server.listen(config.port, () => {
      console.log('====================================================');
      console.log(`🚀 Raw Sahara Voice API running on port ${config.port}`);
      console.log(`🌐 Mode: ${config.env.toUpperCase()}`);
      console.log(`🎙️ Voice Provider: ${config.voiceProvider.toUpperCase()} (Mock: ${config.mockVoiceProvider})`);
      console.log(`🔗 API Base: http://localhost:${config.port}/api`);
      console.log('====================================================');
    });
  } catch (err) {
    console.error('Fatal startup error:', err);
    process.exit(1);
  }
};

startServer();
