# 08 · Smarter calculation (2.0.0)

*Nederlands: [08-calculation.nl.md](08-calculation.nl.md) · Deutsch: [08-calculation.de.md](08-calculation.de.md)*

Version 2.0.0 adds six calculation parts. Four work by themselves. Two are rules you turn on yourself: **charge in any cheap quarter** and **sell reserve automatic**. Everything in this chapter is for a *Dynamic* contract unless stated otherwise.

**In short**
- **Solar with a margin that grows.** For the coming hours the plan uses a better estimate than for tomorrow afternoon.
- **Dark days.** When at least two days with hardly any sun follow the known prices, the plan keeps charge and tops up cheaply when needed.
- **A reserve that learns.** The reserve starts ample and shrinks as house use and solar are forecast better.
- **Use per weekday.** Batterijplan also learns per weekday, and only uses that profile when it provably forecasts better.
- **Charge in any cheap quarter** (rule, off by default). Batterijplan recognises cheap quarters itself and may charge in them, also outside HBC's cheap hours.
- **Sell reserve automatic** (rule, off by default). Batterijplan fills HBC's *Keep energy in reserve*, so HBC sells no more in a Sell quarter than the plan means.

## Solar with a margin that grows

Solcast gives a normal and a cautious estimate per half hour. Up to 2.0.0 the plan used the cautious one everywhere. Now it depends on how far ahead the quarter is:

| How far ahead | What the plan counts on |
|---|---|
| now | halfway between the normal and the cautious estimate |
| up to 24 hours | sliding to the cautious estimate |
| after 24 hours | the cautious estimate, 10 % less per further day (never below 70 % of it) |

In the chart this is the line *Solar cautious*.

## Dark days

The plan looks as far ahead as prices are known, usually until tomorrow evening. Solcast also forecasts the days after that (day 3 to 7). When at least **two days in a row** right after the last known price bring hardly any sun (less than a quarter of your expected use), this happens:

- Batterijplan works out the shortfall of those days, for at most three days. The plan keeps up to that shortfall in the battery, never more than the usable capacity.
- This is not a hard rule. For the plan, a kWh below that floor is worth the **average** price of the known quarters, because that is what power you have to buy later costs. So the plan only tops up in quarters cheaper than that average, and picks the cheapest ones itself.
- **In Flanders** the plan stays under the peak limit: the capacity tariff is part of the same calculation.
- Do you only have the sensors of today and tomorrow because you filled in your own solar sensor? Then this part does not work, and the plan calculates as before.
- **With a Fixed contract and a dual rate**, HBC already charges at night up to its charge target, and that target is higher when little sun is coming. Nothing changes there.

You see it in the attribute `donker` of `sensor.batterijplan`: `vloer` (kWh), `dagen`, `tekort`, `reden`, `vanaf`.

## A reserve that learns

The plan always keeps a reserve in the battery that it does not plan to use. It used to be your **Safety margin** only (default 0.3 kWh). Now the reserve learns:

- **Without data** the reserve is 20 % of the capacity.
- **With better forecasts** it drops to at least 3 %. Only the weaker of the two forecasts counts: house use (the reliability you already see on the dashboard) and solar (the morning forecast against the measured solar, over the last 14 days, from 3 days on).
- **Your own Safety margin is the minimum**, the capacity the maximum.

Measuring the solar needs the solar power sensor (*Settings*, *Sensors*). Without it only the use forecast counts.

You see it in `reserve_plan` (`kwh`, `eigen`, `geleerd`, `betrouwbaar`) and `zon_betrouwbaar` (`pct`, `dagen`, `afwijking_kwh`) of `sensor.batterijplan`.

## Use per weekday (self-test)

The normal profile is one average per hour of the day over the last 7 days. Batterijplan now also learns a profile per **weekday × hour**, over the last 4 weeks. The new profile is tested first:

- **Forecast.** Every quarter both profiles forecast the use, **before** the measured use is learned.
- **Compare.** Afterwards the error of both is noted.
- **Choose.** The weekday profile is only used when over the last 14 days (at least 7 days of comparisons) its error is at least **10 % smaller**. Otherwise the normal profile stays.

The profile is kept in Batterijplan's own storage file, not in the recorder. You see the result in the attribute `weekprofiel` of `sensor.batterijplan_verbruiksprofiel`:
- `actief`;
- `fout_week` and `fout_7d`, the mean error in W;
- `kwartieren`;
- `reden`.

## Charge in any cheap quarter (rule)

Under *Dynamic*, HBC only charges from the grid in the quarters HBC itself calls cheap, and at most *Cheapest hours* per day. With this rule on:

