<script lang="ts">
  import { onMount } from 'svelte';
  import posthog from 'posthog-js';

  // Assets
  import hero from './assets/hero/hero.png';
  import iconYoutube from './assets/logos/youtube.svg?url';
  import iconInstagram from './assets/logos/reels.png';
  import iconTiktok from './assets/logos/tiktok.svg?url';
  import iconX from './assets/logos/x.svg?url';

  // Links
  type Link = { href: string; label: string; icon: 'youtube' | 'instagram' | 'tiktok' | 'x' };
  const links: Link[] = [
    { href: 'https://www.youtube.com/@deniz_astrology/shorts', label: 'YouTube Shorts', icon: 'youtube' },
    { href: 'https://www.instagram.com/deniz_astrology/reels/', label: 'Instagram Reels', icon: 'instagram' },
    { href: 'https://www.tiktok.com/@deniz_astrology', label: 'TikTok Videos', icon: 'tiktok' },
    { href: 'https://x.com/deniz_astrology', label: 'X', icon: 'x' }
  ];

  const iconMap = { youtube: iconYoutube, instagram: iconInstagram, tiktok: iconTiktok, x: iconX };
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

  async function identifyVisitor() {
    const did = posthog.get_distinct_id();
    const baseProps = {
      source: 'denizastrology.com',
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      ua: navigator.userAgent
    };
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

  // Booking CTA (new tab)
  const calendlyUrl =
    'https://calendly.com/deniz-secretaryai/tarot-reading?hide_event_type_details=1&hide_gdpr_banner=1&primary_color=a493ff';
  function trackBook() {
    posthog.capture('book_cta_click', { price: 49, currency: 'USD', method: 'calendly_stripe' });
  }
</script>

<main class="page">
  <header class="site-header">
    <div class="brand">
      <h1>Deniz Astrology</h1>
      <p class="subtitle">Readings & insights aligned to your journey.</p>
    </div>
  </header>

  <section class="hero">
    <img
      class="avatar"
      src={hero}
      alt="Deniz Astrology — avatar"
      loading="eager"
      decoding="async"
      fetchpriority="high"
    />
  </section>

  <section class="cta-wrap" aria-label="Book a personal reading">
    <a
      class="cta"
      href={calendlyUrl}
      target="_blank"
      rel="noopener noreferrer"
      onclick={trackBook}
    >
      Book a personal reading — $49
    </a>
  </section>

  <section class="tiles" aria-label="Social video links">
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
  /* Allow vertical scroll; never allow sideways scroll on mobile */
  :global(html, body) { min-height: 100%; }
  :global(body) {
    margin: 0;
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI",
      Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji";
    background: var(--bg);
    color: var(--fg);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden; /* prevent accidental horizontal scroll */
  }
  :global(#app) { min-height: 100%; }

  :root {
    --bg: #0b0b10;
    --fg: #f5f6fb;
    --muted: #a6a8b8;
    --accent: #a493ff;
    --tile-bg: #141420;
    --tile-brd: rgba(255,255,255,0.09);
    --ring: rgba(164,147,255,0.28);
    --maxw: 1000px;

    --safe-top: env(safe-area-inset-top, 0px);
    --safe-right: env(safe-area-inset-right, 0px);
    --safe-bottom: env(safe-area-inset-bottom, 0px);
    --safe-left: env(safe-area-inset-left, 0px);
  }

  /* Use dynamic viewport so the page is at least full height, and scrolls if taller */
  .page {
    min-height: 100dvh;
    display: grid;
    grid-template-rows: auto auto auto auto auto; /* header, hero, cta, tiles, footer */
    gap: clamp(12px, 3.5vw, 22px);
    padding-left: var(--safe-left);
    padding-right: var(--safe-right);
  }

  .site-header {
    display: flex;
    justify-content: center;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    background: linear-gradient(0deg, rgba(255,255,255,0.02), rgba(255,255,255,0.02));
    padding-top: var(--safe-top);
    backdrop-filter: blur(6px);
  }

  .brand {
    width: 100%;
    max-width: var(--maxw);
    padding: clamp(10px, 3.2vw, 18px) clamp(16px, 5vw, 24px) 10px;
    margin: 0 auto;             /* center the header content block */
    text-align: center;
  }

  h1 { font-size: clamp(28px, 6vw, 40px); line-height: 1.1; margin: 0 0 6px; font-weight: 700; }
  .subtitle { margin: 0; color: var(--muted); font-size: clamp(13px, 3.5vw, 16px); }

  .hero {
    display: grid;
    place-items: center;
    padding: 6px clamp(16px, 5vw, 24px) 0;
  }

  .avatar {
    width: clamp(180px, 38vw, 300px);
    height: clamp(180px, 38vw, 300px);
    object-fit: cover;
    border-radius: 9999px;
    border: 1px solid rgba(255,255,255,0.10);
    box-shadow: 0 18px 40px rgba(0,0,0,0.45), 0 0 0 6px var(--ring);
    background: radial-gradient(80% 80% at 30% 20%, rgba(255,255,255,0.06), transparent);
  }

  /* CTA */
  .cta-wrap {
    display: grid;
    place-items: center;
    padding: 0 clamp(16px, 5vw, 24px);
  }
  .cta {
    width: min(720px, 100%);
    padding: clamp(14px, 3vw, 18px) clamp(18px, 4.5vw, 24px);
    font-size: clamp(16px, 3.8vw, 18px);
    font-weight: 700;
    border: 0;
    border-radius: 14px;
    color: #0b0b10;
    background: linear-gradient(180deg, #efeaff 0%, #c7bfff 50%, #a493ff 100%);
    box-shadow: 0 12px 28px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,0.35);
    text-align: center;
    display: inline-block;
  }
  .cta:hover,
  .cta:focus-visible {
    transform: translateY(-1px);
    filter: brightness(1.03);
    outline: none;
    box-shadow: 0 14px 34px rgba(0,0,0,0.42), inset 0 0 0 1px rgba(255,255,255,0.45);
  }

  /* Tiles: simple, safe grid that never overflows horizontally */
  .tiles {
    --gutter: clamp(10px, 4vw, 16px);
    width: 100%;
    max-width: var(--maxw);
    margin: var(--gutter) auto clamp(8px, 2.6vw, 12px);
    padding: 0 clamp(14px, 5vw, 20px);
    display: grid;
    gap: var(--gutter);
    /* Phones default: 2 columns and centered; drop to 1 on very narrow devices; 4 on desktop */
    grid-template-columns: repeat(2, minmax(0, 1fr));
    justify-items: center;
    justify-content: center;
  }
  @media (max-width: 380px) {
    .tiles { grid-template-columns: 1fr; }
  }
  @media (min-width: 900px) {
    .tiles { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  }

  .tile {
    width: 100%;
    max-width: 220px;           /* cap so cards don’t balloon on large screens */
    aspect-ratio: 1 / 1;
    display: grid;
    place-items: center;
    text-decoration: none;
    color: var(--fg);
    background: var(--tile-bg);
    border: 1px solid var(--tile-brd);
    border-radius: 14px;
    transition: transform .16s ease, border-color .16s ease, box-shadow .16s ease;
    box-shadow: 0 8px 24px rgba(0,0,0,0.35);
  }
  .tile:hover,
  .tile:focus-visible {
    transform: translateY(-2px);
    border-color: var(--accent);
    box-shadow: 0 10px 28px rgba(0,0,0,0.44);
    outline: none;
  }

  .icon-img {
    width: clamp(44px, 48%, 92px);
    height: clamp(44px, 48%, 92px);
    object-fit: contain;
    display: block;
  }

  .footer {
    display: grid;
    place-items: center;
    padding: 12px 0 calc(12px + var(--safe-bottom));
    color: var(--muted);
    text-align: center;
  }

  @media (prefers-reduced-motion: reduce) {
    .tile, .cta { transition: none; }
    .tile:hover { transform: none; }
  }
</style>
