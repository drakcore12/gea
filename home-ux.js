(() => {
  'use strict';

  const WHATSAPP_NUMBER = '573017605677';

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
  initializeMobileContactBar();
})();
