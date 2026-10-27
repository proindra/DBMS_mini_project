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
    if (error instanceof AuthAccessError) {
      return authErrorResponse(error);
    }

    throw error;
  }

  const [users, orders, products] = await Promise.all([
    prisma.user.count(),
    prisma.order.count(),
    prisma.product.count(),
  ]);

  return NextResponse.json({ users, orders, products });
}
