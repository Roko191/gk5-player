const App = (() => {

  let state = 'closed';
  let playerWrap, playerGlow, playerImg, cdWrap, progressWrap, progressFill;

  const IMG_EMPTY  = 'assets/images/open_unloaded.png';
  const IMG_LOADED = 'assets/images/open_loaded.png';
  const IMG_CLOSED = 'assets/images/closed.png';

  function init() {
    playerWrap   = document.getElementById('playerWrap');
    playerGlow   = document.getElementById('playerGlow');
    playerImg    = document.getElementById('playerImg');
    cdWrap       = document.getElementById('cdWrap');
    progressWrap = document.getElementById('progressWrap');
    progressFill = document.getElementById('progressFill');

    AudioSystem.init({ progressFill });

    DragSystem.init(
      { cdWrap, playerWrap, playerGlow },
      { onDropSuccess: handleDropSuccess, onDropFail: () => {} }
    );

    playerWrap.addEventListener('click', handlePlayerClick);
    setState('closed');
  }

  function setState(next) {
    state = next;
    if (next === 'closed')  enterClosed();
    if (next === 'open')    enterOpen();
    if (next === 'loaded')  enterLoaded();
    if (next === 'playing') enterPlaying();
  }

  function enterClosed() {
    playerImg.src = IMG_CLOSED;
    playerImg.classList.remove('lit');
    playerWrap.classList.add('clickable');
    DragSystem.disable();
  }

  function enterOpen() {
    playerImg.src = IMG_EMPTY;
    playerImg.classList.remove('lit');
    playerWrap.classList.add('clickable');
    DragSystem.enable();
  }

  function enterLoaded() {
    playerImg.src = IMG_LOADED;
    playerImg.classList.remove('lit');
    playerWrap.classList.add('clickable');
    AudioSystem.playSFX('insert', 0.7);
  }

  function enterPlaying() {
    playerWrap.classList.remove('clickable');
    playerWrap.classList.add('clicked');
    setTimeout(() => playerWrap.classList.remove('clicked'), 250);
    AudioSystem.playSFX('close', 0.85);
    setTimeout(() => {
      playerImg.src = IMG_CLOSED;
      playerImg.classList.add('lit');
    }, 80);
    progressWrap.classList.add('visible');
    progressFill.style.width = '0%';
    setTimeout(() => AudioSystem.play(handleAudioEnded), 200);
  }

  function handlePlayerClick() {
    playerWrap.classList.add('clicked');
    setTimeout(() => playerWrap.classList.remove('clicked'), 250);

    if (state === 'closed') {
      AudioSystem.playSFX('open', 0.85);
      setTimeout(() => setState('open'), 80);
    } else if (state === 'open') {
      AudioSystem.playSFX('close', 0.85);
      setTimeout(() => setState('closed'), 80);
    } else if (state === 'loaded') {
      setState('playing');
    }
  }

  function handleDropSuccess() {
    if (state !== 'open') return;
    setState('loaded');
  }

  function handleAudioEnded() {
    progressWrap.classList.remove('visible');
    setTimeout(() => {
      AudioSystem.playSFX('open', 0.85);
      playerImg.src = IMG_LOADED;
      playerImg.classList.remove('lit');
    }, 300);
    setTimeout(() => setState('loaded'), 500);
  }

  return { init, getState: () => state };
})();

document.addEventListener('DOMContentLoaded', () => App.init());