# 03 · How it works

*Nederlands: [03-how-it-works.nl.md](03-how-it-works.nl.md) · Deutsch: [03-how-it-works.de.md](03-how-it-works.de.md)*

**In short**
- For each quarter of an hour HBC says: cheap, expensive or regular. Batterijplan looks ahead (at most 36 hours) and works out where it can do better than HBC alone.
- Batterijplan only chooses between settings that HBC offers itself. All protections stay with HBC and the battery.
- Everything Batterijplan does goes into the Home Assistant logbook under the name "Batterijplan".

## The problem Batterijplan solves

HBC (strategy **Dynamic**) gives every quarter a label:
- **cheap**: charge from the grid;
- **expensive**: discharge for the house;
- **regular**: only charge from the sun.

That works well, but HBC does not look further than the label of the quarter it is in. The result: the battery runs empty at an expensive moment of 27 ct, while an hour later a moment of 50 ct comes along. Or it is not charged for an evening peak that HBC does not mark as expensive.

## The plan

Batterijplan calculates twice, over all quarters it knows the price of:
1. **HBC alone**: cheap → charge from the grid, expensive → discharge, otherwise only the sun.
2. **Batterijplan**: the same, plus the four rules below.

The difference between the two, in euros, is the **expected saving** on the dashboard.

