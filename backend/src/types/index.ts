export type Role = 'CUSTOMER' | 'PROVIDER' | 'ADMIN';
export type ListingType = 'SALE' | 'DONATION';
export type ListingStatus = 'AVAILABLE' | 'SOLD_OUT' | 'ENDING_SOON' | 'CLOSED';
export type ReservationStatus = 'CONFIRMED' | 'COLLECTED' | 'CANCELLED';
export type DonationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COLLECTED';
export type ReportStatus = 'PENDING' | 'RESOLVED';

export interface User {
  id: string;
  clerkUserId: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface Provider {
  id: string;
  userId: string;
  businessName: string;
  businessType: string;
  location: string;
  phone?: string;
  createdAt: string;
}

export interface Listing {
  id: string;
  providerId: string;
  providerName?: string;
  foodName: string;
  category: string;
  quantity: number;
  quantityRemaining: number;
  originalPrice: number;
  sellingPrice: number;
  listingType: ListingType;
  location: string;
  pickupStart: string;
  pickupEnd: string;
  description: string;
  status: ListingStatus;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reservation {
  id: string;
  listingId: string;
  foodName?: string;
  providerName?: string;
  location?: string;
  pickupEnd?: string;
  userId?: string;
  customerName: string;
  customerPhone: string;
  quantity: number;
  totalAmount: number;
  status: ReservationStatus;
  createdAt: string;
}

export interface DonationRequest {
  id: string;
  listingId: string;
  foodName?: string;
  providerName?: string;
  location?: string;
  userId?: string;
  requesterName: string;
  organization?: string;
  phone: string;
  quantity: number;
  reason: string;
  status: DonationStatus;
  createdAt: string;
}

export interface Report {
  id: string;
  listingId: string;
  reportedBy: string;
  reason: string;
  description: string;
  status: ReportStatus;
  createdAt: string;
}
