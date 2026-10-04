'use strict';
// Dry gravel samples: two foot contacts per 90-unit walk animation cycle.
const footsteps = (() => {
  let context, loading, buffers = [], lastSample = -1, distance = 0, walking = false;
  const active = new Set();
  function unlock() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    try {
      context ||= new AudioContext();
      if (context.state === 'suspended') context.resume().catch(() => {});
      if (!loading) {
        loading = Promise.all(Array.from({length: 8}, async (_, i) => {
          const response = await fetch(`assets/audio/footsteps/gravel_step_${String(i + 1).padStart(2, '0')}.wav`);
          if (!response.ok) throw new Error('Footstep unavailable');
          return context.decodeAudioData(await response.arrayBuffer());
        })).then(result => { buffers = result; }).catch(() => { loading = null; });
      }
    } catch (_) { /* Audio is optional; movement must remain available. */ }
  }
  function play() {
    if (!context || context.state !== 'running' || !buffers.length) return;
    let index = Math.floor(Math.random() * (buffers.length - 1));
    if (index >= lastSample) index++;
    if (lastSample < 0) index = Math.floor(Math.random() * buffers.length);
    lastSample = index;
    const source = context.createBufferSource(), gain = context.createGain();
    source.buffer = buffers[index];
    source.playbackRate.value = .96 + Math.random() * .08;
    gain.gain.value = .4 + Math.random() * .08;
    source.connect(gain); gain.connect(context.destination);
    active.add(source);
    source.onended = () => { active.delete(source); source.disconnect(); gain.disconnect(); };
    source.start();
  }
  function stop() {
    walking = false; distance = 0;
    for (const source of active) { try { source.stop(); } catch (_) {} }
    active.clear();
  }
  function update(travel, enabled) {
    if (!enabled || document.hidden || travel <= 0 || travel > 30) { stop(); return; }
    if (!walking) { walking = true; distance = 0; play(); }
    distance += travel;
    if (distance >= 45) { distance %= 45; play(); }
  }
  addEventListener('keydown', unlock, {capture: true});
  addEventListener('pointerdown', unlock, {capture: true});
  addEventListener('blur', stop);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  return {update, stop};
})();
