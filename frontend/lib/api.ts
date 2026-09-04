export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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
  listingType: 'SALE' | 'DONATION';
  location: string;
  pickupStart: string;
  pickupEnd: string;
  description: string;
  status: 'AVAILABLE' | 'SOLD_OUT' | 'ENDING_SOON' | 'CLOSED';
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
  status: 'CONFIRMED' | 'COLLECTED' | 'CANCELLED';
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
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COLLECTED';
  createdAt: string;
}

export interface ImpactStats {
  mealsRescued: number;
  mealsDonated: number;
  moneySavedLKR: number;
  foodProviders: number;
}

export interface AdminStats {
  totalUsers: number;
  totalProviders: number;
  activeListings: number;
  totalReservations: number;
  totalDonations: number;
  mealsRescued: number;
  moneySaved: number;
}

// Helper fetcher with error handling
async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
      cache: 'no-store',
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }
    return data;
  } catch (err: any) {
    console.error(`API Error on ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  // Listings
  getListings: async (params?: Record<string, string>): Promise<{ success: boolean; count: number; data: Listing[] }> => {
    const searchParams = new URLSearchParams(params || {});
    return fetchJson(`/api/listings?${searchParams.toString()}`);
  },

  getListingById: async (id: string): Promise<{ success: boolean; data: Listing }> => {
    return fetchJson(`/api/listings/${id}`);
  },

  createListing: async (payload: any): Promise<{ success: boolean; message: string; data: Listing }> => {
    return fetchJson('/api/listings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateListing: async (id: string, payload: any): Promise<{ success: boolean; data: Listing }> => {
    return fetchJson(`/api/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  deleteListing: async (id: string): Promise<{ success: boolean; message: string }> => {
    return fetchJson(`/api/listings/${id}`, {
      method: 'DELETE',
    });
  },

  // Reservations
  getReservations: async (params?: { userId?: string; providerId?: string }): Promise<{ success: boolean; data: Reservation[] }> => {
    const searchParams = new URLSearchParams(params as Record<string, string> || {});
    return fetchJson(`/api/reservations?${searchParams.toString()}`);
  },

  createReservation: async (payload: {
    listingId: string;
    userId?: string;
    customerName: string;
    customerPhone: string;
    quantity: number;
  }): Promise<{ success: boolean; message: string; data: Reservation }> => {
    return fetchJson('/api/reservations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateReservation: async (id: string, status: string): Promise<{ success: boolean; data: Reservation }> => {
    return fetchJson(`/api/reservations/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Donations
  getDonationRequests: async (params?: { userId?: string; providerId?: string }): Promise<{ success: boolean; data: DonationRequest[] }> => {
    const searchParams = new URLSearchParams(params as Record<string, string> || {});
    return fetchJson(`/api/donation-requests?${searchParams.toString()}`);
  },

  createDonationRequest: async (payload: {
    listingId: string;
    userId?: string;
    requesterName: string;
    organization?: string;
    phone: string;
    quantity: number;
    reason: string;
  }): Promise<{ success: boolean; message: string; data: DonationRequest }> => {
    return fetchJson('/api/donation-requests', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateDonationRequest: async (id: string, status: string): Promise<{ success: boolean; data: DonationRequest }> => {
    return fetchJson(`/api/donation-requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Impact
  getImpact: async (): Promise<{ success: boolean; data: ImpactStats }> => {
    return fetchJson('/api/impact');
  },

  // Admin
  getAdminStats: async (): Promise<{ success: boolean; data: AdminStats }> => {
    return fetchJson('/api/admin/stats');
  },

  getAdminListings: async (): Promise<{ success: boolean; data: Listing[] }> => {
    return fetchJson('/api/admin/listings');
  },

  getAdminUsers: async (): Promise<{ success: boolean; data: any[] }> => {
    return fetchJson('/api/admin/users');
  },

  moderateListing: async (id: string, action: 'REMOVE' | 'RESTORE'): Promise<{ success: boolean; data: Listing }> => {
    return fetchJson(`/api/admin/listings/${id}/moderate`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  },

  // AI Chatbot
  askAi: async (message: string, history?: Array<{ role: 'user' | 'model'; parts: string }>): Promise<{ success: boolean; message: string }> => {
    return fetchJson('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    });
  },

  // User Sync, Login & Role Switcher
  syncUser: async (payload: { clerkUserId: string; name: string; email: string; role?: string; phone?: string }): Promise<any> => {
    return fetchJson('/api/users/sync', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  loginUser: async (payload: { email: string; role?: string }): Promise<any> => {
    return fetchJson('/api/users/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  switchRole: async (clerkUserId: string, role: string): Promise<any> => {
    return fetchJson('/api/users/switch-role', {
      method: 'POST',
      body: JSON.stringify({ clerkUserId, role }),
    });
  },
};
