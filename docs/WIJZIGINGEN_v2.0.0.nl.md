# Batterijplan 2.0.0 — alle wijzigingen sinds 1.1.0

*English: [CHANGES_v2.0.0.md](CHANGES_v2.0.0.md) · Deutsch: [AENDERUNGEN_v2.0.0.de.md](AENDERUNGEN_v2.0.0.de.md)*

Dit is de volledige lijst van wat er verandert tussen de laatste release 1.1.0 en 2.0.0. Hij omvat ook alles uit de testversie 2.0.0-dev1. Batterijplan blijft een losse aanvulling op Home Battery Control (HBC).

## Nieuw

**Soort contract**
- Je kiest zelf je contract:
  - *Vast, enkeltarief*: één prijs de hele dag.
  - *Vast, dubbeltarief*: een normaal- en een daltarief (in België een dag- en nachtprijs).
  - *Dynamisch*: een prijs per uur of kwartier. Dit werkt zoals in 1.1.0.
- Bij een vast contract vul je ook je **terugleververgoeding** in. HBC heeft daar zelf geen instelling voor. De opbrengst van de batterij wordt dan met jouw prijzen berekend.
- Bij een vast contract maakt Batterijplan geen plan op prijs. HBC staat dan op *Self-consumption*: de batterij dekt je verbruik en laadt met zonneoverschot.
- **Nachtladen bij een dubbeltarief gebeurt alleen als het loont.** Het verschil tussen het normaal- en het daltarief moet minstens de drempel van HBC zijn. Anders laadt de batterij 's nachts niet van het net.
- Daluren per land: 's nachts 23:00–07:00 in Nederland en 22:00–07:00 in België. Met een schakelaar tellen weekend en feestdagen de hele dag als daluren. In Nederland staat die schakelaar standaard aan.
- Prijzen vul je in met vijf decimalen, zoals leveranciers ze opgeven.

**Vlaanderen (capaciteitstarief)**
- Een eigen schakelaar *Vlaanderen*, standaard uit.
- Het werkt bij **elk contract**, dus ook bij een vast tarief, en in elk land.
- Batterijplan meet de **piek per kwartier**: het gemiddelde vermogen dat je in elk kwartier van het net haalt.
- De **doelgrens volgt je maandpiek**. Het is de hoogste van drie waarden: de maandpiek tot nu toe, 2,5 kW en je eigen grens. Met Live aan stelt Batterijplan elk kwartier de importgrens van HBC daarop in. Je eigen HBC-waarden komen terug zodra je Live of Vlaanderen uitzet.
- Nieuwe kaarten:
  - *Lopend kwartier*.
  - *Piek deze maand*, met de **maandpiek met en zonder batterij** over 12 maanden en de **besparing op het capaciteitstarief** per maand en per jaar.
- Het plan blijft onder de piekgrens. Bij een dubbeltarief mag de batterij in de daluren bijladen als reserve voor pieken, maar alleen onder de doelgrens.
- Alle vermogens staan in kW.

**Slimmer rekenen**
- **Goedkope kwartieren zelf herkennen.** Dit is een nieuwe regel *Laden in elk goedkoop kwartier*. Hij staat standaard uit en werkt alleen bij een dynamisch contract.
  - Batterijplan herkent goedkope kwartieren met dezelfde regel als HBC, maar zonder het maximum aantal goedkope uren per dag.
  - Valt een laadblok buiten de goedkope uren van HBC, dan zet Batterijplan HBC voor dat blok op *Charge* en daarna weer op *Dynamic*.
  - Dat gebeurt alleen als HBC al op *Dynamic* stond.
- **Verkoopreserve automatisch.** Dit is een nieuwe regel, standaard uit, alleen bij een dynamisch contract. Hij is gemaakt op verzoek van een gebruiker.
  - Batterijplan vult *Keep energy in reserve* van HBC (bij de Sell-strategie) met wat je huis nodig heeft tot het volgende goedkope kwartier, plus de reserve van het plan.
  - Zo verkoopt HBC in een Sell-kwartier niet meer dan het plan bedoelt. De plangrafiek rekent ook met die reserve.
  - Dit werkt alleen als *Sell until* in HBC op *energy reserve* staat. Batterijplan schrijft alleen bij minstens 0,5 kWh verschil en hooguit één keer per kwartier.
  - Hij is alleen actief met Live aan en HBC op *Dynamic* (een *Charge* die Batterijplan zelf zet, telt mee). Valt een voorwaarde weg, of verwijder je de integratie, dan krijgt HBC direct jouw eigen waarde terug.
- **Zonvoorspelling met een groeiende veiligheidsmarge.**
  - Voor de komende uren rekent het plan halverwege de gewone en de voorzichtige verwachting.
  - Na 24 uur rekent het met de voorzichtige verwachting.
  - Daarna rekent het per dag 10 % lager, met een grens van 30 % minder.
- **Donkere dagen.** Na de bekende prijzen kunnen er minstens twee dagen bijna zonder zon komen. Dan **houdt het plan lading vast**, tot het verwachte tekort van die dagen.
  - Het **laadt bij** in kwartieren die goedkoper zijn dan gemiddeld, en kiest daarbij zelf de goedkoopste.
  - In Vlaanderen blijft het daarbij onder de piekgrens.
- **Reserve die meeleert.**
  - De reserve begint op **20 %** van de capaciteit.
  - Naarmate verbruik en zon betrouwbaar voorspeld worden, daalt hij naar **3 %**.
  - Je eigen veiligheidsmarge blijft de ondergrens.
  - Batterijplan vergelijkt elke dag de zonvoorspelling van 's ochtends met de gemeten zon. Zonder zonnesensor telt alleen het verbruik.
