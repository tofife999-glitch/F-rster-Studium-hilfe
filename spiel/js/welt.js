// Die Spielwelt: ein Revierausschnitt im Schönbuch.
// Wege, Bach, Bestände, Bäume und Objekte werden mit festem Startwert erzeugt, damit die Welt jedes Mal gleich aussieht.
'use strict';

const W = {};
W.T = 16;           // Kachelgröße in Pixeln
W.MW = 96; W.MH = 64;
W.PW = W.MW * W.T; W.PH = W.MH * W.T;

// Linienzüge in Kachelkoordinaten
W.WEGE = [
  { name: 'Hauptweg', pts: [[6, 55], [12, 54], [20, 52], [30, 50], [40, 48.5], [50, 48], [60, 48.6], [70, 50], [80, 48.5], [92, 46]] },
  { name: 'Bebenhäuser Weg', pts: [[30, 50], [31.5, 42], [34, 32], [37, 22], [41, 12], [43, 1]] },
  { name: 'Hangweg', pts: [[60, 48.6], [63, 40], [70, 32], [80, 26], [95, 22]] }
];
W.BACH = [[0, 30], [10, 32], [25, 35], [36, 41], [45, 45], [52, 50], [60, 56], [70, 61], [78, 64]];

// Bestände (Abteilungen). anteile = Baumartenanteile, stufe = Entwicklungsstufe
W.STAENDE = [
  { nr: '11', name: 'Buchen-Altholz', seed: [16, 18], anteile: { rotbuche: 0.88, traubeneiche: 0.12 }, stufe: 'baumholz', alter: 140, boden: 'laub' },
  { nr: '12', name: 'Eichen-Hainbuchen-Bestand', seed: [56, 14], anteile: { traubeneiche: 0.55, hainbuche: 0.4, rotbuche: 0.05 }, stufe: 'baumholz', alter: 165, boden: 'laub' },
  { nr: '13', name: 'Fichten-Stangenholz', seed: [82, 34], anteile: { fichte: 0.92, rotbuche: 0.08 }, stufe: 'stangenholz', alter: 45, boden: 'nadel' },
  { nr: '14', name: 'Kiefern auf Stubensandstein', seed: [10, 40], anteile: { waldkiefer: 0.8, rotbuche: 0.2 }, stufe: 'baumholz', alter: 115, boden: 'sand' },
  { nr: '15', name: 'Buchen-Dickung', seed: [26, 60], anteile: { rotbuche: 1 }, stufe: 'dickung', alter: 18, boden: 'laub' },
  { nr: '16', name: 'Buchen-Fichten-Eichen-Mischbestand', seed: [72, 58], anteile: { rotbuche: 0.42, fichte: 0.33, traubeneiche: 0.25 }, stufe: 'baumholz', alter: 95, boden: 'laub' },
  { nr: '17', name: 'Eichen-Buchen-Bestand am Hang', seed: [40, 30], anteile: { traubeneiche: 0.5, rotbuche: 0.35, hainbuche: 0.15 }, stufe: 'baumholz', alter: 120, boden: 'laub' }
];

W.LICHTUNGEN = [
  { name: 'Revierbüro', c: [10, 54], r: 6.5 },
  { name: 'Wildwiese', c: [50, 26], r: 6 },
  { name: 'Wanderparkplatz', c: [90, 45], r: 4.5 }
];

