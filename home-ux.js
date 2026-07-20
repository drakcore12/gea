(() => {
  'use strict';

  const WHATSAPP_NUMBER = '573017605677';
  const CAROUSEL_INTERVAL = 7000;

  const HOME_MESSAGES = Object.freeze({
    'care-essential': 'Hola, Soluciones GEA. Quiero información sobre el plan GEA Care Essential de $99.000 al mes. Mi negocio es: ',
    'care-plus': 'Hola, Soluciones GEA. Quiero información sobre el plan GEA Care Plus de $189.000 al mes. Mi negocio es: ',
    'care-premium': 'Hola, Soluciones GEA. Quiero información sobre el plan GEA Care Premium de $359.000 al mes. Mi negocio es: ',
    'care-corporate': 'Hola, Soluciones GEA. Quiero una valoración para GEA Care Corporate. Mi negocio o número de sedes es: ',
    'emergency-water': 'Hola, Soluciones GEA. Tengo una posible fuga de agua. Barrio o municipio: ____. Tipo de inmueble: ____. Lo que está ocurriendo: ____.',
    'emergency-electric': 'Hola, Soluciones GEA. Tengo una falla eléctrica. Barrio o municipio: ____. Tipo de inmueble: ____. Síntoma observado: ____. ¿El negocio está detenido?: ____.',
    'emergency-gas': 'Hola, Soluciones GEA. Necesito orientación por una posible novedad de gas. Barrio o municipio: ____. Tipo de inmueble: ____. Lo que estoy observando: ____.',
    'not-sure': 'Hola, Soluciones GEA. No sé cuál servicio necesito. Mi ubicación es: ____. El problema que observo es: ____.',
  });

  const PLAN_DATA = Object.freeze({
    1: Object.freeze({
      name: 'GEA Care Essential',
      price: '$99.000 al mes',
      key: 'care-essential',
      reason: 'Se ajusta inicialmente a espacios de hasta 60 m² y 10 puntos críticos.',
    }),
    2: Object.freeze({
      name: 'GEA Care Plus',
      price: '$189.000 al mes',
      key: 'care-plus',
      reason: 'Se ajusta inicialmente a espacios de hasta 120 m² y 20 puntos críticos.',
    }),
    3: Object.freeze({
      name: 'GEA Care Premium',
      price: '$359.000 al mes',
      key: 'care-premium',
      reason: 'Se ajusta inicialmente a espacios de hasta 250 m² y 40 puntos críticos.',
    }),
    4: Object.freeze({
      name: 'GEA Care Corporate',
      price: 'Desde $699.000 al mes',
      key: 'care-corporate',
      reason: 'Se recomienda valoración personalizada por tamaño, cantidad de puntos o complejidad.',
    }),
  });

  const PRIORITY_SERVICES = Object.freeze([
    Object.freeze({
      title: 'GEA Care Plus',
      badge: 'Más recomendado',
      category: 'Prevención para negocios',
      description: 'Dos chequeos mensuales de agua, gas y electricidad para detectar riesgos visibles y mantener un historial técnico del negocio.',
      price: '$189.000 al mes',
      ideal: 'Cafeterías, panaderías y restaurantes pequeños',
      action: 'Ver Plan Plus',
      url: './servicios/gea-care-mantenimiento-preventivo-negocios-medellin/',
      icon: './assets/img/isotipo-color-transparente.png',
      tone: 'care',
      analytics: 'hero-carousel-care-plus',
    }),
    Object.freeze({
      title: 'GEA Fugas Express',
      badge: 'Muy solicitado',
      category: 'Agua y gas',
      description: 'Diagnóstico y corrección de fugas visibles, humedad, tuberías, sanitarios, lavaplatos y posibles novedades de gas.',
      price: 'Desde $260.000 comercial',
      ideal: 'Hogares, restaurantes, hoteles y locales',
      action: 'Ver Fugas Express',
      url: './servicios/fugas-de-agua-y-gas-medellin/',
      icon: './assets/img/icono_agua_transparente.png',
      tone: 'water',
      analytics: 'hero-carousel-fugas',
    }),
    Object.freeze({
      title: 'GEA Cocina Segura',
      badge: 'Prioridad comercial',
      category: 'Restaurantes y cocinas',
      description: 'Mantenimiento integral de puntos de gas, agua, desagües y trampas de grasa para proteger la continuidad de la cocina.',
      price: 'Desde $300.000 comercial',
      ideal: 'Restaurantes, cafeterías y panaderías',
      action: 'Ver Cocina Segura',
      url: './servicios/mantenimiento-cocinas-comerciales-medellin/',
      icon: './assets/img/icono_gas_transparente.png',
      tone: 'gas',
      analytics: 'hero-carousel-cocina',
    }),
    Object.freeze({
      title: 'GEA Agua Limpia',
      badge: 'Mantenimiento programado',
      category: 'Tanques de agua',
      description: 'Lavado, desinfección y revisión hidráulica básica de tanques para conservar el sistema limpio y en mejores condiciones.',
      price: 'Desde $380.000 comercial',
      ideal: 'Hoteles, edificios, negocios y administraciones',
      action: 'Ver Agua Limpia',
      url: './servicios/lavado-de-tanques-medellin/',
      icon: './assets/img/icono_agua_transparente.png',
      tone: 'water',
      analytics: 'hero-carousel-tanques',
    }),
    Object.freeze({
      title: 'GEA Eléctrico Comercial',
      badge: 'Alta demanda',
      category: 'Electricidad',
      description: 'Diagnóstico de tableros, breakers, cortos, tomas, iluminación y sobrecargas que pueden afectar la operación diaria.',
      price: 'Desde $220.000 comercial',
      ideal: 'Locales, restaurantes, oficinas y bodegas',
      action: 'Ver servicio eléctrico',
      url: './servicios/servicios-electricos-comerciales-medellin/',
      icon: './assets/img/icono_electricidad_transparente.png',
      tone: 'electric',
      analytics: 'hero-carousel-electricidad',
    }),
  ]);

  function whatsappUrl(message) {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  }

  function initializeHomeWhatsappLinks() {
    document.querySelectorAll('[data-home-whatsapp]').forEach((link) => {
      const key = link.dataset.homeWhatsapp;
      const message = HOME_MESSAGES[key];
      if (message) link.href = whatsappUrl(message);
    });
  }

  function selectedNumber(form, name) {
    const selected = form.querySelector(`input[name="${name}"]:checked`);
    return selected ? Number(selected.value) : null;
  }

  function initializePlanFinder() {
    const form = document.querySelector('[data-plan-finder]');
    const submit = form?.querySelector('[data-plan-submit]');
    const result = form?.querySelector('[data-plan-result]');

    if (!form || !submit || !result) return;

    submit.addEventListener('click', () => {
      if (!form.reportValidity()) return;

      const values = [
        selectedNumber(form, 'business'),
        selectedNumber(form, 'area'),
        selectedNumber(form, 'points'),
      ];

      const knownValues = values.filter((value) => Number.isInteger(value) && value > 0);
      const level = knownValues.length ? Math.max(...knownValues) : 2;
      const plan = PLAN_DATA[level] || PLAN_DATA[2];
      const answers = values.join('-');
      const message = `${HOME_MESSAGES[plan.key]}\n\nRespuestas del orientador: ${answers}. Quiero confirmar si este plan corresponde a mi establecimiento.`;

      result.querySelector('[data-plan-name]').textContent = plan.name;
      result.querySelector('[data-plan-price]').textContent = plan.price;
      result.querySelector('[data-plan-reason]').textContent = knownValues.length
        ? plan.reason
        : 'Como marcó “No lo sé”, sugerimos confirmar directamente las condiciones del establecimiento.';
      result.querySelector('[data-plan-link]').href = whatsappUrl(message);
      result.hidden = false;
      result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  function initializeCommercialCarousel() {
    const panel = document.querySelector('.care-dashboard');
    if (!panel || panel.dataset.carouselReady === 'true') return;

    panel.dataset.carouselReady = 'true';
    panel.className = 'commercial-carousel';
    panel.dataset.tone = PRIORITY_SERVICES[0].tone;
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-roledescription', 'carrusel');
    panel.setAttribute('aria-label', 'Servicios destacados de Soluciones GEA');

    const slides = PRIORITY_SERVICES.map((service, index) => `
      <article class="commercial-slide" data-commercial-slide data-tone="${service.tone}" aria-roledescription="diapositiva" aria-label="${index + 1} de ${PRIORITY_SERVICES.length}"${index === 0 ? '' : ' hidden'}>
        <div class="commercial-slide-topline">
          <span class="commercial-badge">${service.badge}</span>
          <span class="commercial-category">${service.category}</span>
        </div>
        <h2>${service.title}</h2>
        <p class="commercial-slide-description">${service.description}</p>
        <div class="commercial-slide-meta">
          <span><small>Precio de referencia</small><strong>${service.price}</strong></span>
          <span><small>Ideal para</small><strong>${service.ideal}</strong></span>
        </div>
        <a class="commercial-slide-action" data-track-event="service_carousel_click" data-analytics="${service.analytics}" href="${service.url}">${service.action} <span aria-hidden="true">→</span></a>
      </article>
    `).join('');

    const dots = PRIORITY_SERVICES.map((service, index) => `
      <button class="carousel-dot" type="button" data-carousel-dot="${index}" aria-label="Mostrar ${service.title}" aria-current="${index === 0 ? 'true' : 'false'}"></button>
    `).join('');

    panel.innerHTML = `
      <div class="commercial-carousel-head">
        <div class="commercial-carousel-brand">
          <img data-carousel-icon src="${PRIORITY_SERVICES[0].icon}" width="58" height="58" alt="">
          <span><small>SERVICIOS DESTACADOS</small><strong>Soluciones GEA</strong></span>
        </div>
        <button class="carousel-pause" type="button" data-carousel-pause aria-pressed="false">Pausar</button>
      </div>
      <div class="commercial-carousel-stage" data-carousel-stage aria-live="off">${slides}</div>
      <div class="commercial-carousel-footer">
        <div class="carousel-controls">
          <button class="carousel-arrow" type="button" data-carousel-previous aria-label="Servicio anterior">←</button>
          <div class="carousel-dots" aria-label="Elegir servicio">${dots}</div>
          <button class="carousel-arrow" type="button" data-carousel-next aria-label="Servicio siguiente">→</button>
        </div>
        <div class="carousel-progress" aria-hidden="true"><span></span></div>
      </div>
    `;

    const slideElements = [...panel.querySelectorAll('[data-commercial-slide]')];
    const dotElements = [...panel.querySelectorAll('[data-carousel-dot]')];
    const pauseButton = panel.querySelector('[data-carousel-pause]');
    const previousButton = panel.querySelector('[data-carousel-previous]');
    const nextButton = panel.querySelector('[data-carousel-next]');
    const stage = panel.querySelector('[data-carousel-stage]');
    const icon = panel.querySelector('[data-carousel-icon]');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    let currentIndex = 0;
    let timer = null;
    let userPaused = false;
    let interactionPaused = false;
    let touchStartX = null;

    const stopTimer = () => {
      if (timer) window.clearTimeout(timer);
      timer = null;
      panel.classList.remove('is-running');
    };

    const restartProgress = () => {
      panel.classList.remove('is-running');
      void panel.offsetWidth;
      if (!reduceMotion.matches && !userPaused && !interactionPaused && !document.hidden) {
        panel.classList.add('is-running');
      }
    };

    const scheduleNext = () => {
      stopTimer();
      if (reduceMotion.matches || userPaused || interactionPaused || document.hidden) return;
      restartProgress();
      timer = window.setTimeout(() => {
        showSlide(currentIndex + 1, false);
      }, CAROUSEL_INTERVAL);
    };

    const showSlide = (requestedIndex, manual) => {
      const nextIndex = (requestedIndex + slideElements.length) % slideElements.length;
      currentIndex = nextIndex;

      slideElements.forEach((slide, index) => {
        const active = index === nextIndex;
        slide.hidden = !active;
        slide.classList.toggle('is-entering', active && !reduceMotion.matches);
      });

      dotElements.forEach((dot, index) => {
        dot.setAttribute('aria-current', String(index === nextIndex));
      });

      const service = PRIORITY_SERVICES[nextIndex];
      panel.dataset.tone = service.tone;
      icon.src = service.icon;
      stage.setAttribute('aria-live', manual ? 'polite' : 'off');

      window.setTimeout(() => {
        slideElements[nextIndex]?.classList.remove('is-entering');
        stage.setAttribute('aria-live', 'off');
      }, 420);

      scheduleNext();
    };

    previousButton.addEventListener('click', () => showSlide(currentIndex - 1, true));
    nextButton.addEventListener('click', () => showSlide(currentIndex + 1, true));

    dotElements.forEach((dot, index) => {
      dot.addEventListener('click', () => showSlide(index, true));
    });

    pauseButton.addEventListener('click', () => {
      userPaused = !userPaused;
      pauseButton.setAttribute('aria-pressed', String(userPaused));
      pauseButton.textContent = userPaused ? 'Reanudar' : 'Pausar';
      if (userPaused) stopTimer();
      else scheduleNext();
    });

    panel.addEventListener('mouseenter', () => {
      interactionPaused = true;
      stopTimer();
    });

    panel.addEventListener('mouseleave', () => {
      interactionPaused = false;
      scheduleNext();
    });

    panel.addEventListener('focusin', () => {
      interactionPaused = true;
      stopTimer();
    });

    panel.addEventListener('focusout', () => {
      window.setTimeout(() => {
        interactionPaused = panel.contains(document.activeElement);
        if (!interactionPaused) scheduleNext();
      }, 0);
    });

    panel.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        showSlide(currentIndex - 1, true);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        showSlide(currentIndex + 1, true);
      }
    });

    panel.addEventListener('touchstart', (event) => {
      touchStartX = event.changedTouches[0]?.clientX ?? null;
    }, { passive: true });

    panel.addEventListener('touchend', (event) => {
      if (touchStartX === null) return;
      const endX = event.changedTouches[0]?.clientX ?? touchStartX;
      const distance = endX - touchStartX;
      touchStartX = null;
      if (Math.abs(distance) < 50) return;
      showSlide(currentIndex + (distance < 0 ? 1 : -1), true);
    }, { passive: true });

    document.addEventListener('visibilitychange', scheduleNext);
    reduceMotion.addEventListener?.('change', scheduleNext);
    scheduleNext();
  }

  function initializeMobileContactBar() {
    const bar = document.querySelector('.mobile-contact-bar');
    const footer = document.querySelector('.site-footer');
    if (!bar || !footer) return;

    let footerVisible = false;
    let formFocused = false;

    const updateState = () => {
      bar.classList.toggle('is-hidden', footerVisible || formFocused);
    };

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        footerVisible = entries.some((entry) => entry.isIntersecting);
        updateState();
      }, { threshold: 0.05 });
      observer.observe(footer);
    }

    document.addEventListener('focusin', (event) => {
      if (event.target instanceof HTMLElement && event.target.matches('input, select, textarea')) {
        formFocused = true;
        updateState();
      }
    });

    document.addEventListener('focusout', () => {
      window.setTimeout(() => {
        formFocused = Boolean(document.activeElement?.matches?.('input, select, textarea'));
        updateState();
      }, 120);
    });
  }

  initializeHomeWhatsappLinks();
  initializePlanFinder();
  initializeCommercialCarousel();
  initializeMobileContactBar();
})();
