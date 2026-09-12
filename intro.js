(() => {
  'use strict';

  const overlay = document.querySelector('[data-gea-intro]');
  if (!overlay) return;

  const video = overlay.querySelector('video');
  const skipButton = overlay.querySelector('[data-gea-intro-skip]');
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const pageRegions = document.querySelectorAll('.site-header, main, .site-footer, .skip-link');
  const videoParts = Array.from({ length: 8 }, (_, index) =>
    `/assets/video/gea-intro.mp4.part${String(index + 1).padStart(2, '0')}`,
  );
  const fallbackDuration = 12000;
  const fadeDuration = 420;
  let isClosing = false;
  let fallbackTimer = null;
  let objectUrl = null;

  function setPageInteractive(isInteractive) {
    pageRegions.forEach((element) => {
      if ('inert' in element) element.inert = !isInteractive;
    });
  }

  function releaseVideoUrl() {
    if (!objectUrl) return;
    URL.revokeObjectURL(objectUrl);
    objectUrl = null;
  }

  function finishIntro({ immediate = false } = {}) {
    if (isClosing) return;
    isClosing = true;

    window.clearTimeout(fallbackTimer);
    video?.pause();
    document.body.classList.remove('gea-intro-open');
    setPageInteractive(true);

    const removeOverlay = () => {
      releaseVideoUrl();
      overlay.remove();
    };

    if (immediate) {
      removeOverlay();
      return;
    }

    overlay.classList.add('is-leaving');
    window.setTimeout(removeOverlay, fadeDuration);
  }

  async function loadAndPlayIntro() {
    if (!video || isClosing) return;

    try {
      const responses = await Promise.all(
        videoParts.map((url) => fetch(url, { cache: 'force-cache' })),
      );

      if (responses.some((response) => !response.ok)) {
        throw new Error('No se pudo cargar la presentación');
      }

      const buffers = await Promise.all(responses.map((response) => response.arrayBuffer()));
      if (isClosing) return;

      objectUrl = URL.createObjectURL(new Blob(buffers, { type: 'video/mp4' }));
      video.src = objectUrl;
      video.muted = true;
      video.playsInline = true;
      video.addEventListener('ended', () => finishIntro(), { once: true });
      video.addEventListener('error', () => finishIntro({ immediate: true }), { once: true });

      await video.play();
    } catch (_) {
      finishIntro({ immediate: true });
    }
  }

  if (reducedMotion) {
    finishIntro({ immediate: true });
    return;
  }

  document.body.classList.add('gea-intro-open');
  setPageInteractive(false);

  skipButton?.addEventListener('click', () => finishIntro());

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') finishIntro();
  }, { once: true });

  fallbackTimer = window.setTimeout(() => finishIntro(), fallbackDuration);
  loadAndPlayIntro();
})();
