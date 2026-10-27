import { redirect } from "next/navigation";
import { Suspense } from "react";
import { CartManager, type CartItemView } from "@/components/cart/cart-manager";
import { ShopNavigation } from "@/components/shop-navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";

export default function CartPage() {
  return (
    <Suspense fallback={<p className="p-8 text-zinc-600">Loading cart...</p>}>
      <CartContent />
    </Suspense>
  );
}

async function CartContent() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "CUSTOMER") redirect("/account");

  const items = await prisma.cartItem.findMany({
    where: { userId: user.id },
    include: { product: true },
    orderBy: { createdAt: "asc" },
  });
  const viewItems: CartItemView[] = items.map((item) => ({
    id: item.id,
    quantity: item.quantity,
    productId: item.productId,
    productName: item.product.name,
    slug: item.product.slug,
    price: item.product.price.toString(),
    stock: item.product.stock,
    active: item.product.active,
  }));

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-12">
      <ShopNavigation />
      <h1 className="mt-10 text-3xl font-semibold text-zinc-950">Your cart</h1>
      <CartManager initialItems={viewItems} />
    </main>
  );
}
