import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchPandoraById, fetchPandoras } from '../services/pandoraService';

function PandoraDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pandora, setPandora] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setLoaded(false);
    load();
  }, [id]);

  async function load() {
    try {
      let p = null;
      try {
        p = await fetchPandoraById(id);
      } catch {
        const data = await fetchPandoras();
        p = Array.isArray(data) ? data.find((x) => String(x.id) === String(id)) : null;
      }
      setPandora(p || null);
    } catch (e) {
      console.error(e);
      setPandora(null);
    } finally {
      setLoaded(true);
    }
  }

  function handleAddToCart() {
    if (!pandora) return;
    const existing = JSON.parse(localStorage.getItem('cart') || '[]');
    const idx = existing.findIndex((i) => i.id === pandora.id);
    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    if (idx >= 0) {
      existing[idx].quantity += qty;
    } else {
      existing.push({ ...pandora, quantity: qty });
    }
    localStorage.setItem('cart', JSON.stringify(existing));
    navigate('/cart');
  }

  if (!loaded) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-10 md:px-6">
        <p className="text-sm text-gray-400">Loading…</p>
      </section>
    );
  }

  if (!pandora) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-10 md:px-6">
        <p className="text-sm text-gray-400">Item not found.</p>
        <Link to="/shop" className="mt-4 inline-block text-white hover:underline">
          Back to shop
        </Link>
      </section>
    );
  }

  const inStock = (pandora.stockQuantity || 0) > 0;

  return (
    <section className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <Link to="/shop" className="mb-6 inline-flex items-center gap-1 text-xs text-gray-400 hover:text-white">
        ← Back to shop
      </Link>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111827] shadow-sm md:flex">
        <div className="h-48 w-full bg-black/20 md:h-80 md:w-80 md:shrink-0">
          {pandora.imageUrl ? (
            <img src={pandora.imageUrl} alt={pandora.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/10 to-white/0">
              <span className="text-4xl font-semibold text-white/40">P</span>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-6">
          <div className="mb-2">
            <span className="rounded-full bg-black/30 px-2 py-0.5 text-[11px] text-[#60a5fa]">
              {pandora.category || 'General'}
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-white">{pandora.name}</h1>
          <p className="mt-2 text-sm text-gray-300">
            {pandora.description || 'Premium Pandora clothing item. Designed for modern fit and extreme comfort.'}
          </p>
          <div className="mt-4 flex items-center gap-4">
            <span className="text-2xl font-bold text-white">LKR {Number(pandora.price || 0).toFixed(2)}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                inStock ? 'bg-green-500/15 text-green-200' : 'bg-red-500/15 text-red-200'
              }`}
            >
              {inStock ? `In stock (${pandora.stockQuantity})` : 'Out of stock'}
            </span>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-400">Quantity</label>
              <input
                type="number"
                min="1"
                max={pandora.stockQuantity || 99}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-20 rounded-lg border border-white/10 bg-[#0b0b12] px-2 py-1.5 text-sm text-white"
              />
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!inStock}
              className="btn-primary disabled:opacity-50"
            >
              Add to cart
            </button>
          </div>
          <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs font-medium text-gray-400">Care Instructions</div>
            <p className="mt-1 text-sm text-gray-300">
              Machine wash cold, inside out, with like colors. Do not bleach. Tumble dry low or hang dry to preserve fabric quality.
            </p>
          </div>
          <Link to="/about" className="mt-4 text-xs text-white hover:underline">
            Want to know more about our drops? Learn here →
          </Link>
        </div>
      </div>
    </section>
  );
}

export default PandoraDetail;
