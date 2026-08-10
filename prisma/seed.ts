import {
  PrismaClient,
  Role,
  Plan,
  Condition,
  BodyType,
  Transmission,
  FuelType,
  ListingStatus,
  SubscriptionStatus,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Nyasacars database...');

  // Clean existing records
  await prisma.inquiry.deleteMany();
  await prisma.adCreditTransaction.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.carListing.deleteMany();
  await prisma.seller.deleteMany();
  await prisma.user.deleteMany();

  const defaultPassword = await bcrypt.hash('Password123!', 10);

  // 1. Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@nyasacars.mw',
      name: 'Nyasacars Administrator',
      password: defaultPassword,
      role: Role.ADMIN,
      phone: '+265999123456',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400',
    },
  });
  console.log('Created Admin user:', adminUser.email);

  // 2. Seller 1 (FREE Plan)
  const sellerUser1 = await prisma.user.create({
    data: {
      email: 'chisomo@bandamotors.mw',
      name: 'Chisomo Banda',
      password: defaultPassword,
      role: Role.SELLER,
      phone: '+265888234567',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400',
    },
  });

  const seller1 = await prisma.seller.create({
    data: {
      userId: sellerUser1.id,
      shopName: 'Banda Motors Blantyre',
      shopSlug: 'banda-motors-blantyre',
      shopDescription: 'Your trusted partner for quality pre-owned Japanese imports and local vehicles in Blantyre.',
      logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?q=80&w=300',
      coverImage: 'https://images.unsplash.com/photo-1562519819-016930ada31b?q=80&w=1200',
      isVerified: false,
      plan: Plan.FREE,
      adCredits: 0,
    },
  });

  await prisma.subscription.create({
    data: {
      sellerId: seller1.id,
      userId: sellerUser1.id,
      plan: Plan.FREE,
      status: SubscriptionStatus.ACTIVE,
    },
  });
  console.log('Created Seller 1 (FREE):', seller1.shopName);

  // 3. Seller 2 (PRO Plan)
  const sellerUser2 = await prisma.user.create({
    data: {
      email: 'kondwani@phiriauto.mw',
      name: 'Kondwani Phiri',
      password: defaultPassword,
      role: Role.SELLER,
      phone: '+265999654321',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400',
    },
  });

  const seller2 = await prisma.seller.create({
    data: {
      userId: sellerUser2.id,
      shopName: 'Phiri Auto Imports',
      shopSlug: 'phiri-auto-imports',
      shopDescription: 'Premier direct importer of high-grade European and Japanese luxury sedans and SUVs in Lilongwe.',
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300',
      coverImage: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200',
      isVerified: true,
      plan: Plan.PRO,
      adCredits: 10,
    },
  });

  await prisma.subscription.create({
    data: {
      sellerId: seller2.id,
      userId: sellerUser2.id,
      plan: Plan.PRO,
      status: SubscriptionStatus.ACTIVE,
      stripeCustomerId: 'cus_sample123',
      stripeSubscriptionId: 'sub_sample456',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
  console.log('Created Seller 2 (PRO):', seller2.shopName);

  // 4. Car Listings (~6 cars)
  const carListings = [
    {
      sellerId: seller1.id,
      userId: sellerUser1.id,
      title: '2018 Toyota Hilux Double Cab 2.8 D-4D 4x4',
      make: 'Toyota',
      model: 'Hilux',
      year: 2018,
      price: 38500000, // 38.5M MWK
      currency: 'MWK',
      condition: Condition.USED,
      bodyType: BodyType.PICKUP,
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.DIESEL,
      mileage: 72000,
      color: 'Silver Metallic',
      engineSize: '2.8L Diesel',
      features: ['4WD', 'Leather Seats', 'Reverse Camera', 'Tow Bar', 'Bluetooth', 'Airbags', 'Canopy'],
      description: 'Exceptionally clean 2018 Toyota Hilux Double Cab. Full service history with Toyota Malawi. Excellent off-road performance and heavy-duty reliability.',
      images: [
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800',
      ],
      status: ListingStatus.ACTIVE,
      isFeatured: true,
      featuredUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      views: 245,
    },
    {
      sellerId: seller1.id,
      userId: sellerUser1.id,
      title: '2015 Honda Fit Hybrid 1.5L L15B',
      make: 'Honda',
      model: 'Fit',
      year: 2015,
      price: 8800000, // 8.8M MWK
      currency: 'MWK',
      condition: Condition.USED,
      bodyType: BodyType.HATCHBACK,
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.HYBRID,
      mileage: 65000,
      color: 'Pearl White',
      engineSize: '1.5L Hybrid',
      features: ['Fuel Efficient', 'Keyless Push Start', 'Air Conditioning', 'Power Steering', 'ABS'],
      description: 'Super economical Honda Fit Hybrid. Fresh Japan import with clear auction grade 4. Duty fully paid, ready to drive off.',
      images: [
        'https://images.unsplash.com/photo-1590362891991-f776e747a588?q=80&w=800',
      ],
      status: ListingStatus.ACTIVE,
      isFeatured: false,
      views: 132,
    },
    {
      sellerId: seller2.id,
      userId: sellerUser2.id,
      title: '2019 Mazda CX-5 2.2 SkyActiv-D AWD',
      make: 'Mazda',
      model: 'CX-5',
      year: 2019,
      price: 24000000, // 24M MWK
      currency: 'MWK',
      condition: Condition.CERTIFIED_PRE_OWNED,
      bodyType: BodyType.SUV,
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.DIESEL,
      mileage: 48000,
      color: 'Soul Red Crystal',
      engineSize: '2.2L Twin Turbo Diesel',
      features: ['AWD', 'Bose Surround System', 'Head-Up Display', 'Sunroof', 'Adaptive Cruise Control', 'Lane Assist'],
      description: 'Mint condition Mazda CX-5 in head-turning Soul Red Crystal metallic. Fully inspected, genuine mileage, top trim level.',
      images: [
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800',
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800',
      ],
      status: ListingStatus.ACTIVE,
      isFeatured: true,
      featuredUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      views: 380,
    },
    {
      sellerId: seller2.id,
      userId: sellerUser2.id,
      title: '2017 BMW 3 Series 320i M Sport (F30)',
      make: 'BMW',
      model: '3 Series',
      year: 2017,
      price: 29000000, // 29M MWK
      currency: 'MWK',
      condition: Condition.USED,
      bodyType: BodyType.SEDAN,
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.PETROL,
      mileage: 58000,
      color: 'Estoril Blue',
      engineSize: '2.0L TwinPower Turbo',
      features: ['M Sport Package', 'Dakota Leather', 'iDrive Professional Navigation', '18" M Alloy Wheels', 'LED Headlights'],
      description: 'Aggressive styling with smooth performance. 2017 BMW 320i M Sport with low mileage and complete dealer records.',
      images: [
        'https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=800',
      ],
      status: ListingStatus.ACTIVE,
      isFeatured: false,
      views: 210,
    },
    {
      sellerId: seller2.id,
      userId: sellerUser2.id,
      title: '2016 Nissan X-Trail 2.0 20X 4WD 7-Seater',
      make: 'Nissan',
      model: 'X-Trail',
      year: 2016,
      price: 18500000, // 18.5M MWK
      currency: 'MWK',
      condition: Condition.USED,
      bodyType: BodyType.SUV,
      transmission: Transmission.CVT,
      fuelType: FuelType.PETROL,
      mileage: 82000,
      color: 'Diamond Black',
      engineSize: '2.0L Petrol',
      features: ['7 Seater', 'Panoramic Sunroof', '360 Around View Monitor', 'Selectable 4WD', 'Roof Rails'],
      description: 'Ideal family crossover with 7 seats and switchable 4WD for pitch-perfect traction on all road surfaces in Malawi.',
      images: [
        'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=800',
      ],
      status: ListingStatus.ACTIVE,
      isFeatured: false,
      views: 165,
    },
    {
      sellerId: seller1.id,
      userId: sellerUser1.id,
      title: '2021 Ford Ranger Wildtrak 3.2 TDCi 4x4',
      make: 'Ford',
      model: 'Ranger',
      year: 2021,
      price: 45000000, // 45M MWK
      currency: 'MWK',
      condition: Condition.USED,
      bodyType: BodyType.PICKUP,
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.DIESEL,
      mileage: 35000,
      color: 'Pride Orange',
      engineSize: '3.2L Turbo Diesel',
      features: ['Wildtrak Package', 'SYNC 3 Touchscreen', 'Roller Shutter', 'Differential Lock', 'Tow Bar', 'Leather Interior'],
      description: 'High-spec 2021 Ford Ranger Wildtrak 3.2L. Low mileage, single local owner, immaculate condition throughout.',
      images: [
        'https://images.unsplash.com/photo-1559416523-140ddc3d238c?q=80&w=800',
      ],
      status: ListingStatus.ACTIVE,
      isFeatured: false,
      views: 412,
    },
  ];

  for (const listingData of carListings) {
    const listing = await prisma.carListing.create({
      data: listingData,
    });

    // Sample Inquiry on Toyota Hilux
    if (listing.make === 'Toyota') {
      await prisma.inquiry.create({
        data: {
          carListingId: listing.id,
          buyerName: 'Blessings Mvula',
          buyerEmail: 'blessings@gmail.com',
          buyerPhone: '+265999887766',
          message: 'Hello, is this Hilux still available for viewing in Blantyre this weekend?',
          status: 'NEW',
        },
      });
    }
  }

  console.log(`Successfully seeded ${carListings.length} car listings and sample inquiry.`);
  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
