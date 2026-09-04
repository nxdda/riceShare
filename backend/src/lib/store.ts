import { PrismaClient } from '@prisma/client';
import { initialUsers, initialProviders, initialListings, initialReservations, initialDonationRequests } from '../data/seedData';
import { Listing, Provider, User, Reservation, DonationRequest, Report, ListingStatus, ReservationStatus, DonationStatus } from '../types';

let prisma: PrismaClient | null = null;
let isPrismaConnected = false;

// Resilient store with transparent PostgreSQL persistence
class MemoryStore {
  private users: User[] = [...initialUsers];
  private providers: Provider[] = [...initialProviders];
  private listings: Listing[] = [...initialListings];
  private reservations: Reservation[] = [...initialReservations];
  private donationRequests: DonationRequest[] = [...initialDonationRequests];
  private reports: Report[] = [];

  constructor() {
    this.initPrisma();
  }

  async initPrisma() {
    if (process.env.DATABASE_URL) {
      try {
        prisma = new PrismaClient();
        await prisma.$connect();
        isPrismaConnected = true;
        console.log(' Connected to PostgreSQL database via Prisma.');
        await this.hydrateFromDatabase();
      } catch (err: any) {
        console.warn('⚠️ PostgreSQL database connection failed, falling back to in-memory store:', err.message);
        isPrismaConnected = false;
      }
    }
  }

  async hydrateFromDatabase() {
    if (!prisma) return;
    try {
      const dbUsers = await prisma.user.findMany();
      if (dbUsers.length > 0) {
        for (const u of dbUsers) {
          const idx = this.users.findIndex(x => x.clerkUserId === u.clerkUserId);
          if (idx === -1) {
            this.users.push({
              id: u.id,
              clerkUserId: u.clerkUserId,
              name: u.name,
              email: u.email,
              role: u.role,
              createdAt: u.createdAt.toISOString(),
            });
          } else {
            this.users[idx] = {
              ...this.users[idx],
              name: u.name,
              email: u.email,
              role: u.role,
            };
          }
        }
        console.log(`[Neon DB] Hydrated ${dbUsers.length} users from Neon PostgreSQL.`);
      }

      const dbProviders = await prisma.provider.findMany();
      if (dbProviders.length > 0) {
        for (const p of dbProviders) {
          const idx = this.providers.findIndex(x => x.id === p.id);
          if (idx === -1) {
            this.providers.push({
              id: p.id,
              userId: p.userId,
              businessName: p.businessName,
              businessType: p.businessType,
              location: p.location,
              phone: (p as any).phone || '+94 77 111 2222',
              createdAt: p.createdAt.toISOString(),
            });
          }
        }
        console.log(`[Neon DB] Hydrated ${dbProviders.length} providers from Neon PostgreSQL.`);
      }

      const dbListings = await prisma.listing.findMany();
      if (dbListings.length > 0) {
        for (const l of dbListings) {
          const idx = this.listings.findIndex(x => x.id === l.id);
          if (idx === -1) {
            const prov = this.providers.find(p => p.id === l.providerId);
            this.listings.push({
              id: l.id,
              providerId: l.providerId,
              providerName: prov?.businessName || 'RiceShare Partner',
              foodName: l.foodName,
              category: l.category,
              quantity: l.quantity,
              quantityRemaining: l.quantityRemaining,
              originalPrice: l.originalPrice,
              sellingPrice: l.sellingPrice,
              listingType: l.listingType,
              location: l.location,
              imageUrl: l.imageUrl || undefined,
              pickupStart: l.pickupStart.toISOString(),
              pickupEnd: l.pickupEnd.toISOString(),
              description: l.description,
              status: l.status,
              createdAt: l.createdAt.toISOString(),
              updatedAt: l.updatedAt.toISOString(),
            });
          }
        }
        console.log(`[Neon DB] Hydrated ${dbListings.length} listings from Neon PostgreSQL.`);
      }
    } catch (err: any) {
      console.error('[Neon DB] Failed to hydrate from PostgreSQL:', err.message);
    }
  }

  // USERS
  getUsers(): User[] {
    return [...this.users];
  }

  getUserByClerkId(clerkUserId: string): User | undefined {
    return this.users.find(u => u.clerkUserId === clerkUserId);
  }

