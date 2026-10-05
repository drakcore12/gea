(() => {
  'use strict';

  const body = document.body;
  if (!body?.classList.contains('home-ux')) return;

  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
  const counters = Array.from(document.querySelectorAll('[data-counter-target]'));
  const serviceCards = Array.from(document.querySelectorAll('.home-service-card'));
  const heroTitle = document.querySelector('#hero-title');
  const heroContextEm = heroTitle?.querySelector('em');
  let countersStarted = false;
  let heroRotatorStarted = false;

  const formatNumber = (value) => new Intl.NumberFormat('es-CO', {
    maximumFractionDigits: 0,
  }).format(value);

  function ensureHeroContextStyles() {
    if (!heroContextEm || document.querySelector('link[data-hero-context-styles]')) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/hero-context-rotator.css';
    link.dataset.heroContextStyles = 'true';
    document.head.appendChild(link);
  }

  function ensureServiceIconStyles() {
    if (document.querySelector('link[data-service-icon-sizing]')) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/service-icon-sizing.css?v=frame-v2';
    link.dataset.serviceIconSizing = 'true';
    document.head.appendChild(link);
  }

  function normalizeServiceIconFrames() {
    document.querySelectorAll('.home-service-card .home-service-icon').forEach((icon) => {
      if (icon.parentElement?.classList.contains('home-service-icon-frame')) return;

      const frame = document.createElement('span');
      frame.className = 'home-service-icon-frame';
      frame.setAttribute('aria-hidden', 'true');

      icon.parentNode?.insertBefore(frame, icon);
      frame.appendChild(icon);
    });
  }

  function initializeHeroContextRotator() {
    if (heroRotatorStarted || !heroTitle || !heroContextEm) return;
    heroRotatorStarted = true;

    const contexts = ['casa', 'negocio', 'industria'];
    let contextIndex = 0;

    heroTitle.setAttribute(
      'aria-label',
      'Una sola empresa para todo lo que necesita tu casa, negocio o industria',
    );

    heroTitle.textContent = '';

    const mainLine = document.createElement('span');
    mainLine.className = 'hero-title-main';
    mainLine.textContent = 'Una sola empresa para todo lo que necesita tu';
    heroTitle.appendChild(mainLine);

    const contextLine = document.createElement('span');
    contextLine.className = 'hero-title-context-line';

    heroContextEm.textContent = '';

    const rotator = document.createElement('span');
    rotator.className = 'hero-context-rotator';
    rotator.dataset.context = contexts[0];
    rotator.setAttribute('aria-hidden', 'true');

    const word = document.createElement('span');
    word.className = 'hero-context-word';
    word.textContent = contexts[0];
    rotator.appendChild(word);
    heroContextEm.appendChild(rotator);
    contextLine.appendChild(heroContextEm);
    heroTitle.appendChild(contextLine);

    if (reducedMotion) return;

    const rotateContext = () => {
      if (document.hidden) return;

      word.classList.add('is-leaving');

      window.setTimeout(() => {
        contextIndex = (contextIndex + 1) % contexts.length;
        word.textContent = contexts[contextIndex];
        rotator.dataset.context = contexts[contextIndex];
        word.classList.remove('is-leaving');
        word.classList.add('is-entering');

        requestAnimationFrame(() => {
          requestAnimationFrame(() => word.classList.remove('is-entering'));
        });
      }, 280);
    };

    window.setInterval(rotateContext, 3200);
  }

  function setCounter(counter, value) {
    const prefix = counter.dataset.counterPrefix || '';
    const suffix = counter.dataset.counterSuffix || '';
    counter.textContent = `${prefix}${formatNumber(value)}${suffix}`;
  }

  function startCounters() {
    if (countersStarted) return;
    countersStarted = true;

    counters.forEach((counter) => {
      const target = Number.parseInt(counter.dataset.counterTarget || '', 10);
      if (!Number.isFinite(target)) return;

      if (reducedMotion) {
        setCounter(counter, target);
        return;
      }

      const duration = 1050;
      const started = performance.now();
      const tick = (now) => {
        const progress = Math.min(1, (now - started) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCounter(counter, Math.round(target * eased));
        if (progress < 1) window.requestAnimationFrame(tick);
      };

      setCounter(counter, 0);
      window.requestAnimationFrame(tick);
    });
  }

  function activateServiceCards() {
    serviceCards.forEach((card, index) => {
      window.setTimeout(() => {
        card.classList.add('is-energized');
      }, reducedMotion ? 0 : index * 150);
    });
  }

  function observeOnce(element, callback, threshold = 0.35) {
    if (!element) return;

    if (reducedMotion || !('IntersectionObserver' in window)) {
      callback();
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting) return;
      observer.disconnect();
      callback();
    }, {
      threshold,
      rootMargin: '0px 0px -6% 0px',
    });

    observer.observe(element);
  }

  function bogotaHour() {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'America/Bogota',
      hour: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(new Date());

    return Number.parseInt(parts.find((part) => part.type === 'hour')?.value || '0', 10);
  }

  function updateLiveStatus() {
    const status = document.querySelector('[data-live-status]');
    const text = document.querySelector('[data-live-status-text]');
    if (!status || !text) return;

    const active = bogotaHour() >= 6 && bogotaHour() < 18;
    status.classList.toggle('is-open', active);
    status.classList.toggle('is-closed', !active);
    text.textContent = active
      ? 'Horario de atención activo · 6:00 a.m. a 6:00 p.m.'
      : 'Fuera de horario · escríbenos y respondemos a primera hora';
  }

  const DIAGNOSIS = {
    'gas-smell': {
      title: 'Revisión prioritaria de gas',
      copy: 'Por el síntoma, conviene revisar la instalación de gas y descartar una fuga o conexión defectuosa.',
      safety: 'Si el olor es intenso, sal del lugar y contacta primero la línea de emergencias de tu proveedor. No acciones interruptores ni generes llamas.',
      service: '/servicios/gas-medellin/',
      message: 'Hola, Soluciones GEA. Percibo olor a gas y necesito orientación/revisión. Mi ubicación es: ',
    },
    breaker: {
      title: 'Electricista · diagnóstico de circuito',
      copy: 'Un breaker que se dispara puede indicar sobrecarga, corto o una falla en el circuito. Recomendamos diagnóstico eléctrico.',
      safety: 'No fuerces el breaker a permanecer encendido si vuelve a dispararse.',
      service: '/servicios/electricista-medellin/',
      message: 'Hola, Soluciones GEA. Se está disparando un breaker y necesito una revisión eléctrica. Mi ubicación es: ',
    },
    'no-power': {
      title: 'Electricista · punto sin energía',
      copy: 'Podemos revisar tomas, interruptores, iluminación, tablero y circuitos accesibles para encontrar el origen de la falla.',
      service: '/servicios/electricista-medellin/',
      message: 'Hola, Soluciones GEA. Tengo un punto sin energía y necesito una revisión eléctrica. Mi ubicación es: ',
    },
    'water-leak': {
      title: 'Plomería · fuga o humedad',
      copy: 'Podemos revisar fugas visibles, conexiones, tuberías y señales de humedad para identificar el origen probable.',
      safety: 'Si puedes hacerlo con seguridad, cierra la llave de paso y evita que el agua alcance instalaciones eléctricas.',
      service: '/servicios/plomero-fugas-agua-medellin/',
      message: 'Hola, Soluciones GEA. Tengo una fuga o humedad y necesito una revisión de plomería. Mi ubicación es: ',
    },
    'low-pressure': {
      title: 'Plomería · presión y bombas',
      copy: 'La baja presión puede relacionarse con la red interna, válvulas, obstrucciones o el sistema de bombeo. Podemos diagnosticarlo.',
      service: '/servicios/plomero-fugas-agua-medellin/',
      message: 'Hola, Soluciones GEA. Tengo baja presión de agua y necesito una revisión. Mi ubicación es: ',
    },
    'gas-installation': {
      title: 'Servicio técnico de gas',
      copy: 'Revisamos redes internas, puntos, conexiones, reguladores, calentadores y adecuaciones según el alcance.',
      service: '/servicios/gas-medellin/',
      message: 'Hola, Soluciones GEA. Necesito revisar o instalar una red/punto de gas. Mi ubicación es: ',
    },
    unknown: {
      title: 'Orientación inicial',
      copy: 'No necesitas conocer el nombre técnico de la falla. Cuéntanos qué notas, dónde ocurre y desde cuándo.',
      service: '#servicios',
      message: 'Hola, Soluciones GEA. No sé exactamente qué está fallando. Los síntomas que noto son: ',
    },
  };

  function initializeQuickDiagnosis() {
    const result = document.querySelector('[data-diagnosis-result]');
    if (!result) return;

    const title = result.querySelector('[data-diagnosis-title]');
    const copy = result.querySelector('[data-diagnosis-copy]');
    const safety = result.querySelector('[data-diagnosis-safety]');
    const whatsapp = result.querySelector('[data-diagnosis-whatsapp]');
    const service = result.querySelector('[data-diagnosis-service]');

    document.querySelectorAll('[data-diagnosis]').forEach((button) => {
      button.addEventListener('click', () => {
        const selected = DIAGNOSIS[button.dataset.diagnosis];
        if (!selected) return;

        document.querySelectorAll('[data-diagnosis]').forEach((item) => {
          const active = item === button;
          item.classList.toggle('is-selected', active);
          item.setAttribute('aria-pressed', String(active));
        });

        title.textContent = selected.title;
        copy.textContent = selected.copy;
        safety.hidden = !selected.safety;
        safety.textContent = selected.safety || '';
        whatsapp.href = `https://wa.me/573017605677?text=${encodeURIComponent(selected.message)}`;
        service.href = selected.service;
        result.hidden = false;
        result.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest' });
      });
    });
  }

  function initializeReviewAvatarLoading() {
    const avatarImages = Array.from(document.querySelectorAll('img[data-review-avatar-src]'));
    if (!avatarImages.length) return;

    const normalizeName = (value) => String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();

    const safeGoogleImageUrl = (value) => {
      if (typeof value !== 'string' || !value.trim()) return null;

      try {
        const url = new URL(value);
        const hostname = url.hostname.toLowerCase();
        const isGoogleUserContent =
          hostname === 'googleusercontent.com' ||
          hostname.endsWith('.googleusercontent.com');

        if (url.protocol !== 'https:' || !isGoogleUserContent) return null;
        return url.href;
      } catch (_) {
        return null;
      }
    };

    avatarImages.forEach((image) => {
      const fallback = image.dataset.reviewAvatarSrc;
      if (!fallback) return;
      image.addEventListener('load', () => image.classList.add('is-loaded'));
      image.src = fallback;
    });

    fetch('/api/google-review-avatars', {
      method: 'GET',
      headers: { accept: 'application/json' },
      cache: 'default',
    })
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => {
        if (!payload?.configured || !Array.isArray(payload.reviews)) return;

        const photosByAuthor = new Map(
          payload.reviews
            .map((review) => [normalizeName(review?.name), safeGoogleImageUrl(review?.photoUri)])
            .filter(([name, photoUri]) => name && photoUri),
        );

        avatarImages.forEach((image) => {
          const authorName = image.closest('.google-review-card')
            ?.querySelector('.google-review-author-copy strong')
            ?.textContent;
          const photoUri = photosByAuthor.get(normalizeName(authorName));
          if (!photoUri) return;

          const fallback = image.dataset.reviewAvatarSrc;
          image.referrerPolicy = 'no-referrer';
          image.addEventListener('error', () => {
            if (fallback && image.src !== new URL(fallback, window.location.href).href) {
              image.src = fallback;
            }
          }, { once: true });
          image.src = photoUri;
        });
      })
      .catch(() => {
        // Los SVG locales siguen funcionando como fallback.
      });
  }

  function initializeGoogleMapLoader() {
    const card = document.querySelector('[data-google-map-card]');
    const placeholder = document.querySelector('[data-google-map-placeholder]');
    if (!card || !placeholder || card.querySelector('iframe')) return;

    const iframe = document.createElement('iframe');
    iframe.title = 'Mapa de ubicación de Soluciones GEA';
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.src = 'https://www.google.com/maps?q=Cra.%20141%20%2362-86%2C%20Medell%C3%ADn%2C%20Antioquia&output=embed';
    iframe.allowFullscreen = true;

    placeholder.hidden = true;
    card.appendChild(iframe);
    card.classList.add('is-map-loaded');
  }

  function initializeCoverage() {
    const result = document.querySelector('[data-coverage-result]');
    if (!result) return;

    const title = result.querySelector('[data-coverage-title]');
    const copy = result.querySelector('[data-coverage-copy]');
    const whatsapp = result.querySelector('[data-coverage-whatsapp]');

    document.querySelectorAll('[data-coverage-location]').forEach((button) => {
      button.addEventListener('click', () => {
        const location = button.dataset.coverageLocation || '';
        const needsConfirmation = button.hasAttribute('data-coverage-confirm');

        document.querySelectorAll('[data-coverage-location]').forEach((item) => {
          item.classList.toggle('is-selected', item === button);
        });

        title.textContent = needsConfirmation
          ? 'Confirmemos cobertura en tu municipio'
          : `Sí atendemos ${location}`;
        copy.textContent = needsConfirmation
          ? 'Escríbenos tu municipio o sector y te confirmamos disponibilidad antes de programar.'
          : 'La disponibilidad se confirma según el tipo de servicio y el horario solicitado.';
        whatsapp.href = `https://wa.me/573017605677?text=${encodeURIComponent(
          needsConfirmation
            ? 'Hola, Soluciones GEA. Quiero confirmar cobertura. Mi municipio/sector es: '
            : `Hola, Soluciones GEA. Estoy en ${location} y quiero solicitar una visita técnica. El servicio que necesito es: `,
        )}`;
        result.hidden = false;
      });
    });
  }

  function initializePageMotion() {
    initializeHeroContextRotator();
    updateLiveStatus();
    window.setInterval(updateLiveStatus, 60000);
    initializeQuickDiagnosis();
    initializeCoverage();
    initializeReviewAvatarLoading();
    initializeGoogleMapLoader();
    observeOnce(document.querySelector('.credentials-section'), startCounters, 0.45);
    observeOnce(document.querySelector('#servicios .service-hub-grid'), activateServiceCards, 0.25);
  }

  function waitForIntro() {
    if (!body.classList.contains('gea-intro-open')) {
      initializePageMotion();
      return;
    }

    const observer = new MutationObserver(() => {
      if (body.classList.contains('gea-intro-open')) return;
      observer.disconnect();
      requestAnimationFrame(initializePageMotion);
    });

    observer.observe(body, { attributes: true, attributeFilter: ['class'] });
  }

  ensureHeroContextStyles();
  ensureServiceIconStyles();
  normalizeServiceIconFrames();
  waitForIntro();
})();
