<script lang="ts">
  import { onMount } from 'svelte';
  import posthog from 'posthog-js';
  import './app.css';

  // Assets
  import hero from './assets/hero/hero.png';
  import iconYoutube from './assets/logos/youtube.svg?url';
  import iconInstagram from './assets/logos/reels.png';
  import iconTiktok from './assets/logos/tiktok.svg?url';
  import iconX from './assets/logos/x.svg?url';
  import iconSnap from './assets/logos/snap.svg?url';

  // Links (IG, TikTok, SNAP (3rd), YouTube, X)
  type Link = { href: string; label: string; icon: 'instagram' | 'tiktok' | 'snap' | 'youtube' | 'x' };
  const links: Link[] = [
    { href: 'https://www.instagram.com/deniz_astrology/reels/', label: 'Instagram Reels', icon: 'instagram' },
    { href: 'https://www.tiktok.com/@deniz_astrology',          label: 'TikTok Videos',   icon: 'tiktok' },
    { href: 'https://www.snapchat.com/add/denizastrology',      label: 'Snapchat',        icon: 'snap' },
    { href: 'https://www.youtube.com/@deniz_astrology/shorts',  label: 'YouTube Shorts',  icon: 'youtube' },
    { href: 'https://x.com/deniz_astrology',                    label: 'X',               icon: 'x' }
  ];

  const iconMap = { youtube: iconYoutube, instagram: iconInstagram, tiktok: iconTiktok, snap: iconSnap, x: iconX };
  const year = new Date().getFullYear();

  // Analytics (PostHog)
  const PH_KEY =
    (import.meta.env.VITE_POSTHOG_KEY as string | undefined) ??
    (import.meta.env.PUBLIC_POSTHOG_KEY as string | undefined);
  const PH_HOST =
    (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ??
    (import.meta.env.PUBLIC_POSTHOG_HOST as string | undefined) ??
    'https://us.i.posthog.com';
  const PH_FLAG = '__deniz_ph_inited__';

  function ensureFBPixel() {
    if (typeof window === 'undefined') return;
    if ((window as any).__fbq_inited__) return;

    // Meta Pixel base loader (same as your snippet, inlined here)
    void (function (f: any, b: Document, e: string, v: string, n?: any, t?: any, s?: any) {
      if ((f as any).fbq) return;
      n = (f as any).fbq = function () {
        (n as any).callMethod ? (n as any).callMethod.apply(n, arguments) : (n as any).queue.push(arguments);
      };
      if (!(f as any)._fbq) (f as any)._fbq = n;
      (n as any).push = n;
      (n as any).loaded = true;
      (n as any).version = '2.0';
      (n as any).queue = [];
      t = (b as any).createElement(e) as any;
      (t as any).async = true;
      (t as any).src = v;
      s = (b as any).getElementsByTagName(e)[0] as HTMLElement;
      (s as any).parentNode?.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    (window as any).fbq && (window as any).fbq('init', import.meta.env.PUBLIC_FB_PIXEL_ID);
    (window as any).__fbq_inited__ = true;
  }

  async function identifyVisitor() {
    const did = posthog.get_distinct_id();
    const baseProps = { source: 'denizastrology.com', tz: Intl.DateTimeFormat().resolvedOptions().timeZone, ua: navigator.userAgent };
    const onceProps = { first_visit_at: new Date().toISOString() };
    try {
      const res = await fetch('https://api.ipify.org?format=json', { cache: 'no-store' });
      if (res.ok) {
        const { ip } = (await res.json()) as { ip: string };
        posthog.identify(did, { ...baseProps, ip }, onceProps);
        return;
      }
    } catch {}
    posthog.identify(did, baseProps, onceProps);
  }

  onMount(() => {
    if (!PH_KEY) return;
    if (!(window as any)[PH_FLAG]) {
      (window as any)[PH_FLAG] = true;
      posthog.init(PH_KEY, {
        api_host: PH_HOST,
        capture_pageview: false,
        capture_pageleave: true,
        persistence: 'localStorage+cookie',
        autocapture: true,
        respect_dnt: false,
        debug: import.meta.env.DEV
      });
    }
    posthog.capture('$pageview', { $current_url: location.href });
    identifyVisitor();
  });

  function trackClick(item: Link) {
    posthog.capture('social_tile_click', { network: item.icon, href: item.href });
  }
  function trackHandleClick(href: string) {
    posthog.capture('follow_handle_click', { href });
  }

  // Booking CTA (new tab)
  const calendlyUrl =
    'https://calendly.com/deniz-secretaryai/tarot-reading?hide_event_type_details=1&hide_gdpr_banner=1&primary_color=a493ff';
  function trackBook() {
    posthog.capture('book_cta_click', { price: 49, currency: 'USD', method: 'calendly_stripe' });
    ensureFBPixel();
    (window as any).fbq && (window as any).fbq('track', 'InitiateCheckout');
  }
</script>

<main class="page">
  <header class="site-header">
    <div class="brand">
      <h1>Deniz Astrology</h1>
      <p class="subtitle">Readings & insights aligned to your journey.</p>

      <p class="handle-line">
        Follow
        <a
          class="handle-link"
          href="https://instagram.com/deniz_astrology"
          target="_blank"
          rel="noopener noreferrer"
          onclick={() => trackHandleClick('https://instagram.com/deniz_astrology')}
        >
          @deniz_astrology
        </a>
      </p>
    </div>
  </header>

  <section class="hero">
    <img class="avatar" src={hero} alt="Deniz Astrology — avatar" loading="eager" decoding="async" fetchpriority="high" />
  </section>

  <section class="cta-wrap" aria-label="Book a personal reading">
    <a class="cta" href={calendlyUrl} target="_blank" rel="noopener noreferrer" onclick={trackBook}>
      Book a personal reading — $49
    </a>
  </section>

  <section class="tiles" aria-label="Social links">
    {#each links as item (item.href)}
      <a
        class="tile"
        data-icon={item.icon}
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={item.label}
        onclick={() => trackClick(item)}
      >
        <img class="icon-img" src={iconMap[item.icon]} alt="" aria-hidden="true" />
      </a>
    {/each}
  </section>

  <footer class="footer">
    <small>© {year} Deniz Astrology</small>
  </footer>
</main>

<style>
  :root {
    --bg: #0b0b10;
    --fg: #f5f6fb;
    --muted: #a6a8b8;
    --accent: #a493ff;
    --tile-bg: #141420;
    --tile-brd: rgba(255,255,255,0.09);
    --ring: rgba(164,147,255,0.28);

    --maxw: 1000px;                 /* desktop grid width cap */
    --track: 560px;                 /* unified mobile track width */
    --pad: clamp(14px, 5vw, 22px);  /* slightly smaller pad to avoid edge cases */

    /* desktop tile size (tight outline) */
    --tile-size: clamp(104px, 11vw, 136px);
  }

  .page {
    min-height: 100dvh;
    display: grid;
    grid-template-rows: auto auto auto auto auto; /* header, hero, cta, tiles, footer */
    gap: clamp(12px, 3.5vw, 22px);
    width: 100%;
    overflow-x: hidden; /* belt & suspenders */
  }

  .site-header {
    display: flex;
    justify-content: center;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    background: linear-gradient(0deg, rgba(255,255,255,0.02), rgba(255,255,255,0.02));
    backdrop-filter: blur(6px);
    width: 100%;
  }

  /* === Center-track: every section is constrained identically === */
  .brand, .hero, .cta-wrap, .tiles, .footer {
    width: min(100%, var(--track));
    margin-inline: auto;
    padding-inline: var(--pad);
    max-width: 100%;
  }

  .brand {
    /* critical: prevent flex child from forcing overflow */
    min-width: 0;

    max-width: var(--maxw);
    padding-top: clamp(10px, 3.2vw, 18px);
    padding-bottom: 10px;
    text-align: center;
  }

  h1 { font-size: clamp(28px, 6vw, 40px); line-height: 1.1; margin: 0 0 6px; font-weight: 700; }

  /* Safer copy on narrow phones – never clip, balance lines */
  .subtitle,
  .handle-line {
    margin: 0;
    color: var(--muted);
    font-size: clamp(13px, 3.4vw, 15px);
    overflow-wrap: anywhere;
    text-wrap: balance;
  }
  .handle-line { margin-top: 6px; }

  .handle-link {
    color: var(--accent);
    font-weight: 700;
    text-decoration: underline;
    text-decoration-color: rgba(164,147,255,0.45);
    text-underline-offset: 3px;
  }
  .handle-link:hover,
  .handle-link:focus-visible {
    text-decoration-color: currentColor;
    outline: none;
  }

  .hero { display: grid; place-items: center; padding-top: 6px; padding-bottom: 0; }
  .avatar {
    width: clamp(180px, 38vw, 300px);
    height: clamp(180px, 38vw, 300px);
    object-fit: cover;
    border-radius: 9999px;
    border: 1px solid rgba(255,255,255,0.10);
    box-shadow: 0 18px 40px rgba(0,0,0,0.45), 0 0 0 6px var(--ring);
    background: radial-gradient(80% 80% at 30% 20%, rgba(255,255,255,0.06), transparent);
    max-width: 100%;
  }

  /* CTA – smaller on phones so it doesn't feel edge‑to‑edge or overflow */
  .cta-wrap { display: grid; place-items: center; }
  .cta {
    inline-size: min(680px, 92%);   /* <- make it smaller than the track on phones */
    max-inline-size: 92%;
    padding: clamp(12px, 3.4vw, 16px) clamp(16px, 4.5vw, 22px);
    font-size: clamp(16px, 3.8vw, 18px);
    font-weight: 700;
    border: 0; border-radius: 14px; color: #0b0b10;
    background: linear-gradient(180deg, #efeaff 0%, #c7bfff 50%, #a493ff 100%);
    box-shadow: 0 12px 28px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,0.35);
    text-align: center; display: inline-block;
  }
  .cta:hover, .cta:focus-visible { transform: translateY(-1px); filter: brightness(1.03); outline: none; box-shadow: 0 14px 34px rgba(0,0,0,0.42), inset 0 0 0 1px rgba(255,255,255,0.45); }

  /* ---------- Tiles: mobile-first stack, desktop grid ---------- */
  .tiles {
    --gutter: clamp(12px, 4vw, 18px);
    display: grid;
    grid-template-columns: 1fr;     /* single column on phones */
    gap: var(--gutter);
    justify-items: center;
  }

  /* Mobile tiles “hug” the icon */
  .tile {
    display: inline-grid;           /* size by content on mobile */
    place-items: center;
    padding: clamp(14px, 4.8vw, 20px);
    background: var(--tile-bg);
    border: 1px solid var(--tile-brd);
    border-radius: 14px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.35);
    max-width: 100%;
    transition: transform .16s ease, border-color .16s ease, box-shadow .16s ease;
  }
  .tile:hover, .tile:focus-visible { transform: translateY(-2px); border-color: var(--accent); box-shadow: 0 10px 28px rgba(0,0,0,0.44); outline: none; }

  .icon-img {
    width: clamp(56px, 22vw, 96px);
    height: clamp(56px, 22vw, 96px);
    object-fit: contain; display: block; max-width: 100%;
  }

  /* Desktop: centered grid; tighter card + bigger icon */
  @media (min-width: 900px) {
    .brand, .hero, .cta-wrap, .tiles, .footer { width: min(100%, var(--maxw)); }
    .tiles {
      grid-template-columns: repeat(4, var(--tile-size));
      justify-content: center;
      gap: clamp(14px, 2.2vw, 22px);
    }
    .cta { inline-size: min(720px, 80%); } /* look tighter on large screens too */
    .tile {
      width: var(--tile-size);
      height: var(--tile-size);
      padding: clamp(10px, 1.4vw, 14px);  /* tighter outline */
      display: grid;
    }
    .icon-img { width: clamp(72px, 68%, 110px); height: clamp(72px, 68%, 110px); }
  }

  /* Ultra‑wide: 5 columns so all tiles can be in one row */
  @media (min-width: 1200px) {
    .tiles { grid-template-columns: repeat(5, var(--tile-size)); }
  }

  .footer {
    display: grid; place-items: center;
    padding: 12px 0 calc(12px + env(safe-area-inset-bottom, 0px));
    color: var(--muted); text-align: center;
  }

  @media (prefers-reduced-motion: reduce) {
    .tile, .cta { transition: none; }
    .tile:hover { transform: none; }
  }
</style>
