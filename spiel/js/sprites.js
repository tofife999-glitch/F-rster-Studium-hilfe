// Pixel-Sprites: Bäume, Figuren, Objekte. Alles wird beim Start einmal gezeichnet und zwischengespeichert.
'use strict';

const S = {};

// Farbrampen (Herbst, Anfang Oktober). Index 0 = Kontur/dunkelste Stufe.
S.KRONE = {
  rotbuche:    ['#4a2410', '#8a4016', '#b8621d', '#d98b2e', '#f0b552', '#f8d98a'],
  traubeneiche:['#2e3215', '#525a1f', '#76802b', '#9aa23c', '#bfc25c', '#dcd98f'],
  hainbuche:   ['#4d3e0e', '#7f6a18', '#b0952a', '#d4b83c', '#ecd667', '#f7ea9e'],
  fichte:      ['#0b2119', '#143426', '#1d4732', '#285b3f', '#3b7552', '#5d9470'],
  waldkiefer:  ['#14292a', '#21423e', '#2f5a52', '#41736a', '#5b8f83', '#82ae9f']
};
S.STAMM = {
  rotbuche:    ['#4f5456', '#7d8486', '#a6acad', '#c8cccb'],
  traubeneiche:['#2a221c', '#43372c', '#5f4e3e', '#7a6753'],
  hainbuche:   ['#4b5052', '#707778', '#979e9e', '#bcc1bf'],
  fichte:      ['#3a2116', '#5a3423', '#7a4a31', '#946042'],
  waldkiefer:  ['#3a2a22', '#5a4134', '#b0562e', '#de8a4c']
};

S.cache = {};

function px(ctx, x, y, c) { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); }

// ---------- Bäume ----------
// Liefert {stamm, krone, ax, ay}: zwei Bilder mit gemeinsamem Ankerpunkt (Stammfuß)
S.baum = function (art, groesse, variante) {
  const key = art + groesse + variante;
  if (S.cache[key]) return S.cache[key];
  const r = U.rng(art.length * 977 + variante * 131 + groesse.length * 7);
  const k = S.KRONE[art], st = S.STAMM[art];
  let res;
  if (art === 'fichte') res = fichte(r, groesse, k, st, variante);
  else if (art === 'waldkiefer') res = kiefer(r, groesse, k, st, variante);
  else res = laubbaum(r, art, groesse, k, st, variante);
  S.cache[key] = res;
  return res;
};

function maskShade(ctx, w, h, inMask, cx, cy, R, ramp, seed, opts) {
  opts = opts || {};
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!inMask(x, y)) continue;
    const edge = !inMask(x - 1, y) || !inMask(x + 1, y) || !inMask(x, y - 1) || !inMask(x, y + 1);
    const nx = (x - cx) / R, ny = (y - cy) / R;
    let l = 0.62 - 0.42 * (nx * 0.55 + ny * 0.85);
    l += (U.noise(x / (opts.cluster || 3.2), y / (opts.cluster || 3.2), seed) - 0.5) * 0.75;
    l += (U.hash(x, y, seed) - 0.5) * 0.16;
    let i = Math.round(U.clamp(l, 0, 1) * (ramp.length - 2)) + 1;
    if (edge) i = (nx < -0.2 && ny < -0.2) ? 2 : 0;
    i = U.clamp(i, 0, ramp.length - 1);
    px(ctx, x, y, ramp[i]);
  }
}

