# Batterijplan 2.0.0 — alle Änderungen seit 1.1.0

*English: [CHANGES_v2.0.0.md](CHANGES_v2.0.0.md) · Nederlands: [WIJZIGINGEN_v2.0.0.nl.md](WIJZIGINGEN_v2.0.0.nl.md)*

Das ist die vollständige Liste dessen, was sich zwischen der letzten Version 1.1.0 und 2.0.0 ändert. Sie umfasst auch alles aus der Testversion 2.0.0-dev1. Batterijplan bleibt eine eigenständige Ergänzung zu Home Battery Control (HBC).

## Neu

**Vertragsart**
- Du wählst deinen Vertrag selbst:
  - *Fest, Eintarif*: ein Preis den ganzen Tag.
  - *Fest, Zweitarif*: ein Normal- und ein Nebenzeittarif (HT/NT; in Belgien ein Tag- und ein Nachtpreis).
  - *Dynamisch*: ein Preis pro Stunde oder Viertelstunde. Das funktioniert wie in 1.1.0.
- Bei einem Festvertrag trägst du auch deine **Einspeisevergütung** ein. HBC hat dafür keine eigene Einstellung. Der Ertrag der Batterie wird dann mit deinen Preisen berechnet.
- Bei einem Festvertrag macht Batterijplan keinen Plan nach Preis. HBC steht dann auf *Self-consumption*: die Batterie deckt deinen Verbrauch und lädt mit Solarüberschuss.
- **Nachtladen bei einem Zweitarif geschieht nur, wenn es sich lohnt.** Der Unterschied zwischen Normal- und Nebenzeittarif muss mindestens die Schwelle von HBC sein. Sonst lädt die Batterie nachts nicht aus dem Netz.
- Nebenzeiten pro Land: nachts 23:00–07:00 in den Niederlanden und 22:00–07:00 in Belgien. Mit einem Schalter zählen Wochenende und Feiertage den ganzen Tag als Nebenzeit. In den Niederlanden ist dieser Schalter standardmäßig an.
- Preise gibst du mit fünf Dezimalstellen ein, so wie Lieferanten sie angeben.

**Flandern (Kapazitätstarif)**
- Ein eigener Schalter *Flandern*, standardmäßig aus.
- Er funktioniert bei **jedem Vertrag**, also auch bei einem Festtarif, und in jedem Land.
- Batterijplan misst die **Spitze pro Viertelstunde**: die mittlere Leistung, die du in jeder Viertelstunde aus dem Netz beziehst.
- Die **Zielgrenze folgt deiner Monatsspitze**. Sie ist der höchste von drei Werten: die bisherige Monatsspitze, 2,5 kW und deine eigene Grenze. Mit Live an stellt Batterijplan die Importgrenze von HBC jede Viertelstunde darauf ein. Deine eigenen HBC-Werte kommen zurück, sobald du Live oder Flandern ausschaltest.
- Neue Karten:
  - *Laufende Viertelstunde*.
  - *Spitze diesen Monat*, mit der **Monatsspitze mit und ohne Batterie** über 12 Monate und der **Ersparnis beim Kapazitätstarif** pro Monat und pro Jahr.
- Der Plan bleibt unter der Spitzengrenze. Bei einem Zweitarif darf die Batterie in der Nebenzeit als Reserve für Spitzen nachladen, aber nur unter der Zielgrenze.
- Alle Leistungen stehen in kW.

**Klüger rechnen**
- **Günstige Viertelstunden selbst erkennen.** Das ist eine neue Regel, *In jeder günstigen Viertelstunde laden*. Sie ist standardmäßig aus und funktioniert nur bei einem dynamischen Vertrag.
  - Batterijplan erkennt günstige Viertelstunden mit derselben Regel wie HBC, aber ohne die maximale Zahl günstiger Stunden pro Tag.
  - Liegt ein Ladeblock außerhalb der günstigen Stunden von HBC, stellt Batterijplan HBC für diesen Block auf *Charge* und danach wieder auf *Dynamic*.
  - Das geschieht nur, wenn HBC schon auf *Dynamic* stand.
