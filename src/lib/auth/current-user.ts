import { getServerSession } from "next-auth";
import { connection } from "next/server";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";

export async function getCurrentUser() {
  await connection();
  const session = await getServerSession(authOptions);
  const userId = Number(session?.user?.id);

  if (!Number.isSafeInteger(userId) || userId <= 0) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true },
  });
}
