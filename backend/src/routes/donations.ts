import { Router, Request, Response } from 'express';
import { store } from '../lib/store';

const router = Router();

// GET /api/donation-requests
router.get('/', (req: Request, res: Response) => {
  try {
    const { userId, providerId } = req.query;
    const requests = store.getDonationRequests(userId as string, providerId as string);
    res.json({ success: true, count: requests.length, data: requests });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve donation requests' });
  }
});

// POST /api/donation-requests
router.post('/', (req: Request, res: Response) => {
  try {
    const { listingId, userId, requesterName, organization, phone, quantity, reason } = req.body;

    if (!listingId) {
      return res.status(400).json({ success: false, message: 'Listing ID is required' });
    }
    if (!requesterName || requesterName.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Requester name is required' });
    }
    if (!phone || phone.trim().length < 9) {
      return res.status(400).json({ success: false, message: 'Valid phone number is required' });
    }
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be greater than zero' });
    }
    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Please provide a clear reason or beneficiary details (at least 10 characters)' });
    }

    const result = store.createDonationRequest({
      listingId,
      userId,
      requesterName: requesterName.trim(),
      organization: organization ? organization.trim() : undefined,
      phone: phone.trim(),
      quantity: qty,
      reason: reason.trim(),
    });

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.error });
    }

    res.status(201).json({
      success: true,
      message: 'Donation request submitted successfully. The provider will review your request.',
      data: result.request,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Internal server error while requesting donation' });
  }
});

// PUT /api/donation-requests/:id
router.put('/:id', (req: Request, res: Response) => {
  try {
    const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
    const { status } = req.body;

    if (!status || !['PENDING', 'ACCEPTED', 'REJECTED', 'COLLECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const result = store.updateDonationStatus(id, status);
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.error });
    }

    res.json({
      success: true,
      message: `Donation request marked as ${status}`,
      data: result.request,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update donation request' });
  }
});

export default router;