W.erzeugen = function () {
  const T = W.T;
  const r = U.rng(4242);
  // --- Bestandeskarte je Kachel (Voronoi mit verrauschtem Abstand)
  W.bestand = new Int8Array(W.MW * W.MH).fill(-1);
  for (let y = 0; y < W.MH; y++) for (let x = 0; x < W.MW; x++) {
    let best = -1, bd = Infinity;
    W.STAENDE.forEach((s, i) => {
      const d = Math.hypot(x - s.seed[0], y - s.seed[1]) * (0.85 + U.fbm(x / 9, y / 9, i * 5 + 1, 2) * 0.4);
      if (d < bd) { bd = d; best = i; }
    });
    W.bestand[y * W.MW + x] = best;
  }
  // --- Felder für Weg/Bach/Lichtung (in Pixeln)
  const wegePx = W.WEGE.map(w => w.pts.map(p => [p[0] * T, p[1] * T]));
  const bachPx = W.BACH.map(p => [p[0] * T, p[1] * T]);
  W.wegDist = (x, y) => Math.min(...wegePx.map(p => U.polyDist(x, y, p)));
  W.bachDist = (x, y) => U.polyDist(x, y, bachPx);
  W.lichtung = (x, y) => {
    for (const l of W.LICHTUNGEN) {
      const d = Math.hypot(x / T - l.c[0], y / T - l.c[1]);
      if (d < l.r + (U.noise(x / 40, y / 40, 9) - 0.5) * 2.5) return l;
    }
    return null;
  };
  W.standAt = (x, y) => {
    const tx = U.clamp(Math.floor(x / T), 0, W.MW - 1), ty = U.clamp(Math.floor(y / T), 0, W.MH - 1);
    return W.STAENDE[W.bestand[ty * W.MW + tx]];
  };

  // --- Begehbarkeits-Raster (4 px)
  W.G = 4; W.GW = W.PW / W.G; W.GH = W.PH / W.G;
  W.block = new Uint8Array(W.GW * W.GH);
  W.wasserGrid = new Uint8Array(W.GW * W.GH);
  W.wegGrid = new Uint8Array(W.GW * W.GH);
  for (let gy = 0; gy < W.GH; gy++) for (let gx = 0; gx < W.GW; gx++) {
    const x = gx * W.G + 2, y = gy * W.G + 2;
    const dW = W.bachDist(x, y), dR = W.wegDist(x, y);
    const i = gy * W.GW + gx;
    if (dR < 15) W.wegGrid[i] = 1;
    if (dW < 9 + U.noise(x / 30, y / 30, 3) * 3) { W.wasserGrid[i] = 1; if (dR >= 13) W.block[i] = 1; }
  }
  W.istWeg = (x, y) => W.wegGrid[(Math.floor(y / W.G)) * W.GW + Math.floor(x / W.G)] === 1;

  // --- Bäume
  W.baeume = [];
  const spacing = { baumholz: 46, stangenholz: 28, dickung: 10 };
  let id = 0;
  for (let si = 0; si < W.STAENDE.length; si++) {
    const s = W.STAENDE[si];
    const sp = spacing[s.stufe];
    for (let y = sp / 2; y < W.PH; y += sp) for (let x = sp / 2; x < W.PW; x += sp) {
      const jx = x + (r() - 0.5) * sp * 0.9, jy = y + (r() - 0.5) * sp * 0.9;
      if (jx < 8 || jy < 20 || jx > W.PW - 8 || jy > W.PH - 4) continue;
      if (W.STAENDE[W.bestand[Math.floor(jy / T) * W.MW + Math.floor(jx / T)]] !== s) continue;
      if (W.wegDist(jx, jy) < 24 || W.bachDist(jx, jy) < 16 || W.lichtung(jx, jy)) continue;
      // Art nach Anteilen
      let q = r(), art = 'rotbuche';
      for (const [a, p] of Object.entries(s.anteile)) { if (q < p) { art = a; break; } q -= p; }
      let g = s.stufe === 'baumholz' ? 'alt' : s.stufe === 'stangenholz' ? 'mittel' : 'jung';
      if (s.nr === '12' && art === 'hainbuche') g = 'mittel';            // Hainbuche als Zwischenstand
      if (s.nr === '14' && art === 'rotbuche') g = r() < 0.6 ? 'jung' : 'mittel'; // Buchen-Unterstand
      if (g === 'alt' && r() < 0.12) g = 'mittel';
      W.baeume.push({ id: id++, x: Math.round(jx), y: Math.round(jy), art, g, v: Math.floor(r() * 3), bestand: s.nr, phase: r() * 6.28 });
    }
  }
  // Einzelbäume an Lichtungsrändern
  for (let i = 0; i < 70; i++) {
    const l = W.LICHTUNGEN[i % 3], a = r() * 6.28, d = (l.r + 0.8) * T;
    const x = l.c[0] * T + Math.cos(a) * d, y = l.c[1] * T + Math.sin(a) * d;
    if (W.wegDist(x, y) < 26 || W.bachDist(x, y) < 18 || x < 10 || y < 24 || x > W.PW - 10 || y > W.PH - 6) continue;
    const s = W.standAt(x, y);
    W.baeume.push({ id: id++, x: Math.round(x), y: Math.round(y), art: s.anteile.waldkiefer ? 'waldkiefer' : (r() < 0.5 ? 'rotbuche' : 'traubeneiche'), g: 'alt', v: Math.floor(r() * 3), bestand: s.nr, phase: r() * 6.28 });
  }

  // --- Objekte
  const O = (typ, tx, ty, extra) => Object.assign({ typ, x: Math.round(tx * T), y: Math.round(ty * T) }, extra || {});
  W.objekte = [
    O('huette', 9.5, 52.2, { name: 'Revierbüro', aktion: 'buero' }),
    O('auto', 14.5, 51.6, { name: 'Forstauto' }),
    O('polter', 61.5, 47.0, { name: 'Holzpolter' }),
    O('hochsitz', 54.5, 22.5, { name: 'Hochsitz', aktion: 'hochsitz' }),
    O('bank', 47, 29.5, { name: 'Bank an der Wildwiese', aktion: 'bank' }),
    O('wegweiser', 44.2, 2.6, { name: 'Wegweiser „Bebenhausen 3 km“', aktion: 'ort', ort: 'bebenhausen' }),
    O('wegweiser', 53.3, 46.6, { name: 'Wegweiser „Schaichtal“', aktion: 'ort', ort: 'schaichtal' }),
    O('tafel', 88, 42.6, { name: 'Infotafel Naturpark Schönbuch', aktion: 'ort', ort: 'schoenbuch' }),
    O('auto', 91.5, 47.6, { name: 'Auto der Wanderin' })
  ];
  // Bäume, die Objekte überdecken würden, entfernen
  W.baeume = W.baeume.filter(b => !W.objekte.some(o => Math.abs(b.x - o.x) < 36 && b.y > o.y - 50 && b.y < o.y + 30));

  // Blockierungen eintragen
  const blockRect = (x0, y0, w, h) => {
    for (let y = Math.floor(y0 / W.G); y < Math.ceil((y0 + h) / W.G); y++) for (let x = Math.floor(x0 / W.G); x < Math.ceil((x0 + w) / W.G); x++) if (x >= 0 && y >= 0 && x < W.GW && y < W.GH) W.block[y * W.GW + x] = 1;
  };
  W.objekte.forEach(o => { const sp = S.objekt(o.typ); if (sp.block) blockRect(o.x - sp.ax + sp.block[0], o.y - sp.ay + sp.block[1], sp.block[2], sp.block[3]); });
  W.baeume.forEach(b => { if (b.g !== 'jung') { const rr = b.g === 'alt' ? 3 : 2; blockRect(b.x - rr, b.y - 3, rr * 2, 4); } });

  // Räumlicher Index für Bäume (pro Kachel)
  W.baumIndex = new Map();
  W.baeume.forEach(b => { const k = Math.floor(b.x / T) + ',' + Math.floor(b.y / T); if (!W.baumIndex.has(k)) W.baumIndex.set(k, []); W.baumIndex.get(k).push(b); });

  W.bodenZeichnen();
};