  upsertUser(clerkUserId: string, name: string, email: string, role: 'CUSTOMER' | 'PROVIDER' | 'ADMIN' = 'CUSTOMER', phone?: string): User {
    let user = this.getUserByClerkId(clerkUserId);
    if (!user) {
      user = {
        id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        clerkUserId,
        name: name || 'RiceShare User',
        email: email || '',
        phone: phone || '',
        role,
        createdAt: new Date().toISOString(),
      };
      this.users.push(user);
    } else {
      user.name = name || user.name;
      user.email = email || user.email;
      if (phone) user.phone = phone;
      user.role = role;
    }

    // Persist to Neon PostgreSQL
    if (prisma) {
      prisma.user.upsert({
        where: { clerkUserId },
        update: {
          name: user.name,
          email: user.email,
          role: user.role,
        },
        create: {
          id: user.id,
          clerkUserId: user.clerkUserId,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      }).then(() => {
        console.log(`[Neon DB] Successfully persisted user: ${user.email} (${user.role})`);
      }).catch((dbErr) => {
        console.error('[Neon DB] Error persisting user to PostgreSQL:', dbErr.message);
      });
    }

    return user;
  }

  // PROVIDERS
  getProviders(): Provider[] {
    return [...this.providers];
  }

  getProviderByUserId(userId: string): Provider | undefined {
    return this.providers.find(p => p.userId === userId);
  }

  getProviderById(id: string): Provider | undefined {
    return this.providers.find(p => p.id === id);
  }

  createProvider(userId: string, businessName: string, businessType: string, location: string, phone: string): Provider {
    const provider: Provider = {
      id: `prov-${Date.now()}`,
      userId,
      businessName,
      businessType,
      location,
      phone,
      createdAt: new Date().toISOString(),
    };
    this.providers.push(provider);

    if (prisma) {
      prisma.provider.upsert({
        where: { id: provider.id },
        update: {
          businessName,
          businessType,
          location,
        },
        create: {
          id: provider.id,
          userId,
          businessName,
          businessType,
          location,
        },
      }).then(() => {
        console.log(`[Neon DB] Successfully persisted provider: ${businessName}`);
      }).catch((dbErr) => {
        console.error('[Neon DB] Error persisting provider to PostgreSQL:', dbErr.message);
      });
    }

    return provider;
  }

  // LISTINGS
  getListings(filters?: {
    search?: string;
    location?: string;
    category?: string;
    listingType?: string;
    status?: string;
    providerId?: string;
  }): Listing[] {
    let results = [...this.listings];

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(l => 
        l.foodName.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        (l.providerName && l.providerName.toLowerCase().includes(q))
      );
    }

    if (filters?.location && filters.location !== 'All') {
      const loc = filters.location.toLowerCase();
      results = results.filter(l => l.location.toLowerCase().includes(loc));
    }

    if (filters?.category && filters.category !== 'All') {
      results = results.filter(l => l.category.toLowerCase() === filters.category?.toLowerCase());
    }

    if (filters?.listingType && filters.listingType !== 'All') {
      results = results.filter(l => l.listingType === filters.listingType);
    }

    if (filters?.status && filters.status !== 'All') {
      results = results.filter(l => l.status === filters.status);
    }

    if (filters?.providerId) {
      const prov = this.getProviderById(filters.providerId) || this.getProviderByUserId(filters.providerId);
      const validProvIds = new Set<string>([filters.providerId]);
      if (prov) {
        validProvIds.add(prov.id);
        validProvIds.add(prov.userId);
      }
      results = results.filter(l => validProvIds.has(l.providerId));
    }

    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getListingById(id: string): Listing | undefined {
    return this.listings.find(l => l.id === id);
  }

  createListing(data: Omit<Listing, 'id' | 'createdAt' | 'updatedAt' | 'quantityRemaining'> & { quantityRemaining?: number }): Listing {
    const provider = this.getProviderById(data.providerId);
    const newListing: Listing = {
      id: `list-${Date.now()}`,
      ...data,
      providerName: data.providerName || provider?.businessName || 'RiceShare Partner',
      quantityRemaining: data.quantityRemaining ?? data.quantity,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.listings.unshift(newListing);

    if (prisma) {
      prisma.listing.create({
        data: {
          id: newListing.id,
          providerId: newListing.providerId,
          foodName: newListing.foodName,
          category: newListing.category,
          quantity: newListing.quantity,
          quantityRemaining: newListing.quantityRemaining,
          originalPrice: newListing.originalPrice,
          sellingPrice: newListing.sellingPrice,
          listingType: newListing.listingType as any,
          location: newListing.location,
          imageUrl: newListing.imageUrl,
          pickupStart: new Date(newListing.pickupStart),
          pickupEnd: new Date(newListing.pickupEnd),
          description: newListing.description,
          status: newListing.status as any,
        },
      }).then(() => {
        console.log(`[Neon DB] Successfully persisted listing: ${newListing.foodName}`);
      }).catch((dbErr) => {
        console.error('[Neon DB] Error persisting listing to PostgreSQL:', dbErr.message);
      });
    }

    return newListing;
  }

  updateListing(id: string, data: Partial<Listing>): Listing | null {
    const index = this.listings.findIndex(l => l.id === id);
    if (index === -1) return null;
    this.listings[index] = {
      ...this.listings[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return this.listings[index];
  }

  deleteListing(id: string): boolean {
    const index = this.listings.findIndex(l => l.id === id);
    if (index === -1) return false;
    this.listings.splice(index, 1);
    return true;
  }

  // RESERVATIONS
  getReservations(userId?: string, providerId?: string): Reservation[] {
    let list = [...this.reservations];
    if (userId) {
      list = list.filter(r => r.userId === userId);
    }
    if (providerId) {
      const prov = this.getProviderById(providerId) || this.getProviderByUserId(providerId);
      const validProvIds = new Set<string>([providerId]);
      if (prov) {
        validProvIds.add(prov.id);
        validProvIds.add(prov.userId);
      }
      const providerListings = new Set(this.listings.filter(l => validProvIds.has(l.providerId)).map(l => l.id));
      list = list.filter(r => providerListings.has(r.listingId));
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  createReservation(data: {
    listingId: string;
    userId?: string;
    customerName: string;
    customerPhone: string;
    quantity: number;
  }): { success: boolean; reservation?: Reservation; error?: string } {
    const listing = this.getListingById(data.listingId);
    if (!listing) {
      return { success: false, error: 'Listing not found' };
    }
    if (listing.status !== 'AVAILABLE') {
      return { success: false, error: 'This food listing is no longer available' };
    }
    if (listing.listingType !== 'SALE') {
      return { success: false, error: 'This listing is for donation, not sale reservation' };
    }
    if (data.quantity <= 0) {
      return { success: false, error: 'Quantity must be greater than zero' };
    }
    if (data.quantity > listing.quantityRemaining) {
      return { success: false, error: `Only ${listing.quantityRemaining} portion(s) remaining` };
    }

    // Atomic decrement
    listing.quantityRemaining -= data.quantity;
    if (listing.quantityRemaining === 0) {
      listing.status = 'SOLD_OUT';
    }
    listing.updatedAt = new Date().toISOString();

    const reservation: Reservation = {
      id: `res-${Date.now()}`,
      listingId: listing.id,
      foodName: listing.foodName,
      providerName: listing.providerName,
      location: listing.location,
      pickupEnd: listing.pickupEnd,
      userId: data.userId,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      quantity: data.quantity,
      totalAmount: data.quantity * listing.sellingPrice,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
    };

    this.reservations.unshift(reservation);
    return { success: true, reservation };
  }

  updateReservationStatus(id: string, status: ReservationStatus): Reservation | null {
    const res = this.reservations.find(r => r.id === id);
    if (!res) return null;
    res.status = status;
    return res;
  }

  // DONATION REQUESTS
  getDonationRequests(userId?: string, providerId?: string): DonationRequest[] {
    let list = [...this.donationRequests];
    if (userId) {
      list = list.filter(d => d.userId === userId);
    }
    if (providerId) {
      const prov = this.getProviderById(providerId) || this.getProviderByUserId(providerId);
      const validProvIds = new Set<string>([providerId]);
      if (prov) {
        validProvIds.add(prov.id);
        validProvIds.add(prov.userId);
      }
      const providerListings = new Set(this.listings.filter(l => validProvIds.has(l.providerId)).map(l => l.id));
      list = list.filter(d => providerListings.has(d.listingId));
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  createDonationRequest(data: {
    listingId: string;
    userId?: string;
    requesterName: string;
    organization?: string;
    phone: string;
    quantity: number;
    reason: string;
  }): { success: boolean; request?: DonationRequest; error?: string } {
    const listing = this.getListingById(data.listingId);
    if (!listing) {
      return { success: false, error: 'Listing not found' };
    }
    if (listing.status !== 'AVAILABLE') {
      return { success: false, error: 'This donation listing is no longer available' };
    }
    if (listing.listingType !== 'DONATION') {
      return { success: false, error: 'This listing is for sale, not donation request' };
    }
    if (data.quantity <= 0) {
      return { success: false, error: 'Quantity must be greater than zero' };
    }
    if (data.quantity > listing.quantityRemaining) {
      return { success: false, error: `Only ${listing.quantityRemaining} portion(s) available for donation` };
    }

    const req: DonationRequest = {
      id: `don-${Date.now()}`,
      listingId: listing.id,
      foodName: listing.foodName,
      providerName: listing.providerName,
      location: listing.location,
      userId: data.userId,
      requesterName: data.requesterName,
      organization: data.organization,
      phone: data.phone,
      quantity: data.quantity,
      reason: data.reason,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    this.donationRequests.unshift(req);
    return { success: true, request: req };
  }

  updateDonationStatus(id: string, status: DonationStatus): { success: boolean; request?: DonationRequest; error?: string } {
    const req = this.donationRequests.find(d => d.id === id);
    if (!req) return { success: false, error: 'Donation request not found' };

    const oldStatus = req.status;
    req.status = status;

    // When accepted, decrement available quantity
    if (status === 'ACCEPTED' && oldStatus !== 'ACCEPTED') {
      const listing = this.getListingById(req.listingId);
      if (listing) {
        listing.quantityRemaining = Math.max(0, listing.quantityRemaining - req.quantity);
        if (listing.quantityRemaining === 0) {
          listing.status = 'SOLD_OUT';
        }
        listing.updatedAt = new Date().toISOString();
      }
    }

    return { success: true, request: req };
  }

  // ADMIN
  getAdminStats() {
    const totalUsers = this.users.length;
    const totalProviders = this.providers.length;
    const activeListings = this.listings.filter(l => l.status === 'AVAILABLE').length;
    const totalReservations = this.reservations.length;
    const totalDonations = this.donationRequests.filter(d => d.status === 'ACCEPTED').length;
    
    // Impact calculations
    const reservedPortions = this.reservations
      .filter(r => r.status !== 'CANCELLED')
      .reduce((sum, r) => sum + r.quantity, 0);
    const donatedPortions = this.donationRequests
      .filter(d => d.status === 'ACCEPTED')
      .reduce((sum, d) => sum + d.quantity, 0);
    const mealsRescued = reservedPortions + donatedPortions;

    const moneySaved = this.reservations
      .filter(r => r.status !== 'CANCELLED')
      .reduce((sum, r) => {
        const listing = this.getListingById(r.listingId);
        const original = listing?.originalPrice || 0;
        const selling = listing?.sellingPrice || 0;
        return sum + (original - selling) * r.quantity;
      }, 0);

    return {
      totalUsers,
      totalProviders,
      activeListings,
      totalReservations,
      totalDonations,
      mealsRescued,
      moneySaved: Math.round(moneySaved),
    };
  }

  getAdminListings(): Listing[] {
    return [...this.listings];
  }

  moderateListing(id: string, status: ListingStatus): Listing | null {
    return this.updateListing(id, { status });
  }

  // IMPACT
  getImpactStats() {
    const stats = this.getAdminStats();
    return {
      mealsRescued: stats.mealsRescued + 1450, // Base impact plus live platform data
      mealsDonated: (this.donationRequests.filter(d => d.status === 'ACCEPTED').reduce((s, d) => s + d.quantity, 0)) + 620,
      moneySavedLKR: stats.moneySaved + 285400,
      foodProviders: stats.totalProviders + 38,
    };
  }
}

export const store = new MemoryStore();
export { prisma, isPrismaConnected };
