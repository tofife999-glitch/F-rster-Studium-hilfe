// Hauptspiel: Laufen, Aufträge, Gespräche, Feldbuch, Tagesablauf
'use strict';

const SPIEL = {};
let st = null;                       // Spielstand
const spieler = { x: 0, y: 0, dir: 0, frame: 0, weg: 0 };
const tasten = new Set();
let canvas, ctx, skala = 3, BW = 400, BH = 240;
let kam = { x: 0, y: 0 };
let zeit = 0, letzt = 0, minutenAkku = 0;
let blaetter = [];
let vignette = null;
let ziel = null;                     // aktuelles Ziel für den Pfeil
let interaktion = null;
let warnungAbend = false;
const rehe = [
  { x: 49 * 16, y: 27 * 16, dir: 1, frame: 0, t: 0, flucht: 0, weg: false },
  { x: 52 * 16, y: 25.5 * 16, dir: 0, frame: 0, t: 1.5, flucht: 0, weg: false },
  { x: 47.5 * 16, y: 25 * 16, dir: 0, frame: 1, t: 3, flucht: 0, weg: false }
];

const BUERO = { x: 152, y: 852 };
const NPC = {
  buehler:  { x: 188, y: 856, dir: 1 },
  wanderin: { x: 1400, y: 728, dir: 1 },
  arbeiter: { x: 1018, y: 756, dir: 1 }
};

// ---------------- Start ----------------
SPIEL.start = function () {
  canvas = $('welt'); ctx = canvas.getContext('2d');
  W.erzeugen();
  K.vorbereiten();
  st = L.laden();
  const neu = !st;
  if (neu) { st = L.neu(); auftraegeErzeugen(); }
  if (!st.heuteBestimmt) st.heuteBestimmt = [];
  markierungenSetzen();
  if (st.spieler) { spieler.x = st.spieler.x; spieler.y = st.spieler.y; } else { spieler.x = BUERO.x; spieler.y = BUERO.y + 6; }
  kam.x = spieler.x; kam.y = spieler.y;
  groesse(); window.addEventListener('resize', groesse);
  hudAktualisieren();
  $('laden').remove();
  $('k-karte').onclick = () => karteZeigen();
  $('k-buch').onclick = () => wissensbuch();
  $('k-hilfe').onclick = () => hilfe();
  requestAnimationFrame(schleife);
  if (neu) intro();
  else if (st.morgen) posteingang();
};

function groesse() {
  const w = window.innerWidth, h = window.innerHeight;
  skala = Math.max(2, Math.round(Math.min(w / 420, h / 250)));
  BW = Math.ceil(w / skala); BH = Math.ceil(h / skala);
  canvas.width = BW; canvas.height = BH;
  canvas.style.width = BW * skala + 'px'; canvas.style.height = BH * skala + 'px';
  ctx.imageSmoothingEnabled = false;
  const [vc, vx] = U.canvas(BW, BH);
  const g = vx.createRadialGradient(BW / 2, BH / 2, Math.min(BW, BH) * 0.35, BW / 2, BH / 2, Math.max(BW, BH) * 0.75);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(10,14,6,0.32)');
  vx.fillStyle = g; vx.fillRect(0, 0, BW, BH);
  vignette = vc;
}

// ---------------- Aufträge ----------------
function tagesRng() { return U.rng(st.tag * 7919 + 13); }

function baumSuchen(art, r, belegt) {
  const kand = W.baeume.filter(b => b.art === art && b.g !== 'jung' && !belegt.has(b.id) && W.wegDist(b.x, b.y) < 64 && W.wegDist(b.x, b.y) > 24);
  if (!kand.length) return null;
  return kand[Math.floor(r() * kand.length)];
}

function aufnahmepunkt(nr, r) {
  const s = W.STAENDE.find(s => s.nr === nr);
  let best = null, bd = Infinity;
  for (let i = 0; i < 1500; i++) {
    const x = (s.seed[0] + (r() - 0.5) * 30) * W.T, y = (s.seed[1] + (r() - 0.5) * 30) * W.T;
    if (x < 20 || y < 20 || x > W.PW - 20 || y > W.PH - 20) continue;
    if (W.standAt(x, y) !== s || W.lichtung(x, y) || W.bachDist(x, y) < 40) continue;
    const d = W.wegDist(x, y);
    if (d < 30 || !W.begehbar(x, y)) continue;
    const score = d + Math.hypot(x / W.T - s.seed[0], y / W.T - s.seed[1]) * 2;
    if (score < bd) { bd = score; best = { x: Math.round(x), y: Math.round(y) }; }
  }
  return best || { x: s.seed[0] * W.T, y: s.seed[1] * W.T };
}

