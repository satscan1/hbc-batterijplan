# 05 · Problemen oplossen

*English: [05-troubleshooting.md](05-troubleshooting.md) · Deutsch: [05-troubleshooting.de.md](05-troubleshooting.de.md)*

**In het kort**
- Vlak na een herstart zijn sommige kaarten even leeg. Dat herstelt zich binnen een kwartier.
- Kijk eerst naar de statuskaart: modus, leren, HBC-strategie en komend kwartier vertellen meestal al wat er speelt.
- Melding? Maak een schermafdruk en vermeld je HBC-versie in een [Issue](https://github.com/satscan1/hbc-batterijplan/issues).

## Meldingen in het plan

| Wat je ziet | Wat het betekent | Wat doe je |
|---|---|---|
| **Niet ingesteld** | De bruikbare capaciteit is niet ingevuld. | Vul hem in (Instellingen). |
| **Geen batterijdata** | Batterijplan kan de lading van een of meer batterijen niet lezen. Het houdt dan niets vast. | Controleer in HBC het aantal batterijen en of hun laadpercentage beschikbaar is. |
| **Geen prijsdata** | HBC heeft (nog) geen prijzen met labels. | Controleer dat HBC op Dynamic staat en de prijzen binnenkomen (`sensor.hbc_energy_prices_data`). |
| **Batterijplan staat stil: HBC staat op …** | HBC staat niet op Dynamic. | Normaal als je bewust een andere strategie kiest. Zet HBC terug op Dynamic om Batterijplan mee te laten doen. |
| **Niets bij te sturen tot …** | Er is tot het volgende goedkope moment niets te verbeteren. HBC doet het gewoon. | Niets, dit is normaal. |

## Dashboard en kaarten

| Probleem | Controleer |
|---|---|
| Een kaart meldt *Custom element doesn't exist: batterijplan-…* | De kaarten zijn niet als bron aangemeld, of de browser heeft de oude versie nog. Zie [01 · Installatie, stap 5](01-installation.nl.md#stap-5--kaarten-en-dashboard). Ververs daarna de browser (telefoon: app sluiten en openen). |
| Een foutmelding *can only concatenate str (not "int") to str* | Dat was een fout in versie 0.1.5 bij sommige HBC-versies. Opgelost in 1.0.0-dev1: werk bij. |
| De iconen in de kaarten ontbreken | Ververs de browser. De iconen zitten in het kaartenbestand zelf. |
| De kaarten zijn in de verkeerde taal | De kaarten volgen de taal van je **profiel** in Home Assistant (linksonder je naam → Taal). |
| De grafiek toont geen doorgetrokken lijn (gemeten lading) | Je recorder bewaart `sensor.batterijplan_lading` niet. Zet hem op je include-lijst en herstart. Tot die tijd leest de grafiek de lading uit de geschiedenis van het plan, vanaf het moment dat versie 1.0.0-dev1 draait. |
| Week of maand is leeg, of het totaal klopt niet met de badge | De dagtelling van Home Assistant begint pas een dag na de start van de teller. Dat trekt vanzelf recht. |
| *Advies voor HBC* blijft "Nog aan het meten" | Normaal in de eerste twee weken: het verbruik moet geleerd zijn en er moet een week gemeten zijn. |

## Zon en verbruik

| Probleem | Controleer |
|---|---|
| Batterijplan rekent met 0 zon | Is de integratie *Solcast PV Forecast* geïnstalleerd? Batterijplan zoekt de Solcast-sensoren zelf, in elke taal. |
| *Controle: huisverbruik nu* klopt niet | Controleer de tekens: netvermogen afname = +, batterijvermogen ontladen = +. En zonnevermogen is het vermogen van nu in W, niet de dagopbrengst. |
| De trefzekerheid blijft laag | Een huishouden met veel wisselend verbruik is moeilijker te voorspellen. Batterijplan houdt de veiligheidsmarge aan; verhoog die als de batterij te vaak te vroeg leeg raakt. |

## Sturen

| Probleem | Controleer |
|---|---|
| Live staat aan, maar de batterij doet niet wat het plan zegt | Staat HBC op **Full control** en **Dynamic**? Kijk in het logboek bij "Batterijplan": daar staat elke wijziging. HBC leest zijn standen per kwartier, dus een wijziging werkt pas vanaf het volgende kwartier. |
| Bij "overschot ontladen" zakt de lading nauwelijks | De zon dekt het huis al. Dan is er niets te ontladen; de teller rekent in dat geval ook niets. |
| Na Live uit staat HBC anders dan voorheen | Batterijplan zet de dure stand op *Self-consumption* en de gewone stand op *Charge PV*. Had je andere standen, zet die dan zelf terug. |
