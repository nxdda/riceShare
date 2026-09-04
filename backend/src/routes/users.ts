import { Router, Request, Response } from 'express';
import { store } from '../lib/store';

const router = Router();

// POST /api/users/sync
router.post('/sync', (req: Request, res: Response) => {
  try {
    const { clerkUserId, name, email, role, phone } = req.body;

    if (!clerkUserId) {
      return res.status(400).json({ success: false, message: 'Clerk User ID is required' });
    }

    const user = store.upsertUser(clerkUserId, name, email, role || 'CUSTOMER', phone);
    let provider = store.getProviderByUserId(user.id);

    // If user is a provider and has no provider profile yet, create a default one
    if (user.role === 'PROVIDER' && !provider) {
      provider = store.createProvider(user.id, `${user.name}'s Kitchen`, 'Restaurant', 'Colombo', phone || '+94 77 111 2222');
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

// POST /api/users/login (Authenticate by email & role)
router.post('/login', (req: Request, res: Response) => {
  try {
    const { email, role } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const allUsers = store.getUsers();
    let user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      // If user does not exist yet, allow login for customer/provider with that role, or reject if admin
      if (role === 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Admin account not found. Only pre-configured administrators can sign in.',
        });
      }

      user = store.upsertUser(`user_email_${Date.now()}`, email.split('@')[0], email, role || 'CUSTOMER');
    }

    // Role check
    if (role && user.role !== role) {
      // If trying to access admin with non-admin account
      if (role === 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: This account does not have Administrator privileges.',
        });
      }
      // Update role if switching or logging in as specified
      user.role = role;
    }

    const provider = store.getProviderByUserId(user.id);

    res.json({
      success: true,
      data: {
        user,
        provider,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Login failed' });
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
