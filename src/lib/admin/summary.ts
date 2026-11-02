import { prisma } from "@/lib/db";

type AdminSalesSummaryRow = {
  orderCount: number;
  salesTotal: string;
};

export type CustomerOrderSummary = {
  id: number;
  name: string;
  email: string;
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

export async function getCustomerOrderSummaries(): Promise<CustomerOrderSummary[]> {
  return prisma.$queryRaw<CustomerOrderSummary[]>`
    WITH customer_order_summary AS (
      SELECT
        o."userId",
        COUNT(*)::INTEGER AS "orderCount",
        COALESCE(
          SUM(o."total") FILTER (WHERE o."status" <> 'CANCELLED'),
          0
        ) AS "salesTotal"
      FROM "Order" o
      GROUP BY o."userId"
    )
    SELECT
      u."id",
      u."name",
      u."email",
      summary."orderCount",
      summary."salesTotal"::TEXT AS "salesTotal"
    FROM customer_order_summary summary
    JOIN "User" u ON u."id" = summary."userId"
    ORDER BY summary."salesTotal" DESC, u."name"
    LIMIT 10
  `;
}
