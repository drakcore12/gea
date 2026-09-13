(() => {
  'use strict';

  const body = document.body;
  if (!body?.classList.contains('home-ux')) return;

  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
  const counters = Array.from(document.querySelectorAll('[data-counter-target]'));
  const serviceCards = Array.from(document.querySelectorAll('.home-service-card'));
  const contactForm = document.querySelector('.home-contact .contact-form');

  let countersStarted = false;

  const formatNumber = (value) => new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(value);

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

    let glitchFrame = 0;
    const glitch = window.setInterval(() => {
      const random = Math.round(target * (0.08 + Math.random() * 0.92));
      setCounter(counter, random);
      glitchFrame += 1;
      if (glitchFrame >= 3) {
        window.clearInterval(glitch);
        const start = performance.now() + index * 90;
        const duration = 1400;

        const tick = (now) => {
          if (now < start) {
            requestAnimationFrame(tick);
            return;
          }
          const raw = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - raw, 3);
          setCounter(counter, Math.round(target * eased));
          if (raw < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, 75);
  }

  function startCounters() {
    if (countersStarted) return;
    countersStarted = true;
    counters.forEach(animateCounter);
  }

  function activateServiceCards() {
    serviceCards.forEach((card, index) => {
      window.setTimeout(() => card.classList.add('is-energized'), reducedMotion ? 0 : index * 180);
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
    }, { threshold, rootMargin: '0px 0px -6% 0px' });
    observer.observe(element);
  }

  function initializePageMotion() {
    observeOnce(document.querySelector('.counter-strip'), startCounters, 0.6);
    observeOnce(document.querySelector('#servicios .service-hub-grid'), activateServiceCards, 0.3);
    observeOnce(contactForm, () => contactForm?.classList.add('is-signal-live'), 0.35);
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
