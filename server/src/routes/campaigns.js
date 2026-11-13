import { Router } from 'express';
import {
  getCampaigns,
  getCampaignById,
  createCampaign,
  launchCampaign,
  pauseCampaign,
  resumeCampaign,
  stopCampaign
} from '../controllers/campaignController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', getCampaigns);
router.post('/', createCampaign);
router.get('/:id', getCampaignById);
router.post('/:id/launch', launchCampaign);
router.post('/:id/pause', pauseCampaign);
router.post('/:id/resume', resumeCampaign);
router.post('/:id/stop', stopCampaign);

export default router;
