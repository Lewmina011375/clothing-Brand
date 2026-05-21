import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { login } from '../services/userService';
import api from '../services/apiClient';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [seedMsg, setSeedMsg] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const fromCheckout = location.state?.from === 'checkout';
  const redirectTo = fromCheckout ? '/checkout' : '/';

  const infoMessage = location.state?.message;

  async function handleSeedAdmin() {
    try {
      const { data } = await api.post('/auth/seed-admin');
      setSeedMsg(data.message || 'Admin created.');
    } catch (e) {
      setSeedMsg(e.response?.data?.message || 'Failed to create admin.');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      await login(email, password);
      navigate(redirectTo);
    } catch (err) {
      console.error(err);
      setError('Invalid email or password.');
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
                {fromCheckout ? 'Checkout' : 'Welcome back'}
              </p>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-white md:text-4xl">
                Sign in to Pandora
              </h1>
              <p className="mt-3 text-sm text-white/70">
                {fromCheckout
                  ? 'Log in to complete your order and track delivery.'
                  : 'Access your orders, favorites, and profile.'}
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                {infoMessage && (
                  <p className="rounded-md bg-blue-500/15 px-3 py-2 text-xs text-blue-200">{infoMessage}</p>
                )}
                {error && (
                  <p className="rounded-md bg-red-500/15 px-3 py-2 text-xs text-red-200">{error}</p>
                )}
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
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-[#2563eb] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1d4ed8] disabled:opacity-60"
                >
                  {loading ? 'Signing in…' : 'Sign in'}
                </button>
                <p className="pt-2 text-[11px] text-white/70">
                  Don&apos;t have an account?{' '}
                  <Link to="/register" className="text-white underline-offset-2 hover:underline">
                    Create one
                  </Link>
                  .
                </p>
                <p className="pt-2 text-[11px] text-white/60">
                  Admin quick setup?{' '}
                  <button
                    type="button"
                    onClick={handleSeedAdmin}
                    className="underline underline-offset-2"
                  >
                    Seed admin
                  </button>
                  {seedMsg && <span className="ml-2 text-blue-200">{seedMsg}</span>}
                </p>
              </form>
            </div>

            {/* Right: visual */}
            <div className="relative hidden md:block">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" aria-hidden />
              <div className="absolute bottom-10 left-10 w-[72%] max-w-md overflow-hidden rounded-3xl border border-white/10 bg-black/25 p-6 text-white shadow-[0_30px_90px_rgba(0,0,0,0.55)] backdrop-blur">
                <div className="text-xs font-extrabold uppercase tracking-[0.35em] text-white/70">
                  Pandora Clothing
                </div>
                <div className="mt-3 text-3xl font-black leading-tight">
                  Start your
                  <br />
                  next drop.
                </div>
                <div className="mt-4 text-sm text-white/70">
                  One login for all your orders, favorites, and profile settings.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Login;

