'use strict';
// One dry swing per accepted attack, unlocked directly by keyboard/touch input.
const swordAudio = (() => {
  const clips = Array.from({length: 4}, (_, i) => {
    const clip = new Audio(`assets/audio/sword/sword_slash_${String(i + 1).padStart(2, '0')}.wav`);
    clip.preload = 'auto';
    clip.volume = .65;
    return clip;
  });
  let previous = -1;
  function stop() {
    for (const clip of clips) {
      clip.pause();
      clip.currentTime = 0;
    }
  }
  function play() {
    if (document.hidden) return;
    stop();
    let index = Math.floor(Math.random() * (clips.length - 1));
    if (previous < 0) index = Math.floor(Math.random() * clips.length);
    else if (index >= previous) index++;
    previous = index;
    const clip = clips[index];
    clip.volume = .6 + Math.random() * .1;
    // Missing audio or autoplay restrictions must never interrupt combat.
    try { const pending = clip.play(); if (pending) pending.catch(() => {}); } catch (_) {}
  }
  addEventListener('blur', stop);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  return {play, stop};
})();
