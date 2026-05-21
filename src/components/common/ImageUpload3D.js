import { useMemo, useRef, useState } from 'react';

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function ImageUpload3D({ value, onChange, label = 'Image' }) {
  const cardRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, sx: 0, sy: 0 });

  const hasImage = Boolean(value);

  const bgStyle = useMemo(() => {
    if (!value) return {};
    return {
      backgroundImage: `url("${value}")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }, [value]);

  function handlePointerMove(e) {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = clamp((0.5 - py) * 16, -14, 14);
    const ry = clamp((px - 0.5) * 18, -16, 16);
    const sx = clamp(px * 100, 0, 100);
    const sy = clamp(py * 100, 0, 100);
    setTilt({ rx, ry, sx, sy });
  }

  function resetTilt() {
    setTilt({ rx: 0, ry: 0, sx: 0, sy: 0 });
  }

  function setFile(file) {
    if (!file) return;
    if (!file.type?.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    onChange?.(url, file);
  }

  return (
    <div>
      <label className="block text-xs font-medium text-[#bfc0d1]">{label}</label>

      <div
        ref={cardRef}
        className={`mt-2 relative overflow-hidden rounded-2xl border ${
          dragOver ? 'border-[#00c6e6]' : 'border-white/10'
        } bg-gradient-to-b from-[#111827] to-[#0b1220] shadow-[0_20px_60px_rgba(0,0,0,0.45)]`}
        style={{
          perspective: 1000,
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transition: dragOver ? 'none' : 'transform 160ms ease',
        }}
        onPointerMove={handlePointerMove}
        onPointerLeave={resetTilt}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files?.[0];
          setFile(file);
        }}
      >
        {/* Glow */}
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              `radial-gradient(circle at ${tilt.sx}% ${tilt.sy}%, rgba(0,198,230,0.28), transparent 45%)`,
          }}
          aria-hidden
        />

        {/* Content */}
        <div className="relative grid gap-4 p-4 sm:grid-cols-[1fr_220px]">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">Upload product image</p>
            <p className="mt-1 text-xs text-[#bfc0d1]">
              Drag & drop an image here, or choose a file. You can also paste an image URL below.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <label className="inline-flex cursor-pointer items-center rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black hover:bg-gray-100">
                Choose file
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0])}
                />
              </label>

              {hasImage && (
                <button
                  type="button"
                  className="inline-flex items-center rounded-full border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:bg-white/10"
                  onClick={() => onChange?.('', null)}
                >
                  Remove
                </button>
              )}
            </div>

            <div className="mt-4">
              <input
                type="url"
                value={value || ''}
                onChange={(e) => onChange?.(e.target.value, null)}
                placeholder="https://example.com/product.jpg"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:border-[#00c6e6] focus:outline-none focus:ring-1 focus:ring-[#00c6e6]"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="relative">
            <div
              className={`h-52 w-full overflow-hidden rounded-xl border border-white/10 ${
                hasImage ? '' : 'bg-black/20'
              }`}
              style={hasImage ? bgStyle : undefined}
            >
              {!hasImage && (
                <div className="flex h-full items-center justify-center text-center">
                  <div>
                    <div className="mx-auto h-10 w-10 rounded-full border border-white/10 bg-white/5" />
                    <p className="mt-3 text-[11px] uppercase tracking-[0.25em] text-gray-400">
                      Preview
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 3D “floating” label */}
            <div
              className="pointer-events-none absolute -bottom-3 left-3 rounded-full bg-black/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white"
              style={{
                transform: `translateZ(30px)`,
              }}
            >
              {hasImage ? 'Ready' : 'Drop image'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageUpload3D;

