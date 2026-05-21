import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../services/userService';
import { fetchPandoras } from '../services/pandoraService';
import PandoraCard from '../components/PandoraCard';

function UserHome() {
  const navigate = useNavigate();
  const fullName = localStorage.getItem('fullName') || localStorage.getItem('email') || 'User';
  const isLoggedIn = !!localStorage.getItem('token');
  const [featuredPandoras, setFeaturedPandoras] = useState([]);

  useEffect(() => {
    if (!isLoggedIn) navigate('/login');
    else loadFeatured();
  }, [isLoggedIn, navigate]);

  async function loadFeatured() {
    try {
      const data = await fetchPandoras();
      setFeaturedPandoras(Array.isArray(data) ? data.slice(0, 6) : []);
    } catch (e) {
      console.error(e);
    }
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

  function handleLogout() {
    logout();
    navigate('/');
  }

  if (!isLoggedIn) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#191e2b]">Welcome back, {fullName}!</h1>
        <p className="mt-1 text-sm text-gray-600">
          Your dashboard. Browse collections, manage orders, and track deliveries.
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          to="/shop"
          className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-[#00c6e6]/50 hover:shadow-md"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#bfc0d1] text-[#00c6e6]">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">Browse collections</div>
            <div className="text-xs text-gray-500">Shop our catalogue</div>
          </div>
        </Link>
        <Link
          to="/cart"
          className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-[#00c6e6]/50 hover:shadow-md"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#bfc0d1] text-[#00c6e6]">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">View cart</div>
            <div className="text-xs text-gray-500">Checkout when ready</div>
          </div>
        </Link>
        <Link
          to="/orders"
          className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-[#00c6e6]/50 hover:shadow-md"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#bfc0d1] text-[#00c6e6]">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 00-2 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">My orders</div>
            <div className="text-xs text-gray-500">Track deliveries</div>
          </div>
        </Link>
        <Link
          to="/about"
          className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-[#00c6e6]/50 hover:shadow-md"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#bfc0d1] text-[#00c6e6]">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">Lookbook</div>
            <div className="text-xs text-gray-500">View essentials</div>
          </div>
        </Link>
      </div>

      <div className="mb-6 rounded-xl border border-[#00c6e6]/30 bg-[#bfc0d1]/20 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-medium text-[#00c6e6]">
          <span>Limited time</span>
          <span className="rounded bg-[#00c6e6]/30 px-2 py-0.5 text-[11px] text-[#253045]">Promo</span>
        </div>
        <p className="mt-1 text-xs text-gray-600">
          Free delivery on orders over LKR 120. Use code <strong className="text-[#00c6e6]">SAVE10</strong> for 10% off your first order.
        </p>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#191e2b]">Featured collections</h2>
        <Link to="/shop" className="text-xs font-medium text-[#00c6e6] hover:underline">
          View all →
        </Link>
      </div>
      {featuredPandoras.length === 0 ? (
        <p className="text-sm text-gray-500">No items available. Check back soon.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featuredPandoras.map((m) => (
            <PandoraCard key={m.id} pandora={m} onAddToCart={handleAddToCart} />
          ))}
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/profile" className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
          Profile settings
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          Log out
        </button>
      </div>
    </section>
  );
}

export default UserHome;
