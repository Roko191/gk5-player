const BeatEngine = (() => {

  let bpm        = 120;
  let intervalId = null;
  let rafId      = null;

  let bgGlow     = null;
  let playerGlow = null;
  let bgEl       = null;

  // Separate intensity per effect so they can decay at different speeds
  let iBgGlow    = 0;
  let iPlayerGlow = 0;
  let iBrightness = 0;

  function init(els) {
    bgGlow     = els.bgGlow;
    playerGlow = els.playerGlow;
    bgEl       = els.bg;
  }

  function start(trackBpm) {
    stop();
    bpm = trackBpm || 120;
    onBeat();
    intervalId = setInterval(onBeat, (60 / bpm) * 1000);
    rafId = requestAnimationFrame(decayLoop);
  }

  function stop() {
    clearInterval(intervalId);
    cancelAnimationFrame(rafId);
    intervalId = rafId = null;
    iBgGlow = iPlayerGlow = iBrightness = 0;
    applyEffects();
  }

  function onBeat() {
    iBgGlow     = 1;
    iPlayerGlow = 1;
    iBrightness = 1;
  }

  function decayLoop() {
    iBgGlow     = Math.max(0, iBgGlow     - 0.032);
    iPlayerGlow = Math.max(0, iPlayerGlow - 0.048);
    iBrightness = Math.max(0, iBrightness - 0.038);
    applyEffects();
    rafId = requestAnimationFrame(decayLoop);
  }

  function applyEffects() {

    // 1. Full-screen ambient bg glow
    if (bgGlow) {
      bgGlow.style.opacity = (iBgGlow * 0.9).toFixed(3);
    }

    // 2. Body brightness shimmer
    if (bgEl) {
      bgEl.style.filter = iBrightness > 0.01
        ? `brightness(${(1 + iBrightness * 0.08).toFixed(3)})`
        : '';
    }

    // 3. Player glow bloom — drive opacity of the radial gradient layer
    if (playerGlow) {
      playerGlow.style.opacity = (iPlayerGlow * 1.0).toFixed(3);
    }
  }

  return { init, start, stop };

})();