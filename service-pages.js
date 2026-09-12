(() => {
  'use strict';

  const number = '573017605677';
  const messages = Object.freeze({
    fugas: 'Hola, Soluciones GEA. Necesito orientación para una fuga o problema de agua.',
    cocina: 'Hola, Soluciones GEA. Quiero cotizar GEA Cocina Segura para una cocina comercial.',
    gasConforme: 'Hola, Soluciones GEA. Quiero solicitar revisión o adecuación de una red o punto de gas.',
    electricoComercial: 'Hola, Soluciones GEA. Necesito un electricista para diagnóstico, reparación o cotización.',
    aguaLimpia: 'Hola, Soluciones GEA. Quiero cotizar lavado y desinfección de un tanque de agua.',
    presionBombas: 'Hola, Soluciones GEA. Necesito diagnóstico para una bomba o un problema de presión de agua.',
    geaCare: 'Hola, Soluciones GEA. Quiero conocer la membresía GEA adecuada para mi negocio. Mi establecimiento tiene aproximadamente ____ m².',
  });

  const pillars = Object.freeze([
    {
      href: '/servicios/electricista-medellin/',
      title: 'Electricista en Medellín',
      description: 'Fallas, breakers, tableros, tomas, iluminación y circuitos.',
      icon: '/assets/img/icono-electricidad.svg',
    },
    {
      href: '/servicios/plomero-fugas-agua-medellin/',
      title: 'Plomero y fugas de agua',
      description: 'Fugas, humedad, tuberías, sanitarios, bombas y presión.',
      icon: '/assets/img/icono-agua.svg',
    },
    {
      href: '/servicios/gas-medellin/',
      title: 'Servicio de gas en Medellín',
      description: 'Redes internas, puntos, conexiones, fugas y adecuaciones.',
      icon: '/assets/img/icono-gas.svg',
    },
  ]);

  function setWhatsappMessages() {
    document.querySelectorAll('[data-whatsapp]').forEach((link) => {
      const message = messages[link.dataset.whatsapp];
      if (!message) return;
      link.href = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    });
  }

  function enhanceHomeServiceLinks() {
    if (location.pathname !== '/' && !location.pathname.endsWith('/index.html')) return;

    const navLink = document.querySelector('.main-nav a[href="#servicios"]');
    if (navLink) navLink.href = '/servicios/';

    const cards = document.querySelectorAll('#servicios .service-card');
    const destinations = [
      [pillars[2].href, 'Ver servicio de gas'],
      [pillars[0].href, 'Ver electricista en Medellín'],
      [pillars[1].href, 'Ver plomería y fugas de agua'],
    ];

    cards.forEach((card, index) => {
      const link = card.querySelector(':scope > a');
      const destination = destinations[index];
      if (!link || !destination) return;
      link.removeAttribute('data-whatsapp');
      link.removeAttribute('target');
      link.removeAttribute('rel');
      link.href = destination[0];
      link.innerHTML = `${destination[1]} <span aria-hidden="true">→</span>`;
    });

    const grid = document.querySelector('#servicios .service-grid');
    if (grid && !document.querySelector('[data-services-directory]')) {
      const wrapper = document.createElement('p');
      wrapper.className = 'services-directory-action';
      const link = document.createElement('a');
      link.className = 'button button-primary';
      link.href = '/servicios/';
      link.dataset.servicesDirectory = 'true';
      link.textContent = 'Ver todos los servicios';
      wrapper.appendChild(link);
      grid.insertAdjacentElement('afterend', wrapper);
    }
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

  function initialize() {
    setWhatsappMessages();
    enhanceHomeServiceLinks();
    connectLegacyServicePagesToPillars();
    window.setTimeout(setWhatsappMessages, 100);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
