# 08 · Slimmer rekenen (2.0.0)

*English: [08-calculation.md](08-calculation.md) · Deutsch: [08-calculation.de.md](08-calculation.de.md)*

Versie 2.0.0 brengt zes nieuwe rekenonderdelen. Vier ervan werken vanzelf. Twee zijn regels die je zelf aanzet: **laden in elk goedkoop kwartier** en **verkoopreserve automatisch**. Alles in dit hoofdstuk geldt voor een *dynamisch* contract, tenzij er iets anders staat.

**In het kort**
- **Zon met een marge die meegroeit.** Voor de komende uren rekent het plan met een betere schatting dan voor morgenmiddag.
- **Donkere dagen.** Komen er na de bekende prijzen minstens twee dagen bijna zonder zon, dan houdt het plan lading achter en laadt het zo nodig goedkoop bij.
- **Reserve die meeleert.** De reserve begint ruim en wordt kleiner naarmate verbruik en zon beter voorspeld worden.
- **Verbruik per weekdag.** Batterijplan leert ook per weekdag. Dat profiel wordt alleen gebruikt als het aantoonbaar beter voorspelt.
- **Laden in elk goedkoop kwartier** (regel, standaard uit). Batterijplan herkent goedkope kwartieren zelf en mag daarin laden, ook buiten de goedkope uren van HBC.
- **Verkoopreserve automatisch** (regel, standaard uit). Batterijplan vult *Keep energy in reserve* van HBC, zodat HBC in een Sell-kwartier niet meer verkoopt dan het plan bedoelt.

## Zon met een marge die meegroeit

Solcast geeft per half uur een gewone schatting en een voorzichtige. Tot 2.0.0 rekende het plan overal met de voorzichtige. Nu hangt het af van hoe ver vooruit het kwartier ligt:

| Hoe ver vooruit | Waar het plan mee rekent |
|---|---|
| nu | precies tussen de gewone en de voorzichtige schatting |
| tot 24 uur | glijdend naar de voorzichtige schatting |
| na 24 uur | de voorzichtige schatting, per extra dag 10 % minder (nooit minder dan 70 % ervan) |

In de grafiek is dit de lijn *Zon voorzichtig*.

## Donkere dagen

Het plan kijkt zo ver vooruit als er prijzen bekend zijn, meestal tot morgenavond. Solcast voorspelt ook de dagen daarna (dag 3 tot en met 7). Brengen minstens **twee dagen op rij** direct na de laatste bekende prijs bijna geen zon (minder dan een kwart van je verwachte verbruik), dan gebeurt dit:

- Batterijplan berekent het tekort van die dagen, voor maximaal drie dagen. Het plan houdt tot dat tekort lading vast, nooit meer dan de bruikbare capaciteit.
- Dit is geen harde regel. Een kWh onder die grens is voor het plan zoveel waard als de **gemiddelde** prijs van de bekende kwartieren, want zo duur is stroom die je later toch moet kopen. Het plan laadt dus alleen bij in kwartieren die goedkoper zijn dan dat gemiddelde, en kiest zelf de goedkoopste.
- **In Vlaanderen** blijft het plan onder de piekgrens: het capaciteitstarief zit in dezelfde berekening.
- Zie je alleen de sensoren van vandaag en morgen, omdat je zelf een sensor voor de zon hebt ingevuld? Dan werkt dit onderdeel niet. Het plan rekent dan zoals vroeger.
- **Bij een vast contract met dubbel tarief** laadt HBC 's nachts al tot zijn laaddoel, en dat doel is hoger als er weinig zon komt. Daar verandert niets.

Je ziet het in het attribuut `donker` van `sensor.batterijplan`: `vloer` (kWh), `dagen`, `tekort`, `reden`, `vanaf`.

## Reserve die meeleert

Het plan houdt altijd een reserve in de batterij die het niet inplant. Vroeger was dat alleen je **Veiligheidsmarge** (standaard 0,3 kWh). Nu leert de reserve mee:

