// Forstkarte: dieselben Weltdaten, gezeichnet wie eine Revierkarte
'use strict';

const K = {};

K.FARBE = { laub: '#e4ecd2', nadel: '#d6e4d6', sand: '#ece6cc', papier: '#f6f3e8' };

// Statischer Teil wird einmal vorberechnet (in Kachel-Auflösung * f)
K.basis = null;
K.vorbereiten = function () {
  const f = 10;                                 // Pixel pro Kachel auf der Karte
  const w = W.MW * f, h = W.MH * f;
  const [c, x] = U.canvas(w, h);
  x.imageSmoothingEnabled = true;
  x.fillStyle = K.FARBE.papier; x.fillRect(0, 0, w, h);
  // Bestandesflächen
  for (let ty = 0; ty < W.MH; ty++) for (let tx = 0; tx < W.MW; tx++) {
    const s = W.STAENDE[W.bestand[ty * W.MW + tx]];
    const px = tx * W.T + 8, py = ty * W.T + 8;
    if (W.lichtung(px, py)) continue;
    x.fillStyle = K.FARBE[s.boden] || K.FARBE.laub;
    x.fillRect(tx * f, ty * f, f, f);
  }
  // Höhenlinien (Marching über Kachelgitter, einfache Punktdarstellung)
  x.fillStyle = 'rgba(150,110,70,0.55)';
  const sub = 3;
  for (let ty = 0; ty < W.MH * sub; ty++) for (let tx = 0; tx < W.MW * sub; tx++) {
    const a = W.hoehe(tx / sub, ty / sub), b = W.hoehe((tx + 1) / sub, ty / sub), c2 = W.hoehe(tx / sub, (ty + 1) / sub);
    const lv = v => Math.floor(v * 14);
    if (lv(a) !== lv(b) || lv(a) !== lv(c2)) { const strong = lv(Math.max(a, b, c2)) % 5 === 0; x.fillStyle = strong ? 'rgba(140,96,56,0.75)' : 'rgba(170,130,90,0.45)'; x.fillRect(tx * f / sub, ty * f / sub, strong ? 1.6 : 1.1, strong ? 1.6 : 1.1); }
  }
  // Baumsymbole je Bestand (Raster)
  x.lineWidth = 1; x.strokeStyle = '#4a7a40';
  for (let ty = 1; ty < W.MH; ty += 2) for (let tx = 1 + (ty % 4 === 1 ? 1 : 0); tx < W.MW; tx += 2) {
    const px = tx * W.T, py = ty * W.T;
    if (W.lichtung(px, py) || W.wegDist(px, py) < 20 || W.bachDist(px, py) < 16) continue;
    const nah = W.baeumeNahe(px, py, 28)[0];
    if (!nah) continue;
    const nadel = nah.art === 'fichte' || nah.art === 'waldkiefer';
    const cx = tx * f, cy = ty * f;
    x.beginPath();
    if (nadel) { x.moveTo(cx - 3, cy + 2.5); x.lineTo(cx, cy - 3); x.lineTo(cx + 3, cy + 2.5); }
    else x.arc(cx, cy, 2.6, 0, Math.PI * 2);
    x.stroke();
  }
  // Bach
  x.strokeStyle = '#3d7fb0'; x.lineWidth = 3; x.lineJoin = 'round';
  x.beginPath(); W.BACH.forEach((p, i) => i ? x.lineTo(p[0] * f, p[1] * f) : x.moveTo(p[0] * f, p[1] * f)); x.stroke();
  // Wege (Doppellinie)
  W.WEGE.forEach(wg => {
    x.lineCap = 'round';
    x.strokeStyle = '#2b2b2b'; x.lineWidth = 6; x.beginPath(); wg.pts.forEach((p, i) => i ? x.lineTo(p[0] * f, p[1] * f) : x.moveTo(p[0] * f, p[1] * f)); x.stroke();
    x.strokeStyle = '#fbf6e4'; x.lineWidth = 3.6; x.stroke();
  });
  // Abteilungsgrenzen (wo der Bestand wechselt)
  x.fillStyle = '#b0413a';
  for (let ty = 0; ty < W.MH; ty++) for (let tx = 0; tx < W.MW; tx++) {
    const b = W.bestand[ty * W.MW + tx];
    if (tx + 1 < W.MW && W.bestand[ty * W.MW + tx + 1] !== b && (ty % 2 === 0)) x.fillRect((tx + 1) * f - 1, ty * f, 2, f * 0.7);
    if (ty + 1 < W.MH && W.bestand[(ty + 1) * W.MW + tx] !== b && (tx % 2 === 0)) x.fillRect(tx * f, (ty + 1) * f - 1, f * 0.7, 2);
  }
  // Abteilungsnummern
  W.STAENDE.forEach(s => {
    x.font = 'italic 700 22px Alegreya, Georgia, serif'; x.fillStyle = '#b0413a'; x.textAlign = 'center';
    x.fillText(s.nr, s.seed[0] * f, s.seed[1] * f);
    x.font = '11px "IBM Plex Mono", monospace'; x.fillStyle = '#7a3a30';
    x.fillText(STUFEN[s.stufe] + ' · ' + s.alter + ' J.', s.seed[0] * f, s.seed[1] * f + 14);
  });
  // Lichtungen beschriften
  x.font = 'italic 12px Alegreya, Georgia, serif'; x.fillStyle = '#4a5a3a';
  x.fillText('Wildwiese', 50 * f, 26 * f);
  x.fillText('Wanderparkplatz', 90 * f, 43 * f);
  x.fillText('Schaich', 20 * f, 32 * f);
  x.font = '11px "IBM Plex Mono", monospace'; x.fillStyle = '#333';
  x.fillText('↑ Bebenhausen', 43 * f, 2.2 * f);
  // Gebäude
  x.fillStyle = '#222'; x.fillRect(9 * f, 51 * f, 18, 14);
  x.font = '11px "IBM Plex Mono", monospace'; x.textAlign = 'left'; x.fillText('Revierbüro', 9 * f + 22, 52 * f + 6);
  x.fillStyle = '#2a5bb0'; x.font = '700 14px sans-serif'; x.fillText('P', 91.2 * f, 46.8 * f);
  // Hochsitz-Symbol
  x.strokeStyle = '#222'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(54.5 * f - 5, 22.5 * f + 5); x.lineTo(54.5 * f, 22.5 * f - 5); x.lineTo(54.5 * f + 5, 22.5 * f + 5); x.stroke();
  K.basis = c; K.f = f;
};

