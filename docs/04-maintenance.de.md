# 04 · Pflege und Aktualisieren

*English: [04-maintenance.md](04-maintenance.md) · Nederlands: [04-maintenance.nl.md](04-maintenance.nl.md)*

**Kurz gesagt**
- Einmal im Monat kurz schauen reicht.
- Erstelle immer eine Sicherung, bevor du etwas änderst oder aktualisierst.
- Vorübergehend ausschalten = *Live* aus. Der Plan rechnet und lernt dann weiter.

## Was du ab und zu tust

| Wann | Was tun |
|---|---|
| **Einmal im Monat** | Schau, ob "halten" und "entladen" noch logisch sind. Bleibt der Speicher nach der teuren Phase oft gut gefüllt? Senke die Sicherheitsreserve. Wird er oft zu früh leer? Erhöhe die Reserve, oder prüfe die Kapazität. |
| **Empfehlung für HBC wird orange** | Ändere *Solar reserved for house* in HBC auf die Zahl aus der Empfehlung. Das passiert vor allem beim Wechsel der Jahreszeiten. |
| **Neuer Stromvertrag** | Passe *Energiesteuer + Einkaufsaufschlag* und den *Beginn des Stromvertrags* an. |
| **Speicher dazu oder weg, oder weniger Kapazität durch Alterung** | Passe die *nutzbare Kapazität* an. |
| **Große Änderung im Verbrauch** (Wärmepumpe, neues Gerät) | Nichts tun: Das Profil passt sich innerhalb von ± 1 bis 2 Wochen von selbst an. |
| **HBC-Update** | Prüfe, dass HBC noch auf Dynamic steht und der normale Zeitraum auf Charge PV. |
| **Andere Sensoren** (neuer P1-Zähler, Wechselrichter) | Öffne den Knopf *Sensoren* und passe die Sensornamen an. Erstelle danach eine neue Sicherung (Knopf *Einstellungen*). |
| **Anderer Stromvertrag mit All-in-Preisen in HBC** | Stelle *Preise von HBC* auf *all-in* (Knopf *Einstellungen*). |

## Eine neue Version installieren

1. Drücke **Sicherung erstellen** (Knopf *Einstellungen*).
2. Ersetze `packages/batterijplan.yaml` und den Ordner `www/batterijplan/` durch die aus der neuen Zip-Datei.
3. Erhöhe unter *Einstellungen → Dashboards → ⋮ → Ressourcen* die Nummer hinter den Karten, zum Beispiel `?v=1` → `?v=2`. So lädt dein Browser die neuen Karten.
4. Füge das neue Dashboard im Raw-Konfigurationseditor ein (siehe [01 · Installation](01-installation.de.md#schritt-5--karten-und-dashboard)).
5. *Konfiguration prüfen* und neu starten.

Deine Einstellungen, der gelernte Verbrauch und der Zähler bleiben erhalten. Fehlt doch etwas, drücke **Sicherung wiederherstellen**.

**Von 1.0.0-dev1 auf 1.0.0-rc1:**
- Ersetze das Paket und den Ordner `www/batterijplan/`, erhöhe die Nummer hinter der Karten-Ressource und füge das neue Dashboard ein. Das Dashboard ist ganz neu (Knopfleiste mit Fenstern), ersetze es also komplett.
- Recorder mit include-Liste: Setze auch `sensor.batterijplan_prijs` darauf.
- Starte Home Assistant neu: Es gibt neue Helfer (*Preise von HBC* und zwei Felder, in denen sich Batterijplan deine HBC-Stellungen merkt).
- Erstelle danach eine neue Sicherung. Sie speichert jetzt auch den Beginn des Stromvertrags und *Preise von HBC* (10 Einstellungen statt 8).
- Liefert HBC All-in-Preise? Stelle *Preise von HBC* auf *all-in*.
- Der gelernte Verbrauch bleibt erhalten. Die Prognose beginnt neu zu messen, jetzt pro Block von 3 Stunden.

**Von 0.1.x auf 1.0.0:** Füge die Karten als Ressource hinzu (Schritt 5 der Installation) und ersetze das Dashboard. Nutzt du einen Recorder mit include-Liste, setze auch `sensor.batterijplan_lading`, `sensor.batterijplan_advies_huisverbruik` und `sensor.batterijplan_prijs` auf die Liste und starte neu.

## Ganz entfernen

1. Schalte **Live** aus, damit HBC auf deine eigenen Stellungen zurückgeht.
2. Lösche `packages/batterijplan.yaml`, den Ordner `www/batterijplan/`, die Ressource `/local/batterijplan/batterijplan-cards.js` und das Dashboard.
3. Starte Home Assistant neu.
