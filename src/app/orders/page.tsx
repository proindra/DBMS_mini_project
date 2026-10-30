import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth/current-user";
import { formatCurrency } from "@/lib/currency";
import { prisma } from "@/lib/db";

export default function OrdersPage() {
  return (
    <Suspense fallback={<p className="p-8 text-zinc-600">Loading orders...</p>}>
      <OrdersContent />
    </Suspense>
  );
}

async function OrdersContent() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "CUSTOMER") redirect("/account");

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: { items: true, payment: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
      <h1 className="text-3xl font-semibold text-zinc-950">Your orders</h1>
      {orders.length === 0 ? (
        <section className="mt-8 rounded-xl border border-zinc-200 bg-white p-8">
          <p className="text-zinc-700">You have not placed any orders yet.</p>
          <Link href="/products" className="mt-4 inline-block font-semibold text-blue-700 hover:underline">
            Browse products
          </Link>
        </section>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block rounded-xl border border-zinc-200 bg-white p-5 hover:border-blue-300"
            >
              <div className="flex flex-wrap justify-between gap-3">
                <p className="font-semibold text-zinc-950">Order #{order.id}</p>
                <p className="font-semibold text-zinc-950">{formatCurrency(order.total.toString())}</p>
              </div>
              <p className="mt-2 text-sm text-zinc-600">
                {order.items.length} item{order.items.length === 1 ? "" : "s"} · {order.status} · Payment {order.payment?.status ?? "PENDING"}
              </p>
              <p className="mt-1 text-xs text-zinc-500">{order.createdAt.toLocaleString()}</p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
