# 07 · Verträge, Nebenzeiten und Flandern

*English: [07-contracts-and-flanders.md](07-contracts-and-flanders.md) · Nederlands: [07-contracts-and-flanders.nl.md](07-contracts-and-flanders.nl.md)*

> **Pre-Release 2.0.0-dev1.** Dieses Kapitel beschreibt, was in der Pre-Release für Tester neu ist. Die letzte vollständige Version bleibt 1.1.0.

**Kurz gesagt**
- Du wählst deine **Vertragsart**: *Fest* oder *Dynamisch*. Bei *Fest* wählst du außerdem einen **Tarif**: *Eintarif* oder *Zweitarif*.
- *Dynamisch* funktioniert wie bisher. Bei *Fest* macht Batterijplan keinen Plan nach Preis: HBC bleibt auf **Self-consumption**, und in der Nebenzeit eines Zweitarifs lädt es aus dem Netz, aber **nur wenn sich das lohnt**.
- Das **Land** kommt jetzt aus Home Assistant. Ein eigener Schalter **Flandern (Kapazitätstarif)** schaltet die Viertelstundenberechnung für den flämischen Kapazitätstarif ein.

## Vertragsart und Tarif

Öffne *Einstellungen*, Reiter **Vertrag**.

| Einstellung | Was sie tut |
|---|---|
| **Vertragsart** | *Dynamisch*: HBC auf Dynamic und Batterijplan macht den Plan, wie bisher. *Fest*: kein Plan nach Preis. |
| **Tarif** (nur bei *Fest*) | *Eintarif*: ein Preis den ganzen Tag. *Zweitarif*: ein Normaltarif und ein Nebenzeittarif. |
| **Preis pro kWh** / **Normaltarif** und **Nebenzeittarif** | Deine Preise inklusive Steuern und MwSt. Die Felder behalten fünf Dezimalstellen, weil Lieferanten fünf nennen. Im Dashboard siehst du zwei Dezimalstellen. |
| **Einspeisevergütung pro kWh** | Was du für eingespeisten Strom bekommst. HBC hat dafür keine eigene Einstellung, darum trägst du sie hier ein. |

Zeilen, die nicht zu deiner Wahl passen, sind grau mit einem kurzen Grund (zum Beispiel *Nur bei einem dynamischen Vertrag*). Nichts wird versteckt oder entfernt.

Batterijplan ändert HBC nur, wenn **Live** an ist. Es merkt sich deine eigene HBC-Strategie und gibt sie zurück, wenn Live ausgeht oder du zu *Dynamisch* zurückgehst.

## Was HBC bei einem Festvertrag tut

- **Außerhalb der Nebenzeit: Self-consumption (NOM, „null am Zähler“).** Die Batterie deckt den Hausverbrauch und lädt mit Solarüberschuss, innerhalb der Lade- und Entladeleistung deiner Batterien.
- **In der Nebenzeit eines Zweitarifs: Charge**, aus dem Netz bis zum Ladeziel von HBC, **nur wenn es sich lohnt** (siehe unten). Sonst bleibt HBC die ganze Zeit auf Self-consumption.

### Nebenzeiten, Wochenende und Feiertage

- **Nachtstunden:** von *Nacht beginnt* bis *Nacht endet*. Standard: **23:00–07:00** in den Niederlanden, **22:00–07:00** in Belgien. Manche Netzbetreiber beginnen früher (Enexis: 21:00): stelle die Uhrzeit selbst ein.
- **Wochenende und Feiertage als Nebenzeit:** ein Schalter, Standard **an** in den Niederlanden und **aus** in Belgien. An = Samstag, Sonntag und Feiertage sind den ganzen Tag Nebenzeit.
  - Niederlande: 1. Januar, Ostermontag, Königstag (27. April, 26. April wenn der 27. ein Sonntag ist), Christi Himmelfahrt, Pfingstmontag, 25. und 26. Dezember.
  - Belgien: 1. Januar, Ostermontag, 1. Mai, Christi Himmelfahrt, Pfingstmontag, 21. Juli, 15. August, 1. November, 11. November, 25. Dezember.
  - Andere Länder: nur das Wochenende.

