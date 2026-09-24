(() => {
  'use strict';

  const number = '573017605677';
  const messages = Object.freeze({
    fugas: 'Hola, Soluciones GEA. Necesito orientación para una fuga o problema de agua.',
    cocina: 'Hola, Soluciones GEA. Quiero cotizar mantenimiento técnico para una cocina comercial.',
    gasConforme: 'Hola, Soluciones GEA. Quiero solicitar revisión o adecuación de una red o punto de gas.',
    electricoComercial: 'Hola, Soluciones GEA. Necesito un electricista para diagnóstico, reparación o cotización.',
    aguaLimpia: 'Hola, Soluciones GEA. Quiero cotizar lavado y desinfección de un tanque de agua.',
    presionBombas: 'Hola, Soluciones GEA. Necesito diagnóstico para una bomba o un problema de presión de agua.',
  });

  const pillars = Object.freeze([
    {
      key: 'electricidad',
      href: '/servicios/electricista-medellin/',
      title: 'Electricista en Medellín',
      description: 'Fallas, breakers, tableros, tomas, iluminación y circuitos.',
      icon: '/assets/img/icono-electricidad.svg',
      photo: '/assets/img/seo/electricista-medellin.webp',
      photoAlt: 'Imagen ilustrativa de un técnico electricista revisando un medidor y tablero eléctrico en Medellín',
    },
    {
      key: 'agua',
      href: '/servicios/plomero-fugas-agua-medellin/',
      title: 'Plomero y fugas de agua',
      description: 'Fugas, humedad, tuberías, sanitarios, bombas y presión.',
      icon: '/assets/img/icono-agua.svg',
      photo: '/assets/img/seo/plomero-fugas-agua-medellin.webp',
      photoAlt: 'Imagen ilustrativa de un técnico revisando un medidor de agua y conexiones de plomería en Medellín',
    },
    {
      key: 'gas',
      href: '/servicios/gas-medellin/',
      title: 'Servicio de gas en Medellín',
      description: 'Redes internas, puntos, conexiones, fugas y adecuaciones.',
      icon: '/assets/img/icono-gas.svg',
      photo: '/assets/img/seo/gas-medellin.webp',
      photoAlt: 'Imagen ilustrativa de un técnico revisando un medidor y conexiones de gas en Medellín',
    },
  ]);

  function setWhatsappMessages() {
    document.querySelectorAll('[data-whatsapp]').forEach((link) => {
      const message = messages[link.dataset.whatsapp];
      if (!message) return;
      link.href = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    });
  }

  function ensureServiceMediaStyles() {
    if (document.querySelector('link[data-service-media]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/service-media.css?v=2';
    link.dataset.serviceMedia = 'true';
    document.head.appendChild(link);
  }

  function createServicePhoto(pillar, eager = false) {
    const image = document.createElement('img');
    image.className = 'service-photo';
    image.src = pillar.photo;
    image.width = 480;
    image.height = 360;
    image.alt = pillar.photoAlt;
    image.decoding = 'async';
    image.loading = eager ? 'eager' : 'lazy';
    if (eager) image.fetchPriority = 'high';
    image.dataset.servicePhoto = pillar.key;
    return image;
  }

  function enhancePillarPhoto() {
    const key = document.body.dataset.seoPillar;
    if (!key) return;
    const pillar = pillars.find((item) => item.key === key);
    const card = document.querySelector('.service-hero .service-meta-card');
    if (!pillar || !card || card.querySelector('[data-service-photo]')) return;

    const note = document.createElement('p');
    note.className = 'service-photo-note';
    note.textContent = 'Imagen ilustrativa. Será reemplazada progresivamente por fotografías de trabajos reales de Soluciones GEA.';
    card.prepend(note);
    card.prepend(createServicePhoto(pillar, true));
    const mark = card.querySelector('.service-mark');
    if (mark) mark.remove();
  }

  function enhanceServicesHubPhotos() {
    if (!document.body.classList.contains('services-hub-page')) return;
    pillars.forEach((pillar) => {
      const link = document.querySelector(`.service-hub-card > a[href="${pillar.href}"]`);
      const card = link?.closest('.service-hub-card');
      if (!card || card.querySelector('.service-photo')) return;
      const icon = card.querySelector('.service-hub-icon');
      const image = createServicePhoto(pillar);
      if (icon) icon.replaceWith(image);
      else card.prepend(image);
    });
  }

  function enhanceHomeServiceLinks() {
    if (location.pathname !== '/' && !location.pathname.endsWith('/index.html')) return;
    const navLink = document.querySelector('.main-nav a[href="#servicios"]');
    if (navLink) navLink.href = '/servicios/';
  }

  function connectLegacyServicePagesToPillars() {
    const body = document.body;
    if (!body.classList.contains('service-detail-page') || body.dataset.seoPillar) return;
    if (document.querySelector('[data-seo-pillar-links]')) return;
    const target = document.querySelector('.service-cta');
    if (!target) return;

    const current = location.pathname.replace(/index\.html$/, '');
    const section = document.createElement('section');
    section.className = 'service-section section-soft';
    section.dataset.seoPillarLinks = 'true';

    const links = pillars
      .filter((pillar) => pillar.href !== current)
      .map((pillar) => `
        <a class="related-card" href="${pillar.href}">
          <img src="${pillar.icon}" width="48" height="48" alt="">
          <span><strong>${pillar.title}</strong><small>${pillar.description}</small></span>
          <span aria-hidden="true">→</span>
        </a>`)
      .join('');

    section.innerHTML = `
      <div class="container">
        <div class="section-heading">
          <p class="eyebrow">SERVICIOS PRINCIPALES EN MEDELLÍN</p>
          <h2>Electricidad, plomería y gas</h2>
          <p>Consulte la página principal del área técnica que corresponde a su necesidad.</p>
        </div>
        <div class="related-grid">${links}</div>
      </div>`;
    target.insertAdjacentElement('beforebegin', section);
  }

  function removeRetiredCareLinks() {
    document.querySelectorAll('a[href*="gea-care"], a[href="#planes"]').forEach((link) => {
      const card = link.closest('.related-card, .service-hub-card');
      if (card) card.remove();
      else link.remove();
    });
  }

  function enhanceServiceJourney() {
    const main = document.querySelector('main');
    if (!main || !document.body.matches('.service-detail-page, .services-hub-page')) return;

    const sections = [
      ['.service-section:has(.feature-list), .service-section:has(.service-hub-grid)', 'Qué atendemos'],
      ['.service-section:has(.service-steps)', 'Cómo trabajamos'],
      ['.price-section', 'Valores'],
      ['.faq-section', 'Preguntas'],
    ].map(([selector, label]) => ({ section: main.querySelector(selector), label }))
      .filter(({ section }) => section);

    if (sections.length > 1) {
      const guide = document.createElement('nav');
      guide.className = 'service-guide container';
      guide.setAttribute('aria-label', 'Explorar esta página');
      sections.forEach(({ section, label }, index) => {
        if (!section.id) section.id = `seccion-gea-${index + 1}`;
        const link = document.createElement('a');
        link.href = `#${section.id}`;
        link.textContent = label;
        guide.append(link);
      });
      const hero = main.querySelector('.service-hero, .service-hub-hero');
      hero?.insertAdjacentElement('afterend', guide);

      if ('IntersectionObserver' in window) {
        const links = Array.from(guide.querySelectorAll('a'));
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            links.forEach((link) => {
              if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
              else link.removeAttribute('aria-current');
            });
          });
        }, { rootMargin: '-25% 0px -65% 0px' });
        sections.forEach(({ section }) => observer.observe(section));
      }
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    const targets = main.querySelectorAll('.service-meta-card, .feature-list li, .scope-card, .service-steps li, .price-card, .plan-card, .related-card, .service-hub-card');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-service-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -5% 0px', threshold: 0.08 });
    targets.forEach((target) => {
      if (target.getBoundingClientRect().top < window.innerHeight) return;
      target.classList.add('service-animate');
      observer.observe(target);
    });
  }

  function initialize() {
    ensureServiceMediaStyles();
    removeRetiredCareLinks();
    setWhatsappMessages();
    enhancePillarPhoto();
    enhanceServicesHubPhotos();
    enhanceHomeServiceLinks();
    connectLegacyServicePagesToPillars();
    enhanceServiceJourney();
    window.setTimeout(setWhatsappMessages, 100);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
