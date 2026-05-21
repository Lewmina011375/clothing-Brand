import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchPandoras } from '../../services/pandoraService';

function ProductCatalog() {
  const [products, setProducts] = useState([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPandoras().then((d) => setProducts(Array.isArray(d) ? d : [])).catch(() => setProducts([]));
  }, []);

  const categoryParam = (searchParams.get('category') || '').toLowerCase();
  const filtered = products.filter((p) => {
    if (!categoryParam) return true;
    const cat = (p.category || '').toLowerCase();
    if (categoryParam === 'sale') {
      return p.onSale || false;
    }
    return cat === categoryParam;
  });

  function handleAddToCart(product, goToCart = false) {
    const existing = JSON.parse(localStorage.getItem('cart') || '[]');
    const idx = existing.findIndex((i) => i.id === product.id);
    if (idx >= 0) {
      existing[idx] = { ...existing[idx], quantity: Number(existing[idx].quantity || 1) + 1 };
    } else {
      existing.push({
        id: product.id,
        name: product.name,
        price: Number(product.price || 0),
        quantity: 1,
      });
    }
    localStorage.setItem('cart', JSON.stringify(existing));
    if (goToCart) {
      navigate('/cart');
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">
          {categoryParam === 'women' && 'Women'}
          {categoryParam === 'men' && 'Men'}
          {categoryParam === 'accessories' && 'Accessories'}
          {categoryParam === 'sale' && 'Sale'}
          {!categoryParam && 'All Products'}
        </h1>
      </div>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111827] shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="h-56 w-full bg-black/20">
              {p.imageUrl ? (
                <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
              ) : (
                <div className="flex h-full items-center justify-center text-xs tracking-[0.25em] text-gray-400">
                  PANDORA
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400">{p.category || 'Apparel'}</p>
              <p className="mt-2 line-clamp-2 text-sm font-semibold text-white">{p.name}</p>
              <p className="mt-2 text-base font-bold text-[#60a5fa]">LKR {Number(p.price || 0).toFixed(2)}</p>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleAddToCart(p, false)}
                  className="flex-1 rounded-full border border-white/20 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-200 hover:bg-white/10"
                >
                  Add Cart
                </button>
                <button
                  type="button"
                  onClick={() => handleAddToCart(p, true)}
                  className="flex-1 rounded-full bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-black hover:bg-gray-100"
                >
                  Order Now
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-12 text-center text-gray-400">No products found.</p>
        )}
      </div>
    </div>
  );
}

export default ProductCatalog;