### Lohnt sich das Laden aus dem Netz?

Laden aus dem Netz in der Nebenzeit lohnt sich nur, wenn der Preisunterschied groß genug ist, um die Verluste in der Batterie zu decken. Batterijplan verwendet dafür eine Schwelle, **dieselbe, die HBC selbst verwendet**: die HBC-Einstellung *Dynamic threshold delta* (in ct). Es gibt keinen eigenen festen Wert.

- **Unterschied (Normaltarif − Nebenzeittarif) mindestens die Schwelle:** HBC geht in der Nebenzeit auf Charge.
- **Unterschied unter der Schwelle:** HBC bleibt auf Self-consumption. Der Bericht sagt: *Laden aus dem Netz lohnt sich nicht: Unterschied 2,7 ct, Schwelle 6,0 ct*, und die Regel *Nachtladen* zeigt *aus (lohnt nicht)*.
- **Ausnahme, Flandern an:** Laden in der Nebenzeit darf dann die Reserve für Spitzen füllen, unabhängig vom Preisunterschied, aber nur solange unter der Zielgrenze Platz ist.

## Land aus Home Assistant

Die Länder-Einstellung von Batterijplan entfällt. Batterijplan liest das Land aus Home Assistant (*Einstellungen → System → Allgemein*): **NL**, **BE** oder **DE**; alles andere zählt als Niederlande. Das Land bestimmt die Nebenzeiten, die Feiertage und die Wörter (Normaltarif / Nebenzeittarif in den Niederlanden, Tagpreis / Nachtpreis in Belgien, HT / NT in Deutschland).

> **Deutschland:** Das Land in Home Assistant muss **DE** sein, damit die deutschen Regeln (feste Einspeisevergütung) gelten.

## Flandern (Kapazitätstarif)

Der Schalter **Flandern (Kapazitätstarif)** (Standard aus, unabhängig vom Land in Home Assistant) schaltet ein:

- die **Viertelstundenberechnung** aus deinem Netzleistungssensor (der Mittelwert pro Viertelstunde, wie der Zähler);
- die **Monatsspitze**: der höchste Viertelstundenmittelwert deines Netto-Bezugs in diesem Monat;
- die **Zielgrenze**: die höchste aus deiner Monatsspitze bisher, **2,5 kW** und deiner eigenen Grenze;
- die **Importgrenze von HBC** (nur bei Live an): innerhalb einer Viertelstunde setzt Batterijplan die erlaubte Importleistung so, dass die Viertelstunde unter der Zielgrenze bleibt (`(Budget − schon bezogen) / Reststunden`, mindestens 0,5 kW). Es schreibt nur, wenn sich der Wert um mehr als 100 W ändert und höchstens einmal pro Minute, und bei jedem Viertelstundenwechsel geht es zurück auf die Zielgrenze. Deine eigenen HBC-Werte (Grenze an/aus und Wert) werden gemerkt und zurückgegeben, wenn Live oder Flandern ausgeht.
- alles in **kW** mit einer Dezimalstelle.

Einstellungen im Reiter **Flandern**: der Kapazitätstarif in €/kW/Jahr (Standard 55) und eine optionale **eigene Grenze** in kW (0 = keine).

### Die Karten *Spitze diesen Monat* und *Laufende Viertelstunde*

Sie liegen im Fenster **Spitze** und sind nur sichtbar, wenn Flandern an ist.

- **Spitze diesen Monat:** pro Tag die höchste Viertelstundenspitze (gefüllte Linie) mit der Zielgrenze (gepunktet) und eine graue Linie für die Spitze, die du **ohne Batterie** gehabt hättest. Darunter die Monatsspitzen der letzten 12 Monate, neu nach alt, mit Trendpfeil, der Spitze **mit** und **ohne** Batterie und der Ersparnis dieses Monats (Unterschied in kW × Tarif ÷ 12). Beide Spitzen zählen mindestens 2,5 kW, wie Fluvius rechnet. Darunter: der Durchschnitt der letzten 12 Monatsspitzen mit und ohne Batterie und die Ersparnis pro Jahr.
- **Laufende Viertelstunde:** der Mittelwert bisher, was noch erlaubt ist und die HBC-Grenze, die jetzt gesetzt ist.

