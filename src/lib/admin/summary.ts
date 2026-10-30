import { prisma } from "@/lib/db";

type AdminSalesSummaryRow = {
  orderCount: number;
  salesTotal: string;
};

export async function getAdminSummary() {
  const [users, products, salesRows] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.$queryRaw<AdminSalesSummaryRow[]>`
      SELECT "orderCount", "salesTotal"
      FROM "AdminSalesSummary"
    `,
  ]);
  const sales = salesRows[0];

  if (!sales) {
    throw new Error("AdminSalesSummary view returned no rows.");
  }

  return {
    users,
    products,
    orders: sales.orderCount,
    salesTotal: sales.salesTotal,
  };
}
