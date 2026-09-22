(() => {
  'use strict';

  const overlay = document.querySelector('[data-gea-intro]');
  if (!overlay) return;

  const skipButton = overlay.querySelector('[data-gea-intro-skip]');
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const pageRegions = document.querySelectorAll('.site-header, main, .site-footer, .skip-link');
  const introDuration = 8000;
  const fadeDuration = 420;
  const introTheme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  const gateLogoAsset = introTheme === 'dark'
    ? '/assets/img/Soluciones_GEA_isotipo_blanco.svg'
    : '/assets/img/isotipo.svg';
  const animatedLogoAsset = introTheme === 'dark'
    ? '/assets/img/Soluciones_GEA_imagotipo_vertical_blanco.svg'
    : '/assets/img/Soluciones_GEA_imagotipo_vertical_ultra_preciso.svg';
  let isClosing = false;
  let hasStarted = false;
  let introTimer = null;
  let startButton = null;
  let gate = null;
  let soundButton = null;
  let soundtrack = null;
  let startedAt = 0;
  let soundRequest = 0;
  let soundEnabled = true;
  const previousFocus = document.activeElement;

  overlay.dataset.introTheme = introTheme;

  function ensureAmbientStyles() {
    if (document.querySelector('link[data-gea-intro-ambient-styles]')) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/intro-ambient.css';
    link.dataset.geaIntroAmbientStyles = 'true';
    document.head.appendChild(link);
  }

  function ambientMarkup() {
    if (introTheme === 'dark') {
      return `
        <div class="gea-intro__ambient gea-intro__ambient--night" aria-hidden="true">
          <span class="gea-intro__star"></span>
          <span class="gea-intro__star"></span>
          <span class="gea-intro__star"></span>
          <span class="gea-intro__star"></span>
          <span class="gea-intro__star"></span>
          <span class="gea-intro__star"></span>
          <span class="gea-intro__star"></span>
          <span class="gea-intro__star"></span>
          <span class="gea-intro__star"></span>
          <span class="gea-intro__star"></span>
          <span class="gea-intro__star"></span>
          <span class="gea-intro__star"></span>
          <span class="gea-intro__star"></span>
          <span class="gea-intro__star"></span>
        </div>
      `;
    }

    return `
      <div class="gea-intro__ambient gea-intro__ambient--day" aria-hidden="true">
        <span class="gea-intro__sun"></span>
        <span class="gea-intro__cloud gea-intro__cloud--one"></span>
        <span class="gea-intro__cloud gea-intro__cloud--two"></span>
        <span class="gea-intro__cloud gea-intro__cloud--three"></span>
      </div>
    `;
  }

  function updateSoundButton(enabled) {
    if (!soundButton) return;
    soundButton.setAttribute('aria-pressed', String(enabled));
    soundButton.setAttribute('aria-label', enabled ? 'Silenciar presentación' : 'Activar sonido de la presentación');
    soundButton.title = enabled ? 'Silenciar' : 'Activar sonido';
    const accessibleText = soundButton.querySelector('.sr-only');
    if (accessibleText) accessibleText.textContent = enabled ? 'Silenciar presentación' : 'Activar sonido de la presentación';
  }

  async function playSoundtrack() {
    if (isClosing || !hasStarted || !soundEnabled || !soundtrack) return false;

    const request = ++soundRequest;
    soundtrack.currentTime = Math.min(Math.max((performance.now() - startedAt) / 1000, 0), 7.99);

    try {
      await soundtrack.play();
      if (isClosing || request !== soundRequest || !soundEnabled) {
        soundtrack.pause();
        return false;
      }
      updateSoundButton(true);
      return true;
    } catch {
      if (!isClosing && soundEnabled) updateSoundButton(true);
      return false;
    }
  }

  async function toggleSound() {
    soundEnabled = !soundEnabled;
    soundRequest += 1;

    if (!soundEnabled) {
      soundtrack?.pause();
      updateSoundButton(false);
      return;
    }

    updateSoundButton(true);
    await playSoundtrack();
  }

  function onKeyDown(event) {
    if (event.key === 'Escape') finishIntro();
  }

  function onVisibilityChange() {
    if (document.hidden && hasStarted) finishIntro({ immediate: true });
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

    const shouldRestorePreviousFocus =
      overlay.contains(document.activeElement) &&
      previousFocus instanceof HTMLElement &&
      previousFocus !== document.body &&
      previousFocus !== document.documentElement &&
      document.contains(previousFocus);

    const removeOverlay = () => {
      overlay.remove();
      if (shouldRestorePreviousFocus) {
        previousFocus.focus({ preventScroll: true });
      }
    };

    if (immediate) {
      removeOverlay();
      return;
    }

    overlay.classList.add('is-leaving');
    window.setTimeout(removeOverlay, fadeDuration);
  }

  function ensureSoundtrack() {
    if (soundtrack) return soundtrack;
    soundtrack = new Audio('/assets/audio/gea-intro.m4a');
    soundtrack.preload = 'auto';
    soundtrack.volume = 0.75;
    soundtrack.addEventListener('ended', () => {
      soundEnabled = false;
      updateSoundButton(false);
    });
    return soundtrack;
  }

  function startIntro() {
    if (hasStarted || isClosing) return;
    hasStarted = true;
    startedAt = performance.now();

    // Heavy presentation DOM, ambient effects and audio are prepared only
    // after the visitor explicitly chooses to watch the presentation.
    preparePresentation();
    ensureSoundtrack();
    void playSoundtrack();

    overlay.classList.add('is-playing');
    gate?.classList.add('is-leaving');
    window.setTimeout(() => gate?.remove(), 360);

    introTimer = window.setTimeout(() => finishIntro(), introDuration);
    window.setTimeout(() => soundButton?.focus({ preventScroll: true }), 380);
  }

  function preparePresentation() {
    ensureAmbientStyles();

    const stage = document.createElement('div');
    stage.className = 'gea-intro__stage';
    stage.setAttribute('aria-hidden', 'true');
    stage.innerHTML = `
      ${ambientMarkup()}
      <div class="gea-intro__waves"><i></i><i></i><i></i></div>
      <div class="gea-intro__logo-scene">
        <div class="gea-intro__logo-wrap">
          <img
            class="gea-intro__logo"
            src="${animatedLogoAsset}"
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

    soundButton = document.createElement('button');
    soundButton.type = 'button';
    soundButton.className = 'gea-intro__sound';
    soundButton.innerHTML = `
      <svg class="gea-intro__sound-on" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M11 5 6 9H3v6h3l5 4V5Z"></path>
        <path d="M15 8a6 6 0 0 1 0 8"></path>
        <path d="M18 5a10 10 0 0 1 0 14"></path>
      </svg>
      <svg class="gea-intro__sound-off" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M11 5 6 9H3v6h3l5 4V5Z"></path>
        <path d="m16 9 5 5"></path>
        <path d="m21 9-5 5"></path>
      </svg>
      <span class="sr-only">Silenciar presentación</span>
    `;
    updateSoundButton(true);

    const controls = document.createElement('div');
    controls.className = 'gea-intro__controls';
    controls.setAttribute('aria-label', 'Controles de presentación');
    controls.append(soundButton);
    if (skipButton) controls.append(skipButton);

    overlay.prepend(stage);
    overlay.prepend(gate);
    overlay.append(controls);

    soundButton.addEventListener('click', toggleSound);
    skipButton?.addEventListener('click', () => finishIntro());

  }

  if (reducedMotion) {
    finishIntro({ immediate: true });
    return;
  }

  const legacyVideo = overlay.querySelector('video');
  legacyVideo?.remove();

  gate = overlay.querySelector('[data-gea-intro-gate]');
  if (!gate) {
    finishIntro({ immediate: true });
    return;
  }

  const gateLogo = gate.querySelector('[data-gea-intro-gate-logo]');
  if (gateLogo && gateLogo.getAttribute('src') !== gateLogoAsset) {
    gateLogo.setAttribute('src', gateLogoAsset);
  }

  startButton = gate.querySelector('[data-gea-intro-start]');
  startButton?.addEventListener('click', startIntro);
  gate.querySelector('[data-gea-intro-enter]')?.addEventListener('click', () => finishIntro({ immediate: true }));

  document.body.classList.add('gea-intro-open');
  setPageInteractive(false);

  startButton?.focus({ preventScroll: true });

  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('visibilitychange', onVisibilityChange);
})();
