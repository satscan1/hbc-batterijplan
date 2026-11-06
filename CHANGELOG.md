# Changelog

## 1.0.0-rc6 — solar forecast for HBC, advice and auto-adjust for the HBC settings, live charge (release candidate)

rc5 was never published, so this release contains everything since rc4.

**New**
- **Sensor `sensor.batterijplan_zon_voor_hbc` (solar forecast for HBC)** lets HBC stop its grid charge at the level the plan wants. Value = `reserved + max energy - target`: *target* is the planned charge (kWh above the discharge cut-off) at the end of the coming consecutive grid-charge block, *reserved* is `input_number.house_battery_solar_reserved_for_house`, *max energy* is `input_number.house_battery_total_max_available_energy` (the capacity setting while HBC has not filled it). A target at or above max energy gives a full charge.
- **Pass-through.** Whenever Live is off, HBC is not on Dynamic, the rule *charge* is off, there is no plan, or reserve/maximum are unknown, the sensor reports the real forecast source 1:1, so HBC behaves exactly as without Batterijplan. The source is the entity HBC pointed to before (remembered whenever `input_text.house_battery_strategy_solar_forecast_entity_id` is not this sensor, and stored), otherwise Solcast *remaining today*. The attributes `modus` (`laaddoel` or `doorgifte`), `reden` and `bron` show what it does.
- Updated at every plan run (30 s before each quarter) and on every change of Live, strategy, rules, reserve or maximum, so HBC's template (refresh at :00, :15, :30, :45) picks it up for the new quarter.
- **Only works with HBC charge goal *solar forecast*** and with the HBC pointer set to this sensor by hand. HBC has no hysteresis on this goal: it may toggle around the target. Batterijplan never changes HBC or its settings.
- **Solcast names (issue #6).** Two optional fields in Settings, *Solar forecast today* and *Solar forecast tomorrow*; a filled field always wins. Otherwise automatic: Solcast by platform (language-independent), then the known ids in the order English, Dutch, German. The chosen ids are attributes of `sensor.batterijplan` (`zon_vandaag`, `zon_morgen`, `zon_rest_vandaag`) and the cards use those. The report says *not found* only when automatic and fields both fail, with the tip to fill the fields.
- **Tooltip on the chart** (`batterijplan-plan-card`): hover with the mouse or tap on a phone. A vertical line follows the pointer and a box shows, for that quarter, the time, bare price (ct), expected solar in kW (normal and cautious estimate), charge HBC and Batterijplan (kWh) and the actions of both (Dutch, English, German). Only the line and the box move; the card is not redrawn. The plan points now carry the cautious solar estimate as a ninth value.
- **Advice for the HBC settings *cheapest hrs* and *expensive hrs*** (next to *Solar reserved for house*). From now on Batterijplan keeps, per quarter and for 7 days (persistent, compact, own storage file): the bare HBC price, the measured house use and the measured solar. Once a night (03:10, in the executor, and once after a restart if the day's calculation is missing) it replays those 7 days with its own planner (Live on, current rules) for a coarse grid of candidates (whole hours from 0 up to 12 or the helper maximum, plus the current value, always inside the helper's min / max / step) and picks the pair with the lowest total grid cost. Each replayed day starts with an empty battery, and the charge left at the end of a day is valued at that day's cheapest purchase price (the same convention as the earnings of the plan), so charge that is left over is not counted as a loss. Equal results (less than 1 cent over the 7 days) go to the value closest to the current one. The search is pruned (cheapest hours with expensive fixed, then expensive, at most two rounds; every distinct set of marks is planned once), so a calculation takes about 8 seconds of processor time on a normal system. Until 7 full days are stored the status is *measuring day x of 7* and nothing changes.
- **Exact replica of HBC's marking** (`hbcmarks.py`, port of the flow node *Determine dynamic strategy*, HBC v4.15.1): per local calendar day the quarters are sorted by price (stable), `lo` and `hi` walk inward while the spread is at least the threshold delta (whole cents), capped per day by `round(hours x quarters per hour)` (0 hours = no cap). A test reproduces the real marks of `sensor.hbc_energy_prices_data` (8 h / 8 h / 6 ct) quarter for quarter.
- **Switch `switch.batterijplan_hbc_auto`** (*Auto-adjust HBC settings* / *HBC-instellingen automatisch* / *HBC-Einstellungen automatisch anpassen*), default **off**, remembered over restarts. On: your own values of the three HBC settings are remembered first, then each setting is set to the advice, only when it differs by at least 1 hour (cheapest, expensive) or 0.5 kWh (solar reserved), snapped to the helper's step and limits. Off: your own values come back exactly. Every change (and every restore) is a logbook entry. If you change one of the three settings yourself while the switch is on, that value becomes your new own value (restored when the switch goes off); Batterijplan's own writes are recognised by their context and are never taken for yours, and your value is not overwritten straight away (the next nightly advice may adjust it again; logbook entry).
- **Sensor `sensor.batterijplan_advies_hbc`** (status `meten`, `berekend`, `niet_beschikbaar`, `geen_zon`; attributes with current value, advice and *differs* per setting, the 7 days replayed, saving in euro, runtime) and the card *Advice for HBC* now shows all three settings: current, advice, a one-line reason and an orange dot when they differ, also when the switch is off. The button *Advice HBC* gets the same dot.
- **Live charge level**: *In de batterij nu* is recomputed with the plan's formula (`plan.stored_energy`) whenever a battery SOC or discharge cut-off changes (debounced, at most once per 5 seconds, no plan run), instead of only at the plan recalculation before each quarter. It lives only in the small sensor `sensor.batterijplan_lading` (state = live charge in kWh, rounded to 0.1 kWh, so it only writes when it changes by that much, and shown with one decimal in the cards; attribute `lading_plan` = planned charge). The big plan sensor `sensor.batterijplan` is not touched by it (no extra database writes); its attribute `lading` and the chart keep the plan values. The cards read the live value from `sensor.batterijplan_lading` (`_2` first when a second Batterijplan exists) and fall back to the plan value.
- **Lighter recorder load**: the large or constantly changing attributes (`punten`, `uitleg`, `versie`, the Solcast names, `kosten_hbc`, `kosten_plan`, `lading`, `start`, `komend_kwartier`, `lading_plan`, `eur_live`, `eur_schaduw`, `kwartieren_*`) stay in the state machine for the cards but are no longer written to the recorder database (`_unrecorded_attributes`). The decisions (`actie`, `hbc_actie`, `modus`, `hbc_strategie`) stay recorded. Nothing reads the history of the excluded attributes (the cards' history calls use `no_attributes`, statistics use the state). On a typical system this takes the attribute data of `sensor.batterijplan` from about 690 kB to a few kB per day. A test guards the list.
- The plan accepts measured house use and solar per quarter, a horizon and a coarser level grid for the replay; without those options the plan is unchanged (test).

**Rules**
- Batterijplan may change HBC *settings* (the three helpers above), and only with the new switch on. It never touches HBC flows, code or packages.

**Fixed**
- The chart and briefing (`batterijplan-plan-card`) now also read `sensor.batterijplan_2` when it exists, like the status card.
- `sensor.batterijplan_zon_voor_hbc` had the device class *energy* together with the state class *measurement*, which Home Assistant does not allow (warning in the log). The sensor now has no device class and keeps its unit (kWh) and state class, so nothing changes for HBC or the statistics. All other sensors were checked: no other combination is invalid.

## 1.0.0-rc4 — entity names fix (release candidate)

**Fixed**
- **All entities showed the name *Batterijplan*.** Each entity now has its own translated name (Dutch, English, German). The entity ids are unchanged, so history, automations and cards keep working. Closes #4.

## 1.0.0-rc3 — now a Home Assistant integration, new rules, cards built in (release candidate)

**Also in rc3 (after the first live days)**
- **Grid charging in blocks of at least 30 minutes.** A single cheap quarter was too short for HBC to start charging; the plan now keeps a started grid-charge block going for at least two quarters (part of the optimisation, not added afterwards).
- **Advice for HBC is part of the integration.** New sensor `sensor.batterijplan_advies_zon_na_goedkoop_laden` (expected house use covered by solar after the first cheap quarter of the day) and the card *Advice for HBC* behind the button in the button row. The status card shows *Advice house consumption* only after 7 days of measuring (7-day average).
- **Button row order:** Earnings – Report – Advice HBC – Settings – Sensors.
- **Settings:** back-up, restore and defaults are real buttons with a confirmation; the four rules are on/off switches that the briefing shows right away.
- **Shadow value only while Live is off.** The shadow counter starts at zero for every new shadow period and keeps at most 30 days.
- **This contract year** counts everything since the counter started when that lies inside the contract year (after a take-over it missed the taken-over part).
- **Numbers follow the number format of the Home Assistant user profile** (comma or point).
- **Season picture:** tap the logo on the status card to see the season picture (spring, summer, autumn, winter).
- Shorter texts on the status card (no time behind *Coming quarter*, short HBC mode names).

**New**
- **Planning by dynamic programming.** The plan now looks at the whole price horizon at once (charge level in steps of 0.05 kWh) and only picks actions HBC can really execute: cheap quarters *Charge*, *Charge PV* or *Standby*; regular quarters *Charge PV*, *Self-consumption* or *Standby*; expensive quarters *Self-consumption*, *Standby* or *Sell*. No more grid charging in regular quarters. Wear (the HBC threshold delta) is counted per discharged kWh; the end charge is valued at the cheapest purchase price. The earlier rule set is kept as `plan_heuristiek`.
- **Entity ids stay plain.** While an older package owns the plain id, ids get a `_2` (never a doubled name); they are restored when the id is free.
- **A real integration, installed with HACS.** The YAML package, the `www` folder and the dashboard resource are gone. Add it under *Settings → Devices & services → Add integration → Batterijplan*. Category in HACS: *Integration*.
- **Config flow.** One form asks for the grid and battery power sensors, solar (optional) and EV charger (optional), the usable capacity, the safety margin, *Prices from HBC* (raw or all-in), the supplier mark-up per kWh excl. VAT and the contract start date.
- **Expert settings** in the options flow (*Configure*): VAT, feed-in add-on, daytime feed-in bonus and the hours of that bonus.
- **New rules** in plain words, each with its own on/off switch: *charge from the grid*, *discharge outside HBC hours*, *hold*, *feed in*. One threshold: the HBC setting *Dynamic threshold delta*. Costs are counted without net metering, with purchase and feed-in each at their own price.
- **Steers HBC's three Dynamic modes** (expensive, regular, cheap) for the coming quarter, only with *Live* on and HBC on *Dynamic*. Your own modes are remembered and put back.
- **Cards and dashboard built in.** The integration serves its own cards (no dashboard resource) and its own dashboard at `/batterijplan`, in the sidebar: buttons *Earnings*, *Settings* (*Basic · Rules · Expert*), *Report* and *Sensors*, a status card, a briefing in two columns with the rules on the right, and a chart with HBC alone and Batterijplan across the full width.
- **Card language option.** Every card accepts `taal: nl|en|de`, which goes before the language of your profile. The plan card now speaks Dutch, English and German.
- **Counter *added value*** (`sensor.batterijplan_meerwaarde`), per quarter, an estimate, only with *Live* on and HBC on Dynamic. A second counter per contract year (`sensor.batterijplan_meerwaarde_periode`).
- **Take over from the package.** If the old package is still there, the setup offers *Take over from the Batterijplan package*: it takes over the settings, the learned usage profile and the counter. See *Upgrading from the package* in the installation chapter.
- **Settings as entities** (`number`, `select`, `date`, `text`, `switch`) with the same ids as the old helpers, so history and your own cards keep working.
- **Documentation** rewritten for the integration, in three languages.

**Improved**
- Learning over 7 days and the forecast per block of 3 hours work as before, now inside the integration.
- The ids of the new entities are put back to the normal names at the first restart after the package is removed.

**Removed**
- The old rules (surplus discharging, charging when needed, the fixed limit of € 0.10), the *Advice for HBC* with `sensor.batterijplan_advies_*`, the setting *efficiency* (the threshold of HBC covers it), the buttons *Make back-up*, *Restore back-up* and *Defaults* (the configuration entry keeps everything).

**Note when updating**
- From the package (1.0.0-rc1/rc2): make a back-up, install the integration, choose *Take over from the Batterijplan package*, then remove the package, `www/batterijplan` and the dashboard resource, remove the old dashboard and restart Home Assistant.
- Recorder with an include list: replace `input_boolean.batterijplan_live` by `switch.batterijplan_live`.

## 1.0.0-rc1 — knoppenrij, vergelijking met HBC alleen, sneller leren (release candidate)

**Nieuw**
- **Knoppenrij met vensters.** Bovenaan één rij over de volle breedte: de schakelaar *Live* vooraan (groen als hij aan staat), daarna *Opbrengst*, *Advies HBC*, *Instellingen* en *Sensoren*. Die openen als venster over het scherm. Een oranje stip betekent: hier is iets te doen. De schakelaar *Instellingen tonen*, het logo bovenaan en de badges zijn weg; de hele pagina past op één scherm.
- **Statuskaart met logo** naast *Plan vandaag en morgen*.
- **Vergelijking met HBC alleen:** de grafiek toont als rode stippellijn hoe de lading was verlopen zonder Batterijplan, met een chip *Extra t.o.v. HBC alleen* in euro.
- **Datumkiezer in de kopregel van de grafiek**, rechts. De grafiek is lager, zodat alles op één scherm past.
- **Prijzen van HBC:** nieuwe instelling *kaal* of *all-in*. Bij all-in telt Batterijplan zelf geen belasting, opslag en btw meer op.
- **Jouw eigen HBC-standen** voor de dure en gewone periode worden onthouden (bij *Live* aan, of als je ze verandert terwijl *Live* uit staat) en teruggezet bij *Live* uit of als HBC Dynamic verlaat.
- **Batterijplan blijft van Sell af:** stuurt alleen bij in de dure periode als jouw stand daar *Self-consumption* is, en in de gewone periode als die *Charge PV* is.
- **Nieuwe sensor** `sensor.batterijplan_prijs`: de prijs van het huidige kwartier volgens HBC, voor de geschiedenis in de grafiek.
- **(i) opent een venster** *Hoe lees je dit?* met **‹ Terug**.
- **Alles in de huisstijl:**
  - eigen invoervelden in *Instellingen*: schuifbalk, keuzeknopjes en − waarde +;
  - **sensoren kiezen uit een lijst**: tik op een sensorveld en je krijgt de vermogenssensoren uit je eigen Home Assistant, de meest waarschijnlijke bovenaan, met wat ze nu melden; typen filtert, zelf typen kan ook;
  - *Instellingen* heeft twee tabbladen: **Basis** en **Expert**;
  - elk veld heeft een eigen (i);
  - de statuskaart is een eigen kaart, met een (i) bij elke regel;
  - een eigen *Live*-schakelaar;
  - de vensters hebben ‹ Terug en ✕.
- **De back-up bewaart nu ook** de ingangsdatum en *Prijzen van HBC* (10 instellingen).
- **Terugzetten en standaardwaarden vragen eerst** "Zeker? Tik nog een keer".

**Verbeterd**
- **Sneller leren:** klaar na 7 dagen in plaats van 14 (een proef op 89 dagen echte meetdata gaf met een kort geheugen een betere voorspelling).
- **Voorspelling per blok van 3 uur**, met alleen een oordeel: *wisselvallig*, *redelijk* (vanaf 55 %), *goed* (vanaf 65 %), *zeer goed* (vanaf 75 %) of *uitstekend* (vanaf 85 %), lichtgroen tot het donkerste groen.
- **Extra marge bij wisselvallig verbruik:** is de voorspelling wisselvallig, dan rekent het plan zelf met extra marge (de gemiddelde afwijking per blok van 3 uur, maximaal 1 kWh). De statuskaart laat zien hoeveel. Wordt de voorspelling beter, dan valt die vanzelf weg.
- **Bedragen overal hetzelfde:** meer dan 0 is *+ €* in groen, precies 0 is *€ 0,00* in grijs, minder dan 0 is *– €* in oranje.
- **Kleur voor overschot ontladen** is nu paars, duidelijk anders dan het groen van ontladen.
- Labels *ct* en *kWh* staan niet meer over de bovenste getallen van de grafiek.

**Opgelost**
- Een klik op een knopje bovenaan ging soms verloren, omdat de knoppenrij steeds opnieuw werd opgebouwd.
- Het plan bleef na een herstart soms hangen op een oud kwartier (het werd als tekst bewaard).
- *t is not a function* bij aanwijzen in de kaarten.
- *Huisverbruik nu* werd 's nachts *Niet beschikbaar* bij omvormers die dan niets melden. Zon zonder waarde telt nu als 0 W.
- De prijs in de grafiek komt niet meer van een vaste Nord Pool-sensor, maar van HBC zelf.
- Het icoon *schuifregelaars* was leeg in de zip van 1.0.0-dev1, en het icoon *info* ontbrak.

**Let op bij bijwerken**
- Vervang het pakket, de map `www/batterijplan/` en het hele dashboard, en verhoog het nummer achter de kaarten-bron. Herstart Home Assistant (nieuwe helpers).
- Recorder met include-lijst: zet `sensor.batterijplan_prijs` erop.
- Geeft HBC all-in prijzen? Zet *Prijzen van HBC* op *all-in*.

## 1.0.0-dev1 — nieuw dashboard, drie talen, overschot en advies voor HBC (testversie)

**Nieuw**
- **Nieuw dashboard** in de huisstijl van HESC, met logo en badges bovenaan en eigen kaarten:
  - *Plan vandaag en morgen*: lading nu, hoe lang ontladen en vasthouden, overschot; per dag een balk met tijdas en "Nu"-streep; alleen de momenten waarop Batterijplan iets anders doet dan HBC.
  - *Prijs en batterij*: kale prijs per kwartier, gekleurde vlakken waar Batterijplan bijstuurt, de lading (gemeten en verwacht, uitdovend na het plan). Volgt de datumkiezer: per dag de kwartieren, per week of maand de opbrengst per dag.
  - *Advies voor HBC*: of je HBC-instelling *Solar reserved for house* goed staat, op basis van de laatste 7 dagen. Alleen advies; HBC wordt niet aangepast.
  - *Wat levert het op*: de tellers, met uitleg achter de (i).
  - Elke kaart heeft een (i) met uitleg; cijfers met een stippellijn hebben een korte toelichting bij de muis.
- **Drie talen:** Nederlands, Engels en Duits voor de kaarten (volgt je profiel), het dashboard (één bestand per taal) en de documentatie (`docs/`).
- **Overschot ontladen:** zit er meer in de batterij dan nodig tot het volgende goedkope moment, dan levert Batterijplan dat in de duurste gewone kwartieren aan het huis (gewone stand tijdelijk *Self-consumption*).
- **Stilstand buiten Dynamic:** staat HBC op een andere strategie, dan stuurt Batterijplan niets, telt het niets op en zet het (met Live aan) de twee Dynamic-standen terug naar normaal. Terug op Dynamic: direct opnieuw rekenen en bijsturen. Het leren gaat altijd door.
- **Nieuwe sensoren:** `sensor.batterijplan_lading` (lading in kWh, voor de geschiedenis) en `sensor.batterijplan_advies_huisverbruik`.
- **Iconen in de kaarten zelf** (iconenset `batterijplan:`), dus ook zonder HESC.

**Verbeterd**
- **Eerlijkere teller:** elk kwartier wordt achteraf afgerekend; bij overschot ontladen telt alleen de lading die echt uit de batterij ging.
- **Verbruik leren** toont nu "dag 3 van 14 · alle uren van de dag al gezien" in plaats van een moeilijk getal.
- **Instellingen** in één rij over de volle breedte; *Live* en *Instellingen* zijn tegels zoals de knoppen.

**Opgelost**
- *can only concatenate str (not "int") to str* bij HBC-versies die de starttijd als tekst geven. Starttijden worden nu altijd goed gelezen (getal of tekst).
- Solcast met Nederlandse sensornamen werd niet gevonden. Batterijplan zoekt de Solcast-sensoren nu zelf, in elke taal.

**Let op bij bijwerken**
- Meld de kaarten aan als dashboard-bron en plak het nieuwe dashboard (zie `docs/04-maintenance.nl.md`).
- Recorder met include-lijst: zet `sensor.batterijplan_lading` en `sensor.batterijplan_advies_huisverbruik` erop.

## 0.1.5 — badges, plan in kleur en nieuwe instellingenkaart

- **Badges bovenaan:** *Bespaard totaal*, *Deze energieperiode* (vanaf de ingangsdatum van je contract, elk contractjaar opnieuw) en *Trefzekerheid*.
- **Trefzekerheid:** hoe goed het geleerde verbruik het echte verbruik voorspelt, in procenten, glijdend over 14 dagen. Grijs tijdens het leren (licht → donker), daarna groen (donker groen boven 90 %).
- **Plan komende uren:** nieuwe kaart met een balk per kwartier, begin- en eindtijd, de periode in blokken en een vaste legenda (ontladen, vasthouden, zon laden, rust, laden van het net). Vervangt de grafiek "Besluiten", waarvan de kleuren niet vast lagen.
- **Grafiek met datumkiezer:** de opbrengst per dag, week, maand of jaar, met ‹ › om te bladeren.
- **Instellingenkaart in de stijl van HESC:** knoppen *Back-up maken*, *Back-up terugzetten* en *Standaardwaarden* (zet marge en rendement terug, met eerst een back-up), schakelaars *Live* en *Instellingen*.
- Nieuwe instelling: **ingangsdatum energiecontract**.
- Versienummer in de kop van het dashboard (komt uit het pakket).
- Iconen in de koppen op dezelfde hoogte als de tekst.

## 0.1.1 — back-up en duidelijkere uitleg

- Knoppen **Back-up maken** en **Back-up terugzetten** voor alle instellingen (capaciteit, marge, rendement, opslag en de vier sensoren). De back-up blijft bewaard bij een herstart en bij een nieuwe versie.
- Schakelaar **Sensoren en uitleg tonen**: verbergt de sensorvelden en de uitleg als alles is ingesteld. Zolang er iets ontbreekt, blijven ze vanzelf zichtbaar.
- Kaart Sensoren met een controle: *Huisverbruik nu*.
- Duidelijkere uitleg: sensoren gaan steeds over het vermogen van dit moment in watt (zonnevermogen = wat alle panelen samen nu opwekken, niet de dagopbrengst); voorbeeld voor energiebelasting + inkoop; tip voor een som-helper bij meerdere omvormers; waar je de iconen vindt (in de release-zip); hoe je bijwerkt naar een nieuwe versie.

## 0.1.0 — eerste versie

- Verdeelt de lading over de duurste dure kwartieren tot het volgende goedkope kwartier (op basis van de HBC Dynamic-labels), met geleerd huisverbruik en de voorzichtige Solcast-zonverwachting.
- Restlading: blijft er lading over, dan mag een later duur kwartier die gebruiken.
- Vasthouden via de HBC-stand voor dure kwartieren (Standby / peak shave), ontladen via Self-consumption. Alleen in live-modus en alleen als HBC op Dynamic staat.
- Schaduwmodus: rekent en toont, stuurt niets.
- Huisverbruik leren per uur van de dag over 14 dagen (aan het leren / grof / prima).
- Lading bepaald uit het laadpercentage en de ondergrens per batterij in HBC.
- Advies over extra nachtladen (alleen getoond), inclusief rendementsverlies.
- Geschatte opbrengst bovenop HBC (teller, schaduw en live apart) en dashboard met eigen iconen.
- Veilig gedrag: "Niet ingesteld" of "Geen batterijdata" → het plan houdt niets vast.
