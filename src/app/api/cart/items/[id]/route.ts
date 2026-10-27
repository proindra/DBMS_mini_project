import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import {
  AuthAccessError,
  authErrorResponse,
  requireRole,
} from "@/lib/auth/authorization";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { cartQuantitySchema } from "@/lib/products/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteParams) {
  let user;
  try {
    user = requireRole(await getCurrentUser(), "CUSTOMER");
  } catch (error) {
    if (error instanceof AuthAccessError) return authErrorResponse(error);
    throw error;
  }

  const { id: rawId } = await context.params;
  const id = Number(rawId);
  if (!Number.isSafeInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid cart item id." }, { status: 400 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  const parsed = cartQuantitySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Quantity must be a positive whole number." },
      { status: 400 },
    );
  }

  const item = await prisma.cartItem.findFirst({
    where: { id, userId: user.id },
    include: { product: true },
  });
  if (!item) {
    return NextResponse.json({ error: "Cart item not found." }, { status: 404 });
  }
  if (!item.product.active) {
    return NextResponse.json({ error: "This product is no longer available." }, { status: 409 });
  }
  if (parsed.data.quantity > item.product.stock) {
    return NextResponse.json(
      { error: `Only ${item.product.stock} of this product are currently in stock.` },
      { status: 409 },
    );
  }

  try {
    const updated = await prisma.cartItem.updateMany({
      where: { id, userId: user.id },
      data: { quantity: parsed.data.quantity },
    });
    if (updated.count !== 1) {
      return NextResponse.json({ error: "Cart item not found." }, { status: 404 });
    }

    const refreshed = await prisma.cartItem.findUniqueOrThrow({
      where: { id },
      include: { product: true },
    });
    return NextResponse.json({ item: refreshed });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Cart item not found." }, { status: 404 });
    }
    throw error;
  }
}

export async function DELETE(_request: Request, context: RouteParams) {
  let user;
  try {
    user = requireRole(await getCurrentUser(), "CUSTOMER");
  } catch (error) {
    if (error instanceof AuthAccessError) return authErrorResponse(error);
    throw error;
  }

  const { id: rawId } = await context.params;
  const id = Number(rawId);
  if (!Number.isSafeInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid cart item id." }, { status: 400 });
  }

  const deleted = await prisma.cartItem.deleteMany({
    where: { id, userId: user.id },
  });
  if (deleted.count !== 1) {
    return NextResponse.json({ error: "Cart item not found." }, { status: 404 });
  }

  return new Response(null, { status: 204 });
}
