const DragSystem = (() => {

  let cdWrap, playerWrap, playerGlow;
  let isDragging = false;
  let startPos   = { x: 0, y: 0 };
  let currentPos = { x: 0, y: 0 };
  let origin     = { x: 0, y: 0 };
  let translate  = { x: 0, y: 0 };
  let rotation   = 0;
  let lastX      = 0;
  let velX       = 0;
  let dropEnabled = false;

  const GLOW_START = 250;
  const GLOW_FULL  = 60;
  const MAGNET_DIST = 80;
  const DROP_DIST   = 100;

  let onDropSuccess = null;
  let onDropFail    = null;

  function init(els, callbacks) {
    cdWrap     = els.cdWrap;
    playerWrap = els.playerWrap;
    playerGlow = els.playerGlow;
    onDropSuccess = callbacks.onDropSuccess;
    onDropFail    = callbacks.onDropFail;

    cdWrap.classList.add('idle-float');
    cdWrap.addEventListener('mousedown',  onPointerDown, { passive: false });
    cdWrap.addEventListener('touchstart', onPointerDown, { passive: false });
    document.addEventListener('mousemove',   onPointerMove, { passive: false });
    document.addEventListener('touchmove',   onPointerMove, { passive: false });
    document.addEventListener('mouseup',     onPointerUp);
    document.addEventListener('touchend',    onPointerUp);
    document.addEventListener('touchcancel', onPointerUp);
  }

  function onPointerDown(e) {
    e.preventDefault();
    const pos = getEventPos(e);
    startPos = currentPos = { ...pos };
    lastX = pos.x;
    isDragging = true;
    cdWrap.classList.remove('idle-float', 'returning', 'snapping');
    cdWrap.classList.add('dragging');
    const cur = parseTranslate(cdWrap.style.transform);
    origin = translate = { ...cur };
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    e.preventDefault();
    const pos = getEventPos(e);
    currentPos = { ...pos };
    const dx = pos.x - startPos.x;
    const dy = pos.y - startPos.y;
    translate = { x: origin.x + dx, y: origin.y + dy };
    velX = pos.x - lastX;
    lastX = pos.x;
    rotation = clamp(velX * 1.5, -18, 18);
    applyTransform(translate.x, translate.y, rotation);
    if (dropEnabled) {
      updateGlow();
      applyMagnet();
    } else {
      setGlowIntensity(0);
    }
  }

  function onPointerUp() {
    if (!isDragging) return;
    isDragging = false;
    cdWrap.classList.remove('dragging');
    applyTransform(translate.x, translate.y, 0);
    setGlowIntensity(0);
    if (dropEnabled) {
      const d = dist(getCenter(cdWrap), getCenter(playerWrap));
      d < DROP_DIST ? handleDropSuccess() : handleDropFail();
    } else {
      handleDropFail();
    }
  }

  function handleDropSuccess() {
    const cdr = cdWrap.getBoundingClientRect();
    const pr  = playerWrap.getBoundingClientRect();
    const snapDx = (pr.left + pr.width  / 2) - (cdr.left + cdr.width  / 2);
    const snapDy = (pr.top  + pr.height / 2) - (cdr.top  + cdr.height / 2);
    cdWrap.classList.add('snapping');
    applyTransform(translate.x + snapDx, translate.y + snapDy, 0);
    setTimeout(() => {
      cdWrap.classList.add('inserted');
      cdWrap.classList.remove('snapping');
      if (typeof onDropSuccess === 'function') onDropSuccess();
    }, 460);
  }

  function handleDropFail() {
    cdWrap.classList.add('returning');
    applyTransform(0, 0, 0);
    setTimeout(() => {
      cdWrap.classList.remove('returning');
      cdWrap.classList.add('idle-float');
    }, 520);
    if (typeof onDropFail === 'function') onDropFail();
  }

  function updateGlow() {
    const d = dist(getCenter(cdWrap), getCenter(playerWrap));
    setGlowIntensity(mapRange(d, GLOW_START, GLOW_FULL, 0, 1));
  }

  function setGlowIntensity(intensity) {
    intensity = clamp(intensity, 0, 1);
    playerGlow.style.opacity = intensity.toFixed(3);
  }

  function applyMagnet() {
    const cd = getCenter(cdWrap);
    const pl = getCenter(playerWrap);
    const d  = dist(cd, pl);
    if (d < MAGNET_DIST && d > 10) {
      const s = mapRange(d, MAGNET_DIST, 10, 0, 0.12);
      applyTransform(translate.x + (pl.cx - cd.cx) * s, translate.y + (pl.cy - cd.cy) * s, rotation);
    }
  }

  function applyTransform(tx, ty, rot) {
    cdWrap.style.transform = `translateX(calc(-50% + ${tx}px)) translateY(${ty}px) rotate(${rot}deg)`;
  }

  function parseTranslate(t) {
    if (!t) return { x: 0, y: 0 };
    const x = t.match(/translateX\(calc\(-50%\s*\+\s*([-\d.]+)px\)\)/);
    const y = t.match(/translateY\(([-\d.]+)px\)/);
    return { x: x ? parseFloat(x[1]) : 0, y: y ? parseFloat(y[1]) : 0 };
  }

  function reset() {
    cdWrap.classList.remove('inserted', 'snapping', 'returning', 'dragging');
    cdWrap.style.opacity = '';
    cdWrap.style.transform = '';
    cdWrap.classList.add('idle-float');
    setGlowIntensity(0);
    isDragging = false;
    translate = origin = { x: 0, y: 0 };
    rotation = 0;
  }

  function disable() { dropEnabled = false; setGlowIntensity(0); }
  function enable()  { dropEnabled = true; }

  return { init, reset, disable, enable, setGlowIntensity };

})();