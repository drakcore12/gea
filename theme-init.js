(() => {
  'use strict';

  const root = document.documentElement;
  const storageKey = 'gea-theme-manual-override';
  const darkThemeColor = '#011949';
  const lightThemeColor = '#ffffff';

  function scheduledTheme(date = new Date()) {
    const hour = date.getHours();
    return hour >= 18 || hour < 6 ? 'dark' : 'light';
  }

  function storedTheme() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
      const isValid =
        saved &&
        ['light', 'dark'].includes(saved.theme) &&
        Number(saved.expiresAt) > Date.now();

      if (isValid) return saved.theme;
      localStorage.removeItem(storageKey);
    } catch (_) {
      // El tema automático sigue funcionando aunque el almacenamiento esté bloqueado.
    }

    return null;
  }

  function isHomePage() {
    return location.pathname === '/' || location.pathname.endsWith('/index.html');
  }

  function deployedAsset(path) {
    const version = document.querySelector('meta[name="gea-build"]')?.content;
    return version ? `${path}?v=${encodeURIComponent(version)}` : path;
  }

  function loadNavigationLogoStyles() {
    if (document.querySelector('link[href*="nav-logo.css"]')) return;

    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = deployedAsset('/nav-logo.css');
    stylesheet.dataset.navigationLogo = 'true';
    document.head.appendChild(stylesheet);
  }

  function loadFloatingWhatsapp() {
    if (document.querySelector('script[data-floating-whatsapp-script]')) return;

    const script = document.createElement('script');
    script.src = deployedAsset('/floating-whatsapp.js');
    script.defer = true;
    script.dataset.floatingWhatsappScript = 'true';
    document.head.appendChild(script);
  }

  function preloadEditorialStyles() {
    if (!isHomePage() || document.querySelector('link[data-gea-editorial-preload]')) return;

    const preload = document.createElement('link');
    preload.rel = 'preload';
    preload.as = 'style';
    preload.href = deployedAsset('/gea-editorial-2026.css');
    preload.dataset.geaEditorialPreload = 'true';
    document.head.appendChild(preload);
  }

  function loadEditorialStyles() {
    if (!isHomePage() || document.querySelector('link[data-gea-editorial-styles]')) return;

    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = deployedAsset('/gea-editorial-2026.css');
    stylesheet.dataset.geaEditorialStyles = 'true';
    document.head.appendChild(stylesheet);
  }

  function loadServiceIconSizing() {
    if (!isHomePage() || document.querySelector('link[data-service-icon-sizing]')) return;

    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = deployedAsset('/service-icon-sizing.css');
    stylesheet.dataset.serviceIconSizing = 'true';
    document.head.appendChild(stylesheet);
  }

  function loadHomeMotionSystem() {
    if (!isHomePage()) return;

    // Editorial defines geometry. Motion loads after it and only animates that geometry.
    loadEditorialStyles();

    if (!document.querySelector('link[data-gea-motion-styles]')) {
      const stylesheet = document.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = deployedAsset('/gea-motion.css');
      stylesheet.dataset.geaMotionStyles = 'true';
      document.head.appendChild(stylesheet);
    }

    loadServiceIconSizing();

    if (!document.querySelector('script[data-gea-motion-script]')) {
      const script = document.createElement('script');
      script.src = deployedAsset('/gea-motion.js');
      script.defer = true;
      script.dataset.geaMotionScript = 'true';
      document.head.appendChild(script);
    }
  }

  function loadHomeScripts() {
    if (!isHomePage() || document.querySelector('script[data-gea-home-runtime]')) return;

    ['/app.js', '/home-redesign.js', '/hero-video.js'].forEach((src) => {
      const script = document.createElement('script');
      script.src = deployedAsset(src);
      script.async = false;
      script.dataset.geaHomeRuntime = 'true';
      document.body.appendChild(script);
    });
  }

  let enhancementsStarted = false;

  function startEnhancements() {
    if (enhancementsStarted) return;
    enhancementsStarted = true;

    loadNavigationLogoStyles();
    loadFloatingWhatsapp();

    if (isHomePage()) {
      loadHomeMotionSystem();
      loadHomeScripts();
    }
  }

  const theme = storedTheme() || scheduledTheme();
  root.classList.remove('no-js');
  root.classList.add('js');
  root.dataset.theme = theme;
  window.__geaInitialTheme = theme;

  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.content = theme === 'dark' ? darkThemeColor : lightThemeColor;
  }

  if (isHomePage()) {
    // Keep the synthetic/mobile critical path focused on the intro gate.
    // Home-only styles, motion and helpers start after the visitor leaves it.
    window.addEventListener('gea:intro-closed', startEnhancements, { once: true });

    window.addEventListener('DOMContentLoaded', () => {
      if (!document.querySelector('[data-gea-intro]')) startEnhancements();
    }, { once: true });
  } else {
    startEnhancements();
  }
})();
