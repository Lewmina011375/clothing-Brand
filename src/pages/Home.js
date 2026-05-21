import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchPublishedStickers } from '../services/stickerService';

const IMG = {
  hero:'https://res.cloudinary.com/jerrick/image/upload/v1714719016/66348928385a67001dd6f0f2.jpg',
  c1: 'https://5.imimg.com/data5/SELLER/Default/2024/11/469365141/XI/OC/GL/119040803/puff-print-mens-t-shirt-500x500.jpeg',
  c2: 'https://fromthestreets.in/cdn/shop/files/FTS_Hoodie_Mockup_front_4_1.png?v=1729009033',
  c3: 'https://image.made-in-china.com/202f0j00dpskJLPRlcqo/Custom-Logo-Baseball-Loose-Casual-Stadium-Award-Varsity-Sport-Jersey-Jacket-Green-Blue-Baseball-Jacket-for-Men.webp',
  p1: `${process.env.PUBLIC_URL}/images/street/print1.svg`,
  p2: `${process.env.PUBLIC_URL}/images/street/print2.svg`,
  p3: `${process.env.PUBLIC_URL}/images/street/print3.svg`,
};

function Home() {
  const [stickers, setStickers] = useState([]);

  useEffect(() => {
    fetchPublishedStickers()
      .then((d) => setStickers(Array.isArray(d) ? d : []))
      .catch(() => setStickers([]));
  }, []);

  return (
    <div className="min-h-screen pb-20 bg-black text-white">
      {/* Street-style hero */}
      <section className="relative overflow-hidden animate-rise-3d animate-rise-3d-delay-1">
        <div className="mx-auto max-w-7xl px-4 pt-10 md:px-6 md:pt-14">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a]">
            <div className="relative">
              <img
                src={IMG.hero}
                onError={(e) => {
                  e.currentTarget.src = `${process.env.PUBLIC_URL}/images/street/hero.svg`;
                }}
                alt="Pandora street hero"
                className="h-[420px] w-full object-cover md:h-[520px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" aria-hidden />
              <div className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white backdrop-blur">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-black">P</span>
                Pandora street drop
              </div>

              <div className="absolute bottom-8 left-6 right-6 grid items-end gap-6 md:grid-cols-2">
                <div>
                  <h1 className="text-5xl font-black tracking-tight md:text-6xl lg:text-7xl headline-animated">
                    PAN
                    <span className="opacity-90">DORA</span>
                  </h1>
                  <p className="mt-3 text-sm uppercase tracking-[0.35em] text-white/70">
                    Minimal • monochrome • heavy fit
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link to="/shop" className="inline-flex items-center justify-center rounded-full bg-[#ef4444] px-6 py-3 text-xs font-extrabold uppercase tracking-[0.25em] text-white hover:bg-[#dc2626]">
                      Shop drop
                    </Link>
                    <Link to="/products?category=women" className="inline-flex items-center justify-center rounded-full border border-white/15 bg-black/20 px-6 py-3 text-xs font-extrabold uppercase tracking-[0.25em] text-white hover:bg-white/10">
                      Collections
                    </Link>
                  </div>
                </div>

                {/* Right-side mini collection cards removed */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Big type + collections */}
      <section className="mx-auto max-w-7xl px-4 pt-14 md:px-6 animate-rise-3d animate-rise-3d-delay-2">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a] p-8 md:p-12">
          <div className="pointer-events-none absolute -top-6 left-0 select-none text-[88px] font-black tracking-tight text-white/10 md:text-[140px]">
            COLLECTIONS
          </div>
          <div className="relative">
            <div className="flex items-end justify-between gap-6">
              <div>
                <h2 className="text-3xl font-black md:text-4xl">Collections</h2>
                <p className="mt-2 text-sm text-white/70">Black. White. A single red accent.</p>
              </div>
              <Link to="/shop" className="hidden rounded-full border border-white/15 bg-black/20 px-6 py-3 text-xs font-extrabold uppercase tracking-[0.25em] text-white hover:bg-white/10 md:inline-flex">
                View all
              </Link>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                { img: IMG.c1, title: 'Monochrome', tag: 'NEW' },
                { img: IMG.c2, title: 'Hoodies', tag: 'DROP' },
                { img: IMG.c3, title: 'Jackets', tag: 'HOT' },
              ].map((c, idx) => (
                <Link
                  key={c.title}
                  to="/shop"
                  className="group overflow-hidden rounded-3xl border border-white/10 bg-black/40 card-3d-hover animate-venom-pop"
                  style={{ animationDelay: `${0.1 + idx * 0.08}s` }}
                >
                  <div className="relative h-56 w-full">
                    <img src={c.img} alt={c.title} className="h-full w-full object-cover opacity-95 transition group-hover:opacity-100" />
                    <div className="absolute left-4 top-4 inline-flex items-center rounded-full bg-[#ef4444] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.25em] text-white">
                      {c.tag}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="text-lg font-bold">{c.title}</div>
                    <div className="mt-1 text-sm text-white/70">Tap to explore</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stickers gallery (admin-managed) */}
      <section className="mx-auto max-w-7xl px-4 pt-14 md:px-6 animate-rise-3d animate-rise-3d-delay-3">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a] p-8 md:p-12">
          <div className="pointer-events-none absolute -top-6 right-0 select-none text-[72px] font-black tracking-tight text-white/10 md:text-[120px]">
            STICKERS
          </div>
          <div className="relative">
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.35em] text-white/70">Stickers</p>
                <h2 className="mt-3 text-3xl font-black md:text-4xl">Choose your sticker</h2>
                <p className="mt-2 text-sm text-white/70">
                  Uploads are managed by admin. Pick a design, then order with Puff / Foil / DTF / DTG / Screen Printing.
                </p>
              </div>
              <Link
                to="/checkout?type=sticker"
                className="hidden rounded-full bg-[#ef4444] px-6 py-3 text-xs font-extrabold uppercase tracking-[0.25em] text-white hover:bg-[#dc2626] md:inline-flex"
              >
                Order now
              </Link>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {stickers.map((s, idx) => (
                <Link
                  key={s.id}
                  to={`/checkout?stickerId=${encodeURIComponent(s.id)}`}
                  className="group overflow-hidden rounded-3xl border border-white/10 bg-black/40 card-3d-hover animate-venom-pop"
                  style={{ animationDelay: `${0.1 + idx * 0.06}s` }}
                >
                  <div className="relative h-60 w-full bg-black/20">
                    {s.imageUrl ? (
                      <img
                        src={s.imageUrl}
                        alt={s.title}
                        className="h-full w-full object-cover opacity-95 transition group-hover:opacity-100"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" aria-hidden />
                    <div className="absolute bottom-5 left-5 right-5">
                      <div className="text-xs uppercase tracking-[0.25em] text-white/60">Sticker</div>
                      <div className="mt-2 text-lg font-bold text-white">{s.title}</div>
                      <div className="mt-2 inline-flex rounded-full border border-white/15 bg-black/20 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.25em] text-white hover:bg-white/10">
                        Order
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              {stickers.length === 0 && (
                <div className="rounded-3xl border border-white/10 bg-black/30 p-8 text-sm text-white/60">
                  No stickers published yet.
                </div>
              )}
            </div>

            <div className="mt-6 md:hidden">
              <Link
                to="/checkout?type=sticker"
                className="inline-flex w-full items-center justify-center rounded-full bg-[#ef4444] px-6 py-3 text-xs font-extrabold uppercase tracking-[0.25em] text-white hover:bg-[#dc2626]"
              >
                Order now
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Home;
