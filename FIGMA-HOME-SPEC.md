# Figma Home Page Design Spec – Mallon-style Pharmacy

Use this spec to build the homepage in Figma. Replace "Moving Medicine" with your brand name where needed.

---

## 1. Artboard & Grid
- **Frame:** 1440×8000px (scrollable page)
- **Grid:** 12 columns, 24px gutter, 120px margin
- **Background:** #F8F8F8 or white

---

## 2. Top Bar (Info Header)
- **Height:** 40px
- **Background:** White #FFFFFF
- **Border bottom:** 1px #EEEEEE
- **Left:** "Welcome to our online store!" – 12px, #333333, medium
- **Right:** Login | My Account | Language dropdown (English) | Currency (U.S Dollar) – 12px, #666666, links #00c6e6 on hover

---

## 3. Main Header
- **Height:** 80px
- **Background:** White
- **Logo (left):** Icon (e.g. red/square or M) + "Moving Medicine" – bold 20px #191e2b
- **Search (center):**
  - Container: rounded 8px, border #E0E0E0, max-width 500px
  - Left: "All Categories" dropdown
  - Input: "Search" placeholder, 14px
  - Right: Red/Cyan button "Search" – #00c6e6 or #E73C3E, white text
- **Right:** Wishlist icon | Cart icon + "0" + "Your Cart" | Hotline: +91-222-333 – 12px

---

## 4. Primary Navigation
- **Height:** 48px
- **Background:** White, border-bottom 1px #EEEEEE
- **Left:** "All Categories" button – full accent color (#00c6e6 or red), hamburger icon, white text
- **Links:** HOME | SHOP | PAGES | BLOG – 12px uppercase, #333, 24px spacing, dropdown arrows

---

## 5. Hero Section
- **Layout:** 2/3 main banner + 1/3 right column (two stacked banners)
- **Main hero (left):**
  - Background: Gradient blue (#00c6e6 to #253045) or image with overlay
  - Optional: water/leaf decorative graphics
  - Headline: "GET THE COMPLETE Hand Sanitiser" – 36px bold white
  - Sub: "Kill 99.99% of Germs Fast." – 18px white 80%
  - CTA: "Shop Now" button – accent color, white text, 14px
  - Image: 3 bottles or product shot (right-aligned)
- **Side banners (right, 2):**
  - Each: light green/teal (#bfc0d1 tint), rounded 12px
  - Title: "EXCLUSIVE 100% Pure Essential Oil" (or similar)
  - "Shop Now" button
  - Product image per banner
- **Animation (Figma):** Prototype – on load, fade in hero content (0.3s); optional parallax on scroll

---

## 6. Best Selling Products Strip
- **Section title:** "Best Selling Products" – 24px bold #191e2b; small tag "MUST HAVE" above in accent
- **Content:** Horizontal scroll/carousel of product image cards (image only or image + name)
- **Card size:** 180×180px, rounded 12px, subtle shadow
- **Animation:** Horizontal scroll indicator; in dev: carousel/slider

---

## 7. Mid-Page Promo Banners (3 columns)
- **Layout:** 3 equal columns, 16px gap
- **Each banner:**
  - Height ~200px, rounded 12px
  - Left: Blue – "Weekend Sale", "Disposable Surgical Mask", "25% OFF", Shop Now
  - Middle: Green/teal – "Up To 75% OFF", "The Great Baby Deals", Shop Now
  - Right: Light blue/purple – "Weekend Sale", "Electric Cleansing", "25% OFF", Shop Now
- **Style:** Bold headline, discount text, CTA button; product image on right of each
- **Animation:** Hover – slight scale (1.02) and shadow increase

---

## 8. Today's Hot Deals
- **Title:** "Today's Hot Deals" – 24px bold; subtitle "Hot! Voucher Deal Up To 50%++"
- **Product grid:** 4–5 columns, card components:
  - Image, discount badge (-10%) top-left (red), "NEW" tag top-right (green)
  - **Countdown:** "DAYS : HRS : MINS : SECS" – 139 : 0 : 43 : 53 (red/dark text)
  - Product name (1–2 lines)
  - Old price (strikethrough), new price bold accent
  - Star rating (e.g. 4 stars)
- **Pagination:** Dots below
- **Animation:** Countdown ticks (in dev); card hover – show "Add to cart" / "Quick view"

---

## 9. Popular Healthcare Products
- **Title:** "Popular Healthcare Products"
- **Tabs (right):** Best sellers | New Arrivals | Most rating
- **Grid:** Same product cards as Hot Deals (no countdown)
- **Animation:** Tab switch – content fade/slide 0.2s

---

## 10. Bottom Promo Banners (2 columns)
- **Left:** Purple/pink gradient, "See what's next.", product images (e.g. toothbrushes)
- **Right:** Green/blue gradient, "Breathable Dryness.", product images (e.g. diapers)
- **Height:** ~220px, rounded 12px, full-width images or gradients

---

## 11. Color Palette (use as Figma styles)
- **Primary accent:** #00c6e6 (cyan) or #E73C3E (red for CTAs)
- **Dark:** #191e2b (headings), #253045 (secondary dark)
- **Light bg:** #bfc0d1, #c4cfd6 (soft sections)
- **Neutral:** #F8F8F8, #FFFFFF, #333333, #666666
- **Success:** Green for "NEW", discounts

---

## 12. Typography
- **Font:** Sans-serif (e.g. Inter, DM Sans)
- **H1:** 36px bold #191e2b
- **H2:** 24px bold #191e2b
- **Body:** 14px regular #333
- **Small:** 12px #666
- **Buttons:** 14px semibold, white on accent

---

## 13. Components to Create in Figma
- Button Primary / Secondary
- Product card (with image, price, rating, badge)
- Product card with countdown
- Promo banner (with headline, CTA, image area)
- Search bar with dropdown
- Nav link + dropdown
- Section title + optional tag

---

## 14. Animations to Prototype in Figma
- **On load:** Hero text + CTA fade in (0.3s delay 0.1s)
- **Scroll:** Parallax on hero image (optional)
- **Hover:** Buttons (scale 1.02, shadow); cards (lift 4px, shadow)
- **Tab switch:** Content fade 0.2s
- **Countdown:** Not in Figma; note "Animate in dev" for implementation

---

## 15. Export Notes
- Export hero and banner images as PNG/JPG for dev
- Export icons as SVG
- Provide spacing (padding/margin) values for each section for React implementation
