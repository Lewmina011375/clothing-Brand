import { useMemo, useRef, useState } from 'react';

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function ClothingBanners3D({ images, title = '3D banners', theme = 'dark' }) {
  const wrapRef = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const items = useMemo(() => {
    const srcs = Array.isArray(images) ? images.filter(Boolean) : [];
    return srcs.length ? srcs : [];
  }, [images]);

  function handlePointerMove(e) {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = clamp((0.5 - py) * 12, -10, 10);
    const ry = clamp((px - 0.5) * 16, -14, 14);
    setTilt({ rx, ry });
  }

  return (
    <div>
      <div className="mb-3 flex items-end justify-between gap-4">
        <h2 className={`text-lg font-extrabold uppercase tracking-[0.25em] ${theme === 'light' ? 'text-gray-800' : 'text-white/80'}`}>{title}</h2>
        <p className={`text-xs ${theme === 'light' ? 'text-gray-500' : 'text-white/60'}`}>Move your mouse to tilt</p>
      </div>

      <div
        ref={wrapRef}
        className={`relative overflow-hidden rounded-3xl border p-6 ${
          theme === 'light'
            ? 'border-black/10 bg-white shadow-lg'
            : 'border-white/10 bg-[#0a0a0a] shadow-[0_30px_90px_rgba(0,0,0,0.55)]'
        }`}
        style={{
          perspective: 1200,
        }}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setTilt({ rx: 0, ry: 0 })}
      >
        <div
          className="relative"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
            transition: 'transform 140ms ease',
          }}
        >
          <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-3">
            {items.slice(0, 3).map((src, i) => (
              <div
                key={i}
                className={`group relative overflow-hidden rounded-3xl border ${
                  theme === 'light' ? 'border-black/10 bg-gray-50' : 'border-white/10 bg-black/40'
                }`}
                style={{
                  transform: `translateZ(${18 + i * 10}px)`,
                }}
              >
                <img
                  src={src}
                  alt=""
                  className="h-48 w-full object-cover opacity-95 transition group-hover:opacity-100 md:h-56"
                />
                <div
                  className={`pointer-events-none absolute inset-0 ${
                    theme === 'light'
                      ? 'bg-gradient-to-t from-black/15 via-transparent to-transparent'
                      : 'bg-gradient-to-t from-black/55 via-transparent to-transparent'
                  }`}
                />
                <div className="absolute left-4 top-4 rounded-full bg-[#ef4444] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.25em] text-white">
                  Drop {i + 1}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden>
          <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-[#ef4444]/20 blur-3xl" />
          <div className={`absolute -bottom-24 -right-24 h-72 w-72 rounded-full blur-3xl ${theme === 'light' ? 'bg-black/10' : 'bg-white/10'}`} />
        </div>
      </div>
    </div>
  );
}

export default ClothingBanners3D;

