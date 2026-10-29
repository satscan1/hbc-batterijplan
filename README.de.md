<p align="center"><img src="https://raw.githubusercontent.com/satscan1/hbc-batterijplan/main/www/batterijplan/logo.png" width="160" alt="HBC-Batterijplan"></p>

<p align="center"><a href="https://github.com/satscan1/hbc-batterijplan/releases"><img src="https://img.shields.io/github/v/release/satscan1/hbc-batterijplan?include_prereleases" alt="Release"></a> <a href="https://github.com/satscan1/hbc-batterijplan"><img src="https://img.shields.io/github/stars/satscan1/hbc-batterijplan?style=flat&logo=github" alt="Stars"></a> <a href="https://ko-fi.com/satscan"><img src="https://img.shields.io/badge/Ko--fi-satscan-FF5E5B?logo=kofi&logoColor=white" alt="Support me on Ko-fi"></a></p>

# Batterijplan — eine schlaue Schicht über Home Battery Control (HBC)

*English: [README.md](https://github.com/satscan1/hbc-batterijplan/blob/main/README.md) · Nederlands: [README.nl.md](https://github.com/satscan1/hbc-batterijplan/blob/main/README.nl.md)*

*Version 1.0.0-rc1 · Release Candidate*

Batterijplan sorgt dafür, dass dein Hausspeicher seine Ladung für die **teuersten** Momente des Tages aufhebt. Es arbeitet mit [Home Battery Control (HBC)](https://github.com/gitcodebob/marstek-venus-rs485-node-red) zusammen und übernimmt HBC nicht: HBC steuert weiter den Speicher, Batterijplan gibt nur pro Viertelstunde einen Hinweis.

> Batterijplan ist eine eigenständige, inoffizielle Ergänzung zu HBC. Es wird nicht von den Machern von HBC entwickelt oder gepflegt. Fragen zu Batterijplan stellst du hier, nicht bei HBC.

<p align="center"><img src="https://raw.githubusercontent.com/satscan1/hbc-batterijplan/main/docs/images/dashboard.png" width="95%" alt="Batterijplan Dashboard"></p>

## Was Batterijplan tut

- **Hebt Ladung für die teuersten Viertelstunden auf.** HBC (Strategie Dynamic) entlädt in jeder teuren Viertelstunde der Reihe nach, auch wenn eine Stunde später ein noch teurerer Moment kommt. Batterijplan rechnet bis zum nächsten günstigen Moment voraus und gibt die Ladung zuerst den teuersten Viertelstunden. In den anderen teuren Viertelstunden hält der Speicher seine Ladung.
- **Nutzt Überschuss schlau.** Ist mehr im Speicher, als bis zum nächsten günstigen Moment nötig ist? Dann gibt Batterijplan diesen Überschuss schon in den teuersten normalen Viertelstunden ans Haus ab, statt mit einem vollen Speicher laden zu gehen.
- **Lernt deinen Verbrauch.** Pro Stunde des Tages, in 7 Tagen, und danach gleitend mit den Jahreszeiten. Mit der Solarprognose von Solcast dazu.
- **Gibt eine Empfehlung für HBC.** Wie viel Solarstrom dein Haus selbst verbraucht (die HBC-Einstellung *Solar reserved for house*), auf Basis der letzten 7 Tage. Batterijplan ändert diese Einstellung nie selbst.
- **Zeigt, was es bringt.** Eine ehrliche Schätzung zusätzlich zu HBC allein: Beim Überschuss entladen zählt nur, was wirklich aus dem Speicher kam.
- **Startet sicher.** Zuerst im Schattenmodus (rechnet mit, steuert nichts). Erst wenn du *Live* einschaltest, steuert es HBC nach.

## Neu in 1.0.0-rc1

- **Ruhigeres Dashboard:** alles auf einem Bildschirm. Oben eine Knopfleiste mit *Live* ganz vorne; Einstellungen, Sensoren, Empfehlung und Ertrag öffnen sich als Fenster. Ein orangefarbener Punkt zeigt, wo etwas zu tun ist.
- **Ganz im Hausstil:** eigene Eingabefelder (Schieberegler, Auswahlknöpfe, − Wert +), Sensoren aus einer Liste passender Kandidaten wählen, Einstellungen in den Reitern Basis und Experte, und ein (i) mit Erklärung bei jeder Zeile.
- **Vergleich mit HBC allein** in der Grafik: eine rote gepunktete Linie und der Unterschied in Euro pro Tag.
- **Schneller lernen:** fertig nach 7 Tagen. Die Prognose wird pro Block von 3 Stunden bewertet, und du siehst nur ein Urteil (ordentlich, gut, sehr gut, ausgezeichnet). Bei schwankendem Verbrauch rechnet der Plan selbst mit zusätzlicher Reserve.
- **Börsenpreise oder All-in-Preise:** neue Einstellung *Preise von HBC*.
- **Deine eigenen HBC-Stellungen** werden gemerkt und wiederhergestellt. Nutzt du *Sell*, lässt Batterijplan diesen Zeitraum in Ruhe.
- **Behoben:** Der Plan blieb nach einem Neustart manchmal hängen, ein Fehler beim Zeigen mit der Maus in den Karten, und der *Hausverbrauch* fiel nachts weg bei Wechselrichtern, die nichts melden.

Alles auf einen Blick: [CHANGELOG.md](CHANGELOG.md).

## Dokumentation

| | |
|---|---|
| [01 · Installation](docs/01-installation.de.md) | Was du brauchst, Dateien ablegen, Dashboard, Einstellungen |
| [02 · Das Dashboard](docs/02-dashboard.de.md) | Was jede Karte zeigt |
| [03 · So funktioniert es](docs/03-how-it-works.de.md) | Der Plan, Überschuss, Lernen, die Empfehlung und der Zähler in einfacher Sprache |
| [04 · Pflege und Aktualisieren](docs/04-maintenance.de.md) | Was du ab und zu tust, neue Version, Entfernen |
| [05 · Probleme lösen](docs/05-troubleshooting.de.md) | Bekannte Meldungen und was du dagegen tust |

## Release Candidate

Dies ist ein **Release Candidate** (rc): die letzte Testversion vor 1.0.0. Er läuft täglich beim Macher und bei ein paar Testern. Starte ihn zuerst im Schattenmodus, schau ein paar Tage zu und melde, was dir auffällt, über [Issues](https://github.com/satscan1/hbc-batterijplan/issues) oder auf Discord. Nenne deine HBC-Version und, bei einer Fehlermeldung, einen Screenshot.

## Lizenz

- **Code** (Paket, Karten und Dashboard): GPL-3.0-or-later.
- **Icons und Logo** (`www/batterijplan/`): eigener Hausstil von SatScan, siehe [LICENSE-ICONEN.md](www/batterijplan/LICENSE-ICONEN.md).

Batterijplan ist eine eigenständige Ergänzung zu [Home Battery Control](https://github.com/gitcodebob/marstek-venus-rs485-node-red) und wird nicht von den Machern von HBC gepflegt.
