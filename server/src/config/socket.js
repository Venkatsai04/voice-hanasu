import { Server } from 'socket.io';
import { config } from './env.js';

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: [config.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join organization room for scoped events
    socket.on('join:org', (orgId) => {
      if (orgId) {
        socket.join(`org:${orgId}`);
        console.log(`[Socket.IO] Socket ${socket.id} joined org room: org:${orgId}`);
      }
    });

    // Join campaign room for live call feeds
    socket.on('join:campaign', (campaignId) => {
      if (campaignId) {
        socket.join(`campaign:${campaignId}`);
        console.log(`[Socket.IO] Socket ${socket.id} joined campaign room: campaign:${campaignId}`);
      }
    });

    socket.on('leave:campaign', (campaignId) => {
      if (campaignId) {
        socket.leave(`campaign:${campaignId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized yet!');
  }
  return io;
};

export const emitToOrg = (orgId, event, payload) => {
  if (io && orgId) {
    io.to(`org:${orgId}`).emit(event, payload);
  }
};

export const emitToCampaign = (campaignId, event, payload) => {
  if (io && campaignId) {
    io.to(`campaign:${campaignId}`).emit(event, payload);
  }
};
