# 03 · So funktioniert es

*English: [03-how-it-works.md](03-how-it-works.md) · Nederlands: [03-how-it-works.nl.md](03-how-it-works.nl.md)*

**Kurz gesagt**
- HBC sagt pro Viertelstunde: günstig, teuer oder normal. Batterijplan schaut bis zum nächsten günstigen Moment voraus und entscheidet, welche teuren Viertelstunden die Ladung bekommen.
- Batterijplan wählt nur zwischen Stellungen, die HBC selbst anbietet. Alle Schutzfunktionen bleiben bei HBC und dem Speicher.
- Alles, was Batterijplan tut, landet im Logbuch von Home Assistant unter dem Namen "Batterijplan".

## Das Problem, das Batterijplan löst

HBC (Strategie **Dynamic**) gibt jeder Viertelstunde ein Label:
- **günstig**: laden aus dem Netz;
- **teuer**: entladen für das Haus;
- **normal**: nur mit Sonne laden (Stellung *Charge PV*).

Das funktioniert gut, aber HBC prüft nicht, ob der Speicher genug Ladung für *alle* teuren Viertelstunden bis zur nächsten Lademöglichkeit hat. Die Macher von HBC nennen das selbst als Einschränkung. Folge: Der Speicher wird bei einem teuren Moment von 27 ct leer, während eine Stunde später ein Moment von 50 ct kommt.

## Der Plan

Jede Viertelstunde, ± 45 Sekunden vor Beginn, rechnet Batterijplan bis zum nächsten günstigen Moment voraus. Dabei schaut es auf:
- wie viel Ladung jetzt in den Speichern ist (der Ladestand oberhalb der Untergrenze von HBC, mal die nutzbare Kapazität);
- wie viel dein Haus zu dieser Tageszeit üblicherweise verbraucht (das lernt es selbst);
- wie viel Sonne erwartet wird (Solcast, die vorsichtige Schätzung);
- welche teuren Viertelstunden noch kommen und was sie kosten.

Danach:

| Situation | Was Batterijplan tut | Stellung in HBC |
|---|---|---|
| Teure Viertelstunde, die die Ladung bekommt | **entladen** für das Haus | teure Stellung *Self-consumption* |
| Teure Viertelstunde, die keine Ladung bekommt (später kommt eine teurere Viertelstunde) | **für später halten** | teure Stellung *Standby / peak shave* |
| Normale Viertelstunde, im Speicher ist mehr als bis zum günstigen Moment nötig | **Überschuss entladen** in den teuersten normalen Viertelstunden | normale Stellung *Self-consumption* |
| Normale Viertelstunde ohne Überschuss | nichts, HBC macht das Übliche | normale Stellung *Charge PV* |
| Günstige Viertelstunde | nichts, HBC lädt | *Charge* |

Kommt zwischen zwei Spitzen Sonne oder ein günstiger Moment? Dann rechnet Batterijplan das als Nachladen mit, und die erste Spitze darf ganz normal entladen.

## Überschuss entladen

Manchmal ist mehr im Speicher, als das Haus bis zum nächsten günstigen Moment braucht. Ohne Batterijplan bleibt diese Ladung stehen, und HBC lädt nachher mit einem schon fast vollen Speicher nach. Batterijplan nutzt diesen Überschuss lieber jetzt, in den teuersten normalen Viertelstunden, wenn das mehr bringt, als das Zurückladen kostet (inklusive Verlust im Speicher). Es hält immer die Sicherheitsreserve fest.

## Lernen

Batterijplan misst den Hausverbrauch pro Viertelstunde (Netz + Sonne + Speicher, minus Wallbox) und baut pro Stunde des Tages ein Profil auf:

| Status | Nach | Bedeutung |
|---|---|---|
| lernt | 0–6 Tagen | Nach dem ersten Tag macht es schon mit, ist aber noch unruhig. |
| grob | 7–13 Tagen | Brauchbar, aber ein seltsamer Tag wiegt noch schwer. |
| gut | 14+ Tagen | Gut eingespielt. Danach lernt es gleitend weiter: Alte Tage blenden langsam aus, damit es mit den Jahreszeiten mitgeht. |