- **Zonder gegevens** is de reserve 20 % van de capaciteit.
- **Met betere voorspellingen** daalt hij tot minimaal 3 %. Telt hiervoor alleen de zwakste van de twee voorspellingen: het verbruik (de betrouwbaarheid die je al op het dashboard ziet) en de zon (de voorspelling van 's ochtends tegen de gemeten zon, over de laatste 14 dagen, vanaf 3 dagen).
- **Je eigen Veiligheidsmarge is de ondergrens**, de capaciteit de bovengrens.

Voor de zonmeting is de sensor voor zonne-energie nodig (*Instellingen*, *Sensoren*). Zonder die sensor telt alleen de voorspelling van het verbruik.

Je ziet het in `reserve_plan` (`kwh`, `eigen`, `geleerd`, `betrouwbaar`) en `zon_betrouwbaar` (`pct`, `dagen`, `afwijking_kwh`) van `sensor.batterijplan`.

## Verbruik per weekdag (zelftest)

Het gewone profiel is één gemiddelde per uur van de dag over de laatste 7 dagen. Batterijplan leert nu ook een profiel per **weekdag × uur**, over de laatste 4 weken. Het nieuwe profiel wordt eerst getest:

- **Voorspellen.** Elk kwartier voorspellen beide profielen het verbruik, **voordat** het gemeten verbruik geleerd wordt.
- **Vergelijken.** Daarna wordt de fout van beide genoteerd.
- **Kiezen.** Het weekdagprofiel wordt pas gebruikt als het over de laatste 14 dagen (minimaal 7 dagen aan vergelijkingen) een minstens **10 % kleinere fout** heeft. Anders blijft het gewone profiel.

Het profiel staat in het eigen opslagbestand van Batterijplan, niet in de recorder. Je ziet de uitslag in het attribuut `weekprofiel` van `sensor.batterijplan_verbruiksprofiel`:
- `actief`;
- `fout_week` en `fout_7d`, de gemiddelde fout in W;
- `kwartieren`;
- `reden`.

## Laden in elk goedkoop kwartier (regel)

HBC laadt bij *Dynamic* alleen van het net in de kwartieren die HBC zelf goedkoop noemt, en hoogstens zoveel uren per dag als *Cheapest hours*. Met deze regel aan:

- **Goedkope kwartieren zelf herkennen.** Batterijplan gebruikt dezelfde regel als HBC: het goedkoopste kwartier tegenover het duurste, zolang het verschil minstens de drempel van HBC is. Alleen het **maximum aantal goedkope uren** valt weg.
- **Daarin laden.** Het plan mag in zulke kwartieren van het net laden als dat goedkoper uitkomt.
- **HBC op Charge.** Valt een laadblok buiten de goedkope uren van HBC, dan zet Batterijplan de **strategie van HBC voor dat blok op Charge**, en daarna weer op **Dynamic**. Charge gebruikt dezelfde laadflow en hetzelfde laaddoel als een goedkoop kwartier bij Dynamic.
- **Alleen vanuit Dynamic.** Staat HBC op iets anders dat je zelf koos (Timed, Full stop, Self-consumption …), dan neemt Batterijplan het niet over. Kies je tijdens zo'n blok zelf een andere strategie, dan blijft die staan.
- **Live uit** zet HBC direct terug op Dynamic.

De regel staat standaard **uit**, omdat hij de hoofdstrategie van HBC wisselt. Je vindt hem in *Instellingen*, *Regels*.

## Verkoopreserve automatisch (regel)

HBC heeft bij de strategie *Sell* de instelling *Sell until*. Staat die op *energy reserve*, dan verkoopt HBC op vol vermogen tot de energie in de batterij gelijk is aan *Keep energy in reserve*. Daarna gaat HBC verder met *Then use*, bijvoorbeeld *Self-consumption*. Batterijplan zegt per kwartier alleen dát HBC verkoopt, niet hoeveel. Met deze regel aan:

- **Reserve uit het plan.** Elk kwartier rekent Batterijplan uit hoeveel energie je huis nog uit de batterij nodig heeft tot het volgende goedkope kwartier. Zonoverschot onderweg telt mee. Daar komt de reserve van het plan bij. Het getal wordt naar boven afgerond op de stap van de HBC-instelling en blijft binnen het minimum, het maximum en de bruikbare capaciteit.
- **In HBC zetten.** Met Live aan zet Batterijplan dat getal in *Keep energy in reserve*. Dat gebeurt alleen bij minstens 0,5 kWh verschil (of één stap van de instelling, als die groter is) en hooguit één keer per kwartier.
- **Het plan rekent mee.** In de plangrafiek stopt een Sell-kwartier bij die reserve. Daarna doet het wat *Then use* doet: bij *Self-consumption* of *Zero import* gebruikt het huis de batterij, anders blijft de lading staan. Dit geldt ook met Live uit, zodat je in schaduwmodus ziet wat er zou gebeuren.
- **Je eigen waarde komt terug.** De eerste keer onthoudt Batterijplan jouw waarde. De regel is alleen actief met Live aan, HBC op *Dynamic*, *Sell until* op *energy reserve* en een dynamisch contract. Valt één daarvan weg, of verwijder je de integratie, dan zet Batterijplan jouw waarde direct terug en staat de rij op *niet actief* met de reden. Een *Charge* die Batterijplan zelf voor een laadblok zet, telt als *Dynamic*: daaromheen blijft de regel actief. Pas je de waarde zelf aan terwijl de regel werkt, dan wordt dat je nieuwe eigen waarde.
- **Alleen met *Sell until: energy reserve*.** Staat *Sell until* op iets anders, dan doet de regel niets en zegt de statuskaart waarom. Batterijplan verandert *Sell until* en *Then use* nooit.

### Voorbeeld

Om 17:00 begint de dure avondpiek en zit er 9 kWh in de batterij. Je huis heeft tot 02:00, het volgende goedkope moment, nog 5 kWh nodig. In HBC staat *Keep energy in reserve* vast op 3 kWh.
- **Zonder deze regel** verkoopt HBC tot de vaste 3 kWh: er gaat 6 kWh weg. Om 21:00 is de batterij leeg en koop je 2 kWh in tegen de avondprijs.
- **Met deze regel** zet Batterijplan de reserve op 5 kWh. HBC verkoopt 4 kWh en je huis redt het tot 02:00.

Het voordeel: je verkoopt alleen wat je echt over hebt, en je koopt later geen dure stroom terug. De marge van Batterijplan (de reserve die meeleert, met je eigen *Veiligheidsmarge* als minimum) komt er altijd bij, dus de reserve gaat nooit onder die marge.

De gekozen reserve staat op de statuskaart (rij *Verkoopreserve*) en bij de regels in de briefing. Voor eigen kaarten staat op `sensor.batterijplan` het attribuut `verkoopreserve` met:
- `aan` en `actief`, en `reden` als hij niet werkt;
- `kwh`: wat Batterijplan in HBC zet;
- `in_hbc`: wat er nu in HBC staat;
- `eigen`: jouw bewaarde waarde;
- `plan_kwh`: het huisverbruik tot het volgende goedkope kwartier, zonder de reserve.

De regel staat standaard **uit**. Je vindt hem in *Instellingen*, *Regels*.

## Namen voor eigen kaarten en HBC+

Op `sensor.batterijplan_zon_voor_hbc` staan sinds 2.0.0 de attributen `laaddoel_kwh` (het laaddoel voor HBC) en `zon_voor_huis` (HBC's *solar reserved for house*). De attributen `doel` en `reserve` zijn **oud, worden vervangen door laaddoel_kwh en zon_voor_huis**. Ze hebben dezelfde waarden en blijven voorlopig staan, zodat bestaande kaarten niet breken. De vier attributen staan er altijd, ook met Live uit. Stuurt Batterijplan het laaddoel niet (bijvoorbeeld met Live uit), dan zijn `laaddoel_kwh` en `doel` leeg (`null`). `zon_voor_huis` en `reserve` zijn alleen leeg als HBC's waarde onbekend is.