- **Verkaufsreserve automatisch.** Das ist eine neue Regel, standardmäßig aus, nur bei einem dynamischen Vertrag. Sie entstand auf Wunsch eines Nutzers.
  - Batterijplan füllt *Keep energy in reserve* von HBC (Sell-Strategie) mit dem, was dein Haus bis zur nächsten günstigen Viertelstunde braucht, plus der Reserve des Plans.
  - So verkauft HBC in einer Sell-Viertelstunde nicht mehr, als der Plan meint. Auch das Plandiagramm rechnet mit dieser Reserve.
  - Das funktioniert nur, wenn *Sell until* in HBC auf *energy reserve* steht. Batterijplan schreibt nur bei mindestens 0,5 kWh Unterschied und höchstens einmal pro Viertelstunde.
  - Sie ist nur aktiv mit Live an und HBC auf *Dynamic* (ein *Charge*, das Batterijplan selbst setzt, zählt mit). Fällt eine Bedingung weg oder entfernst du die Integration, bekommt HBC sofort deinen eigenen Wert zurück.
- **Sonnenvorhersage mit wachsender Sicherheitsmarge.**
  - Für die nächsten Stunden rechnet der Plan mit dem Mittelwert aus normaler und vorsichtiger Schätzung.
  - Nach 24 Stunden rechnet er mit der vorsichtigen Schätzung.
  - Danach rechnet er pro Tag 10 % niedriger, höchstens 30 % weniger.
- **Dunkle Tage.** Nach den bekannten Preisen können mindestens zwei Tage fast ohne Sonne folgen. Dann **hält der Plan Ladung zurück**, bis zum erwarteten Defizit dieser Tage.
  - Er **lädt nach** in Viertelstunden, die günstiger als der Durchschnitt sind, und wählt dabei selbst die günstigsten.
  - In Flandern bleibt er dabei unter der Spitzengrenze.
- **Reserve, die mitlernt.**
  - Die Reserve beginnt bei **20 %** der Kapazität.
  - Wenn Verbrauch und Sonne zuverlässig vorhergesagt werden, sinkt sie auf **3 %**.
  - Deine eigene Sicherheitsmarge bleibt die Untergrenze.
  - Jeden Tag vergleicht Batterijplan die Sonnenvorhersage vom Morgen mit der gemessenen Sonne. Ohne Sonnensensor zählt nur der Verbrauch.
- **Verbrauch pro Wochentag als Selbsttest.** Neben dem normalen Profil lernt Batterijplan ein Profil pro Wochentag und Stunde.
  - Jede Viertelstunde sagen beide Profile vorher voraus; danach wird gemessen, welches besser war.
  - Das Wochentagsprofil wird nur genutzt, wenn es über 14 Tage mindestens 10 % besser vorhersagt.
  - Es wird in der eigenen Datei von Batterijplan gespeichert, nicht in der Datenbank von Home Assistant.

**Bildschirme**
- Der Hauptbildschirm bei einem Festvertrag zeigt:
  - eine kurze Übersicht mit deinem Vertrag, dem Preis jetzt, den Nebenzeiten und ob Nachtladen sich lohnt;
  - ein Diagramm mit gemessener und erwarteter Ladung für 30 Stunden, der Sonne und den Nebenzeiten;
  - einen farbigen Balken pro Viertelstunde und eine kurze Zeitleiste *Was die Batterie tut*.
- **Der Bericht und das Fenster Heute funktionieren für alle Vertragsformen.** Mit Flandern an haben sie einen eigenen Teil zum Kapazitätstarif.
- *Einstellungen* hat neue Reiter *Vertrag* und *Flandern*. Zeilen, die für deine Wahl nicht gelten, sind grau, mit einem kurzen Grund.

**Neue Namen für eigene Karten und Erweiterungen**
- Der Sensor *Solarprognose für HBC (Ladeziel)* hat zwei neue Eigenschaften:
  - `laaddoel_kwh`: das Ladeziel.
  - `zon_voor_huis`: die Sonne, die HBC für das Haus reserviert.
- Die alten Namen `doel` und `reserve` bleiben vorerst mit denselben Werten, damit bestehende Karten weiter funktionieren. Sie werden später ersetzt.

## Verbessert

