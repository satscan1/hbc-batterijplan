<p align="center"><img src="https://raw.githubusercontent.com/satscan1/hbc-batterijplan/main/www/batterijplan/logo.png" width="160" alt="HBC-Batterijplan"></p>

<p align="center"><a href="https://github.com/satscan1/hbc-batterijplan/releases"><img src="https://img.shields.io/github/v/release/satscan1/hbc-batterijplan?include_prereleases" alt="Release"></a> <a href="https://github.com/satscan1/hbc-batterijplan"><img src="https://img.shields.io/github/stars/satscan1/hbc-batterijplan?style=flat&logo=github" alt="Stars"></a> <a href="https://ko-fi.com/satscan"><img src="https://img.shields.io/badge/Ko--fi-satscan-FF5E5B?logo=kofi&logoColor=white" alt="Support me on Ko-fi"></a></p>

# Batterijplan — a smart layer on top of Home Battery Control (HBC)

*Nederlands: [README.nl.md](https://github.com/satscan1/hbc-batterijplan/blob/main/README.nl.md) · Deutsch: [README.de.md](https://github.com/satscan1/hbc-batterijplan/blob/main/README.de.md)*

*Version 1.0.0-dev1 · test version*

Batterijplan makes your home battery save its charge for the **most expensive** moments of the day. It works together with [Home Battery Control (HBC)](https://github.com/gitcodebob/marstek-venus-rs485-node-red) and does not take HBC over: HBC keeps controlling the battery, Batterijplan only gives it a hint for each quarter of an hour.

> Batterijplan is a separate, unofficial add-on to HBC. It is not made or maintained by the makers of HBC. Ask your questions about Batterijplan here, not at HBC.

<p align="center"><img src="https://raw.githubusercontent.com/satscan1/hbc-batterijplan/main/docs/images/dashboard.png" width="95%" alt="Batterijplan dashboard"></p>

## What Batterijplan does

- **Saves charge for the most expensive quarters.** HBC (strategy Dynamic) discharges in every expensive quarter in turn, even when an even more expensive moment comes an hour later. Batterijplan looks ahead to the next cheap moment and gives the charge to the most expensive quarters first. In the other expensive quarters the battery holds on to its charge.
- **Uses surplus wisely.** Is there more in the battery than you need until the next cheap moment? Then Batterijplan already delivers that surplus to the house in the most expensive regular quarters, instead of starting to charge with a full battery.
- **Learns your usage.** Per hour of the day, over 14 days, and after that it keeps moving along with the seasons. With the solar forecast from Solcast added in.
- **Gives advice for HBC.** How much solar energy your house uses itself (the HBC setting *Solar reserved for house*), based on the last 7 days. Batterijplan never changes that setting itself.
- **Shows what it earns.** An honest estimate on top of HBC alone: for surplus discharging, only what really came out of the battery counts.
- **Starts safely.** First in shadow mode (it calculates along, but steers nothing). Only when you turn on *Live* does it steer HBC.

## New in 1.0.0-dev1

- **New dashboard** in the HESC house style, with its own cards: *Plan today and tomorrow*, *Price and battery* (with date picker: day, week, month), *Advice for HBC* and *What does it earn*. Every card has an (i) with an explanation.
- **Three languages:** Dutch, English and German. The cards follow the language of your Home Assistant profile; there is a dashboard for each language.
- **Surplus discharging** in the most expensive regular quarters.
- **Paused outside Dynamic:** when HBC is set to another strategy, Batterijplan steers nothing and counts nothing. Learning goes on.
- **Works with every HBC version and every Solcast language:** start times as a number or as text, and the Solcast sensors are found automatically.
- **A fairer counter** and **charge in the history**, so the chart also shows what happened.

Everything at a glance: [CHANGELOG.md](CHANGELOG.md).

## Documentation

| | |
|---|---|
| [01 · Installation](docs/01-installation.md) | What you need, placing the files, dashboard, settings |
| [02 · The dashboard](docs/02-dashboard.md) | What each card shows |
| [03 · How it works](docs/03-how-it-works.md) | The plan, surplus, learning, the advice and the counter in plain language |
| [04 · Maintenance and updating](docs/04-maintenance.md) | What you do now and then, a new version, removing it |
| [05 · Troubleshooting](docs/05-troubleshooting.md) | Known messages and what to do about them |

## Test version

This is a **test version** (dev). It already runs every day at the maker's home, but it has not seen many other installations yet. Start in shadow mode, watch it for a few days and report what you notice via [Issues](https://github.com/satscan1/hbc-batterijplan/issues) or on Discord. Mention your HBC version and, for an error message, add a screenshot.

## License

- **Code** (package, cards and dashboard): GPL-3.0-or-later.
- **Icons and logo** (`www/batterijplan/`): SatScan's own house style, see [LICENSE-ICONEN.md](www/batterijplan/LICENSE-ICONEN.md).

Batterijplan is a separate add-on to [Home Battery Control](https://github.com/gitcodebob/marstek-venus-rs485-node-red) and is not maintained by the makers of HBC.
