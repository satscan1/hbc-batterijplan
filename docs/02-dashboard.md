# 02 · The dashboard

*Nederlands: [02-dashboard.nl.md](02-dashboard.nl.md) · Deutsch: [02-dashboard.de.md](02-dashboard.de.md)*

**In short**
- On the left you see how Batterijplan is doing, on the right the plan and the chart, at the bottom the settings.
- Every custom card has an **(i)** next to its title: click it for an explanation. Hover over a number with a dotted underline for a short note.
- The colours are the same everywhere: **green** = discharging in an expensive quarter, **orange** = holding for later, **light green** = surplus discharging.

<p align="center"><img src="images/dashboard.png" width="95%" alt="Batterijplan dashboard"></p>

## At the top: logo and badges

| Badge | What you see |
|---|---|
| **Saved in total** | The estimated earnings on top of HBC since the start. |
| **This energy period** | The same, but from the start date of your contract. Every contract year starts again. |
| **Forecast accuracy** | How well the learned usage predicts the real usage. Grey during the first 14 days (light → dark), then green: the darker, the better (dark green above 90 %). |

## Left

**Batterijplan (status)**

| Line | Meaning |
|---|---|
| Mode | **live** — steers HBC, or **shadow** — calculates along, steers nothing. |
| Learning usage | "learning · day 3 of 14 · all hours of the day seen". After 14 days: "done learning · forecast 91 % on target". |
| HBC strategy | Must be **Dynamic**. Shows something else? Then Batterijplan is paused. |
| Next quarter | What Batterijplan decides for the next quarter of an hour. |

**Advice for HBC**

One line about the HBC setting *Solar reserved for house* (how much solar energy your house uses up directly by itself):
- **Still measuring** (grey): the usage is still being learned, or less than a week has been measured.
- **Set correctly** (green): your setting is less than 1 kWh away from what was needed on average over the last 7 days.
- **Change to 5.5 kWh** (orange): with below it what is set now and what was needed on average.

If extra charging from the grid tonight makes sense, that is shown too. Batterijplan never changes HBC itself; you decide. See [03 · How it works](03-how-it-works.md#advice-for-hbc).

**What does it earn**

| Line | Meaning |
|---|---|
| Total since … | The estimated earnings on top of HBC alone. |
| of which shadow | What it would have earned while *Live* was off. You did not really earn that money. |
| of which live | What it earned while Batterijplan was really steering. |
| Quarters discharged / held / surplus | How often Batterijplan did each of the three things. |
| Charge shifted to more expensive moments | How many kWh were used later, at a higher price, because of holding. |

## Right

**Plan today and tomorrow**

- At the top four numbers: **In the battery now**, how long it will be **discharging in expensive quarters**, how long it will be **holding for later**, and how much **surplus** will be discharged.
- A bar from 00:00 to 24:00 for each day. Only the moments where Batterijplan does something different from HBC have a colour; empty parts mean: HBC does its usual thing. The blue line is now.
- Below that, the blocks in words, for example "Tue 08:30–10:30 surplus discharging · ± 0.65 kWh, ± € 0.10". Nothing to do: "Nothing to steer until Tue 13:00: HBC does its usual thing."
- The bar for tomorrow appears as soon as HBC has tomorrow's prices (usually around 13:00).

**The date picker** (below the plan)

Choose *Today*, another day, a week or a month, and browse with ‹ ›. The chart below follows your choice.

**Price and battery**

- **Per day:** the grey line is the bare electricity price per quarter. The coloured areas are the quarters in which Batterijplan steers. The blue line is the charge in kWh (right axis): **solid = measured**, **dashed = expected according to the plan**; after the end of the plan it fades out. Left of *Now* is the past and slightly dimmed.
- **Per week or month:** a green bar per day with what Batterijplan earned by estimate. At the top the total, the average per day and the best day.
- Hover over the chart for the price, what the battery did and the charge in that quarter.

## At the bottom: Settings

Five tiles across the full width:

| Tile | What it does |
|---|---|
| **Make back-up** | Saves all your settings. |
| **Restore back-up** | Puts back the last back-up (with confirmation). |
| **Default values** | Sets the safety margin and efficiency back to 0.3 kWh and 75 %. A back-up is made first. |
| **Live** | On = Batterijplan steers HBC. Off = shadow mode. |
| **Settings** | On = the input fields, the sensors and the explanation fold open. As long as something is missing, they stay open by themselves. |

Below the tiles you see when the last back-up was made.
