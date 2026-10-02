# Waldland – Kernschleife und Prototyp v0.1 (Entwurf)

## Rahmen

- **Ort:** ein Revier im **Schönbuch** (Naturpark zwischen Tübingen, Herrenberg und Böblingen, direkt bei Rottenburg). Das Revier ist ein vereinfachter Ausschnitt; echte Orte wie Bebenhausen oder das Schaichtal kommen als Bezugspunkte vor. Ortsdetails werden vor dem Einbau geprüft.
- **Sprache:** Deutsch, mit den echten Fachbegriffen.
- **Rolle und Aufstieg:**
  1. Praktikant/in im Revier, begleitet vom Revierleiter Martin Bühler als Mentor. Mit deinem Aufstieg tritt er nach und nach zurück und geht schließlich in den Ruhestand, du übernimmst sein Revier.
  2. Student/in: Die Studienplan-Brille wird freigeschaltet.
  3. Trainee
  4. Revierleitung

  Aufsteigen kannst du, wenn du genug Wissen abgedeckt und Aufgaben erledigt hast.

## Ein Spieltag (20–30 Minuten)

1. **Morgen im Revierbüro (Forstkarte).** Im Posteingang liegen 2–4 Aufträge. Du wählst aus und planst deine Route auf der Karte.
2. **Draußen im Revier (Pixel-Ansicht).** Du läufst hin und erledigst die Aufträge, für die du Wissen brauchst. Unterwegs:
   - fragen dich Leute etwas (Lernfrage B2),
   - nimmst du Funde ins Feldbuch auf (Lernfrage B3),
   - schaltest du beim Entdecken eines Ortes ein echtes Foto frei.
3. **Abend: Tagesbericht.** Er zeigt, was du gelernt hast und wie sich der Wald verändert hat. Außerdem plant das Spiel automatisch ein, wann welches Wissen wiederholt wird.

- **Zeit:** 1 Spieltag entspricht ungefähr 1 Woche. Nach etwa 12 Spieltagen wechselt die Jahreszeit, und mit ihr die Arbeit:
  - Winter: Holzernte
  - Frühling: Pflanzung
  - Sommer: Borkenkäfer
  - Herbst: Jagd und Saatguternte

## Lernen

- **Jeder Wissenseintrag hat vier Stufen:** unbekannt → gesehen → gelernt → sicher.
- **Wiederholungen** tauchen als normale Ereignisse in der Welt auf, in wachsenden Abständen (Spaced Repetition).
- **Fehler:** Es gibt kein „Game Over“. Bei Fehlern leidet ein wenig der Wald oder das Vertrauen des Mentors, und du bekommst immer die Erklärung dazu.

## Prototyp v0.1 (Umfang)

- **Welt:** ein kleiner Revierausschnitt im Schönbuch. Du kannst draußen herumlaufen und zur Forstkarte herauszoomen.
- **5 Baumarten** mit echten Fotos (Baum, Blatt/Nadel, Rinde, Knospe, Frucht): Rotbuche, Traubeneiche, Hainbuche, Fichte, Waldkiefer.
- **Figuren:** 3, nämlich Revierleiter Bühler, eine Wanderin und Forstwirt Krauß. Die Spielfigur ist fest und blond.
- **Spielumfang:** ein spielbarer Tag mit Posteingang, Aufträgen, Feldbuch und Tagesbericht.
- **Speicherstand:** wird automatisch gespeichert.

## Technik

- Browser-Spiel aus HTML, JavaScript und Canvas. Es braucht keine Installation und keinen Server: `spiel/index.html` doppelklicken, fertig.
- Inhalte (Wissensbuch, Aufträge, Figuren) liegen als eigene Datendateien vor und sind getrennt vom Spielcode.
- Fotos stammen von Wikimedia Commons. Quelle und Lizenz werden bei jedem Bild mitgespeichert.
