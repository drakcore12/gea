(() => {
  'use strict';

  const WHATSAPP_NUMBER = '573017605677';
  const CAROUSEL_INTERVAL = 7000;
  const CAROUSEL_ICON = './assets/img/isotipo.svg';

  const HOME_MESSAGES = Object.freeze({
    'technical-visit': 'Hola, Soluciones GEA. Quiero solicitar una visita técnica individual de $90.000 COP. Mi ubicación es: ____. La novedad que necesito revisar es: ____.',
    'gea-negocio': 'Hola, Soluciones GEA. Quiero información sobre la membresía GEA Negocio de $180.000 al mes. Mi establecimiento tiene aproximadamente ____ m² y es un/una: ____.',
    'gea-empresa': 'Hola, Soluciones GEA. Quiero información sobre la membresía GEA Empresa de $320.000 al mes. Mi establecimiento tiene aproximadamente ____ m² y es un/una: ____.',
    'gea-total': 'Hola, Soluciones GEA. Quiero información sobre la membresía GEA Total de $590.000 al mes. Mi establecimiento tiene aproximadamente ____ m² y es un/una: ____.',
    'emergency-water': 'Hola, Soluciones GEA. Necesito una visita técnica por una novedad de agua. Barrio o municipio: ____. Tipo de inmueble: ____. Lo que está ocurriendo: ____.',
    'emergency-electric': 'Hola, Soluciones GEA. Necesito una visita técnica por una novedad eléctrica. Barrio o municipio: ____. Tipo de inmueble: ____. Síntoma observado: ____.',
    'emergency-gas': 'Hola, Soluciones GEA. Necesito orientación por una posible novedad de gas. Barrio o municipio: ____. Tipo de inmueble: ____. Lo que estoy observando: ____.',
    'not-sure': 'Hola, Soluciones GEA. No sé cuál servicio o membresía necesito. Mi ubicación es: ____. Mi establecimiento es: ____. Lo que necesito revisar es: ____.',
  });

  const PLAN_DATA = Object.freeze({
    1: Object.freeze({
      name: 'GEA Negocio',
      price: '$180.000 al mes',
      key: 'gea-negocio',
      reason: 'Corresponde a establecimientos de hasta 200 m².',
    }),
    2: Object.freeze({
      name: 'GEA Empresa',
      price: '$320.000 al mes',
      key: 'gea-empresa',
      reason: 'Corresponde a establecimientos entre 201 y 500 m².',
    }),
    3: Object.freeze({
      name: 'GEA Total',
      price: '$590.000 al mes',
      key: 'gea-total',
      reason: 'Corresponde a establecimientos entre 501 y 1.000 m².',
    }),
    4: Object.freeze({
      name: 'Valoración personalizada',
      price: 'Confirmar alcance',
      key: 'not-sure',
      reason: 'Para áreas superiores a 1.000 m² o cuando no conoce el tamaño, confirmamos el alcance antes de recomendar una membresía.',
    }),
  });

  const PRIORITY_SERVICES = Object.freeze([
    Object.freeze({
      title: 'GEA Negocio',
      badge: 'Mejor entrada mensual',
      category: 'Membresía preventiva',
      description: 'Dos visitas técnicas mensuales, control de consumos, seguimiento y hasta dos correcciones menores para establecimientos de hasta 200 m².',
      price: '$180.000 al mes',
      ideal: 'Cafeterías, panaderías, barberías, oficinas y locales',
      action: 'Ver membresías',
      url: '#planes',
      icon: CAROUSEL_ICON,
      tone: 'care',
      analytics: 'hero-carousel-gea-negocio',
    }),
    Object.freeze({
      title: 'Visita técnica individual',
      badge: 'Diagnóstico puntual',
      category: 'Hasta 80 minutos',
      description: 'Revisión técnica, diagnóstico de la novedad, riesgos visibles, recomendaciones y evidencia básica. Reparaciones y materiales se cotizan aparte.',
      price: '$90.000 por visita',
      ideal: 'Negocios que necesitan revisar una novedad concreta',
      action: 'Solicitar visita',
      url: '#visita',
      icon: CAROUSEL_ICON,
      tone: 'water',
      analytics: 'hero-carousel-visita',
    }),
    Object.freeze({
      title: 'GEA Empresa',
      badge: 'Mayor cobertura',
      category: '201–500 m²',
      description: 'Dos visitas técnicas ampliadas, comparación de consumos, seguimiento y hasta cuatro correcciones menores.',
      price: '$320.000 al mes',
      ideal: 'Restaurantes medianos, gimnasios, hoteles y bodegas pequeñas',
      action: 'Ver GEA Empresa',
      url: '#planes',
      icon: CAROUSEL_ICON,
      tone: 'electric',
      analytics: 'hero-carousel-gea-empresa',
    }),
    Object.freeze({
      title: 'GEA Total',
      badge: 'Seguimiento intensivo',
      category: '501–1.000 m²',
      description: 'Cuatro visitas mensuales, historial técnico, control de consumos y hasta seis correcciones menores.',
      price: '$590.000 al mes',
      ideal: 'Hoteles, bodegas, restaurantes grandes y empresas',
      action: 'Ver GEA Total',
      url: '#planes',
      icon: CAROUSEL_ICON,
      tone: 'gas',
      analytics: 'hero-carousel-gea-total',
    }),
  ]);

  function whatsappUrl(message) {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  }

  function initializeHomeWhatsappLinks() {
    document.querySelectorAll('[data-home-whatsapp]').forEach((link) => {
      const message = HOME_MESSAGES[link.dataset.homeWhatsapp];
      if (message) link.href = whatsappUrl(message);
    });
  }

  function initializePlanFinder() {
    const form = document.querySelector('[data-plan-finder]');
    const submit = form?.querySelector('[data-plan-submit]');
    const result = form?.querySelector('[data-plan-result]');
    if (!form || !submit || !result) return;

    submit.addEventListener('click', () => {
      if (!form.reportValidity()) return;

      const selected = form.querySelector('input[name="area"]:checked');
      const level = Number(selected?.value || 4);
      const plan = PLAN_DATA[level] || PLAN_DATA[4];
      const message = `${HOME_MESSAGES[plan.key]}\n\nÁrea seleccionada en el orientador: ${selected?.nextElementSibling?.textContent || 'No especificada'}. Quiero confirmar el alcance.`;

      result.querySelector('[data-plan-name]').textContent = plan.name;
      result.querySelector('[data-plan-price]').textContent = plan.price;
      result.querySelector('[data-plan-reason]').textContent = plan.reason;
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
    panel.setAttribute('aria-label', 'Opciones comerciales de Soluciones GEA');

    const slides = PRIORITY_SERVICES.map((service, index) => `
      <article class="commercial-slide" data-commercial-slide data-tone="${service.tone}" aria-roledescription="diapositiva" aria-label="${index + 1} de ${PRIORITY_SERVICES.length}"${index === 0 ? '' : ' hidden'}>
        <div class="commercial-slide-topline">
          <span class="commercial-badge">${service.badge}</span>
          <span class="commercial-category">${service.category}</span>
        </div>
        <h2>${service.title}</h2>
        <p class="commercial-slide-description">${service.description}</p>
        <div class="commercial-slide-meta">
          <span><small>Precio</small><strong>${service.price}</strong></span>
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
          <span><small>TARIFAS OFICIALES</small><strong>Soluciones GEA</strong></span>
        </div>
        <button class="carousel-pause" type="button" data-carousel-pause aria-pressed="false">Pausar</button>
      </div>
      <div class="commercial-carousel-stage" data-carousel-stage aria-live="off">${slides}</div>
      <div class="commercial-carousel-footer">
        <div class="carousel-controls">
          <button class="carousel-arrow" type="button" data-carousel-previous aria-label="Opción anterior">←</button>
          <div class="carousel-dots" aria-label="Elegir opción">${dots}</div>
          <button class="carousel-arrow" type="button" data-carousel-next aria-label="Opción siguiente">→</button>
        </div>
        <div class="carousel-progress" aria-hidden="true"><span></span></div>
      </div>
    `;

    const slidesEls = [...panel.querySelectorAll('[data-commercial-slide]')];
    const dotsEls = [...panel.querySelectorAll('[data-carousel-dot]')];
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

    const scheduleNext = () => {
      stopTimer();
      if (reduceMotion.matches || userPaused || interactionPaused || document.hidden) return;
      panel.classList.remove('is-running');
      void panel.offsetWidth;
      panel.classList.add('is-running');
      timer = window.setTimeout(() => showSlide(currentIndex + 1, false), CAROUSEL_INTERVAL);
    };

    const showSlide = (requestedIndex, manual = true) => {
      currentIndex = (requestedIndex + slidesEls.length) % slidesEls.length;
      slidesEls.forEach((slide, index) => { slide.hidden = index !== currentIndex; });
      dotsEls.forEach((dot, index) => dot.setAttribute('aria-current', String(index === currentIndex)));
      const service = PRIORITY_SERVICES[currentIndex];
      panel.dataset.tone = service.tone;
      icon.src = service.icon;
      stage.setAttribute('aria-live', manual ? 'polite' : 'off');
      window.setTimeout(() => stage.setAttribute('aria-live', 'off'), 400);
      scheduleNext();
    };

    previousButton.addEventListener('click', () => showSlide(currentIndex - 1));
    nextButton.addEventListener('click', () => showSlide(currentIndex + 1));
    dotsEls.forEach((dot, index) => dot.addEventListener('click', () => showSlide(index)));

    pauseButton.addEventListener('click', () => {
      userPaused = !userPaused;
      pauseButton.setAttribute('aria-pressed', String(userPaused));
      pauseButton.textContent = userPaused ? 'Reanudar' : 'Pausar';
      if (userPaused) stopTimer(); else scheduleNext();
    });

    panel.addEventListener('mouseenter', () => { interactionPaused = true; stopTimer(); });
    panel.addEventListener('mouseleave', () => { interactionPaused = false; scheduleNext(); });
    panel.addEventListener('focusin', () => { interactionPaused = true; stopTimer(); });
    panel.addEventListener('focusout', () => {
      window.setTimeout(() => {
        interactionPaused = panel.contains(document.activeElement);
        if (!interactionPaused) scheduleNext();
      }, 0);
    });

    panel.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); showSlide(currentIndex - 1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); showSlide(currentIndex + 1); }
    });

    panel.addEventListener('touchstart', (event) => {
      touchStartX = event.changedTouches[0]?.clientX ?? null;
    }, { passive: true });

    panel.addEventListener('touchend', (event) => {
      if (touchStartX === null) return;
      const endX = event.changedTouches[0]?.clientX ?? touchStartX;
      const distance = endX - touchStartX;
      touchStartX = null;
      if (Math.abs(distance) >= 50) showSlide(currentIndex + (distance < 0 ? 1 : -1));
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

    const updateState = () => bar.classList.toggle('is-hidden', footerVisible || formFocused);

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
