(() => {
  'use strict';

  const overlay = document.querySelector('[data-gea-intro]');
  if (!overlay) return;

  const skipButton = overlay.querySelector('[data-gea-intro-skip]');
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const pageRegions = document.querySelectorAll('.site-header, main, .site-footer, .skip-link');
  const introDuration = 8000;
  const fadeDuration = 420;
  let isClosing = false;
  let introTimer = null;

  function setPageInteractive(isInteractive) {
    pageRegions.forEach((element) => {
      if ('inert' in element) element.inert = !isInteractive;
    });
  }

  function finishIntro({ immediate = false } = {}) {
    if (isClosing) return;
    isClosing = true;

    window.clearTimeout(introTimer);
    document.body.classList.remove('gea-intro-open');
    setPageInteractive(true);

    const removeOverlay = () => overlay.remove();

    if (immediate) {
      removeOverlay();
      return;
    }

    overlay.classList.add('is-leaving');
    window.setTimeout(removeOverlay, fadeDuration);
  }

  function buildIntro() {
    const legacyVideo = overlay.querySelector('video');
    legacyVideo?.remove();

    const stage = document.createElement('div');
    stage.className = 'gea-intro__stage';
    stage.setAttribute('aria-hidden', 'true');
    stage.innerHTML = `
      <div class="gea-intro__logo-scene">
        <div class="gea-intro__logo-wrap">
          <img
            class="gea-intro__logo"
            src="/assets/img/Soluciones_GEA_imagotipo_vertical_ultra_preciso.svg"
            alt=""
            width="360"
            height="360"
            decoding="sync"
          >
        </div>
      </div>

      <div class="gea-intro__message-scene">
        <div class="gea-intro__message-card">
          <p class="gea-intro__headline">
            Ingeniería integral
            <strong>para tu hogar y negocio</strong>
          </p>

          <div class="gea-intro__services">
            <div class="gea-intro__service-bars" aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p class="gea-intro__service-label">Gas · Electricidad · Agua</p>
          </div>
        </div>
      </div>
    `;

    overlay.insertBefore(stage, skipButton || null);
  }

  if (reducedMotion) {
    finishIntro({ immediate: true });
    return;
  }

  buildIntro();
  document.body.classList.add('gea-intro-open');
  setPageInteractive(false);

  skipButton?.addEventListener('click', () => finishIntro());

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') finishIntro();
  }, { once: true });

  introTimer = window.setTimeout(() => finishIntro(), introDuration);
})();