// Karte in ein sichtbares Canvas zeichnen, mit Spieler und Aufträgen
K.zeichnen = function (cv, spieler, ziele, zeit) {
  const ctx = cv.getContext('2d');
  const sc = Math.min(cv.width / K.basis.width, cv.height / K.basis.height);
  const ox = (cv.width - K.basis.width * sc) / 2, oy = (cv.height - K.basis.height * sc) / 2;
  ctx.fillStyle = K.FARBE.papier; ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(K.basis, ox, oy, K.basis.width * sc, K.basis.height * sc);
  const toMap = (x, y) => [ox + (x / W.T) * K.f * sc, oy + (y / W.T) * K.f * sc];
  // Ziele
  (ziele || []).forEach((z, i) => {
    const [mx, my] = toMap(z.x, z.y);
    ctx.fillStyle = z.erledigt ? 'rgba(80,120,80,0.6)' : '#d4462f';
    ctx.beginPath(); ctx.arc(mx, my, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = '700 11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(z.erledigt ? '✓' : String(z.nr), mx, my + 0.5);
  });
  // Spieler
  if (spieler) {
    const [mx, my] = toMap(spieler.x, spieler.y);
    const pulse = 6 + Math.sin(zeit * 4) * 2;
    ctx.strokeStyle = 'rgba(232,163,58,0.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(mx, my, pulse + 4, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#e8a33a'; ctx.beginPath(); ctx.arc(mx, my, 5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#3a2a10'; ctx.lineWidth = 1.5; ctx.stroke();
  }
  ctx.textBaseline = 'alphabetic';
  return { toMap, sc, ox, oy };
};
