# 01 · Installation

*English: [01-installation.md](01-installation.md) · Nederlands: [01-installation.nl.md](01-installation.nl.md)*

**Kurz gesagt**
- Batterijplan ist eine Home-Assistant-Integration. Du installierst sie mit HACS und richtest sie in einem Formular ein. Keine YAML-Datei, keine Karten registrieren, kein Dashboard einfügen.
- Die Karten und das Dashboard gehören zur Integration. Das Dashboard erscheint in der Seitenleiste unter `/batterijplan`.
- Node-RED brauchst du dafür nicht. Rechne mit etwa zehn Minuten.
- Nach der Installation steht Batterijplan im **Schattenmodus**: Es rechnet mit, steuert aber noch nichts.

## Was du brauchst

| Nötig | Warum |
|---|---|
| Home Assistant 2026.10.1 oder neuer, mit [HACS](https://hacs.xyz) | Du installierst Batterijplan über HACS. |
| HBC Version 4.14 oder neuer, auf **Full control** und Strategie **Dynamic** | Batterijplan liest die Labels, die HBC pro Viertelstunde vergibt (günstig, teuer, normal), die Ladung jeder Batterie und die *Schwelle*. |
| Ein dynamischer Stromvertrag mit Viertelstunden- oder Stundenpreisen | Ohne Preisunterschiede gibt es nichts zu verteilen. HBC darf die Preise ohne Aufschläge oder all-in liefern; das stellst du im Formular unter *Preise von HBC* ein. |
| Solcast-Solarprognose (Integration *Solcast PV Forecast*) | Für die erwartete Sonne pro halber Stunde. Niederländische und englische Sensornamen funktionieren beide. Keine Solaranlage? Dann rechnet Batterijplan mit 0 Sonne. |
| Sensoren für Netzleistung und Batterieleistung (und optional Solarleistung), in Watt (W) | Um den Hausverbrauch zu messen und zu lernen. Es ist immer die Leistung von *diesem* Moment, keine Tagessumme in kWh. |

Optional: ein Sensor für die Ladeleistung deiner Ladestation. Sie wird vom Hausverbrauch abgezogen, damit das Laden des Autos dein Verbrauchsprofil nicht verfälscht.

## Schritt 1 — HBC richtig einstellen

Stelle HBC auf **Full control** und Strategie **Dynamic**. Die Schwelle in HBC (*Dynamic threshold delta*, in ct) nutzt Batterijplan, um zu entscheiden, was "deutlich teurer" ist. Wähle sie so, dass sie deine Batterieverluste deckt: Batterijplan hat keine eigene Wirkungsgrad-Einstellung mehr.

Welche HBC-Modi du für günstig, normal und teuer eingestellt hast, spielt für die Installation keine Rolle. Batterijplan merkt sie sich und stellt sie zurück, wenn du *Live* ausschaltest. Siehe [03 · So funktioniert es](03-how-it-works.de.md#was-batterijplan-in-hbc-steuert).

## Schritt 2 — Mit HACS installieren

1. Öffne in HACS das Menü (⋮) oben rechts und wähle **Benutzerdefinierte Repositories**.
2. Repository: `https://github.com/satscan1/hbc-batterijplan`, Kategorie **Integration**. Hinzufügen.
3. Suche in HACS nach **HBC Batterijplan** und wähle **Herunterladen**.
4. Starte Home Assistant neu.

## Schritt 3 — Integration hinzufügen

1. *Einstellungen → Geräte & Dienste → Integration hinzufügen → Batterijplan*.
2. Ist Batterijplan noch als Paket in deinem Home Assistant? Dann kommt zuerst eine Auswahl. Siehe [Umstieg vom Paket](#umstieg-vom-paket-100-rc1rc2). Beginnst du neu? Wähle **Neu beginnen**, oder du kommst gleich zum Formular.
3. Fülle das Formular aus (unten) und drücke **Senden**.

Das Formular:

| Feld | Was eintragen | Beispiel |
|---|---|---|
| Sensor Netzleistung (+ = Bezug) | dein Sensor in W, Bezug = +, Einspeisung = − | `sensor.p1_leistung` |
| Sensor Batterieleistung (+ = Entladen) | Summe aller deiner Batterien in W, Entladen = + | `sensor.house_total_battery_power` |
| Sensor Solarleistung (optional) | was alle deine Solarmodule zusammen **jetzt** erzeugen, in W (nicht der Tagesertrag) | `sensor.solar_gesamt` |
| Sensor Ladestation (optional) | Ladeleistung deiner Ladestation in W | darf leer bleiben |
| Nutzbare Kapazität der Batterien | was deine Batterien zusammen *wirklich* liefern können, über der Untergrenze in HBC | 2 × 5,12 kWh bei 12 % Untergrenze ≈ 9,0 kWh |
| Sicherheitsmarge | Ladung, mit der der Plan nie rechnet | 0,3 kWh |
| Preise von HBC | *Reiner Börsenpreis*, wenn HBC den reinen Marktpreis liefert (Standard); *All-in-Preis*, wenn HBC den Preis mit Steuern, Aufschlag und MwSt. liefert. Bei all-in rechnet Batterijplan nichts dazu. | rein |
| Aufschlag pro kWh ohne MwSt. | was dein Anbieter pro kWh auf den Börsenpreis aufschlägt, ohne MwSt. Manche Anbieter (zum Beispiel Zonneplan) nennen das *Opslag* oder *Inkoopvergoeding*: schau in deinen Vertrag. Wird bei all-in-Preisen nicht benutzt. | siehe Vertrag |
| Vertragsbeginn (optional) | der Tag, an dem dein Vertragsjahr beginnt (das Jahr spielt keine Rolle). Der Zähler *Mehrwert dieses Vertragsjahr* folgt diesem Datum. | 9. Dezember |

Mehrere Wechselrichter und kein Sensor mit der Summe? Lege einen Helfer an: *Einstellungen → Geräte & Dienste → Helfer → Helfer erstellen → Status mehrerer Sensoren kombinieren*, Typ **Summe**.

> Solange die nutzbare Kapazität nicht ausgefüllt ist, gibt es keinen Plan, und Batterijplan tut nichts.

Du bekommst eine Fehlermeldung, wenn Netz- und Batteriesensor derselbe Sensor sind.

### Experten-Einstellungen

Den Rest änderst du später: Drücke bei der Integration auf **Konfigurieren**. Neben den Feldern oben siehst du dann auch:

| Feld | Standard | Bedeutung |
|---|---|---|
| MwSt. | 21 % | MwSt. auf das, was du einkaufst. |
| Einspeise-Aufschlag (EUR/kWh) | 0,02 | Was du beim Einspeisen zusätzlich zum Börsenpreis bekommst. Bei Zonneplan ist das zum Beispiel die *Terugleververgoeding*. Schau in deinen Vertrag. |
| Tages-Einspeisebonus | 10 % | Zusätzlicher Prozentsatz auf einen positiven Einspeisepreis tagsüber. 0 = keiner. |
| Tagsüber ab / bis (Uhr) | 8 / 17 | Die Stunden für diesen Bonus. Jede Viertelstunde mit Sonne zählt ebenfalls als Tag. |

Die Sensoren, Kapazität, Marge, Preise, Aufschlag und das Vertragsdatum änderst du auch im Dashboard unter **Einstellungen**.

## Schritt 4 — Dashboard öffnen

In der Seitenleiste gibt es ein neues Dashboard **Batterijplan** (Adresse `/batterijplan`). Die Karten sind eingebaut: Du musst keine Ressource hinzufügen und keine Datei ablegen. Ist die Adresse schon von einem eigenen Dashboard belegt? Siehe [05 · Fehlerbehebung](05-troubleshooting.de.md#dashboard-und-karten).

Siehst du den Eintrag nicht gleich? Aktualisiere den Browser (am Handy: App schließen und neu öffnen).

**Kontrolle:** Unter dem Knopf **Sensoren** siehst du *Hausverbrauch jetzt*. Das sollte ungefähr zu dem passen, was dein Haus wirklich verbraucht, und ist nie negativ.

## Recorder (nur wenn du eine Include-Liste nutzt)

Arbeitet dein Recorder mit einer festen Liste (`include`)? Dann nimm diese Entitäten auf. Sonst bleiben Grafik und Zähler leer:

```yaml
recorder:
  include:
    entities:
      - sensor.batterijplan
      - sensor.batterijplan_meerwaarde
      - sensor.batterijplan_prijs
      - sensor.batterijplan_lading
      - input_select.house_battery_strategy_dynamic_expensive
      - switch.batterijplan_live
```

Nutzt du keine Include-Liste (Standard), musst du nichts tun.

## Die ersten 7 Tage: beobachten und lernen

Batterijplan startet im **Schattenmodus**: Es rechnet und zeigt, was es tun würde, ändert aber nichts in HBC. Auf der Statuskarte zeigt *Verbrauch lernen*, wie weit es ist ("Tag 3 von 7").

Schau ab und zu auf die Grafik und das Briefing:
- Sagt der Plan "halten"? Kam später am Tag tatsächlich ein teurerer Moment?
- Entlädt es außerhalb der HBC-Zeiten? War das wirklich eine deutlich teurere Viertelstunde als die davor?

Passt das? Dann schalte **Live** ein. Wie das funktioniert, steht in [03 · So funktioniert es](03-how-it-works.de.md#live-einschalten).

## Umstieg vom Paket (1.0.0-rc1/rc2)

Hast du Batterijplan als Paket genutzt (`packages/batterijplan.yaml`), mit den Karten in `www/batterijplan` und einem selbst eingefügten Dashboard? Dann gehe so vor, in dieser Reihenfolge:

1. **Sichere Home Assistant** (*Einstellungen → System → Backups*). Der alte Knopf *Backup erstellen* ist dafür nicht nötig.
2. **Installiere die Integration** mit HACS (Schritt 2 und 3 oben) und starte neu.
3. Füge die Integration hinzu. Weil das Paket noch da ist, bekommst du jetzt eine Auswahl. Wähle **Aus dem Batterieplan-Paket übernehmen**. Batterijplan übernimmt deine Einstellungen (Sensoren, Kapazität, Marge, Preise, Aufschlag, Vertragsbeginn), das **gelernte Verbrauchsprofil** und den **Zähler**. Du siehst das Formular noch einmal, ausgefüllt. Prüfe es und sende es ab.
4. **Entferne das Paket.** Lösche `packages/batterijplan.yaml` (und, falls vorhanden, `packages/batterijplan_proef.yaml`).
5. **Entferne die alten Karten.** Lösche den Ordner `www/batterijplan/`. Entferne die Ressource `/local/batterijplan/batterijplan-cards.js` unter *Einstellungen → Dashboards → ⋮ → Ressourcen*.
6. **Entferne das alte Dashboard** (*Einstellungen → Dashboards*).
7. **Starte Home Assistant neu.** Solange das Paket noch da war, bekamen die neuen Entitäten eine ID mit `_2` am Ende (zum Beispiel `sensor.batterijplan_2`). Beim Neustart setzt Batterijplan sie auf die normalen Namen zurück, sodass dein Verlauf und deine eigenen Karten weiter funktionieren.
8. Öffne das neue Dashboard **Batterijplan** in der Seitenleiste.

Gut zu wissen:
- Die neuen Regeln ersetzen die alten. Überschuss entladen, die *Empfehlung für HBC* und die Wirkungsgrad-Einstellung gibt es nicht mehr; siehe [03 · So funktioniert es](03-how-it-works.de.md#die-regeln).
- Die alten Knöpfe für Backup und Wiederherstellen gibt es nicht mehr. Die Integration speichert alles selbst; siehe [04 · Wartung](04-maintenance.de.md#backup).
- Recorder mit Include-Liste: Die Hauptnamen in der Liste oben haben sich nicht geändert. Nimm `sensor.batterijplan_advies_huisverbruik` und `input_boolean.batterijplan_live` heraus; füge `switch.batterijplan_live` hinzu.
- Die Summe des Zählers wird übernommen. Der Zähler *Mehrwert dieses Vertragsjahr* beginnt bei der Übernahme neu.
- *Live* wird nie übernommen: Es steht nach der Installation immer auf **aus**, die Integration ändert also nichts in HBC. Schalte *Live* des Pakets selbst aus und danach *Live* der Integration ein, wenn du bereit bist.
