import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import listingsRouter from './routes/listings';
import reservationsRouter from './routes/reservations';
import donationsRouter from './routes/donations';
import adminRouter from './routes/admin';
import aiRouter from './routes/ai';
import impactRouter from './routes/impact';
import usersRouter from './routes/users';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Configure CORS universally (allows localhost, 127.0.0.1, LAN IPs, Vercel & Render)
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Normalize repeated slashes in incoming URLs (e.g. //api/listings -> /api/listings)
app.use((req: Request, _res: Response, next: NextFunction) => {
  if (req.url.includes('//')) {
    req.url = req.url.replace(/\/+/g, '/');
  }
  next();
});

// Request logging in development
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'RiceShare Backend API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Mount Routes
app.use('/api/listings', listingsRouter);
app.use('/api/reservations', reservationsRouter);
app.use('/api/donation-requests', donationsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/ai', aiRouter);
app.use('/api/impact', impactRouter);
app.use('/api/users', usersRouter);

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`🍚 RiceShare Backend API running on port ${PORT}`);
  console.log(`Allowed Frontend Origin: ${FRONTEND_URL}`);
});

export default app;
