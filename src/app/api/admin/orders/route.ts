import { NextResponse } from "next/server";
import {
  AuthAccessError,
  authErrorResponse,
  requireRole,
} from "@/lib/auth/authorization";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    requireRole(await getCurrentUser(), "ADMIN");
  } catch (error) {
    if (error instanceof AuthAccessError) return authErrorResponse(error);
    throw error;
  }

  const orders = await prisma.order.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: true,
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ orders });
}
