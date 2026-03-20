function getCenter(el) {
  const r = el.getBoundingClientRect();
  return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, w: r.width, h: r.height };
}

function dist(a, b) {
  return Math.sqrt((a.cx - b.cx) ** 2 + (a.cy - b.cy) ** 2);
}

function lerp(a, b, t) { return a + (b - a) * t; }

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function mapRange(v, inMin, inMax, outMin, outMax) {
  return lerp(outMin, outMax, clamp((v - inMin) / (inMax - inMin), 0, 1));
}

function formatTime(s) {
  if (!isFinite(s) || isNaN(s)) return '0:00';
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
}

function getEventPos(e) {
  if (e.touches?.length > 0)        return { x: e.touches[0].clientX,        y: e.touches[0].clientY };
  if (e.changedTouches?.length > 0)  return { x: e.changedTouches[0].clientX,  y: e.changedTouches[0].clientY };
  return { x: e.clientX, y: e.clientY };
}