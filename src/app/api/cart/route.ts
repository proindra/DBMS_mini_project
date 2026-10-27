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

  const items = await prisma.cartItem.findMany({
    where: { userId: user.id },
    include: { product: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ items });
}
