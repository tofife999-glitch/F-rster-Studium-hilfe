// Kleine Hilfsfunktionen: Zufall mit Startwert, Rauschen, Farben
'use strict';

const U = {};

U.rng = function (seed) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// Deterministisches Hash-Rauschen für Ganzzahl-Koordinaten (0..1)
U.hash = function (x, y, s) {
  let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul((s || 0) | 0, 2147483647);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
};

// Weiches Werte-Rauschen
U.noise = function (x, y, s) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = U.hash(xi, yi, s), b = U.hash(xi + 1, yi, s);
  const c = U.hash(xi, yi + 1, s), d = U.hash(xi + 1, yi + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};

U.fbm = function (x, y, s, oct) {
  let sum = 0, amp = 0.5, f = 1;
  for (let i = 0; i < (oct || 3); i++) { sum += U.noise(x * f, y * f, s + i * 17) * amp; amp *= 0.5; f *= 2; }
  return sum / (1 - Math.pow(0.5, oct || 3));
};

U.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
U.lerp = (a, b, t) => a + (b - a) * t;

U.hex = function (h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

// Abstand Punkt–Strecke
U.segDist = function (px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const t = U.clamp(((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy), 0, 1);
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
};

U.polyDist = function (px, py, pts) {
  let m = Infinity;
  for (let i = 0; i < pts.length - 1; i++) m = Math.min(m, U.segDist(px, py, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]));
  return m;
};

U.canvas = function (w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  return [c, ctx];
};

U.shuffle = function (arr, r) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

U.esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
