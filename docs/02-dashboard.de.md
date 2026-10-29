# 02 · Das Dashboard

*English: [02-dashboard.md](02-dashboard.md) · Nederlands: [02-dashboard.nl.md](02-dashboard.nl.md)*

**Kurz gesagt**
- Die Startseite beantwortet eine Frage: *Was tut Batterijplan gerade, und holt es mehr aus dem Speicher als HBC allein?* Alles passt auf einen Bildschirm.
- Oben eine Reihe von Knöpfen. Einstellungen, Sensoren, Empfehlung und Ertrag liegen hinter einem Knopf und öffnen sich als Fenster.
- Jede eigene Karte hat ein **(i)** neben dem Titel, und auf der Statuskarte und in den Einstellungen hat auch jede Zeile eins. Klicke darauf für das Fenster *Wie liest man das?* Fahre mit der Maus über eine Zahl mit gepunkteter Linie für einen kurzen Hinweis.
- Die Farben sind überall gleich: **grün** = entladen in einer teuren Viertelstunde, **orange** = für später halten, **lila** = Überschuss entladen.

<p align="center"><img src="images/dashboard.png" width="95%" alt="Batterijplan Dashboard"></p>

Die Seite hat drei Reihen:
1. die Knopfleiste;
2. die Statuskarte, rechts daneben der Plan;
3. die Grafik über die volle Breite.

## Die Knopfleiste

| Knopf | Was er tut |
|---|---|
| **Live** (eigener Schalter, ganz vorne) | Grün und an = Batterijplan steuert HBC nach. Aus = Schattenmodus: Es rechnet mit, steuert aber nichts. |
| **Ertrag** | Öffnet *Was bringt es*. |
| **HBC-Empfehlung** | Öffnet *Empfehlung für HBC*. |
| **Einstellungen** | Öffnet die Einstellungen, mit den Reitern Basis und Experte. |
| **Sensoren** | Öffnet die Sensornamen, die Kontrolle *Hausverbrauch jetzt* und die Erklärung. |

Ein **orangefarbener Punkt** auf einem Knopf bedeutet: Hier ist etwas zu tun. Zum Beispiel eine Empfehlung, etwas zu ändern, eine Einstellung, die nicht ausgefüllt ist, oder ein Sensor, der nichts meldet. Kein Punkt bedeutet, dass alles passt.

Ein Fenster schließt du mit **‹ Zurück** oder ✕ oben, mit einem Klick daneben oder mit Esc. Das Fenster *Wie liest man das?* schließt du genauso; du kommst dann dorthin zurück, wo du warst.

## Statuskarte

Oben das Logo, der Name und die Version, mit der Frage, die Batterijplan beantwortet. Jede Zeile hat rechts ein **(i)** mit Erklärung.

| Zeile | Bedeutung |
|---|---|
| Modus | **live** — steuert HBC, oder **Schatten** — rechnet mit, steuert nichts. |
| Verbrauch lernen | Während des Lernens zum Beispiel "lernt · Tag 3 von 7 · Prognose ordentlich". Nach 7 Tagen: "fertig gelernt · Prognose gut". |
| HBC-Strategie | Muss **Dynamic** sein. Steht dort etwas anderes, wartet der Plan. |
| Nächste Viertelstunde | Was Batterijplan für die nächste Viertelstunde entscheidet. |

**Die Prognose** sagt, wie gut der gelernte Verbrauch den echten Verbrauch trifft, pro Block von 3 Stunden. Du siehst nur ein Urteil, keinen Prozentwert:

| Urteil | Farbe |
|---|---|
| wird noch gemessen | normaler Text |
| schwankend | normaler Text |
| ordentlich | hellgrün |
| gut | grün |
| sehr gut | dunkelgrün |
| ausgezeichnet | das dunkelste Grün |

## Plan heute und morgen

- Oben vier Zahlen: **In der Batterie jetzt**, wie lange **entladen in teuren Viertelstunden** wird, wie lange **für später halten** gilt, und wie viel **Überschuss** entladen wird.
- Pro Tag ein Balken von 00:00 bis 24:00. Nur die Momente, in denen Batterijplan etwas anderes tut als HBC, haben eine Farbe. Leere Stücke bedeuten: HBC macht das Übliche. Der blaue Strich ist jetzt.
- Darunter die Blöcke in Worten, zum Beispiel "Di 08:30–10:30 Überschuss entladen · ± 0,65 kWh, ± € 0,10". Gibt es nichts zu tun: "Nichts zu steuern bis Di 13:00: HBC macht das Übliche."
- Der Balken für morgen erscheint, sobald HBC die Preise von morgen hat (meist gegen 13:00).

