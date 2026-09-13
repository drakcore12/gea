(() => {
  'use strict';

  const body = document.body;
  if (!body?.classList.contains('home-ux')) return;

  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
  const counters = Array.from(document.querySelectorAll('[data-counter-target]'));
  const serviceCards = Array.from(document.querySelectorAll('.home-service-card'));
  let countersStarted = false;

  const formatNumber = (value) => new Intl.NumberFormat('es-CO', {
    maximumFractionDigits: 0,
  }).format(value);

  function setCounter(counter, value) {
    const suffix = counter.dataset.counterSuffix || '';
    counter.textContent = `${formatNumber(value)}${suffix}`;
  }

  function animateCounter(counter, index) {
    const target = Number(counter.dataset.counterTarget || 0);
    if (!Number.isFinite(target)) return;

    if (reducedMotion) {
      setCounter(counter, target);
      return;
    }

    const delay = index * 110;
    const duration = 1150;
    const startAt = performance.now() + delay;

    const tick = (now) => {
      if (now < startAt) {
        requestAnimationFrame(tick);
        return;
      }

      const progress = Math.min(1, (now - startAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCounter(counter, Math.round(target * eased));

      if (progress < 1) requestAnimationFrame(tick);
    };

    setCounter(counter, 0);
    requestAnimationFrame(tick);
  }

  function startCounters() {
    if (countersStarted) return;
    countersStarted = true;
    counters.forEach(animateCounter);
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

  function initializePageMotion() {
    observeOnce(document.querySelector('.counter-strip'), startCounters, 0.55);
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

  waitForIntro();
})();