W.begehbar = function (x, y) {
  if (x < 4 || y < 8 || x >= W.PW - 4 || y >= W.PH - 2) return false;
  return W.block[Math.floor(y / W.G) * W.GW + Math.floor(x / W.G)] === 0;
};

W.baeumeNahe = function (x, y, rad) {
  const T = W.T, res = [];
  for (let ty = Math.floor((y - rad) / T); ty <= Math.floor((y + rad) / T); ty++) for (let tx = Math.floor((x - rad) / T); tx <= Math.floor((x + rad) / T); tx++) {
    const l = W.baumIndex.get(tx + ',' + ty);
    if (l) l.forEach(b => { const d = Math.hypot(b.x - x, b.y - y); if (d <= rad) res.push([d, b]); });
  }
  return res.sort((a, b) => a[0] - b[0]).map(e => e[1]);
};

// Höhe für die Höhenlinien der Forstkarte (0..1), Tal entlang des Bachs
W.hoehe = function (tx, ty) {
  const dW = W.bachDist(tx * W.T, ty * W.T) / W.T;
  return 0.55 * U.fbm(tx / 26, ty / 26, 31, 3) + 0.45 * Math.min(1, dW / 28);
};

// --- Bodenbild einmal vorberechnen
W.bodenZeichnen = function () {
  const [c, ctx] = U.canvas(W.PW, W.PH);
  const img = ctx.createImageData(W.PW, W.PH);
  const d = img.data;
  const pal = {
    laub: ['#574426', '#68502c', '#7a5c33', '#8c6a3a', '#9e7840'],
    nadel: ['#3a2c1d', '#463420', '#553f27', '#634a2e', '#6e5434'],
    sand: ['#7d6e46', '#8f7e4e', '#a08d58', '#b09c64', '#c0ab72'],
    gras: ['#5a7a32', '#688a38', '#769a40', '#86a84a', '#96b656'],
    weg: ['#8f8574', '#a39884', '#b5aa94', '#c4baa4', '#d2c8b2'],
    wasser: ['#1f4a5a', '#255a6a', '#2d6b7a', '#3a7e8a', '#5a9aa0'],
    ufer: ['#3e3a2a', '#4a4432', '#56503a', '#625b42', '#6e664a'],
    bruecke: ['#5a3c24', '#6a4729', '#7a5230', '#8a5e38', '#9a6b42']
  };
  const laubFarben = ['#c4622a', '#d98a32', '#b04a22', '#e2a840', '#a8862a'].map(U.hex);
  const P = {}; for (const k in pal) P[k] = pal[k].map(U.hex);
  for (let y = 0; y < W.PH; y++) {
    for (let x = 0; x < W.PW; x++) {
      const gi = Math.floor(y / W.G) * W.GW + Math.floor(x / W.G);
      let typ;
      const nearW = W.wasserGrid[gi], nearR = W.wegGrid[gi];
      if (nearW && nearR) typ = 'bruecke';
      else if (nearW) typ = 'wasser';
      else if (nearR) {
        const dR = W.wegDist(x, y);
        typ = dR < 12 + U.noise(x / 6, y / 6, 2) * 2 ? 'weg' : 'gras';
      } else if (W.lichtung(x, y)) typ = 'gras';
      else {
        const s = W.standAt(x, y);
        typ = s.boden;
        // Uferstreifen
        if (W.bachDist(x, y) < 16) typ = 'ufer';
      }
      const ramp = P[typ];
      let n = U.fbm(x / 22, y / 22, 7, 3) * 0.7 + U.hash(x, y, 1) * 0.3;
      if (typ === 'wasser') n = 0.3 + U.noise(x / 10, y / 3, 5) * 0.5;
      if (typ === 'bruecke') n = (y % 4 === 0) ? 0.05 : 0.5 + U.hash(x >> 2, y >> 2, 3) * 0.4;
      if (typ === 'weg') n = U.noise(x / 8, y / 8, 8) * 0.5 + U.hash(x, y, 4) * 0.5;
      let col = ramp[U.clamp(Math.floor(n * ramp.length), 0, ramp.length - 1)];
      // Herbstlaub-Sprenkel und Nadelstreu
      if (typ === 'laub' && U.hash(x, y, 11) < 0.11) col = laubFarben[Math.floor(U.hash(x, y, 12) * 5)];
      if (typ === 'nadel' && U.hash(x, y, 13) < 0.05) col = U.hex('#8a4a26');
      if (typ === 'sand' && U.fbm(x / 14, y / 14, 21, 2) > 0.58 && U.hash(x, y, 14) < 0.45) col = U.hex(U.hash(x, y, 15) < 0.45 ? '#8a5a7e' : (U.hash(x, y, 16) < 0.5 ? '#4a7a3a' : '#5e8a44'));   // Heidekraut und Heidelbeere
      if (typ === 'gras' && U.hash(x, y, 16) < 0.06) col = U.hex('#a8b860');
      const o = (y * W.PW + x) * 4;
      d[o] = col[0]; d[o + 1] = col[1]; d[o + 2] = col[2]; d[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);

  // Brückengeländer
  ctx.fillStyle = '#3a2416';
  for (let gy = 0; gy < W.GH; gy++) for (let gx = 0; gx < W.GW; gx++) {
    const i = gy * W.GW + gx;
    if (W.wasserGrid[i] && W.wegGrid[i] && (!W.wegGrid[i - W.GW] || !W.wegGrid[i + W.GW])) ctx.fillRect(gx * W.G, gy * W.G, W.G, 2);
  }

  // Deko auf dem Boden
  const r = U.rng(99);
  const deko = (fn, n) => { for (let i = 0; i < n; i++) { const x = Math.floor(r() * W.PW), y = Math.floor(r() * W.PH); const gi = Math.floor(y / W.G) * W.GW + Math.floor(x / W.G); if (W.wasserGrid[gi] || W.wegGrid[gi]) continue; fn(x, y, r); } };
  const p = (x, y, col) => { ctx.fillStyle = col; ctx.fillRect(x, y, 1, 1); };
  // Farne
  deko((x, y) => {
    const s = W.standAt(x, y); if (W.lichtung(x, y) || s.boden === 'sand' && r() < 0.6) return;
    const herbst = r() < 0.5, c1 = herbst ? '#a8742a' : '#4f7a32', c2 = herbst ? '#c8923a' : '#6a9a42';
    for (let a = 0; a < 5; a++) { const ang = -Math.PI / 2 + (a - 2) * 0.5; for (let t = 0; t < 7; t++) { p(Math.round(x + Math.cos(ang) * t), Math.round(y + Math.sin(ang) * t * 0.8), t % 2 ? c1 : c2); } }
  }, 1500);
  // Moospolster
  deko((x, y) => { for (let i = 0; i < 14; i++) p(x + Math.floor(r() * 6), y + Math.floor(r() * 3), r() < 0.5 ? '#4f7a2a' : '#6a9636'); }, 900);
  // Steine (Stubensandstein)
  deko((x, y) => { ctx.fillStyle = '#7a6e58'; ctx.fillRect(x, y + 1, 7, 4); ctx.fillStyle = '#b8aa88'; ctx.fillRect(x + 1, y, 5, 4); ctx.fillStyle = '#d4c8a6'; ctx.fillRect(x + 1, y, 3, 1); }, 160);
  // Totholz-Stämme
  deko((x, y) => {
    if (W.lichtung(x, y)) return;
    const len = 18 + Math.floor(r() * 18);
    ctx.fillStyle = '#3e2c1e'; ctx.fillRect(x, y + 3, len, 1);
    ctx.fillStyle = '#6a5038'; ctx.fillRect(x, y, len, 3); ctx.fillStyle = '#86684a'; ctx.fillRect(x, y, len, 1);
    ctx.fillStyle = '#c8a878'; ctx.fillRect(x + len, y, 2, 3); ctx.fillStyle = '#5a7a32'; for (let i = 0; i < len; i += 3) if (r() < 0.5) ctx.fillRect(x + i, y - 1, 2, 1);
  }, 70);
  // Pilze
  deko((x, y) => {
    const fl = r() < 0.4;
    ctx.fillStyle = '#efe6d4'; ctx.fillRect(x + 1, y + 2, 1, 2);
    ctx.fillStyle = fl ? '#d0322a' : '#7a4a26'; ctx.fillRect(x, y, 3, 2);
    if (fl) { ctx.fillStyle = '#fff'; ctx.fillRect(x, y, 1, 1); ctx.fillRect(x + 2, y + 1, 1, 1); }
  }, 260);
  // Gräser und Blumen auf Lichtungen und am Wegrand
  for (let i = 0; i < 9000; i++) {
    const x = Math.floor(r() * W.PW), y = Math.floor(r() * W.PH);
    const gi = Math.floor(y / W.G) * W.GW + Math.floor(x / W.G);
    if (W.wasserGrid[gi]) continue;
    const dR = W.wegDist(x, y);
    const ok = W.lichtung(x, y) || (dR > 12 && dR < 18);
    if (!ok) continue;
    if (r() < 0.06) { p(x, y, ['#e8e0f0', '#c86ab0', '#f2d24a', '#ffffff'][Math.floor(r() * 4)]); p(x, y + 1, '#3e6a2a'); }
    else { p(x, y, '#7a9a3a'); p(x, y - 1, '#94b44a'); if (r() < 0.5) p(x + 1, y - 2, '#a8c25a'); }
  }
  // Baumschatten
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = '#10140c';
  W.baeume.forEach(b => {
    const rr = b.g === 'alt' ? 18 : b.g === 'mittel' ? 11 : 5;
    ctx.beginPath(); ctx.ellipse(b.x + rr * 0.35, b.y + 1, rr, rr * 0.42, 0, 0, Math.PI * 2); ctx.fill();
  });
  ctx.globalAlpha = 1;
  W.boden = c;

  // Lichtflecken (Sonnenflecken durchs Kronendach)
  const [lc, lx] = U.canvas(W.PW, W.PH);
  for (let i = 0; i < 2200; i++) {
    const x = r() * W.PW, y = r() * W.PH;
    const offen = W.lichtung(x, y) || W.wegDist(x, y) < 20;
    const rad = offen ? 18 + r() * 24 : 4 + r() * 12;
    const g = lx.createRadialGradient(x, y, 0, x, y, rad);
    const a = offen ? 0.12 : 0.2 + r() * 0.12;
    g.addColorStop(0, `rgba(255,236,170,${a})`); g.addColorStop(1, 'rgba(255,236,170,0)');
    lx.fillStyle = g; lx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  W.licht = lc;
};
