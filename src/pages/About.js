import { Link } from 'react-router-dom';

function IconQuality({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6L12 2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconDesign({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M4 7h16M4 12h10M4 17h7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M17 10l4 4-6 6h-4v-4l6-6z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconService({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M12 22c4.97 0 9-3.58 9-8 0-3.5-2.5-6.5-6-7.74V4a3 3 0 10-6 0v2.26C5.5 7.5 3 10.5 3 14c0 4.42 4.03 8 9 8z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M9 14h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function About() {
  const aboutImg = `${process.env.PUBLIC_URL}/images/about-shirt.svg`;
  const aboutGallery = [
    {
      src: 'C:/Users/Lewmina Mihira/Downloads/Gemini_Generated_Image_2ll1p2ll1p2ll1p2.png',
      alt: 'Pandora hero streetwear collection',
      label: 'Street Essentials'
    },
    {
      src: `${process.env.PUBLIC_URL}/images/street/collection1.svg`,
      alt: 'Pandora collection one look',
      label: 'Collection 01'
    },
    {
      src: `${process.env.PUBLIC_URL}/images/street/collection2.svg`,
      alt: 'Pandora collection two look',
      label: 'Collection 02'
    },
    {
      src: `${process.env.PUBLIC_URL}/images/street/collection3.svg`,
      alt: 'Pandora collection three look',
      label: 'Collection 03'
    }
  ];

  return (
    <div className="relative overflow-hidden bg-white text-neutral-900">
      <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-[#00c6e6]/10 blur-3xl" />
      <div className="pointer-events-none absolute top-80 -right-24 h-72 w-72 rounded-full bg-cyan-100 blur-3xl" />

      {/* Hero */}
      <section className="relative border-b border-neutral-200 bg-neutral-50/90">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <p className="about-fade-up text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">About us</p>
          <h1 className="about-fade-up about-delay-1 mt-3 max-w-3xl text-4xl font-bold tracking-tight text-neutral-900 md:text-5xl">
            Modern apparel, built for real life.
          </h1>
          <p className="about-fade-up about-delay-2 mt-5 max-w-2xl text-lg leading-relaxed text-neutral-600">
            Pandora Clothing designs and curates T-shirts and streetwear essentials with a focus on fit,
            fabric, and lasting style—so you can move from work to weekend without changing who you are.
          </p>
          <div className="about-fade-up about-delay-3 mt-8 flex flex-wrap gap-3">
            <Link
              to="/shop"
              className="about-shine inline-flex items-center justify-center rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              Shop collection
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-6 py-3 text-sm font-semibold text-neutral-800 transition hover:border-neutral-400 hover:bg-neutral-50"
            >
              Back to home
            </Link>
          </div>
        </div>
      </section>

      {/* Story + image */}
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 about-fade-up lg:order-1">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 md:text-3xl">Our story</h2>
            <p className="mt-4 leading-relaxed text-neutral-600">
              We started with a simple idea: everyday pieces should feel as good as they look. Each drop is
              developed with careful fabric selection, clean silhouettes, and details that hold up wash after
              wash—not fast-fashion noise.
            </p>
            <p className="mt-4 leading-relaxed text-neutral-600">
              From monochrome staples to statement graphics and custom sticker-led pieces, we aim to give you
              wardrobe foundations you can layer, repeat, and make your own.
            </p>
            <p className="mt-6 text-sm font-medium text-neutral-900">
              Wear comfort. Wear confidence.
            </p>
          </div>
          <div className="order-1 about-fade-up about-delay-1 lg:order-2">
            <div className="about-float overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 shadow-sm">
              <img src={aboutImg} alt="Pandora Clothing apparel" className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-t border-neutral-200 bg-neutral-50 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-2xl font-bold tracking-tight text-neutral-900 md:text-3xl">
            What we stand for
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-neutral-600">
            Three principles guide every product we release and every order we fulfil.
          </p>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="about-card-hover about-fade-up rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
              <div className="mb-4 inline-flex rounded-2xl bg-[#00c6e6]/10 p-3 text-[#00c6e6]">
                <IconQuality className="h-8 w-8" />
              </div>
              <div className="text-sm font-semibold uppercase tracking-wide text-[#00c6e6]">Quality</div>
              <h3 className="mt-2 text-lg font-semibold text-neutral-900">Materials that last</h3>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                We prioritise soft, durable fabrics and construction you can feel—pieces meant to stay in
                rotation, not landfill.
              </p>
            </div>
            <div className="about-card-hover about-fade-up about-delay-1 rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
              <div className="mb-4 inline-flex rounded-2xl bg-[#00c6e6]/10 p-3 text-[#00c6e6]">
                <IconDesign className="h-8 w-8" />
              </div>
              <div className="text-sm font-semibold uppercase tracking-wide text-[#00c6e6]">Design</div>
              <h3 className="mt-2 text-lg font-semibold text-neutral-900">Clean, intentional style</h3>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                Minimal when it should be, bold when it matters. Our design language is modern, versatile,
                and easy to pair.
              </p>
            </div>
            <div className="about-card-hover about-fade-up about-delay-2 rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
              <div className="mb-4 inline-flex rounded-2xl bg-[#00c6e6]/10 p-3 text-[#00c6e6]">
                <IconService className="h-8 w-8" />
              </div>
              <div className="text-sm font-semibold uppercase tracking-wide text-[#00c6e6]">Service</div>
              <h3 className="mt-2 text-lg font-semibold text-neutral-900">Straightforward shopping</h3>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                Clear product info, secure checkout, and support when you need it—so buying online feels as
                reliable as the clothes themselves.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">Lookbook</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 md:text-3xl">
              Visual identity of Pandora
            </h2>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center rounded-full border border-neutral-300 px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-800 transition hover:border-neutral-400 hover:bg-neutral-50"
          >
            View products
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {aboutGallery.map((img, idx) => (
            <article
              key={img.src}
              className={`about-card-hover about-fade-up overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm ${
                idx === 0 ? 'md:col-span-2' : ''
              }`}
            >
              <div className="relative">
                <img src={img.src} alt={img.alt} className="h-[240px] w-full object-cover md:h-[280px]" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <span className="inline-flex rounded-full border border-white/30 bg-black/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/90">
                    {img.label}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="about-fade-up rounded-3xl bg-neutral-900 px-8 py-12 text-center shadow-[0_24px_80px_rgba(15,23,42,0.28)] md:px-12 md:py-16">
          <h2 className="text-2xl font-bold text-white md:text-3xl">Ready to refresh your rotation?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-neutral-300 md:text-base">
            Browse new arrivals, sticker-custom options, and core staples—all in one place.
          </p>
          <Link
            to="/shop"
            className="about-shine mt-8 inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-100"
          >
            Explore the shop
          </Link>
        </div>
      </section>
    </div>
  );
}

export default About;
