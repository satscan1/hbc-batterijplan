# 01 · Installation

*English: [01-installation.md](01-installation.md) · Nederlands: [01-installation.nl.md](01-installation.nl.md)*

**Kurz gesagt**
- Batterijplan ist ein Home-Assistant-Paket (eine YAML-Datei), eigene Karten und ein Dashboard. Node-RED brauchst du dafür nicht.
- Die Installation geht von Hand, in sechs Schritten. Rechne mit einer Viertelstunde.
- Nach der Installation steht Batterijplan im **Schattenmodus**: Es rechnet mit, steuert aber noch nichts.

## Was du brauchst

| Nötig | Warum |
|---|---|
| Home Assistant mit Packages | Batterijplan ist eine Datei in `/config/packages/`. |
| HBC Version 4.14 oder neuer, in **Full control** und Strategie **Dynamic** | Batterijplan liest die Labels, die HBC pro Viertelstunde vergibt (günstig, teuer, normal), und die Ladung pro Speicher. |
| Ein dynamischer Stromtarif mit Viertelstunden- oder Stundenpreisen | Ohne Preisunterschiede gibt es nichts zu verteilen. |
| Solcast-Solarprognose (Integration *Solcast PV Forecast*) | Für die erwartete Sonne pro halbe Stunde. Die niederländischen und englischen Namen der Sensoren funktionieren beide. Keine Solarpaneele? Dann rechnet Batterijplan mit 0 Sonne. |
| Sensoren für Netzleistung, Solarleistung und Speicherleistung, in Watt (W) | Um den Hausverbrauch zu messen und zu lernen. Es geht immer um die Leistung von genau jetzt, nicht um eine Tagessumme in kWh. |

Optional: ein Sensor für die Ladeleistung deiner Wallbox. Die wird vom Hausverbrauch abgezogen, damit das Laden des Autos das Verbrauchsprofil nicht verfälscht.

## Schritt 1 — HBC richtig einstellen

Stelle HBC auf **Full control** und Strategie **Dynamic**. Wähle auf dem Tab Timed/Dynamic:

| Zeitraum | Stellung |
|---|---|
| Günstig (low) | Charge |
| Normal (regular / baseline) | **Charge PV** |
| Teuer (high) | Self-consumption |

> **Wichtig:** Der normale Zeitraum muss auf **Charge PV** stehen. Batterijplan geht davon aus, dass der Speicher außerhalb der teuren Viertelstunden nur entlädt, wenn Batterijplan das verlangt (Überschuss entladen).

## Schritt 2 — Dateien ablegen

Lade die Zip-Datei dieser Version herunter: auf der GitHub-Seite rechts bei **Releases**, dann **Source code (zip)**. Entpacke sie.

| Aus der Zip-Datei | Nach Home Assistant |
|---|---|
| `packages/batterijplan.yaml` | `/config/packages/batterijplan.yaml` |
| `www/batterijplan/` (Karten, Icons, Logo) | `/config/www/batterijplan/` |

Nutzt du noch keine Packages? Dann füge das in `configuration.yaml` hinzu:

```yaml
homeassistant:
  packages: !include_dir_named packages
```

## Schritt 3 — Recorder (nur wenn du eine include-Liste nutzt)

Arbeitet dein Recorder mit einer festen Liste (`include`), dann setze diese Entitäten darauf. Sonst bleiben die Grafik und der Zähler leer:

```yaml
recorder:
  include:
    entities:
      - sensor.batterijplan
      - sensor.batterijplan_meerwaarde
      - sensor.batterijplan_lading
      - sensor.batterijplan_advies_huisverbruik
      - input_select.house_battery_strategy_dynamic_expensive
      - input_boolean.batterijplan_live
```

Nutzt du keine include-Liste (der Standard), musst du nichts tun.

## Schritt 4 — Neu starten

Geh zu *Entwicklerwerkzeuge → YAML*, wähle **Konfiguration prüfen** und starte Home Assistant neu. Beim ersten Mal ist ein Neustart nötig: Der Ordner `www` und der Recorder werden nur beim Start gelesen.

## Schritt 5 — Karten und Dashboard

**Die Karten anmelden (einmalig):**
1. *Einstellungen → Dashboards*, oben rechts ⋮ → **Ressourcen**. Siehst du das nicht, schalte zuerst in deinem Profil den *Erweiterten Modus* ein.
2. **Ressource hinzufügen**: Adresse `/local/batterijplan/batterijplan-cards.js?v=1`, Typ **JavaScript-Modul**.
3. Lade den Browser neu (am Handy: App schließen und wieder öffnen).

