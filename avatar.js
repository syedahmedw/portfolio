(() => {
  const widget = document.querySelector('[data-avatar]');
  if (!widget) return;

  const button = widget.querySelector('.avatar-play');
  const label = button.querySelector('.play-label');
  const view = widget.querySelector('.avatar-view');
  const portrait = widget.querySelector('.avatar-photo');
  const character = widget.querySelector('.avatar-character');
  const audio = widget.querySelector('audio');

  function showPortrait(show) {
    portrait.hidden = !show;
    character.hidden = show;
    const description = show ? 'Show animated avatar' : 'Show portrait';
    view.setAttribute('aria-label', description);
    view.title = description;
  }

  view.hidden = false;
  view.addEventListener('click', () => showPortrait(portrait.hidden));
  const status = widget.querySelector('.avatar-status');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let context;
  let analyser;
  let samples;
  let frame;
  let requested = false;
  let level = 0;

  function animateMouth() {
    if (reducedMotion.matches || audio.paused) {
      widget.style.removeProperty('--mouth-open');
      return;
    }
    let amplitude = 0;
    if (analyser) {
      analyser.getByteTimeDomainData(samples);
      let sum = 0;
      for (const sample of samples) sum += ((sample - 128) / 128) ** 2;
      amplitude = Math.min(1, Math.sqrt(sum / samples.length) * 6);
    } else {
      const frameIndex = Math.floor(audio.currentTime * 25);
      amplitude = parseInt(avatarMouthFrames[frameIndex] || '0', 36) / 35;
    }
    level += (amplitude - level) * 0.42;
    widget.style.setProperty('--mouth-open', level.toFixed(3));
    frame = requestAnimationFrame(animateMouth);
  }

  function reset() {
    requested = false;
    cancelAnimationFrame(frame);
    level = 0;
    widget.classList.remove('avatar-speaking');
    widget.style.removeProperty('--mouth-open');
    label.textContent = 'Play introduction';
  }

  function reportPlaybackError() {
    reset();
    status.textContent = 'The voice introduction could not play.';
    status.hidden = false;
  }

  button.hidden = false;
  button.addEventListener('click', async () => {
    if (requested) {
      reset();
      audio.pause();
      if (audio.readyState) audio.currentTime = 0;
      return;
    }

    requested = true;
    showPortrait(false);
    status.hidden = true;
    label.textContent = 'Stop introduction';
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    // Direct file previews use the bundled audio envelope.
    if (AudioContext && location.protocol !== 'file:' && !reducedMotion.matches) {
      try {
        if (!context) {
          context = new AudioContext();
          analyser = context.createAnalyser();
          analyser.fftSize = 512;
          samples = new Uint8Array(analyser.fftSize);
          context.createMediaElementSource(audio).connect(analyser).connect(context.destination);
        }
        context.resume().catch(() => {});
      } catch {
        analyser = null;
      }
    }

    try {
      await audio.play();
    } catch (error) {
      if (error.name !== 'AbortError' && requested) reportPlaybackError();
    }
  });

  audio.addEventListener('playing', () => {
    widget.classList.add('avatar-speaking');
    cancelAnimationFrame(frame);
    animateMouth();
  });
  audio.addEventListener('pause', reset);
  audio.addEventListener('ended', reset);
  audio.addEventListener('error', reportPlaybackError);
  reducedMotion.addEventListener('change', () => {
    cancelAnimationFrame(frame);
    animateMouth();
  });
})();
