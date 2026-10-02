// Fenster, Dialoge und Hinweise (HTML über dem Spiel)
'use strict';

const UI = {};
const $ = id => document.getElementById(id);

UI.offen = () => !$('overlay').hidden;

UI.zeigen = function (html, klasse, schliessbar) {
  const p = $('panel');
  p.className = klasse || '';
  if (schliessbar) p.dataset.schliessbar = '1'; else delete p.dataset.schliessbar;
  p.innerHTML = html;
  $('overlay').hidden = false;
  p.scrollTop = 0;
  const f = p.querySelector('[data-fokus]') || p.querySelector('.wahl, .knopf');
  if (f) setTimeout(() => f.focus({ preventScroll: true }), 30);
  return p;
};

UI.schliessen = function () {
  $('overlay').hidden = true;
  $('panel').innerHTML = '';
  UI.beimSchliessen && UI.beimSchliessen();
  UI.beimSchliessen = null;
};

let toastTimer = 0;
UI.toast = function (text, ms) {
  const t = $('toast');
  t.textContent = text; t.hidden = false;
  t.style.animation = 'none'; void t.offsetWidth; t.style.animation = '';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, ms || 2600);
};

UI.hinweis = function (html) {
  const h = $('hinweis');
  if (!html) { h.hidden = true; return; }
  if (h.innerHTML !== html) h.innerHTML = html;
  h.hidden = false;
};

// Foto mit Quellenangabe. Fehlt das Bild, erscheint ein Platzhalter.
UI.foto = function (key, beschriftung) {
  const f = (window.FOTOS || {})[key];
  const teil = { baum: 'Baum', blatt: 'Blatt / Nadel', rinde: 'Rinde', knospe: 'Knospe', frucht: 'Frucht' }[key.split('-')[1]] || '';
  const cap = beschriftung || teil;
  if (!f) return `<figure><div class="foto-fehlt">Foto folgt</div><figcaption><span>${cap}</span></figcaption></figure>`;
  return `<figure><img src="${f.datei}" alt="${U.esc(cap)}" data-gross="${key}" loading="lazy"><figcaption><span>${cap}</span><i title="${U.esc(f.titel)}">© ${U.esc(f.autor)} · ${U.esc(f.lizenz)}</i></figcaption></figure>`;
};

document.addEventListener('click', e => {
  const img = e.target.closest('img[data-gross]');
  if (img) {
    const f = window.FOTOS[img.dataset.gross];
    const d = document.createElement('div');
    d.className = 'grossfoto';
    d.innerHTML = `<div><img src="${f.datei}" alt=""><p>${U.esc(f.titel)} · ${U.esc(f.autor)} · ${U.esc(f.lizenz)}<br>${U.esc(f.quelle)}</p></div>`;
    d.onclick = () => d.remove();
    document.body.appendChild(d);
    return;
  }
  const gf = e.target.closest('.grossfoto'); if (gf) gf.remove();
});

UI.portraitCanvas = function (wer) {
  const c = document.createElement('canvas');
  c.width = 24; c.height = 24;
  c.getContext('2d').drawImage(S.portrait(wer), 0, 0);
  return c;
};

UI.NAMEN = { buehler: 'Revierleiter Bühler', wanderin: 'Wanderin', arbeiter: 'Forstwirt Krauß', spieler: 'Du' };

// Dialog: schritte = [{wer, text, wahlen?:[...], frage?:{...}, dann?:fn}] ; fertig = Callback
UI.dialog = function (schritte, fertig) {
  let i = 0;
  const weiter = () => {
    if (i >= schritte.length) { UI.schliessen(); fertig && fertig(); return; }
    const s = schritte[i++];
    if (s.aktion) { s.aktion(); weiter(); return; }
    const p = UI.zeigen(`<div class="dialog"><div id="por"></div><div><div class="sprecher">${UI.NAMEN[s.wer] || s.wer}</div><div class="redetext">${s.text}</div><div id="dlg-unten"></div></div></div>`);
    p.querySelector('#por').appendChild(UI.portraitCanvas(s.wer));
    const unten = p.querySelector('#dlg-unten');
    if (s.frage) {
      UI.frageEinbauen(unten, s.frage, () => weiter());
    } else {
      unten.innerHTML = `<div class="knopfreihe"><button class="knopf" data-fokus>Weiter <span class="taste" style="margin-left:6px;margin-right:0">E</span></button></div>`;
      unten.querySelector('button').onclick = weiter;
    }
  };
  weiter();
};

// Multiple-Choice-Frage einbauen; q = {id,f,a,r,e}; nach Antwort: Erklärung + Weiter
UI.frageEinbauen = function (el, q, weiter, ohneText) {
  el.innerHTML = `${ohneText ? '' : ''}<div class="wahlen">${q.a.map((t, k) => `<button class="wahl" data-k="${k}"><b>${k + 1}</b>${U.esc(t)}</button>`).join('')}</div><div class="ant"></div>`;
  const knoepfe = [...el.querySelectorAll('.wahl')];
  knoepfe.forEach(b => b.onclick = () => {
    if (el.dataset.fertig) return;
    el.dataset.fertig = 1;
    const k = +b.dataset.k, ok = k === q.r;
    knoepfe[q.r].classList.add('richtig');
    if (!ok) b.classList.add('falsch');
    SPIEL.antwort(q.id, ok);
    el.querySelector('.ant').innerHTML = `<div class="erklaerung ${ok ? '' : 'schlecht'}"><b>${ok ? 'Richtig.' : 'Nicht ganz.'}</b> ${U.esc(q.e)}</div><div class="knopfreihe"><button class="knopf" data-fokus>Weiter</button></div>`;
    const w = el.querySelector('.ant .knopf'); w.onclick = weiter; w.focus();
  });
};

// Tastatur in Fenstern: Zahlen wählen, E/Enter = Hauptknopf
document.addEventListener('keydown', e => {
  if (!UI.offen() || e.repeat) return;
  if (document.querySelector('.grossfoto')) { if (e.key === 'Escape') document.querySelector('.grossfoto').remove(); return; }
  if (e.target.tagName === 'SELECT') return;
  const p = $('panel');
  if (/^[1-9]$/.test(e.key)) {
    const w = [...p.querySelectorAll('.wahl')].filter(b => b.offsetParent);
    const b = w[+e.key - 1]; if (b) { b.click(); e.preventDefault(); }
  } else if (e.key === 'e' || e.key === 'E' || e.key === 'Enter' || e.key === ' ') {
    if (e.target.tagName === 'BUTTON' && (e.key === 'Enter' || e.key === ' ')) return;
    const k = [...p.querySelectorAll('.knopf')].filter(b => b.offsetParent);
    if (k.length) { k[k.length - 1].click(); e.preventDefault(); }
  } else if (e.key === 'Escape') {
    if (p.dataset.schliessbar) { UI.schliessen(); e.preventDefault(); }
  }
});
