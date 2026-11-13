import { Router } from 'express';
import { getDashboardAnalytics } from '../controllers/analyticsController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/dashboard', getDashboardAnalytics);

export default router;
