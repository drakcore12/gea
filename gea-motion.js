(() => {
  'use strict';

  const body = document.body;
  const root = document.documentElement;
  if (!body?.classList.contains('home-ux')) return;

  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
  const observed = [];
  let motionObserver = null;
  let introObserver = null;
  let started = false;

  function tag(selector, motionName) {
    const element = document.querySelector(selector);
    if (!element) return null;
    element.dataset.geaMotion = motionName;
    observed.push(element);
    return element;
  }

  function buildDecorativeElements() {
    const header = document.querySelector('.site-header');
    if (header && !header.querySelector('.gea-header-trace')) {
      const trace = document.createElement('span');
      trace.className = 'gea-header-trace';
      trace.setAttribute('aria-hidden', 'true');
      header.appendChild(trace);
    }

    if (!document.querySelector('.gea-scroll-spine')) {
      const spine = document.createElement('span');
      spine.className = 'gea-scroll-spine';
      spine.setAttribute('aria-hidden', 'true');
      body.appendChild(spine);
    }
  }

  function classifyHomepage() {
    tag('.service-hub-hero > .container', 'hero-power');
    tag('#servicios .section-heading', 'services-heading');
    tag('#servicios .service-hub-grid', 'services-grid');

    const diagnostic = document.querySelector('.service-section.section-soft .content-grid');
    if (diagnostic) {
      diagnostic.dataset.geaMotion = 'diagnostic-scan';
      observed.push(diagnostic);
    }

    tag('#cobertura .content-grid', 'coverage-route');
    tag('#contacto > .container', 'contact-signal');
    tag('.service-cta .service-cta-grid', 'cta-charge');
    tag('.site-footer .footer-grid', 'footer-settle');
  }

  function reveal(element) {
    if (!element || element.classList.contains('is-gea-visible')) return;
    element.classList.add('is-gea-visible');
    motionObserver?.unobserve(element);
  }

  function startObserving() {
    if (started) return;
    started = true;
    root.classList.add('gea-motion-enabled');

    if (reducedMotion || !('IntersectionObserver' in window)) {
      observed.forEach(reveal);
      return;
    }

    motionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
      });
    }, {
      rootMargin: '0px 0px -7% 0px',
      threshold: 0.16,
    });

    observed.forEach((element) => motionObserver.observe(element));
  }

  function introIsOpen() {
    return body.classList.contains('gea-intro-open');
  }

  function waitForIntroThenStart() {
    if (!introIsOpen()) {
      startObserving();
      return;
    }

    introObserver = new MutationObserver(() => {
      if (introIsOpen()) return;
      introObserver.disconnect();
      introObserver = null;
      window.requestAnimationFrame(startObserving);
    });

    introObserver.observe(body, { attributes: true, attributeFilter: ['class'] });
  }

  buildDecorativeElements();
  classifyHomepage();
  waitForIntroThenStart();
})();
