'use strict';
// Decode once and loop the exact 46.08-second composition without timer gaps.
const backgroundMusic = (() => {
  let context, gain, source, buffer, loading, focused = true, enabled = true;
  const button = document.getElementById('music-toggle');
  try { enabled = localStorage.getItem('grand-tide-music') !== 'off'; } catch (_) {}
  function label() {
    button.textContent = enabled ? 'Music: On' : 'Music: Off';
    button.setAttribute('aria-pressed', String(enabled));
    button.setAttribute('aria-label', enabled ? 'Turn background music off' : 'Turn background music on');
  }
  function canPlay() { return enabled && focused && !document.hidden; }
  function start() {
    if (!buffer || source || !context || context.state !== 'running' || !canPlay()) return;
    source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.loopStart = 0;
    source.loopEnd = buffer.duration;
    source.connect(gain);
    source.start();
  }
  async function sync() {
    if (!context) return;
    try {
      if (canPlay()) { await context.resume(); start(); }
      else await context.suspend();
    } catch (_) { /* A later user gesture can retry blocked playback. */ }
  }
  function unlock() {
    if (!canPlay()) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    try {
      if (!context) {
        context = new AudioContext();
        gain = context.createGain(); gain.gain.value = .35;
        gain.connect(context.destination);
      }
      sync();
      if (!loading && !buffer) {
        loading = fetch('assets/audio/music/soothing-pirate.ogg')
          .then(r => { if (!r.ok) throw new Error('Music unavailable'); return r.arrayBuffer(); })
          .then(bytes => context.decodeAudioData(bytes))
          .then(decoded => { buffer = decoded; start(); })
          .catch(() => { loading = null; });
      }
    } catch (_) { /* Music failure never prevents playing the game. */ }
  }
  button.addEventListener('click', () => {
    enabled = !enabled;
    try { localStorage.setItem('grand-tide-music', enabled ? 'on' : 'off'); } catch (_) {}
    label(); if (enabled) unlock(); else sync();
  });
  addEventListener('pointerdown', unlock, {capture: true});
  addEventListener('keydown', unlock, {capture: true});
  addEventListener('blur', () => { focused = false; sync(); });
  addEventListener('focus', () => { focused = true; sync(); });
  document.addEventListener('visibilitychange', sync);
  label();
  return {unlock};
})();
