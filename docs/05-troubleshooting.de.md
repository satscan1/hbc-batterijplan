# 05 · Fehlerbehebung

*English: [05-troubleshooting.md](05-troubleshooting.md) · Nederlands: [05-troubleshooting.nl.md](05-troubleshooting.nl.md)*

**Kurz gesagt**
- Direkt nach einem Neustart sind manche Karten kurz leer. Das erledigt sich innerhalb einer Viertelstunde.
- Schau zuerst auf die Statuskarte: Modus, Lernen, HBC-Strategie und nächste Viertelstunde verraten meist schon, was los ist.
- Ein Problem, das du nicht gelöst bekommst? Mache einen Screenshot und nenne deine HBC-Version in einem [Issue](https://github.com/satscan1/hbc-batterijplan/issues).

## Der Plan ist leer oder die Sensoren sind unbekannt

Der Sensor `sensor.batterijplan` ist *unbekannt*, solange es keinen Plan gibt. Ein Plan braucht all das:

| Prüfung | Was zu tun ist |
|---|---|
| Die nutzbare Kapazität ist ausgefüllt. | Trage sie ein (*Einstellungen → Basis*, oder *Konfigurieren* bei der Integration). Bei 0 gibt es keinen Plan. |
| HBC hat Preise mit Labels. | Prüfe, ob HBC auf Dynamic steht und ob die Preise eintreffen (`sensor.hbc_energy_prices_data`). |
| Batterijplan kann die Ladung **aller** Batterien lesen. | Prüfe in HBC die Anzahl der Batterien (`input_number.house_battery_count`) und ob der Ladestand jeder Batterie verfügbar ist. Eine Batterie ohne Wert genügt für einen leeren Plan. |
| Die Sensoren sind gewählt und melden einen Wert. | Öffne den Knopf *Sensoren*. Ein Sensor, der *nicht verfügbar* oder *unbekannt* ist, liefert keinen Hausverbrauch und nichts zum Lernen. |

Die Sensoren für Hausverbrauch, Profil und Prognose sind in den ersten Minuten und den ersten Tagen *unbekannt* oder zeigen *noch am Messen*. Das ist normal.

Bleibt der Plan leer? Dann schau in *Einstellungen → System → Protokolle* nach "batterijplan".

## Entitäts-IDs mit `_2` am Ende

Du siehst `sensor.batterijplan_2`, `switch.batterijplan_live_2` und so weiter? Das passiert, wenn das alte Paket (`packages/batterijplan.yaml`) noch neben der Integration steht: Die IDs mit den normalen Namen sind dann noch belegt.

1. Entferne das Paket, die alten Karten und das alte Dashboard. Siehe [01 · Installation](01-installation.de.md#umstieg-vom-paket-100-rc1rc2).
2. Starte Home Assistant neu. Beim Start setzt Batterijplan die IDs auf die normalen Namen zurück, wo diese frei sind.

Entferne die `_2`-Entitäten nicht von Hand, bevor das passiert ist.

## Dashboard und Karten

| Problem | Prüfe |
|---|---|
| In der Seitenleiste steht kein **Batterijplan** | Aktualisiere den Browser (Handy: App schließen und neu öffnen). Ist die Integration eingerichtet (*Einstellungen → Geräte & Dienste*)? |
| Eine Reparaturmeldung sagt, dass die **Dashboard-Adresse belegt ist** | Du hast ein eigenes Dashboard unter `/batterijplan`. Batterijplan lässt es in Ruhe und fügt sein eigenes nicht hinzu. Benenne deines um oder entferne es und starte Home Assistant neu. |
| Eine Karte sagt *Custom element doesn't exist: batterijplan-…* | Ist die alte Ressource `/local/batterijplan/batterijplan-cards.js` noch da? Entferne sie (*Einstellungen → Dashboards → ⋮ → Ressourcen*) und aktualisiere den Browser: Die Integration lädt die Karten selbst. Zwei Kopien stören sich gegenseitig. |
| *Live*, die Regeln und die Felder in *Einstellungen* zeigen *Nicht verfügbar* | Die Integration ist nicht gestartet. Schau in *Einstellungen → System → Protokolle* nach "batterijplan" und starte Home Assistant neu. |
| Die Karten sind in der falschen Sprache | Die Karten folgen der Sprache deines **Profils** in Home Assistant (dein Name unten links → Sprache). In deinem eigenen Dashboard kannst du an einer Karte `taal: nl`, `en` oder `de` setzen. |
| Die Grafik zeigt keine durchgezogene Linie (gemessene Ladung) | Dein Recorder speichert `sensor.batterijplan_lading` nicht. Nimm ihn in deine Include-Liste auf und starte neu. Siehe [01 · Installation](01-installation.de.md#recorder-nur-wenn-du-eine-include-liste-nutzt). |
| Die Beträge im Plan sind viel zu hoch | Liefert HBC all-in-Preise? Stelle *Preise von HBC* auf *all-in*, sonst rechnet Batterijplan Aufschlag und MwSt. doppelt. |

## Sonne und Verbrauch

| Problem | Prüfe |
|---|---|
| Batterijplan rechnet mit 0 Sonne | Ist die Integration *Solcast PV Forecast* installiert? Batterijplan findet die Solcast-Sensoren selbst, in jeder Sprache. |
| *Hausverbrauch jetzt* ist *Nicht verfügbar* | Prüfe den Netzsensor und den Batteriesensor. Solar ohne Wert zählt als 0 W. |
| *Kontrolle: Hausverbrauch jetzt* stimmt nicht | Prüfe die Vorzeichen: Netzleistung Bezug = +, Batterieleistung Entladen = +. Und Solarleistung ist die Leistung gerade jetzt in W, nicht der Tagesertrag. |
| Die Prognose bleibt *wechselhaft* | Ein Haushalt mit stark wechselndem Verbrauch ist schwerer vorherzusagen. Läuft die Batterie zu oft zu früh leer, erhöhe deine Sicherheitsmarge. |

## Steuern

| Problem | Prüfe |
|---|---|
| **HBC steht nicht auf Dynamic** | Batterijplan steuert dann nichts und der Zähler zählt nichts. Die Statuskarte zeigt die Strategie von HBC. Stelle HBC zurück auf **Dynamic**: Der Plan rechnet sofort neu und steuert wieder nach. War *Live* an? Dann werden deine eigenen Modi zurückgesetzt, sobald HBC Dynamic verlässt. |
| Live ist an, aber die Batterie tut nicht, was der Plan sagt | Steht HBC auf **Full control** und **Dynamic**? Schau ins Logbuch unter "Batterijplan": Jede Änderung steht dort. HBC liest seine Modi pro Viertelstunde, eine Änderung wirkt also erst ab der nächsten Viertelstunde. |
| Es wird nichts gesteuert | Vielleicht ist eine Regel aus (*Einstellungen → Regeln*), oder der Plan hat in den nächsten Viertelstunden nichts Besseres als HBC. Das ist normal. |
| Nach Live aus steht HBC anders als vorher | Batterijplan stellt die Modi zurück, die es sich gemerkt hat, als du *Live* eingeschaltet hast. Hast du sie danach selbst geändert, während *Live* an war, stelle sie selbst zurück. |
| Der Zähler bewegt sich nicht | Er zählt nur mit *Live* an **und** HBC auf Dynamic. Sonst zählt es als *Schatten*. |
