<script>
  // Assets
  import hero from './assets/hero/hero.jpg';
  import iconYoutube from './assets/logos/youtube.svg?url';
  import iconInstagram from './assets/logos/reels.png';
  import iconTiktok from './assets/logos/tiktok.svg?url';
  import iconX from './assets/logos/x.svg?url';

  // Links
  const links = [
    {
      href: 'https://www.youtube.com/@deniz_astrology/shorts',
      label: 'YouTube Shorts',
      icon: 'youtube'
    },
    {
      href: 'https://www.instagram.com/deniz_astrology/reels/',
      label: 'Instagram Reels',
      icon: 'instagram'
    },
    {
      href: 'https://www.tiktok.com/@deniz_astrology',
      label: 'TikTok Videos',
      icon: 'tiktok'
    },
    {
      href: 'https://x.com/deniz_astrology',
      label: 'X',
      icon: 'x'
    }
  ];

  // Map logical icon -> asset URL
  const iconMap = {
    youtube: iconYoutube,
    instagram: iconInstagram,
    tiktok: iconTiktok,
    x: iconX
  };

  const year = new Date().getFullYear();
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
      >
        <img
          class="icon-img"
          src={iconMap[item.icon]}
          alt=""
          aria-hidden="true"
          width="84"
          height="84"
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

  /* Theme */
  :root {
    --bg: #0b0b10;
    --fg: #f5f6fb;
    --muted: #a6a8b8;
    --accent: #a493ff;
    --tile-bg: #141420;
    --tile-brd: rgba(255,255,255,0.09);
    --ring: rgba(164,147,255,0.28);
    --maxw: 1000px;
  }

  .page {
    min-height: 100%;
    display: grid;
    grid-template-rows: auto auto 1fr auto;
    gap: 28px;
  }

  .site-header {
    display: flex;
    justify-content: center;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    background: linear-gradient(0deg, rgba(255,255,255,0.02), rgba(255,255,255,0.02));
    backdrop-filter: blur(6px);
  }

  .brand {
    width: 100%;
    max-width: var(--maxw);
    padding: 20px 20px 16px;
  }

  h1 {
    font-size: clamp(28px, 4vw, 40px);
    line-height: 1.1;
    margin: 0 0 6px 0;
    font-weight: 700;
    letter-spacing: 0.2px;
  }

  .subtitle {
    margin: 0;
    color: var(--muted);
    font-size: clamp(14px, 1.8vw, 16px);
  }

  .hero {
    display: grid;
    place-items: center;
    padding: 10px 20px 0 20px;
  }

  /* Smaller, natural-ratio hero */
  .selfie {
    width: clamp(180px, 46vw, 200px);
    height: auto;
    aspect-ratio: auto;
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,0.08);
    box-shadow:
      0 16px 40px rgba(0,0,0,0.40),
      0 0 0 4px var(--ring);
  }

  .tiles {
    width: 100%;
    max-width: var(--maxw);
    margin: 14px auto 8px auto;
    padding: 0 20px 6px;
    display: grid;
    gap: 14px;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }

  .tile {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center; /* NEW: centers content vertically */
    gap: 12px;
    text-decoration: none;
    color: var(--fg);
    background: var(--tile-bg);
    border: 1px solid var(--tile-brd);
    border-radius: 14px;
    padding: 20px 18px;
    min-height: 160px;        /* keeps cards the same height */
    transition: transform 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease;
    box-shadow: 0 8px 24px rgba(0,0,0,0.35);
    will-change: transform;
  }

  .tile:hover,
  .tile:focus-visible {
    transform: translateY(-2px);
    border-color: var(--accent);
    box-shadow: 0 10px 28px rgba(0,0,0,0.44);
    outline: none;
  }

  /* Consistent icon box */
  .icon-img {
    width: 84px;
    height: 84px;
    object-fit: contain;
    display: block;
    box-sizing: border-box;
  }

  /* Normalize YouTube and X into rounded-square badges
     so they match the visual weight of IG/TikTok */
  .tile[data-icon='youtube'] .icon-img,
  .tile[data-icon='x'] .icon-img {
    padding: 12px;
    border-radius: 18px;
    background:
      linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))
      #0f0f16;
    border: 1px solid rgba(255,255,255,0.06);
    box-shadow:
      0 6px 18px rgba(0,0,0,0.35),
      inset 0 0 0 1px rgba(255,255,255,0.04);
  }

  .tile-label {
    font-weight: 600;
    letter-spacing: 0.2px;
    text-align: center;
    font-size: 18px;
  }

  .footer {
    display: grid;
    place-items: center;
    padding: 22px 0 30px;
    color: var(--muted);
  }

  @media (min-width: 900px) {
    .brand { padding-left: 24px; padding-right: 24px; }
    .tiles { gap: 16px; }
    .tile { padding: 22px 20px; }
  }
</style>
