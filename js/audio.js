const AudioSystem = (() => {

  const TRACKS = [
    { src: 'assets/audio/songs/track_01.mp3' },
    { src: 'assets/audio/songs/track_06.mp3' },
    { src: 'assets/audio/songs/track_07.mp3' },
    { src: 'assets/audio/songs/track_10.mp3' },
    { src: 'assets/audio/songs/track_12.mp3' },
  ];

  const SFX = {
    open:   'assets/audio/sfxs/cdtray_open.mp3',
    close:  'assets/audio/sfxs/cdtray_close.mp3',
    snap:   'assets/audio/sfxs/cd_snap.mp3',
    insert: 'assets/audio/sfxs/cd_snap.mp3',
  };

  let mainAudio   = new Audio();
  let sfxAudios   = {};
  let currentTrack = null;
  let rafId        = null;
  let onEndedCb    = null;
  let progressFill = null;

  function pickTrack() {
    let lastIndex = -1;
    try { lastIndex = parseInt(localStorage.getItem('cdp_last_track') ?? '-1', 10); } catch (_) {}
    let pool = TRACKS.map((_, i) => i).filter(i => i !== lastIndex);
    if (pool.length === 0) pool = TRACKS.map((_, i) => i);
    const idx = pool[Math.floor(Math.random() * pool.length)];
    currentTrack = { ...TRACKS[idx], index: idx };
    try { localStorage.setItem('cdp_last_track', String(idx)); } catch (_) {}
    mainAudio.src = currentTrack.src;
    mainAudio.preload = 'auto';
    mainAudio.load();
  }

  function playSFX(key, volume = 0.8) {
    const src = SFX[key];
    if (!src) return;
    if (!sfxAudios[key]) sfxAudios[key] = new Audio(src);
    const sfx = sfxAudios[key];
    sfx.volume = volume;
    sfx.currentTime = 0;
    sfx.play().catch(() => {});
  }

  function play(onEnded) {
    if (!currentTrack) pickTrack();
    onEndedCb = onEnded;
    mainAudio.currentTime = 0;
    mainAudio.volume = 1;
    mainAudio.onended = () => {
      stopRaf();
      if (typeof onEndedCb === 'function') onEndedCb();
    };
    mainAudio.play().catch(err => console.warn(err));
    startRaf();
  }

  function stop() {
    mainAudio.pause();
    mainAudio.currentTime = 0;
    stopRaf();
    if (progressFill) progressFill.style.width = '0%';
  }

  function startRaf() {
    stopRaf();
    const tick = () => {
      if (progressFill && mainAudio.duration) {
        progressFill.style.width = `${clamp((mainAudio.currentTime / mainAudio.duration) * 100, 0, 100)}%`;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
  }

  function stopRaf() {
    if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
  }

  function init(els) {
    progressFill = els.progressFill || null;
    pickTrack();
  }

  return { init, play, stop, playSFX };

})();