import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { OrderManager, type AdminOrderView } from "@/components/admin/order-manager";
import { ProductManager, type AdminProductView } from "@/components/admin/product-manager";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";

export default function AdminPage() {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-zinc-600">Loading admin area...</p>}>
      <AdminContent />
    </Suspense>
  );
}

async function AdminContent() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (user.role !== "ADMIN") {
    redirect("/account");
  }

  const [products, categories, orders, usersCount] = await Promise.all([
    prisma.product.findMany({
      include: { category: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.order.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count(),
  ]);
  const productViews: AdminProductView[] = products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    sku: product.sku,
    categoryId: product.categoryId,
    categoryName: product.category.name,
    price: product.price.toString(),
    stock: product.stock,
    active: product.active,
  }));
  const orderViews: AdminOrderView[] = orders.map((order) => ({
    id: order.id,
    status: order.status,
    total: order.total.toString(),
    createdAt: order.createdAt.toISOString(),
    user: order.user,
  }));
  const salesTotal = orders
    .filter((order) => order.status !== "CANCELLED")
    .reduce((total, order) => total + Number(order.total), 0);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-12">
      <Link href="/account" className="text-sm font-semibold text-blue-700">
        Back to account
      </Link>
      <h1 className="mt-8 text-3xl font-semibold text-zinc-950">Admin dashboard</h1>
      <p className="mt-3 text-zinc-600">
        Signed in as {user.name}. Admin-only operations must also check this role
        in their server-side handlers.
      </p>
      <SignOutButton />
      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Products" value={products.length} />
        <SummaryCard label="Orders" value={orders.length} />
        <SummaryCard label="Order total (excluding cancelled)" value={`$${salesTotal.toFixed(2)}`} />
        <SummaryCard label="Registered users" value={usersCount} />
      </section>
      <ProductManager initialProducts={productViews} categories={categories} />
      <OrderManager initialOrders={orderViews} />
    </main>
  );
}

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <p className="text-sm text-zinc-600">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-zinc-950">{value}</p>
    </div>
  );
}
