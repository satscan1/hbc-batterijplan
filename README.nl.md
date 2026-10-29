<p align="center"><img src="https://raw.githubusercontent.com/satscan1/hbc-batterijplan/main/www/batterijplan/logo.png" width="160" alt="HBC-Batterijplan"></p>

<p align="center"><a href="https://github.com/satscan1/hbc-batterijplan/releases"><img src="https://img.shields.io/github/v/release/satscan1/hbc-batterijplan?include_prereleases" alt="Release"></a> <a href="https://github.com/satscan1/hbc-batterijplan"><img src="https://img.shields.io/github/stars/satscan1/hbc-batterijplan?style=flat&logo=github" alt="Stars"></a> <a href="https://ko-fi.com/satscan"><img src="https://img.shields.io/badge/Ko--fi-satscan-FF5E5B?logo=kofi&logoColor=white" alt="Support me on Ko-fi"></a></p>

# Batterijplan — slimme laag bovenop Home Battery Control (HBC)

*English: [README.md](https://github.com/satscan1/hbc-batterijplan/blob/main/README.md) · Deutsch: [README.de.md](https://github.com/satscan1/hbc-batterijplan/blob/main/README.de.md)*

*Versie 1.0.0-rc1 · release candidate*

Batterijplan zorgt dat je thuisbatterij zijn lading bewaart voor de **duurste** momenten van de dag. Het werkt samen met [Home Battery Control (HBC)](https://github.com/gitcodebob/marstek-venus-rs485-node-red) en neemt HBC niet over: HBC blijft de batterij aansturen, Batterijplan geeft alleen per kwartier een aanwijzing.

> Batterijplan is een losse, onofficiële aanvulling op HBC. Het wordt niet door de makers van HBC gemaakt of onderhouden. Vragen over Batterijplan stel je hier, niet bij HBC.

<p align="center"><img src="https://raw.githubusercontent.com/satscan1/hbc-batterijplan/main/docs/images/dashboard.png" width="95%" alt="Batterijplan dashboard"></p>

## Wat Batterijplan doet

- **Bewaart lading voor de duurste kwartieren.** HBC (strategie Dynamic) ontlaadt in elk duur kwartier op volgorde, ook als er een uur later een nog duurder moment komt. Batterijplan rekent vooruit tot het volgende goedkope moment en geeft de lading eerst aan de duurste kwartieren. In de andere dure kwartieren houdt de batterij zijn lading vast.
- **Gebruikt overschot slim.** Zit er meer in de batterij dan nodig is tot het volgende goedkope moment? Dan levert Batterijplan dat overschot al aan het huis in de duurste gewone kwartieren, in plaats van met een volle batterij te gaan laden.
- **Leert je verbruik.** Per uur van de dag, in 7 dagen, en daarna glijdend mee met de seizoenen. Met de zonverwachting van Solcast erbij.
- **Geeft advies voor HBC.** Hoeveel zonne-energie je huis zelf gebruikt (de HBC-instelling *Solar reserved for house*), op basis van de laatste 7 dagen. Batterijplan verandert die instelling zelf nooit.
- **Laat zien wat het oplevert.** Een eerlijke schatting bovenop HBC alleen: bij overschot ontladen telt alleen wat er echt uit de batterij ging.
- **Begint veilig.** Eerst in schaduwmodus (rekent mee, stuurt niets). Pas als jij *Live* aanzet, stuurt het HBC bij.

## Nieuw in 1.0.0-rc1

- **Rustiger dashboard:** alles op één scherm. Bovenaan een knoppenrij met *Live* vooraan; instellingen, sensoren, advies en opbrengst openen als venster. Een oranje stip laat zien waar iets te doen is.
- **Helemaal in de huisstijl:** eigen invoervelden (schuifbalk, keuzeknopjes, − waarde +), sensoren kiezen uit een lijst met de juiste kandidaten, instellingen in de tabbladen Basis en Expert, en een (i) met uitleg bij elke regel.
- **Vergelijking met HBC alleen** in de grafiek: een rode stippellijn en het verschil in euro per dag.
- **Sneller leren:** klaar na 7 dagen. De voorspelling wordt per blok van 3 uur beoordeeld en je ziet alleen een oordeel (redelijk, goed, zeer goed, uitstekend). Bij wisselvallig verbruik rekent het plan zelf met extra marge.
- **Kale of all-in prijzen:** nieuwe instelling *Prijzen van HBC*.
- **Jouw eigen HBC-standen** worden onthouden en teruggezet. Gebruik je *Sell*, dan blijft Batterijplan van die periode af.
- **Opgelost:** het plan bleef na een herstart soms hangen, een fout bij aanwijzen in de kaarten, en *huisverbruik* viel 's nachts weg bij omvormers die niets melden.

Alles op een rij: [CHANGELOG.md](CHANGELOG.md).

## Documentatie

| | |
|---|---|
| [01 · Installatie](docs/01-installation.nl.md) | Wat je nodig hebt, bestanden plaatsen, dashboard, instellingen |
| [02 · Het dashboard](docs/02-dashboard.nl.md) | Wat elke kaart laat zien |
| [03 · Hoe het werkt](docs/03-how-it-works.nl.md) | Het plan, overschot, leren, het advies en de teller in gewone taal |
| [04 · Onderhoud en bijwerken](docs/04-maintenance.nl.md) | Wat je af en toe doet, nieuwe versie, verwijderen |
| [05 · Problemen oplossen](docs/05-troubleshooting.nl.md) | Bekende meldingen en wat je eraan doet |

## Release candidate

Dit is een **release candidate** (rc): de laatste testversie voor 1.0.0. Ze draait dagelijks bij de maker en bij een paar testers. Zet hem eerst in schaduwmodus, kijk een paar dagen mee en meld wat je opvalt via [Issues](https://github.com/satscan1/hbc-batterijplan/issues) of op Discord. Vermeld je HBC-versie en, bij een foutmelding, een schermafdruk.

## Licentie

- **Code** (pakket, kaarten en dashboard): GPL-3.0-or-later.
- **Iconen en logo** (`www/batterijplan/`): eigen huisstijl van SatScan, zie [LICENSE-ICONEN.md](www/batterijplan/LICENSE-ICONEN.md).

Batterijplan is een losse aanvulling op [Home Battery Control](https://github.com/gitcodebob/marstek-venus-rs485-node-red) en wordt niet door de makers van HBC onderhouden.
