# 04 · Wartung und Aktualisieren

*English: [04-maintenance.md](04-maintenance.md) · Nederlands: [04-maintenance.nl.md](04-maintenance.nl.md)*

**Kurz gesagt**
- Einmal im Monat kurz hinschauen reicht.
- Updates kommen über HACS. Deine Einstellungen, der gelernte Verbrauch und der Zähler bleiben erhalten.
- Kurz ausschalten = *Live* aus. Der Plan rechnet und lernt dann weiter.

## Was du ab und zu tust

| Wann | Was zu tun ist |
|---|---|
| **Einmal im Monat** | Prüfe, ob "halten" und "entladen" noch sinnvoll sind. Ist die Batterie nach der teuren Zeit oft noch gut gefüllt? Senke die Sicherheitsmarge. Läuft sie oft zu früh leer? Erhöhe die Marge oder prüfe die Kapazität. |
| **Neuer Stromvertrag** | Ändere den *Aufschlag*, den *Einspeise-Aufschlag* und den *Vertragsbeginn*. |
| **Batterie hinzugefügt oder entfernt, oder weniger Kapazität durch Verschleiß** | Ändere die *nutzbare Kapazität*. |
| **Große Änderung beim Verbrauch** (Wärmepumpe, neues Gerät) | Nichts tun: Das Profil passt sich innerhalb von etwa 1 bis 2 Wochen selbst an. |
| **HBC-Update** | Prüfe, ob HBC noch auf Dynamic steht, und schau auf die *Schwelle*: Sie bestimmt, was deutlich teurer ist. |
| **Andere Sensoren** (neuer P1-Zähler, Wechselrichter) | Öffne den Knopf *Sensoren* und ändere die Sensornamen (oder drücke bei der Integration auf *Konfigurieren*). |
| **Anderer Stromvertrag mit all-in-Preisen in HBC** | Stelle *Preise von HBC* auf *all-in* (Knopf *Einstellungen*). |

## Backup

Die Integration speichert alles selbst, im Konfigurationseintrag von Home Assistant: deine Einstellungen (auch die Experten-Einstellungen), das gelernte Verbrauchsprofil und den Zähler. Sie ist deshalb Teil jedes normalen Home-Assistant-Backups (*Einstellungen → System → Backups*).

- Die alten Knöpfe *Backup erstellen*, *Backup wiederherstellen* und *Standardwerte* gibt es nicht mehr. Du brauchst sie nicht mehr: Bei einem Update oder Neustart geht nichts verloren.
- Batterijplan im selben Home Assistant neu installieren? Entferne die Integration nur, wenn du neu beginnen willst; dann ist alles davon weg.
- Auf einen neuen Home Assistant umziehen? Spiele dort ein Home-Assistant-Backup ein. Ohne Backup richtest du die Integration neu ein, und das Verbrauchsprofil beginnt wieder zu lernen (7 Tage).

## Eine neue Version installieren

1. Erstelle ein Home-Assistant-Backup (siehe oben).
2. Öffne in HACS **HBC Batterijplan** und wähle **Aktualisieren** (oder *Herunterladen* der neuen Version).
3. Starte Home Assistant neu.
4. Aktualisiere den Browser (am Handy: App schließen und neu öffnen), damit du die neuen Karten bekommst.

Deine Einstellungen, der gelernte Verbrauch und der Zähler bleiben erhalten. Das Dashboard und die Karten gehören zur Integration, es gibt also nichts zu ersetzen oder einzufügen.

**Release Candidates.** Eine Version mit `rc` im Namen ist ein Release Candidate: fast fertig, aber noch im Test. In HACS siehst du sie nur, wenn du für dieses Repository *Beta-Versionen anzeigen* einschaltest.

**Vom Paket (1.0.0-rc1/rc2) zur Integration:** siehe [01 · Installation](01-installation.de.md#umstieg-vom-paket-100-rc1rc2).

## Komplett entfernen

1. Schalte **Live** aus, damit HBC zu deinen eigenen Modi zurückgeht.
2. *Einstellungen → Geräte & Dienste → Batterijplan → ⋮ → Löschen*.
3. Entferne **HBC Batterijplan** in HACS und starte Home Assistant neu.

Das Dashboard verschwindet zusammen mit der Integration.
