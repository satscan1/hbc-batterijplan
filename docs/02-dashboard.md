# 02 · The dashboard

*Nederlands: [02-dashboard.nl.md](02-dashboard.nl.md) · Deutsch: [02-dashboard.de.md](02-dashboard.de.md)*

**In short**
- The start page answers one question: *what is Batterijplan doing now, and does it get more out of the battery than HBC alone?* Everything fits on one screen.
- At the top there is a row of buttons. Settings, sensors, advice and earnings sit behind a button and open as a window.
- Every custom card has an **(i)** next to its title, and on the status card and in the settings every line has one too. Click it for the *How to read this?* window. Hover over a number with a dotted underline for a short note.
- The colours are the same everywhere: **green** = discharging in an expensive quarter, **orange** = holding for later, **purple** = surplus discharging.

<p align="center"><img src="images/dashboard.png" width="95%" alt="Batterijplan dashboard"></p>

The page has three rows:
1. the row of buttons;
2. the status card, with the plan to the right of it;
3. the chart across the full width.

## The row of buttons

| Button | What it does |
|---|---|
| **Live** (its own switch, at the front) | Green and on = Batterijplan steers HBC. Off = shadow mode: it calculates along, but steers nothing. |
| **Earnings** | Opens *What does it earn*. |
| **HBC advice** | Opens *Advice for HBC*. |
| **Settings** | Opens the settings, with the Basic and Expert tabs. |
| **Sensors** | Opens the sensor names, the check *house usage now* and the explanation. |

An **orange dot** on a button means: there is something to do here. For example advice to change something, a setting that is not filled in or a sensor that reports nothing. No dot means everything is set up correctly.

You close a window with **‹ Back** or ✕ at the top, by clicking next to it or with Esc. You close the *How to read this?* window the same way; you then return to where you were.

## Status card

At the top the logo, the name and the version, with the question Batterijplan answers. Every line has an **(i)** on the right with an explanation.

| Line | Meaning |
|---|---|
| Mode | **live** — steers HBC, or **shadow** — calculates along, steers nothing. |
| Learning usage | While learning, for example "learning · day 3 of 7 · forecast fair". After 7 days: "done learning · forecast good". |
| HBC strategy | Must be **Dynamic**. Shows something else? Then the plan waits. |
| Next quarter | What Batterijplan decides for the next quarter of an hour. |

**The forecast** says how well the learned usage matches the real usage, per block of 3 hours. You only see a verdict, not a percentage:

| Verdict | Colour |
|---|---|
| still measuring | normal text |
| variable | normal text |
| fair | light green |
| good | green |
| very good | dark green |
| excellent | the darkest green |

## Plan today and tomorrow

- At the top four numbers: **In the battery now**, how long it will be **discharging in expensive quarters**, how long it will be **holding for later**, and how much **surplus** will be discharged.
- A bar from 00:00 to 24:00 for each day. Only the moments where Batterijplan does something different from HBC have a colour. Empty parts mean: HBC does its usual thing. The blue line is now.
- Below that, the blocks in words, for example "Tue 08:30–10:30 surplus discharging · ± 0.65 kWh, ± € 0.10". Nothing to do: "Nothing to steer until Tue 13:00: HBC does its usual thing."
- The bar for tomorrow appears as soon as HBC has tomorrow's prices (usually around 13:00).

## Price and battery

**The date picker** is on the right in the header of the chart. Choose *Now*, another day, a week or a month, and browse with ‹ ›.

- **Per day:**
  - the grey line is the electricity price per quarter, as HBC gives it;
  - the coloured areas are the quarters in which Batterijplan steers;
  - the blue line is the charge in kWh (right axis): **solid = measured**, **dashed = expected according to the plan**. After the end of the plan it fades out;
  - the **red dotted line** is the charge if HBC had done it alone;
  - left of *Now* is the past and slightly dimmed.
- **The difference with HBC alone** is shown as a chip in the header: *Extra vs HBC alone*. More than 0 shows as **+ € 0.35** in green, exactly 0 as **€ 0.00** in grey, less than 0 as **– € 0.02** in orange. The same rule applies to *Gained in this period* and to the amounts in *What does it earn*.
- **Per week or month:** a green bar per day with what Batterijplan earned by estimate. At the top the total, the average per day and the best day.
- Hover over the chart for the price, what the battery did and the charge in that quarter.

## Windows behind the buttons

**What does it earn**

| Line | Meaning |
|---|---|
| Total since … | The estimated earnings on top of HBC alone. |
| of which shadow | What it would have earned while *Live* was off. You did not really earn that money. |
| of which live | What it earned while Batterijplan was really steering. |
| Quarters discharged / held / surplus | How often Batterijplan did each of the three things. |
| Charge shifted to more expensive moments | How many kWh were used later, at a higher price, because of holding. |

**Advice for HBC**

One line about the HBC setting *Solar reserved for house* (how much solar energy your house uses up directly by itself):
- **Still measuring** (grey): the usage is still being learned, or less than a week has been measured.
- **Set correctly** (green): your setting is less than 1 kWh away from what was needed on average over the last 7 days.
- **Change to 5.5 kWh** (orange): with below it what is set now and what was needed on average. The *HBC advice* button then gets an orange dot.

If extra charging from the grid tonight makes sense, that is shown too. Batterijplan never changes HBC itself; you decide. See [03 · How it works](03-how-it-works.md#advice-for-hbc).

**Settings**

Two tabs, with their own input fields (slider, choice buttons, − value +) and an (i) next to every field:

| Tab | What is on it |
|---|---|
| **Basic** — set and forget | Usable capacity, *Prices from HBC* (*kaal* (bare) or *all-in*), contract start date, and the back-up: **Make back-up**, **Restore back-up** and **Defaults**. Below them you see when the last back-up was made. Restore and defaults first ask "Sure? Tap once more". |
| **Expert** — only change if you know why | Safety margin, efficiency and energy tax + purchase fee. |

The explanation for each field is also in [01 · Installation](01-installation.md#step-6--fill-in-the-settings).

**Sensors**

The names of your sensors for grid, sun, battery and (optionally) EV charger. Tap a field for a list of the power sensors in your Home Assistant (the most likely at the top) and pick one; typing filters the list. Below each name you see what that sensor reports now. At the bottom the check *house usage now*.
