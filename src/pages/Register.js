import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/userService';

function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      await register({ fullName, email, password, role: 'USER' });
      navigate('/');
    } catch (err) {
      console.error('Register error:', err);
      const msg = err.response?.data?.message || err.message;
      const status = err.response?.status;
      if (msg?.toLowerCase().includes('already')) {
        setError('This email is already registered. Try logging in or use a different email.');
      } else if (!err.response) {
        setError('Cannot reach server. Is the backend running on http://localhost:8080?');
      } else if (status === 500) {
        setError('Server error. Check if SQL Server is running and the database exists.');
      } else {
        setError(msg || 'Could not create account. Try a different email.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="relative isolate min-h-[70vh] bg-[#060812] px-4 py-12 md:px-6">
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center opacity-100"
        style={{ backgroundImage: `url("${process.env.PUBLIC_URL}/images/auth-bg.svg")` }}
        aria-hidden
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/10 via-black/40 to-black/80" aria-hidden />

      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_30px_90px_rgba(0,0,0,0.55)] backdrop-blur">
          <div className="grid md:grid-cols-2">
            {/* Left: form */}
            <div className="p-8 md:p-12">
              <p className="text-xs font-extrabold uppercase tracking-[0.35em] text-white/70">
                Start for free
              </p>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-white md:text-4xl">
                Create your Pandora account
              </h1>
              <p className="mt-3 text-sm text-white/70">
                Save your details, track orders, and checkout faster on every drop.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                {error && (
                  <p className="rounded-md bg-red-500/15 px-3 py-2 text-xs text-red-200">{error}</p>
                )}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-white/70">Full name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-white/10"
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-white/70">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-white/10"
                    placeholder="you@example.com"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-white/70">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-white/10"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-white/70">Account type</label>
                  <p className="text-xs text-white/60">Customer</p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-[#2563eb] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1d4ed8] disabled:opacity-60"
                >
                  {loading ? 'Creating account…' : 'Create account'}
                </button>
                <p className="pt-2 text-[11px] text-white/70">
                  Already have an account?{' '}
                  <Link to="/login" className="text-white underline-offset-2 hover:underline">
                    Log in
                  </Link>
                  .
                </p>
              </form>
            </div>

            {/* Right: visual */}
            <div className="relative hidden md:block">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" aria-hidden />
              <div className="absolute bottom-10 right-10 w-[72%] max-w-md overflow-hidden rounded-3xl border border-white/10 bg-black/25 p-6 text-white shadow-[0_30px_90px_rgba(0,0,0,0.55)] backdrop-blur">
                <div className="text-xs font-extrabold uppercase tracking-[0.35em] text-white/70">
                  Pandora Clothing
                </div>
                <div className="mt-3 text-3xl font-black leading-tight">
                  Join the
                  <br />
                  monochrome club.
                </div>
                <div className="mt-4 text-sm text-white/70">
                  One account for all your orders, favorites, and profile settings.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Register;