function auftraegeErzeugen() {
  const r = tagesRng();
  const belegt = new Set();
  const A = [];
  let nr = 1;
  if (st.tag === 1) {
    const ziele = ARTEN.map(a => { const b = baumSuchen(a, r, belegt); belegt.add(b.id); return { typ: 'baum', baumId: b.id, x: b.x, y: b.y, art: a, erledigt: false }; });
    A.push({ nr: nr++, typ: 'baumarten', titel: 'Die fünf Hauptbaumarten', kurz: 'Finde die 5 Bäume mit blauem Punkt und schau sie dir an.', brief: 'Ich habe dir im Revier fünf Bäume mit einem blauen Farbpunkt markiert, von jeder unserer Hauptbaumarten einen. Schau sie dir genau an: Rinde, Blätter, Früchte. Die Karte (Taste M) zeigt dir, wo sie stehen.', ziele });
    const p = aufnahmepunkt('13', r);
    A.push({ nr: nr++, typ: 'bestand', stand: '13', titel: 'Bestandesaufnahme Abteilung 13', kurz: 'Am rot-weißen Stab in Abt. 13 das Feldbuch ausfüllen.', brief: 'In Abteilung 13 steht ein rot-weißer Stab. Schau dich dort um und trag ins Feldbuch ein, welche Baumart den Bestand prägt und wie weit er entwickelt ist.', ziele: [{ typ: 'punkt', x: p.x, y: p.y, erledigt: false }] });
    A.push({ nr: nr++, typ: 'gespraech', npc: 'arbeiter', themen: ['polter', 'holzernte'], titel: 'Forstwirt Krauß am Holzpolter', kurz: 'Am Polter am Hauptweg vorbeischauen.', brief: 'Herr Krauß hat gestern Holz an den Hauptweg gerückt. Geh mal vorbei, er zeigt dir den Polter und erklärt dir, worauf es bei der Holzernte ankommt.', ziele: [{ typ: 'npc', npc: 'arbeiter', x: NPC.arbeiter.x, y: NPC.arbeiter.y, erledigt: false }] });
    A.push({ nr: nr++, typ: 'gespraech', npc: 'wanderin', themen: ['nachhaltigkeit', 'auszeichnen'], titel: 'Fragen am Wanderparkplatz', kurz: 'Eine Wanderin hat Fragen zum Wald.', brief: 'Am Wanderparkplatz wartet eine Wanderin, die beim Revier angerufen hat. Sie hat Fragen zu den Arbeiten im Wald. Erklär ihr das, so gut du kannst.', ziele: [{ typ: 'npc', npc: 'wanderin', x: NPC.wanderin.x, y: NPC.wanderin.y, erledigt: false }] });
  } else {
    // Wiederholung: fällige Baumarten zuerst
    let arten = L.faellig(st, id => WISSEN[id].art);
    arten = U.shuffle(arten, r).concat(U.shuffle(ARTEN, r).filter(a => !arten.includes(a))).slice(0, 3);
    const ziele = arten.map(a => { const b = baumSuchen(a, r, belegt); belegt.add(b.id); return { typ: 'baum', baumId: b.id, x: b.x, y: b.y, art: a, erledigt: false }; });
    A.push({ nr: nr++, typ: 'baumarten', titel: 'Baumarten-Check', kurz: 'Drei markierte Bäume bestimmen.', brief: 'Heute habe ich dir drei Bäume markiert. Bestimme sie ohne Hilfe. Wer Baumarten sicher erkennt, kann einen Bestand richtig beurteilen.', ziele });
    const kandidaten = W.STAENDE.map(s => s.nr).filter(n => n !== (st.letzterBestand || '13'));
    const nrS = kandidaten[Math.floor(r() * kandidaten.length)];
    st.letzterBestand = nrS;
    const p = aufnahmepunkt(nrS, r);
    A.push({ nr: nr++, typ: 'bestand', stand: nrS, titel: 'Bestandesaufnahme Abteilung ' + nrS, kurz: 'Am rot-weißen Stab das Feldbuch ausfüllen.', brief: 'Nächste Aufnahme: Abteilung ' + nrS + '. Hauptbaumart und Entwicklungsstufe, wie gehabt.', ziele: [{ typ: 'punkt', x: p.x, y: p.y, erledigt: false }] });
    const themenPool = Object.keys(WISSEN).filter(id => !WISSEN[id].art && !WISSEN[id].ort && WISSEN[id].fragen.length);
    let themen = L.faellig(st, id => themenPool.includes(id));
    themen = U.shuffle(themen, r).concat(U.shuffle(themenPool, r).filter(t => !themen.includes(t))).slice(0, 2);
    const npc = st.tag % 2 ? 'wanderin' : 'arbeiter';
    A.push({ nr: nr++, typ: 'gespraech', npc, themen, titel: npc === 'wanderin' ? 'Die Wanderin ist wieder da' : 'Nachfrage von Forstwirt Krauß', kurz: 'Zwei Fragen beantworten.', brief: npc === 'wanderin' ? 'Die Wanderin vom Parkplatz hat noch Fragen. Sie freut sich, wenn du dir Zeit nimmst.' : 'Herr Krauß will wissen, ob du dir von neulich etwas gemerkt hast. Schau am Polter vorbei.', ziele: [{ typ: 'npc', npc, x: NPC[npc].x, y: NPC[npc].y, erledigt: false }] });
  }
  st.auftraege = A;
  st.aktiv = 1;
  st.morgen = true;
}

function markierungenSetzen() {
  W.baeume.forEach(b => b.mark = 0);
  st.auftraege.forEach(a => a.ziele.forEach(z => { if (z.typ === 'baum' && !z.erledigt) W.baeume[W.baeume.findIndex(b => b.id === z.baumId)].mark = a.nr; }));
}

function aktiverAuftrag() { return st.auftraege.find(a => a.nr === st.aktiv && !a.fertig) || st.auftraege.find(a => !a.fertig); }

function zielErledigt(auftrag, zielObj) {
  zielObj.erledigt = true;
  if (zielObj.typ === 'baum') { const b = W.baeume.find(b => b.id === zielObj.baumId); if (b) b.mark = 0; }
  if (auftrag.ziele.every(z => z.erledigt) && !auftrag.fertig) {
    auftrag.fertig = true;
    st.erledigtHeute.push(auftrag.nr);
    st.log.push({ typ: 'auftrag', nr: auftrag.nr });
    setTimeout(() => UI.toast('Auftrag erledigt: ' + auftrag.titel), 200);
    const naechster = st.auftraege.find(a => !a.fertig);
    if (naechster) st.aktiv = naechster.nr;
    else setTimeout(() => UI.toast('Alle Aufträge erledigt! Zurück zum Revierbüro.', 4000), 2900);
  }
  hudAktualisieren(); speichern();
}

SPIEL.antwort = function (id, ok) {
  L.antwort(st, id, ok);
  st.vertrauen = U.clamp(st.vertrauen + (ok ? 1 : -1), 0, 100);
  speichern();
};

function speichern() { st.spieler = { x: Math.round(spieler.x), y: Math.round(spieler.y) }; L.speichern(st); }

// ---------------- HUD ----------------
function uhr() { const m = Math.floor(st.minute); return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); }
function rangText() { return ['Praktikant/in', 'Student/in', 'Trainee', 'Revierleitung'][st.rang]; }

function hudAktualisieren() {
  $('hud-tag').textContent = `Tag ${st.tag} · ${uhr()}`;
  $('hud-rang').textContent = `${rangText()} · Praktikum ${Math.min(st.tag, st.praktikumTage)}/${st.praktikumTage}`;
  const s = W.standAt(spieler.x, spieler.y);
  const l = W.lichtung(spieler.x, spieler.y);
  $('hud-ort').textContent = l ? l.name : `Abt. ${s.nr} · ${s.name}`;
  const ol = $('auftragsliste');
  const akt = aktiverAuftrag();
  ol.innerHTML = st.auftraege.map(a => {
    const n = a.ziele.filter(z => z.erledigt).length;
    const fort = a.ziele.length > 1 ? ` (${n}/${a.ziele.length})` : '';
    return `<li data-nr="${a.nr}" class="${a.fertig ? 'fertig' : ''} ${akt && akt.nr === a.nr ? 'aktiv' : ''}"><span class="nr">${a.fertig ? '✓' : a.nr}</span><span>${U.esc(a.titel)}${fort}<small>${U.esc(a.kurz)}</small></span></li>`;
  }).join('') + (st.auftraege.every(a => a.fertig) ? `<li class="aktiv"><span class="nr">⌂</span><span>Feierabend<small>Zurück zum Revierbüro und mit Herrn Bühler sprechen.</small></span></li>` : '');
  ol.querySelectorAll('li[data-nr]').forEach(li => li.onclick = () => { st.aktiv = +li.dataset.nr; hudAktualisieren(); });
}

// ---------------- Schleife ----------------
function schleife(t) {
  const dt = Math.min(0.05, (t - letzt) / 1000 || 0);
  letzt = t; zeit += dt;
  if (!UI.offen()) aktualisieren(dt);
  zeichnen();
  requestAnimationFrame(schleife);
}