- **Recognise cheap quarters itself.** Batterijplan uses the same rule as HBC: the cheapest quarter against the most expensive one, as long as the difference is at least HBC's threshold. Only the **maximum number of cheap hours** is dropped.
- **Charge in them.** The plan may charge from the grid in such quarters when that is cheaper.
- **HBC on Charge.** When a charge block falls outside HBC's cheap hours, Batterijplan puts **HBC's strategy on Charge for that block**, and back on **Dynamic** afterwards. Charge uses the same charge flow and the same charge target as a cheap quarter under Dynamic.
- **Only from Dynamic.** When HBC is on something else you chose (Timed, Full stop, Self-consumption …), Batterijplan does not take over. If you choose another strategy during such a block yourself, it stays.
- **Live off** puts HBC straight back on Dynamic.

The rule is **off** by default, because it switches HBC's main strategy. You find it in *Settings*, *Rules*.

## Sell reserve automatic (rule)

HBC's *Sell* strategy has the setting *Sell until*. When it is set to *energy reserve*, HBC sells at full power until the energy in the battery equals *Keep energy in reserve*. Then HBC continues with *Then use*, for example *Self-consumption*. Batterijplan only says per quarter *that* HBC sells, not how much. With this rule on:

- **Reserve from the plan.** Every quarter Batterijplan works out how much energy your house still needs from the battery until the next cheap quarter. Solar surplus on the way counts. The plan's reserve is added. The number is rounded up to the step of the HBC setting and stays within its minimum, its maximum and the usable capacity.
- **Set in HBC.** With Live on, Batterijplan puts that number in *Keep energy in reserve*. This only happens on a difference of at least 0.5 kWh (or one step of the setting, if that is larger) and at most once per quarter.
- **The plan uses it too.** In the plan chart a Sell quarter stops at that reserve. After that it does what *Then use* does: with *Self-consumption* or *Zero import* the house uses the battery, otherwise the charge stays. This also applies with Live off, so in shadow mode you see what would happen.
- **Your own value comes back.** The first time, Batterijplan remembers your value. The rule is only active with Live on, HBC on *Dynamic*, *Sell until* on *energy reserve* and a dynamic contract. When one of these goes away, or you remove the integration, Batterijplan puts your value back at once and the row shows *not active* with the reason. A *Charge* Batterijplan itself sets for a charge block counts as *Dynamic*: around it the rule stays active. If you change the value yourself while the rule works, that becomes your new own value.
- **Only with *Sell until: energy reserve*.** When *Sell until* is set to something else, the rule does nothing and the status card says why. Batterijplan never changes *Sell until* or *Then use*.

### Example

At 17:00 the expensive evening peak starts and the battery holds 9 kWh. Your house still needs 5 kWh until 02:00, the next cheap moment. In HBC, *Keep energy in reserve* is fixed at 3 kWh.
- **Without this rule** HBC sells down to the fixed 3 kWh: 6 kWh goes. At 21:00 the battery is empty and you buy 2 kWh at the evening price.
- **With this rule** Batterijplan sets the reserve to 5 kWh. HBC sells 4 kWh and your house makes it to 02:00.

The benefit: you only sell what you really have to spare, and you do not buy expensive power back later. Batterijplan's margin (the reserve that learns, with your own *Safety margin* as the minimum) is always added, so the reserve never goes below that margin.

The chosen reserve is on the status card (row *Sell reserve*) and next to the rules in the briefing. For own cards, `sensor.batterijplan` has the attribute `verkoopreserve` with:
- `aan` and `actief`, and `reden` when it does not work;
- `kwh`: what Batterijplan sets in HBC;
- `in_hbc`: what HBC has now;
- `eigen`: your saved own value;
- `plan_kwh`: the house use until the next cheap quarter, without the reserve.

The rule is **off** by default. You find it under *Settings*, *Rules*.

## Names for own cards and HBC+

Since 2.0.0 `sensor.batterijplan_zon_voor_hbc` has the attributes `laaddoel_kwh` (the charge target for HBC) and `zon_voor_huis` (HBC's *solar reserved for house*). The attributes `doel` and `reserve` are **old, replaced by laaddoel_kwh and zon_voor_huis**. They carry the same values and stay for now, so existing cards do not break. The four attributes are always there, also with Live off. When Batterijplan does not steer the charge target (for example with Live off), `laaddoel_kwh` and `doel` are empty (`null`). `zon_voor_huis` and `reserve` are only empty when HBC's value is unknown.