function laubbaum(r, art, g, k, st, v) {
  k = k.slice();
  const R = { alt: art === 'hainbuche' ? 15 : art === 'traubeneiche' ? 21 : 20, mittel: art === 'hainbuche' ? 10 : 12, jung: 5 + v }[g];
  const trunkH = { alt: 13, mittel: 8, jung: 0 }[g];
  if (g === 'jung' && v === 2) k = k.map((c, i) => S.KRONE.traubeneiche[Math.min(i, 5)]);   // manche junge Buchen noch grün
  const tw = { alt: art === 'traubeneiche' ? 6 : art === 'hainbuche' ? 4 : 5, mittel: 3, jung: 1 }[g];
  const W = R * 2 + 8, H = Math.round(R * 1.9) + trunkH + 6;
  const ax = Math.floor(W / 2), ay = H - 2;
  const cx = ax, cy = ay - trunkH - R * 0.8;
  const blobs = [[cx, cy, R * (art === 'hainbuche' ? 0.78 : 0.86), art === 'hainbuche' ? 1.15 : 0.92]];
  const nb = art === 'traubeneiche' ? 9 : 7;
  for (let i = 0; i < nb; i++) {
    const a = (i / nb) * Math.PI * 2 + r() * 0.6;
    const d = R * (0.45 + r() * 0.2);
    const br = R * (art === 'traubeneiche' ? 0.34 + r() * 0.22 : 0.4 + r() * 0.14);
    blobs.push([cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.85, br, 1]);
  }
  const inMask = (x, y) => {
    if (x < 0 || y < 0 || x >= W || y >= H) return false;
    for (const b of blobs) { const dx = (x - b[0]) / b[2], dy = (y - b[1]) / (b[2] * b[3]); if (dx * dx + dy * dy <= 1) return true; }
    return false;
  };
  const [kc, kx] = U.canvas(W, H);
  maskShade(kx, W, H, inMask, cx, cy, R, k, v * 31 + art.length, { cluster: art === 'traubeneiche' ? 2.6 : 3.2 });
  // Lücken mit Ästen (nur große Bäume)
  if (g === 'alt') {
    for (let i = 0; i < 5; i++) {
      const gx = Math.round(cx + (r() - 0.5) * R * 1.1), gy = Math.round(cy + (r() - 0.2) * R * 0.9);
      if (inMask(gx, gy) && inMask(gx + 1, gy)) { px(kx, gx, gy, k[0]); px(kx, gx + 1, gy, k[0]); px(kx, gx, gy + 1, st[1]); }
    }
  }
  const [sc, sx] = U.canvas(W, H);
  // Stamm
  const top = Math.round(cy + R * 0.2);
  for (let y = top; y <= ay; y++) {
    const flare = y >= ay - 1 ? 1 : 0;
    for (let x = -flare; x < tw + flare; x++) {
      const xx = ax - Math.floor(tw / 2) + x;
      let i = x <= 0 ? 3 : x >= tw - 1 ? 0 : 2;
      if (tw <= 2) i = x === 0 ? 2 : 1;
      if (art === 'traubeneiche' && U.hash(xx, y, 3) < 0.28) i = 0;          // tiefe Borkenrisse
      if (art === 'hainbuche' && (x === 1) && y % 3 !== 0) i = 3;              // helle Längswülste
      if (art === 'rotbuche' && U.hash(xx, y, 5) < 0.05) i = 1;                // glatte Rinde, wenige Flecken
      px(sx, xx, y, st[U.clamp(i, 0, st.length - 1)]);
    }
  }
  return { stamm: sc, krone: kc, ax, ay, kroneOben: cy - R, kroneR: R, w: W, h: H };
}

function fichte(r, g, k, st, v) {
  const H = { alt: 54, mittel: 32, jung: 11 }[g];
  const Wb = Math.round(H * 0.52);
  const stem = { alt: 5, mittel: 3, jung: 1 }[g];
  const W = Wb + 6, Hc = H + stem + 3;
  const ax = Math.floor(W / 2), ay = Hc - 2;
  const topY = 1, baseY = ay - stem;
  const tier = g === 'alt' ? 7 : g === 'mittel' ? 5 : 4;
  const inMask = (x, y) => {
    if (y < topY || y > baseY) return false;
    const t = (y - topY) / (baseY - topY);
    const saw = 0.7 + 0.3 * (((y - topY) % tier) / tier);
    const hw = (Wb / 2) * t * saw + 0.6 + (U.hash(x, y, v) < 0.15 ? 1 : 0);
    return Math.abs(x - ax) <= hw;
  };
  const [kc, kx] = U.canvas(W, Hc);
  for (let y = 0; y < Hc; y++) for (let x = 0; x < W; x++) {
    if (!inMask(x, y)) continue;
    const edge = !inMask(x - 1, y) || !inMask(x + 1, y) || !inMask(x, y + 1);
    const side = (x - ax) / (Wb / 2 + 1);
    const t = (y - topY) / (baseY - topY);
    const inTier = ((y - topY) % tier) / tier;
    let l = 0.55 - side * 0.35 - inTier * 0.35 + (1 - t) * 0.15 + (U.hash(x, y, 9) - 0.5) * 0.2;
    let i = Math.round(U.clamp(l, 0, 1) * (k.length - 2)) + 1;
    if (edge) i = side < -0.3 ? 2 : 0;
    px(kx, x, y, k[U.clamp(i, 0, k.length - 1)]);
  }
  const [sc, sx] = U.canvas(W, Hc);
  for (let y = baseY - 2; y <= ay; y++) for (let x = 0; x < Math.max(1, stem > 3 ? 3 : 2); x++) px(sx, ax - 1 + x, y, st[x === 0 ? 3 : 1]);
  return { stamm: sc, krone: kc, ax, ay, kroneOben: topY, kroneR: Wb / 2, w: W, h: Hc };
}

