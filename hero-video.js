(() => {
  'use strict';

  const media = document.querySelector('[data-hero-video-media]');
  if (!media) return;

  const hero = media.closest('.service-hub-hero');
  const videos = Array.from(media.querySelectorAll('[data-hero-video]'));
  if (videos.length < 2) return;

  const playlist = [1, 2, 3];
  const clipDuration = 10;
  const fadeDuration = 700;
  const assetVersion = '20260913b';
  const posterUrl = `/assets/video/hero-poster.webp?v=${assetVersion}`;
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
  const mobileQuery = window.matchMedia?.('(max-width: 760px)');
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const saveData = connection?.saveData === true;
  const slowConnection = ['slow-2g', '2g', '3g'].includes(connection?.effectiveType);
  const staticMode = reducedMotion || saveData;

  let activeSlotIndex = 0;
  let activeClipIndex = 0;
  let isSwitching = false;
  let hasStarted = false;
  let heroVisible = true;
  let preloadTimer = 0;
  let introObserver = null;

  function use720p() {
    return mobileQuery?.matches === true || slowConnection;
  }

  function clipUrl(clipIndex) {
    const clipNumber = playlist[clipIndex];
    const resolution = use720p() ? '720' : '1080';
    return `/assets/video/hero-${clipNumber}-${resolution}.mp4?v=${assetVersion}`;
  }

  function removeLegacySources(video) {
    video.pause();
    video.querySelectorAll('source').forEach((source) => source.remove());
    video.removeAttribute('src');
    video.removeAttribute('data-clip-index');
    video.preload = 'none';
    video.poster = posterUrl;
    try {
      video.load();
    } catch (_) {
      // Some browsers can throw while a previous resource is being aborted.
    }
  }

  function resetVideo(video) {
    try {
      video.currentTime = 0;
    } catch (_) {
      // Metadata may not be ready yet.
    }
  }

  function prepareClip(slotIndex, clipIndex, preload = 'auto') {
    const video = videos[slotIndex];
    const source = clipUrl(clipIndex);

    if (video.dataset.clipIndex === String(clipIndex) && video.getAttribute('src') === source) {
      video.preload = preload;
      return video;
    }

    video.pause();
    video.removeAttribute('src');
    video.preload = preload;
    video.src = source;
    video.dataset.clipIndex = String(clipIndex);
    video.load();
    return video;
  }

  async function playVideo(video) {
    if (document.hidden || !heroVisible) return false;
    try {
      await video.play();
      return !video.paused;
    } catch (_) {
      return false;
    }
  }

  function pauseAll() {
    videos.forEach((video) => video.pause());
  }

  function scheduleNextPreload(delay = 1400) {
    window.clearTimeout(preloadTimer);
    preloadTimer = window.setTimeout(() => {
      if (!hasStarted || staticMode || document.hidden || !heroVisible || isSwitching) return;
      const nextSlotIndex = activeSlotIndex === 0 ? 1 : 0;
      const nextClipIndex = (activeClipIndex + 1) % playlist.length;
      prepareClip(nextSlotIndex, nextClipIndex, 'auto');
    }, delay);
  }

  async function switchToNext() {
    if (isSwitching || !hasStarted || document.hidden || !heroVisible) return;
    isSwitching = true;

    const currentSlotIndex = activeSlotIndex;
    const nextSlotIndex = currentSlotIndex === 0 ? 1 : 0;
    const nextClipIndex = (activeClipIndex + 1) % playlist.length;
    const current = videos[currentSlotIndex];
    const next = prepareClip(nextSlotIndex, nextClipIndex, 'auto');

    resetVideo(next);
    const started = await playVideo(next);

    if (!started) {
      isSwitching = false;
      scheduleNextPreload(800);
      return;
    }

    next.classList.add('is-active');
    current.classList.remove('is-active');

    window.setTimeout(() => {
      current.pause();
      removeLegacySources(current);
      activeSlotIndex = nextSlotIndex;
      activeClipIndex = nextClipIndex;
      isSwitching = false;
      scheduleNextPreload();
    }, fadeDuration);
  }

  videos.forEach((video, slotIndex) => {
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('muted', '');
    video.setAttribute('aria-hidden', 'true');
    removeLegacySources(video);

    video.addEventListener('timeupdate', () => {
      if (slotIndex !== activeSlotIndex || isSwitching || !hasStarted) return;
      if (video.currentTime >= clipDuration - fadeDuration / 1000) {
        void switchToNext();
      }
    });

    video.addEventListener('ended', () => {
      if (slotIndex === activeSlotIndex && !isSwitching && hasStarted) {
        void switchToNext();
      }
    });

    video.addEventListener('playing', () => {
      if (slotIndex === activeSlotIndex) scheduleNextPreload();
    });
  });

  videos[0].classList.add('is-active');
  videos[1].classList.remove('is-active');

  if (staticMode) {
    media.classList.add('is-static');
    return;
  }

  function introIsOpen() {
    return document.body.classList.contains('gea-intro-open');
  }

  async function startPlayback() {
    if (hasStarted || introIsOpen() || document.hidden || !heroVisible) return;
    hasStarted = true;

    const first = prepareClip(0, 0, 'auto');
    resetVideo(first);
    const started = await playVideo(first);

    if (!started) {
      hasStarted = false;
      return;
    }

    scheduleNextPreload();
  }

  if (hero && 'IntersectionObserver' in window) {
    const rect = hero.getBoundingClientRect();
    heroVisible = rect.bottom > 0 && rect.top < window.innerHeight;

    const viewportObserver = new IntersectionObserver((entries) => {
      const entry = entries[0];
      heroVisible = Boolean(entry?.isIntersecting);

      if (!heroVisible) {
        pauseAll();
        return;
      }

      if (!hasStarted) {
        void startPlayback();
        return;
      }

      void playVideo(videos[activeSlotIndex]);
      scheduleNextPreload(500);
    }, { threshold: 0.05 });

    viewportObserver.observe(hero);
  }

  if (introIsOpen()) {
    introObserver = new MutationObserver(() => {
      if (introIsOpen()) return;
      introObserver?.disconnect();
      introObserver = null;
      void startPlayback();
    });
    introObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  } else {
    void startPlayback();
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      pauseAll();
      return;
    }

    if (!hasStarted) {
      void startPlayback();
      return;
    }

    if (heroVisible) {
      void playVideo(videos[activeSlotIndex]);
      scheduleNextPreload(500);
    }
  });
})();
