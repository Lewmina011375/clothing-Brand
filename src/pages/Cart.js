import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Cart() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  useEffect(() => {
    const existing = JSON.parse(localStorage.getItem('cart') || '[]');
    setItems(
      Array.isArray(existing)
        ? existing.map((i) => ({
            ...i,
            id: Number(i.id),
            price: Number(i.price || 0),
            quantity: Number(i.quantity || 1),
          }))
        : []
    );
  }, []);

  const total = items.reduce((sum, item) => sum + Number(item.price || 0) * item.quantity, 0);

  function handleProceedToCheckout() {
    navigate('/checkout');
  }

  function handleQuantityChange(id, delta) {
    const next = items
      .map((i) =>
        i.id === id
          ? {
              ...i,
              quantity: Number(i.quantity || 0) + delta,
            }
          : i
      )
      .filter((i) => Number(i.quantity || 0) > 0)
      .map((i) => ({ ...i, quantity: Number(i.quantity) }));
    setItems(next);
    localStorage.setItem('cart', JSON.stringify(next));
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <h1 className="mb-4 text-2xl font-semibold text-white">Your cart</h1>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400">Your cart is empty. Start by adding some items.</p>
      ) : (
        <div className="space-y-4">
          <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-[#111827] shadow-sm">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div>
                  <div className="text-sm font-semibold text-white">{item.name}</div>
                  <div className="text-xs text-gray-400">
                  LKR {Number(item.price || 0).toFixed(2)} each
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(item.id, -1)}
                    className="h-7 w-7 rounded-full border border-white/15 text-sm text-gray-200 hover:bg-white/10"
                  >
                    -
                  </button>
                  <span className="w-6 text-center text-sm text-white">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(item.id, 1)}
                    className="h-7 w-7 rounded-full border border-white/15 text-sm text-gray-200 hover:bg-white/10"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#020617] p-5 text-sm text-gray-200">
            <h2 className="text-base font-semibold text-white">Order information</h2>
            <p className="mt-1 text-xs text-gray-400">
              You are about to place an order for your Pandora Clothing T‑shirt.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                  Product features
                </h3>
                <ul className="mt-2 space-y-1 text-xs text-gray-300">
                  <li>Premium quality cotton T‑shirt.</li>
                  <li>Soft, comfortable, breathable fabric with a modern street fit.</li>
                  <li>Minimal, stylish design – perfect for everyday wear.</li>
                  <li>Available in multiple sizes: S, M, L, XL.</li>
                  <li>Durable print and long‑lasting material.</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                  Delivery &amp; returns
                </h3>
                <ul className="mt-2 space-y-1 text-xs text-gray-300">
                  <li>Fast and reliable delivery straight to your door.</li>
                  <li>Simple, secure ordering and checkout process.</li>
                  <li>Easy returns on unworn items within 14 days.</li>
                  <li>Customer satisfaction guaranteed – we fix issues quickly.</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                  Size guide
                </h3>
                <p className="mt-2 text-xs text-gray-300">
                  For a relaxed street fit, choose your usual size. Size up for an oversized look, or size
                  down for a slimmer fit.
                </p>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                  Notes
                </h3>
                <p className="mt-2 text-xs text-gray-300">
                  You can adjust quantities below before placing your order. Taxes and delivery charges are
                  calculated at checkout.
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-300">
            <span>Total</span>
            <span className="text-lg font-semibold text-[#60a5fa]">LKR {total.toFixed(2)}</span>
          </div>
          <button
            type="button"
            onClick={handleProceedToCheckout}
            className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-black hover:bg-gray-100"
          >
            Proceed to checkout
          </button>
        </div>
      )}
    </section>
  );
}

export default Cart;

