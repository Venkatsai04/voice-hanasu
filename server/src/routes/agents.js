import { Router } from 'express';
import {
  getAgents,
  getAgentById,
  generateConfigFromPrompt,
  createAgent,
  updateAgent,
  deleteAgent,
  testCall,
  converse
} from '../controllers/agentController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', getAgents);
router.post('/generate-config', generateConfigFromPrompt);
router.post('/', createAgent);
router.get('/:id', getAgentById);
router.put('/:id', updateAgent);
router.delete('/:id', deleteAgent);
router.post('/:id/test-call', testCall);
router.post('/:id/converse', converse);

export default router;

