# 05 · Troubleshooting

*Nederlands: [05-troubleshooting.nl.md](05-troubleshooting.nl.md) · Deutsch: [05-troubleshooting.de.md](05-troubleshooting.de.md)*

**In short**
- Right after a restart some cards are empty for a moment. That fixes itself within a quarter of an hour.
- Look at the status card first: mode, learning, HBC strategy and next quarter usually already tell you what is going on.
- A problem you cannot solve? Take a screenshot and mention your HBC version in an [Issue](https://github.com/satscan1/hbc-batterijplan/issues).

## The plan is empty or the sensors are unknown

The sensor `sensor.batterijplan` is *unknown* as long as there is no plan. A plan needs all of this:

| Check | What to do |
|---|---|
| The usable capacity is filled in. | Fill it in (*Settings → Basic*, or *Configure* on the integration). With 0 there is no plan. |
| HBC has prices with labels. | Check that HBC is on Dynamic and that the prices come in (`sensor.hbc_energy_prices_data`). |
| Batterijplan can read the charge of **all** batteries. | Check in HBC the number of batteries (`input_number.house_battery_count`) and whether the charge percentage of each battery is available. One battery without a value is enough for an empty plan. |
| The sensors are chosen and report a value. | Open the *Sensors* button. A sensor that is *unavailable* or *unknown* gives no house usage and nothing to learn from. |

The sensors for house usage, the profile and the forecast are *unknown* or show *still measuring* in the first minutes and the first days. That is normal.

Does the plan stay empty? Then look in *Settings → System → Logs* for "batterijplan".

## Entity ids with `_2` at the end

You see `sensor.batterijplan_2`, `switch.batterijplan_live_2` and so on? That happens if the old package (`packages/batterijplan.yaml`) is still there next to the integration: the ids with the normal names are still taken.

1. Remove the package, the old cards and the old dashboard. See [01 · Installation](01-installation.md#upgrading-from-the-package-100-rc1rc2).
2. Restart Home Assistant. At the start Batterijplan puts the ids back to the normal names, where they are free.

Do not remove the `_2` entities by hand before that.

## Dashboard and cards

| Problem | Check |
|---|---|
| There is no **Batterijplan** in the sidebar | Refresh the browser (phone: close and reopen the app). Is the integration set up (*Settings → Devices & services*)? |
| A repair says the **dashboard address is taken** | You have a dashboard of your own at `/batterijplan`. Batterijplan leaves it alone and does not add its own. Rename or remove yours, then restart Home Assistant. |
| A card says *Custom element doesn't exist: batterijplan-…* | Is the old resource `/local/batterijplan/batterijplan-cards.js` still there? Remove it (*Settings → Dashboards → ⋮ → Resources*) and refresh the browser: the integration loads the cards itself. Two copies fight each other. |
| *Live*, the rules and the fields in *Settings* show *Unavailable* | The integration did not start. Look in *Settings → System → Logs* for "batterijplan" and restart Home Assistant. |
| The cards are in the wrong language | The cards follow the language of your **profile** in Home Assistant (your name at the bottom left → Language). In your own dashboard you can set `taal: nl`, `en` or `de` on a card. |
| The chart shows no solid line (measured charge) | Your recorder does not keep `sensor.batterijplan_lading`. Add it to your include list and restart. See [01 · Installation](01-installation.md#recorder-only-if-you-use-an-include-list). |
| The amounts in the plan are far too high | Does HBC give all-in prices? Set *Prices from HBC* to *all-in*, otherwise Batterijplan adds the mark-up and VAT twice. |

## Sun and usage

| Problem | Check |
|---|---|
| Batterijplan calculates with 0 sun | Is the *Solcast PV Forecast* integration installed? Batterijplan finds the Solcast sensors by itself, in any language. |
| *House usage now* is *Unavailable* | Check the grid sensor and the battery sensor. Solar without a value counts as 0 W. |
| *Check: house usage now* is not right | Check the signs: grid power import = +, battery power discharging = +. And solar power is the power right now in W, not the daily yield. |
| The forecast stays *variable* | A household with a lot of changing usage is harder to predict. If the battery runs empty too early too often, raise your safety margin. |

## Steering

| Problem | Check |
|---|---|
| **HBC is not on Dynamic** | Batterijplan then steers nothing and the counter adds nothing. The status card shows the strategy of HBC. Set HBC back to **Dynamic**: the plan recalculates straight away and starts steering again. Was *Live* on? Then your own modes are put back as soon as HBC leaves Dynamic. |
| Live is on, but the battery does not do what the plan says | Is HBC on **Full control** and **Dynamic**? Look in the logbook under "Batterijplan": every change is listed there. HBC reads its modes per quarter, so a change only works from the next quarter. |
| Nothing is steered | A rule may be off (*Settings → Rules*), or the plan has nothing to do better than HBC for the next quarters. That is normal. |
| After Live off, HBC is set differently than before | Batterijplan puts back the modes it remembered when you turned *Live* on. If you changed them yourself afterwards while *Live* was on, set them back yourself. |
| The counter does not move | It only counts with *Live* on **and** HBC on Dynamic. Otherwise it counts as *shadow*. |
