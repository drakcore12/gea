(() => {
  'use strict';

  const media = document.querySelector('[data-hero-video-media]');
  if (!media) return;

  const videos = Array.from(media.querySelectorAll('[data-hero-video]'));
  if (videos.length < 2) return;

  const clipDuration = 10;
  const fadeDuration = 700;
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let activeIndex = 0;
  let isSwitching = false;

  videos.forEach((video) => {
    video.muted = true;
    video.playsInline = true;
  });

  function resetVideo(video) {
    try {
      video.currentTime = 0;
    } catch (_) {
      // Metadata may not be ready yet; playback will still begin at the start.
    }
  }

  async function playVideo(video) {
    try {
      await video.play();
      return true;
    } catch (_) {
      return false;
    }
  }

  async function switchTo(nextIndex) {
    if (isSwitching || nextIndex === activeIndex) return;
    isSwitching = true;

    const current = videos[activeIndex];
    const next = videos[nextIndex];
    resetVideo(next);

    const started = await playVideo(next);
    if (!started) {
      resetVideo(current);
      await playVideo(current);
      isSwitching = false;
      return;
    }

    next.classList.add('is-active');
    current.classList.remove('is-active');

    window.setTimeout(() => {
      current.pause();
      resetVideo(current);
      activeIndex = nextIndex;
      isSwitching = false;
    }, fadeDuration);
  }

  videos.forEach((video, index) => {
    video.addEventListener('timeupdate', () => {
      if (index !== activeIndex || isSwitching) return;
      if (video.currentTime >= clipDuration - 0.08) {
        void switchTo((activeIndex + 1) % videos.length);
      }
    });

    video.addEventListener('ended', () => {
      if (index === activeIndex && !isSwitching) {
        void switchTo((activeIndex + 1) % videos.length);
      }
    });
  });

  const first = videos[0];
  first.classList.add('is-active');

  if (reducedMotion) {
    first.pause();
    resetVideo(first);
    return;
  }

  void playVideo(first);

  document.addEventListener('visibilitychange', () => {
    const current = videos[activeIndex];
    if (document.hidden) {
      videos.forEach((video) => video.pause());
      return;
    }
    void playVideo(current);
  });
})();
