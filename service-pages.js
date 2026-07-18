(() => {
  'use strict';

  const number = '573017605677';
  const messages = Object.freeze({
    fugas: 'Hola, Soluciones GEA. Necesito orientación para una fuga de agua o gas.',
    cocina: 'Hola, Soluciones GEA. Quiero cotizar GEA Cocina Segura para una cocina comercial.',
    gasConforme: 'Hola, Soluciones GEA. Quiero solicitar una pre-revisión o adecuación de una red interna de gas.',
    electricoComercial: 'Hola, Soluciones GEA. Necesito diagnóstico o cotización para un servicio eléctrico.',
    aguaLimpia: 'Hola, Soluciones GEA. Quiero cotizar lavado y desinfección de un tanque de agua.',
    presionBombas: 'Hola, Soluciones GEA. Necesito diagnóstico para una bomba o un problema de presión de agua.',
    geaCare: 'Hola, Soluciones GEA. Quiero conocer el plan GEA Care adecuado para mi negocio.',
  });

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
      ['/servicios/redes-internas-de-gas-medellin/', 'Ver servicios de gas'],
      ['/servicios/servicios-electricos-comerciales-medellin/', 'Ver servicios eléctricos'],
      ['/servicios/fugas-de-agua-y-gas-medellin/', 'Ver servicios de agua y fugas'],
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
      link.textContent = 'Ver los 7 servicios oficiales';
      wrapper.appendChild(link);
      grid.insertAdjacentElement('afterend', wrapper);
    }
  }

  function initialize() {
    setWhatsappMessages();
    enhanceHomeServiceLinks();
    window.setTimeout(setWhatsappMessages, 100);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