function kiefer(r, g, k, st, v) {
  const trunk = { alt: 30, mittel: 16, jung: 3 }[g];
  const cw = { alt: 17, mittel: 10, jung: 5 }[g];
  const W = cw * 2 + 10, H = trunk + cw + 10;
  const ax = Math.floor(W / 2), ay = H - 2;
  const crownY = ay - trunk;
  const blobs = [];
  const n = g === 'alt' ? 5 : g === 'mittel' ? 3 : 1;
  for (let i = 0; i < n; i++) {
    blobs.push([ax + (r() - 0.5) * cw * 1.3, crownY - r() * cw * 0.7, cw * (0.45 + r() * 0.25), 0.62]);
  }
  blobs.push([ax, crownY - cw * 0.3, cw * 0.7, 0.6]);
  const inMask = (x, y) => {
    if (x < 0 || y < 0 || x >= W || y >= H) return false;
    for (const b of blobs) { const dx = (x - b[0]) / b[2], dy = (y - b[1]) / (b[2] * b[3]); if (dx * dx + dy * dy <= 1) return true; }
    return false;
  };
  const [kc, kx] = U.canvas(W, H);
  maskShade(kx, W, H, inMask, ax, crownY - cw * 0.3, cw, k, v * 13 + 77, { cluster: 2.4 });
  const [sc, sx] = U.canvas(W, H);
  const tw = g === 'alt' ? 4 : g === 'mittel' ? 3 : 1;
  for (let y = crownY - 2; y <= ay; y++) {
    const upper = y < crownY + trunk * 0.55;            // oben fuchsrote Spiegelrinde
    for (let x = 0; x < tw; x++) {
      let c = upper ? (x === 0 ? st[3] : st[2]) : (U.hash(x, y, 4) < 0.3 ? st[0] : st[1]);
      px(sx, ax - Math.floor(tw / 2) + x, y, c);
    }
  }
  // ein paar Äste
  if (g !== 'jung') for (let i = 0; i < 3; i++) { const yy = crownY + 1 + i * 2; const d = i % 2 ? 1 : -1; for (let j = 1; j < 5; j++) px(sx, ax + d * (j + 1), yy - (j >> 1), st[2]); }
  return { stamm: sc, krone: kc, ax, ay, kroneOben: crownY - cw, kroneR: cw, w: W, h: H };
}

// ---------- Figuren ----------
S.LOOK = {
  spieler:  { haar: ['#b88a33', '#e9c561', '#fbe6a0'], haut: '#f2c9a2', hautS: '#d9a47e', jacke: ['#3e5530', '#5a7a42', '#74954f'], hose: '#4a4135', schuh: '#2e2219', zopf: true },
  buehler:  { haar: ['#8d8a82', '#b7b3a9', '#d7d4cb'], haut: '#e8bb93', hautS: '#c99670', jacke: ['#384a2b', '#4e6539', '#667f4a'], hose: '#5b5245', schuh: '#2e2219', hut: ['#3c4530', '#55603f'], bart: true },
  wanderin: { haar: ['#3a2418', '#5a3a28', '#7a5238'], haut: '#eec09a', hautS: '#cf9c76', jacke: ['#8f2f27', '#c0473a', '#de6a55'], hose: '#363a46', schuh: '#2a2a2a', rucksack: '#3d5a8a', zopf: true },
  arbeiter: { haar: ['#4a3220', '#6a4a30', '#8a6440'], haut: '#e2b088', hautS: '#c08c66', jacke: ['#c45f12', '#ee8424', '#f8a44a'], hose: '#2f4f7a', schuh: '#2a1f17', helm: ['#c8571a', '#ef7a2a', '#f8a060'] }
};