- **Verbruik per weekdag als zelftest.** Naast het gewone profiel leert Batterijplan een profiel per weekdag en uur.
  - Elk kwartier voorspellen beide profielen vooraf, daarna wordt gemeten welke beter was.
  - Het weekdagprofiel wordt alleen gebruikt als het over 14 dagen minstens 10 % beter voorspelt.
  - Het wordt opgeslagen in het eigen bestand van Batterijplan, niet in de database van Home Assistant.

**Schermen**
- Het hoofdscherm bij een vast contract toont:
  - een korte uitleg met je contract, de prijs nu, de daluren en of nachtladen loont;
  - een grafiek met de gemeten en verwachte lading voor 30 uur, de zon en de daluren;
  - een gekleurde balk per kwartier en een korte tijdlijn *Wat de batterij doet*.
- **Het Rapport en het venster Vandaag werken voor alle contractvormen.** Met Vlaanderen aan hebben ze een eigen stuk over het capaciteitstarief.
- *Instellingen* heeft nieuwe tabbladen *Contract* en *Vlaanderen*. Rijen die bij jouw keuze niet gelden staan grijs, met een korte reden.

**Nieuwe namen voor eigen kaarten en uitbreidingen**
- De sensor *Zonvoorspelling voor HBC (laaddoel)* heeft twee nieuwe eigenschappen:
  - `laaddoel_kwh`: het laaddoel.
  - `zon_voor_huis`: de zon die HBC voor het huis reserveert.
- De oude namen `doel` en `reserve` blijven voorlopig staan met dezelfde waarden, zodat bestaande kaarten blijven werken. Ze worden later vervangen.

## Verbeterd

- **Het land komt uit Home Assistant** (Nederland, België of Duitsland; elk ander land telt als Nederland). Het land bepaalt de daluren, de feestdagen en de woorden die je ziet. Voor de Duitse regels moet het land in Home Assistant op Duitsland staan.
- **Het zonadvies is in hele kWh.** Het advies *Solar reserved for house* wordt afgerond op hele kWh, omdat HBC alleen hele kWh aanneemt. De oranje stip en het automatisch aanpassen van HBC reageren pas bij 1 kWh verschil.
- Een wijziging van je contract, van de schakelaar Vlaanderen of van je eigen grens wordt direct doorgevoerd in HBC.
- Bedragen op het dashboard staan in twee decimalen.
- De tijdlijn noemt de dag ten opzichte van nu: *vandaag*, *morgen*, daarna de naam van de weekdag.
- De lijn *Zon voorzichtig* in de plangrafiek toont de waarde met de groeiende veiligheidsmarge.
- Het advies voor de HBC-instellingen rekent terug zonder de donkere dagen van vandaag mee te nemen.

## Opgelost

- **Geen heen-en-weer wisselen meer bij een herberekening.** Een nieuwe berekening midden in een kwartier laat HBC niet meer heen en weer gaan tussen *Charge* en *Dynamic*. Er is hooguit één wissel per kwartier. Zet je Live of de regel uit, dan gaat HBC direct terug.
- De afwijking van de batterijlading toonde soms "+610 %". Dat gebeurt niet meer als de verwachte lading onbekend of nul is.
- Bij een vast contract stond de modus op *schaduw* terwijl Live aanstond.
- Na een herstart midden in een kwartier telde het niet-gemeten deel als nul. Daardoor kon de importgrens van HBC op 25 kW komen. Dat deel telt nu op de doelgrens.
- Na een herstart was de grafiek van de batterijlading leeg. Hij wordt nu aangevuld uit de geschiedenis van Home Assistant.
- Het aantal voorkomen pieken telde ook grensverlagingen mee die niet echt naar HBC waren geschreven.
- Een contractwijziging via het dashboard werd niet altijd meteen toegepast op de strategie en de grens van HBC.
- Prijzen werden afgerond op vier decimalen opgeslagen.
- In sommige uitleg-vensters (*Hoe lees je dit?*) stonden losse sterretjes rond woorden. Die worden nu schuin gedrukt.

## Verwijderd

- De landkeuze in de instellingen. Het land komt nu uit Home Assistant.
- De proefmodus van de eerste testversies. *Vlaanderen aan* doet in elk land hetzelfde.

**Wat er eenmalig gebeurt bij het bijwerken**
- Stond je land op België, dan gaat de schakelaar *Vlaanderen* aan.
- Een contract *dag/nacht* uit een testversie wordt *Vast* met *Dubbeltarief*.
- De landkeuze en de proefmodus verdwijnen, samen met hun entiteiten.
- Het geleerde verbruik, de teller en al je andere instellingen blijven.
- Het weekdagprofiel en de vergelijking van de zonvoorspelling beginnen bij nul.

## Documentatie

- Nieuw hoofdstuk *07 · Contracten, daluren en Vlaanderen*, met de stukken *Welk contract kies ik?* en *Wat stel je in HBC in?*.
- Nieuw hoofdstuk *08 · Slimmer rekenen*: zonmarge, donkere dagen, de reserve die meeleert, het verbruik per weekdag, laden in elk goedkoop kwartier, de verkoopreserve, en de oude en nieuwe namen.
- De installatiehandleiding beschrijft het bijwerken naar 2.0.0 als gewone release.
- De handleiding van het dashboard heeft een stuk *Nieuw in 2.0.0*.
- De README verwijst naar de nieuwe hoofdstukken en naar deze lijst.
- Alle teksten zijn er in het Nederlands, Engels en Duits.
- Er zijn nieuwe automatische tests voor alle nieuwe rekenonderdelen en kaarten.
