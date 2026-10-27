import Link from "next/link";

export function ShopNavigation() {
  return (
    <nav className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-4">
      <Link href="/products" className="font-semibold text-zinc-950">
        E-commerce Store
      </Link>
      <div className="flex gap-4 text-sm font-medium text-blue-700">
        <Link href="/products" className="hover:underline">Products</Link>
        <Link href="/cart" className="hover:underline">Cart</Link>
        <Link href="/orders" className="hover:underline">My orders</Link>
        <Link href="/account" className="hover:underline">Account</Link>
      </div>
    </nav>
  );
}
