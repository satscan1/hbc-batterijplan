# Batterijplan 2.0.0 — all changes since 1.1.0

*Nederlands: [WIJZIGINGEN_v2.0.0.nl.md](WIJZIGINGEN_v2.0.0.nl.md) · Deutsch: [AENDERUNGEN_v2.0.0.de.md](AENDERUNGEN_v2.0.0.de.md)*

This is the full list of what changes between the last release 1.1.0 and 2.0.0. It also covers everything from the test version 2.0.0-dev1. Batterijplan stays a separate add-on to Home Battery Control (HBC).

## New

**Kind of contract**
- You choose your contract yourself:
  - *Fixed, single rate*: one price all day.
  - *Fixed, dual rate*: a normal and an off-peak rate (in Belgium a day and a night price).
  - *Dynamic*: a price per hour or quarter. This works as in 1.1.0.
- With a fixed contract you also fill in your **feed-in payment**. HBC has no setting for it. The battery's earnings are then calculated with your prices.
- With a fixed contract Batterijplan makes no plan on price. HBC is then on *Self-consumption*: the battery covers your use and charges with solar surplus.
- **Night charging with a dual rate only happens when it pays.** The difference between the normal and the off-peak rate must be at least HBC's threshold. Otherwise the battery does not charge from the grid at night.
- Off-peak hours per country: at night 23:00–07:00 in the Netherlands and 22:00–07:00 in Belgium. A switch makes the weekend and public holidays count as off-peak all day. In the Netherlands that switch is on by default.
- You enter prices with five decimals, as suppliers state them.

**Flanders (capacity tariff)**
- A switch of its own, *Flanders*, off by default.
- It works with **every contract**, so also with a fixed rate, and in every country.
- Batterijplan measures the **peak per quarter**: the average power you take from the grid in each quarter.
- The **target limit follows your monthly peak**. It is the highest of three values: the monthly peak so far, 2.5 kW and your own limit. With Live on, Batterijplan sets HBC's import limit to it every quarter. Your own HBC values come back as soon as you switch Live or Flanders off.
- New cards:
  - *Running quarter*.
  - *Peak this month*, with the **monthly peak with and without the battery** over 12 months and the **saving on the capacity tariff** per month and per year.
- The plan stays under the peak limit. With a dual rate the battery may top up in the off-peak hours as a reserve for peaks, but only under the target limit.
- All power values are shown in kW.

**Smarter calculation**
- **Recognising cheap quarters itself.** This is a new rule, *Charge in any cheap quarter*. It is off by default and only works with a dynamic contract.
  - Batterijplan recognises cheap quarters with the same rule as HBC, but without the maximum number of cheap hours per day.
  - When a charge block falls outside HBC's cheap hours, Batterijplan puts HBC on *Charge* for that block, and back on *Dynamic* afterwards.
  - This only happens when HBC was already on *Dynamic*.
- **Sell reserve automatic.** This is a new rule, off by default, only with a dynamic contract. It was made at a user's request.
  - Batterijplan fills HBC's *Keep energy in reserve* (Sell strategy) with what your house needs until the next cheap quarter, plus the plan's reserve.
  - So HBC sells no more in a Sell quarter than the plan means. The plan chart also uses that reserve.
  - This only works when HBC's *Sell until* is set to *energy reserve*. Batterijplan only writes on a difference of at least 0.5 kWh and at most once per quarter.
  - It is only active with Live on and HBC on *Dynamic* (a *Charge* Batterijplan itself sets counts too). When a condition goes away, or you remove the integration, HBC gets your own value back at once.
- **Solar forecast with a growing safety margin.**
  - For the coming hours the plan uses the halfway point between the normal and the cautious estimate.
  - After 24 hours it uses the cautious estimate.
  - After that it counts 10 % lower per day, down to at most 30 % less.
- **Dark days.** At least two days with hardly any sun may follow the known prices. Then the plan **keeps charge**, up to the expected shortfall of those days.
  - It **tops up** in quarters that are cheaper than average, and picks the cheapest ones itself.
  - In Flanders it stays under the peak limit while doing so.