// Rahmen 14x22, Richtung: 0 unten, 1 links, 2 rechts, 3 oben; frame 0..3
S.figur = function (name, dir, frame) {
  const key = 'f' + name + dir + frame;
  if (S.cache[key]) return S.cache[key];
  const L = S.LOOK[name];
  const [c, x] = U.canvas(14, 22);
  const P = (a, b, col) => px(x, a, b, col);
  const R = (a, b, w, h, col) => { x.fillStyle = col; x.fillRect(a, b, w, h); };
  const step = frame % 2 === 1 ? (frame === 1 ? 1 : -1) : 0;
  const bob = frame % 2 === 1 ? 0 : 0;
  // Beine
  const legY = 15 + bob;
  if (dir === 0 || dir === 3) {
    R(4, legY, 2, 5 + (step > 0 ? -1 : 0), L.hose); R(8, legY, 2, 5 + (step < 0 ? -1 : 0), L.hose);
    R(4, legY + 5 + (step > 0 ? -1 : 0), 2, 1, L.schuh); R(8, legY + 5 + (step < 0 ? -1 : 0), 2, 1, L.schuh);
  } else {
    const s = dir === 1 ? -1 : 1;
    R(6 + step * s, legY, 2, 5, L.hose); R(6 - step * s, legY, 2, 5, L.hose);
    R(6 + step * s + (s > 0 ? 0 : -1), legY + 5, 3, 1, L.schuh); R(6 - step * s + (s > 0 ? 0 : -1), legY + 5, 3, 1, L.schuh);
  }
  // Rucksack hinten
  if (L.rucksack && dir === 3) R(4, 8, 6, 6, L.rucksack);
  // Körper/Jacke
  R(3, 8 + bob, 8, 8, L.jacke[1]);
  R(3, 8 + bob, 1, 8, L.jacke[0]); R(10, 8 + bob, 1, 8, L.jacke[0]);
  R(4, 8 + bob, 6, 1, L.jacke[2]);
  if (dir === 0) { R(6, 9 + bob, 2, 6, L.jacke[0]); if (name === 'arbeiter') { R(3, 12, 8, 1, '#f4f0d8'); } }
  if (L.rucksack && (dir === 1 || dir === 2)) R(dir === 1 ? 9 : 2, 9, 3, 5, L.rucksack);
  // Arme
  const armSw = frame % 2 === 1 ? step : 0;
  if (dir === 0 || dir === 3) { R(2, 9 + bob + armSw, 1, 5, L.jacke[0]); R(11, 9 + bob - armSw, 1, 5, L.jacke[0]); P(2, 14 + bob + armSw, L.haut); P(11, 14 + bob - armSw, L.haut); }
  else { const ax = dir === 1 ? 5 : 8; R(ax, 9 + armSw, 1, 5, L.jacke[0]); P(ax, 14 + armSw, L.haut); }
  // Kopf
  R(4, 2 + bob, 6, 6, L.haut);
  R(4, 7 + bob, 6, 1, L.hautS);
  const h = L.haar;
  if (dir === 0) {
    R(4, 1, 6, 2, h[1]); R(3, 2, 1, 4, h[0]); R(10, 2, 1, 4, h[0]); P(5, 1, h[2]); P(6, 1, h[2]);
    P(5, 4, '#2b2b2b'); P(8, 4, '#2b2b2b');
    if (L.bart) { R(4, 6, 6, 2, h[1]); P(5, 5, h[1]); P(8, 5, h[1]); }
    if (L.zopf && name === 'spieler') { R(3, 6, 1, 3, h[1]); R(10, 6, 1, 3, h[1]); }
  } else if (dir === 3) {
    R(4, 1, 6, 6, h[1]); R(3, 2, 1, 5, h[0]); R(10, 2, 1, 5, h[0]); R(5, 1, 3, 1, h[2]);
    if (L.zopf) { R(6, 7, 2, 4, h[1]); P(6, 7, h[2]); }
  } else {
    const f = dir === 2;
    R(4, 1, 6, 2, h[1]); R(f ? 4 : 8, 2, 2, 4, h[0]); R(f ? 4 : 9, 3, 1, 3, h[1]);
    P(f ? 8 : 5, 4, '#2b2b2b');
    if (L.bart) R(f ? 7 : 4, 6, 3, 2, h[1]);
    if (L.zopf) { R(f ? 2 : 10, 3, 2, 4, h[1]); P(f ? 2 : 11, 3, h[2]); }
    P(f ? 2 : 11, 2, h[2]);
  }
  if (L.hut) { R(2, 1, 10, 1, L.hut[0]); R(4, -1 + 1, 6, 2, L.hut[1]); R(4, 0, 6, 1, L.hut[1]); P(9, 0, '#a33'); }
  if (L.helm) { R(3, 0, 8, 3, L.helm[1]); R(4, 0, 6, 1, L.helm[2]); R(3, 2, 8, 1, L.helm[0]); if (dir === 0) R(4, 3, 6, 1, '#cfd6d8'); }
  S.cache[key] = c;
  return c;
};

