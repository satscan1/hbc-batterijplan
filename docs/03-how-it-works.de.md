# 03 · So funktioniert es

*English: [03-how-it-works.md](03-how-it-works.md) · Nederlands: [03-how-it-works.nl.md](03-how-it-works.nl.md)*

**Kurz gesagt**
- HBC sagt pro Viertelstunde: günstig, teuer oder normal. Batterijplan schaut voraus (höchstens 36 Stunden) und rechnet aus, wo es besser sein kann als HBC allein.
- Batterijplan wählt nur zwischen Modi, die HBC selbst anbietet. Alle Schutzfunktionen bleiben bei HBC und der Batterie.
- Alles, was Batterijplan tut, steht im Logbuch von Home Assistant unter dem Namen "Batterijplan".

## Das Problem, das Batterijplan löst

HBC (Strategie **Dynamic**) gibt jeder Viertelstunde ein Label:
- **günstig**: aus dem Netz laden;
- **teuer**: für das Haus entladen;
- **normal**: nur aus der Sonne laden.

Das funktioniert gut, aber HBC schaut nicht weiter als das Label der Viertelstunde, in der es sich gerade befindet. Die Folge: Die Batterie ist in einem teuren Moment von 27 ct leer, obwohl eine Stunde später ein Moment von 50 ct kommt. Oder sie ist nicht geladen für eine Abendspitze, die HBC nicht als teuer markiert.

## Der Plan

Batterijplan rechnet zweimal, über alle Viertelstunden, deren Preis es kennt:
1. **HBC allein**: günstig → aus dem Netz laden, teuer → entladen, sonst nur die Sonne.
2. **Batterijplan**: dasselbe, plus die vier Regeln unten.

Der Unterschied zwischen beiden, in Euro, ist die **erwartete Ersparnis** im Dashboard.

