import { Router } from 'express';
import { getCalls, getCallById, redialCall, dialCall } from '../controllers/callController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', getCalls);
router.post('/dial', dialCall);
router.get('/:id', getCallById);
router.post('/:id/redial', redialCall);

export default router;
