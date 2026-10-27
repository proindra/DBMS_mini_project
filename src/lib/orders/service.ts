import { Prisma, type PrismaClient } from "@prisma/client";

export class OrderWorkflowError extends Error {
  constructor(
    message: string,
    readonly status: 400 | 409,
  ) {
    super(message);
    this.name = "OrderWorkflowError";
  }
}

export function calculateOrderTotal(
  items: Array<{ price: Prisma.Decimal; quantity: number }>,
): Prisma.Decimal {
  return items.reduce(
    (total, item) => total.add(item.price.mul(item.quantity)),
    new Prisma.Decimal(0),
  );
}

export async function createOrderFromCart(
  prisma: PrismaClient,
  userId: number,
) {
  return prisma.$transaction(
    async (tx) => {
      const cartItems = await tx.cartItem.findMany({
        where: { userId },
        include: { product: true },
        orderBy: { id: "asc" },
      });

      if (cartItems.length === 0) {
        throw new OrderWorkflowError("Your cart is empty.", 400);
      }

      for (const item of cartItems) {
        if (!item.product.active) {
          throw new OrderWorkflowError(
            `${item.product.name} is no longer available.`,
            409,
          );
        }

        if (item.quantity > item.product.stock) {
          throw new OrderWorkflowError(
            `Only ${item.product.stock} of ${item.product.name} remain in stock.`,
            409,
          );
        }
      }

      const total = calculateOrderTotal(
        cartItems.map((item) => ({
          price: item.product.price,
          quantity: item.quantity,
        })),
      );
      if (total.greaterThan("99999999.99")) {
        throw new OrderWorkflowError(
          "Your cart total exceeds the maximum supported order amount.",
          400,
        );
      }

      for (const item of cartItems) {
        const stockUpdate = await tx.product.updateMany({
          where: {
            id: item.productId,
            active: true,
            stock: { gte: item.quantity },
          },
          data: { stock: { decrement: item.quantity } },
        });

        if (stockUpdate.count !== 1) {
          throw new OrderWorkflowError(
            `${item.product.name} no longer has enough stock. Please review your cart.`,
            409,
          );
        }
      }

      const order = await tx.order.create({
        data: {
          userId,
          status: "PENDING",
          total,
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              productName: item.product.name,
              unitPrice: item.product.price,
              quantity: item.quantity,
            })),
          },
          payment: {
            create: {
              amount: total,
              status: "PENDING",
            },
          },
        },
        include: { items: true, payment: true },
      });

      await tx.cartItem.deleteMany({ where: { userId } });
      return order;
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}
