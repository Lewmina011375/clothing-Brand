import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PandoraCard from '../components/PandoraCard';
import { fetchPandoras } from '../services/pandoraService';

function Shop() {
  const [searchParams] = useSearchParams();
  const [pandoras, setPandoras] = useState([]);
  const [query, setQuery] = useState(searchParams.get('q') || searchParams.get('category') || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = searchParams.get('q') || searchParams.get('category') || '';
    setQuery(q);
    load(q || undefined);
  }, [searchParams.get('q'), searchParams.get('category')]);

  async function load(searchTerm) {
    try {
      setLoading(true);
      const data = await fetchPandoras(searchTerm);
      setPandoras(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    load(query);
  }

  function handleAddToCart(pandora) {
    const existing = JSON.parse(localStorage.getItem('cart') || '[]');
    const idx = existing.findIndex((i) => i.id === pandora.id);
    if (idx >= 0) {
      existing[idx].quantity += 1;
    } else {
      existing.push({ ...pandora, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(existing));
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Shop</h1>
          <p className="text-sm text-gray-400">Search our catalogue and add items to your cart.</p>
        </div>
        <form onSubmit={handleSearch} className="flex w-full max-w-md gap-2">
          <input
            type="search"
            placeholder="Search by item name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input flex-1 px-4"
          />
          <button type="submit" className="btn-secondary px-6">Search</button>
        </form>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : pandoras.length === 0 ? (
        <p className="text-sm text-gray-400">No items found.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pandoras.map((m) => (
            <PandoraCard key={m.id} pandora={m} onAddToCart={handleAddToCart} />
          ))}
        </div>
      )}
    </section>
  );
}

export default Shop;

