"use client";

import Link from "next/link";
import { useCart } from "../../lib/cart";
import { useAuth } from "../../components/AuthProvider";
import SmartImage from "../../components/SmartImage";
import PageShell from "../../components/PageShell";

export default function CartPage() {
  const { items, itemCount, subtotal, isLoaded, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();

  const hasOutOfStock = items.some((i) => i.stockCount <= 0);

  if (!isLoaded) {
    return (
      <PageShell title="Your Crate">
        <div className="py-20 text-center font-mono text-sm opacity-60">Loading crate…</div>
      </PageShell>
    );
  }

  if (items.length === 0) {
    return (
      <PageShell title="Your Crate">
        <div className="mx-auto max-w-xl border-2 border-vinylBlack bg-parchment p-8 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="font-display text-4xl italic">Your crate is empty</p>
          <p className="mt-3 font-mono text-xs leading-relaxed opacity-70">
            You haven&apos;t added any graded vinyl, classic audio gear, or vintage pieces to your crate yet.
          </p>
          <div className="mt-8">
            <Link
              href="/#crate"
              className="-skew-x-6 inline-block border-2 border-vinylBlack bg-amberGlow px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-vinylBlack shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-vinylBlack hover:text-parchment"
            >
              Browse the catalog →
            </Link>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Your Crate">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items List */}
        <div className="space-y-4 lg:col-span-2">
          {hasOutOfStock && (
            <div className="-skew-x-3 border-2 border-red-600 bg-red-600/10 p-4 font-mono text-xs font-bold text-red-600 shadow-[3px_3px_0px_0px_rgba(220,38,38,1)]">
              ⚠️ One or more items in your crate are currently out of stock. Please remove them before proceeding to checkout.
            </div>
          )}

          {items.map((item) => {
            const isOut = item.stockCount <= 0;
            return (
              <div
                key={`${item.productId}-${item.option}`}
                className={`relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-2 border-vinylBlack bg-parchment p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-colors ${
                  isOut ? "border-red-600 bg-red-50/50" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 shrink-0 overflow-hidden border-2 border-vinylBlack bg-vinylBlack">
                    <SmartImage src={item.image} alt={item.title} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl leading-tight text-vinylBlack">
                      <Link href={`/product/${item.productId}`} className="hover:text-red-600">
                        {item.title}
                      </Link>
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="-skew-x-6 border border-vinylBlack bg-parchment px-2 py-0.5 font-mono text-[11px] font-bold uppercase">
                        Option: {item.option}
                      </span>
                      {item.vendorName && (
                        <span className="font-mono text-xs opacity-60">Shop: {item.vendorName}</span>
                      )}
                    </div>
                    {isOut ? (
                      <p className="mt-2 font-mono text-xs font-bold uppercase text-red-600">
                        ✖ Out of Stock
                      </p>
                    ) : (
                      <p className="mt-1 font-mono text-xs opacity-60">
                        Stock available: {item.stockCount}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-vinylBlack/20">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border-2 border-vinylBlack bg-parchment">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() => updateQuantity(item.productId, item.option, item.quantity - 1)}
                      className="px-2.5 py-1 font-mono text-xs font-bold hover:bg-amberGlow"
                    >
                      -
                    </button>
                    <span className="min-w-[2rem] text-center font-mono text-xs font-bold">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      disabled={isOut || item.quantity >= item.stockCount}
                      onClick={() => updateQuantity(item.productId, item.option, item.quantity + 1)}
                      className="px-2.5 py-1 font-mono text-xs font-bold hover:bg-amberGlow disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <p className="font-display text-2xl text-red-600">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    {item.quantity > 1 && (
                      <p className="font-mono text-[10px] opacity-60">${item.price.toFixed(2)} each</p>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.productId, item.option)}
                    className="-skew-x-6 border border-vinylBlack/40 bg-parchment px-2 py-1 font-mono text-[11px] font-bold uppercase hover:bg-red-600 hover:text-parchment"
                    title="Remove item"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}

          <div className="flex justify-between pt-2">
            <Link
              href="/#crate"
              className="font-mono text-xs uppercase underline hover:text-red-600"
            >
              ← Continue browsing
            </Link>
            <button
              type="button"
              onClick={clearCart}
              className="font-mono text-xs uppercase underline opacity-60 hover:text-red-600 hover:opacity-100"
            >
              Clear entire crate
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="self-start border-2 border-vinylBlack bg-parchment p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="border-b-2 border-vinylBlack pb-3 font-display text-3xl italic">
            Crate Summary
          </h2>

          <div className="mt-4 space-y-3 font-mono text-xs">
            <div className="flex justify-between">
              <span className="opacity-70">Total items:</span>
              <span className="font-bold">{itemCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-70">Subtotal:</span>
              <span className="font-bold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-70">Analogue Delivery:</span>
              <span className="font-bold text-pine uppercase">Free (Tracked)</span>
            </div>
            <div className="border-t-2 border-vinylBlack pt-3 flex justify-between items-baseline">
              <span className="font-display text-xl uppercase tracking-wider">Total</span>
              <span className="font-display text-4xl text-red-600">${subtotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-8">
            {hasOutOfStock ? (
              <button
                type="button"
                disabled
                className="w-full -skew-x-6 border-2 border-vinylBlack bg-vinylBlack/20 px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-vinylBlack/40 cursor-not-allowed"
              >
                Resolve Out of Stock Items
              </button>
            ) : user ? (
              <Link
                href="/checkout"
                className="w-full -skew-x-6 inline-block text-center border-2 border-vinylBlack bg-amberGlow px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-vinylBlack shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-colors hover:bg-vinylBlack hover:text-parchment"
              >
                Proceed to Checkout →
              </Link>
            ) : (
              <Link
                href="/login?next=/checkout"
                className="w-full -skew-x-6 inline-block text-center border-2 border-vinylBlack bg-amberGlow px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-vinylBlack shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-colors hover:bg-vinylBlack hover:text-parchment"
              >
                Log In to Checkout →
              </Link>
            )}
          </div>

          <p className="mt-4 text-center font-mono text-[10px] opacity-60">
            Secure checkout powered by RE:VINTAGE Analogue Collective.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
