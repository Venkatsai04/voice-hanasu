import { Router } from 'express';
import { handleSarvamWebhook, handleExotelWebhook } from '../controllers/webhookController.js';

const router = Router();

// Sarvam AI Webhook ingestion
router.post('/sarvam', handleSarvamWebhook);

// Exotel Cloud Telephony StatusCallback webhook (supports both POST and GET callbacks)
router.post('/exotel', handleExotelWebhook);
router.get('/exotel', handleExotelWebhook);

export default router;

