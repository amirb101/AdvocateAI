import express from 'express';
import { checkQuota } from '../services/quotaService.js';

const router = express.Router();

router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const quota = await checkQuota(userId);
    
    res.json({
      success: true,
      quota
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;