function aktualisieren(dt) {
  // Uhr
  minutenAkku += dt / 1.2;
  if (minutenAkku >= 1) { st.minute += Math.floor(minutenAkku); minutenAkku %= 1; hudAktualisieren(); if (Math.floor(st.minute) % 5 === 0) speichern(); }
  if (st.minute >= 17 * 60 + 30 && !warnungAbend) { warnungAbend = true; UI.toast('Es dämmert. Zeit für den Feierabend im Revierbüro.', 4000); }
  // Bewegung
  let dx = 0, dy = 0;
  if (tasten.has('ArrowLeft') || tasten.has('a')) dx -= 1;
  if (tasten.has('ArrowRight') || tasten.has('d')) dx += 1;
  if (tasten.has('ArrowUp') || tasten.has('w')) dy -= 1;
  if (tasten.has('ArrowDown') || tasten.has('s')) dy += 1;
  if (dx || dy) {
    const len = Math.hypot(dx, dy), v = (tasten.has('Shift') ? 105 : 68) * dt;
    const nx = spieler.x + dx / len * v, ny = spieler.y + dy / len * v;
    const frei = (x, y) => W.begehbar(x - 3, y) && W.begehbar(x + 3, y) && W.begehbar(x, y - 2) && !Object.values(NPC).some(n => Math.hypot(n.x - x, n.y - y) < 7);
    if (frei(nx, spieler.y)) spieler.x = nx;
    if (frei(spieler.x, ny)) spieler.y = ny;
    spieler.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : (dy < 0 ? 3 : 0);
    spieler.weg += v;
    spieler.frame = Math.floor(spieler.weg / 7) % 4;
    if (Math.floor(spieler.weg) % 40 < 2) hudAktualisieren();
  } else spieler.frame = 0;
  // Kamera
  kam.x += (spieler.x - kam.x) * Math.min(1, dt * 6);
  kam.y += (spieler.y - kam.y) * Math.min(1, dt * 6);
  // Blätter
  const s = W.standAt(spieler.x, spieler.y);
  if (s.boden !== 'nadel' && blaetter.length < 28 && Math.random() < dt * 9) {
    blaetter.push({ x: kam.x - BW / 2 + Math.random() * BW, y: kam.y - BH / 2 - 10, vx: 4 + Math.random() * 8, vy: 10 + Math.random() * 10, ph: Math.random() * 6, life: 4 + Math.random() * 3, c: ['#d98a32', '#c4622a', '#e2a840', '#b8902a'][Math.floor(Math.random() * 4)] });
  }
  blaetter.forEach(b => { b.ph += dt * 3; b.x += (b.vx + Math.sin(b.ph) * 12) * dt; b.y += b.vy * dt; b.life -= dt; });
  blaetter = blaetter.filter(b => b.life > 0);
  // Rehe an der Wildwiese: grasen, sichern, flüchten bei Annäherung
  rehe.forEach(r => {
    if (r.weg) return;
    const d = Math.hypot(r.x - spieler.x, r.y - spieler.y);
    if (d < 70 && !r.flucht) { r.flucht = 1; r.dir = r.x < spieler.x ? 1 : 0; if (!st.rehGesehen) { st.rehGesehen = 1; UI.toast('Rehwild! Es flüchtet, wenn du zu nah kommst.'); } }
    if (r.flucht) { r.x += (r.dir ? -1 : 1) * 95 * dt; r.y -= 30 * dt; r.frame = 1; r.flucht += dt; if (r.flucht > 2.5) r.weg = true; }
    else { r.t -= dt; if (r.t < 0) { r.frame = r.frame ? 0 : 1; r.t = 1.5 + Math.random() * 3; if (Math.random() < 0.3) r.dir = r.dir ? 0 : 1; } }
  });
  // Interaktion
  interaktion = interaktionFinden();
  if (interaktion) UI.hinweis(`<kbd>E</kbd>${interaktion.text}`); else UI.hinweis(null);
}

function interaktionFinden() {
  const x = spieler.x, y = spieler.y;
  for (const [k, n] of Object.entries(NPC)) if (Math.hypot(n.x - x, n.y - y) < 24) return { typ: 'npc', npc: k, text: 'Mit ' + UI.NAMEN[k] + ' sprechen' };
  for (const a of st.auftraege) for (const z of a.ziele) if (z.typ === 'punkt' && !z.erledigt && Math.hypot(z.x - x, z.y - y) < 22) return { typ: 'punkt', auftrag: a, ziel: z, text: 'Feldbuch: Bestand aufnehmen' };
  for (const o of W.objekte) if (o.aktion && Math.hypot(o.x - x, (o.y + 4) - y) < 28) {
    const t = { buero: 'Ins Revierbüro gehen', ort: o.name + ' ansehen', hochsitz: 'Auf den Hochsitz schauen', bank: 'Kurz auf die Bank setzen' }[o.aktion];
    return { typ: 'objekt', obj: o, text: t };
  }
  const nah = W.baeumeNahe(x, y - 2, 16).filter(b => b.g !== 'jung' || b.mark);
  if (nah.length) {
    const b = nah.find(b => b.mark) || nah[0];
    return { typ: 'baum', baum: b, text: b.mark ? 'Markierten Baum ansehen' : 'Baum untersuchen' };
  }
  return null;
}

