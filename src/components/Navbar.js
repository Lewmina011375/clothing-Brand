import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { isLoggedIn, isAdmin, logout } from '../services/userService';

const navLinkClasses = ({ isActive }) =>
  `text-sm font-medium transition ${
    isActive ? 'text-black' : 'text-neutral-700 hover:text-black'
  }`;

const ADMIN_TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'customers', label: 'Customers' },
  { id: 'orders', label: 'Orders' },
  { id: 'products', label: 'Products' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'payments', label: 'Payments' },
  { id: 'reports', label: 'Reports' },
  { id: 'settings', label: 'Settings' }
];

function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const loggedIn = isLoggedIn();
  const admin = isAdmin();
  const isAdminPage = location.pathname === '/admin';
  const rawTab = (searchParams.get('tab') || 'dashboard').toLowerCase();
  const adminTabIds = ADMIN_TABS.map((t) => t.id);
  const activeAdminTab = adminTabIds.includes(rawTab) ? rawTab : 'dashboard';

  if (isAdminPage && admin) {
    return (
      <header className="sticky top-0 z-40 border-b border-[#253045] bg-[#191e2b]/95 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#00c6e6] text-white shadow-lg shadow-[#00c6e6]/30">
              <span className="text-lg font-semibold">P</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-white">Pandora Admin</span>
              <span className="text-xs text-[#bfc0d1]">Store management</span>
            </div>
          </Link>

          <div className="scrollbar-hide flex flex-1 justify-center gap-1 overflow-x-auto px-4 md:gap-2">
            {ADMIN_TABS.map((tab) => (
              <NavLink
                key={tab.id}
                to={`/admin?tab=${tab.id}`}
                className={`whitespace-nowrap px-3 py-2 text-xs font-medium transition md:px-4 ${
                  activeAdminTab === tab.id
                    ? 'border-b-2 border-[#00c6e6] text-[#00c6e6]'
                    : 'text-[#bfc0d1] hover:text-white'
                }`}
              >
                {tab.label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link to="/" className="text-xs text-[#bfc0d1] hover:text-white">
              Back to site
            </Link>
            <button
              type="button"
              onClick={() => { logout(); navigate('/'); }}
              className="btn-mini"
            >
              Log out
            </button>
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur">
      {/* Minimal top bar */}
      <div className="border-b border-black/10 bg-white text-xs text-neutral-700">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 md:px-6">
          <p>Free shipping over LKR 120. <button type="button" className="underline">Shop now</button></p>
          <div className="flex items-center gap-4">
            <span className="flex cursor-pointer items-center gap-1">English <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></span>
            <span className="flex cursor-pointer items-center gap-1">LKR <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></span>
          </div>
        </div>
      </div>
      {/* Main header: logo, center nav, right icons */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white">
            <span className="text-lg font-semibold">P</span>
          </div>
          <span className="text-xl font-semibold tracking-[0.2em] text-black">PANDORA</span>
        </Link>

        <div className="hidden flex-1 justify-center gap-8 md:flex">
          <NavLink to="/" className={navLinkClasses({ isActive: location.pathname === '/' })}>Home</NavLink>
          <NavLink to="/shop" className={navLinkClasses({ isActive: location.pathname === '/shop' || location.pathname === '/products' })}>Shop</NavLink>
          <NavLink to="/about" className={navLinkClasses({ isActive: location.pathname === '/about' })}>About</NavLink>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 text-neutral-700">
          <Link to={loggedIn ? '/profile' : '/login'} className="rounded-lg p-2 hover:bg-black/5 hover:text-black" title="Account">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </Link>
          <Link to="/shop" className="rounded-lg p-2 hover:bg-black/5 hover:text-black" title="Wishlist">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          </Link>
          <Link to="/cart" className="rounded-lg p-2 hover:bg-black/5 hover:text-black" title="Cart">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </Link>
          {loggedIn && (
            <Link to="/orders" className="rounded-lg p-2 hover:bg-black/5 hover:text-black" title="My orders">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 11h18M3 15h18M7 3v18" /></svg>
            </Link>
          )}
          <button type="button" onClick={() => navigate('/shop')} className="rounded-lg p-2 hover:bg-black/5 hover:text-black" title="Search">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>
          {admin && <NavLink to="/admin" className="text-sm font-medium text-neutral-700 hover:text-black">Admin</NavLink>}
        </div>

        <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 text-neutral-800 hover:bg-black/5 md:hidden" onClick={() => setOpen((v) => !v)}>
          <span className="sr-only">Menu</span>
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </nav>

      {open && (
        <div className="border-t border-black/10 bg-white md:hidden">
          <div className="flex flex-col gap-1 px-4 py-3">
            <NavLink to="/" onClick={() => setOpen(false)} className="py-2 text-sm font-medium text-neutral-800">Home</NavLink>
            <NavLink to="/shop" onClick={() => setOpen(false)} className="py-2 text-sm font-medium text-neutral-800">Shop</NavLink>
            <NavLink to="/about" onClick={() => setOpen(false)} className="py-2 text-sm font-medium text-neutral-800">About</NavLink>
            <NavLink to="/cart" onClick={() => setOpen(false)} className="py-2 text-sm font-medium text-neutral-800">Cart</NavLink>
            {loggedIn && <NavLink to="/profile" onClick={() => setOpen(false)} className="py-2 text-sm font-medium text-neutral-800">My Account</NavLink>}
            {loggedIn && <NavLink to="/orders" onClick={() => setOpen(false)} className="py-2 text-sm font-medium text-neutral-800">My orders</NavLink>}
            {admin && <NavLink to="/admin" onClick={() => setOpen(false)} className="py-2 text-sm font-medium text-neutral-800">Admin</NavLink>}
            <div className="mt-2 flex gap-2 border-t border-black/10 pt-2">
              {loggedIn ? (
                <button type="button" onClick={() => { logout(); navigate('/'); setOpen(false); }} className="btn-secondary w-full justify-center">Log out</button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="btn-secondary w-full justify-center">Log in</Link>
                  <Link to="/register" onClick={() => setOpen(false)} className="btn-primary w-full justify-center">Register</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;