- **A reserve that learns.**
  - The reserve starts at **20 %** of the capacity.
  - As house use and solar are forecast reliably, it drops to **3 %**.
  - Your own safety margin stays the minimum.
  - Every day Batterijplan compares the morning's solar forecast with the measured solar. Without a solar sensor only the use counts.
- **Use per weekday as a self-test.** Next to the normal profile, Batterijplan learns a profile per weekday and hour.
  - Every quarter both profiles forecast in advance; afterwards it is measured which one was better.
  - The weekday profile is only used when it forecasts at least 10 % better over 14 days.
  - It is stored in Batterijplan's own file, not in Home Assistant's database.

**Screens**
- The main screen with a fixed contract shows:
  - a short briefing with your contract, the price now, the off-peak hours and whether night charging pays;
  - a chart with the measured and expected charge for 30 hours, the sun and the off-peak hours;
  - a coloured bar per quarter and a short timeline *What the battery does*.
- **The Report and the window Today work for every contract form.** With Flanders on they have their own section on the capacity tariff.
- *Settings* has new tabs *Contract* and *Flanders*. Rows that do not apply to your choice are greyed out, with a short reason.

**New names for own cards and add-ons**
- The sensor *Solar forecast for HBC (charge target)* has two new properties:
  - `laaddoel_kwh`: the charge target.
  - `zon_voor_huis`: the solar HBC reserves for the house.
- The old names `doel` and `reserve` stay for now with the same values, so existing cards keep working. They will be replaced later.

## Improved

- **The country comes from Home Assistant** (Netherlands, Belgium or Germany; any other country counts as the Netherlands). The country decides the off-peak hours, the public holidays and the words you see. For the German rules the country in Home Assistant must be Germany.
- **The solar advice is in whole kWh.** The advice *Solar reserved for house* is rounded to whole kWh, because HBC only takes whole kWh. The orange dot and the automatic adjustment of HBC only react to a difference of 1 kWh.
- A change of your contract, of the Flanders switch or of your own limit is applied to HBC at once.
- Amounts on the dashboard are shown with two decimals.
- The timeline names the day relative to now: *today*, *tomorrow*, then the name of the weekday.
- The line *Solar cautious* in the plan chart shows the value with the growing safety margin.
- The advice for the HBC settings looks back without counting today's dark days.

## Fixed

- **No more switching back and forth on a recalculation.** A new calculation in the middle of a quarter no longer makes HBC switch between *Charge* and *Dynamic*. There is at most one switch per quarter. If you turn Live or the rule off, HBC goes back at once.
- The deviation of the battery charge sometimes showed "+610 %". That no longer happens when the expected charge is unknown or zero.
- With a fixed contract the mode showed *shadow* while Live was on.
- After a restart in the middle of a quarter, the unmeasured part counted as zero. As a result HBC's import limit could end up at 25 kW. That part now counts at the target limit.
- After a restart the battery-charge chart was empty. It is now filled from Home Assistant's history.
- The number of prevented peaks also counted limit reductions that were never actually written to HBC.
- A contract change from the dashboard was not always applied to HBC's strategy and limit at once.
- Prices were stored rounded to four decimals.
- Some explanation windows (*How to read this?*) showed loose asterisks around words. They are now shown in italics.

## Removed

- The country choice in the settings. The country now comes from Home Assistant.
- The trial mode of the first test versions. *Flanders on* does the same in every country.

**What happens once when you update**
- If your country was Belgium, the *Flanders* switch is turned on.
- A *day/night* contract from a test version becomes *Fixed* with a *dual rate*.
- The country choice and the trial mode disappear, together with their entities.
- The learned use, the counter and all your other settings stay.
- The weekday profile and the solar forecast check start from zero.

## Documentation

- New chapter *07 · Contracts, off-peak hours and Flanders*, with the sections *Which contract do I choose?* and *What do you set in HBC?*.
- New chapter *08 · Smarter calculation*: solar margin, dark days, the reserve that learns, use per weekday, charging in any cheap quarter, the sell reserve, and the old and new names.
- The installation guide describes updating to 2.0.0 as a normal release.
- The dashboard guide has a section *New in 2.0.0*.
- The README points to the new chapters and to this list.
- All texts are available in Dutch, English and German.
- There are new automated tests for all new calculation parts and cards.