Es berücksichtigt:
- wie viel Ladung jetzt in den Batterien ist (der Ladestand über der Untergrenze von HBC, mal die nutzbare Kapazität, minus deine Sicherheitsmarge);
- wie viel dein Haus zu dieser Tageszeit meist verbraucht (das lernt es selbst);
- wie viel Sonne erwartet wird (Solcast, die vorsichtige Schätzung für die Berechnung; die Grafik zeigt die mittlere Schätzung, wie HBC);
- die Preise pro Viertelstunde, wie HBC sie liefert, und deine Kosten (siehe [die Kosten](#die-kosten)).

Es rechnet jede Viertelstunde, kurz bevor sie beginnt (um :14:30, :29:30, :44:30 und :59:30), und auch wenn sich die Preise ändern oder HBC die Strategie wechselt.

### Die Schwelle

Batterijplan nutzt eine Schwelle: die HBC-Einstellung **Dynamic threshold delta** (in ct). Das ist der Preisunterschied, ab dem HBC selbst sagt "das lohnt sich". Sie muss auch die Verluste in der Batterie decken, deshalb hat Batterijplan keine eigene Wirkungsgrad-Einstellung und keine feste Grenze.

Eine Viertelstunde gilt als **teuer**, wenn HBC sie als teuer markiert, **oder** wenn ihr Preis mindestens die Schwelle über der günstigsten Viertelstunde davor liegt.

## Die Regeln

Jede Regel hat einen eigenen Schalter (im Dashboard unter *Einstellungen*, Reiter **Regeln**, und im Briefing). Alle vier sind standardmäßig an. Schaltest du eine Regel aus, tut der Plan in diesen Momenten das, was HBC allein tut.

| Regel | Was sie tut, in einfachen Worten |
|---|---|
| **Aus dem Netz laden** | In einer Viertelstunde, die nicht teuer ist, lädt Batterijplan zusätzlich aus dem Netz, wenn die Batterie sonst für spätere teure Viertelstunden zu leer wäre, die mindestens die Schwelle teurer sind als jetzt. Es hört auf, sobald eine günstigere Viertelstunde kommt. |
| **Entladen außerhalb der HBC-Zeiten** | Eine Viertelstunde, die HBC nicht teuer nennt, die aber mindestens die Schwelle über der günstigsten Viertelstunde davor liegt, gilt auch als teuer. Die Batterie entlädt dann dort. |
| **Halten** | In einer teuren Viertelstunde entlädt die Batterie nicht, wenn die Ladung für spätere Viertelstunden gebraucht wird, die mindestens die Schwelle teurer sind, bevor eine Viertelstunde kommt, die mindestens die Schwelle günstiger ist. Die Ladung bleibt für später erhalten. |
| **Einspeisen** | Ist sicher ein Überschuss in der Batterie (nachdem zurückgehalten wurde, was du selbst später brauchst), speist Batterijplan ihn in einer Viertelstunde ins Netz ein, in der der Einspeisepreis mindestens die Schwelle über dem günstigsten Bezugspreis liegt. |

Liegt Sonne oder ein günstiger Moment zwischen zwei Spitzen? Dann zählt Batterijplan das als Nachladen, und die erste Spitze darf einfach entladen.

Die fünf Buchstaben im Plan: **L** aus dem Netz laden, **O** entladen, **H** halten, **Z** nur die Sonne, **V** einspeisen.

> Die alten Regeln (Überschuss entladen, Nachladen bei Bedarf, die feste Grenze von 0,10 €) und die Einstellung *Wirkungsgrad* gibt es in dieser Version nicht mehr. Die Schwelle von HBC ersetzt sie.

## Die Kosten

Batterijplan rechnet ohne Saldierung, also haben Bezug und Einspeisung jeweils ihren eigenen Preis:
- **Bezug**: (Börsenpreis + Aufschlag) × (1 + MwSt.). Bei *all-in*-Preisen: der Preis, wie HBC ihn liefert.
- **Einspeisung**: Börsenpreis + Aufschlag. Tagsüber (wenn Sonne da ist, oder zwischen den Stunden, die du einstellst) bekommt ein positiver Preis den Bonusprozentsatz obendrauf.
- Ladung, die am Ende des Plans noch in der Batterie ist, zählt zum niedrigsten Bezugspreis im Plan.

Der Aufschlag, die MwSt., der Einspeise-Aufschlag und der Bonus sind Einstellungen, keine festen Zahlen. Ein Anbieter wie Zonneplan hat zum Beispiel einen *Opslag* im Bezugspreis und eine *Terugleververgoeding* für die Einspeisung; trage ein, was dein eigener Vertrag sagt. Siehe [01 · Installation](01-installation.de.md#experten-einstellungen).

## Was Batterijplan in HBC steuert

Batterijplan ändert nichts in HBC, solange **Live** aus ist. Mit **Live** an, und nur wenn HBC auf **Dynamic** steht, setzt es nach jeder Berechnung einen der drei Dynamic-Modi von HBC: den, der zur Preisklasse der kommenden Viertelstunde gehört, so wie HBC sie selbst labelt. HBC liest sie pro Viertelstunde.

| Preisklasse (laut HBC) | Plan: halten | Plan: einspeisen | Plan: aus dem Netz laden | Sonst |
|---|---|---|---|---|
| **Teuer** (*dynamic expensive*) | Standby / peak shave | Sell | — | Self-consumption |
| **Günstig** (*dynamic cheapest*) | Standby / peak shave | — | Charge | Charge PV |
| **Normal** (*dynamic default*) | Standby / peak shave | Self-consumption | — | Charge PV (entladen: Self-consumption) |

HBC kennt in der normalen Klasse kein *Charge*, also kann Batterijplan in einer normalen Viertelstunde in diesem Modus nicht selbst aus dem Netz laden. Es ändert einen Modus nur, wenn er anders ist. Jede Änderung steht im Logbuch.

### Deine eigenen HBC-Modi

Batterijplan merkt sich deine drei Modi (teuer, normal, günstig):
- in dem Moment, in dem du *Live* einschaltest;
- und jedes Mal, wenn du sie änderst, während *Live* aus ist.

Es stellt sie zurück, wenn *Live* ausgeht oder wenn HBC Dynamic verlässt. Noch nichts gemerkt? Dann stellt es *Self-consumption*, *Charge PV* und *Charge* zurück.

### Wenn HBC nicht auf Dynamic steht

Wählst du (oder eine Automatisierung, zum Beispiel bei einem negativen Preis) eine andere Strategie in HBC, dann:
- steuert Batterijplan nichts und der Zähler zählt nichts;
- stellt Batterijplan, wenn *Live* an war, die drei Modi auf deine eigenen zurück;
- läuft das Lernen einfach weiter.

Sobald HBC wieder auf Dynamic steht, rechnet der Plan sofort neu und steuert wieder nach.

## Live einschalten

Schalte im Dashboard **Live** ein (der Schalter `switch.batterijplan_live`). Ab diesem Moment passt Batterijplan jede Viertelstunde die Dynamic-Modi von HBC an, wie in der Tabelle oben.

**Live wieder aus?** Dann stellt Batterijplan die Modi sofort auf deine eigenen zurück. HBC steht dann ganz so wie vorher.

**Live und Schatten.** Mit *Live* aus rechnet Batterijplan weiter, lernt und zählt, was es gebracht hätte, aber getrennt als *Schatten*. Der Sensor `sensor.batterijplan` zeigt `modus`: *live* oder *schaduw* (Schatten).

## Lernen

Batterijplan misst den Hausverbrauch pro Viertelstunde (Netz + Sonne + Batterie, minus die Ladestation) und baut ein Profil für jede Stunde des Tages auf. Es lernt über **7 Tage**:

| Status | Nach | Bedeutung |
|---|---|---|
| am Lernen | 0–3 Tage | Nach dem ersten Tag macht es schon mit, ist aber noch unruhig. |
| grob | 4–6 Tage | Brauchbar, aber ein seltsamer Tag wiegt noch schwer. |
| gut | 7+ Tage | Gut abgestimmt. Danach lernt es laufend weiter: Alte Tage verblassen langsam, es geht also mit den Jahreszeiten mit. |

Warum 7 Tage? Ein Test mit 89 Tagen echter Messdaten zeigte, dass ein kurzes Gedächtnis den Verbrauch etwas besser vorhersagt als ein langes.

Die **Prognose** vergleicht den erwarteten Verbrauch mit dem echten Verbrauch, pro Block von 3 Stunden (00–03, 03–06 und so weiter). Eine einzelne Viertelstunde ist zu sprunghaft zum Vorhersagen; ein Block von 3 Stunden ist das, was für den Plan wirklich zählt. Du siehst ein Urteil: *wechselhaft* (unter 55 %), *ordentlich* (ab 55 %), *gut* (ab 65 %), *sehr gut* (ab 75 %) oder *ausgezeichnet* (ab 85 %). Der Prozentwert selbst steht im Sensor `sensor.batterijplan_voorspelling` (Attribut *betrouwbaarheid*), gleitend über die letzten 7 Tage.

Das Lernen läuft immer weiter, auch im Schattenmodus und auch wenn HBC nicht auf Dynamic steht.

## Der Zähler: Mehrwert

Der Sensor `sensor.batterijplan_meerwaarde` zählt, was Batterijplan zusätzlich zu HBC allein bringt. Jede Viertelstunde wird im Nachhinein abgerechnet:

(die Kosten von HBC allein in dieser Viertelstunde − die Kosten des Plans in dieser Viertelstunde) + (Ladung Plan − Ladung HBC allein am Ende dieser Viertelstunde) × der niedrigste Bezugspreis im Plan.

Er zählt nur, wenn **Live** an ist und HBC auf **Dynamic** steht. Sonst geht die Viertelstunde in die Summe *Schatten*. Der zweite Sensor, `sensor.batterijplan_meerwaarde_periode`, zählt pro **Vertragsjahr**: Er beginnt neu an Tag und Monat deines Vertragsbeginns.

**Es ist eine Schätzung** ("geschat"). Sie beruht auf den Preisen und dem Verbrauch, die Batterijplan zu diesem Zeitpunkt erwartete. Deine Energierechnung ist der echte Beweis.

## Was es (noch) nicht tut

- **Ein günstiger Nachmittag, den HBC nicht als günstig markiert** (wegen der Grenze für Stunden pro Tag oder des Mindestpreisunterschieds in HBC), zählt nicht als Nachladen.
- **Unterschied zwischen Werktagen und Wochenende** beim Verbrauch.
- **Die Batterie in einer normalen Viertelstunde im HBC-Modus *Charge PV* aus dem Netz laden:** Dafür bietet HBC keinen Modus (siehe [die Tabelle](#was-batterijplan-in-hbc-steuert)).

## Solarprognose für HBC (Ladeziel)

`sensor.batterijplan_zon_voor_hbc` lässt HBC das Netzladen auf dem vom Plan gewünschten Stand beenden. Wert = Reserve + maximale Energie − Ziel (kWh). Ziel = geplante Ladung (kWh über der Entlade-Abschaltung) am Ende des kommenden zusammenhängenden Netzladeblocks. Ein Ziel auf oder über der maximalen Energie ergibt volles Laden; ohne Netzladeblock im Plan ist das Ziel die jetzt gespeicherte Energie.

- Funktioniert nur mit dem HBC-Ladeziel *solar forecast* und nur, wenn du `input_text.house_battery_strategy_solar_forecast_entity_id` selbst auf diesen Sensor setzt. Batterijplan ändert HBC nie.
- Jeder Planlauf (30 s vor jedem Viertel) aktualisiert den Sensor; das HBC-Template liest ihn um :00, :15, :30 und :45.
- HBC hat für dieses Ziel keine Hysterese: die Batterie kann um das Ziel herum ein- und ausschalten.

### Durchreichen und Solcast-Namen (rc5)

- **Durchreichen.** Ist Live aus, steht HBC nicht auf Dynamic, ist die Regel *Laden* aus, gibt es keinen Plan oder sind Reserve und Maximum unbekannt, reicht der Sensor die echte Solarprognose 1:1 weiter. HBC verhält sich dann genau wie ohne Batterijplan. Die Quelle ist der Sensor, auf den HBC vorher zeigte (gemerkt, sobald der Zeiger nicht auf diesem Sensor steht), sonst Solcast *verbleibend heute*. Die Attribute `modus`, `reden` und `bron` zeigen, was passiert.
- **Solcast-Namen.** In den Einstellungen gibt es zwei optionale Felder, *Solarprognose heute* und *morgen*. Ein ausgefülltes Feld gewinnt immer. Sonst sucht Batterijplan selbst: zuerst Solcast über die Plattform (sprachunabhängig), dann die bekannten Namen in der Reihenfolge Englisch, Niederländisch, Deutsch. Wird nichts gefunden, meldet der Bericht *nicht gefunden* mit dem Tipp, die Felder auszufüllen.

### Empfehlung und automatisches Anpassen der HBC-Einstellungen (rc6)

Batterijplan kann zu drei HBC-Einstellungen eine Empfehlung geben: *cheapest hrs*, *expensive hrs* und *Solar reserved for house*. Die Karte **Empfehlung für HBC** zeigt je Einstellung den aktuellen Wert, die Empfehlung, eine Begründung in einer Zeile und einen orangen Punkt, wenn sie sich unterscheiden (auch bei ausgeschaltetem automatischem Anpassen).

**Was gespeichert wird.** Pro Viertelstunde, 7 Tage lang: der reine HBC-Preis, dein gemessener Hausverbrauch und deine gemessene Solarerzeugung. Das liegt kompakt in einer eigenen Datei und bleibt nach einem Neustart erhalten. Solange keine 7 vollen Tage vorliegen, steht dort *Noch am Messen: Tag x von 7* und nichts ändert sich.

**Wie die Empfehlung entsteht.** Einmal pro Nacht (gegen 03:10) spielt Batterijplan die letzten 7 Tage mit seinem eigenen Planer noch einmal ab (Live an, aktuelle Regeln). Für jedes Kandidatenpaar aus *cheapest hrs* und *expensive hrs* markiert es die Viertelstunden genau wie HBC (pro Kalendertag, günstigste gegen teuerste, solange der Abstand mindestens die HBC-Schwelle beträgt, begrenzt durch die Stundenzahl) und summiert die Netzkosten. Jeder nachgespielte Tag beginnt mit leerer Batterie, und Ladung, die am Tagesende übrig ist, wird mit dem günstigsten Einkaufspreis dieses Tages bewertet, zählt also nicht als Verlust. Das Paar mit den niedrigsten Kosten gewinnt. Sind zwei Ergebnisse praktisch gleich (weniger als 1 Cent über die 7 Tage), gewinnt der Wert, der deiner aktuellen Einstellung am nächsten liegt. Die Kandidaten sind ganze Stunden bis 12 (oder das Maximum des Helfers), immer innerhalb der Grenzen des Helfers. Die Berechnung braucht wenige Sekunden Rechenzeit, einmal am Tag. *Solar reserved for house* ist der Durchschnitt der bestehenden 7-Tage-Empfehlung, auf 0,5 kWh gerundet.

**Automatisch anpassen.** Der Schalter *HBC-Einstellungen automatisch anpassen* ist standardmäßig **aus**. Schaltest du ihn ein, merkt sich Batterijplan zuerst deine eigenen drei Werte und setzt dann eine Einstellung auf die Empfehlung, nur wenn der Unterschied mindestens 1 Stunde (cheapest, expensive) oder 0,5 kWh (solar reserved) beträgt. Beim Ausschalten kommen deine eigenen Werte genau zurück. Jede Änderung steht im Logbuch. Batterijplan ändert nur diese drei Einstellungen; an den Flows oder am Code von HBC ändert es nie etwas.

### Live-Ladestand und geringere Recorder-Last (rc6)

*Jetzt in der Batterie* wird mit derselben Formel wie der Plan neu berechnet, sobald sich ein Batterieladestand oder eine Entladegrenze ändert (höchstens alle 5 Sekunden, ohne neue Planberechnung). Der Wert liegt im kleinen Sensor `sensor.batterijplan_lading`: Der Zustand ist die Live-Ladung in kWh, auf 0,1 kWh gerundet, er schreibt also nur, wenn er sich um so viel ändert. Das Attribut `lading_plan` enthält die geplante Ladung. Der große Sensor `sensor.batterijplan` und das Diagramm behalten die Planwerte.

Die großen oder ständig wechselnden Attribute der Sensoren (die Planpunkte, die Erklärung, die Solcast-Namen, die Viertelstundenzeiten und die Live-Zahlen) stehen den Karten weiter zur Verfügung, werden aber nicht mehr in die Recorder-Datenbank geschrieben. Die Entscheidungen (Aktion, HBC-Aktion, Modus, HBC-Strategie) bleiben gespeichert. Auf einem üblichen System sinkt die Attributdatenmenge des Hauptsensors damit von etwa 690 kB auf wenige kB pro Tag.
