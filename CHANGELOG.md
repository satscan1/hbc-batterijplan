# Changelog

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
