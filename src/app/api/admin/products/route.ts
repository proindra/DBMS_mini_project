import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import {
  AuthAccessError,
  authErrorResponse,
  requireRole,
} from "@/lib/auth/authorization";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { productInputSchema } from "@/lib/products/validation";
import {
  createProductVector,
  storeProductVector,
} from "@/lib/vector-search/service";

async function requireAdminResponse() {
  try {
    requireRole(await getCurrentUser(), "ADMIN");
    return null;
  } catch (error) {
    if (error instanceof AuthAccessError) {
      return authErrorResponse(error);
    }

    throw error;
  }
}

export async function GET() {
  const denied = await requireAdminResponse();
  if (denied) return denied;

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: { category: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  return NextResponse.json({ products, categories });
}

export async function POST(request: Request) {
  const denied = await requireAdminResponse();
  if (denied) return denied;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = productInputSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid product data.", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const category = await prisma.category.findUnique({
    where: { id: parsed.data.categoryId },
    select: { name: true },
  });
  if (!category) {
    return NextResponse.json({ error: "Choose an existing category." }, { status: 400 });
  }

  const embedding = await createProductVector({
    name: parsed.data.name,
    description: parsed.data.description,
    category,
  });

  try {
    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: parsed.data,
        include: { category: { select: { id: true, name: true } } },
      });
      await storeProductVector(tx, created.id, embedding);
      return created;
    });
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "A product with that slug or SKU already exists." },
        { status: 409 },
      );
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return NextResponse.json({ error: "Choose an existing category." }, { status: 400 });
    }
    throw error;
  }
}
