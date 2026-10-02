// Wissensbuch: jeder Stoff steht genau einmal hier.
// modul = wo das Thema im B.Sc. Forstwirtschaft an der HFR Rottenburg vorkommt (Modulhandbuch Version 4).
// fragen = Abfragen für Wiederholungen (Gespräch oder Feldbuch).
'use strict';

window.WISSEN = {
  rotbuche: {
    titel: 'Rotbuche', latein: 'Fagus sylvatica', kategorie: 'Baumarten', art: true,
    modul: 'FG.5 Botanik II – Gehölzbestimmung (2. Semester)',
    kurz: 'Glatte, silbergraue Rinde. Die häufigste Laubbaumart in Deutschland.',
    merkmale: [
      ['Rinde', 'Glatt und silbergrau, auch bei alten Bäumen.'],
      ['Blatt', 'Eiförmig, ganzrandig, Rand leicht gewellt. Junge Blätter am Rand fein bewimpert.'],
      ['Knospe', 'Lang, spindelförmig und spitz, zimtbraun, steht vom Zweig ab.'],
      ['Frucht', 'Dreikantige Bucheckern, zu zweit in einem stacheligen Fruchtbecher.'],
      ['Herbst', 'Laub färbt sich kupfer- bis orangebraun.']
    ],
    text: 'Die Rotbuche verträgt viel Schatten und kann darum unter alten Bäumen nachwachsen. Ohne den Menschen wäre ein großer Teil Deutschlands Buchenwald. Ihre dünne Rinde bekommt bei plötzlicher Sonne leicht Rindenbrand, und lange Dürre setzt ihr zu. Holz: Möbel, Treppen, Parkett, Brennholz.',
    fotos: ['rotbuche-baum', 'rotbuche-blatt', 'rotbuche-rinde', 'rotbuche-knospe', 'rotbuche-frucht'],
    fragen: [
      { f: 'Woran erkennst du eine Rotbuche am Stamm am schnellsten?', a: ['Glatte, silbergraue Rinde', 'Tiefe Längsrisse in dunkler Borke', 'Oben fuchsrote, abblätternde Rinde'], r: 0, e: 'Die Rotbuche behält ihre glatte, silbergraue Rinde ein Leben lang.' },
      { f: 'Wie sehen die Knospen der Rotbuche aus?', a: ['Lang, spitz und zimtbraun', 'Kurz, rundlich und gehäuft an der Triebspitze', 'Klebrig und grün'], r: 0, e: 'Buchenknospen sind lang, spindelförmig und spitz. Gehäufte Knospen an der Triebspitze hat die Eiche.' },
      { f: 'Warum kann die Rotbuche unter alten Bäumen nachwachsen?', a: ['Sie verträgt viel Schatten', 'Sie braucht volles Licht', 'Sie wächst nur auf Sand'], r: 0, e: 'Die Rotbuche ist eine Schattbaumart. Lichtbaumarten wie Eiche oder Kiefer schaffen das kaum.' }
    ]
  },
  traubeneiche: {
    titel: 'Traubeneiche', latein: 'Quercus petraea', kategorie: 'Baumarten', art: true,
    modul: 'FG.5 Botanik II – Gehölzbestimmung (2. Semester)',
    kurz: 'Tief gefurchte Borke, gelappte Blätter mit langem Stiel, Eicheln fast ohne Stiel.',
    merkmale: [
      ['Rinde', 'Graubraune Borke mit tiefen Längsrissen.'],
      ['Blatt', 'Gelappt, mit deutlichem Blattstiel (1–2,5 cm). Blattgrund keilförmig, ohne „Öhrchen“.'],
      ['Knospe', 'Rundlich-eiförmig, mehrere gehäuft an der Triebspitze.'],
      ['Frucht', 'Eicheln sitzen fast ohne Stiel in Büscheln, wie eine Traube.'],
      ['Verwechslung', 'Bei der Stieleiche ist es umgekehrt: Blatt fast ohne Stiel, Eichel an langem Stiel.']
    ],
    text: 'Die Traubeneiche ist eine Lichtbaumart mit kräftiger Pfahlwurzel und kommt mit Trockenheit besser zurecht als die Stieleiche. Darum gilt sie als wichtige Baumart im Klimawandel. Im Schönbuch prägt sie zusammen mit der Hainbuche alte Eichenwälder. Holz: sehr dauerhaft, für Furnier, Möbel, Weinfässer und Bauholz.',
    fotos: ['traubeneiche-baum', 'traubeneiche-blatt', 'traubeneiche-rinde', 'traubeneiche-knospe', 'traubeneiche-frucht'],
    fragen: [
      { f: 'Wie unterscheidest du die Traubeneiche von der Stieleiche an der Frucht?', a: ['Ihre Eicheln sitzen fast ohne Stiel', 'Ihre Eicheln hängen an langen Stielen', 'Sie hat gar keine Eicheln'], r: 0, e: 'Traubeneiche: Eicheln sitzend, Blätter gestielt. Stieleiche: Eicheln gestielt, Blätter fast sitzend.' },
      { f: 'Wo sitzen die Knospen der Eiche?', a: ['Gehäuft an der Triebspitze', 'Einzeln und weit abstehend', 'Nur an der Unterseite des Zweigs'], r: 0, e: 'Mehrere rundliche Knospen gehäuft an der Triebspitze sind typisch für Eichen.' },
      { f: 'Warum gilt die Traubeneiche als Hoffnungsträger im Klimawandel?', a: ['Sie verträgt Trockenheit vergleichsweise gut', 'Sie wächst am schnellsten von allen', 'Sie braucht viel Schatten'], r: 0, e: 'Mit ihrer tiefen Pfahlwurzel erreicht sie Wasser in tieferen Bodenschichten.' }
    ]
  },
  hainbuche: {
    titel: 'Hainbuche', latein: 'Carpinus betulus', kategorie: 'Baumarten', art: true,
    modul: 'FG.5 Botanik II – Gehölzbestimmung (2. Semester)',
    kurz: 'Keine Buche, sondern ein Birkengewächs. Glatte, graue Rinde mit Längswülsten.',
    merkmale: [
      ['Rinde', 'Glatt und grau mit hellen, netzartigen Streifen. Der Stamm wirkt gedreht und wulstig („spannrückig“).'],
      ['Blatt', 'Doppelt gesägter Rand, viele parallele Seitennerven, zwischen den Nerven gefaltet.'],
      ['Knospe', 'Spitz, schlank, liegt eng am Zweig an.'],
      ['Frucht', 'Kleine Nüsschen an einem dreilappigen Flügel, in hängenden Büscheln.'],
      ['Herbst', 'Laub färbt sich hellgelb.']
    ],
    text: 'Trotz des Namens ist die Hainbuche nicht mit der Rotbuche verwandt, sondern gehört zu den Birkengewächsen. Sie verträgt Schatten und wächst oft unter Eichen, deshalb heißt dieser Waldtyp Eichen-Hainbuchenwald. Ihr Holz ist das härteste der heimischen Baumarten, daher der Name „Eisenholz“. Holz: Werkzeugstiele, Hackklötze, früher Zahnräder.',
    fotos: ['hainbuche-baum', 'hainbuche-blatt', 'hainbuche-rinde', 'hainbuche-knospe', 'hainbuche-frucht'],
    fragen: [
      { f: 'Ist die Hainbuche mit der Rotbuche verwandt?', a: ['Nein, sie ist ein Birkengewächs', 'Ja, sie ist eine junge Rotbuche', 'Ja, beide sind Eichengewächse'], r: 0, e: 'Hainbuche (Carpinus) gehört zu den Birkengewächsen, die Rotbuche (Fagus) zu den Buchengewächsen.' },
      { f: 'Woran erkennst du das Blatt der Hainbuche?', a: ['Doppelt gesägter Rand und gefaltet zwischen den Nerven', 'Ganzrandig mit gewelltem Rand', 'Tief gelappt'], r: 0, e: 'Ganzrandig ist die Rotbuche, gelappt die Eiche.' },
      { f: 'Wie sieht ein Hainbuchenstamm aus?', a: ['Grau, glatt, mit Längswülsten wie gedreht', 'Rotbraun und schuppig', 'Tief längsrissig und dunkel'], r: 0, e: 'Der wulstige, „spannrückige“ Stamm ist das sicherste Merkmal.' }
    ]
  },
  fichte: {
    titel: 'Fichte', latein: 'Picea abies', kategorie: 'Baumarten', art: true,
    modul: 'FG.5 Botanik II – Gehölzbestimmung (2. Semester)',
    kurz: 'Spitze, stechende Nadeln rund um den Zweig. Die Zapfen hängen nach unten.',
    merkmale: [
      ['Nadel', 'Vierkantig, spitz und stechend, rundum am Zweig auf kleinen Stielchen (Nadelkissen). Ohne Nadeln fühlt sich der Zweig rau an.'],
      ['Rinde', 'Rötlich- bis graubraun, in dünnen Schuppen.'],
      ['Zapfen', 'Hängend, fällt als Ganzes ab. Zapfen am Waldboden stammen fast immer von der Fichte, nicht von der Tanne.'],
      ['Wurzel', 'Flachwurzler. Deshalb wirft Sturm sie leicht um, und bei Trockenheit leidet sie schnell.'],
      ['Verwechslung', 'Die Weißtanne hat weiche Nadeln mit zwei weißen Streifen unten, und ihre Zapfen stehen aufrecht.']
    ],
    text: 'Die Fichte war lange der „Brotbaum“ der Forstwirtschaft, weil sie schnell wächst und gutes Bauholz liefert. Viele Fichtenwälder wurden außerhalb ihres natürlichen Gebiets gepflanzt. Nach den Dürrejahren ab 2018 hat der Borkenkäfer (Buchdrucker) dort riesige Flächen absterben lassen. Darum werden heute viele Fichtenbestände in Mischwälder umgebaut.',
    fotos: ['fichte-baum', 'fichte-blatt', 'fichte-rinde', 'fichte-knospe', 'fichte-frucht'],
    fragen: [
      { f: 'Wie hängen die Zapfen der Fichte am Baum?', a: ['Nach unten hängend', 'Aufrecht stehend wie Kerzen', 'Sie hat keine Zapfen'], r: 0, e: 'Fichtenzapfen hängen. Aufrecht stehen die Zapfen der Tanne, die am Baum zerfallen.' },
      { f: 'Warum wirft der Sturm Fichten besonders leicht um?', a: ['Sie hat flache Wurzeln', 'Sie hat eine Pfahlwurzel', 'Ihre Krone ist im Winter kahl'], r: 0, e: 'Als Flachwurzler hat die Fichte wenig Halt, vor allem auf nassen Böden.' },
      { f: 'Welches Insekt hat nach den Dürrejahren viele Fichtenwälder zerstört?', a: ['Der Buchdrucker, ein Borkenkäfer', 'Der Maikäfer', 'Der Eichenprozessionsspinner'], r: 0, e: 'Der Buchdrucker brütet unter der Rinde geschwächter Fichten und kann ganze Bestände töten.' }
    ]
  },
  waldkiefer: {
    titel: 'Waldkiefer', latein: 'Pinus sylvestris', kategorie: 'Baumarten', art: true,
    modul: 'FG.5 Botanik II – Gehölzbestimmung (2. Semester)',
    kurz: 'Je zwei Nadeln zusammen. Oben am Stamm fuchsrote, dünne Rinde.',
    merkmale: [
      ['Nadel', 'Immer zu zweit aus einer Scheide, 4–7 cm lang, oft leicht gedreht, blaugrün.'],
      ['Rinde', 'Unten grobe, dunkle Borke. Oben fuchsrot bis orange und dünn abblätternd („Spiegelrinde“).'],
      ['Zapfen', 'Klein und kegelförmig, reift erst im zweiten Jahr.'],
      ['Wuchs', 'Alte Kiefern haben einen langen, astfreien Stamm und eine schirmartige Krone.'],
      ['Standort', 'Sehr genügsam: wächst auch auf armem, trockenem Sand.']
    ],
    text: 'Die Waldkiefer ist eine Lichtbaumart und Pionierin: Sie besiedelt offene, arme Böden als eine der ersten. Mit ihrer Pfahlwurzel steht sie sturmfester als die Fichte. Im Schönbuch wächst sie gern auf den sandigen Böden über dem Stubensandstein. Holz: harzreich, für Bauholz, Fenster, Möbel und Paletten.',
    fotos: ['waldkiefer-baum', 'waldkiefer-blatt', 'waldkiefer-rinde', 'waldkiefer-knospe', 'waldkiefer-frucht'],
    fragen: [
      { f: 'Wie viele Nadeln wachsen bei der Waldkiefer zusammen?', a: ['Zwei', 'Eine einzelne', 'Fünf'], r: 0, e: 'Zwei Nadeln pro Kurztrieb. Fünf Nadeln hat zum Beispiel die Zirbe.' },
      { f: 'Woran erkennst du eine alte Kiefer schon von Weitem?', a: ['Fuchsrote Rinde oben am Stamm', 'Silbergraue, glatte Rinde', 'Gelbes Herbstlaub'], r: 0, e: 'Die orange „Spiegelrinde“ im oberen Stamm ist typisch für die Waldkiefer.' },
      { f: 'Auf welchen Böden kommt die Waldkiefer noch gut zurecht?', a: ['Auf armem, trockenem Sand', 'Nur auf nassen, nährstoffreichen Böden', 'Nur im Hochgebirge'], r: 0, e: 'Die Kiefer ist sehr genügsam und eine typische Baumart auf Sand.' }
    ]
  },
  entwicklungsstufen: {
    titel: 'Entwicklungsstufen eines Bestandes', kategorie: 'Waldbau',
    modul: 'FG.6 Waldbaugrundlagen – Bestandesbeschreibung (2. Semester)',
    kurz: 'Jungwuchs → Dickung → Stangenholz → Baumholz. So beschreibt man, wie alt und groß ein Bestand ist.',
    merkmale: [
      ['Jungwuchs', 'Junge Pflanzen, noch ohne geschlossenes Dach, meist unter Kniehöhe bis etwa Brusthöhe.'],
      ['Dickung', 'Die jungen Bäume schließen sich zu einem dichten, kaum begehbaren Dickicht.'],
      ['Stangenholz', 'Die unteren Äste sterben ab, die Stämme sind noch dünn wie Stangen (grob 7–20 cm Durchmesser in Brusthöhe).'],
      ['Baumholz', 'Ausgewachsene Stämme, ab etwa 20 cm Durchmesser. Sehr alte Bestände nennt man auch Altholz.']
    ],
    text: 'Die Grenzen werden in der Praxis über den Brusthöhendurchmesser (BHD, gemessen in 1,30 m Höhe) gezogen, im Detail je nach Bundesland und Verfahren etwas unterschiedlich. Für jede Stufe gibt es typische Pflegearbeiten. Mit der Entwicklungsstufe beginnt jede Bestandesbeschreibung.',
    fotos: [],
    fragen: [
      { f: 'Ein Bestand ist so dicht, dass du kaum hindurchkommst, die Bäume sind etwa mannshoch. Welche Stufe?', a: ['Dickung', 'Baumholz', 'Stangenholz'], r: 0, e: 'Dicht geschlossenes, junges Dickicht nennt man Dickung.' },
      { f: 'In welcher Höhe misst man den Brusthöhendurchmesser (BHD)?', a: ['1,30 m', '0,50 m', '2,00 m'], r: 0, e: 'Der BHD wird in 1,30 m über dem Boden gemessen.' },
      { f: 'Dünne Stämme, unten schon ohne grüne Äste. Welche Stufe?', a: ['Stangenholz', 'Jungwuchs', 'Altholz'], r: 0, e: 'Im Stangenholz sterben die unteren Äste ab, die Stämme sind noch dünn.' }
    ]
  },
  auszeichnen: {
    titel: 'Markierungen an Bäumen', kategorie: 'Waldbau',
    modul: 'FH.18 Waldbautechnik – Pflege und Durchforstung (3.–4. Semester)',
    kurz: 'Farbzeichen am Stamm zeigen, welche Bäume gefällt werden, welche bleiben und wo Rückegassen verlaufen.',
    merkmale: [
      ['Auszeichnen', 'Förster/innen markieren vor einer Durchforstung die Bäume, die entnommen werden, damit die besten Bäume mehr Platz bekommen.'],
      ['Rückegasse', 'Feste Fahrlinien für Maschinen, oft mit Strichen markiert. Abseits davon fährt keine Maschine, das schont den Boden.'],
      ['Habitatbaum', 'Bäume mit Höhlen oder Pilzen werden oft dauerhaft gekennzeichnet und bleiben stehen, für Spechte, Fledermäuse und Käfer.']
    ],
    text: 'Welche Farbe und welches Zeichen was bedeutet, legt jeder Betrieb selbst fest. Auszeichnen gehört zu den wichtigsten Aufgaben in der Revierleitung, denn damit wird über die Zukunft des Bestandes entschieden.',
    fotos: [],
    fragen: [
      { f: 'Wozu markiert man Bäume vor einer Durchforstung?', a: ['Damit klar ist, welche Bäume entnommen werden', 'Nur zur Verschönerung', 'Damit Wanderer den Weg finden'], r: 0, e: 'Beim Auszeichnen wird festgelegt, welche Bäume weichen, damit die besten mehr Licht und Platz bekommen.' },
      { f: 'Warum fahren Maschinen nur auf Rückegassen?', a: ['Um den Waldboden zu schonen', 'Weil es dort schöner ist', 'Weil dort die dicksten Bäume stehen'], r: 0, e: 'Schwere Maschinen verdichten den Boden. Feste Gassen begrenzen den Schaden auf wenige Streifen.' }
    ]
  },
  nachhaltigkeit: {
    titel: 'Nachhaltigkeit', kategorie: 'Wald und Gesellschaft',
    modul: 'FG.6 Waldbaugrundlagen – Wald- und Forstgeschichte (1. Semester)',
    kurz: 'Nicht mehr Holz ernten, als nachwächst. Der Begriff stammt aus der Forstwirtschaft.',
    merkmale: [
      ['Herkunft', 'Hans Carl von Carlowitz beschrieb 1713 in der „Sylvicultura oeconomica“ eine „nachhaltende“ Nutzung des Waldes.'],
      ['Grundidee', 'Pro Jahr wird höchstens so viel Holz geerntet, wie im ganzen Betrieb nachwächst.'],
      ['Heute', 'Nachhaltigkeit umfasst neben dem Holz auch Naturschutz, Erholung, Wasser und Klimaschutz.']
    ],
    text: 'Damals drohte wegen des großen Holzbedarfs von Bergbau und Hüttenwesen eine Holznot. Die Forsteinrichtung plant bis heute alle zehn Jahre, wie viel geerntet werden darf.',
    fotos: [],
    fragen: [
      { f: '„Ist es nicht schlimm, dass hier im Wald Bäume gefällt werden?“', a: ['Wir ernten nicht mehr, als nachwächst, und schaffen Platz für junge Bäume', 'Ja, eigentlich darf man im Wald nie Bäume fällen', 'Das Holz wird nur verbrannt, damit es weg ist'], r: 0, e: 'Nachhaltige Forstwirtschaft heißt: Ernte und Zuwachs bleiben im Gleichgewicht.' },
      { f: 'Wer hat den Begriff der Nachhaltigkeit in der Forstwirtschaft geprägt?', a: ['Hans Carl von Carlowitz, 1713', 'Alexander von Humboldt, 1850', 'Die UNO, 1992'], r: 0, e: 'Carlowitz beschrieb 1713 die „nachhaltende Nutzung“ des Waldes.' }
    ]
  },
  polter: {
    titel: 'Holzpolter', kategorie: 'Holz und Technik',
    modul: 'FH.14 Rundholzverwendung (3. Semester)',
    kurz: 'Ein Stapel Rundholz am Waldweg, der auf die Abfuhr wartet.',
    merkmale: [
      ['Was', 'Gefällte, entastete Stämme oder Abschnitte, an einem LKW-befahrbaren Weg gestapelt.'],
      ['Nummer', 'Jeder Polter bekommt eine Nummer, damit Käufer und Fuhrunternehmen das richtige Holz abholen.'],
      ['Sortieren', 'Das Holz wird nach Baumart, Länge, Stärke und Qualität getrennt, weil jedes Sortiment einen anderen Käufer hat.']
    ],
    text: 'Vom Polter geht das Holz ins Sägewerk, in die Papier- und Plattenindustrie oder wird als Brennholz verkauft. Das Sortieren lernst du im Studium in „Rundholzsortierung“.',
    fotos: [],
    fragen: [
      { f: 'Was ist ein Polter?', a: ['Gestapeltes Rundholz am Waldweg zur Abholung', 'Ein Hochsitz für die Jagd', 'Eine Pflanzmaschine'], r: 0, e: 'Polter = am Weg gelagertes Rundholz, sortiert und nummeriert.' },
      { f: 'Warum bekommt jeder Polter eine Nummer?', a: ['Damit das richtige Holz an den richtigen Käufer geht', 'Damit Wanderer sie zählen können', 'Weil das Gesetz es bei jedem Baum verlangt'], r: 0, e: 'Die Nummer verbindet den Polter mit Holzliste, Kaufvertrag und Abfuhrauftrag.' }
    ]
  },
  holzernte: {
    titel: 'Holzernte und Sicherheit', kategorie: 'Holz und Technik',
    modul: 'FG.9 Grundlagen der Waldarbeit – Arbeitssicherheit (2. Semester)',
    kurz: 'Waldarbeit gehört zu den gefährlichsten Berufen. Schutzausrüstung und Abstand sind Pflicht.',
    merkmale: [
      ['Schutzausrüstung', 'Helm mit Gehör- und Gesichtsschutz, Schnittschutzhose, Sicherheitsschuhe mit Schnittschutz, Handschuhe, Signalkleidung.'],
      ['Gefahrenbereich', 'Beim Fällen gilt rund um den Baum mindestens die doppelte Baumlänge als Gefahrenbereich.'],
      ['Jahreszeit', 'Geerntet wird vor allem im Herbst und Winter: Die Brut- und Setzzeit wird geschont, gefrorener Boden trägt Maschinen besser, und das Holz ist in der Saftruhe.']
    ],
    text: 'Moderne Holzernte läuft oft mit Harvester und Forwarder, in steilem Gelände auch mit Seilkran. Für Starkholz und schwierige Bäume braucht es weiter Forstwirte mit der Motorsäge.',
    fotos: [],
    fragen: [
      { f: 'Wie groß ist beim Fällen der Gefahrenbereich um den Baum?', a: ['Mindestens die doppelte Baumlänge', 'Etwa fünf Meter', 'Eine halbe Baumlänge'], r: 0, e: 'In diesem Bereich darf sich beim Fällen niemand außer der fällenden Person aufhalten.' },
      { f: 'Warum wird vor allem im Winter Holz geerntet?', a: ['Brutzeit geschont, Boden trägt besser, Saftruhe', 'Weil im Sommer Holzfällen verboten ist', 'Weil Bäume im Winter leichter sind'], r: 0, e: 'Naturschutz, Bodenschutz und Holzqualität sprechen für die Ernte im Winterhalbjahr.' }
    ]
  },
  schoenbuch: {
    titel: 'Naturpark Schönbuch', kategorie: 'Orte', ort: true,
    modul: 'FG.2 Umwelt- und Naturschutz (1.–2. Semester)',
    kurz: 'Großes, fast geschlossenes Waldgebiet zwischen Tübingen, Herrenberg und Böblingen.',
    merkmale: [
      ['Lage', 'Zwischen Tübingen, Herrenberg, Böblingen und Stuttgart, gleich hinter Rottenburg.'],
      ['Schutz', 'Seit 1972 Naturpark, der erste in Baden-Württemberg.'],
      ['Wald', 'Buchen- und Eichenwälder, dazu Fichten- und Kiefernbestände. Der Untergrund ist Keuper mit Sandsteinen.']
    ],
    text: 'Der Schönbuch ist ein beliebtes Erholungsgebiet für die ganze Region Stuttgart. Für Förster/innen heißt das: Holzernte, Naturschutz und viele Besucher müssen gleichzeitig unter einen Hut.',
    fotos: ['ort-schoenbuch'],
    fragen: []
  },
  bebenhausen: {
    titel: 'Kloster Bebenhausen', kategorie: 'Orte', ort: true,
    modul: 'FG.6 Wald- und Forstgeschichte (1. Semester)',
    kurz: 'Ehemaliges Zisterzienserkloster mitten im Schönbuch, später Jagdschloss der württembergischen Könige.',
    merkmale: [
      ['Kloster', 'Im Mittelalter gegründet, besaß große Teile des Schönbuchs.'],
      ['Jagd', 'Die württembergischen Könige nutzten Bebenhausen als Jagdschloss für die Jagd im Schönbuch.']
    ],
    text: 'Wem der Wald gehörte, bestimmte über Jahrhunderte, wie er genutzt wurde: Weide, Holz für die Dörfer, Jagd für den Adel. Die heutigen Waldbilder erzählen davon.',
    fotos: ['ort-bebenhausen'],
    fragen: []
  },
  schaichtal: {
    titel: 'Schaichtal', kategorie: 'Orte', ort: true,
    modul: 'FG.2 Umwelt- und Naturschutz (1.–2. Semester)',
    kurz: 'Naturnahes Bachtal im Schönbuch mit Auwald und Feuchtwiesen.',
    merkmale: [
      ['Bach', 'Die Schaich fließt durch ein enges, bewaldetes Tal.'],
      ['Schutz', 'Ein großer Teil des Tals steht unter Naturschutz.']
    ],
    text: 'An Bächen wachsen andere Baumarten als am trockenen Hang, etwa Schwarzerle und Esche. Bachtäler sind wichtige Lebensräume und werden bei der Waldarbeit besonders geschont.',
    fotos: ['ort-schaichtal'],
    fragen: []
  }
};

window.ARTEN = ['rotbuche', 'traubeneiche', 'hainbuche', 'fichte', 'waldkiefer'];
window.STUFEN = { jungwuchs: 'Jungwuchs', dickung: 'Dickung', stangenholz: 'Stangenholz', baumholz: 'Baumholz' };
