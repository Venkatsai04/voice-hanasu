import { Router } from 'express';
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  previewCsvLeads,
  bulkImportLeads
} from '../controllers/leadController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', getLeads);
router.post('/', createLead);
router.post('/preview-csv', previewCsvLeads);
router.post('/bulk-import', bulkImportLeads);
router.get('/:id', getLeadById);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);

export default router;
