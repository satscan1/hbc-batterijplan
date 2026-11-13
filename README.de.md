<p align="center"><img src="https://raw.githubusercontent.com/satscan1/hbc-batterijplan/main/custom_components/batterijplan/brand/icon.png" width="160" alt="HBC-Batterijplan"></p>

<p align="center"><a href="https://github.com/satscan1/hbc-batterijplan/releases"><img src="https://img.shields.io/github/v/release/satscan1/hbc-batterijplan?include_prereleases" alt="Release"></a> <a href="https://github.com/satscan1/hbc-batterijplan"><img src="https://img.shields.io/github/stars/satscan1/hbc-batterijplan?style=flat&logo=github" alt="Stars"></a> <a href="https://ko-fi.com/satscan"><img src="https://img.shields.io/badge/Ko--fi-satscan-FF5E5B?logo=kofi&logoColor=white" alt="Support me on Ko-fi"></a></p>

# Batterijplan — eine schlaue Schicht über Home Battery Control (HBC)

*English: [README.md](https://github.com/satscan1/hbc-batterijplan/blob/main/README.md) · Nederlands: [README.nl.md](https://github.com/satscan1/hbc-batterijplan/blob/main/README.nl.md)*

*Version 1.0.1*

Batterijplan sorgt dafür, dass dein Hausspeicher seine Ladung für die **teuersten** Momente des Tages aufhebt. Es arbeitet mit [Home Battery Control (HBC)](https://github.com/gitcodebob/marstek-venus-rs485-node-red) zusammen und übernimmt HBC nicht: HBC steuert weiter den Speicher, Batterijplan gibt nur pro Viertelstunde einen Hinweis.

Es ist für Haushalte in den Niederlanden, Deutschland und Belgien (Flandern) mit einem dynamischen Stromvertrag gedacht.

> Batterijplan ist eine eigenständige, inoffizielle Ergänzung zu HBC. Es wird nicht von den Machern von HBC entwickelt oder gepflegt. Fragen zu Batterijplan stellst du hier, nicht bei HBC.

<p align="center"><img src="https://raw.githubusercontent.com/satscan1/hbc-batterijplan/main/docs/images/dashboard-overview-de.png" width="95%" alt="Batterijplan Dashboard"></p>

Die Beträge im Bild sind Beispielzahlen.

1. **Live**: an = Batterijplan steuert HBC. Aus = Schattenmodus: es rechnet mit, steuert aber nichts.
2. **Knöpfe**: Ertrag, Bericht, Empfehlung HBC, Einstellungen und Sensoren. Jeder Knopf öffnet ein Fenster. Der orange Punkt auf **Empfehlung HBC** bedeutet, dass *cheapest hrs*, *expensive hrs* oder *Solar reserved for house* von der Empfehlung abweicht (um mindestens 1 Stunde oder 0,5 kWh); im Fenster steht auch der Schalter *HBC-Einstellungen automatisch anpassen*.
3. **Statuskarte**: Modus, Verbrauch lernen, HBC-Strategie, nächste Viertelstunde und Empfehlung Hausverbrauch. Das (i) hinter jeder Zeile erklärt sie.
4. **Briefing und Plan**: was jetzt in der Batterie ist, was der Plan in der nächsten Viertelstunde tut, und der Kostenunterschied zu HBC allein bis Mitternacht.
5. **Regeln**: die vier Regeln (*Zusätzliches Laden aus dem Netz*, *Entladen außerhalb der HBC-Zeiten*, *Halten für später*, *Einspeisen*), jede mit eigenem Ein/Aus-Schalter.
6. **Wo Batterijplan nachsteuert**: die Blöcke, in denen der Plan etwas anderes tut als HBC, mit einer Farbe pro Aktion und dem Preis.
7. **Reiner Preis jetzt und die Stromkosten bis Mitternacht**: HBC neben Batterijplan.
8. **Erwartete Ersparnis** gegenüber HBC allein.
9. **Batterie**: wie viele kWh jetzt in der Batterie sind.

## Was Batterijplan tut

- **Hebt Ladung für die teuersten Viertelstunden auf.** HBC (Strategie Dynamic) entlädt in jeder teuren Viertelstunde der Reihe nach, auch wenn eine Stunde später ein noch teurerer Moment kommt. Batterijplan rechnet bis zum nächsten günstigen Moment voraus und gibt die Ladung zuerst den teuersten Viertelstunden. In den anderen teuren Viertelstunden hält der Speicher seine Ladung.
- **Nutzt Überschuss schlau.** Ist mehr im Speicher, als bis zum nächsten günstigen Moment nötig ist? Dann gibt Batterijplan diesen Überschuss schon in den teuersten normalen Viertelstunden ans Haus ab, statt mit einem vollen Speicher laden zu gehen.
- **Lernt deinen Verbrauch.** Pro Stunde des Tages, in 7 Tagen, und danach gleitend mit den Jahreszeiten. Mit der Solarprognose von Solcast dazu.
- **Gibt eine Empfehlung für HBC.** Wie viel Solarstrom dein Haus selbst verbraucht (die HBC-Einstellung *Solar reserved for house*), auf Basis der letzten 7 Tage. Es gibt auch Empfehlungen für *cheapest hrs* und *expensive hrs*. Nur wenn du den Schalter *HBC-Einstellungen automatisch anpassen* einschaltest (standardmäßig aus), ändert es diese drei HBC-Einstellungen selbst; deine eigenen Werte kommen beim Ausschalten zurück. An den Flows oder am Code von HBC ändert es nie etwas.
- **Zeigt, was es bringt.** Eine ehrliche Schätzung zusätzlich zu HBC allein: Beim Überschuss entladen zählt nur, was wirklich aus dem Speicher kam.
- **Startet sicher.** Zuerst im Schattenmodus (rechnet mit, steuert nichts). Erst wenn du *Live* einschaltest, steuert es HBC nach.

## Neu in 1.0.0

- **Ländereinstellung:** Deutschland (feste Einspeisevergütung) und Belgien/Flandern (Kapazitätstarif, nutzt die Importgrenze von HBC), neben den Niederlanden.
- **Ruhigerer Plan bei fast gleichen Preisen:** Umschaltkosten von 2 ct zwischen Halten und Einspeisen, damit der Plan nicht mehr wegen eines Bruchteils eines Cents umschlägt.
- **Lesbar im hellen Modus:** dunklere Farben für die Plankarte und die Legende im hellen Home-Assistant-Design; das dunkle Design bleibt unverändert.
- **Zeitzone aus Home Assistant:** ohne blockierenden Aufruf gelesen (Review-Feedback).
- **Solarprognose für HBC:** Der neue Sensor `sensor.batterijplan_zon_voor_hbc` lässt HBC das Laden aus dem Netz auf dem Niveau beenden, das der Plan will. Ohne Plan oder bei ausgeschaltetem Live gibt er die echte Prognose 1:1 weiter.
- **Solcast-Namen:** werden automatisch auf Englisch, Niederländisch und Deutsch gefunden, oder du trägst deine eigenen Sensoren im Fenster *Sensoren* ein.
- **HBC-Einstellungen automatisch:** ein Schalter (standardmäßig aus), der *cheapest hrs*, *expensive hrs* und *Solar reserved for house* auf die Empfehlung setzt. Deine eigenen Werte kommen zurück, wenn du ihn ausschaltest. Die Karte *Empfehlung HBC* zeigt alle drei Einstellungen.
- **Live-Ladestand:** *Jetzt in der Batterie* folgt der Batterie, sobald sie sich ändert, in Schritten von 0,1 kWh.
- **Schonender für die Datenbank:** Die großen Plandetails werden nicht mehr in den Recorder geschrieben.
- **Tooltip im Diagramm:** Hover oder Tippen zeigt Zeit, Preis, Solar, Ladung und Aktionen pro Viertelstunde.
- **Eine echte Home-Assistant-Integration:** mit HACS installieren und in einem Formular unter *Geräte & Dienste* einrichten. Kein YAML-Paket, keine Dateien kopieren, keine Dashboard-Ressource.
- **Eingebautes Dashboard** in der Seitenleiste (`/batterijplan`), auf Niederländisch, Englisch und Deutsch.
- **Vier Regeln mit eigenem Schalter:** aus dem Netz laden, außerhalb der HBC-Zeiten entladen, halten, einspeisen. Die Schwelle ist die von HBC selbst.
- **Laden aus dem Netz in Blöcken von mindestens 30 Minuten**, damit HBC auch wirklich lädt.
- **Empfehlung für HBC eingebaut**, mit eigener Karte; der Status zeigt die Empfehlung nach 7 Tagen Messen.
- **Schattenwert nur bei ausgeschaltetem Live**, höchstens 30 Tage aufbewahrt.
- **Zahlen folgen deinem Home-Assistant-Zahlenformat** (Komma oder Punkt). Tippe auf das Logo für das Jahreszeitenbild.

Alles auf einen Blick: [CHANGELOG.md](CHANGELOG.md).

## Installation

1. Öffne HACS, suche nach **HBC Batterijplan** und wähle **Herunterladen** (sobald die Integration in der HACS-Standardliste steht).
2. Noch nicht gelistet, oder du findest sie nicht? Füge sie als benutzerdefiniertes Repository hinzu: HACS → Menü (⋮) → **Benutzerdefinierte Repositories** → `https://github.com/satscan1/hbc-batterijplan`, Kategorie **Integration**. Suche sie danach und lade sie herunter.
3. Starte Home Assistant neu, dann *Einstellungen → Geräte & Dienste → Integration hinzufügen → Batterijplan*.

Details: [01 · Installation](docs/01-installation.de.md).

## Dokumentation

| | |
|---|---|
| [01 · Installation](docs/01-installation.de.md) | Was du brauchst, mit HACS installieren, einrichten |
| [02 · Das Dashboard](docs/02-dashboard.de.md) | Was jede Karte zeigt |
| [03 · So funktioniert es](docs/03-how-it-works.de.md) | Der Plan, Überschuss, Lernen, die Empfehlung und der Zähler in einfacher Sprache |
| [04 · Pflege und Aktualisieren](docs/04-maintenance.de.md) | Was du ab und zu tust, neue Version, Entfernen |
| [05 · Probleme lösen](docs/05-troubleshooting.de.md) | Bekannte Meldungen und was du dagegen tust |

## Status

1.0.0 ist die erste vollständige Version. Starte sie zuerst im Schattenmodus, schau ein paar Tage zu und melde, was dir auffällt, über [Issues](https://github.com/satscan1/hbc-batterijplan/issues). Nenne deine HBC-Version und, bei einer Fehlermeldung, einen Screenshot.

## Lizenz

- **Code** (Integration, Karten und Dashboard): GPL-3.0-or-later.
- **Icons und Logo** (`custom_components/batterijplan/frontend/` und `brand/`): eigener Hausstil von SatScan, siehe [LICENSE-ICONS.md](LICENSE-ICONS.md).

Batterijplan ist eine eigenständige Ergänzung zu [Home Battery Control](https://github.com/gitcodebob/marstek-venus-rs485-node-red) und wird nicht von den Machern von HBC gepflegt.
