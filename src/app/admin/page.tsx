import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { OrderManager, type AdminOrderView } from "@/components/admin/order-manager";
import { ProductManager, type AdminProductView } from "@/components/admin/product-manager";
import {
  getAdminSummary,
  getCustomerOrderSummaries,
} from "@/lib/admin/summary";
import { getCurrentUser } from "@/lib/auth/current-user";
import { formatCurrency } from "@/lib/currency";
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

  const [products, categories, orders, summary, customerOrderSummaries] = await Promise.all([
    prisma.product.findMany({
      include: { category: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.order.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    }),
    getAdminSummary(),
    getCustomerOrderSummaries(),
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
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
      <Link href="/account" className="text-sm font-semibold text-blue-700 hover:underline">
        ← Back to account
      </Link>
      <h1 className="mt-8 text-3xl font-semibold text-zinc-950">Admin dashboard</h1>
      <p className="mt-3 text-zinc-600">
        Signed in as {user.name}. Admin-only operations must also check this role
        in their server-side handlers.
      </p>
      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Products" value={products.length} />
        <SummaryCard label="Orders" value={summary.orders} />
        <SummaryCard label="Order total (excluding cancelled)" value={formatCurrency(summary.salesTotal)} />
        <SummaryCard label="Registered users" value={summary.users} />
      </section>
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-zinc-950">
          Customer order summary
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          Order counts and non-cancelled sales, summarized with a PostgreSQL CTE.
        </p>
        {customerOrderSummaries.length === 0 ? (
          <p className="mt-4 rounded-xl border border-zinc-200 bg-white p-5 text-zinc-700">
            No customer orders yet.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-600">
                <tr>
                  <th scope="col" className="px-5 py-3 font-medium">Customer</th>
                  <th scope="col" className="px-5 py-3 font-medium">Orders</th>
                  <th scope="col" className="px-5 py-3 font-medium">Sales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {customerOrderSummaries.map((customer) => (
                  <tr key={customer.id}>
                    <td className="px-5 py-3">
                      <p className="font-medium text-zinc-950">{customer.name}</p>
                      <p className="text-zinc-600">{customer.email}</p>
                    </td>
                    <td className="px-5 py-3 text-zinc-700">{customer.orderCount}</td>
                    <td className="px-5 py-3 text-zinc-700">
                      {formatCurrency(customer.salesTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
