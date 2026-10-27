import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import {
  AuthAccessError,
  authErrorResponse,
  requireRole,
} from "@/lib/auth/authorization";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { cartItemInputSchema } from "@/lib/products/validation";

export async function GET() {
  let user;
  try {
    user = requireRole(await getCurrentUser(), "CUSTOMER");
  } catch (error) {
    if (error instanceof AuthAccessError) {
      return authErrorResponse(error);
    }

    throw error;
  }

  const items = await prisma.cartItem.findMany({
    where: { userId: user.id },
    include: { product: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  let user;
  try {
    user = requireRole(await getCurrentUser(), "CUSTOMER");
  } catch (error) {
    if (error instanceof AuthAccessError) return authErrorResponse(error);
    throw error;
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = cartItemInputSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid cart item.", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const item = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findFirst({
        where: { id: parsed.data.productId, active: true },
        select: { id: true, name: true, stock: true },
      });

      if (!product) {
        return { error: "Product not found.", status: 404 as const };
      }

      const existing = await tx.cartItem.findUnique({
        where: {
          userId_productId: { userId: user.id, productId: product.id },
        },
        select: { quantity: true },
      });
      const quantity = (existing?.quantity ?? 0) + parsed.data.quantity;

      if (quantity > product.stock) {
        return {
          error: `Only ${product.stock} of ${product.name} are currently in stock.`,
          status: 409 as const,
        };
      }

      const cartItem = await tx.cartItem.upsert({
        where: {
          userId_productId: { userId: user.id, productId: product.id },
        },
        create: {
          userId: user.id,
          productId: product.id,
          quantity,
        },
        update: { quantity },
        include: { product: true },
      });

      return { cartItem };
    });

    if ("error" in item) {
      return NextResponse.json({ error: item.error }, { status: item.status });
    }
    return NextResponse.json({ item: item.cartItem }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === "P2034" || error.code === "P2002")
    ) {
      return NextResponse.json(
        { error: "Cart changed concurrently. Please retry your request." },
        { status: 409 },
      );
    }
    throw error;
  }
}
