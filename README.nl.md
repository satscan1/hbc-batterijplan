<p align="center"><img src="https://raw.githubusercontent.com/satscan1/hbc-batterijplan/main/www/batterijplan/logo.png" width="160" alt="HBC-Batterijplan"></p>

<p align="center"><a href="https://github.com/satscan1/hbc-batterijplan/releases"><img src="https://img.shields.io/github/v/release/satscan1/hbc-batterijplan?include_prereleases" alt="Release"></a> <a href="https://github.com/satscan1/hbc-batterijplan"><img src="https://img.shields.io/github/stars/satscan1/hbc-batterijplan?style=flat&logo=github" alt="Stars"></a> <a href="https://ko-fi.com/satscan"><img src="https://img.shields.io/badge/Ko--fi-satscan-FF5E5B?logo=kofi&logoColor=white" alt="Support me on Ko-fi"></a></p>

# Batterijplan — slimme laag bovenop Home Battery Control (HBC)

*English: [README.md](https://github.com/satscan1/hbc-batterijplan/blob/main/README.md) · Deutsch: [README.de.md](https://github.com/satscan1/hbc-batterijplan/blob/main/README.de.md)*

*Versie 1.0.0-dev1 · testversie*

Batterijplan zorgt dat je thuisbatterij zijn lading bewaart voor de **duurste** momenten van de dag. Het werkt samen met [Home Battery Control (HBC)](https://github.com/gitcodebob/marstek-venus-rs485-node-red) en neemt HBC niet over: HBC blijft de batterij aansturen, Batterijplan geeft alleen per kwartier een aanwijzing.

> Batterijplan is een losse, onofficiële aanvulling op HBC. Het wordt niet door de makers van HBC gemaakt of onderhouden. Vragen over Batterijplan stel je hier, niet bij HBC.

<p align="center"><img src="https://raw.githubusercontent.com/satscan1/hbc-batterijplan/main/docs/images/dashboard.png" width="95%" alt="Batterijplan dashboard"></p>

## Wat Batterijplan doet

- **Bewaart lading voor de duurste kwartieren.** HBC (strategie Dynamic) ontlaadt in elk duur kwartier op volgorde, ook als er een uur later een nog duurder moment komt. Batterijplan rekent vooruit tot het volgende goedkope moment en geeft de lading eerst aan de duurste kwartieren. In de andere dure kwartieren houdt de batterij zijn lading vast.
- **Gebruikt overschot slim.** Zit er meer in de batterij dan nodig is tot het volgende goedkope moment? Dan levert Batterijplan dat overschot al aan het huis in de duurste gewone kwartieren, in plaats van met een volle batterij te gaan laden.
- **Leert je verbruik.** Per uur van de dag, over 14 dagen, en daarna glijdend mee met de seizoenen. Met de zonverwachting van Solcast erbij.
- **Geeft advies voor HBC.** Hoeveel zonne-energie je huis zelf gebruikt (de HBC-instelling *Solar reserved for house*), op basis van de laatste 7 dagen. Batterijplan verandert die instelling zelf nooit.
- **Laat zien wat het oplevert.** Een eerlijke schatting bovenop HBC alleen: bij overschot ontladen telt alleen wat er echt uit de batterij ging.
- **Begint veilig.** Eerst in schaduwmodus (rekent mee, stuurt niets). Pas als jij *Live* aanzet, stuurt het HBC bij.

## Nieuw in 1.0.0-dev1

- **Nieuw dashboard** in de huisstijl van HESC, met eigen kaarten: *Plan vandaag en morgen*, *Prijs en batterij* (met datumkiezer: dag, week, maand), *Advies voor HBC* en *Wat levert het op*. Elke kaart heeft een (i) met uitleg.
- **Drie talen:** Nederlands, Engels en Duits. De kaarten volgen de taal van je profiel in Home Assistant; per taal is er een dashboard.
- **Overschot ontladen** in de duurste gewone kwartieren.
- **Stilstand buiten Dynamic:** staat HBC op een andere strategie, dan stuurt Batterijplan niets en telt het niets op. Het leren gaat door.
- **Werkt met elke HBC-versie en elke taal van Solcast:** starttijden als getal of tekst, Solcast-sensoren worden zelf gevonden.
- **Eerlijkere teller** en **lading in de geschiedenis**, zodat de grafiek ook laat zien wat er gebeurde.

Alles op een rij: [CHANGELOG.md](CHANGELOG.md).

## Documentatie

| | |
|---|---|
| [01 · Installatie](docs/01-installation.nl.md) | Wat je nodig hebt, bestanden plaatsen, dashboard, instellingen |
| [02 · Het dashboard](docs/02-dashboard.nl.md) | Wat elke kaart laat zien |
| [03 · Hoe het werkt](docs/03-how-it-works.nl.md) | Het plan, overschot, leren, het advies en de teller in gewone taal |
| [04 · Onderhoud en bijwerken](docs/04-maintenance.nl.md) | Wat je af en toe doet, nieuwe versie, verwijderen |
| [05 · Problemen oplossen](docs/05-troubleshooting.nl.md) | Bekende meldingen en wat je eraan doet |

## Testversie

Dit is een **testversie** (dev). Ze draait al dagelijks bij de maker, maar heeft nog weinig andere installaties gezien. Zet hem eerst in schaduwmodus, kijk een paar dagen mee en meld wat je opvalt via [Issues](https://github.com/satscan1/hbc-batterijplan/issues) of op Discord. Vermeld je HBC-versie en, bij een foutmelding, een schermafdruk.

## Licentie

- **Code** (pakket, kaarten en dashboard): GPL-3.0-or-later.
- **Iconen en logo** (`www/batterijplan/`): eigen huisstijl van SatScan, zie [LICENSE-ICONEN.md](www/batterijplan/LICENSE-ICONEN.md).

Batterijplan is een losse aanvulling op [Home Battery Control](https://github.com/gitcodebob/marstek-venus-rs485-node-red) en wordt niet door de makers van HBC onderhouden.