**Das Dashboard hinzufügen:**
1. *Einstellungen → Dashboards → Dashboard hinzufügen → Neues Dashboard von Grund auf*, Name zum Beispiel "Batterijplan", mit einem eigenen Icon in der Seitenleiste.
2. Öffne das Dashboard, wähle oben rechts ✏️ (bearbeiten), dann ⋮ → **Raw-Konfigurationseditor**.
3. Füge den Inhalt von `dashboards/batterijplan-dashboard.yaml` (Niederländisch), `batterijplan-dashboard.en.yaml` (Englisch) oder `batterijplan-dashboard.de.yaml` (Deutsch) ein und speichere.

Die Karten folgen der Sprache deines Profils in Home Assistant. Die Dashboard-Datei bestimmt die Sprache vom Rest (Status, Einstellungen).

## Schritt 6 — Einstellungen ausfüllen

Schalte auf dem Dashboard den Schalter **Einstellungen** ein. Darunter erscheinen die Felder mit Erklärung:

| Einstellung | Was du einträgst | Beispiel |
|---|---|---|
| Beginn des Stromvertrags | der Tag, an dem dein Vertragsjahr beginnt (das Jahr spielt keine Rolle) | 9. Dezember |
| Nutzbare Kapazität der Speicher | was deine Speicher zusammen wirklich liefern können, oberhalb der Untergrenze in HBC | 2 × 5,12 kWh mit 12 % Untergrenze ≈ 9,0 kWh |
| Sicherheitsreserve | Ladung, die der Plan nie einrechnet | 0,3 kWh |
| Wirkungsgrad Laden + Entladen | wie viel % des geladenen Stroms wieder herauskommt | 75 % |
| Energiesteuer + Einkaufsaufschlag (ohne MwSt.) | was du pro kWh **zusätzlich** zum Börsenpreis zahlst: die Energiesteuer plus den Einkaufsaufschlag deines Anbieters (so ist es in den Niederlanden aufgebaut) | 0,09161 + 0,0165 = 0,1081 |
| Sensor Netzleistung | dein Sensor in W, Bezug = +, Einspeisung = − | `sensor.p1_vermogen` |
| Sensor Solarleistung | was alle deine Solarpaneele zusammen **jetzt** erzeugen, in W (nicht den Tagesertrag) | `sensor.zon_totaal` |
| Sensor Speicherleistung | Summe aller deiner Speicher in W, entladen = + | bei HBC meist `sensor.house_total_battery_power` |
| Sensor Wallbox (optional) | Ladeleistung deiner Wallbox in W | darf leer bleiben |

Hast du mehrere Wechselrichter und keinen Sensor mit der Summe? Lege einen Helfer an: *Einstellungen → Geräte & Dienste → Helfer → Helfer erstellen → Den Zustand mehrerer Sensoren kombinieren*, Typ **Summe**.

> Solange die nutzbare Kapazität nicht ausgefüllt ist, zeigt der Plan "Nicht eingerichtet" und tut nichts.

**Kontrolle:** Auf der Karte Sensoren steht *Kontrolle: Hausverbrauch jetzt*. Das muss ungefähr zu dem passen, was dein Haus wirklich verbraucht, und ist nie negativ.

**Back-up erstellen.** Alles ausgefüllt? Drücke **Back-up erstellen**. Nach einer Neuinstallation oder einem Versehen stellt **Back-up wiederherstellen** alles wieder her. Das Back-up bleibt bei einem Neustart und bei einer neuen Version erhalten.

Schalte danach den Schalter **Einstellungen** wieder aus.

## Die ersten 14 Tage: zuschauen und lernen

Batterijplan startet im **Schattenmodus**: Es rechnet und zeigt, was es tun würde, ändert aber nichts an HBC. Auf der Statuskarte siehst du bei *Verbrauch lernen*, wie weit es ist ("Tag 3 von 14").

Schau ab und zu auf *Plan heute und morgen* und *Preis und Batterie*:
- Sagt der Plan "für später halten"? Kam später am Tag tatsächlich ein teurerer Moment?
- Sagt er "entladen in teuren Viertelstunden"? War der Speicher am Ende der teuren Phase fast leer, und nicht schon viel früher?

Passt das? Dann schalte **Live** ein. Wie das geht, steht in [03 · So funktioniert es](03-how-it-works.de.md#live-schalten).