// ---------------- Zeichnen ----------------
function zeichnen() {
  const cx = Math.round(U.clamp(kam.x - BW / 2, 0, W.PW - BW)), cy = Math.round(U.clamp(kam.y - BH / 2, 0, W.PH - BH));
  ctx.fillStyle = '#1a2414'; ctx.fillRect(0, 0, BW, BH);
  ctx.drawImage(W.boden, cx, cy, BW, BH, 0, 0, BW, BH);
  // Wasserglitzern
  for (let gy = Math.floor(cy / W.G); gy < (cy + BH) / W.G; gy++) for (let gx = Math.floor(cx / W.G); gx < (cx + BW) / W.G; gx++) {
    const i = gy * W.GW + gx;
    if (!W.wasserGrid[i] || W.wegGrid[i]) continue;
    const h = U.hash(gx, gy, Math.floor(zeit * 2.5));
    if (h < 0.06) { ctx.fillStyle = h < 0.02 ? '#cfe8ea' : '#7ab4bc'; ctx.fillRect(gx * W.G - cx + 1, gy * W.G - cy + 1, 2, 1); }
  }
  // Aufnahmepunkte (Bodenmarker)
  // Sortierte Objekte
  const liste = [];
  const marg = 70;
  for (let ty = Math.floor((cy - 20) / W.T); ty <= Math.floor((cy + BH + marg) / W.T); ty++) for (let tx = Math.floor((cx - marg) / W.T); tx <= Math.floor((cx + BW + marg) / W.T); tx++) {
    const l = W.baumIndex.get(tx + ',' + ty); if (l) l.forEach(b => liste.push({ y: b.y, typ: 'baum', b }));
  }
  W.objekte.forEach(o => { if (o.x > cx - 80 && o.x < cx + BW + 80 && o.y > cy - 20 && o.y < cy + BH + 80) liste.push({ y: o.y, typ: 'obj', o }); });
  st.auftraege.forEach(a => a.ziele.forEach(z => { if (z.typ === 'punkt' && !z.erledigt) liste.push({ y: z.y, typ: 'punkt', z }); }));
  for (const [k, n] of Object.entries(NPC)) liste.push({ y: n.y, typ: 'npc', k, n });
  liste.push({ y: spieler.y, typ: 'spieler' });
  rehe.forEach(r => { if (!r.weg) liste.push({ y: r.y, typ: 'reh', r }); });
  liste.sort((a, b) => a.y - b.y);
  for (const e of liste) {
    if (e.typ === 'baum') baumZeichnen(e.b, cx, cy);
    else if (e.typ === 'obj') { const sp = S.objekt(e.o.typ); ctx.drawImage(sp.img, Math.round(e.o.x - sp.ax - cx), Math.round(e.o.y - sp.ay - cy)); }
    else if (e.typ === 'reh') { const r = e.r; ctx.globalAlpha = r.flucht > 1.6 ? Math.max(0, 1 - (r.flucht - 1.6)) : 1; ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(Math.round(r.x - 5 - cx), Math.round(r.y - cy), 11, 2); ctx.drawImage(S.reh(r.flucht ? (Math.floor(zeit * 10) % 2) : r.frame, r.dir === 1), Math.round(r.x - 7 - cx), Math.round(r.y - 10 - cy)); ctx.globalAlpha = 1; }
    else if (e.typ === 'punkt') { const sp = S.objekt('aufnahmepunkt'); ctx.drawImage(sp.img, e.z.x - sp.ax - cx, e.z.y - sp.ay - cy); }
    else if (e.typ === 'npc') {
      const n = e.n, bob = Math.sin(zeit * 2 + n.x) > 0.95 ? 1 : 0;
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(Math.round(n.x - 5 - cx), Math.round(n.y - 1 - cy), 10, 2);
      ctx.drawImage(S.figur(e.k, n.dir, 0), Math.round(n.x - 7 - cx), Math.round(n.y - 21 - cy - bob));
      if (auftragFuerNpc(e.k)) ausrufezeichen(n.x - cx, n.y - 30 - cy);
    } else {
      ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.fillRect(Math.round(spieler.x - 5 - cx), Math.round(spieler.y - 1 - cy), 10, 2);
      ctx.drawImage(S.figur('spieler', spieler.dir, spieler.frame), Math.round(spieler.x - 7 - cx), Math.round(spieler.y - 21 - cy));
    }
  }
  // Licht
  const t = (st.minute - 450) / 600;
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = U.clamp(1 - Math.max(0, t - 0.75) * 2.5, 0.25, 1);
  ctx.drawImage(W.licht, cx, cy, BW, BH, 0, 0, BW, BH);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  // Sonnenstrahlen durchs Kronendach (schräge, langsam wandernde Lichtbahnen)
  if (t < 0.9) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 4; i++) {
      const bx = ((i * 173 + zeit * 3 - cx * 0.3) % (BW + 200) + BW + 200) % (BW + 200) - 100;
      const a = 0.035 + 0.02 * Math.sin(zeit * 0.4 + i * 2);
      const g = ctx.createLinearGradient(bx, 0, bx + 40, 0);
      g.addColorStop(0, 'rgba(255,230,160,0)'); g.addColorStop(0.5, `rgba(255,230,160,${a})`); g.addColorStop(1, 'rgba(255,230,160,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(bx, 0); ctx.lineTo(bx + 40, 0); ctx.lineTo(bx + 40 - BH * 0.5, BH); ctx.lineTo(bx - BH * 0.5, BH); ctx.fill();
    }
    ctx.restore();
  }
  // Tageszeit-Tönung
  let tint = null;
  if (t < 0.15) tint = `rgba(255,190,150,${0.10 * (1 - t / 0.15)})`;
  else if (t > 0.65 && t <= 1) tint = `rgba(255,140,50,${(t - 0.65) * 0.45})`;
  else if (t > 1) tint = `rgba(40,40,110,${Math.min(0.42, 0.16 + (t - 1) * 0.8)})`;
  if (tint) { ctx.fillStyle = tint; ctx.fillRect(0, 0, BW, BH); }
  // Blätter
  blaetter.forEach(b => { ctx.fillStyle = b.c; ctx.globalAlpha = Math.min(1, b.life); ctx.fillRect(Math.round(b.x - cx), Math.round(b.y - cy), 2, 1); ctx.fillRect(Math.round(b.x - cx) + (Math.sin(b.ph) > 0 ? 1 : 0), Math.round(b.y - cy) + 1, 1, 1); });
  ctx.globalAlpha = 1;
  ctx.drawImage(vignette, 0, 0);
  zielpfeil(cx, cy);
}

function baumZeichnen(b, cx, cy) {
  const sp = S.baum(b.art, b.g, b.v);
  const x = Math.round(b.x - sp.ax - cx), y = Math.round(b.y - sp.ay - cy);
  if (x > BW + 10 || x + sp.w < -10 || y > BH + 10 || y + sp.h < -10) return;
  ctx.drawImage(sp.stamm, x, y);
  if (b.mark) {
    // blauer Farbpunkt am Stamm
    ctx.fillStyle = '#2f6fd6'; ctx.fillRect(Math.round(b.x - cx) - 1, Math.round(b.y - cy) - 7, 3, 3);
    ctx.fillStyle = '#8ab4ff'; ctx.fillRect(Math.round(b.x - cx) - 1, Math.round(b.y - cy) - 7, 1, 1);
  }
  const sway = b.g === 'jung' ? 0 : Math.round(Math.sin(zeit * 1.1 + b.phase) * 0.7);
  // Krone durchscheinend, wenn die Spielfigur dahinter steht
  const kroneY0 = b.y - (sp.ay - sp.kroneOben), kroneY1 = b.y - 6;
  const hinter = spieler.y < b.y && spieler.y > kroneY0 - 4 && spieler.y - 18 < kroneY1 && Math.abs(spieler.x - b.x) < sp.kroneR + 2;
  if (hinter) ctx.globalAlpha = 0.45;
  ctx.drawImage(sp.krone, x + sway, y);
  ctx.globalAlpha = 1;
  if (b.mark && b.mark === (aktiverAuftrag() || {}).nr) markierungsPfeil(b.x - cx, kroneY0 - cy - 8);
  else if (b.mark) markierungsPfeil(b.x - cx, kroneY0 - cy - 8, true);
}

function markierungsPfeil(x, y, leise) {
  const bob = Math.round(Math.sin(zeit * 4) * 2);
  ctx.fillStyle = leise ? 'rgba(47,111,214,0.55)' : '#2f6fd6';
  const X = Math.round(x), Y = Math.round(y) + bob;
  ctx.fillRect(X - 3, Y - 3, 7, 3); ctx.fillRect(X - 2, Y, 5, 1); ctx.fillRect(X - 1, Y + 1, 3, 1); ctx.fillRect(X, Y + 2, 1, 1);
  if (!leise) { ctx.fillStyle = '#cfe0ff'; ctx.fillRect(X - 2, Y - 2, 2, 1); }
}

function ausrufezeichen(x, y) {
  const bob = Math.round(Math.sin(zeit * 4) * 1.5);
  const X = Math.round(x), Y = Math.round(y) + bob;
  ctx.fillStyle = '#2b1f10'; ctx.fillRect(X - 3, Y - 1, 7, 10);
  ctx.fillStyle = '#f5c542'; ctx.fillRect(X - 2, Y, 5, 8);
  ctx.fillStyle = '#2b1f10'; ctx.fillRect(X, Y + 1, 1, 4); ctx.fillRect(X, Y + 6, 1, 1);
}

function auftragFuerNpc(k) { return st.auftraege.some(a => a.typ === 'gespraech' && a.npc === k && !a.fertig) || (k === 'buehler' && st.auftraege.every(a => a.fertig)); }

