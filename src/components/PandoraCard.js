import { Link } from 'react-router-dom';

function PandoraCard({ pandora, onAddToCart }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111827] shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <Link to="/shop" className="block">
        <div className="relative h-52 w-full bg-black/20">
          {pandora.imageUrl ? (
            <img
              src={pandora.imageUrl}
              alt={pandora.name}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/10 to-white/0">
              <span className="text-xs tracking-[0.25em] text-gray-400">PANDORA</span>
            </div>
          )}
          <span className="absolute right-3 top-3 rounded-full bg-black/30 px-2 py-0.5 text-[10px] font-medium text-gray-200">
            In stock
          </span>
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">{pandora.category || 'General'}</p>
        <Link to="/shop" className="line-clamp-2 text-sm font-semibold text-white hover:text-[#60a5fa]">
          {pandora.name}
        </Link>
        <p className="line-clamp-2 text-xs text-gray-300">{pandora.description || 'Premium Pandora clothing item.'}</p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-base font-bold text-white">LKR {Number(pandora.price || 0).toFixed(2)}</span>
          <button
            type="button"
            onClick={() => onAddToCart?.(pandora)}
            className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/0 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white hover:bg-white/10"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default PandoraCard;
