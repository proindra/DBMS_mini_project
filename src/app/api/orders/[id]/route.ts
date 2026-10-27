import { NextResponse } from "next/server";
import {
  AuthAccessError,
  authErrorResponse,
  requirePrincipal,
} from "@/lib/auth/authorization";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  let user;
  try {
    user = requirePrincipal(await getCurrentUser());
  } catch (error) {
    if (error instanceof AuthAccessError) return authErrorResponse(error);
    throw error;
  }

  const { id: rawId } = await context.params;
  const id = Number(rawId);
  if (!Number.isSafeInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid order id." }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: {
      id,
      ...(user.role === "ADMIN" ? {} : { userId: user.id }),
    },
    include: { items: true, payment: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  return NextResponse.json({ order });
}
