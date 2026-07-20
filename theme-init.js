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

  function loadHomeServiceEnhancements() {
    if (!isHomePage() || document.querySelector('script[data-service-pages]')) return;

    const script = document.createElement('script');
    script.src = deployedAsset('/service-pages.js');
    script.defer = true;
    script.dataset.servicePages = 'true';
    document.head.appendChild(script);
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

  loadHomeServiceEnhancements();
})();
