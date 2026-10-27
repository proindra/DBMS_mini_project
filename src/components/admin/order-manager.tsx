"use client";

import { useState } from "react";

export type AdminOrderView = {
  id: number;
  status: string;
  total: string;
  createdAt: string;
  user: { name: string; email: string };
};

const nextStatuses: Record<string, string[]> = {
  PENDING: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export function OrderManager({ initialOrders }: { initialOrders: AdminOrderView[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [message, setMessage] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);

  async function updateOrder(id: number, status: string) {
    setPendingId(id);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = (await response.json()) as { error?: string; order?: { id: number; status: string } };
      if (!response.ok || !result.order) {
        setMessage(result.error ?? "Could not update the order.");
        return;
      }
      setOrders((current) =>
        current.map((order) => order.id === id ? { ...order, status: result.order!.status } : order),
      );
    } catch {
      setMessage("Could not reach the server. Please try again.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold text-zinc-950">Manage orders</h2>
      {orders.length === 0 ? (
        <p className="mt-4 rounded-xl border border-zinc-200 bg-white p-5 text-zinc-700">No orders yet.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {orders.map((order) => (
            <article key={order.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-5">
              <div>
                <p className="font-semibold text-zinc-950">Order #{order.id} · ${Number(order.total).toFixed(2)}</p>
                <p className="mt-1 text-sm text-zinc-600">{order.user.name} · {order.user.email}</p>
                <p className="mt-1 text-xs text-zinc-500">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-zinc-700">{order.status}</span>
                {nextStatuses[order.status]?.length > 0 && (
                  <select
                    aria-label={`Update order ${order.id} status`}
                    disabled={pendingId === order.id}
                    defaultValue=""
                    onChange={(event) => {
                      const status = event.currentTarget.value;
                      event.currentTarget.value = "";
                      if (status) void updateOrder(order.id, status);
                    }}
                    className="rounded-md border border-zinc-300 px-2 py-1 text-sm text-zinc-900"
                  >
                    <option value="" disabled>Change status</option>
                    {nextStatuses[order.status].map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
      {message && <p role="alert" className="mt-3 text-sm text-red-700">{message}</p>}
    </section>
  );
}
