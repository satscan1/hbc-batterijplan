# 02 · Das Dashboard

*English: [02-dashboard.md](02-dashboard.md) · Nederlands: [02-dashboard.nl.md](02-dashboard.nl.md)*

**Kurz gesagt**
- Links steht, wie es um Batterijplan steht, rechts der Plan und die Grafik, unten die Einstellungen.
- Jede eigene Karte hat ein **(i)** neben dem Titel: Klicke darauf für eine Erklärung. Fahre mit der Maus über eine Zahl mit gepunkteter Linie für einen kurzen Hinweis.
- Die Farben sind überall gleich: **grün** = entladen in einer teuren Viertelstunde, **orange** = für später halten, **hellgrün** = Überschuss entladen.

<p align="center"><img src="images/dashboard.png" width="95%" alt="Batterijplan Dashboard"></p>

## Oben: Logo und Badges

| Badge | Was du siehst |
|---|---|
| **Gespart gesamt** | Der geschätzte Ertrag zusätzlich zu HBC seit dem Start. |
| **Diese Energieperiode** | Dasselbe, aber ab dem Beginn deines Vertrags. Jedes Vertragsjahr fängt neu an. |
| **Prognosegenauigkeit** | Wie gut der gelernte Verbrauch den echten Verbrauch vorhersagt. In den ersten 14 Tagen grau (hell → dunkel), danach grün: je dunkler, desto besser (dunkelgrün über 90 %). |

## Links

**Batterijplan (Status)**

| Zeile | Bedeutung |
|---|---|
| Modus | **live** — steuert HBC, oder **Schatten** — rechnet mit, steuert nichts. |
| Verbrauch lernen | "lernt · Tag 3 von 14 · alle Stunden des Tages gesehen". Nach 14 Tagen: "fertig gelernt · Prognose 91 % genau". |
| HBC-Strategie | Muss **Dynamic** sein. Steht dort etwas anderes, pausiert Batterijplan. |
| Nächste Viertelstunde | Was Batterijplan für die nächste Viertelstunde entscheidet. |

**Empfehlung für HBC**

Eine Zeile zur HBC-Einstellung *Solar reserved for house* (wie viel Solarstrom dein Haus selbst direkt verbraucht):
- **Noch am Messen** (grau): Der Verbrauch wird noch gelernt, oder es wurde noch keine Woche gemessen.
- **Passt** (grün): Deine Einstellung liegt weniger als 1 kWh neben dem, was in den letzten 7 Tagen im Schnitt nötig war.
- **Ändern auf 5,5 kWh** (orange): darunter, was jetzt eingestellt ist und was im Schnitt nötig war.

Ist zusätzliches Laden aus dem Netz heute Nacht sinnvoll, steht das auch dabei. Batterijplan ändert HBC nie selbst; du entscheidest. Siehe [03 · So funktioniert es](03-how-it-works.de.md#empfehlung-für-hbc).

**Was bringt es**

| Zeile | Bedeutung |
|---|---|
| Gesamt seit … | Der geschätzte Ertrag zusätzlich zu HBC allein. |
| davon Schatten | Was es gebracht hätte, während *Live* aus war. Dieses Geld hast du nicht wirklich verdient. |
| davon live | Was es gebracht hat, während Batterijplan wirklich gesteuert hat. |
| Viertelstunden entladen / gehalten / Überschuss | Wie oft Batterijplan jedes der drei Dinge getan hat. |
| Ladung auf teurere Momente verschoben | Wie viele kWh durch das Halten später und teurer genutzt wurden. |

## Rechts

**Plan heute und morgen**

- Oben vier Zahlen: **In der Batterie jetzt**, wie lange **entladen in teuren Viertelstunden** wird, wie lange **für später halten** gilt, und wie viel **Überschuss entladen** wird.
- Pro Tag ein Balken von 00:00 bis 24:00. Nur die Momente, in denen Batterijplan etwas anderes tut als HBC, haben eine Farbe; leere Stücke bedeuten: HBC macht das Übliche. Der blaue Strich ist jetzt.
- Darunter die Blöcke in Worten, zum Beispiel "Di 08:30–10:30 Überschuss entladen · ± 0,65 kWh, ± € 0,10". Gibt es nichts zu tun: "Nichts zu steuern bis Di 13:00: HBC macht das Übliche."
- Der Balken für morgen erscheint, sobald HBC die Preise von morgen hat (meist gegen 13:00).

**Die Datumsauswahl** (unter dem Plan)

Wähle *Heute*, einen anderen Tag, eine Woche oder einen Monat, und blättere mit ‹ ›. Die Grafik darunter folgt der Auswahl.

**Preis und Batterie**

- **Pro Tag:** Die graue Linie ist der Börsenpreis pro Viertelstunde. Die farbigen Flächen sind die Viertelstunden, in denen Batterijplan nachsteuert. Die blaue Linie ist die Ladung in kWh (Achse rechts): **durchgezogen = gemessen**, **gestrichelt = erwartet laut Plan**; nach dem Ende des Plans blendet sie aus. Links von *Jetzt* ist vorbei und etwas gedämpft.
- **Pro Woche oder Monat:** ein grüner Balken pro Tag mit dem, was Batterijplan geschätzt gebracht hat. Oben die Summe, der Durchschnitt pro Tag und der beste Tag.
- Fahre mit der Maus über die Grafik für den Preis, was der Speicher getan hat und die Ladung in dieser Viertelstunde.

## Unten: Einstellungen

Fünf Kacheln über die volle Breite:

| Kachel | Was sie tut |
|---|---|
| **Back-up erstellen** | Speichert alle deine Einstellungen. |
| **Back-up wiederherstellen** | Stellt das letzte Back-up wieder her (mit Bestätigung). |
| **Standardwerte** | Setzt Sicherheitsreserve und Wirkungsgrad auf 0,3 kWh und 75 % zurück. Vorher wird ein Back-up erstellt. |
| **Live** | An = Batterijplan steuert HBC nach. Aus = Schattenmodus. |
| **Einstellungen** | An = die Eingabefelder, die Sensoren und die Erklärung klappen auf. Solange etwas fehlt, bleiben sie von selbst stehen. |

Unter den Kacheln steht, wann das letzte Back-up erstellt wurde.