## Preis und Batterie

**Die Datumsauswahl** steht rechts in der Kopfzeile der Grafik. Wähle *Jetzt*, einen anderen Tag, eine Woche oder einen Monat, und blättere mit ‹ ›.

- **Pro Tag:**
  - die graue Linie ist der Strompreis pro Viertelstunde, so wie HBC ihn liefert;
  - die farbigen Flächen sind die Viertelstunden, in denen Batterijplan nachsteuert;
  - die blaue Linie ist die Ladung in kWh (Achse rechts): **durchgezogen = gemessen**, **gestrichelt = erwartet laut Plan**. Nach dem Ende des Plans blendet sie aus;
  - die **rote gepunktete Linie** ist die Ladung, wenn HBC es allein getan hätte;
  - links von *Jetzt* ist vorbei und etwas gedämpft.
- **Der Unterschied zu HBC allein** steht als Chip im Kopf: *Mehr als HBC allein*. Mehr als 0 steht als **+ € 0,35** in Grün, genau 0 als **€ 0,00** in Grau, weniger als 0 als **– € 0,02** in Orange. Dieselbe Regel gilt für *Ertrag in diesem Zeitraum* und für die Beträge in *Was bringt es*.
- **Pro Woche oder Monat:** ein grüner Balken pro Tag mit dem, was Batterijplan geschätzt gebracht hat. Oben die Summe, der Durchschnitt pro Tag und der beste Tag.
- Fahre mit der Maus über die Grafik für den Preis, was der Speicher getan hat und die Ladung in dieser Viertelstunde.

## Fenster hinter den Knöpfen

**Was bringt es**

| Zeile | Bedeutung |
|---|---|
| Gesamt seit … | Der geschätzte Ertrag zusätzlich zu HBC allein. |
| davon Schatten | Was es gebracht hätte, während *Live* aus war. Dieses Geld hast du nicht wirklich verdient. |
| davon live | Was es gebracht hat, während Batterijplan wirklich gesteuert hat. |
| Viertelstunden entladen / gehalten / Überschuss | Wie oft Batterijplan jedes der drei Dinge getan hat. |
| Ladung auf teurere Momente verschoben | Wie viele kWh durch das Halten später und teurer genutzt wurden. |

**Empfehlung für HBC**

Eine Zeile zur HBC-Einstellung *Solar reserved for house* (wie viel Solarstrom dein Haus selbst direkt verbraucht):
- **Noch am Messen** (grau): Der Verbrauch wird noch gelernt, oder es wurde noch keine Woche gemessen.
- **Passt** (grün): Deine Einstellung liegt weniger als 1 kWh neben dem, was in den letzten 7 Tagen im Schnitt nötig war.
- **Ändern auf 5,5 kWh** (orange): darunter, was jetzt eingestellt ist und was im Schnitt nötig war. Der Knopf *HBC-Empfehlung* bekommt dann einen orangefarbenen Punkt.

Ist zusätzliches Laden aus dem Netz heute Nacht sinnvoll, steht das auch dabei. Batterijplan ändert HBC nie selbst; du entscheidest. Siehe [03 · So funktioniert es](03-how-it-works.de.md#empfehlung-für-hbc).

**Einstellungen**

Zwei Reiter, mit eigenen Eingabefeldern (Schieberegler, Auswahlknöpfe, − Wert +) und bei jedem Feld ein (i):

| Reiter | Was darauf steht |
|---|---|
| **Basis** — einstellen und vergessen | Nutzbare Kapazität, *Preise von HBC* (kaal oder all-in), Beginn des Stromvertrags, und die Sicherung: **Sicherung erstellen**, **Sicherung wiederherstellen** und **Standardwerte**. Darunter steht, wann die letzte Sicherung erstellt wurde. Wiederherstellen und Standardwerte fragen zuerst "Sicher? Nochmal tippen". |
| **Experte** — nur ändern, wenn du weißt warum | Sicherheitsreserve, Wirkungsgrad und Energiesteuer + Einkaufsaufschlag. |

Die Erklärung pro Feld steht auch in [01 · Installation](01-installation.de.md#schritt-6--einstellungen-ausfüllen).

**Sensoren**

Die Namen deiner Sensoren für Netz, Sonne, Speicher und (optional) Wallbox. Tippe auf ein Feld für eine Liste der Leistungssensoren in deinem Home Assistant (die wahrscheinlichsten oben) und wähle; Tippen filtert die Liste. Unter jedem Namen steht, was dieser Sensor gerade meldet. Unten die Kontrolle *Hausverbrauch jetzt*.
