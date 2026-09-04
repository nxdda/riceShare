import { PrismaClient } from '@prisma/client';
import { initialUsers, initialProviders, initialListings } from '../src/data/seedData';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding RiceShare PostgreSQL database...');

  // 1. Create Users
  for (const u of initialUsers) {
    await prisma.user.upsert({
      where: { clerkUserId: u.clerkUserId },
      update: {},
      create: {
        id: u.id,
        clerkUserId: u.clerkUserId,
        name: u.name,
        email: u.email,
        role: u.role,
      },
    });
  }

  // 2. Create Providers
  for (const p of initialProviders) {
    await prisma.provider.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        userId: p.userId,
        businessName: p.businessName,
        businessType: p.businessType,
        location: p.location,
      },
    });
  }

  // 3. Create Listings
  for (const l of initialListings) {
    await prisma.listing.upsert({
      where: { id: l.id },
      update: {},
      create: {
        id: l.id,
        providerId: l.providerId,
        foodName: l.foodName,
        category: l.category,
        quantity: l.quantity,
        quantityRemaining: l.quantityRemaining,
        originalPrice: l.originalPrice,
        sellingPrice: l.sellingPrice,
        listingType: l.listingType,
        location: l.location,
        pickupStart: new Date(l.pickupStart),
        pickupEnd: new Date(l.pickupEnd),
        description: l.description,
        status: l.status,
      },
    });
  }

  console.log('✅ RiceShare database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
