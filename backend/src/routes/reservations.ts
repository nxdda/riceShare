import { Router, Request, Response } from 'express';
import { store } from '../lib/store';

const router = Router();

// GET /api/reservations
router.get('/', (req: Request, res: Response) => {
  try {
    const { userId, providerId } = req.query;
    const reservations = store.getReservations(userId as string, providerId as string);
    res.json({ success: true, count: reservations.length, data: reservations });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve reservations' });
  }
});

// POST /api/reservations
router.post('/', (req: Request, res: Response) => {
  try {
    const { listingId, userId, customerName, customerPhone, quantity } = req.body;

    if (!listingId) {
      return res.status(400).json({ success: false, message: 'Listing ID is required' });
    }
    if (!customerName || customerName.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Customer name is required' });
    }
    if (!customerPhone || customerPhone.trim().length < 9) {
      return res.status(400).json({ success: false, message: 'Valid phone number is required (e.g., +94 77 123 4567)' });
    }
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1 portion' });
    }

    const result = store.createReservation({
      listingId,
      userId,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      quantity: qty,
    });

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.error });
    }

    res.status(201).json({
      success: true,
      message: 'Reservation confirmed! Reserve & Pay at Pickup.',
      data: result.reservation,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Internal server error while reserving food' });
  }
});

// PUT /api/reservations/:id
router.put('/:id', (req: Request, res: Response) => {
  try {
    const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
    const { status } = req.body;
    if (!status || !['CONFIRMED', 'COLLECTED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const updated = store.updateReservationStatus(id, status);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }
    res.json({ success: true, message: `Reservation status updated to ${status}`, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update reservation' });
  }
});

export default router;
