import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/db";

async function main() {
  await prisma.$transaction(async (tx) => {
    const categoryData = [
      { name: "Audio", description: "Headphones, speakers, and sound accessories." },
      { name: "Accessories", description: "Desk, lighting, and daily-use essentials." },
      { name: "Home Office", description: "Products built for efficient workspaces." },
      { name: "Gaming", description: "Performance gear and entertainment tools." },
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
        update: { name: user.name, passwordHash, role: user.role },
      });
    }
  });

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