function zielpfeil(cx, cy) {
  const a = aktiverAuftrag();
  let z = null;
  if (a) {
    const offen = a.ziele.filter(z => !z.erledigt);
    z = offen.sort((p, q) => Math.hypot(p.x - spieler.x, p.y - spieler.y) - Math.hypot(q.x - spieler.x, q.y - spieler.y))[0];
  } else z = { x: NPC.buehler.x, y: NPC.buehler.y };
  if (!z) return;
  const sx = z.x - cx, sy = z.y - cy;
  if (sx > 8 && sx < BW - 8 && sy > 20 && sy < BH - 8) return;
  const mx = BW / 2, my = BH / 2;
  const ang = Math.atan2(sy - my, sx - mx);
  const rx = BW / 2 - 16, ry = BH / 2 - 16;
  const k = Math.min(Math.abs(rx / Math.cos(ang)), Math.abs(ry / Math.sin(ang)));
  const px = mx + Math.cos(ang) * k, py = my + Math.sin(ang) * k;
  ctx.save(); ctx.translate(Math.round(px), Math.round(py)); ctx.rotate(ang);
  ctx.fillStyle = 'rgba(28,24,16,0.85)'; ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = a ? '#f5c542' : '#8fd18a';
  ctx.beginPath(); ctx.moveTo(7, 0); ctx.lineTo(-3, -5); ctx.lineTo(-1, 0); ctx.lineTo(-3, 5); ctx.closePath(); ctx.fill();
  ctx.restore();
  const dist = Math.round(Math.hypot(z.x - spieler.x, z.y - spieler.y) / W.T * 1.3);
  ctx.font = '8px monospace'; ctx.fillStyle = '#fbf3dc'; ctx.textAlign = 'center';
  ctx.fillText(dist + ' m', Math.round(px - Math.cos(ang) * 16), Math.round(py - Math.sin(ang) * 16) + 3);
}

// ---------------- Eingabe ----------------
document.addEventListener('keydown', e => {
  if (e.defaultPrevented) return;
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
  if (UI.offen()) {
    if ((k === 'm' && $('kartencanvas')) || (k === 'b' && $('panel').querySelector('.buch'))) UI.schliessen();
    return;
  }
  tasten.add(k);
  if (e.repeat) return;
  if (k === 'e' || k === ' ' || k === 'Enter') benutzen();
  else if (k === 'm') karteZeigen();
  else if (k === 'b') wissensbuch();
  else if (k === 'h') hilfe();
});
document.addEventListener('keyup', e => tasten.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key));
window.addEventListener('blur', () => tasten.clear());

function benutzen() {
  const i = interaktion; if (!i) return;
  tasten.clear();
  if (i.typ === 'npc') gespraech(i.npc);
  else if (i.typ === 'punkt') bestandAufnehmen(i.auftrag, i.ziel);
  else if (i.typ === 'baum') baumAnsehen(i.baum);
  else if (i.typ === 'objekt') objektBenutzen(i.obj);
}

// ---------------- Inhalte: Bäume ----------------
function lernkarteHtml(id, neu) {
  const w = WISSEN[id];
  const e = st.wissen[id];
  const fotos = (w.fotos || []).map(f => UI.foto(f)).join('');
  return `${neu ? '<div class="etikett">Neu im Wissensbuch</div>' : `<div class="etikett">${U.esc(w.kategorie)}</div>`}
    <h2>${U.esc(w.titel)}</h2>${w.latein ? `<p class="unter">${U.esc(w.latein)}</p>` : ''}
    <div class="modul">Im Studium: ${U.esc(w.modul)}</div>
    <p><b>${U.esc(w.kurz)}</b></p>
    ${fotos ? `<div class="fotos">${fotos}</div>` : ''}
    <dl class="merkmale">${w.merkmale.map(m => `<dt>${U.esc(m[0])}</dt><dd>${U.esc(m[1])}</dd>`).join('')}</dl>
    <p>${U.esc(w.text)}</p>
    ${e && e.stufe ? `<p class="unter">Stand: ${L.STUFEN[e.stufe]} · nächste Wiederholung ${e.faellig <= st.tag ? 'heute' : 'an Tag ' + e.faellig}</p>` : ''}`;
}

function lernkarte(id, danach) {
  const neu = L.gesehen(st, id);
  if (neu) UI.toast('Neu im Wissensbuch: ' + WISSEN[id].titel);
  const p = UI.zeigen(lernkarteHtml(id, neu) + `<div class="knopfreihe"><button class="knopf" data-fokus>Verstanden</button></div>`, 'breit');
  p.querySelector('.knopf').onclick = () => { UI.schliessen(); speichern(); danach && danach(); };
}

function kurzeProbe(id, danach) {
  const q = L.frage(id, Math.random);
  if (!q) { danach && danach(); return; }
  const p = UI.zeigen(`<div class="etikett">Kurze Probe</div><h2>${U.esc(WISSEN[id].titel)}</h2><p>${U.esc(q.f)}</p><div id="fr"></div>`);
  UI.frageEinbauen(p.querySelector('#fr'), q, () => { UI.schliessen(); danach && danach(); });
}

function baumZiel(b) {
  for (const a of st.auftraege) for (const z of a.ziele) if (z.typ === 'baum' && z.baumId === b.id && !z.erledigt) return [a, z];
  return null;
}

function baumAnsehen(b) {
  const zz = baumZiel(b);
  const e = L.eintrag(st, b.art);
  const fertig = () => { if (zz) zielErledigt(zz[0], zz[1]); speichern(); };
  if (e.stufe === 0) {
    // Erstbegegnung: Bühler erklärt, dann Lernkarte und kurze Probe
    const satz = { rotbuche: 'Fühl mal die Rinde: ganz glatt und silbergrau. Das ist eine Rotbuche.', traubeneiche: 'Die tiefen Risse in der Borke, die gelappten Blätter: eine Eiche. Und zwar eine Traubeneiche.', hainbuche: 'Sieht aus wie eine Buche, ist aber keine. Schau dir den wulstigen Stamm an: eine Hainbuche.', fichte: 'Die stechenden Nadeln und hängenden Zapfen kennst du bestimmt: eine Fichte.', waldkiefer: 'Schau nach oben: die fuchsrote Rinde. Das ist eine Waldkiefer.' }[b.art];
    UI.dialog([{ wer: 'buehler', text: satz }], () => lernkarte(b.art, () => kurzeProbe(b.art, () => { st.heuteBestimmt.push(b.art); fertig(); })));
    return;
  }
  if (!zz && st.heuteBestimmt.includes(b.art)) {
    // heute schon geübt: nur nachschlagen
    const p = UI.zeigen(lernkarteHtml(b.art) + `<p class="unter">Diese Baumart hast du heute schon bestimmt. Morgen wieder.</p><div class="knopfreihe"><button class="knopf" data-fokus>Schließen</button></div>`, 'breit', true);
    p.querySelector('.knopf').onclick = UI.schliessen;
    return;
  }
  // Bestimmen im Feldbuch
  const w = WISSEN[b.art];
  const fotos = [b.art + '-rinde', b.art + '-blatt'].map(f => UI.foto(f)).join('');
  const p = UI.zeigen(`<div class="etikett">Feldbuch · Baum bestimmen</div><h2>Welche Baumart ist das?</h2>
    <p>Du schaust dir Rinde und Blätter genau an.</p><div class="fotos zwei">${fotos}</div>
    <div class="wahlen">${ARTEN.map((a, k) => `<button class="wahl" data-a="${a}"><b>${k + 1}</b>${WISSEN[a].titel}</button>`).join('')}</div><div id="erg"></div>`, 'breit');
  const kn = [...p.querySelectorAll('.wahl')];
  kn.forEach(btn => btn.onclick = () => {
    if (p.dataset.fertig) return; p.dataset.fertig = 1;
    const ok = btn.dataset.a === b.art;
    kn.find(x => x.dataset.a === b.art).classList.add('richtig');
    if (!ok) btn.classList.add('falsch');
    SPIEL.antwort(b.art, ok);
    st.heuteBestimmt.push(b.art);
    const merk = w.merkmale.slice(0, 2).map(m => `<b>${m[0]}:</b> ${U.esc(m[1])}`).join(' ');
    p.querySelector('#erg').innerHTML = `<div class="erklaerung ${ok ? '' : 'schlecht'}"><b>${ok ? 'Richtig, eine ' + w.titel + '.' : 'Das ist eine ' + w.titel + '.'}</b> ${merk}</div><div class="knopfreihe"><button class="knopf zweit" id="nach">Im Wissensbuch nachlesen</button><button class="knopf">Weiter</button></div>`;
    p.querySelector('#nach').onclick = () => { UI.schliessen(); fertig(); wissensbuch(b.art); };
    p.querySelector('.knopf:last-child').onclick = () => { UI.schliessen(); fertig(); };
    p.querySelector('.knopf:last-child').focus();
  });
}

