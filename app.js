(() => {
  'use strict';

  const CONFIG = Object.freeze({
    analyticsId: 'G-43XJ69N8VD',
    analyticsConsentKey: 'gea-analytics-consent',
    themeStorageKey: 'gea-theme-manual-override',
    whatsappNumber: '573017605677',
    logoPositive: './assets/img/imagotipo-horizontal.svg',
    logoNegative: './assets/img/Soluciones_GEA_imagotipo_horizontal_blanco.svg',
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

  function enhanceGeaCareMembershipCopy() {
    const readingText = 'Lectura de servicios públicos (agua, energía y gas), registro de consumos y recomendaciones técnicas según las lecturas y hallazgos.';

    document.querySelectorAll('.care-plan-card').forEach((card) => {
      const name = card.querySelector('h3')?.textContent.trim();
      if (!['GEA Negocio', 'GEA Empresa', 'GEA Total'].includes(name)) return;

      const list = card.querySelector('ul');
      if (!list || list.querySelector('[data-gea-readings]')) return;

      const item = document.createElement('li');
      item.dataset.geaReadings = 'true';
      item.textContent = readingText;
      list.appendChild(item);
    });

    const plansIntro = document.querySelector('.care-plans-section .section-heading p:not(.eyebrow)');
    if (plansIntro && !plansIntro.textContent.includes('lectura')) {
      plansIntro.textContent = `${plansIntro.textContent.trim()} También incluyen lectura de servicios públicos y recomendaciones técnicas.`;
    }

    document.querySelectorAll('.service-care .plan-card').forEach((card) => {
      const name = card.querySelector('h3')?.textContent.trim();
      if (!['GEA Negocio', 'GEA Empresa', 'GEA Total'].includes(name)) return;
      if (card.querySelector('[data-gea-readings]')) return;

      const detail = document.createElement('p');
      detail.dataset.geaReadings = 'true';
      detail.textContent = readingText;
      card.appendChild(detail);
    });

    const includedList = document.querySelector('.service-care .scope-included ul');
    if (includedList && !includedList.querySelector('[data-gea-readings]')) {
      const item = document.createElement('li');
      item.dataset.geaReadings = 'true';
      item.textContent = 'Lectura de servicios públicos, registro de consumos y recomendaciones técnicas.';
      includedList.appendChild(item);
    }
  }

  function initializeHomepageFaq() {
    const section = document.querySelector('.gea-service-faq');
    if (!section || typeof Element.prototype.animate !== 'function') return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    section.querySelectorAll('.gea-faq-item').forEach((details) => {
      const summary = details.querySelector('summary');
      const answer = details.querySelector('.gea-faq-answer');
      if (!summary || !answer) return;

      summary.addEventListener('click', (event) => {
        if (reduceMotion.matches) return;

        event.preventDefault();
        if (details.classList.contains('is-animating')) return;

        const opening = !details.open;
        const startHeight = details.getBoundingClientRect().height;

        if (opening) details.open = true;

        const endHeight = opening
          ? summary.getBoundingClientRect().height + answer.getBoundingClientRect().height
          : summary.getBoundingClientRect().height;

        details.classList.add('is-animating');

        const panelAnimation = details.animate(
          [
            { height: `${startHeight}px` },
            { height: `${endHeight}px` },
          ],
          {
            duration: opening ? 280 : 230,
            easing: 'cubic-bezier(.2, .8, .2, 1)',
          },
        );

        answer.animate(
          opening
            ? [
                { opacity: 0, transform: 'translateY(-6px)' },
                { opacity: 1, transform: 'translateY(0)' },
              ]
            : [
                { opacity: 1, transform: 'translateY(0)' },
                { opacity: 0, transform: 'translateY(-4px)' },
              ],
          {
            duration: opening ? 220 : 160,
            easing: 'ease-out',
          },
        );

        panelAnimation.addEventListener('finish', () => {
          if (!opening) details.open = false;
          details.classList.remove('is-animating');
        }, { once: true });

        panelAnimation.addEventListener('cancel', () => {
          details.classList.remove('is-animating');
        }, { once: true });
      });
    });
  }

  function initializeGoogleReviews() {
    const section = document.querySelector('[data-google-reviews]');
    if (!section) return;

    const ratingElement = section.querySelector('[data-google-rating]');
    const reviewCountElement = section.querySelector('[data-google-review-count]');
    const starsElement = section.querySelector('[data-google-stars]');
    const listElement = section.querySelector('[data-google-review-list]');
    const noticeElement = section.querySelector('[data-google-reviews-notice]');
    const profileLink = section.querySelector('[data-google-profile-link]');
    let hasLoaded = false;

    const starString = (rating) => {
      const rounded = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
      return `${'★'.repeat(rounded)}${'☆'.repeat(5 - rounded)}`;
    };

    const setFallback = () => {
      section.classList.add('is-fallback');
      listElement?.setAttribute('aria-busy', 'false');
      if (reviewCountElement) reviewCountElement.textContent = 'Consulta las calificaciones y opiniones directamente en Google.';
      if (noticeElement) {
        noticeElement.textContent = 'La conexión en tiempo real con Google todavía no está configurada. El perfil oficial sigue disponible mediante el botón superior.';
      }
    };

    const renderReviews = (payload) => {
      section.classList.remove('is-fallback');

      if (profileLink && payload.googleProfileUrl) {
        profileLink.href = payload.googleProfileUrl;
      }

      if (ratingElement) {
        ratingElement.textContent = Number.isFinite(payload.rating)
          ? Number(payload.rating).toFixed(1)
          : '—';
      }

      if (starsElement) {
        starsElement.textContent = starString(payload.rating);
        starsElement.setAttribute('aria-label', `${payload.rating || 0} de 5 estrellas`);
      }

      if (reviewCountElement) {
        const count = Number(payload.reviewCount) || 0;
        reviewCountElement.textContent = count === 1
          ? '1 calificación publicada en Google'
          : `${count.toLocaleString('es-CO')} calificaciones publicadas en Google`;
      }

      if (!listElement) return;
      listElement.replaceChildren();
      listElement.setAttribute('aria-busy', 'false');

      const reviews = Array.isArray(payload.reviews) ? payload.reviews : [];
      reviews.forEach((review) => {
        const card = document.createElement('article');
        card.className = 'google-review-card';

        const author = document.createElement('div');
        author.className = 'google-review-author';

        if (review.author?.photoUri) {
          const image = document.createElement('img');
          image.src = review.author.photoUri;
          image.alt = '';
          image.width = 42;
          image.height = 42;
          image.loading = 'lazy';
          image.decoding = 'async';
          image.referrerPolicy = 'no-referrer';
          author.appendChild(image);
        }

        const authorCopy = document.createElement('div');
        authorCopy.className = 'google-review-author-copy';

        const authorName = document.createElement(review.author?.uri ? 'a' : 'strong');
        authorName.textContent = review.author?.name || 'Usuario de Google';
        if (authorName instanceof HTMLAnchorElement) {
          authorName.href = review.author.uri;
          authorName.target = '_blank';
          authorName.rel = 'noopener noreferrer';
        }
        authorCopy.appendChild(authorName);

        if (review.relativeTime) {
          const time = document.createElement('small');
          time.textContent = review.relativeTime;
          authorCopy.appendChild(time);
        }

        author.appendChild(authorCopy);
        card.appendChild(author);

        const stars = document.createElement('div');
        stars.className = 'google-review-stars';
        stars.textContent = starString(review.rating);
        stars.setAttribute('aria-label', `${review.rating || 0} de 5 estrellas`);
        card.appendChild(stars);

        if (review.text) {
          const text = document.createElement('p');
          text.className = 'google-review-text';
          text.textContent = review.text;
          card.appendChild(text);
        }

        if (review.googleMapsUri) {
          const source = document.createElement('a');
          source.className = 'google-review-source-link';
          source.href = review.googleMapsUri;
          source.target = '_blank';
          source.rel = 'noopener noreferrer';
          source.textContent = 'Ver en Google Maps';
          card.appendChild(source);
        }

        listElement.appendChild(card);
      });

      if (!reviews.length) {
        section.classList.add('is-fallback');
      }

      if (noticeElement) {
        noticeElement.textContent = payload.orderingNotice ||
          'Opiniones proporcionadas por Google Maps y atribuidas a sus autores.';
      }
    };

    const load = async () => {
      if (hasLoaded) return;
      hasLoaded = true;

      try {
        const response = await fetch('/api/google-reviews', {
          method: 'GET',
          headers: { accept: 'application/json' },
          cache: 'no-store',
        });

        const payload = await response.json();
        if (!response.ok || !payload?.configured) {
          setFallback();
          return;
        }

        renderReviews(payload);
      } catch (_) {
        setFallback();
      }
    };

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        void load();
      }, { rootMargin: '420px 0px' });

      observer.observe(section);
      return;
    }

    void load();
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
    enhanceGeaCareMembershipCopy();
    initializeHomepageFaq();
    initializeGoogleReviews();
    updateFooterYear();
  }

  initialize();

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) applyResolvedTheme();
  });
})();
