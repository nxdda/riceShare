import { Router, Request, Response } from 'express';
import { store, prisma } from '../lib/store';

const router = Router();

// POST /api/users/sync
router.post('/sync', (req: Request, res: Response) => {
  try {
    const { clerkUserId, name, email, role, phone, businessName, businessType } = req.body;

    if (!clerkUserId) {
      return res.status(400).json({ success: false, message: 'Clerk User ID is required' });
    }

    const user = store.upsertUser(clerkUserId, name, email, role || 'CUSTOMER', phone);
    let provider = store.getProviderByUserId(user.id);

    // If user is a provider and has no provider profile yet, create a default one
    if (user.role === 'PROVIDER' && !provider) {
      provider = store.createProvider(
        user.id,
        businessName || `${user.name}'s Kitchen`,
        businessType || 'Restaurant',
        'Colombo',
        phone || '+94 77 111 2222'
      );
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
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, role } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Check in-memory store
    const allUsers = store.getUsers();
    let user = allUsers.find(u => u.email.toLowerCase() === normalizedEmail);

    // 2. If not found in memory, query Neon PostgreSQL directly
    if (!user && prisma) {
      try {
        const dbUser = await prisma.user.findFirst({
          where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
        });
        if (dbUser) {
          user = {
            id: dbUser.id,
            clerkUserId: dbUser.clerkUserId,
            name: dbUser.name,
            email: dbUser.email,
            role: dbUser.role as any,
            createdAt: dbUser.createdAt.toISOString(),
          };
          (store as any).users.push(user);
        }
      } catch (dbErr: any) {
        console.warn('Prisma lookup failed on login:', dbErr.message);
      }
    }

    if (!user) {
      // If user does not exist yet, allow login for customer/provider with that role, or reject if admin
      if (role === 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Admin account not found. Only pre-configured administrators can sign in.',
        });
      }

      user = store.upsertUser(`user_email_${Date.now()}`, normalizedEmail.split('@')[0], normalizedEmail, role || 'CUSTOMER');
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

    let provider = store.getProviderByUserId(user.id);
    if (!provider && prisma) {
      try {
        const dbProv = await prisma.provider.findFirst({
          where: { userId: user.id },
        });
        if (dbProv) {
          provider = {
            id: dbProv.id,
            userId: dbProv.userId,
            businessName: dbProv.businessName,
            businessType: dbProv.businessType,
            location: dbProv.location,
            phone: '+94 77 111 2222',
            createdAt: dbProv.createdAt.toISOString(),
          };
          (store as any).providers.push(provider);
        }
      } catch (err: any) {
        // ignore
      }
    }

    // If role is PROVIDER and no provider profile exists, create a default one
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
