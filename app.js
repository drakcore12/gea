(() => {
  'use strict';

  const CONFIG = Object.freeze({
    analyticsId: 'G-43XJ69N8VD',
    analyticsConsentKey: 'gea-analytics-consent',
    themeStorageKey: 'gea-theme-manual-override',
    whatsappNumber: '573017605677',
    logoPositive: './assets/img/imagotipo-horizontal-color-transparente.png',
    logoNegative: './assets/img/imagotipo-horizontal-negativo-transparente.png',
    themeColors: Object.freeze({ light: '#ffffff', dark: '#011949' }),
  });

  const WHATSAPP_MESSAGES = Object.freeze({
    general: 'Hola, Soluciones GEA. Quiero solicitar información o una cotización.',
    gas: 'Hola, Soluciones GEA. Necesito una cotización para un servicio de gas.',
    electricidad: 'Hola, Soluciones GEA. Necesito una cotización para un servicio eléctrico.',
    agua: 'Hola, Soluciones GEA. Necesito una cotización para un servicio de agua.',
    mantenimiento: 'Hola, Soluciones GEA. Estoy interesado en un plan de mantenimiento preventivo.',
  });

  const root = document.documentElement;
  let themeTimer = null;
  let sessionThemeOverride = null;
  let analyticsLoaded = false;
  let sessionAnalyticsConsent = null;

  function safeStorageGet(key) {
    try {
      return localStorage.getItem(key);
    } catch (_) {
      return null;
    }
  }

  function safeStorageSet(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (_) {
      return false;
    }
  }

  function safeStorageRemove(key) {
    try {
      localStorage.removeItem(key);
    } catch (_) {
      // No es necesario interrumpir la experiencia por un fallo de almacenamiento.
    }
  }

  function scheduledTheme(date = new Date()) {
    const hour = date.getHours();
    return hour >= 18 || hour < 6 ? 'dark' : 'light';
  }

  function nextThemeBoundary(date = new Date()) {
    const next = new Date(date);
    next.setMinutes(0, 0, 0);

    if (date.getHours() < 6) {
      next.setHours(6);
    } else if (date.getHours() < 18) {
      next.setHours(18);
    } else {
      next.setDate(next.getDate() + 1);
      next.setHours(6);
    }

    return next;
  }

  function readStoredTheme() {
    const rawValue = safeStorageGet(CONFIG.themeStorageKey);
    if (!rawValue) return null;

    try {
      const saved = JSON.parse(rawValue);
      const isValid =
        saved &&
        ['light', 'dark'].includes(saved.theme) &&
        Number(saved.expiresAt) > Date.now();

      if (isValid) return saved;
    } catch (_) {
      // Se elimina cualquier valor corrupto.
    }

    safeStorageRemove(CONFIG.themeStorageKey);
    return null;
  }

  function saveManualTheme(theme) {
    sessionThemeOverride = theme;
    safeStorageSet(
      CONFIG.themeStorageKey,
      JSON.stringify({ theme, expiresAt: nextThemeBoundary().getTime() }),
    );
  }

  function resolvedTheme() {
    const stored = readStoredTheme();
    return {
      theme: stored?.theme || sessionThemeOverride || scheduledTheme(),
      isManual: Boolean(stored || sessionThemeOverride),
    };
  }

  function syncHeaderLogo(theme) {
    const headerLogo = document.querySelector('.brand-image');
    if (!headerLogo) return;

    const desiredSource = theme === 'dark' ? CONFIG.logoNegative : CONFIG.logoPositive;
    if (headerLogo.getAttribute('src') !== desiredSource) {
      headerLogo.setAttribute('src', desiredSource);
    }
  }

  function syncThemeColor(theme) {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) metaThemeColor.content = CONFIG.themeColors[theme];
  }

  function updateThemeControl(theme, isManual) {
    const button = document.querySelector('.theme-toggle');
    if (!button) return;

    const nextMode = theme === 'dark' ? 'claro' : 'oscuro';
    const source = isManual
      ? 'Selección manual hasta el próximo cambio automático.'
      : 'Automático según la hora local.';

    button.setAttribute('aria-pressed', String(theme === 'dark'));
    button.setAttribute('aria-label', `Activar modo ${nextMode}. ${source}`);
    button.title = `Activar modo ${nextMode}`;

    const accessibleText = button.querySelector('.sr-only');
    if (accessibleText) {
      accessibleText.textContent = `Tema actual: ${theme === 'dark' ? 'oscuro' : 'claro'}. ${source}`;
    }
  }

  function applyTheme(theme, isManual = false) {
    root.dataset.theme = theme;
    syncHeaderLogo(theme);
    syncThemeColor(theme);
    updateThemeControl(theme, isManual);
  }

  function scheduleThemeCheck() {
    window.clearTimeout(themeTimer);
    themeTimer = window.setTimeout(
      applyResolvedTheme,
      Math.max(1000, nextThemeBoundary().getTime() - Date.now() + 750),
    );
  }

  function applyResolvedTheme() {
    const { theme, isManual } = resolvedTheme();
    applyTheme(theme, isManual);
    scheduleThemeCheck();
  }

  function initializeThemeControl() {
    const button = document.querySelector('.theme-toggle');
    if (!button) return;

    button.addEventListener('click', () => {
      const currentTheme = root.dataset.theme || scheduledTheme();
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      saveManualTheme(nextTheme);
      applyTheme(nextTheme, true);
      scheduleThemeCheck();
    });
  }

  function currentAnalyticsConsent() {
    const value = safeStorageGet(CONFIG.analyticsConsentKey);
    if (value === 'granted' || value === 'denied') return value;
    return sessionAnalyticsConsent;
  }

  function loadAnalytics() {
    if (analyticsLoaded || currentAnalyticsConsent() !== 'granted') return;

    analyticsLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', CONFIG.analyticsId, {
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      transport_type: 'beacon',
    });

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(CONFIG.analyticsId)}`;
    script.dataset.analyticsScript = 'true';
    document.head.appendChild(script);
  }

  function trackEvent(name, parameters = {}) {
    if (currentAnalyticsConsent() !== 'granted') return;
    if (!analyticsLoaded || typeof window.gtag !== 'function') return;
    window.gtag('event', name, parameters);
  }

  function setAnalyticsConsent(value) {
    sessionAnalyticsConsent = value;
    safeStorageSet(CONFIG.analyticsConsentKey, value);
    const banner = document.querySelector('.consent-banner');
    if (banner) banner.hidden = true;

    if (value === 'granted') {
      loadAnalytics();
    } else if (analyticsLoaded && typeof window.gtag === 'function') {
      window.gtag('consent', 'update', { analytics_storage: 'denied' });
    }
  }

  function initializeAnalyticsConsent() {
    const banner = document.querySelector('.consent-banner');
    const acceptButton = document.querySelector('[data-consent-accept]');
    const rejectButton = document.querySelector('[data-consent-reject]');
    const manageButtons = document.querySelectorAll('[data-consent-manage]');
    const consent = currentAnalyticsConsent();

    if (consent === 'granted') loadAnalytics();
    if (banner) banner.hidden = Boolean(consent);

    acceptButton?.addEventListener('click', () => setAnalyticsConsent('granted'));
    rejectButton?.addEventListener('click', () => setAnalyticsConsent('denied'));

    manageButtons.forEach((button) => {
      button.addEventListener('click', () => {
        safeStorageRemove(CONFIG.analyticsConsentKey);
        sessionAnalyticsConsent = null;
        if (banner) {
          banner.hidden = false;
          banner.querySelector('button')?.focus();
        }
      });
    });
  }

  function whatsappUrl(message) {
    return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
  }

  function initializeWhatsappLinks() {
    document.querySelectorAll('[data-whatsapp]').forEach((link) => {
      const messageKey = link.dataset.whatsapp || 'general';
      link.href = whatsappUrl(WHATSAPP_MESSAGES[messageKey] || WHATSAPP_MESSAGES.general);

      link.addEventListener('click', () => {
        trackEvent('whatsapp_click', {
          placement: link.dataset.analytics || 'unspecified',
          service: messageKey,
        });
      });
    });
  }

  function setMenuState(isOpen, { returnFocus = false } = {}) {
    const menuButton = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.main-nav');
    if (!menuButton || !nav) return;

    nav.classList.toggle('is-open', isOpen);
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute(
      'aria-label',
      isOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación',
    );
    menuButton.title = isOpen ? 'Cerrar menú' : 'Abrir menú';

    if (returnFocus) menuButton.focus();
  }

  function initializeMobileMenu() {
    const menuButton = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.main-nav');
    if (!menuButton || !nav) return;

    setMenuState(false);

    menuButton.addEventListener('click', () => {
      setMenuState(!nav.classList.contains('is-open'));
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setMenuState(false));
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        setMenuState(false, { returnFocus: true });
      }
    });

    window.addEventListener('resize', () => {
      if (window.matchMedia('(min-width: 761px)').matches) setMenuState(false);
    });
  }

  function normalizedFieldValue(form, fieldName, maxLength) {
    const field = form.elements.namedItem(fieldName);
    if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement)) {
      return '';
    }

    return field.value.trim().replace(/\s+/g, ' ').slice(0, maxLength);
  }

  function openExternalUrl(url) {
    window.location.assign(url);
  }

  function initializeLeadForm() {
    const form = document.querySelector('#lead-form');
    const submitButton = document.querySelector('[data-lead-submit]');
    if (!form || !submitButton) return;

    submitButton.addEventListener('click', () => {
      if (!form.reportValidity()) return;

      const name = normalizedFieldValue(form, 'nombre', 80);
      const phone = normalizedFieldValue(form, 'telefono', 20);
      const service = normalizedFieldValue(form, 'servicio', 50);
      const detail = normalizedFieldValue(form, 'detalle', 1000);

      const message = [
        'Hola, Soluciones GEA. Quiero solicitar una cotización.',
        '',
        `Nombre: ${name}`,
        `Teléfono: ${phone}`,
        `Servicio: ${service}`,
        `Necesidad: ${detail}`,
      ].join('\n');

      trackEvent('generate_lead', { method: 'whatsapp_form', service });
      openExternalUrl(whatsappUrl(message));
    });
  }

  function initializeTrackedLinks() {
    document.querySelectorAll('[data-track-event]').forEach((link) => {
      link.addEventListener('click', () => {
        trackEvent(link.dataset.trackEvent || 'link_click', {
          placement: link.dataset.analytics || 'unspecified',
          destination: link.getAttribute('href') || '',
        });
      });
    });
  }

  function updateFooterYear() {
    document.querySelectorAll('[data-current-year]').forEach((element) => {
      element.textContent = String(new Date().getFullYear());
    });
  }

  function initialize() {
    initializeThemeControl();
    applyResolvedTheme();
    initializeAnalyticsConsent();
    initializeWhatsappLinks();
    initializeMobileMenu();
    initializeLeadForm();
    initializeTrackedLinks();
    updateFooterYear();
  }

  initialize();

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) applyResolvedTheme();
  });
})();
