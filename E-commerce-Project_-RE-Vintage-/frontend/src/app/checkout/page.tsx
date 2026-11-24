"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "../../lib/cart";
import { useAuth } from "../../components/AuthProvider";
import { api, type ApiOrder } from "../../lib/api";
import SmartImage from "../../components/SmartImage";
import PageShell from "../../components/PageShell";
import { btn, input, label } from "../../lib/ui";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const { items, itemCount, subtotal, isLoaded, clearCart } = useCart();

  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const hasStockIssue = items.some((i) => i.stockCount < i.quantity);

  useEffect(() => {
    if (ready && !user) {
      router.push("/login?next=/checkout");
    }
  }, [ready, user, router]);

  if (!ready || !isLoaded) {
    return (
      <PageShell title="Checkout">
        <div className="py-20 text-center font-mono text-sm opacity-60">Preparing checkout…</div>
      </PageShell>
    );
  }

  if (!user) {
    return (
      <PageShell title="Checkout">
        <div className="mx-auto max-w-md border-2 border-vinylBlack bg-parchment p-8 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="font-display text-3xl italic">Authentication Required</p>
          <p className="mt-3 font-mono text-xs opacity-70">
            Please log in to finalize your analogue order.
          </p>
          <Link
            href="/login?next=/checkout"
            className="mt-6 inline-block -skew-x-6 border-2 border-vinylBlack bg-amberGlow px-6 py-2.5 font-mono text-xs font-bold uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-vinylBlack hover:text-parchment"
          >
            Log In Now →
          </Link>
        </div>
      </PageShell>
    );
  }

  if (items.length === 0) {
    return (
      <PageShell title="Checkout">
        <div className="mx-auto max-w-xl border-2 border-vinylBlack bg-parchment p-8 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="font-display text-4xl italic">Your crate is empty</p>
          <p className="mt-3 font-mono text-xs leading-relaxed opacity-70">
            You cannot proceed to checkout with an empty crate. Please add records or equipment first.
          </p>
          <div className="mt-8">
            <Link
              href="/#crate"
              className="-skew-x-6 inline-block border-2 border-vinylBlack bg-amberGlow px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-vinylBlack shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-vinylBlack hover:text-parchment"
            >
              Return to Catalog →
            </Link>
          </div>
        </div>
      </PageShell>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setError("Cannot check out with an empty crate.");
      return;
    }
    if (hasStockIssue) {
      setError("One or more items no longer have enough stock. Update your crate before checking out.");
      return;
    }
    if (![fullName, address, city, phone, paymentMethod].every((value) => value.trim())) {
      setError("Please complete all shipping and payment details.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const payload = {
        items: items.map((i) => ({
          product_id: i.productId,
          quantity: i.quantity,
          option: i.option,
        })),
        full_name: fullName.trim(),
        address: address.trim(),
        city: city.trim(),
        phone: phone.trim(),
        payment_method: paymentMethod,
        shipping_address: `${address.trim()}, ${city.trim()}`,
      };

      await api<ApiOrder>("/orders/checkout", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      clearCart();
      router.push("/orders?success=1");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Checkout failed. Please try again.";
      setError(msg);
      setBusy(false);
    }
  };

  return (
    <PageShell title="Checkout">
      <div className="grid gap-10 lg:grid-cols-3">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handlePlaceOrder}
            className="space-y-6 border-2 border-vinylBlack bg-parchment p-6 sm:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <h2 className="border-b-2 border-vinylBlack pb-3 font-display text-3xl italic">
              Shipping &amp; Order Details
            </h2>

            {(error || hasStockIssue) && (
              <div
                role="alert"
                className="-skew-x-3 border-2 border-red-600 bg-red-600 px-4 py-3 font-mono text-xs font-bold text-parchment shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              >
                {error || "One or more items no longer have enough stock. Update your crate before checking out."}
              </div>
            )}

            <div>
              <label className={label} htmlFor="email">
                Account Email
              </label>
              <input
                id="email"
                type="email"
                disabled
                value={user.email}
                className={`${input} opacity-70 cursor-not-allowed`}
              />
            </div>

            <div>
              <label className={label} htmlFor="full-name">
                Full Name
              </label>
              <input
                id="full-name"
                name="full_name"
                type="text"
                required
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Name on the delivery"
                className={input}
              />
            </div>

            <div>
              <label className={label} htmlFor="address">
                Street Address
              </label>
              <input
                id="address"
                name="address"
                type="text"
                required
                autoComplete="street-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street and number"
                className={input}
              />
            </div>

            <div>
              <label className={label} htmlFor="city">
                City
              </label>
              <input
                id="city"
                name="city"
                type="text"
                required
                autoComplete="address-level2"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className={input}
              />
            </div>

            <div>
              <label className={label} htmlFor="phone">
                Phone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Contact number"
                className={input}
              />
            </div>

            <div>
              <label className={label} htmlFor="payment-method">
                Payment Method
              </label>
              <select
                id="payment-method"
                name="payment_method"
                required
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className={input}
              >
                <option value="COD">Cash on delivery</option>
                <option value="Online">Online payment</option>
              </select>
            </div>

            <div className="pt-4 border-t-2 border-vinylBlack flex flex-wrap items-center justify-between gap-4">
              <Link href="/cart" className="font-mono text-xs uppercase underline hover:text-red-600">
                ← Return to crate
              </Link>
              <button
                type="submit"
                disabled={busy || items.length === 0 || hasStockIssue}
                className={btn}
              >
                {busy ? "Processing Order…" : "Confirm & Place Order →"}
              </button>
            </div>
          </form>
        </div>

        {/* Order Items Review */}
        <div className="self-start border-2 border-vinylBlack bg-parchment p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="border-b-2 border-vinylBlack pb-3 font-display text-2xl italic">
            Order Review ({itemCount})
          </h2>

          <div className="mt-4 divide-y divide-vinylBlack/20">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.option}`}
                className="py-3 flex items-center justify-between gap-3 text-xs font-mono"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 shrink-0 overflow-hidden border border-vinylBlack bg-vinylBlack">
                    <SmartImage src={item.image} alt={item.title} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <p className="font-bold line-clamp-1">{item.title}</p>
                    <p className="text-[10px] opacity-60">
                      Qty: {item.quantity} · {item.option}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-red-600">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t-2 border-vinylBlack pt-4 space-y-2 font-mono text-xs">
            <div className="flex justify-between">
              <span className="opacity-70">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-70">Shipping</span>
              <span className="text-pine font-bold uppercase">Free</span>
            </div>
            <div className="border-t border-vinylBlack pt-2 flex justify-between items-baseline">
              <span className="font-display text-lg uppercase">Total</span>
              <span className="font-display text-3xl text-red-600">${subtotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