- **Das Land kommt aus Home Assistant** (Niederlande, Belgien oder Deutschland; jedes andere Land zählt als Niederlande). Das Land bestimmt die Nebenzeiten, die Feiertage und die Wörter, die du siehst. Für die deutschen Regeln muss das Land in Home Assistant auf Deutschland stehen.
- **Die Sonnenempfehlung ist in ganzen kWh.** Die Empfehlung *Solar reserved for house* wird auf ganze kWh gerundet, weil HBC nur ganze kWh annimmt. Der orange Punkt und das automatische Anpassen von HBC reagieren erst ab 1 kWh Unterschied.
- Eine Änderung deines Vertrags, des Schalters Flandern oder deiner eigenen Grenze wird sofort an HBC weitergegeben.
- Beträge im Dashboard stehen mit zwei Dezimalstellen.
- Die Zeitleiste nennt den Tag ab jetzt: *heute*, *morgen*, danach den Namen des Wochentags.
- Die Linie *Sonne vorsichtig* im Plandiagramm zeigt den Wert mit der wachsenden Sicherheitsmarge.
- Die Empfehlung für die HBC-Einstellungen rechnet zurück, ohne die dunklen Tage von heute mitzuzählen.

## Behoben

- **Kein Hin-und-her-Wechseln mehr bei einer Neuberechnung.** Eine neue Berechnung mitten in einer Viertelstunde lässt HBC nicht mehr zwischen *Charge* und *Dynamic* hin und her wechseln. Es gibt höchstens einen Wechsel pro Viertelstunde. Schaltest du Live oder die Regel aus, geht HBC sofort zurück.
- Die Abweichung der Batterieladung zeigte manchmal „+610 %“. Das passiert nicht mehr, wenn die erwartete Ladung unbekannt oder null ist.
- Bei einem Festvertrag stand der Modus auf *Schatten*, obwohl Live an war.
- Nach einem Neustart mitten in einer Viertelstunde zählte der nicht gemessene Teil als null. Dadurch konnte die Importgrenze von HBC auf 25 kW kommen. Dieser Teil zählt jetzt mit der Zielgrenze.
- Nach einem Neustart war das Diagramm der Batterieladung leer. Es wird jetzt aus dem Verlauf von Home Assistant ergänzt.
- Die Zahl der verhinderten Spitzen zählte auch Grenzsenkungen mit, die nie wirklich an HBC geschrieben wurden.
- Eine Vertragsänderung über das Dashboard wurde nicht immer sofort auf Strategie und Grenze von HBC angewendet.
- Preise wurden auf vier Dezimalstellen gerundet gespeichert.
- In manchen Erklärfenstern (*Wie liest du das?*) standen lose Sternchen um Wörter. Sie werden jetzt kursiv gezeigt.

## Entfernt

- Die Landauswahl in den Einstellungen. Das Land kommt jetzt aus Home Assistant.
- Der Testmodus der ersten Testversionen. *Flandern an* tut in jedem Land dasselbe.

**Was beim Aktualisieren einmalig geschieht**
- Stand dein Land auf Belgien, wird der Schalter *Flandern* eingeschaltet.
- Ein Vertrag *Tag/Nacht* aus einer Testversion wird *Fest* mit *Zweitarif*.
- Landauswahl und Testmodus verschwinden, zusammen mit ihren Entitäten.
- Gelernter Verbrauch, Zähler und alle anderen Einstellungen bleiben.
- Das Wochentagsprofil und der Vergleich der Sonnenvorhersage beginnen bei null.

## Dokumentation

- Neues Kapitel *07 · Verträge, Nebenzeiten und Flandern*, mit den Teilen *Welchen Vertrag wähle ich?* und *Was stellst du in HBC ein?*.
- Neues Kapitel *08 · Klüger rechnen*: Sonnenmarge, dunkle Tage, die lernende Reserve, Verbrauch pro Wochentag, Laden in jeder günstigen Viertelstunde, die Verkaufsreserve, und die alten und neuen Namen.
- Die Installationsanleitung beschreibt das Aktualisieren auf 2.0.0 als normale Version.
- Die Dashboard-Anleitung hat einen Teil *Neu in 2.0.0*.
- Das README verweist auf die neuen Kapitel und auf diese Liste.
- Alle Texte gibt es auf Niederländisch, Englisch und Deutsch.
- Es gibt neue automatische Tests für alle neuen Rechenteile und Karten.
