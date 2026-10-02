# Waldland – Prototyp v0.1

Ein Revier im Schönbuch. Du bist Praktikant/in bei Revierleiter Martin Bühler.

## Starten

`index.html` doppelklicken. Das Spiel läuft offline im Browser (Chrome, Edge oder Firefox), eine Installation brauchst du nicht.
Der Spielstand wird automatisch im Browser gespeichert. Neu beginnen kannst du über Hilfe (H) → „Spielstand löschen“.

## Steuerung

| Taste | Funktion |
|---|---|
| W A S D / Pfeiltasten | Laufen (mit Shift schneller) |
| E | Ansehen, sprechen, bestätigen |
| M | Forstkarte |
| B | Wissensbuch |
| 1–5 | Antwort wählen |
| Esc | Fenster schließen |

## Aufbau

- `daten/wissen.js`: alle Lerninhalte, jeweils mit dem passenden Modul in Rottenburg
- `daten/fotos.js` + `fotos/`: echte Fotos von Wikimedia Commons, Quelle und Lizenz stehen bei jedem Bild
- `js/welt.js`: die Welt (Wege, Bach, Bestände, Bäume)
- `js/sprites.js`: die gesamte Pixel-Grafik, im Code gezeichnet
- `js/karte.js`: die Forstkarte
- `js/lernen.js`: Spielstand und Wiederholungssystem
- `js/spiel.js`: Spielablauf, Aufträge, Gespräche, Feldbuch
