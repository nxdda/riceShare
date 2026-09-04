import { Router, Request, Response } from 'express';
import { store } from '../lib/store';

const router = Router();

// GET /api/impact
router.get('/', (_req: Request, res: Response) => {
  try {
    const impact = store.getImpactStats();
    res.json({ success: true, data: impact });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve impact statistics' });
  }
});

export default router;
