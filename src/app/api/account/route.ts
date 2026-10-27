import { NextResponse } from "next/server";
import { AuthAccessError, authErrorResponse, requirePrincipal } from "@/lib/auth/authorization";
import { getCurrentUser } from "@/lib/auth/current-user";

export async function GET() {
  try {
    const user = requirePrincipal(await getCurrentUser());
    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof AuthAccessError) {
      return authErrorResponse(error);
    }

    throw error;
  }
}
