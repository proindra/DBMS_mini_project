import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/db";
import { indexProductEmbeddings } from "../src/lib/vector-search/service";

async function main() {
  await prisma.$transaction(async (tx) => {
    const categoryData = [
      { name: "Audio", description: "Headphones, speakers, and sound accessories." },
      { name: "Accessories", description: "Desk, lighting, and daily-use essentials." },
      { name: "Home Office", description: "Products built for efficient workspaces." },
      { name: "Gaming", description: "Performance gear and entertainment tools." },
      { name: "Kitchen", description: "Useful appliances and tools for cooking and food preparation." },
      { name: "Fitness", description: "Exercise equipment and accessories for home workouts." },
      { name: "Travel", description: "Practical luggage and accessories for comfortable trips." },
      { name: "Smart Home", description: "Connected devices for home security, lighting, and convenience." },
      { name: "Photography", description: "Cameras and accessories for capturing photos and video." },
      { name: "Outdoor", description: "Durable equipment for camping, hiking, and outdoor recreation." },
      { name: "Personal Care", description: "Everyday grooming and personal wellness products." },
      { name: "Pet Supplies", description: "Comfort, feeding, and activity essentials for pets." },
      { name: "Automotive", description: "Useful accessories for cars and everyday driving." },
      { name: "Kids and Learning", description: "Creative toys and learning tools for children." },
    ];
    const categories = await Promise.all(
      categoryData.map((category) =>
        tx.category.upsert({
          where: { name: category.name },
          create: category,
          update: { description: category.description },
        }),
      ),
    );

    const categoryMap = new Map(categories.map((category) => [category.name, category.id]));

    const products = [
      {
        name: "Nimbus Wireless Headphones",
        slug: "nimbus-wireless-headphones",
        description: "Comfortable over-ear headphones with noise reduction and all-day battery life.",
        sku: "AUD-1001",
        price: 179.99,
        stock: 18,
        categoryName: "Audio",
      },
      {
        name: "Orbit USB-C Dock",
        slug: "orbit-usb-c-dock",
        description: "A compact workstation dock with dual display support, charging, and USB hubs.",
        sku: "ACC-2001",
        price: 129.5,
        stock: 25,
        categoryName: "Accessories",
      },
      {
        name: "Luma Desk Lamp",
        slug: "luma-desk-lamp",
        description: "Minimal LED desk lamp with adjustable brightness and warm-to-cool modes.",
        sku: "OFF-3001",
        price: 64.0,
        stock: 31,
        categoryName: "Home Office",
      },
      {
        name: "Pulse Gaming Mouse",
        slug: "pulse-gaming-mouse",
        description: "Responsive wireless mouse tuned for quick reactions and precision aiming.",
        sku: "GAM-4001",
        price: 89.99,
        stock: 14,
        categoryName: "Gaming",
      },
      {
        name: "Terra Mechanical Keyboard",
        slug: "terra-mechanical-keyboard",
        description: "Hot-swappable mechanical keyboard for typing, productivity, and gaming.",
        sku: "OFF-3002",
        price: 149.0,
        stock: 22,
        categoryName: "Home Office",
      },
      {
        name: "Echo Mini Speaker",
        slug: "echo-mini-speaker",
        description: "Pocket-sized speaker with balanced sound and deep bass for small rooms.",
        sku: "AUD-1002",
        price: 48.75,
        stock: 40,
        categoryName: "Audio",
      },
      {
        name: "BrewMate Coffee Maker",
        slug: "brewmate-coffee-maker",
        description: "Programmable drip coffee maker with a reusable filter and thermal carafe for fresh coffee at home.",
        sku: "KIT-5001",
        price: 5499,
        stock: 16,
        categoryName: "Kitchen",
      },
      {
        name: "SwiftChop Food Processor",
        slug: "swiftchop-food-processor",
        description: "Compact food processor for quickly chopping vegetables, mixing sauces, and preparing everyday meals.",
        sku: "KIT-5002",
        price: 3799,
        stock: 21,
        categoryName: "Kitchen",
      },
      {
        name: "PurePour Water Filter",
        slug: "purepour-water-filter",
        description: "Countertop water purifier with a replaceable filter that improves drinking water taste for the whole family.",
        sku: "KIT-5003",
        price: 2299,
        stock: 28,
        categoryName: "Kitchen",
      },
      {
        name: "StrideFit Yoga Mat",
        slug: "stridefit-yoga-mat",
        description: "Non-slip cushioned yoga mat for stretching, meditation, pilates, and comfortable home workouts.",
        sku: "FIT-6001",
        price: 1299,
        stock: 34,
        categoryName: "Fitness",
      },
      {
        name: "FlexBand Resistance Set",
        slug: "flexband-resistance-set",
        description: "A set of color-coded resistance bands with handles for strength training and portable full-body exercise.",
        sku: "FIT-6002",
        price: 899,
        stock: 42,
        categoryName: "Fitness",
      },
      {
        name: "PulseTrack Fitness Watch",
        slug: "pulsetrack-fitness-watch",
        description: "Lightweight fitness tracker that monitors steps, heart rate, sleep, and daily activity during exercise.",
        sku: "FIT-6003",
        price: 3499,
        stock: 19,
        categoryName: "Fitness",
      },
      {
        name: "RoamLite Carry-On Suitcase",
        slug: "roamlite-carry-on-suitcase",
        description: "Hard-shell cabin suitcase with smooth spinner wheels, organized compartments, and a secure travel lock.",
        sku: "TRV-7001",
        price: 6299,
        stock: 13,
        categoryName: "Travel",
      },
      {
        name: "CloudRest Travel Pillow",
        slug: "cloudrest-travel-pillow",
        description: "Supportive memory foam neck pillow with a washable cover for sleeping comfortably on long flights and road trips.",
        sku: "TRV-7002",
        price: 999,
        stock: 37,
        categoryName: "Travel",
      },
      {
        name: "TrailPack Day Backpack",
        slug: "trailpack-day-backpack",
        description: "Water-resistant everyday backpack with a padded laptop sleeve and roomy pockets for commuting or weekend travel.",
        sku: "TRV-7003",
        price: 2799,
        stock: 24,
        categoryName: "Travel",
      },
      {
        name: "Haven Smart Speaker",
        slug: "haven-smart-speaker",
        description: "Voice-controlled wireless speaker for playing music, setting timers, and managing compatible smart home devices.",
        sku: "SMH-8001",
        price: 4199,
        stock: 17,
        categoryName: "Smart Home",
      },
      {
        name: "GlowSync Smart Bulb Kit",
        slug: "glowsync-smart-bulb-kit",
        description: "App-controlled color LED bulbs with adjustable brightness, schedules, and warm light for relaxing evenings.",
        sku: "SMH-8002",
        price: 1599,
        stock: 32,
        categoryName: "Smart Home",
      },
      {
        name: "SecureNest Video Doorbell",
        slug: "securenest-video-doorbell",
        description: "Wi-Fi video doorbell with motion alerts and two-way audio to see and speak with visitors from your phone.",
        sku: "SMH-8003",
        price: 5899,
        stock: 11,
        categoryName: "Smart Home",
      },
      {
        name: "FocusPoint Mirrorless Camera",
        slug: "focuspoint-mirrorless-camera",
        description: "Compact mirrorless camera with a sharp sensor and interchangeable lens support for travel and family photography.",
        sku: "PHO-9001",
        price: 52999,
        stock: 7,
        categoryName: "Photography",
      },
      {
        name: "SteadyShot Tripod",
        slug: "steadyshot-tripod",
        description: "Adjustable lightweight tripod with a phone mount for stable landscape photos, video calls, and content recording.",
        sku: "PHO-9002",
        price: 1899,
        stock: 26,
        categoryName: "Photography",
      },
      {
        name: "ClipOn Camera Microphone",
        slug: "clipon-camera-microphone",
        description: "Compact directional microphone that captures clearer speech for interviews, vlogs, and outdoor video recording.",
        sku: "PHO-9003",
        price: 2499,
        stock: 15,
        categoryName: "Photography",
      },
      {
        name: "SummitTrail Camping Tent",
        slug: "summittrail-camping-tent",
        description: "Weather-resistant two-person camping tent with a quick setup design for weekend hikes and outdoor adventures.",
        sku: "OUT-10001",
        price: 7499,
        stock: 10,
        categoryName: "Outdoor",
      },
      {
        name: "CampGlow Rechargeable Lantern",
        slug: "campglow-rechargeable-lantern",
        description: "Rechargeable LED camping lantern with adjustable brightness for nighttime campsites and emergency power outages.",
        sku: "OUT-10002",
        price: 1399,
        stock: 29,
        categoryName: "Outdoor",
      },
      {
        name: "HydraSteel Water Bottle",
        slug: "hydrasteel-water-bottle",
        description: "Insulated stainless steel bottle that keeps drinks cold during hikes, workouts, commutes, and long days outside.",
        sku: "OUT-10003",
        price: 799,
        stock: 45,
        categoryName: "Outdoor",
      },
      {
        name: "SilkSmooth Hair Dryer",
        slug: "silksmooth-hair-dryer",
        description: "Quiet hair dryer with multiple heat settings and a concentrator nozzle for fast, controlled styling at home.",
        sku: "CARE-11001",
        price: 2299,
        stock: 20,
        categoryName: "Personal Care",
      },
      {
        name: "GentleCare Electric Toothbrush",
        slug: "gentlecare-electric-toothbrush",
        description: "Rechargeable electric toothbrush with a two-minute timer and gentle cleaning modes for daily oral care.",
        sku: "CARE-11002",
        price: 1799,
        stock: 25,
        categoryName: "Personal Care",
      },
      {
        name: "CalmStone Massage Gun",
        slug: "calmstone-massage-gun",
        description: "Handheld percussion massager with adjustable intensity to relax sore muscles after exercise or a long workday.",
        sku: "CARE-11003",
        price: 3999,
        stock: 12,
        categoryName: "Personal Care",
      },
      {
        name: "PawHaven Orthopedic Pet Bed",
        slug: "pawhaven-orthopedic-pet-bed",
        description: "Washable supportive pet bed with a soft cover that gives dogs and cats a comfortable place to rest.",
        sku: "PET-12001",
        price: 2499,
        stock: 18,
        categoryName: "Pet Supplies",
      },
      {
        name: "SmartServe Automatic Pet Feeder",
        slug: "smartserve-automatic-pet-feeder",
        description: "Programmable automatic feeder that dispenses measured portions for pets while you are busy or away from home.",
        sku: "PET-12002",
        price: 3299,
        stock: 14,
        categoryName: "Pet Supplies",
      },
      {
        name: "FetchFun Rope Toy Set",
        slug: "fetchfun-rope-toy-set",
        description: "Durable rope and chew toys for interactive play, fetch, and keeping energetic dogs occupied indoors or outside.",
        sku: "PET-12003",
        price: 599,
        stock: 40,
        categoryName: "Pet Supplies",
      },
      {
        name: "RoadReady Dual Dash Camera",
        slug: "roadready-dual-dash-camera",
        description: "Front and rear dash camera that records your commute and road trips to provide helpful footage while driving.",
        sku: "AUTO-13001",
        price: 6999,
        stock: 9,
        categoryName: "Automotive",
      },
      {
        name: "VoltGo Car Phone Charger",
        slug: "voltgo-car-phone-charger",
        description: "Fast dual-port USB car charger that powers phones and navigation devices during daily commutes and road trips.",
        sku: "AUTO-13002",
        price: 699,
        stock: 38,
        categoryName: "Automotive",
      },
      {
        name: "ClearView Blind Spot Mirrors",
        slug: "clearview-blind-spot-mirrors",
        description: "Wide-angle stick-on side mirrors that improve rear visibility and help drivers check blind spots when changing lanes.",
        sku: "AUTO-13003",
        price: 349,
        stock: 50,
        categoryName: "Automotive",
      },
      {
        name: "CuriousMinds Science Kit",
        slug: "curiousminds-science-kit",
        description: "Hands-on beginner science kit with safe experiments that introduce children to chemistry, observation, and discovery.",
        sku: "KID-14001",
        price: 1199,
        stock: 23,
        categoryName: "Kids and Learning",
      },
      {
        name: "StoryTime Read-Along Speaker",
        slug: "storytime-read-along-speaker",
        description: "Child-friendly audio player with simple controls for listening to bedtime stories, learning tracks, and songs.",
        sku: "KID-14002",
        price: 1999,
        stock: 16,
        categoryName: "Kids and Learning",
      },
      {
        name: "BuildBright Magnetic Tiles",
        slug: "buildbright-magnetic-tiles",
        description: "Colorful magnetic building tiles that encourage children to explore shapes, spatial reasoning, and creative construction.",
        sku: "KID-14003",
        price: 1599,
        stock: 27,
        categoryName: "Kids and Learning",
      },
    ];

    for (const product of products) {
      const categoryId = categoryMap.get(product.categoryName);
      if (!categoryId) {
        throw new Error(`Unknown category for seeded product "${product.name}".`);
      }

      const productData = {
        categoryId,
        name: product.name,
        slug: product.slug,
        description: product.description,
        sku: product.sku,
        price: product.price,
        stock: product.stock,
        active: true,
      };

      await tx.product.upsert({
        where: { slug: product.slug },
        create: productData,
        update: productData,
      });
    }

    const passwordHash = await bcrypt.hash("password123", 10);

    const users = [
        { name: "Alice Customer", email: "alice@example.com", passwordHash, role: "CUSTOMER" },
        { name: "Bob Admin", email: "bob@example.com", passwordHash, role: "ADMIN" },
        { name: "Charlie Customer", email: "charlie@example.com", passwordHash, role: "CUSTOMER" },
    ] as const;

    for (const user of users) {
      await tx.user.upsert({
        where: { email: user.email },
        create: user,
        update: { name: user.name, role: user.role },
      });
    }
  });

  const indexedCount = await indexProductEmbeddings();
  console.log(`Indexed embeddings for ${indexedCount} products.`);
  console.log("Database seed complete.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
