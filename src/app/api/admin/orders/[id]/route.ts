import { Prisma } from "@prisma/client";
import { z } from "zod";
import { NextResponse } from "next/server";
import {
  AuthAccessError,
  authErrorResponse,
  requireRole,
} from "@/lib/auth/authorization";
import { getCurrentUser } from "@/lib/auth/current-user";
import { invalidateProductCatalogueCache } from "@/lib/cache/redis";
import { prisma } from "@/lib/db";

const orderStatusSchema = z.object({
  status: z.enum(["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    requireRole(await getCurrentUser(), "ADMIN");
  } catch (error) {
    if (error instanceof AuthAccessError) return authErrorResponse(error);
    throw error;
  }

  const { id: rawId } = await context.params;
  const id = Number(rawId);
  if (!Number.isSafeInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid order id." }, { status: 400 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  const parsed = orderStatusSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid order status." }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        const order = await tx.order.findUnique({
          where: { id },
          include: { items: true, payment: true },
        });
        if (!order) return { error: "Order not found.", status: 404 as const };

        const allowedTransitions: Record<string, string[]> = {
          PENDING: ["PROCESSING", "CANCELLED"],
          PROCESSING: ["SHIPPED", "CANCELLED"],
          SHIPPED: ["DELIVERED"],
          DELIVERED: [],
          CANCELLED: [],
        };
        if (!allowedTransitions[order.status]?.includes(parsed.data.status)) {
          return {
            error: `Order cannot transition from ${order.status} to ${parsed.data.status}.`,
            status: 409 as const,
          };
        }

        if (parsed.data.status === "CANCELLED") {
          for (const item of order.items) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          }

          if (order.payment?.status === "PENDING") {
            await tx.payment.update({
              where: { orderId: id },
              data: { status: "FAILED" },
            });
          }
        }

        const updated = await tx.order.update({
          where: { id },
          data: { status: parsed.data.status },
          include: { items: true, payment: true },
        });
        return { order: updated };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    if (parsed.data.status === "CANCELLED") {
      await invalidateProductCatalogueCache();
    }
    return NextResponse.json({ order: result.order });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2034"
    ) {
      return NextResponse.json(
        { error: "Order changed concurrently. Refresh and retry the status update." },
        { status: 409 },
      );
    }
    throw error;
  }
}
