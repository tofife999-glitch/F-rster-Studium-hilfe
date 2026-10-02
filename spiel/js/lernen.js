// Spielstand und Lernsystem (Wiederholung in wachsenden Abständen)
'use strict';

const L = {};
const SPEICHER = 'waldland-spielstand-v1';

// Stufen: 0 unbekannt, 1 gesehen, 2 gelernt, 3 sicher
L.STUFEN = ['unbekannt', 'gesehen', 'gelernt', 'sicher'];
L.ABSTAND = [1, 1, 3, 7];      // Tage bis zur nächsten Wiederholung je Stufe

L.neu = function () {
  return {
    version: 1, tag: 1, minute: 7 * 60 + 30,
    rang: 0, vertrauen: 50,
    wissen: {},            // id -> {stufe, faellig, richtig, falsch}
    entdeckt: [],          // Orte
    auftraege: [],
    erledigtHeute: [],
    log: [],               // Ereignisse des Tages für den Tagesbericht
    spieler: null,
    tutorial: true, praktikumTage: 10
  };
};

L.laden = function () {
  try { const s = JSON.parse(localStorage.getItem(SPEICHER)); if (s && s.version === 1) return s; } catch (e) { }
  return null;
};
L.speichern = function (st) { try { localStorage.setItem(SPEICHER, JSON.stringify(st)); } catch (e) { } };
L.loeschen = function () { try { localStorage.removeItem(SPEICHER); } catch (e) { } };

L.eintrag = function (st, id) {
  if (!st.wissen[id]) st.wissen[id] = { stufe: 0, faellig: 0, richtig: 0, falsch: 0 };
  return st.wissen[id];
};

// Etwas zum ersten Mal sehen (Lernkarte gelesen)
L.gesehen = function (st, id) {
  const e = L.eintrag(st, id);
  if (e.stufe === 0) { e.stufe = 1; e.faellig = st.tag + 1; st.log.push({ typ: 'neu', id }); return true; }
  return false;
};

L.antwort = function (st, id, korrekt) {
  const e = L.eintrag(st, id);
  if (korrekt) { e.richtig++; e.stufe = Math.min(3, Math.max(1, e.stufe) + 1); }
  else { e.falsch++; e.stufe = 1; }
  e.faellig = st.tag + L.ABSTAND[e.stufe];
  st.log.push({ typ: korrekt ? 'richtig' : 'falsch', id });
};

L.faellig = function (st, filter) {
  return Object.keys(st.wissen).filter(id => st.wissen[id].stufe > 0 && st.wissen[id].faellig <= st.tag && (!filter || filter(id)));
};

L.abdeckung = function (st) {
  const ids = Object.keys(WISSEN).filter(id => !WISSEN[id].ort);
  const pkt = ids.reduce((s, id) => s + (st.wissen[id] ? st.wissen[id].stufe : 0), 0);
  return pkt / (ids.length * 3);
};

L.frage = function (id, r) {
  const fr = WISSEN[id].fragen;
  if (!fr || !fr.length) return null;
  const q = fr[Math.floor(r() * fr.length)];
  // Antworten mischen
  const idx = U.shuffle(q.a.map((_, i) => i), r);
  return { id, f: q.f, a: idx.map(i => q.a[i]), r: idx.indexOf(q.r), e: q.e };
};
