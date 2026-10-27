# 04 · Pflege und Aktualisieren

*English: [04-maintenance.md](04-maintenance.md) · Nederlands: [04-maintenance.nl.md](04-maintenance.nl.md)*

**Kurz gesagt**
- Einmal im Monat kurz schauen reicht.
- Erstelle immer ein Back-up, bevor du etwas änderst oder aktualisierst.
- Vorübergehend ausschalten = *Live* aus. Der Plan rechnet und lernt dann weiter.

## Was du ab und zu tust

| Wann | Was tun |
|---|---|
| **Einmal im Monat** | Schau, ob "halten" und "entladen" noch logisch sind. Bleibt der Speicher nach der teuren Phase oft gut gefüllt? Senke die Sicherheitsreserve. Wird er oft zu früh leer? Erhöhe die Reserve, oder prüfe die Kapazität. |
| **Empfehlung für HBC wird orange** | Ändere *Solar reserved for house* in HBC auf die Zahl aus der Empfehlung. Das passiert vor allem beim Wechsel der Jahreszeiten. |
| **Neuer Stromvertrag** | Passe *Energiesteuer + Einkaufsaufschlag* und den *Beginn des Stromvertrags* an. |
| **Speicher dazu oder weg, oder weniger Kapazität durch Alterung** | Passe die *nutzbare Kapazität* an. |
| **Große Änderung im Verbrauch** (Wärmepumpe, neues Gerät) | Nichts tun: Das Profil passt sich innerhalb von ± 14 Tagen von selbst an. |
| **HBC-Update** | Prüfe, dass HBC noch auf Dynamic steht und der normale Zeitraum auf Charge PV. |
| **Andere Sensoren** (neuer P1-Zähler, Wechselrichter) | Schalte den Schalter *Einstellungen* ein und passe die Sensornamen an. Erstelle danach ein neues Back-up. |

## Eine neue Version installieren

1. Drücke **Back-up erstellen**.
2. Ersetze `packages/batterijplan.yaml` und den Ordner `www/batterijplan/` durch die aus der neuen Zip-Datei.
3. Erhöhe unter *Einstellungen → Dashboards → ⋮ → Ressourcen* die Nummer hinter den Karten, zum Beispiel `?v=1` → `?v=2`. So lädt dein Browser die neuen Karten.
4. Füge das neue Dashboard im Raw-Konfigurationseditor ein (siehe [01 · Installation](01-installation.de.md#schritt-5--karten-und-dashboard)).
5. *Konfiguration prüfen* und neu starten.

Deine Einstellungen, der gelernte Verbrauch und der Zähler bleiben erhalten. Fehlt doch etwas, drücke **Back-up wiederherstellen**.

**Von 0.1.x auf 1.0.0-dev1:** Füge die Karten als Ressource hinzu (Schritt 5 der Installation) und ersetze das Dashboard. Nutzt du einen Recorder mit include-Liste, setze auch `sensor.batterijplan_lading` und `sensor.batterijplan_advies_huisverbruik` auf die Liste und starte neu.

## Ganz entfernen

1. Schalte **Live** aus, damit HBC auf seine normalen Stellungen zurückgeht.
2. Lösche `packages/batterijplan.yaml`, den Ordner `www/batterijplan/`, die Ressource `/local/batterijplan/batterijplan-cards.js` und das Dashboard.
3. Starte Home Assistant neu.
