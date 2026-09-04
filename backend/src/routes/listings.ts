import { Router, Request, Response } from 'express';
import { store } from '../lib/store';

const router = Router();

// GET /api/listings
router.get('/', (req: Request, res: Response) => {
  try {
    const { search, location, category, listingType, status, providerId } = req.query;
    const listings = store.getListings({
      search: search as string,
      location: location as string,
      category: category as string,
      listingType: listingType as string,
      status: status as string,
      providerId: providerId as string,
    });
    res.json({ success: true, count: listings.length, data: listings });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve food listings' });
  }
});

// GET /api/listings/:id
router.get('/:id', (req: Request, res: Response) => {
  try {
    const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
    const listing = store.getListingById(id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }
    res.json({ success: true, data: listing });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve food listing' });
  }
});

// POST /api/listings
router.post('/', (req: Request, res: Response) => {
  try {
    const {
      providerId,
      foodName,
      category,
      quantity,
      originalPrice,
      sellingPrice,
      listingType,
      location,
      pickupStart,
      pickupEnd,
      description,
      providerName,
      imageUrl,
    } = req.body;

    // VALIDATION
    if (!foodName || typeof foodName !== 'string' || foodName.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Food name is required' });
    }
    if (!category || typeof category !== 'string') {
      return res.status(400).json({ success: false, message: 'Category is required' });
    }
    const parsedQty = parseInt(quantity, 10);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be a positive number greater than 0' });
    }
    if (!location || typeof location !== 'string' || location.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Location is required' });
    }
    if (!pickupStart || !pickupEnd) {
      return res.status(400).json({ success: false, message: 'Both pickup start and pickup end times are required' });
    }
    if (new Date(pickupEnd).getTime() <= new Date(pickupStart).getTime()) {
      return res.status(400).json({ success: false, message: 'Pickup end time must be after pickup start time' });
    }
    if (!description || description.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Description must be at least 10 characters' });
    }

    const type = listingType === 'DONATION' ? 'DONATION' : 'SALE';
    let origPrice = parseFloat(originalPrice) || 0;
    let sellPrice = parseFloat(sellingPrice) || 0;

    if (type === 'DONATION') {
      sellPrice = 0;
      origPrice = 0;
    } else {
      if (origPrice < 0 || sellPrice < 0) {
        return res.status(400).json({ success: false, message: 'Prices cannot be negative' });
      }
      if (sellPrice > origPrice) {
        return res.status(400).json({ success: false, message: 'Selling price cannot exceed original price' });
      }
    }

    const newListing = store.createListing({
      providerId: providerId || 'prov-abc',
      providerName: providerName || 'RiceShare Partner',
      foodName: foodName.trim(),
      category: category.trim(),
      quantity: parsedQty,
      originalPrice: origPrice,
      sellingPrice: sellPrice,
      listingType: type,
      location: location.trim(),
      pickupStart: new Date(pickupStart).toISOString(),
      pickupEnd: new Date(pickupEnd).toISOString(),
      description: description.trim(),
      imageUrl: imageUrl && typeof imageUrl === 'string' && imageUrl.trim().length > 0 ? imageUrl.trim() : undefined,
      status: 'AVAILABLE',
    });

    res.status(201).json({
      success: true,
      message: 'Food listing published successfully',
      data: newListing,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Internal server error while creating listing' });
  }
});

// PUT /api/listings/:id
router.put('/:id', (req: Request, res: Response) => {
  try {
    const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
    const existing = store.getListingById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    const updated = store.updateListing(id, req.body);
    res.json({ success: true, message: 'Listing updated successfully', data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update listing' });
  }
});

// DELETE /api/listings/:id
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
    const success = store.deleteListing(id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }
    res.json({ success: true, message: 'Listing removed successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to delete listing' });
  }
});

export default router;
