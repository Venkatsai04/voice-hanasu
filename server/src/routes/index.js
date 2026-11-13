import { Router } from 'express';
import authRoutes from './auth.js';
import agentRoutes from './agents.js';
import campaignRoutes from './campaigns.js';
import leadRoutes from './leads.js';
import callRoutes from './calls.js';
import analyticsRoutes from './analytics.js';
import integrationRoutes from './integrations.js';
import webhookRoutes from './webhooks.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/agents', agentRoutes);
router.use('/campaigns', campaignRoutes);
router.use('/leads', leadRoutes);
router.use('/calls', callRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/integrations', integrationRoutes);
router.use('/webhooks', webhookRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'Raw Sahara Voice SaaS',
    timestamp: new Date().toISOString()
  });
});

export default router;
