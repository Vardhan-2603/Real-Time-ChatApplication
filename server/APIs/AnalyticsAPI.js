import express from 'express';
import analyticsController from '../controllers/analytics.js';

const router = express.Router();

// GET /analytics/summary/:userId
router.get('/summary/:userId', analyticsController.getSummary);

// GET /analytics/stats
router.get('/stats', analyticsController.getStats);

export { router as analyticsRoute };
export default router;
