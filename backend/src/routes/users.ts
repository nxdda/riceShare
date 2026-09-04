import { Router, Request, Response } from 'express';
import { store } from '../lib/store';

const router = Router();

// POST /api/users/sync
router.post('/sync', (req: Request, res: Response) => {
  try {
    const { clerkUserId, name, email, role } = req.body;

    if (!clerkUserId) {
      return res.status(400).json({ success: false, message: 'Clerk User ID is required' });
    }

    const user = store.upsertUser(clerkUserId, name, email, role || 'CUSTOMER');
    let provider = store.getProviderByUserId(user.id);

    // If user is a provider and has no provider profile yet, create a default one
    if (user.role === 'PROVIDER' && !provider) {
      provider = store.createProvider(user.id, `${user.name}'s Kitchen`, 'Restaurant', 'Colombo', '+94 77 111 2222');
    }

    res.json({
      success: true,
      data: {
        user,
        provider,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to sync user' });
  }
});

// POST /api/users/switch-role (Convenient demo switch for testing roles)
router.post('/switch-role', (req: Request, res: Response) => {
  try {
    const { clerkUserId, role } = req.body;
    if (!['CUSTOMER', 'PROVIDER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    let user = store.getUserByClerkId(clerkUserId);
    if (!user) {
      user = store.upsertUser(clerkUserId, 'Demo User', 'demo@riceshare.lk', role);
    } else {
      user.role = role;
    }

    let provider = store.getProviderByUserId(user.id);
    if (role === 'PROVIDER' && !provider) {
      provider = store.createProvider(user.id, `${user.name}'s Kitchen`, 'Restaurant', 'Malabe', '+94 77 123 4567');
    }

    res.json({
      success: true,
      message: `Switched role to ${role}`,
      data: { user, provider },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to switch role' });
  }
});

export default router;
