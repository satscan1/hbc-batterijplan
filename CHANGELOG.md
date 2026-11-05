# Changelog

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