// Porträt (großer Kopf) für Dialoge, 24x24 hochskaliert
S.portrait = function (name) {
  const key = 'p' + name;
  if (S.cache[key]) return S.cache[key];
  const [c, x] = U.canvas(24, 24);
  const L = S.LOOK[name];
  const R = (a, b, w, h, col) => { x.fillStyle = col; x.fillRect(a, b, w, h); };
  R(0, 0, 24, 24, '#20302a');
  R(4, 18, 16, 6, L.jacke[1]); R(4, 18, 16, 1, L.jacke[2]); R(11, 18, 2, 6, L.jacke[0]);
  if (name === 'arbeiter') R(4, 21, 16, 1, '#f4f0d8');
  R(9, 15, 6, 3, L.hautS);
  R(6, 5, 12, 12, L.haut); R(6, 15, 12, 2, L.hautS);
  const h = L.haar;
  R(5, 3, 14, 4, h[1]); R(5, 4, 2, 9, h[0]); R(17, 4, 2, 9, h[0]); R(8, 3, 6, 1, h[2]);
  if (L.zopf) { R(4, 8, 2, 8, h[1]); R(18, 8, 2, 8, h[1]); }
  R(9, 10, 2, 2, '#2b2b2b'); R(14, 10, 2, 2, '#2b2b2b'); x.fillStyle = '#fff'; x.fillRect(9, 10, 1, 1); x.fillRect(14, 10, 1, 1);
  R(11, 14, 3, 1, L.hautS);
  if (L.bart) { R(7, 13, 10, 4, h[1]); R(8, 17, 8, 1, h[0]); R(11, 14, 3, 1, h[0]); }
  if (L.hut) { R(3, 4, 18, 2, L.hut[0]); R(6, 1, 12, 4, L.hut[1]); R(16, 2, 2, 2, '#a33'); }
  if (L.helm) { R(5, 1, 14, 5, L.helm[1]); R(7, 1, 10, 1, L.helm[2]); R(5, 5, 14, 1, L.helm[0]); R(6, 6, 12, 1, '#cfd6d8'); }
  S.cache[key] = c;
  return c;
};