// ---------------- Inhalte: Bestandesaufnahme ----------------
function bestandAufnehmen(a, z) {
  const los = () => feldbuchBestand(a, z);
  if (L.eintrag(st, 'entwicklungsstufen').stufe === 0) {
    UI.dialog([{ wer: 'buehler', text: 'Bevor du loslegst: Jeder Bestand wird nach seiner Entwicklungsstufe beschrieben. Lies dir die vier Stufen kurz durch.' }], () => lernkarte('entwicklungsstufen', los));
  } else los();
}

function feldbuchBestand(a, z) {
  const s = W.STAENDE.find(s => s.nr === a.stand);
  const haupt = Object.entries(s.anteile).sort((p, q) => q[1] - p[1])[0][0];
  const p = UI.zeigen(`<div class="etikett">Feldbuch · Bestandesaufnahme</div><h2>Abteilung ${s.nr}</h2>
    <p>Schau dich um. Welche Baumart prägt den Bestand, und wie weit ist er entwickelt? Du kannst das Feldbuch schließen, dich umsehen und wiederkommen.</p>
    <div class="feldbuch">
      <label>Abteilung <span>${s.nr}</span></label>
      <label for="fb-art">Hauptbaumart<select id="fb-art"><option value="">– bitte wählen –</option>${ARTEN.map(x => `<option value="${x}">${WISSEN[x].titel}</option>`).join('')}</select></label>
      <label for="fb-stufe">Entwicklungsstufe<select id="fb-stufe"><option value="">– bitte wählen –</option>${Object.entries(STUFEN).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></label>
    </div><div id="erg"></div>
    <div class="knopfreihe" id="fb-kn"><button class="knopf zweit" id="fb-zu">Erst umsehen</button><button class="knopf" id="fb-ok">Eintragen</button></div>`);
  p.querySelector('#fb-zu').onclick = UI.schliessen;
  p.querySelector('#fb-ok').onclick = () => {
    const art = p.querySelector('#fb-art').value, stufe = p.querySelector('#fb-stufe').value;
    if (!art || !stufe) { UI.toast('Bitte beide Felder ausfüllen.'); return; }
    const okA = art === haupt, okS = stufe === s.stufe;
    if (L.eintrag(st, haupt).stufe === 0) { if (L.gesehen(st, haupt)) UI.toast('Neu im Wissensbuch: ' + WISSEN[haupt].titel); } else SPIEL.antwort(haupt, okA);
    SPIEL.antwort('entwicklungsstufen', okS);
    const stufenText = WISSEN.entwicklungsstufen.merkmale.find(m => m[0] === STUFEN[s.stufe])[1];
    p.querySelector('#erg').innerHTML = `<ul class="ergebnis">
      <li class="${okA ? 'ok' : 'nein'}">${okA ? '✓' : '✗'} Hauptbaumart: <b>${WISSEN[haupt].titel}</b> (etwa ${Math.round(s.anteile[haupt] * 100)} % der Bäume)</li>
      <li class="${okS ? 'ok' : 'nein'}">${okS ? '✓' : '✗'} Entwicklungsstufe: <b>${STUFEN[s.stufe]}</b>. ${U.esc(stufenText)}</li></ul>
      <p class="unter">Abt. ${s.nr}: ${U.esc(s.name)}, rund ${s.alter} Jahre alt. Beimischung: ${Object.entries(s.anteile).filter(e => e[0] !== haupt).map(e => WISSEN[e[0]].titel + ' ' + Math.round(e[1] * 100) + ' %').join(', ') || 'keine'}.</p>`;
    p.querySelector('#fb-kn').innerHTML = `<button class="knopf" data-fokus>Feldbuch schließen</button>`;
    const k = p.querySelector('#fb-kn .knopf'); k.onclick = () => { UI.schliessen(); zielErledigt(a, z); }; k.focus();
  };
}

// ---------------- Inhalte: Gespräche ----------------
function gespraech(npc) {
  const n = NPC[npc];
  n.dir = spieler.x < n.x ? 1 : 2;
  if (npc === 'buehler') return buehlerGespraech();
  const a = st.auftraege.find(a => a.typ === 'gespraech' && a.npc === npc && !a.fertig);
  if (!a) {
    const smalltalk = npc === 'wanderin' ? ['Ein schöner Herbsttag heute! Der Schönbuch ist um diese Zeit am schönsten.'] : ['Ich muss weitermachen, der Polter wird morgen abgefahren.'];
    UI.dialog([{ wer: npc, text: smalltalk[0] }]);
    return;
  }
  const schritte = [];
  if (npc === 'arbeiter' && st.tag === 1) {
    schritte.push({ wer: 'arbeiter', text: 'Grüß Gott! Krauß, Forstwirt. Du bist neu im Revier, gell? Schau, das hier ist ein <b>Polter</b>: Stämme, die wir am Weg gestapelt haben, damit der Lastwagen sie abholen kann.' });
    schritte.push({ wer: 'arbeiter', text: 'Jeder Polter kriegt eine Nummer, siehst du die blaue Farbe? Damit weiß der Fahrer, welches Holz zu welchem Käufer gehört.' });
    schritte.push({ aktion: () => { if (L.gesehen(st, 'polter')) UI.toast('Neu im Wissensbuch: Holzpolter'); } });
    schritte.push({ wer: 'arbeiter', text: 'Und wenn wir fällen: Helm, Schnittschutzhose, Sicherheitsschuhe. Ohne die geht keiner an die Säge. Abstand halten musst du auch, und zwar mehr, als die meisten denken.' });
    schritte.push({ aktion: () => { if (L.gesehen(st, 'holzernte')) UI.toast('Neu im Wissensbuch: Holzernte und Sicherheit'); } });
  } else {
    schritte.push({ wer: npc, text: npc === 'wanderin' ? (st.tag === 1 ? 'Ah, sind Sie vom Forst? Wie schön! Ich gehe hier jeden Tag spazieren und frage mich so einiges …' : 'Hallo, da sind Sie ja wieder! Ich hätte noch Fragen.') : 'Na, hast du dir was gemerkt? Ich frag dich mal ab.' });
  }
  const themen = npc === 'arbeiter' && st.tag === 1 ? ['holzernte'] : a.themen;
  themen.forEach(t => {
    const q = L.frage(t, Math.random);
    if (!q) return;
    schritte.push({ aktion: () => L.gesehen(st, t) });
    schritte.push({ wer: npc, text: U.esc(q.f), frage: q });
  });
  schritte.push({ wer: npc, text: npc === 'wanderin' ? 'Danke, das war wirklich interessant! Schönen Tag noch im Wald.' : 'Passt. Dann schaff mal weiter!' });
  UI.dialog(schritte, () => zielErledigt(a, a.ziele[0]));
}

