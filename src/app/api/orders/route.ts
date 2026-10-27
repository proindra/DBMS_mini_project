import { NextResponse } from "next/server";
import {
  AuthAccessError,
  authErrorResponse,
  requirePrincipal,
} from "@/lib/auth/authorization";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";

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
    include: { items: true, payment: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders });
}