// ---------- Objekte ----------
S.objekt = function (typ) {
  if (S.cache['o' + typ]) return S.cache['o' + typ];
  let res;
  const R = (x, a, b, w, h, col) => { x.fillStyle = col; x.fillRect(a, b, w, h); };
  if (typ === 'huette') {
    const [c, x] = U.canvas(64, 52);
    // Dach
    for (let y = 0; y < 20; y++) { const w = 22 + y * 1.0; for (let i = 0; i < w * 2; i++) { const xx = Math.round(32 - w + i); const shade = (y % 4 === 3) ? '#5e2a1e' : (U.hash(xx, y, 2) < 0.15 ? '#8e4430' : '#7a3a28'); if (xx >= 0 && xx < 64) { x.fillStyle = shade; x.fillRect(xx, y, 1, 1); } } }
    R(x, 0, 19, 64, 2, '#4a2016');
    // Wand aus Holzbrettern
    for (let yy = 21; yy < 50; yy++) for (let xx = 5; xx < 59; xx++) { x.fillStyle = (xx % 5 === 0) ? '#4b3020' : (U.hash(xx, yy, 6) < 0.1 ? '#7a5234' : '#6a4529'); x.fillRect(xx, yy, 1, 1); }
    R(x, 5, 49, 54, 2, '#3a2418');
    // Tür
    R(x, 27, 32, 10, 18, '#3e2616'); R(x, 28, 33, 8, 17, '#5a3820'); R(x, 34, 41, 1, 2, '#d9b45a');
    // Fenster mit warmem Licht
    R(x, 11, 28, 10, 9, '#3a2418'); R(x, 12, 29, 8, 7, '#f2c66a'); R(x, 15, 29, 1, 7, '#3a2418'); R(x, 12, 32, 8, 1, '#3a2418'); R(x, 12, 29, 3, 2, '#fbe3a2');
    R(x, 43, 28, 10, 9, '#3a2418'); R(x, 44, 29, 8, 7, '#f2c66a'); R(x, 47, 29, 1, 7, '#3a2418'); R(x, 44, 32, 8, 1, '#3a2418');
    // Schild
    R(x, 24, 23, 16, 6, '#e8dcc0'); R(x, 24, 23, 16, 1, '#fff6dc'); x.fillStyle = '#2f5a2f'; for (let i = 0; i < 10; i++) x.fillRect(26 + i + (i > 4 ? 1 : 0), 25 + (i % 2), 1, 1);
    // Geweih über der Tür
    x.fillStyle = '#d8c8a4'; [[29, 29], [30, 28], [28, 28], [34, 29], [33, 28], [35, 28], [31, 30], [32, 30]].forEach(p => x.fillRect(p[0], p[1], 1, 1));
    res = { img: c, ax: 32, ay: 50, block: [6, 22, 52, 28] };
  } else if (typ === 'polter') {
    const [c, x] = U.canvas(48, 24);
    const rows = [[0, 7], [1, 6], [2, 5]];
    rows.forEach(([row, n]) => {
      for (let i = 0; i < n; i++) {
        const cx = 5 + row * 3 + i * 6.2, cy = 20 - row * 5.5, rr = 3;
        for (let yy = -rr; yy <= rr; yy++) for (let xx = -rr; xx <= rr; xx++) {
          const d = Math.hypot(xx, yy);
          if (d > rr + 0.3) continue;
          x.fillStyle = d > rr - 0.7 ? '#6a4429' : d < 0.8 ? '#a8784a' : (Math.round(d) % 2 ? '#e2c08e' : '#d4ae7a');
          x.fillRect(Math.round(cx + xx), Math.round(cy + yy), 1, 1);
        }
      }
    });
    // Nummer aufgesprüht
    R(x, 20, 9, 1, 3, '#2f6fd6'); R(x, 22, 9, 2, 1, '#2f6fd6');
    res = { img: c, ax: 24, ay: 23, block: [2, 8, 44, 15] };
  } else if (typ === 'hochsitz') {
    const [c, x] = U.canvas(22, 40);
    R(x, 3, 12, 2, 28, '#5b3c24'); R(x, 17, 12, 2, 28, '#5b3c24');
    for (let y = 16; y < 40; y += 4) R(x, 5, y, 12, 1, '#7a5636');
    R(x, 1, 2, 20, 11, '#6a4529'); R(x, 1, 2, 20, 1, '#8a6040'); R(x, 4, 5, 14, 4, '#2a1d14');
    R(x, 0, 0, 22, 3, '#4a3a2a'); R(x, 0, 0, 22, 1, '#6b5a44');
    res = { img: c, ax: 11, ay: 39, block: [2, 34, 18, 6] };
  } else if (typ === 'bank') {
    const [c, x] = U.canvas(20, 10);
    R(x, 1, 2, 18, 2, '#8a5d36'); R(x, 1, 5, 18, 2, '#7a5030'); R(x, 2, 7, 2, 3, '#4a3020'); R(x, 16, 7, 2, 3, '#4a3020'); R(x, 1, 2, 18, 1, '#a87448');
    res = { img: c, ax: 10, ay: 9, block: [1, 5, 18, 4] };
  } else if (typ === 'wegweiser') {
    const [c, x] = U.canvas(18, 22);
    R(x, 8, 4, 2, 18, '#5b3c24');
    R(x, 2, 4, 14, 4, '#e6d6ae'); R(x, 15, 5, 2, 2, '#e6d6ae'); R(x, 2, 4, 14, 1, '#fff2cc');
    R(x, 1, 10, 13, 4, '#e6d6ae'); R(x, 0, 11, 1, 2, '#e6d6ae');
    x.fillStyle = '#7a2a1e'; for (let i = 0; i < 8; i++) { x.fillRect(4 + i, 6, 1, 1); x.fillRect(3 + i, 12, 1, 1); }
    res = { img: c, ax: 9, ay: 21, block: [7, 18, 4, 3] };
  } else if (typ === 'tafel') {
    const [c, x] = U.canvas(22, 22);
    R(x, 3, 10, 2, 12, '#5b3c24'); R(x, 17, 10, 2, 12, '#5b3c24');
    R(x, 1, 1, 20, 12, '#4a3020'); R(x, 2, 2, 18, 10, '#2f5a3a'); R(x, 3, 3, 8, 6, '#7aa86a'); R(x, 12, 3, 7, 1, '#e8e0c8'); R(x, 12, 5, 6, 1, '#e8e0c8'); R(x, 12, 7, 7, 1, '#e8e0c8');
    R(x, 0, 0, 22, 2, '#3a2418');
    res = { img: c, ax: 11, ay: 21, block: [2, 18, 18, 4] };
  } else if (typ === 'auto') {
    const [c, x] = U.canvas(30, 20);
    R(x, 1, 6, 28, 10, '#3f6a3a'); R(x, 1, 6, 28, 1, '#5c8a52'); R(x, 4, 1, 14, 6, '#3f6a3a'); R(x, 5, 2, 12, 4, '#9cc4d0'); R(x, 11, 2, 1, 4, '#3f6a3a');
    R(x, 19, 7, 9, 2, '#2c4a2a'); R(x, 3, 14, 6, 6, '#1e1e1e'); R(x, 21, 14, 6, 6, '#1e1e1e'); R(x, 5, 16, 2, 2, '#777'); R(x, 23, 16, 2, 2, '#777');
    R(x, 27, 9, 2, 2, '#f6e08a');
    res = { img: c, ax: 15, ay: 19, block: [1, 8, 28, 12] };
  } else if (typ === 'aufnahmepunkt') {
    const [c, x] = U.canvas(6, 20);
    for (let y = 0; y < 18; y++) R(x, 2, y, 2, 1, Math.floor(y / 3) % 2 ? '#f2f0ea' : '#d23a2a');
    R(x, 1, 18, 4, 2, '#5b3c24');
    res = { img: c, ax: 3, ay: 19, block: null };
  }
  S.cache['o' + typ] = res;
  return res;
};

