# 05 · Probleme lösen

*English: [05-troubleshooting.md](05-troubleshooting.md) · Nederlands: [05-troubleshooting.nl.md](05-troubleshooting.nl.md)*

**Kurz gesagt**
- Kurz nach einem Neustart sind manche Karten eine Weile leer. Das erledigt sich innerhalb einer Viertelstunde.
- Schau zuerst auf die Statuskarte: Modus, Lernen, HBC-Strategie und nächste Viertelstunde sagen meist schon, was los ist.
- Eine Meldung? Mach einen Screenshot und nenne deine HBC-Version in einem [Issue](https://github.com/satscan1/hbc-batterijplan/issues).

## Meldungen im Plan

| Was du siehst | Was es bedeutet | Was du tust |
|---|---|---|
| **Nicht eingerichtet** | Die nutzbare Kapazität ist nicht ausgefüllt. | Fülle sie aus (Einstellungen). |
| **Keine Batteriedaten** | Batterijplan kann die Ladung von einem oder mehreren Speichern nicht lesen. Es hält dann nichts fest. | Prüfe in HBC die Anzahl der Speicher und ob ihr Ladestand verfügbar ist. |
| **Keine Preisdaten** | HBC hat (noch) keine Preise mit Labels. | Prüfe, dass HBC auf Dynamic steht und die Preise ankommen (`sensor.hbc_energy_prices_data`). |
| **Batterijplan pausiert: HBC steht auf …** | HBC steht nicht auf Dynamic. | Normal, wenn du bewusst eine andere Strategie wählst. Stelle HBC zurück auf Dynamic, damit Batterijplan mitmacht. |
| **Nichts zu steuern bis …** | Bis zum nächsten günstigen Moment gibt es nichts zu verbessern. HBC macht das Übliche. | Nichts, das ist normal. |

## Dashboard und Karten

| Problem | Prüfe |
|---|---|
| Eine Karte meldet *Custom element doesn't exist: batterijplan-…* | Die Karten sind nicht als Ressource angemeldet, oder der Browser hat noch die alte Version. Siehe [01 · Installation, Schritt 5](01-installation.de.md#schritt-5--karten-und-dashboard). Lade danach den Browser neu (Handy: App schließen und öffnen). |
| Eine Fehlermeldung *can only concatenate str (not "int") to str* | Das war ein Fehler in Version 0.1.5 bei manchen HBC-Versionen. Behoben in 1.0.0-dev1: aktualisiere. |
| *Live* und die Felder in *Einstellungen* stehen auf *Nicht verfügbar* | Das Paket ist nicht geladen. Wähle *Entwicklerwerkzeuge → YAML → Konfiguration prüfen*, behebe eine eventuelle Meldung und starte Home Assistant neu. |
| Eine Karte meldet *t is not a function* beim Zeigen mit der Maus | Fehler in 1.0.0-dev1. Behoben in 1.0.0-rc1: aktualisiere und erhöhe die Nummer hinter der Karten-Ressource. |
| Die Icons in den Karten fehlen | Lade den Browser neu. Die Icons stecken in der Kartendatei selbst. |
| Die Karten sind in der falschen Sprache | Die Karten folgen der Sprache deines **Profils** in Home Assistant (links unten dein Name → Sprache). |
| Die Grafik zeigt keine durchgezogene Linie (gemessene Ladung) | Dein Recorder speichert `sensor.batterijplan_lading` nicht. Setze ihn auf deine include-Liste und starte neu. Bis dahin liest die Grafik die Ladung aus dem Verlauf des Plans, ab dem Moment, an dem Version 1.0.0-dev1 läuft. |
| Woche oder Monat ist leer, oder die Summe passt nicht zu *Was bringt es* | Die Tageszählung von Home Assistant beginnt erst einen Tag nach dem Start des Zählers. Das gleicht sich von selbst aus. |
| *Empfehlung für HBC* bleibt bei "Noch am Messen" | Normal in der ersten Woche: Der Verbrauch muss gelernt sein, und es muss eine Woche gemessen sein. |
| Der Plan blieb nach einem Neustart bei einer alten Viertelstunde hängen | Fehler in 1.0.0-dev1 (der Plan wurde als Text gespeichert). Behoben in 1.0.0-rc1. |
| Die Beträge im Plan sind viel zu hoch | Liefert HBC All-in-Preise? Stelle *Preise von HBC* auf *all-in*, sonst rechnet Batterijplan die Steuer und die MwSt. doppelt dazu. |

## Sonne und Verbrauch

| Problem | Prüfe |
|---|---|
| Batterijplan rechnet mit 0 Sonne | Ist die Integration *Solcast PV Forecast* installiert? Batterijplan sucht die Solcast-Sensoren selbst, in jeder Sprache. |
| *Hausverbrauch jetzt* ist nachts *Nicht verfügbar* | Fehler in 1.0.0-dev1 bei Wechselrichtern, die nachts nichts melden. Behoben in 1.0.0-rc1: Sonne ohne Wert zählt als 0 W. |
| *Kontrolle: Hausverbrauch jetzt* stimmt nicht | Prüfe die Vorzeichen: Netzleistung Bezug = +, Speicherleistung entladen = +. Und die Solarleistung ist die Leistung von jetzt in W, nicht der Tagesertrag. |
| Die Prognose bleibt *schwankend* | Ein Haushalt mit stark wechselndem Verbrauch ist schwerer vorherzusagen. Batterijplan rechnet dann selbst mit zusätzlicher Reserve (siehe [03 · So funktioniert es](03-how-it-works.de.md)). Ist der Speicher trotzdem zu oft zu früh leer, erhöhe deine eigene Sicherheitsreserve. |

## Steuern

| Problem | Prüfe |
|---|---|
| Live ist an, aber der Speicher tut nicht, was der Plan sagt | Steht HBC auf **Full control** und **Dynamic**? Schau im Logbuch bei "Batterijplan": Dort steht jede Änderung. HBC liest seine Stellungen pro Viertelstunde, eine Änderung wirkt also erst ab der nächsten Viertelstunde. |
| Bei "Überschuss entladen" sinkt die Ladung kaum | Die Sonne deckt das Haus schon. Dann gibt es nichts zu entladen; der Zähler rechnet in dem Fall auch nichts. |
| Nach Live aus steht HBC anders als vorher | Batterijplan stellt die Stellungen wieder her, die es sich gemerkt hat, als du *Live* eingeschaltet hast. Hast du sie danach selbst geändert, während *Live* an war, stelle sie selbst zurück. |
| Batterijplan steuert im teuren Zeitraum nichts | Steht deine teure Stellung in HBC auf etwas anderem als *Self-consumption* (zum Beispiel *Sell*)? Dann lässt Batterijplan diesen Zeitraum bewusst in Ruhe. |
