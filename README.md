<p align="center"><img src="https://raw.githubusercontent.com/satscan1/hbc-batterijplan/main/www/batterijplan/logo.png" width="160" alt="HBC-Batterijplan"></p>

<p align="center"><a href="https://github.com/satscan1/hbc-batterijplan/releases"><img src="https://img.shields.io/github/v/release/satscan1/hbc-batterijplan?include_prereleases" alt="Release"></a> <a href="https://github.com/satscan1/hbc-batterijplan"><img src="https://img.shields.io/github/stars/satscan1/hbc-batterijplan?style=flat&logo=github" alt="Stars"></a> <a href="https://ko-fi.com/satscan"><img src="https://img.shields.io/badge/Ko--fi-satscan-FF5E5B?logo=kofi&logoColor=white" alt="Support me on Ko-fi"></a></p>

# Batterijplan — a smart layer on top of Home Battery Control (HBC)

*Nederlands: [README.nl.md](https://github.com/satscan1/hbc-batterijplan/blob/main/README.nl.md) · Deutsch: [README.de.md](https://github.com/satscan1/hbc-batterijplan/blob/main/README.de.md)*

*Version 1.0.0-rc1 · release candidate*

Batterijplan makes your home battery save its charge for the **most expensive** moments of the day. It works together with [Home Battery Control (HBC)](https://github.com/gitcodebob/marstek-venus-rs485-node-red) and does not take HBC over: HBC keeps controlling the battery, Batterijplan only gives it a hint for each quarter of an hour.

> Batterijplan is a separate, unofficial add-on to HBC. It is not made or maintained by the makers of HBC. Ask your questions about Batterijplan here, not at HBC.

<p align="center"><img src="https://raw.githubusercontent.com/satscan1/hbc-batterijplan/main/docs/images/dashboard.png" width="95%" alt="Batterijplan dashboard"></p>

## What Batterijplan does

- **Saves charge for the most expensive quarters.** HBC (strategy Dynamic) discharges in every expensive quarter in turn, even when an even more expensive moment comes an hour later. Batterijplan looks ahead to the next cheap moment and gives the charge to the most expensive quarters first. In the other expensive quarters the battery holds on to its charge.
- **Uses surplus wisely.** Is there more in the battery than you need until the next cheap moment? Then Batterijplan already delivers that surplus to the house in the most expensive regular quarters, instead of starting to charge with a full battery.
- **Learns your usage.** Per hour of the day, in 7 days, and after that it keeps moving along with the seasons. With the solar forecast from Solcast added in.
- **Gives advice for HBC.** How much solar energy your house uses itself (the HBC setting *Solar reserved for house*), based on the last 7 days. Batterijplan never changes that setting itself.
- **Shows what it earns.** An honest estimate on top of HBC alone: for surplus discharging, only what really came out of the battery counts.
- **Starts safely.** First in shadow mode (it calculates along, but steers nothing). Only when you turn on *Live* does it steer HBC.

## New in 1.0.0-rc1

- **Calmer dashboard:** everything on one screen. At the top a row of buttons with *Live* at the front; settings, sensors, advice and earnings open as a window. An orange dot shows where there is something to do.
- **Fully in the house style:** custom input fields (slider, choice buttons, − value +), sensors picked from a list of the likely candidates, settings on the Basic and Expert tabs, and an (i) with an explanation on every line.
- **Comparison with HBC alone** in the chart: a red dotted line and the difference in euros per day.
- **Faster learning:** done after 7 days. The forecast is judged per block of 3 hours and you only see a verdict (fair, good, very good, excellent). With variable usage the plan adds an extra margin itself.
- **Bare or all-in prices:** new setting *Prices from HBC*.
- **Your own HBC settings** are remembered and put back. If you use *Sell*, Batterijplan leaves that period alone.
- **Fixed:** the plan sometimes got stuck after a restart, an error on hover in the cards, and *house usage* dropped out at night with inverters that report nothing.

Everything at a glance: [CHANGELOG.md](CHANGELOG.md).

## Documentation

| | |
|---|---|
| [01 · Installation](docs/01-installation.md) | What you need, placing the files, dashboard, settings |
| [02 · The dashboard](docs/02-dashboard.md) | What each card shows |
| [03 · How it works](docs/03-how-it-works.md) | The plan, surplus, learning, the advice and the counter in plain language |
| [04 · Maintenance and updating](docs/04-maintenance.md) | What you do now and then, a new version, removing it |
| [05 · Troubleshooting](docs/05-troubleshooting.md) | Known messages and what to do about them |

## Release candidate

This is a **release candidate** (rc): the last test version before 1.0.0. It runs every day at the maker's home and with a few testers. Start in shadow mode first, watch it for a few days and report what you notice via [Issues](https://github.com/satscan1/hbc-batterijplan/issues) or on Discord. Mention your HBC version and, for an error message, add a screenshot.

## License

- **Code** (package, cards and dashboard): GPL-3.0-or-later.
- **Icons and logo** (`www/batterijplan/`): SatScan's own house style, see [LICENSE-ICONEN.md](www/batterijplan/LICENSE-ICONEN.md).

Batterijplan is a separate add-on to [Home Battery Control](https://github.com/gitcodebob/marstek-venus-rs485-node-red) and is not maintained by the makers of HBC.
