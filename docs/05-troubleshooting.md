# 05 · Troubleshooting

*Nederlands: [05-troubleshooting.nl.md](05-troubleshooting.nl.md) · Deutsch: [05-troubleshooting.de.md](05-troubleshooting.de.md)*

**In short**
- Right after a restart some cards are empty for a moment. That fixes itself within a quarter of an hour.
- Look at the status card first: mode, learning, HBC strategy and next quarter usually already tell you what is going on.
- A message? Take a screenshot and mention your HBC version in an [Issue](https://github.com/satscan1/hbc-batterijplan/issues).

## Messages in the plan

| What you see | What it means | What to do |
|---|---|---|
| **Not set up** | The usable capacity has not been filled in. | Fill it in (Settings). |
| **No battery data** | Batterijplan cannot read the charge of one or more batteries. It then holds nothing. | Check in HBC the number of batteries and whether their charge percentage is available. |
| **No price data** | HBC has no prices with labels (yet). | Check that HBC is on Dynamic and that the prices come in (`sensor.hbc_energy_prices_data`). |
| **Batterijplan is paused: HBC is set to …** | HBC is not on Dynamic. | Normal if you choose another strategy on purpose. Set HBC back to Dynamic to let Batterijplan take part. |
| **Nothing to steer until …** | Until the next cheap moment there is nothing to improve. HBC does its usual thing. | Nothing, this is normal. |

## Dashboard and cards

| Problem | Check |
|---|---|
| A card says *Custom element doesn't exist: batterijplan-…* | The cards are not registered as a resource, or the browser still has the old version. See [01 · Installation, step 5](01-installation.md#step-5--cards-and-dashboard). Then refresh the browser (phone: close and reopen the app). |
| An error *can only concatenate str (not "int") to str* | That was a bug in version 0.1.5 with some HBC versions. Fixed in 1.0.0-dev1: update. |
| *Live* and the fields in *Settings* show *Unavailable* | The package is not loaded. Choose *Developer tools → YAML → Check configuration*, fix any message and restart Home Assistant. |
| A card says *t is not a function* on hover | A bug in 1.0.0-dev1. Fixed in 1.0.0-rc1: update and raise the number after the cards resource. |
| The icons in the cards are missing | Refresh the browser. The icons are inside the cards file itself. |
| The cards are in the wrong language | The cards follow the language of your **profile** in Home Assistant (your name at the bottom left → Language). |
| The chart shows no solid line (measured charge) | Your recorder does not keep `sensor.batterijplan_lading`. Add it to your include list and restart. Until then the chart reads the charge from the history of the plan, from the moment version 1.0.0-dev1 runs. |
| Week or month is empty, or the total does not match *What does it earn* | Home Assistant's daily count only starts one day after the counter started. That sorts itself out. |
| *Advice for HBC* stays at "Still measuring" | Normal in the first week: the usage must be learned and a week must have been measured. |
| The plan got stuck on an old quarter after a restart | A bug in 1.0.0-dev1 (the plan was stored as text). Fixed in 1.0.0-rc1. |
| The amounts in the plan are far too high | Does HBC give all-in prices? Set *Prices from HBC* to *all-in*, otherwise Batterijplan adds the tax and VAT twice. |

## Sun and usage

| Problem | Check |
|---|---|
| Batterijplan calculates with 0 sun | Is the *Solcast PV Forecast* integration installed? Batterijplan finds the Solcast sensors by itself, in any language. |
| *House usage now* is *Unavailable* at night | A bug in 1.0.0-dev1 with inverters that report nothing at night. Fixed in 1.0.0-rc1: solar without a value counts as 0 W. |
| *Check: house usage now* is not right | Check the signs: grid power import = +, battery power discharging = +. And solar power is the power right now in W, not the daily yield. |
| The forecast stays *variable* | A household with a lot of changing usage is harder to predict. Batterijplan then adds an extra margin itself (see [03 · How it works](03-how-it-works.md)). If the battery still runs empty too early too often, raise your own safety margin. |

## Steering

| Problem | Check |
|---|---|
| Live is on, but the battery does not do what the plan says | Is HBC on **Full control** and **Dynamic**? Look in the logbook under "Batterijplan": every change is listed there. HBC reads its settings per quarter, so a change only works from the next quarter. |
| During "surplus discharging" the charge hardly drops | The sun already covers the house. Then there is nothing to discharge; in that case the counter does not count anything either. |
| After Live off, HBC is set differently than before | Batterijplan puts back the settings it remembered when you turned *Live* on. If you changed them yourself afterwards while *Live* was on, set them back yourself. |
| Batterijplan does not steer anything in the expensive period | Is your expensive setting in HBC something other than *Self-consumption* (for example *Sell*)? Then Batterijplan deliberately leaves it alone. |