// Reh (Rehwild), 12x10, frame 0 grasend, 1 stehend
S.reh = function (frame, links) {
  const key = 'reh' + frame + (links ? 'l' : 'r');
  if (S.cache[key]) return S.cache[key];
  const [c, x] = U.canvas(14, 11);
  const R = (a, b, w, h, col) => { x.fillStyle = col; x.fillRect(links ? 14 - a - w : a, b, w, h); };
  R(2, 3, 8, 4, '#9a5a2e'); R(2, 3, 8, 1, '#b8743e'); R(2, 6, 8, 1, '#7a4422');
  R(1, 3, 2, 3, '#efe6d4');                                  // heller Spiegel hinten
  R(3, 7, 1, 4, '#5a3418'); R(5, 7, 1, 4, '#6a3c1c'); R(8, 7, 1, 4, '#5a3418'); R(9, 7, 1, 4, '#6a3c1c');
  if (frame === 0) { R(10, 5, 2, 2, '#9a5a2e'); R(11, 7, 2, 2, '#8a4e28'); R(12, 8, 1, 1, '#2a1a10'); }
  else { R(10, 1, 2, 4, '#9a5a2e'); R(10, 0, 3, 2, '#8a4e28'); R(12, 1, 1, 1, '#2a1a10'); R(10, 0, 1, 1, '#5a3418'); }
  S.cache[key] = c; return c;
};
