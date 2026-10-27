import { NextResponse } from "next/server";
import {
  AuthAccessError,
  authErrorResponse,
  requirePrincipal,
  requireRole,
} from "@/lib/auth/authorization";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { createOrderFromCart, OrderWorkflowError } from "@/lib/orders/service";
import { Prisma } from "@prisma/client";

export async function GET() {
  let user;
  try {
    user = requirePrincipal(await getCurrentUser());
  } catch (error) {
    if (error instanceof AuthAccessError) {
      return authErrorResponse(error);
    }

    throw error;
  }

  const orders = await prisma.order.findMany({
    where: user.role === "ADMIN" ? {} : { userId: user.id },
    include: {
      items: true,
      payment: true,
      ...(user.role === "ADMIN"
        ? { user: { select: { id: true, name: true, email: true } } }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders });
}

export async function POST() {
  let user;
  try {
    user = requireRole(await getCurrentUser(), "CUSTOMER");
  } catch (error) {
    if (error instanceof AuthAccessError) return authErrorResponse(error);
    throw error;
  }

  try {
    const order = await createOrderFromCart(prisma, user.id);
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    if (error instanceof OrderWorkflowError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2034"
    ) {
      return NextResponse.json(
        { error: "Inventory changed during checkout. Please review your cart and try again." },
        { status: 409 },
      );
    }
    throw error;
  }
}
