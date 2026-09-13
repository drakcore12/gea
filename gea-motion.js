(() => {
  'use strict';

  const body = document.body;
  const root = document.documentElement;
  if (!body?.classList.contains('home-ux')) return;

  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
  const hero = document.querySelector('.service-hub-hero > .container');
  let observer = null;

  if (hero) hero.dataset.geaMotion = 'hero-power';

  function revealHero() {
    if (!hero || hero.classList.contains('is-gea-visible')) return;
    hero.classList.add('is-gea-visible');
    observer?.disconnect();
  }

  function start() {
    root.classList.add('gea-motion-enabled');

    if (!hero) return;
    if (reducedMotion || !('IntersectionObserver' in window)) {
      revealHero();
      return;
    }

    observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) revealHero();
    }, {
      rootMargin: '0px 0px -5% 0px',
      threshold: 0.12,
    });

    observer.observe(hero);
  }

  if (!body.classList.contains('gea-intro-open')) {
    start();
    return;
  }

  const introObserver = new MutationObserver(() => {
    if (body.classList.contains('gea-intro-open')) return;
    introObserver.disconnect();
    requestAnimationFrame(start);
  });

  introObserver.observe(body, { attributes: true, attributeFilter: ['class'] });
})();
