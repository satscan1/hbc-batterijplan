# 03 · How it works

*Nederlands: [03-how-it-works.nl.md](03-how-it-works.nl.md) · Deutsch: [03-how-it-works.de.md](03-how-it-works.de.md)*

**In short**
- For each quarter of an hour HBC says: cheap, expensive or regular. Batterijplan looks ahead to the next cheap moment and decides which expensive quarters get the charge.
- Batterijplan only chooses between settings that HBC offers itself. All protections stay with HBC and the battery.
- Everything Batterijplan does goes into the Home Assistant logbook under the name "Batterijplan".

## The problem Batterijplan solves

HBC (strategy **Dynamic**) gives every quarter a label:
- **cheap**: charge from the grid;
- **expensive**: discharge for the house;
- **regular**: only charge from the sun (setting *Charge PV*).

That works well, but HBC does not check whether the battery has enough charge for *all* expensive quarters until the next chance to charge. The makers of HBC mention this themselves as a limitation. The result: the battery runs empty at an expensive moment of 27 ct, while an hour later a moment of 50 ct comes along.

## The plan

Every quarter, about 45 seconds before it starts, Batterijplan looks ahead to the next cheap moment. It takes into account:
- how much charge is in the batteries now (the charge percentage above HBC's lower limit, times the usable capacity);
- how much your house usually uses at that hour of the day (it learns this by itself);
- how much sun is expected (Solcast, the careful estimate);
- which expensive quarters are still coming and what they cost.

Then:

| Situation | What Batterijplan does | Setting in HBC |
|---|---|---|
| Expensive quarter that gets the charge | **discharge** for the house | expensive setting *Self-consumption* |
| Expensive quarter that does not get the charge (a more expensive quarter comes later) | **hold for later** | expensive setting *Standby / peak shave* |
| Regular quarter, more in the battery than needed until the cheap moment | **surplus discharging** in the most expensive regular quarters | regular setting *Self-consumption* |
| Regular quarter without surplus | nothing, HBC does its usual thing | regular setting *Charge PV* |
| Cheap quarter | nothing, HBC charges | *Charge* |

Is there sun or a cheap moment between two peaks? Then Batterijplan counts that as topping up, and the first peak may simply discharge.

## Surplus discharging

Sometimes there is more in the battery than the house needs until the next cheap moment. Without Batterijplan that charge just sits there, and later HBC tops up a battery that is already nearly full. Batterijplan would rather use that surplus now, in the most expensive regular quarters, when that earns more than charging it back costs (including the losses in the battery). It always keeps the safety margin.

## Learning

Batterijplan measures the house usage per quarter (grid + sun + battery, minus the EV charger) and builds a profile for each hour of the day:

| Status | After | Meaning |
|---|---|---|
| learning | 0–3 days | After the first day it already takes part, but it is still unsteady. |
| rough | 4–6 days | Usable, but one odd day still weighs heavily. |
| good | 7+ days | Well tuned. After that it keeps learning as it goes, over about 4 weeks: old days slowly fade out, so it moves along with the seasons. |

Why 7 days? A test with 89 days of real measurement data showed that a short memory predicts usage slightly better than a long memory.

The **forecast** compares the expected usage with the real usage, per block of 3 hours (00–03, 03–06 and so on). A single quarter is too erratic to predict; a block of 3 hours is what really matters for the plan. You see a verdict: *variable* (below 55 %), *fair* (55 % or more), *good* (65 % or more) *very good* (75 % or more) or *excellent* (85 % or more). The percentage itself is in the sensor `sensor.batterijplan_voorspelling` (attribute *betrouwbaarheid*), rolling over the last 7 days.

**Variable usage.** If the forecast is *variable*, the plan adds an **extra margin** itself on top of your own safety margin: the average deviation per block of 3 hours, at most 1 kWh. The plan then discharges in slightly fewer expensive quarters and holds a bit more, so the battery runs empty too early less often. The status card then shows for example "extra margin 0.5 kWh". When the forecast is fair or better again, the extra margin goes away by itself.

Learning always goes on, also in shadow mode and also when HBC is not on Dynamic.

## Turning Live on

On the dashboard, turn on **Live**. From that moment, every quarter Batterijplan adjusts HBC's two Dynamic settings as in the table above. Every change goes into the logbook.

**Live off again?** Then Batterijplan puts both settings straight back to your own settings. HBC is then completely as it was before.

## Your own HBC settings

Batterijplan remembers your settings for the expensive and the regular period:
- at the moment you turn *Live* on;
- and every time you change them while *Live* is off.

It puts those settings back when *Live* goes off or when HBC leaves Dynamic. Nothing remembered yet? Then it puts back *Self-consumption* and *Charge PV*.

Batterijplan only steers where that fits:
- the **expensive period** only if your setting there is *Self-consumption*;
- the **regular period** only if your setting there is *Charge PV*.

If you use **Sell** (exporting for money) in the expensive period, for example, Batterijplan leaves that period alone. HBC then does its own work.

## When HBC is not on Dynamic

If you (or an automation, for example at a negative price) choose another strategy in HBC, then:
- Batterijplan is paused: the plan card says "Batterijplan is paused: HBC is set to …";
- the counter adds nothing;
- if *Live* was on, Batterijplan puts the two Dynamic settings back to your own settings;
- learning simply goes on.

As soon as HBC is back on Dynamic, the plan recalculates straight away and starts steering again.

## Advice for HBC

In HBC you fill in how much solar energy your house uses up directly by itself in a day (*Solar reserved for house*). HBC calculates: expected sun minus that number is what is left for the battery; HBC charges the rest from the grid in the cheap block.
- If the number is **too high**, HBC charges more from the grid than needed.
- If it is **too low**, the battery is too empty in the evening for the expensive hours.

The right number differs per day and per season. Every day Batterijplan works out how much your house can use from the sun: per half hour, the smaller of your learned usage and the expected sun (Solcast, middle estimate). It compares the average of the last 7 days with your setting. Only at a difference of 1 kWh or more do you get advice, rounded to half a kWh. **Batterijplan never changes the setting in HBC itself.**

## The counter: what does it earn

Every quarter Batterijplan settles the previous quarter:
- **Holding:** the charge counts at the average price of the expensive quarters the plan later uses it for.
- **Discharging in an expensive quarter:** the difference with what HBC alone would have done.
- **Surplus discharging:** only the charge that really came out of the battery (no more than planned). What you therefore do not have to buy, minus what it costs to charge that energy back at the cheap moment.

All amounts include VAT. **Shadow** counts separately from **live**. It remains an estimate; your energy bill is the real proof.

**Bare or all-in prices.** If HBC gives bare market prices, Batterijplan adds the energy tax, the purchase fee and the VAT itself. If HBC gives all-in prices, choose *all-in* under *Prices from HBC*: Batterijplan then calculates with the price as it is.

## Comparison with HBC alone

In the *Price and battery* chart, Batterijplan also works out how the charge would have gone if HBC had done it alone: discharging in every expensive quarter, in turn. That is the red dotted line. The chip *Extra vs HBC alone* is the estimated difference in euros for that day.

## What it does not do (yet)

- **Extra charging at night by itself:** this is only calculated and shown.
- **A cheap afternoon that HBC does not mark as cheap** (because of the limit on hours per day or the minimum price difference in HBC) does not count as topping up.
- **Difference between weekdays and weekends** in usage.
- **Selling to the grid for money** (Sell): Batterijplan is aimed at your own usage. If you use Sell in HBC, Batterijplan leaves that period alone (see [Your own HBC settings](#your-own-hbc-settings)). What Sell earns is not shown by Batterijplan (yet).