function buehlerGespraech() {
  const offen = st.auftraege.filter(a => !a.fertig);
  if (!offen.length) {
    UI.dialog([{ wer: 'buehler', text: st.vertrauen >= 60 ? 'Sauber gemacht heute! Komm, wir schreiben den Tagesbericht.' : 'So, Feierabend. Lass uns kurz zusammenfassen, was heute los war.' }], tagesbericht);
    return;
  }
  const a = aktiverAuftrag();
  const p = UI.zeigen(`<div class="dialog"><div id="por"></div><div><div class="sprecher">Revierleiter Bühler</div>
    <div class="redetext">Es ist noch was offen: <b>${U.esc(a.titel)}</b>. ${U.esc(a.kurz)} Wenn du nicht weißt, wo: Taste <span class="taste">M</span> für die Karte, oder folg dem gelben Pfeil am Bildschirmrand.</div>
    <div class="wahlen"><button class="wahl" id="w1"><b>1</b>Alles klar, ich mach weiter.</button><button class="wahl" id="w2"><b>2</b>Ich mache trotzdem Feierabend.</button></div></div></div>`);
  p.querySelector('#por').appendChild(UI.portraitCanvas('buehler'));
  p.querySelector('#w1').onclick = UI.schliessen;
  p.querySelector('#w2').onclick = () => { UI.schliessen(); tagesbericht(); };
}

// ---------------- Objekte ----------------
function objektBenutzen(o) {
  if (o.aktion === 'buero') return buehlerGespraech();
  if (o.aktion === 'ort') {
    const neu = L.gesehen(st, o.ort);
    if (neu) { st.entdeckt.push(o.ort); UI.toast('Ort entdeckt: ' + WISSEN[o.ort].titel); }
    const w = WISSEN[o.ort];
    const p = UI.zeigen(`<div class="etikett">${neu ? 'Neu entdeckt' : 'Ort'}</div><h2>${U.esc(w.titel)}</h2><p class="unter">${U.esc(o.name)}</p>
      <div class="fotos" style="grid-template-columns:1fr">${UI.foto(w.fotos[0], w.titel)}</div>
      <p><b>${U.esc(w.kurz)}</b></p><dl class="merkmale">${w.merkmale.map(m => `<dt>${m[0]}</dt><dd>${U.esc(m[1])}</dd>`).join('')}</dl><p>${U.esc(w.text)}</p>
      <div class="knopfreihe"><button class="knopf" data-fokus>Weiter</button></div>`, 'breit', true);
    p.querySelector('.knopf').onclick = UI.schliessen;
    speichern();
    return;
  }
  if (o.aktion === 'hochsitz') { UI.dialog([{ wer: 'buehler', text: 'Von dem Hochsitz aus jagen wir an der Wildwiese, vor allem Rehwild und Wildschweine. Ohne Jagd hätten junge Eichen und Tannen kaum eine Chance, weil das Rehwild ihre Knospen abfrisst. Dazu lernst du später mehr.' }]); return; }
  if (o.aktion === 'bank') { UI.toast('Kurze Pause. Es riecht nach feuchtem Laub und Pilzen.'); }
}

// ---------------- Fenster ----------------
function intro() {
  UI.dialog([
    { wer: 'buehler', text: 'Grüß Gott und willkommen im Revier! Ich bin Martin Bühler, der Revierleiter hier im Schönbuch. Die nächsten Wochen machst du dein Praktikum bei mir.' },
    { wer: 'buehler', text: 'Gelaufen wird mit <span class="taste">W</span><span class="taste">A</span><span class="taste">S</span><span class="taste">D</span> oder den Pfeiltasten. Mit <span class="taste">E</span> schaust du dir Dinge an oder sprichst mit Leuten.' },
    { wer: 'buehler', text: 'Mit <span class="taste">M</span> öffnest du die Forstkarte, mit <span class="taste">B</span> dein Wissensbuch. Alles, was du lernst, landet dort. Und was du lernst, frage ich später wieder ab, darauf kannst du dich verlassen.' },
    { wer: 'buehler', text: 'Jetzt schau erst mal in den Posteingang, da stehen deine Aufträge für heute.' }
  ], posteingang);
}

function posteingang() {
  st.morgen = false; speichern();
  const p = UI.zeigen(`<div class="etikett">Revierbüro · Tag ${st.tag} · Posteingang</div><h2>Aufträge für heute</h2>
    <div class="briefe">${st.auftraege.map(a => `<div class="brief"><div class="von">Auftrag ${a.nr} · von Martin Bühler</div><b>${U.esc(a.titel)}</b><p style="margin:4px 0 0">${U.esc(a.brief)}</p></div>`).join('')}</div>
    <p class="unter">Die Aufträge stehen oben rechts. Klick einen an, dann zeigt der gelbe Pfeil dorthin.</p>
    <div class="knopfreihe"><button class="knopf zweit" id="pk">Karte ansehen</button><button class="knopf" data-fokus>Raus in den Wald</button></div>`);
  p.querySelector('#pk').onclick = () => { UI.schliessen(); karteZeigen(); };
  p.querySelector('.knopf:last-child').onclick = UI.schliessen;
}

let kartenRaf = 0;
function karteZeigen() {
  const a = aktiverAuftrag();
  const p = UI.zeigen(`<div class="kartenkopf"><h2>Forstkarte · Revier Schönbuch</h2>
    <div class="legende"><span>○ Laubholz</span><span>∧ Nadelholz</span><span style="color:#b0413a">┅ Abteilungsgrenze</span><span>═ Waldweg</span><span style="color:#3d7fb0">∼ Bach</span><span style="color:#d4462f">● Auftrag</span><span style="color:#c8861a">● Du</span></div>
    <button class="knopf" data-fokus>Schließen <span class="taste" style="margin-left:6px;margin-right:0">M</span></button></div>
    <div id="kartenflaeche"><canvas id="kartencanvas"></canvas></div>`, 'voll', true);
  p.querySelector('.knopf').onclick = UI.schliessen;
  const cv = $('kartencanvas');
  const ziele = [];
  st.auftraege.forEach(au => au.ziele.forEach(z => ziele.push({ x: z.x, y: z.y, nr: au.nr, erledigt: z.erledigt })));
  const run = () => {
    if (!$('kartencanvas')) return;
    const r = cv.parentElement.getBoundingClientRect();
    if (cv.width !== Math.round(r.width) || cv.height !== Math.round(r.height)) { cv.width = Math.round(r.width); cv.height = Math.round(r.height); }
    K.zeichnen(cv, spieler, ziele, performance.now() / 1000);
    kartenRaf = requestAnimationFrame(run);
  };
  cancelAnimationFrame(kartenRaf); run();
}