*Ohne Batterie* ist dein Netzbezug plus die Batterieleistung (Entladen +, Laden −), mit derselben Viertelstundenberechnung.

## Der Hauptbildschirm bei einem Festvertrag

- **Bericht (Briefing):** Vertrag und Tarif, der Preis jetzt, wann das Laden aus dem Netz beginnt oder endet (oder dass es sich nicht lohnt), die Wochenendregel, die Einspeisevergütung und, mit Flandern an, die Monatsspitze. Die vier Regeln des Plans sind grau (*Nur bei dynamischem Vertrag*). Der Block *Regeln* zeigt bei einem Zweitarif *Nachtladen* und *Wochenende und Feiertage als Nebenzeit* und *Flandern*, wenn es an ist: nur Name und an/aus.
- **Statuskarte:** die HBC-Strategie als *Self-consumption (Normaltarif)* oder *Charge (Nebenzeittarif)* und der Preis jetzt mit zwei Dezimalstellen.
- **Diagramm:** die **gemessene Ladung** der letzten Stunden, die **erwartete Ladung** (gestrichelt) für die nächsten 30 Stunden, die Sonnenprognose und die Nebenzeiten als Hintergrundband. Unter dem Diagramm ein farbiger Balken pro Viertelstunde: **blau** Laden aus dem Netz (Nebenzeit), **grün** Entladen fürs Haus (NOM), **gelb** Laden mit Sonne, **grau** nichts (Batterie leer oder voll). Die erwartete Ladung ist eine Simulation pro Viertelstunde: außerhalb der Nebenzeit Self-consumption mit deinem gelernten Hausverbrauch und der Sonnenprognose, in der Nebenzeit Charge bis zum Ladeziel von HBC, wenn es sich lohnt. Verluste sind nicht modelliert.
- **Zeitleiste** unter *Was die Batterie tut*, zum Beispiel *Jetzt: deckt deinen Hausverbrauch (NOM) · voraussichtlich leer gegen 21:30 · 23:00–07:00 Laden aus dem Netz bis 9,0 kWh · morgen tagsüber NOM, Sonne füllt auf*. „Heute“, „morgen“ und ein Wochentag zählen ab jetzt.
- **Fenster Heute und der Bericht:** keine Plantexte. Sie zeigen den Vertrag, die Preise, die Nebenzeiten, ob sich Nachtladen lohnt, das NOM-Verhalten und den Eigenverbrauch über die Batterie (kWh ins Haus, mit Sonne geladen, aus dem Netz geladen). Mit Flandern an hat der Bericht außerdem einen Abschnitt *Kapazitätstarif (Flandern)*.

### Was die Batterie bei einem Festvertrag einbringt

*Ertrag* bewertet jede Viertelstunde zu deinen Preisen: Entladen fürs Haus zählt zum Preis, Laden aus dem Netz kostet den Preis, Laden mit Sonne kostet die Einspeisevergütung, die du dadurch nicht mehr bekommst, und Entladen ins Netz bringt die Einspeisevergütung.

## Update von 1.1.0 (oder einer früheren Pre-Release)

Es geht nichts verloren. Beim ersten Start von 2.0.0-dev1:

- ein gespeichertes Land **BE** schaltet den Schalter **Flandern** ein; das Land selbst kommt jetzt aus Home Assistant;
- die Länder-Einstellung und der Testmodus der früheren Testversionen verschwinden samt ihren Entitäten;
- ein Vertrag *Tag/Nacht* einer früheren Testversion wird *Fest* mit einem *Zweitarif*;
- dein gelernter Verbrauch, der Zähler und alle anderen Einstellungen bleiben, wie sie sind.
