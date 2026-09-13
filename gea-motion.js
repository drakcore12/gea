(() => {
  'use strict';

  const body = document.body;
  const root = document.documentElement;
  if (!body?.classList.contains('home-ux')) return;

  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
  const revealTargets = [];
  const reactiveSections = [];
  let revealObserver = null;
  let rafId = 0;
  let started = false;

  function setDelay(elements, step = 90, start = 0) {
    elements.forEach((element, index) => {
      element.style.setProperty('--gea-delay', `${start + index * step}ms`);
    });
  }

  function addReveal(element, type = 'section') {
    if (!element) return;
    element.dataset.geaReveal = type;
    revealTargets.push(element);
  }

  function buildMotionMap() {
    const hero = document.querySelector('.service-hub-hero > .container');
    if (hero) {
      hero.dataset.geaMotion = 'hero';
      addReveal(hero, 'hero');
    }

    const gauge = document.querySelector('.gauge-section');
    addReveal(gauge, 'section');
    if (gauge) reactiveSections.push(gauge);

    const institutions = Array.from(document.querySelectorAll('.institution-card'));
    institutions.forEach((item) => addReveal(item, 'item'));
    setDelay(institutions, 110, 70);

    const price = document.querySelector('.price-section');
    addReveal(price, 'section');
    if (price) reactiveSections.push(price);
    setDelay(Array.from(document.querySelectorAll('.price-tag')), 90, 170);

    const services = document.querySelector('.services-section');
    addReveal(services, 'section');
    if (services) reactiveSections.push(services);

    Array.from(document.querySelectorAll('.home-service-card')).forEach((item) => {
      addReveal(item, 'item');
      reactiveSections.push(item);
    });

    const credentials = document.querySelector('.credentials-section');
    addReveal(credentials, 'section');
    if (credentials) reactiveSections.push(credentials);

    const credentialItems = Array.from(document.querySelectorAll('.credential-item'));
    credentialItems.forEach((item) => addReveal(item, 'item'));
    setDelay(credentialItems, 95, 80);

    const origin = document.querySelector('.origin-story');
    addReveal(origin, 'section');
    if (origin) reactiveSections.push(origin);

    const contact = document.querySelector('.home-contact');
    addReveal(contact, 'section');
    if (contact) reactiveSections.push(contact);

    const contactPieces = [
      document.querySelector('.home-contact .section-heading'),
      ...document.querySelectorAll('.home-contact .schedule-card'),
      ...document.querySelectorAll('.home-contact .contact-form > label'),
      document.querySelector('.home-contact .contact-form > button'),
      document.querySelector('.home-contact .contact-form > .form-note'),
    ].filter(Boolean);
    setDelay(contactPieces, 70, 50);

    const footer = document.querySelector('.site-footer');
    addReveal(footer, 'section');
  }

  function reveal(element) {
    if (!element || element.classList.contains('is-gea-visible')) return;
    element.classList.add('is-gea-visible');
  }

  function createRevealObserver() {
    if (reducedMotion || !('IntersectionObserver' in window)) {
      revealTargets.forEach(reveal);
      reactiveSections.forEach((section) => section.classList.add('is-gea-active'));
      return;
    }

    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          reveal(entry.target);
          entry.target.classList.add('is-gea-active');
        } else {
          entry.target.classList.remove('is-gea-active');
        }
      });
    }, {
      rootMargin: '0px 0px -8% 0px',
      threshold: [0, .08, .18, .35, .65],
    });

    revealTargets.forEach((target) => revealObserver.observe(target));
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function updateReactiveMotion() {
    rafId = 0;
    if (reducedMotion) return;

    const viewportHeight = window.innerHeight || 1;
    const doc = document.documentElement;
    const maxScroll = Math.max(1, doc.scrollHeight - viewportHeight);
    root.style.setProperty('--gea-page-progress', String(clamp(window.scrollY / maxScroll, 0, 1)));

    reactiveSections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const visible = rect.bottom > -80 && rect.top < viewportHeight + 80;
      if (!visible) return;

      const local = clamp((viewportHeight - rect.top) / (viewportHeight + rect.height), 0, 1);
      const drift = (0.5 - local) * 10;
      section.style.setProperty('--gea-local', local.toFixed(4));
      section.style.setProperty('--gea-drift', `${drift.toFixed(2)}px`);

      if (section.classList.contains('home-service-card')) {
        section.style.setProperty('--gea-drift', `${(drift * .35).toFixed(2)}px`);
      }
    });
  }

  function requestReactiveUpdate() {
    if (rafId || reducedMotion) return;
    rafId = window.requestAnimationFrame(updateReactiveMotion);
  }

  function bindReactiveScroll() {
    if (reducedMotion) return;
    window.addEventListener('scroll', requestReactiveUpdate, { passive: true });
    window.addEventListener('resize', requestReactiveUpdate, { passive: true });
    requestReactiveUpdate();
  }

  function start() {
    if (started) return;
    started = true;
    root.classList.add('gea-motion-enabled');
    buildMotionMap();
    createRevealObserver();
    bindReactiveScroll();
  }

  if (!body.classList.contains('gea-intro-open')) {
    start();
    return;
  }

  const introObserver = new MutationObserver(() => {
    if (body.classList.contains('gea-intro-open')) return;
    introObserver.disconnect();
    window.requestAnimationFrame(start);
  });

  introObserver.observe(body, { attributes: true, attributeFilter: ['class'] });
})();