function wissensbuch(auswahl) {
  const ids = Object.keys(WISSEN);
  const kats = [...new Set(ids.map(id => WISSEN[id].kategorie))];
  const punkte = id => { const s = st.wissen[id] ? st.wissen[id].stufe : 0; return `<span class="punkte">${[1, 2, 3].map(i => `<i class="${s >= i ? 'an' : ''}"></i>`).join('')}</span>`; };
  const bekannt = id => st.wissen[id] && st.wissen[id].stufe > 0;
  const p = UI.zeigen(`<div class="kartenkopf"><h2>Wissensbuch</h2><span class="unter" style="margin:0">Abgedeckt: ${Math.round(L.abdeckung(st) * 100)} % · ${Object.values(st.wissen).filter(e => e.stufe > 0).length} von ${ids.length} Einträgen</span><button class="knopf" data-fokus>Schließen <span class="taste" style="margin-left:6px;margin-right:0">B</span></button></div>
    <div class="buch"><nav>${kats.map(k => `<div class="kat">${k}</div>` + ids.filter(id => WISSEN[id].kategorie === k).map(id => `<button data-id="${id}" class="${bekannt(id) ? '' : 'zu'}"><span>${bekannt(id) ? WISSEN[id].titel : '???'}</span>${punkte(id)}</button>`).join('')).join('')}</nav>
    <div id="buchseite"><p class="leer">Wähle links einen Eintrag. Einträge mit ??? hast du noch nicht entdeckt.<br><br>Die drei Kästchen zeigen deinen Stand: gesehen, gelernt, sicher. Was du lange nicht wiederholt hast, fragt das Spiel wieder ab.</p></div></div>`, 'breit', true);
  p.querySelector('.kartenkopf .knopf').onclick = UI.schliessen;
  const zeige = id => {
    p.querySelectorAll('nav button').forEach(b => b.classList.toggle('an', b.dataset.id === id));
    p.querySelector('#buchseite').innerHTML = bekannt(id) ? lernkarteHtml(id) : '<p class="leer">Noch nicht entdeckt. Halte im Revier die Augen offen.</p>';
  };
  p.querySelectorAll('nav button').forEach(b => b.onclick = () => zeige(b.dataset.id));
  if (auswahl) zeige(auswahl);
}

function hilfe() {
  const p = UI.zeigen(`<h2>Steuerung</h2><div class="tasten">
    <span><span class="taste">W A S D</span> / Pfeile</span><span>Laufen (mit <span class="taste">Shift</span> schneller)</span>
    <span class="taste">E</span><span>Ansehen, sprechen, bestätigen</span>
    <span class="taste">M</span><span>Forstkarte</span>
    <span class="taste">B</span><span>Wissensbuch</span>
    <span class="taste">1–5</span><span>Antwort wählen</span>
    <span class="taste">Esc</span><span>Fenster schließen</span></div>
    <h3>So funktioniert’s</h3><p>Deine Aufträge stehen oben rechts. Der gelbe Pfeil am Bildschirmrand zeigt zum aktiven Auftrag, und über markierten Bäumen schwebt ein blauer Pfeil. Alles, was du lernst, kommt ins Wissensbuch und wird in wachsenden Abständen wieder abgefragt. Am Ende des Tages sprichst du im Revierbüro mit Herrn Bühler.</p>
    <p class="unter">Der Spielstand wird automatisch gespeichert.</p>
    <div class="knopfreihe"><button class="knopf zweit" id="neu">Spielstand löschen und neu beginnen</button><button class="knopf" data-fokus>Weiter spielen</button></div>`, '', true);
  p.querySelector('.knopf:last-child').onclick = UI.schliessen;
  p.querySelector('#neu').onclick = () => {
    p.querySelector('#neu').outerHTML = '<button class="knopf zweit" id="neu2" style="background:#b0413a;color:#fff">Wirklich alles löschen?</button>';
    p.querySelector('#neu2').onclick = () => { L.loeschen(); location.reload(); };
  };
}

function tagesbericht() {
  const neu = st.log.filter(l => l.typ === 'neu').map(l => l.id);
  const res = {};
  st.log.filter(l => l.typ === 'richtig' || l.typ === 'falsch').forEach(l => { res[l.id] = res[l.id] || [0, 0]; res[l.id][l.typ === 'richtig' ? 0 : 1]++; });
  const erledigt = st.auftraege.filter(a => a.fertig).length;
  st.vertrauen = U.clamp(st.vertrauen + erledigt * 3 - (st.auftraege.length - erledigt) * 2, 0, 100);
  const morgen = Object.keys(st.wissen).filter(id => st.wissen[id].stufe > 0 && st.wissen[id].faellig <= st.tag + 1).length;
  const kommentar = erledigt === st.auftraege.length ? 'Alle Aufträge erledigt. So kann’s weitergehen.' : 'Nicht alles geschafft, aber morgen ist auch ein Tag.';
  const ende = st.tag >= st.praktikumTage;
  const p = UI.zeigen(`<div class="etikett">Revierbüro · Tag ${st.tag} · ${uhr()} Uhr</div><h2>Tagesbericht</h2>
    <div class="dialog"><div id="por"></div><div><div class="sprecher">Revierleiter Bühler</div><div class="redetext">${kommentar}</div></div></div>
    <h3>Aufträge: ${erledigt} von ${st.auftraege.length}</h3>
    ${neu.length ? `<h3>Neu gelernt</h3><ul class="bericht-liste">${neu.map(id => `<li><span>${WISSEN[id].titel}</span><span class="unter" style="margin:0">${U.esc(WISSEN[id].modul)}</span></li>`).join('')}</ul>` : ''}
    ${Object.keys(res).length ? `<h3>Abgefragt</h3><ul class="bericht-liste">${Object.entries(res).map(([id, r]) => `<li><span>${WISSEN[id].titel}</span><span>${r[0] ? '✓ ' + r[0] : ''} ${r[1] ? ' ✗ ' + r[1] : ''} · jetzt: ${L.STUFEN[st.wissen[id].stufe]}</span></li>`).join('')}</ul>` : ''}
    <h3>Vertrauen von Herrn Bühler</h3><div class="balken"><i style="width:${st.vertrauen}%"></i></div>
    <p class="unter" style="margin-top:8px">Wissensbuch abgedeckt: ${Math.round(L.abdeckung(st) * 100)} % · morgen zur Wiederholung fällig: ${morgen} Einträge</p>
    ${ende ? '<p><b>Das war der letzte Tag deines Praktikums.</b> In der nächsten Version geht es weiter: Bewerbung in Rottenburg und das erste Semester.</p>' : ''}
    <div class="knopfreihe"><button class="knopf" data-fokus>Feierabend, nächster Tag</button></div>`);
  p.querySelector('#por').appendChild(UI.portraitCanvas('buehler'));
  p.querySelector('.knopf').onclick = () => { UI.schliessen(); naechsterTag(); };
}

function naechsterTag() {
  st.tag++; st.minute = 450; st.log = []; st.erledigtHeute = []; st.heuteBestimmt = [];
  warnungAbend = false;
  auftraegeErzeugen(); markierungenSetzen();
  spieler.x = BUERO.x; spieler.y = BUERO.y + 6; kam.x = spieler.x; kam.y = spieler.y;
  hudAktualisieren(); speichern();
  posteingang();
}

window.SPIEL = SPIEL;
window.addEventListener('load', () => setTimeout(SPIEL.start, 30));
