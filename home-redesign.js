(() => {
  'use strict';

  const body = document.body;
  if (!body?.classList.contains('home-ux')) return;

  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
  const gauges = Array.from(document.querySelectorAll('[data-gauge-angle]'));
  const counters = Array.from(document.querySelectorAll('[data-counter-target]'));
  const serviceCards = Array.from(document.querySelectorAll('.home-service-card'));
  const contactForm = document.querySelector('.home-contact .contact-form');

  const gaugeMeta = Object.freeze({
    electric: Object.freeze({ icon: '/assets/img/icono-electricidad.svg', institution: 'RETIE' }),
    water: Object.freeze({ icon: '/assets/img/icono-agua.svg', institution: 'EPM' }),
    gas: Object.freeze({ icon: '/assets/img/icono-gas.svg', institution: 'VANTI' }),
  });

  let gaugesStarted = false;
  let countersStarted = false;

  const formatNumber = (value) => new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(value);

  function gaugeType(gauge) {
    if (gauge.classList.contains('gea-gauge--water')) return 'water';
    if (gauge.classList.contains('gea-gauge--gas')) return 'gas';
    return 'electric';
  }

  function enhanceGaugeCards() {
    gauges.forEach((gauge) => {
      if (gauge.dataset.gaugeLayout === 'horizontal') return;

      const type = gaugeType(gauge);
      const meta = gaugeMeta[type];
      const caption = gauge.querySelector('.gauge-caption');

      const mark = document.createElement('div');
      mark.className = 'gauge-service-mark';
      mark.setAttribute('aria-hidden', 'true');

      const icon = document.createElement('img');
      icon.src = meta.icon;
      icon.alt = '';
      icon.width = 31;
      icon.height = 31;
      mark.appendChild(icon);

      if (caption && !caption.querySelector('.gauge-institution')) {
        const institution = document.createElement('span');
        institution.className = `gauge-institution gauge-institution--${type}`;
        institution.textContent = meta.institution;
        caption.prepend(institution);
      }

      gauge.prepend(mark);
      gauge.dataset.gaugeLayout = 'horizontal';
    });
  }

  function setGaugeFinal(needle, angle) {
    needle.style.transform = `translateX(-50%) rotate(${angle}deg)`;
  }

  function animateGauge(gauge, index) {
    const needle = gauge.querySelector('.gauge-needle');
    if (!needle) return;
    const angle = Number(gauge.dataset.gaugeAngle || 0);

    if (reducedMotion || typeof needle.animate !== 'function') {
      setGaugeFinal(needle, angle);
      return;
    }

    const animation = needle.animate(
      [
        { transform: 'translateX(-50%) rotate(-92deg)' },
        { transform: `translateX(-50%) rotate(${angle + (angle >= 0 ? 4 : -4)}deg)`, offset: 0.82 },
        { transform: `translateX(-50%) rotate(${angle}deg)` },
      ],
      {
        duration: 1600,
        delay: 150 + index * 250,
        easing: 'cubic-bezier(.2,1.4,.4,1)',
        fill: 'forwards',
      },
    );

    animation.addEventListener('finish', () => setGaugeFinal(needle, angle), { once: true });

    if (window.matchMedia?.('(hover:hover) and (pointer:fine)').matches) {
      gauge.addEventListener('pointermove', (event) => {
        const rect = gauge.getBoundingClientRect();
        const ratio = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - 0.5) * 2));
        const hoverAngle = angle + ratio * 5;
        needle.animate(
          [{ transform: needle.style.transform || `translateX(-50%) rotate(${angle}deg)` }, { transform: `translateX(-50%) rotate(${hoverAngle}deg)` }],
          { duration: 180, easing: 'ease-out', fill: 'forwards' },
        );
      });

      gauge.addEventListener('pointerleave', () => {
        needle.animate(
          [{ transform: getComputedStyle(needle).transform }, { transform: `translateX(-50%) rotate(${angle}deg)` }],
          { duration: 420, easing: 'cubic-bezier(.2,1.2,.35,1)', fill: 'forwards' },
        );
      });
    }
  }

  function startGauges() {
    if (gaugesStarted) return;
    gaugesStarted = true;
    gauges.forEach(animateGauge);
  }

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
    startGauges();
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

  enhanceGaugeCards();
  waitForIntro();
})();
