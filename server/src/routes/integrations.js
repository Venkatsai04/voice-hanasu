import { Router } from 'express';
import {
  getIntegrationSettings,
  updateIntegrationSettings,
  testProviderConnection
} from '../controllers/integrationController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', getIntegrationSettings);
router.put('/', updateIntegrationSettings);
router.post('/test-connection', testProviderConnection);

export default router;