Die **Prognosegenauigkeit** legt jede Viertelstunde die Vorhersage neben den echten Verbrauch. Die Zahl ist 100 % minus die durchschnittliche Abweichung (als Anteil am durchschnittlichen Verbrauch), gleitend über 14 Tage.

Das Lernen läuft immer weiter, auch im Schattenmodus und auch, wenn HBC nicht auf Dynamic steht.

## Live schalten

Schalte auf dem Dashboard **Live** ein. Ab dann passt Batterijplan jede Viertelstunde die zwei Dynamic-Stellungen von HBC an, wie in der Tabelle oben. Jede Änderung landet im Logbuch.

**Live wieder aus?** Dann setzt Batterijplan beide Stellungen sofort zurück: teure Stellung *Self-consumption*, normale Stellung *Charge PV*. HBC ist dann wieder ganz so wie vorher.

## Wenn HBC nicht auf Dynamic steht

Wählst du (oder eine Automatisierung, zum Beispiel bei einem negativen Preis) eine andere Strategie in HBC, dann:
- pausiert Batterijplan: Die Plankarte zeigt "Batterijplan pausiert: HBC steht auf …";
- zählt der Zähler nichts dazu;
- setzt Batterijplan, wenn *Live* an war, die zwei Dynamic-Stellungen auf normal zurück;
- geht das Lernen ganz normal weiter.

Sobald HBC wieder auf Dynamic steht, rechnet der Plan sofort neu und steuert gleich wieder nach.

## Empfehlung für HBC

In HBC trägst du ein, wie viel Solarstrom dein Haus an einem Tag selbst direkt verbraucht (*Solar reserved for house*). HBC rechnet: erwartete Sonne minus diese Zahl ist das, was für den Speicher übrig bleibt; den Rest lädt HBC im günstigen Block aus dem Netz.
- Ist die Zahl **zu hoch**, lädt HBC mehr aus dem Netz als nötig.
- Ist sie **zu niedrig**, ist der Speicher abends zu leer für die teuren Stunden.

Die richtige Zahl ist von Tag zu Tag und je nach Jahreszeit anders. Batterijplan rechnet jeden Tag aus, wie viel Sonne dein Haus nutzen kann: pro halbe Stunde das Kleinere von deinem gelernten Verbrauch und der erwarteten Sonne (Solcast, mittlere Schätzung). Es vergleicht den Durchschnitt der letzten 7 Tage mit deiner Einstellung. Erst ab 1 kWh Unterschied bekommst du eine Empfehlung, gerundet auf eine halbe kWh. **Batterijplan ändert die Einstellung in HBC nie selbst.**

## Der Zähler: was bringt es

Jede Viertelstunde rechnet Batterijplan die vorige Viertelstunde ab:
- **Halten:** Die Ladung zählt zum Durchschnittspreis der teuren Viertelstunden, für die der Plan sie später einsetzt.
- **Entladen in einer teuren Viertelstunde:** der Unterschied zu dem, was HBC allein getan hätte.
- **Überschuss entladen:** nur die Ladung, die wirklich aus dem Speicher kam (nicht mehr als geplant). Was du dadurch nicht kaufen musst, minus das, was es kostet, diese Ladung im günstigen Moment wieder zu laden.

Alle Beträge sind inklusive MwSt. **Schatten** zählt getrennt von **live**. Es bleibt eine Schätzung; deine Stromrechnung ist der echte Beweis.

## Was es (noch) nicht tut

- **Selbst nachts zusätzlich laden:** Das wird nur ausgerechnet und gezeigt.
- **Ein günstiger Nachmittag, den HBC nicht als günstig markiert** (wegen der Grenze an Stunden pro Tag oder des minimalen Preisunterschieds in HBC), zählt nicht als Nachladen.
- **Unterschied zwischen Werktag und Wochenende** im Verbrauch.
- **Einspeisen ins Netz für Geld** (Sell): Batterijplan ist auf Eigenverbrauch ausgerichtet.
