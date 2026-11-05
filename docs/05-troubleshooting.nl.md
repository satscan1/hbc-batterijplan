# 05 · Problemen oplossen

*English: [05-troubleshooting.md](05-troubleshooting.md) · Deutsch: [05-troubleshooting.de.md](05-troubleshooting.de.md)*

**In het kort**
- Direct na een herstart zijn sommige kaarten even leeg. Dat herstelt zich binnen een kwartier.
- Kijk eerst naar de statuskaart: modus, leren, HBC-strategie en komend kwartier vertellen meestal al wat er aan de hand is.
- Een probleem dat je niet opgelost krijgt? Maak een schermafbeelding en noem je HBC-versie in een [Issue](https://github.com/satscan1/hbc-batterijplan/issues).

## Het plan is leeg of de sensoren zijn onbekend

De sensor `sensor.batterijplan` is *onbekend* zolang er geen plan is. Een plan heeft dit allemaal nodig:

| Controle | Wat te doen |
|---|---|
| De bruikbare capaciteit is ingevuld. | Vul hem in (*Instellingen → Basis*, of *Configureren* bij de integratie). Bij 0 is er geen plan. |
| HBC heeft prijzen met labels. | Controleer of HBC op Dynamic staat en of de prijzen binnenkomen (`sensor.hbc_energy_prices_data`). |
| Batterijplan kan de lading van **alle** batterijen lezen. | Controleer in HBC het aantal batterijen (`input_number.house_battery_count`) en of het laadpercentage van elke batterij beschikbaar is. Eén batterij zonder waarde is genoeg voor een leeg plan. |
| De sensoren zijn gekozen en melden een waarde. | Open de knop *Sensoren*. Een sensor die *niet beschikbaar* of *onbekend* is, geeft geen huisverbruik en niets om van te leren. |

De sensoren voor huisverbruik, het profiel en de voorspelling zijn de eerste minuten en de eerste dagen *onbekend* of tonen *nog aan het meten*. Dat is normaal.

Blijft het plan leeg? Kijk dan in *Instellingen → Systeem → Logboeken* naar "batterijplan".

## Entiteit-id's met `_2` erachter

Zie je `sensor.batterijplan_2`, `switch.batterijplan_live_2` enzovoort? Dat gebeurt als het oude pakket (`packages/batterijplan.yaml`) nog naast de integratie staat: de id's met de gewone namen zijn dan nog bezet.

1. Haal het pakket, de oude kaarten en het oude dashboard weg. Zie [01 · Installatie](01-installation.nl.md#overstappen-van-het-pakket-100-rc1rc2).
2. Herstart Home Assistant. Bij de start zet Batterijplan de id's terug naar de gewone namen, waar die vrij zijn.

Verwijder de `_2`-entiteiten niet met de hand voordat dat gebeurd is.

## Dashboard en kaarten

| Probleem | Controleer |
|---|---|
| Er staat geen **Batterijplan** in de zijbalk | Ververs de browser (telefoon: app sluiten en opnieuw openen). Is de integratie ingesteld (*Instellingen → Apparaten & diensten*)? |
| Een reparatiemelding zegt dat het **dashboardadres bezet is** | Je hebt een eigen dashboard op `/batterijplan`. Batterijplan laat het met rust en voegt zijn eigen dashboard niet toe. Hernoem of verwijder het jouwe en herstart Home Assistant. |
| Een kaart zegt *Custom element doesn't exist: batterijplan-…* | Staat de oude bron `/local/batterijplan/batterijplan-cards.js` er nog? Verwijder hem (*Instellingen → Dashboards → ⋮ → Bronnen*) en ververs de browser: de integratie laadt de kaarten zelf. Twee kopieën werken elkaar tegen. |
| *Live*, de regels en de velden in *Instellingen* tonen *Niet beschikbaar* | De integratie is niet gestart. Kijk in *Instellingen → Systeem → Logboeken* naar "batterijplan" en herstart Home Assistant. |
| De kaarten staan in de verkeerde taal | De kaarten volgen de taal van je **profiel** in Home Assistant (je naam linksonder → Taal). In je eigen dashboard kun je op een kaart `taal: nl`, `en` of `de` zetten. |
| De grafiek toont geen doorgetrokken lijn (gemeten lading) | Je recorder bewaart `sensor.batterijplan_lading` niet. Zet hem op je include-lijst en herstart. Zie [01 · Installatie](01-installation.nl.md#recorder-alleen-als-je-een-include-lijst-gebruikt). |
| De bedragen in het plan zijn veel te hoog | Geeft HBC all-in prijzen? Zet *Prijzen van HBC* op *all-in*, anders telt Batterijplan de opslag en btw dubbel op. |

## Zon en verbruik

| Probleem | Controleer |
|---|---|
| Batterijplan rekent met 0 zon | Is de integratie *Solcast PV Forecast* geïnstalleerd? Batterijplan vindt de Solcast-sensoren zelf, in elke taal. |
| *Huisverbruik nu* is *Niet beschikbaar* | Controleer de netsensor en de batterijsensor. Zon zonder waarde telt als 0 W. |
| *Controle: huisverbruik nu* klopt niet | Controleer de tekens: netvermogen afname = +, batterijvermogen ontladen = +. En zonnevermogen is het vermogen op dit moment in W, niet de dagopbrengst. |
| De voorspelling blijft *wisselvallig* | Een huishouden met veel wisselend verbruik is moeilijker te voorspellen. Loopt de batterij te vaak te vroeg leeg, verhoog dan je veiligheidsmarge. |

## Sturen

| Probleem | Controleer |
|---|---|
| **HBC staat niet op Dynamic** | Batterijplan stuurt dan niets en de teller telt niets op. De statuskaart toont de strategie van HBC. Zet HBC terug op **Dynamic**: het plan rekent direct opnieuw en stuurt weer bij. Stond *Live* aan? Dan worden je eigen standen teruggezet zodra HBC Dynamic verlaat. |
| Live staat aan, maar de batterij doet niet wat het plan zegt | Staat HBC op **Full control** en **Dynamic**? Kijk in het logboek onder "Batterijplan": elke wijziging staat er. HBC leest zijn standen per kwartier, dus een wijziging werkt pas vanaf het volgende kwartier. |
| Er wordt niets gestuurd | Misschien staat een regel uit (*Instellingen → Regels*), of het plan heeft de komende kwartieren niets beters dan HBC. Dat is normaal. |
| Na Live uit staat HBC anders dan eerst | Batterijplan zet de standen terug die hij onthield toen je *Live* aanzette. Heb je ze daarna zelf veranderd terwijl *Live* aan stond, zet ze dan zelf terug. |
| De teller beweegt niet | Hij telt alleen met *Live* aan **en** HBC op Dynamic. Anders telt het als *schaduw*. |
