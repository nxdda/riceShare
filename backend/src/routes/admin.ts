import { Router, Request, Response } from 'express';
import { store } from '../lib/store';

const router = Router();

// GET /api/admin/stats
router.get('/stats', (_req: Request, res: Response) => {
  try {
    const stats = store.getAdminStats();
    res.json({ success: true, data: stats });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to load admin statistics' });
  }
});

// GET /api/admin/users
router.get('/users', (_req: Request, res: Response) => {
  try {
    const users = store.getUsers();
    res.json({ success: true, count: users.length, data: users });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to load users' });
  }
});

// GET /api/admin/providers
router.get('/providers', (_req: Request, res: Response) => {
  try {
    const providers = store.getProviders();
    res.json({ success: true, count: providers.length, data: providers });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to load providers' });
  }
});

// GET /api/admin/listings
router.get('/listings', (_req: Request, res: Response) => {
  try {
    const listings = store.getAdminListings();
    res.json({ success: true, count: listings.length, data: listings });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to load listings' });
  }
});

// POST /api/admin/listings/:id/moderate
router.post('/listings/:id/moderate', (req: Request, res: Response) => {
  try {
    const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
    const { action } = req.body; // 'REMOVE' or 'RESTORE'
    const newStatus = action === 'REMOVE' ? 'CLOSED' : 'AVAILABLE';

    const updated = store.moderateListing(id, newStatus);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    res.json({
      success: true,
      message: action === 'REMOVE' ? 'Listing removed from marketplace' : 'Listing restored',
      data: updated,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to moderate listing' });
  }
});

export default router;