It takes into account:
- how much charge is in the batteries now (the charge percentage above HBC's lower limit, times the usable capacity, minus your safety margin);
- how much your house usually uses at that hour of the day (it learns this by itself);
- how much sun is expected (Solcast, the careful estimate for the calculation; the chart shows the middle estimate, like HBC);
- the prices per quarter, as HBC gives them, and your costs (see [the costs](#the-costs)).

It calculates every quarter, shortly before it starts (at :14:30, :29:30, :44:30 and :59:30), and also when the prices change or HBC changes its strategy.

### The threshold

Batterijplan uses one threshold: the HBC setting **Dynamic threshold delta** (in ct). It is the price difference from which HBC itself says "this is worth it". It must also cover the losses in the battery, so Batterijplan has no efficiency setting and no fixed limit of its own.

A quarter counts as **expensive** if HBC marks it expensive, **or** if its price is at least the threshold above the cheapest quarter before it.

## The rules

Every rule has its own switch (on the dashboard under *Settings*, tab **Rules**, and in the briefing). All four are on by default. If you switch a rule off, the plan does at those moments what HBC alone does.

| Rule | What it does, in plain words |
|---|---|
| **Charge from the grid** | In a quarter that is not expensive, Batterijplan charges extra from the grid if the battery would otherwise be too empty for later expensive quarters that are at least the threshold more expensive than now. It stops when a cheaper quarter comes. |
| **Discharge outside HBC hours** | A quarter that HBC does not mark as expensive, but that is at least the threshold above the cheapest quarter before it, counts as expensive too. The battery then discharges there. |
| **Hold** | In an expensive quarter the battery does not discharge if that charge is needed for later quarters that are at least the threshold more expensive, before a quarter comes that is at least the threshold cheaper. It holds the charge for later. |
| **Feed in** | If there is certainly a surplus in the battery (after keeping what you need yourself later), Batterijplan feeds it into the grid in a quarter in which the feed-in price is at least the threshold above the cheapest purchase price. |

Is there sun or a cheap moment between two peaks? Then Batterijplan counts that as topping up, and the first peak may simply discharge.

The five letters in the plan: **L** charge from the grid, **O** discharge, **H** hold, **Z** only the sun, **V** feed in.

> The old rules (surplus discharging, topping up when needed, the fixed limit of € 0.10) and the setting *efficiency* are gone from this version. The threshold of HBC replaces them.

## The costs

Batterijplan counts without net metering, so purchase and feed-in each have their own price:
- **Purchase**: (exchange price + mark-up) × (1 + VAT). With *all-in* prices, the price as HBC gives it.
- **Feed-in**: exchange price + add-on. In the daytime (when there is sun, or between the hours you set) a positive price gets the bonus percentage on top.
- Charge that is left in the battery at the end of the plan counts at the lowest purchase price in the plan.

The mark-up (*opslag*), the VAT, the add-on and the bonus are settings, not fixed numbers. For example, a supplier like Zonneplan has a *storage* fee in its purchase price and a *terugleververgoeding* for feeding in; fill in what your own contract says. See [01 · Installation](01-installation.md#expert-settings).

## What Batterijplan steers in HBC

Batterijplan changes nothing in HBC as long as **Live** is off. With **Live** on, and only if HBC is on **Dynamic**, it sets after every calculation one of HBC's three Dynamic modes: the one that belongs to the price class of the coming quarter, as HBC itself labels it. HBC reads these per quarter.

| Price class (by HBC) | Plan: hold | Plan: feed in | Plan: charge from the grid | Otherwise |
|---|---|---|---|---|
| **Expensive** (*dynamic expensive*) | Standby / peak shave | Sell | — | Self-consumption |
| **Cheap** (*dynamic cheapest*) | Standby / peak shave | — | Charge | Charge PV |
| **Regular** (*dynamic default*) | Standby / peak shave | Self-consumption | — | Charge PV (discharge: Self-consumption) |

HBC has no *Charge* in the regular class, so Batterijplan cannot charge from the grid in a regular quarter by itself in that mode. It only changes a mode if it is different. Every change goes into the logbook.

### Your own HBC settings

Batterijplan remembers your three modes (expensive, regular, cheap):
- at the moment you turn *Live* on;
- and every time you change them while *Live* is off.

It puts those back when *Live* goes off or when HBC leaves Dynamic. Nothing remembered yet? Then it puts back *Self-consumption*, *Charge PV* and *Charge*.

### When HBC is not on Dynamic

If you (or an automation, for example at a negative price) choose another strategy in HBC, then:
- Batterijplan steers nothing and the counter adds nothing;
- if *Live* was on, Batterijplan puts the three modes back to your own settings;
- learning simply goes on.

As soon as HBC is back on Dynamic, the plan recalculates straight away and starts steering again.

## Turning Live on

On the dashboard, turn on **Live** (the switch `switch.batterijplan_live`). From that moment, every quarter Batterijplan adjusts HBC's Dynamic modes as in the table above.

**Live off again?** Then Batterijplan puts the modes straight back to your own settings. HBC is then completely as it was before.

**Live and shadow.** With *Live* off, Batterijplan still calculates, learns and counts what it would have added, but separately as *shadow*. The sensor `sensor.batterijplan` shows `modus`: *live* or *schaduw* (shadow).

## Learning

Batterijplan measures the house usage per quarter (grid + sun + battery, minus the EV charger) and builds a profile for each hour of the day. It learns over **7 days**:

| Status | After | Meaning |
|---|---|---|
| learning | 0–3 days | After the first day it already takes part, but it is still unsteady. |
| rough | 4–6 days | Usable, but one odd day still weighs heavily. |
| good | 7+ days | Well tuned. After that it keeps learning as it goes: old days slowly fade out, so it moves along with the seasons. |

Why 7 days? A test with 89 days of real measurement data showed that a short memory predicts usage slightly better than a long memory.

The **forecast** compares the expected usage with the real usage, per block of 3 hours (00–03, 03–06 and so on). A single quarter is too erratic to predict; a block of 3 hours is what really matters for the plan. You see a verdict: *variable* (below 55 %), *fair* (55 % or more), *good* (65 % or more), *very good* (75 % or more) or *excellent* (85 % or more). The percentage itself is in the sensor `sensor.batterijplan_voorspelling` (attribute *betrouwbaarheid*), rolling over the last 7 days.

Learning always goes on, also in shadow mode and also when HBC is not on Dynamic.

## The counter: added value

The sensor `sensor.batterijplan_meerwaarde` counts what Batterijplan adds on top of HBC alone. Every quarter it is settled afterwards:

(the costs of HBC alone in that quarter − the costs of the plan in that quarter) + (charge of the plan − charge of HBC alone at the end of that quarter) × the lowest purchase price in the plan.

It only counts when **Live** is on and HBC is on **Dynamic**. Otherwise the quarter goes to the *shadow* total. The second sensor, `sensor.batterijplan_meerwaarde_periode`, counts per **contract year**: it starts again on the day and month of your contract start date.

**It is an estimate** ("geschat"). It rests on the prices and the usage that Batterijplan expected at that time. Your energy bill is the real proof.

## What it does not do (yet)

- **A cheap afternoon that HBC does not mark as cheap** (because of the limit on hours per day or the minimum price difference in HBC) does not count as topping up.
- **Difference between weekdays and weekends** in usage.
- **Charging the battery from the grid in a regular quarter in HBC mode *Charge PV*:** HBC offers no mode for it (see [the table](#what-batterijplan-steers-in-hbc)).

## Solar forecast for HBC (charge target)

`sensor.batterijplan_zon_voor_hbc` makes HBC stop grid charging at the level the plan wants. Value = reserve + max energy - target (kWh). Target = planned charge (kWh above the discharge cut-off) at the end of the coming consecutive grid-charge block. A target at or above max energy gives a full charge; with no grid-charge block in the plan the target is the energy stored now.

- Works only with HBC charge goal *solar forecast*, and only when you set `input_text.house_battery_strategy_solar_forecast_entity_id` to this sensor yourself. Batterijplan never changes HBC.
- Every plan run (30 s before each quarter) updates the sensor; the HBC template reads it at :00, :15, :30 and :45.
- HBC has no hysteresis on this goal: the battery may switch on and off around the target.

### Pass-through and Solcast names (rc5)

- **Pass-through.** When Live is off, HBC is not on Dynamic, the rule *charge* is off, there is no plan, or reserve and maximum are unknown, the sensor passes the real solar forecast on 1:1, so HBC does exactly what it did without Batterijplan. The source is the sensor HBC pointed to before (remembered whenever the pointer is not this sensor), otherwise Solcast *remaining today*. The attributes `modus`, `reden` and `bron` show what happens.
- **Solcast names.** Settings has two optional fields, *Solar forecast today* and *tomorrow*. A filled field always wins. Otherwise Batterijplan looks itself: first Solcast by platform (language-independent), then the known names in the order English, Dutch, German. If nothing is found, the report says *not found* with the tip to fill the fields.

### Advice and auto-adjust for the HBC settings (rc6)

Batterijplan can advise on three HBC settings: *cheapest hrs*, *expensive hrs* and *Solar reserved for house*. The card **Advice for HBC** shows for each one the current value, the advice, a one-line reason and an orange dot when they differ (also when auto-adjust is off).

**What is kept.** Per quarter, for 7 days: the bare HBC price, your measured house use and your measured solar. It is stored compactly in its own file and survives restarts. Until 7 full days are there the card says *Still measuring: day x of 7* and nothing changes.

**How the advice is made.** Once a night (about 03:10) Batterijplan plays the last 7 days again with its own planner (Live on, current rules). For every candidate pair of *cheapest hrs* and *expensive hrs* it marks the quarters exactly the way HBC does (per calendar day, cheapest against most expensive, as long as the spread is at least the threshold delta, capped by the number of hours) and adds up the grid cost. Every replayed day starts with an empty battery, and charge that is left at the end of the day is valued at that day's cheapest purchase price, so it does not count as a loss. The pair with the lowest cost wins. When two results are practically equal (less than 1 cent over the 7 days) the value closest to your current setting wins. The candidates are whole hours up to 12 (or the maximum of the helper), always inside the helper's limits. The calculation takes a few seconds of processor time, once a day. *Solar reserved for house* is the 7-day average of the existing advice, rounded to 0.5 kWh.

**Auto-adjust.** The switch *Auto-adjust HBC settings* is **off** by default. When you turn it on, Batterijplan first remembers your own three values and then sets a setting to the advice, only when the difference is at least 1 hour (cheapest, expensive) or 0.5 kWh (solar reserved). Turning it off puts your own values back exactly. Every change is written to the logbook. Batterijplan only changes these three settings; it never touches HBC's flows or code.

### Live charge level and lighter recorder load (rc6)

*In the battery now* is recalculated, with the same formula as the plan, whenever a battery charge or a discharge cut-off changes (at most once per 5 seconds, without a new plan run). The value lives in the small sensor `sensor.batterijplan_lading`: the state is the live charge in kWh, rounded to 0.1 kWh, so it only writes when it changes by that much. The attribute `lading_plan` holds the planned charge. The big sensor `sensor.batterijplan` and the chart keep the plan values.

The large or constantly changing attributes of the sensors (the plan points, the explanation, the Solcast names, the quarter times and the live figures) are still available to the cards, but are no longer written to the recorder database. The decisions (action, HBC action, mode, HBC strategy) stay recorded. On a typical system this takes the attribute data of the main sensor from about 690 kB to a few kB per day.
