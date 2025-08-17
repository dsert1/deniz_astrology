<script lang="ts">
  import { onMount } from 'svelte';
  import posthog from 'posthog-js';

  // Assets
  import hero from './assets/hero/hero.jpg';
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

  // --- Analytics (PostHog) ---
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
        respect_dnt: false, // keep false while testing; set true for production if needed
        debug: import.meta.env.DEV
      });
    }

    posthog.capture('$pageview', { $current_url: location.href });
    identifyVisitor();

    document.addEventListener(
      'click',
      (e) => {
        const target = e.target as HTMLElement | null;
        const a = target?.closest('a[href]') as HTMLAnchorElement | null;
        if (!a) return;
        try {
          const u = new URL(a.href, location.href);
          if (u.host !== location.host) posthog.capture('outbound_click', { href: u.href });
        } catch {}
      },
      { capture: true }
    );
  });

  function trackClick(item: Link) {
    posthog.capture('social_tile_click', { network: item.icon, href: item.href });
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
      class="selfie"
      src={hero}
      alt="Deniz Astrology — hero portrait"
      loading="eager"
      decoding="async"
      fetchpriority="high"
    />
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
        on:click={() => trackClick(item)}
      >
        <img
          class="icon-img"
          src={iconMap[item.icon]}
          alt=""
          aria-hidden="true"
        />
      </a>
    {/each}
  </section>

  <footer class="footer">
    <small>© {year} Deniz Astrology</small>
  </footer>
</main>

<style>
  :global(html, body, #app) {
    height: 100%;
  }
  :global(body) {
    margin: 0;
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI",
      Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji",
      "Segoe UI Emoji";
    background: var(--bg);
    color: var(--fg);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Theme + safe-area support */
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

  .page {
    min-height: 100%;
    display: grid;
    grid-template-rows: auto auto 1fr auto;
    gap: clamp(16px, 4vw, 28px);
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
    padding: clamp(12px, 3.5vw, 20px) clamp(16px, 5vw, 24px) 12px;
  }

  h1 {
    font-size: clamp(28px, 6vw, 40px);
    line-height: 1.1;
    margin: 0 0 6px 0;
    font-weight: 700;
    letter-spacing: 0.2px;
  }

  .subtitle {
    margin: 0;
    color: var(--muted);
    font-size: clamp(13px, 3.5vw, 16px);
  }

  .hero {
    display: grid;
    place-items: center;
    padding: 8px clamp(16px, 5vw, 24px) 0;
  }

  /* Mobile-first hero, scales smoothly */
  .selfie {
    width: clamp(220px, 62vw, 340px);
    height: auto;
    aspect-ratio: auto;
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,0.08);
    box-shadow:
      0 14px 32px rgba(0,0,0,0.40),
      0 0 0 4px var(--ring);
  }

  .tiles {
    --gutter: clamp(12px, 4.5vw, 20px);
    width: 100%;
    max-width: var(--maxw);
    margin: var(--gutter) auto;
    padding: 0 var(--gutter);
    display: grid;
    gap: var(--gutter);
    grid-template-columns: 1fr; /* phones */
  }

  /* small tablets */
  @media (min-width: 520px) {
    .tiles { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }

  /* desktops */
  @media (min-width: 900px) {
    .tiles { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  }

  .tile {
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    color: var(--fg);
    background: var(--tile-bg);
    border: 1px solid var(--tile-brd);
    border-radius: 14px;
    padding: clamp(14px, 3.5vw, 20px);
    min-height: clamp(120px, 28vw, 160px); /* ≥48px tap target */
    transition: transform 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease;
    box-shadow: 0 8px 24px rgba(0,0,0,0.35);
    touch-action: manipulation;
  }

  .tile:hover,
  .tile:focus-visible {
    transform: translateY(-2px);
    border-color: var(--accent);
    box-shadow: 0 10px 28px rgba(0,0,0,0.44);
    outline: none;
  }

  /* Icon scales with viewport; no hardcoded width/height */
  .icon-img {
    width: clamp(56px, 12vw, 84px);
    height: clamp(56px, 12vw, 84px);
    object-fit: contain;
    display: block;
    box-sizing: border-box;
  }

  /* Normalize YouTube and X into rounded-square badges */
  .tile[data-icon='youtube'] .icon-img,
  .tile[data-icon='x'] .icon-img {
    padding: clamp(8px, 2.2vw, 12px);
    border-radius: clamp(12px, 3vw, 18px);
    background:
      linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))
      #0f0f16;
    border: 1px solid rgba(255,255,255,0.06);
    box-shadow:
      0 6px 18px rgba(0,0,0,0.35),
      inset 0 0 0 1px rgba(255,255,255,0.04);
  }

  .footer {
    display: grid;
    place-items: center;
    padding: 22px 0 calc(30px + var(--safe-bottom));
    color: var(--muted);
  }

  /* Reduce motion for users who prefer it */
  @media (prefers-reduced-motion: reduce) {
    .tile { transition: none; }
    .tile:hover { transform: none; }
  }
</style>
