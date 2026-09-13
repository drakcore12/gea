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
  let soundButton = null;
  let soundtrack = null;
  let startedAt = 0;
  let soundRequest = 0;
  const previousFocus = document.activeElement;

  function updateSoundButton(enabled) {
    soundButton.setAttribute('aria-pressed', String(enabled));
    soundButton.setAttribute('aria-label', enabled ? 'Silenciar presentación' : 'Activar sonido de la presentación');
    soundButton.title = enabled ? 'Silenciar' : 'Activar sonido';
    soundButton.querySelector('span').textContent = enabled ? 'Silenciar' : 'Activar sonido';
  }

  async function toggleSound() {
    const request = ++soundRequest;
    if (!soundtrack.paused) {
      soundtrack.pause();
      updateSoundButton(false);
      return;
    }
    // Seek to the visual timeline even when sound is enabled halfway through.
    soundtrack.currentTime = Math.min((performance.now() - startedAt) / 1000, 7.99);
    try {
      await soundtrack.play();
      if (isClosing || request !== soundRequest) { soundtrack.pause(); return; }
      updateSoundButton(true);
    } catch {
      if (!isClosing) updateSoundButton(false);
    }
  }

  function onKeyDown(event) {
    if (event.key === 'Escape') finishIntro();
  }

  function onVisibilityChange() {
    if (document.hidden) finishIntro({ immediate: true });
  }

  function setPageInteractive(isInteractive) {
    pageRegions.forEach((element) => {
      if ('inert' in element) element.inert = !isInteractive;
    });
  }

  function finishIntro({ immediate = false } = {}) {
    if (isClosing) return;
    isClosing = true;

    window.clearTimeout(introTimer);
    soundRequest += 1;
    soundtrack?.pause();
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    document.body.classList.remove('gea-intro-open');
    setPageInteractive(true);

    const hadFocus = overlay.contains(document.activeElement);
    const removeOverlay = () => {
      overlay.remove();
      if (hadFocus) {
        const target = previousFocus instanceof HTMLElement && previousFocus !== document.body
          ? previousFocus : document.querySelector('.brand');
        target?.focus({ preventScroll: true });
      }
    };

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

    if (skipButton) {
      skipButton.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M5 5l9 7-9 7V5Z"></path>
          <path d="M18 5v14"></path>
        </svg>
      `;
      skipButton.setAttribute('title', 'Saltar presentación');
    }

    const stage = document.createElement('div');
    stage.className = 'gea-intro__stage';
    stage.setAttribute('aria-hidden', 'true');
    stage.innerHTML = `
      <div class="gea-intro__waves"><i></i><i></i><i></i></div>
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
    soundtrack = new Audio('/assets/audio/gea-intro.m4a');
    soundtrack.preload = 'auto';
    soundtrack.volume = 0.75;
    soundButton = document.createElement('button');
    soundButton.type = 'button';
    soundButton.className = 'gea-intro__sound';
    soundButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z M15 8a6 6 0 0 1 0 8 M18 5a10 10 0 0 1 0 14"/></svg><span>Activar sonido</span>';
    updateSoundButton(false);
    soundButton.addEventListener('click', toggleSound);
    soundtrack.addEventListener('ended', () => updateSoundButton(false));
    overlay.append(soundButton);
  }

  if (reducedMotion) {
    finishIntro({ immediate: true });
    return;
  }

  buildIntro();
  document.body.classList.add('gea-intro-open');
  setPageInteractive(false);

  startedAt = performance.now();
  skipButton?.focus({ preventScroll: true });
  skipButton?.addEventListener('click', () => finishIntro());

  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('visibilitychange', onVisibilityChange);

  introTimer = window.setTimeout(() => finishIntro(), introDuration);
})();
