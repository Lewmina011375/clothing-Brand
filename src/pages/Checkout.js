import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createOrder } from '../services/orderService';
import { isLoggedIn, logout } from '../services/userService';
import ImageUpload3D from '../components/common/ImageUpload3D';
import { fetchPublishedStickers } from '../services/stickerService';
import { fetchPandoras } from '../services/pandoraService';

function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [productsForCheckout, setProductsForCheckout] = useState([]);
  const [productsForCheckoutLoading, setProductsForCheckoutLoading] = useState(false);
  const [productsForStickerOrder, setProductsForStickerOrder] = useState([]);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [size, setSize] = useState('L');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [color, setColor] = useState('');
  const [notes, setNotes] = useState('');
  const [publishedStickers, setPublishedStickers] = useState([]);
  const [stickerUrl, setStickerUrl] = useState('');
  const [printMethod, setPrintMethod] = useState('PUFF');

  const stickerIdFromUrl = searchParams.get('stickerId');
  const orderTypeFromUrl = (searchParams.get('type') || '').trim(); // 'product' | 'sticker'
  const isStickerOrder = orderTypeFromUrl === 'sticker' || Boolean(stickerIdFromUrl);
  const hasExplicitOrderType = Boolean(orderTypeFromUrl);

  const paymentRef = useRef(null);
  const [productPaymentStepReady, setProductPaymentStepReady] = useState(false);

  const [cardNumber, setCardNumber] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [cardExpiry, setCardExpiry] = useState(''); // MM/YY
  const [cardCvv, setCardCvv] = useState('');

  // When user orders a sticker from Home and has an empty cart,
  // we still need a t-shirt product to attach the sticker to.
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedProductQty, setSelectedProductQty] = useState(1);

  const tshirtHex = useMemo(() => {
    const c = (color || '').trim().toLowerCase();
    if (c === 'black') return '#0b0b0f';
    if (c === 'white') return '#f8fafc';
    if (c === 'red') return '#ef4444';
    if (c === 'blue') return '#2563eb';
    if (c === 'gray' || c === 'grey') return '#9ca3af';
    return '#111827';
  }, [color]);

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

  useEffect(() => {
    fetchPublishedStickers()
      .then((d) => setPublishedStickers(Array.isArray(d) ? d : []))
      .catch(() => setPublishedStickers([]));
  }, []);

  useEffect(() => {
    if (!isStickerOrder) return;
    fetchPandoras()
      .then((d) => setProductsForStickerOrder(Array.isArray(d) ? d : []))
      .catch(() => setProductsForStickerOrder([]));
  }, [isStickerOrder]);

  // Validate product IDs in cart against backend products list.
  // This prevents stale localStorage cart items from causing "Product not found" errors.
  useEffect(() => {
    if (isStickerOrder) return;
    setProductsForCheckoutLoading(true);
    fetchPandoras()
      .then((d) => setProductsForCheckout(Array.isArray(d) ? d : []))
      .catch(() => setProductsForCheckout([]))
      .finally(() => setProductsForCheckoutLoading(false));
  }, [isStickerOrder]);

  // Sticker orders should not require the customer to pick a t-shirt.
  // We auto-pick the first t-shirt-like product.
  useEffect(() => {
    if (!isStickerOrder) return;
    if (!productsForStickerOrder || productsForStickerOrder.length === 0) return;
    if (selectedProductId) return;

    const defaultProduct =
      productsForStickerOrder.find((p) => /t[-\s]?shirt|t\s*shirt|tee/i.test(p?.name || '')) ||
      productsForStickerOrder[0];

    if (defaultProduct?.id != null) {
      setSelectedProductId(String(defaultProduct.id));
      setSelectedProductQty(1);
    }
  }, [isStickerOrder, productsForStickerOrder, selectedProductId]);

  useEffect(() => {
    if (!stickerIdFromUrl) return;
    const found = publishedStickers.find((s) => String(s.id) === String(stickerIdFromUrl));
    if (found?.imageUrl) {
      setStickerUrl(found.imageUrl);
      if (found.printMethod) setPrintMethod(found.printMethod);
    }
  }, [publishedStickers, stickerIdFromUrl]);

  useEffect(() => {
    // Reset step when switching between product and sticker checkout.
    setProductPaymentStepReady(false);
  }, [isStickerOrder]);

  // Keep product and sticker orders separate: in sticker mode, ignore cart contents.
  const effectiveCartItems = isStickerOrder ? [] : (items.length > 0 ? items : []);
  const validProductIdSet = new Set(productsForCheckout.map((p) => String(p?.id)));
  const shouldValidateCartIds = !isStickerOrder && !productsForCheckoutLoading && productsForCheckout.length > 0;
  const validatedCartItems = shouldValidateCartIds ? effectiveCartItems.filter((i) => validProductIdSet.has(String(i?.id))) : effectiveCartItems;

  const orderItemsForTotal = validatedCartItems.length > 0
    ? validatedCartItems
    : (isStickerOrder && selectedProductId)
      ? [{ id: selectedProductId, price: productsForStickerOrder.find((p) => String(p.id) === String(selectedProductId))?.price || 0, quantity: 1 }]
      : [];

  const total = orderItemsForTotal.reduce((sum, item) => sum + Number(item.price || 0) * item.quantity, 0);
  const totalQuantity = orderItemsForTotal.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  // Ensure the UI line-items, Total, and Quantity all use the same validated list.
  const displayCartItems = isStickerOrder ? [] : validatedCartItems;

  async function handlePlaceOrder() {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    try {
      const defaultStickerProduct =
        productsForStickerOrder.find((p) => /t[-\s]?shirt|t\s*shirt|tee/i.test(p?.name || '')) ||
        productsForStickerOrder[0];

      const stickerProductId = selectedProductId || (defaultStickerProduct?.id != null ? String(defaultStickerProduct.id) : '');

      const payloadItems =
        validatedCartItems.length > 0
          ? validatedCartItems
          : stickerProductId
            ? [{ id: stickerProductId, quantity: 1 }]
            : [];

      if (payloadItems.length === 0 || !payloadItems[0]?.id) {
        if (!isStickerOrder && shouldValidateCartIds && items.length > 0 && validatedCartItems.length === 0) {
          alert('Some cart items are no longer available. Please review your cart and try again.');
        } else {
          alert(isStickerOrder ? 'No t-shirt product found for your sticker order.' : 'Your cart is empty.');
        }
        return;
      }

      // If we validated and removed invalid IDs, persist the cleaned cart.
      if (!isStickerOrder && shouldValidateCartIds && validatedCartItems.length !== items.length) {
        localStorage.setItem('cart', JSON.stringify(validatedCartItems));
        setItems(validatedCartItems);
      }

      const payload = payloadItems.map((i) => ({
        productId: Number(i.id),
        quantity: Number(i.quantity),
        stickerUrl: stickerUrl || null,
        printMethod: printMethod || null,
        tshirtColor: color || null,
        tshirtSize: size || null,
        additionalNotes: notes || null,
      }));

      const deliveryLines = [
        fullName.trim() || null,
        phone.trim() ? `Phone: ${phone.trim()}` : null,
        email.trim() ? `Email: ${email.trim()}` : null,
        address.trim() || null,
        [city, postalCode].map((x) => String(x || '').trim()).filter(Boolean).join(', ') || null,
      ].filter(Boolean);
      const deliveryAddress = deliveryLines.length ? deliveryLines.join('\n') : null;

      const created = await createOrder({ items: payload, deliveryAddress });
      localStorage.removeItem('cart');
      setItems([]);
      alert('Order placed successfully.');
      if (created?.id != null) {
        navigate(`/invoice/${created.id}`);
      } else {
        navigate('/orders');
      }
    } catch (e) {
      console.error(e);
      const isAuthError = e.response?.status === 401
        || e.response?.data?.message?.toLowerCase().includes('authorization')
        || e.response?.data?.message?.toLowerCase().includes('invalid token')
        || e.response?.data?.message?.toLowerCase().includes('user not found');
      if (isAuthError) {
        logout();
        navigate('/login', { state: { from: 'checkout', message: 'Please log in to place your order.' } });
        return;
      } else {
        const msg = e.response?.data?.message || 'Failed to place order. Please try again.';
        alert(msg);
      }
    }
  }

  if (!isStickerOrder && items.length === 0 && !hasExplicitOrderType) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-10 md:px-6">
        <h1 className="mb-4 text-2xl font-semibold text-white">Checkout</h1>
        <p className="text-sm text-gray-400">Choose what you want to order.</p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <button
            type="button"
            onClick={() => navigate('/checkout?type=product')}
            className="btn-primary"
          >
            Checkout products
          </button>
          <button
            type="button"
            onClick={() => navigate('/checkout?type=sticker')}
            className="btn-primary"
          >
            Order sticker
          </button>
        </div>
        <button
          type="button"
          onClick={() => navigate('/shop')}
          className="mt-4 block text-center text-xs font-semibold uppercase tracking-[0.25em] text-white/70 hover:text-white"
        >
          Continue shopping
        </button>
      </section>
    );
  }

  if (!isStickerOrder && items.length === 0 && hasExplicitOrderType && orderTypeFromUrl === 'product') {
    return (
      <section className="mx-auto max-w-4xl px-4 py-10 md:px-6">
        <h1 className="mb-4 text-2xl font-semibold text-white">Product checkout</h1>
        <p className="text-sm text-gray-400">Your cart is empty. Add items to continue.</p>
        <button
          type="button"
          onClick={() => navigate('/shop')}
          className="btn-primary mt-4"
        >
          Continue shopping
        </button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <h1 className="mb-6 text-2xl font-semibold text-white">
        {isStickerOrder ? 'Sticker checkout' : 'Product checkout'}
      </h1>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/checkout?type=product')}
          className={`rounded-full px-6 py-2 text-xs font-extrabold uppercase tracking-[0.25em] ${
            !isStickerOrder ? 'bg-white text-black hover:bg-gray-100' : 'border border-white/15 bg-black/20 text-white hover:bg-white/10'
          }`}
        >
          Product checkout
        </button>
        <button
          type="button"
          onClick={() => navigate('/checkout?type=sticker')}
          className={`rounded-full px-6 py-2 text-xs font-extrabold uppercase tracking-[0.25em] ${
            isStickerOrder ? 'bg-white text-black hover:bg-gray-100' : 'border border-white/15 bg-black/20 text-white hover:bg-white/10'
          }`}
        >
          Sticker checkout
        </button>
      </div>

      {displayCartItems.length > 0 ? (
        <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-[#111827] shadow-sm">
          {displayCartItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div>
                <div className="text-sm font-medium text-white">{item.name}</div>
                <div className="text-xs text-gray-400">
                  LKR {Number(item.price || 0).toFixed(2)} x {item.quantity}
                </div>
              </div>
              <div className="text-sm font-medium text-white">
                LKR {(Number(item.price || 0) * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      ) : isStickerOrder ? (
        null
      ) : null}

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-white/10 bg-[#020617] p-5">
          <h2 className="text-sm font-semibold text-white">Delivery information</h2>
          <div className="space-y-3 text-xs text-gray-200">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-[11px] uppercase tracking-[0.2em] text-gray-400">
                  Full name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-white/40"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-[0.2em] text-gray-400">
                  Phone number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-white/40"
                  placeholder="+94 XXX XXX XXX"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-[0.2em] text-gray-400">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-white/40"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-[11px] uppercase tracking-[0.2em] text-gray-400">
                Delivery address
              </label>
              <textarea
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-white/40"
                placeholder="Street, apartment, building"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-[0.2em] text-gray-400">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-white/40"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-[0.2em] text-gray-400">
                  Postal code
                </label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-white/40"
                  placeholder="e.g. 10000"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-[0.2em] text-gray-400">
                  Color
                </label>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-white/40"
                  placeholder="e.g. Black, White, Red"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-[0.2em] text-gray-400">
                  Quantity
                </label>
                  <input
                    type="number"
                    value={totalQuantity}
                    readOnly={true}
                    className="w-full cursor-default rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-xs text-white outline-none"
                  />
              </div>
            </div>
          </div>
        </div>

        {isStickerOrder && (
        <div className="space-y-4 rounded-2xl border border-white/10 bg-[#020617] p-5">
          <h2 className="text-sm font-semibold text-white">Sticker &amp; print preview</h2>
          <div className="space-y-4 text-xs text-gray-200">
            {/* Sticker picker */}
            <div>
              <div className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-gray-400">
                Pick a sticker (or upload your own)
              </div>
              {publishedStickers.length > 0 ? (
                <div className="grid gap-2 grid-cols-4">
                  {publishedStickers.slice(0, 8).map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setStickerUrl(s.imageUrl || '');
                        if (s.printMethod) setPrintMethod(s.printMethod);
                      }}
                      className={`overflow-hidden rounded-lg border ${
                        stickerUrl && s.imageUrl === stickerUrl ? 'border-white' : 'border-white/10'
                      } bg-black/20 hover:border-white/40`}
                      title={s.title}
                    >
                      {s.imageUrl ? (
                        <img src={s.imageUrl} alt={s.title} className="h-14 w-full object-cover" />
                      ) : null}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-white/60">No published stickers yet.</div>
              )}
            </div>

            <ImageUpload3D
              label="Upload your sticker"
              value={stickerUrl}
              onChange={(url) => setStickerUrl(url)}
            />

            <div>
              <label className="mb-1 block text-[11px] uppercase tracking-[0.2em] text-gray-400">
                Print method
              </label>
              <select
                value={printMethod}
                onChange={(e) => setPrintMethod(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-white/40"
              >
                <option value="PUFF">Puff</option>
                <option value="FOIL">Foil</option>
                <option value="DTF">DTF</option>
                <option value="DTG">DTG</option>
                <option value="SCREEN_PRINTING">Screen Printing</option>
              </select>
            </div>

            {/* Preview */}
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-white/60">
                <span>Preview</span>
                <span>{printMethod}</span>
              </div>
              <div className="relative mx-auto h-52 w-full overflow-hidden rounded-xl border border-white/10 bg-black/30">
                <div
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(circle at 35% 20%, rgba(255,255,255,0.14), transparent 55%), linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.65))`,
                  }}
                  aria-hidden
                />
                {/* shirt */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="relative h-44 w-40 rounded-2xl border border-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.55)]"
                    style={{ backgroundColor: tshirtHex }}
                    aria-label="T-shirt preview"
                  >
                    {/* sleeves */}
                    <div className="absolute -left-7 top-6 h-16 w-12 rounded-xl border border-white/10" style={{ backgroundColor: tshirtHex }} />
                    <div className="absolute -right-7 top-6 h-16 w-12 rounded-xl border border-white/10" style={{ backgroundColor: tshirtHex }} />
                    {/* neckline */}
                    <div className="absolute left-1/2 top-2 h-6 w-14 -translate-x-1/2 rounded-b-2xl border border-white/10 bg-black/20" />

                    {/* sticker */}
                    {stickerUrl ? (
                      <img
                        src={stickerUrl}
                        alt="Sticker preview"
                        className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[11px] uppercase tracking-[0.2em] text-white/50">
                        No sticker
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-2 text-xs text-white/60">
                T‑shirt color: <span className="text-white/80">{color || 'Default'}</span> · Size:{' '}
                <span className="text-white/80">{size}</span>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[11px] uppercase tracking-[0.2em] text-gray-400">
                Size
              </label>
              <div className="flex flex-wrap gap-2">
                {['S', 'M', 'L', 'XL', '2XL', '3XL'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`h-8 min-w-[2.5rem] rounded-full border px-3 text-xs font-semibold ${
                      size === s
                        ? 'border-white bg-white text-black'
                        : 'border-white/20 text-gray-200 hover:border-white/60'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes moved below so both product + sticker checkout can edit */}
          </div>
        </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between text-sm text-gray-300">
        <span>Total</span>
        <span className={`text-lg font-bold ${isStickerOrder ? 'text-white' : 'text-[#ef4444]'}`}>LKR {total.toFixed(2)}</span>
      </div>

      {/* Payment method (needed for both product + sticker checkout) */}
      <div ref={paymentRef} className="mt-6 space-y-4 rounded-2xl border border-white/10 bg-[#020617] p-5">
        <h2 className="text-sm font-semibold text-white">Payment method</h2>
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-200">
            <input
              type="radio"
              name="payment"
              value="COD"
              checked={paymentMethod === 'COD'}
              onChange={(e) => {
                setPaymentMethod(e.target.value);
                if (!isStickerOrder) setProductPaymentStepReady(true);
              }}
              className="h-3 w-3 accent-white"
            />
            <span>Cash on delivery</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-200">
            <input
              type="radio"
              name="payment"
              value="ONLINE"
              checked={paymentMethod === 'ONLINE'}
              onChange={(e) => {
                setPaymentMethod(e.target.value);
                if (!isStickerOrder) setProductPaymentStepReady(true);
              }}
              className="h-3 w-3 accent-white"
            />
            <span>Online payment (Visa, Mastercard)</span>
          </label>
        </div>

        {paymentMethod === 'ONLINE' && (
          <div className="space-y-3 rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-[11px] uppercase tracking-[0.2em] text-gray-400">
                  Card number
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-white/40"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-[0.2em] text-gray-400">
                  Name on card
                </label>
                <input
                  type="text"
                  value={cardHolderName}
                  onChange={(e) => setCardHolderName(e.target.value)}
                  placeholder="Full name"
                  className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-white/40"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-[0.2em] text-gray-400">
                  Expiry (MM/YY)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  placeholder="MM/YY"
                  className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-white/40"
                />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="md:col-span-1">
                <label className="mb-1 block text-[11px] uppercase tracking-[0.2em] text-gray-400">
                  CVV
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value)}
                  placeholder="123"
                  className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-white/40"
                />
              </div>
              <div className="flex items-end text-[11px] text-gray-400 md:justify-end">
                <span>Card details are collected for UI only (backend does not store payment info).</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6">
        <label className="mb-1 block text-[11px] uppercase tracking-[0.2em] text-gray-400">
          Additional notes (optional)
        </label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-white/40"
          placeholder="Any special delivery instructions or fit preferences"
        />
      </div>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={() => navigate(isStickerOrder ? '/shop' : '/cart')}
          className={`rounded-full border px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] ${
            isStickerOrder
              ? 'border-white/15 bg-black/0 text-white hover:bg-white/10'
              : 'border-red-500/60 bg-black/0 text-red-200 hover:bg-red-500/15'
          }`}
        >
          {isStickerOrder ? 'Back to shop' : 'Cancel order'}
        </button>
        <button
          type="button"
          onClick={() => {
            if (!isStickerOrder && !productPaymentStepReady) {
              // First click: bring payment method into view.
              paymentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              setProductPaymentStepReady(true);
              return;
            }
            handlePlaceOrder();
          }}
          disabled={!isStickerOrder && productsForCheckoutLoading && productPaymentStepReady}
          className={`btn-primary flex-1 ${
            !isStickerOrder && productsForCheckoutLoading && productPaymentStepReady ? 'opacity-60 cursor-not-allowed' : ''
          }`}
        >
          {isStickerOrder ? 'Place sticker order' : productPaymentStepReady ? 'Place product order' : 'Go to payment'}
        </button>
      </div>
    </section>
  );
}

export default Checkout;
