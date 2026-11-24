"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../components/AuthProvider";
import { api, type ApiOrder } from "../../lib/api";
import SmartImage from "../../components/SmartImage";
import PageShell from "../../components/PageShell";

export default function OrdersPage() {
  const { user, ready } = useAuth();
  const [orders, setOrders] = useState<ApiOrder[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search);
      if (q.get("success") === "1") {
        setShowSuccess(true);
      }
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      setLoading(false);
      return;
    }

    api<ApiOrder[]>("/orders/mine")
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message || "Failed to load order history.");
        setLoading(false);
      });
  }, [ready, user]);

  if (!ready || loading) {
    return (
      <PageShell title="Order History">
        <div className="py-20 text-center font-mono text-sm opacity-60">
          Loading your order history…
        </div>
      </PageShell>
    );
  }

  if (!user) {
    return (
      <PageShell title="Order History">
        <div className="mx-auto max-w-md border-2 border-vinylBlack bg-parchment p-8 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="font-display text-3xl italic">Authentication Required</p>
          <p className="mt-3 font-mono text-xs opacity-70">
            Please log in to review your past orders and purchases.
          </p>
          <Link
            href="/login?next=/orders"
            className="mt-6 inline-block -skew-x-6 border-2 border-vinylBlack bg-amberGlow px-6 py-2.5 font-mono text-xs font-bold uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-vinylBlack hover:text-parchment"
          >
            Log In Now →
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Order History">
      <div className="mx-auto max-w-4xl space-y-6">
        {showSuccess && (
          <div className="-skew-x-3 border-2 border-vinylBlack bg-amberGlow p-4 font-mono text-xs font-bold text-vinylBlack shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            ✓ ORDER PLACED SUCCESSFULLY! Your order has been recorded in PostgreSQL and the product stock has been updated.
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="-skew-x-3 border-2 border-red-600 bg-red-600 p-4 font-mono text-xs font-bold text-parchment shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
          >
            {error}
          </div>
        )}

        {orders && orders.length === 0 && (
          <div className="border-2 border-vinylBlack bg-parchment p-8 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="font-display text-3xl italic">No Orders Yet</p>
            <p className="mt-2 font-mono text-xs opacity-70">
              You haven&apos;t placed any orders yet. Once you complete a checkout, your purchases will appear here.
            </p>
            <div className="mt-6">
              <Link
                href="/#crate"
                className="-skew-x-6 inline-block border-2 border-vinylBlack bg-amberGlow px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-vinylBlack shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-vinylBlack hover:text-parchment"
              >
                Explore Catalog →
              </Link>
            </div>
          </div>
        )}

        {orders && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => {
              const status = order.status.toLowerCase();
              const statusStyle =
                status === "delivered"
                  ? "bg-pine text-parchment"
                  : status === "shipped"
                    ? "bg-amberGlow text-vinylBlack"
                    : "bg-vinylBlack text-parchment";
              const formattedDate = new Date(order.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={order.id}
                  className="border-2 border-vinylBlack bg-parchment p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  {/* Order Card Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-vinylBlack pb-4">
                    <div>
                      <span className="font-mono text-[11px] uppercase tracking-wider text-pine">
                        Order #{order.id.slice(0, 8)}
                      </span>
                      <p className="font-mono text-xs text-vinylBlack/70">{formattedDate}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`-skew-x-6 border-2 border-vinylBlack px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider ${statusStyle}`}>
                        {order.status}
                      </span>
                      <span className="font-display text-2xl text-red-600">
                        ${Number(order.total_price).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="mt-4 divide-y divide-vinylBlack/15">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="py-3 flex items-center justify-between gap-4 font-mono text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 shrink-0 overflow-hidden border border-vinylBlack bg-vinylBlack">
                            <SmartImage src={item.image_url} alt={item.title} className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <p className="font-bold text-vinylBlack">{item.title}</p>
                            <p className="text-[11px] opacity-70">
                              Qty: {item.quantity} {item.option ? `· Option: ${item.option}` : ""}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold">
                          ${(Number(item.price) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer Info */}
                  <div className="mt-4 border-t border-vinylBlack/15 pt-3 font-mono text-[11px] opacity-75">
                    <p className="mb-1 font-bold uppercase">Shipping details</p>
                    {order.full_name && <p>{order.full_name}</p>}
                    <p>
                      {[order.address, order.city].filter(Boolean).join(", ") ||
                        order.shipping_address ||
                        "Address not available"}
                    </p>
                    {order.phone && <p>Phone: {order.phone}</p>}
                    {order.payment_method && <p>Payment: {order.payment_method}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageShell>
  );
}
