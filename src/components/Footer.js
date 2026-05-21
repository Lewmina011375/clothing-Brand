import { Link } from 'react-router-dom';
import { useState } from 'react';

function Footer() {
  const [email, setEmail] = useState('');

  return (
    <footer className="border-t border-black/10 bg-white text-neutral-700">
      {/* Upper footer: 4 columns */}
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Services with icons */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.25em] text-black">Services</h3>
            <ul className="mt-4 space-y-4 text-sm text-neutral-600">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0 text-black/70">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                </span>
                Worldwide Shipping
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0 text-black/70">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </span>
                Easy Returns
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0 text-black/70">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </span>
                Secure Payments
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0 text-black/70">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </span>
                Style Support
              </li>
            </ul>
          </div>
          {/* Column 2: Store links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.25em] text-black">Pandora Store</h3>
            <ul className="mt-4 space-y-2 text-sm text-neutral-600">
              <li><Link to="/products?category=women" className="hover:text-black">Women</Link></li>
              <li><Link to="/products?category=men" className="hover:text-black">Men</Link></li>
              <li><Link to="/products?category=accessories" className="hover:text-black">Accessories</Link></li>
              <li><Link to="/products?category=sale" className="hover:text-black">Sale</Link></li>
            </ul>
          </div>
          {/* Column 3: Our Company */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.25em] text-black">Our Brand</h3>
            <ul className="mt-4 space-y-2 text-sm text-neutral-600">
              <li><a href="#story" className="hover:text-black">Our Story</a></li>
              <li><a href="#sustainability" className="hover:text-black">Sustainability</a></li>
              <li><a href="#stores" className="hover:text-black">Stores</a></li>
            </ul>
          </div>
          {/* Column 4: Newsletter */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.25em] text-black">Newsletter</h3>
            <p className="mt-2 text-sm text-neutral-600">Style inspiration, new drops, and exclusive offers.</p>
            <form className="mt-4 flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="input min-w-0 flex-1"
              />
              <button type="submit" className="btn-primary">Subscribe</button>
            </form>
          </div>
        </div>
        {/* Bottom bar: copyright + payment icons */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-black/10 pt-8 sm:flex-row">
          <p className="text-sm text-neutral-500">© {new Date().getFullYear()} Pandora Clothing. All Rights Reserved.</p>
          <div className="flex items-center gap-4 text-neutral-500">
            <span className="text-xs font-semibold">Visa</span>
            <span className="text-xs font-semibold">Mastercard</span>
            <span className="text-xs font-semibold">Amex</span>
            <span className="text-xs font-semibold">PayPal</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
