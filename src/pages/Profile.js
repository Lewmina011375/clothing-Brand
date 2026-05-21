import { useNavigate } from 'react-router-dom';
import { isLoggedIn, logout } from '../services/userService';

function Profile() {
  const navigate = useNavigate();
  const fullName = localStorage.getItem('fullName');
  const email = localStorage.getItem('email');
  const role = localStorage.getItem('role');

  function handleLogout() {
    logout();
    navigate('/');
  }

  if (!isLoggedIn()) {
    navigate('/login');
    return null;
  }

  return (
    <section className="relative isolate min-h-[70vh] bg-[#060812] px-4 py-12 md:px-6">
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center opacity-100"
        style={{ backgroundImage: `url("${process.env.PUBLIC_URL}/images/auth-bg.svg")` }}
        aria-hidden
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/10 via-black/30 to-black/60" aria-hidden />

      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_30px_90px_rgba(0,0,0,0.55)] backdrop-blur">
          <div className="grid md:grid-cols-2">
            {/* Left: content */}
            <div className="p-8 md:p-12">
              <p className="text-xs font-extrabold uppercase tracking-[0.35em] text-white/70">Account</p>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-white">Your profile</h1>
              <p className="mt-3 text-sm text-white/70">
                Manage your account details and sign out securely.
              </p>

              <div className="mt-8 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white/70">Name</label>
                  <input
                    value={fullName || '—'}
                    readOnly
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-white/10"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white/70">Email</label>
                  <input
                    value={email || '—'}
                    readOnly
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-white/10"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white/70">Role</label>
                  <input
                    value={role || 'USER'}
                    readOnly
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-white/10"
                  />
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center rounded-xl bg-[#2563eb] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1d4ed8]"
                >
                  Log out
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/0 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Back home
                </button>
              </div>
            </div>

            {/* Right: visual */}
            <div className="relative hidden md:block">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" aria-hidden />
              <div className="absolute inset-0 bg-black/10" aria-hidden />
              <div className="absolute bottom-10 right-10 w-[72%] max-w-md overflow-hidden rounded-3xl border border-white/10 bg-black/20 p-6 text-white shadow-[0_30px_90px_rgba(0,0,0,0.55)] backdrop-blur">
                <div className="text-xs font-extrabold uppercase tracking-[0.35em] text-white/70">Pandora Clothing</div>
                <div className="mt-3 text-3xl font-black leading-tight">
                  Wear comfort.
                  <br />
                  Wear confidence.
                </div>
                <div className="mt-4 text-sm text-white/70">
                  New drops weekly. Keep your profile updated for faster checkout.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Profile;
