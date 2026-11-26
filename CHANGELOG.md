# Changelog

## 2.0.0 — Glorify (full release)

All changes since the last full release 1.1.0, including everything from the test version 2.0.0-dev1. Nederlands: [WIJZIGINGEN_v2.0.0.nl.md](docs/WIJZIGINGEN_v2.0.0.nl.md) · Deutsch: [AENDERUNGEN_v2.0.0.de.md](docs/AENDERUNGEN_v2.0.0.de.md)

### New

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

### Improved

- **The country comes from Home Assistant** (Netherlands, Belgium or Germany; any other country counts as the Netherlands). The country decides the off-peak hours, the public holidays and the words you see. For the German rules the country in Home Assistant must be Germany.
- **The solar advice is in whole kWh.** The advice *Solar reserved for house* is rounded to whole kWh, because HBC only takes whole kWh. The orange dot and the automatic adjustment of HBC only react to a difference of 1 kWh.
- A change of your contract, of the Flanders switch or of your own limit is applied to HBC at once.
- Amounts on the dashboard are shown with two decimals.
- The timeline names the day relative to now: *today*, *tomorrow*, then the name of the weekday.
- The line *Solar cautious* in the plan chart shows the value with the growing safety margin.
- The advice for the HBC settings looks back without counting today's dark days.

### Fixed

- **No more switching back and forth on a recalculation.** A new calculation in the middle of a quarter no longer makes HBC switch between *Charge* and *Dynamic*. There is at most one switch per quarter. If you turn Live or the rule off, HBC goes back at once.
- The deviation of the battery charge sometimes showed "+610 %". That no longer happens when the expected charge is unknown or zero.
- With a fixed contract the mode showed *shadow* while Live was on.
- After a restart in the middle of a quarter, the unmeasured part counted as zero. As a result HBC's import limit could end up at 25 kW. That part now counts at the target limit.
- After a restart the battery-charge chart was empty. It is now filled from Home Assistant's history.
- The number of prevented peaks also counted limit reductions that were never actually written to HBC.
- A contract change from the dashboard was not always applied to HBC's strategy and limit at once.
- Prices were stored rounded to four decimals.
- Some explanation windows (*How to read this?*) showed loose asterisks around words. They are now shown in italics.

### Removed

- The country choice in the settings. The country now comes from Home Assistant.
- The trial mode of the first test versions. *Flanders on* does the same in every country.

**What happens once when you update**
- If your country was Belgium, the *Flanders* switch is turned on.
- A *day/night* contract from a test version becomes *Fixed* with a *dual rate*.
- The country choice and the trial mode disappear, together with their entities.
- The learned use, the counter and all your other settings stay.
- The weekday profile and the solar forecast check start from zero.

### Documentation

- New chapter *07 · Contracts, off-peak hours and Flanders*, with the sections *Which contract do I choose?* and *What do you set in HBC?*.
- New chapter *08 · Smarter calculation*: solar margin, dark days, the reserve that learns, use per weekday, charging in any cheap quarter, the sell reserve, and the old and new names.
- The installation guide describes updating to 2.0.0 as a normal release.
- The dashboard guide has a section *New in 2.0.0*.
- The README points to the new chapters and to this list.
- All texts are available in Dutch, English and German.
- There are new automated tests for all new calculation parts and cards.

## 2.0.0-dev1 — pre-release for testers

**Pre-release.** Meant for testers, especially in Flanders. The latest full release stays 1.1.0. Nothing is lost when you update; you can go back to 1.1.0 in HACS.

**New**
- **Kind of contract.** *Fixed* or *Dynamic*, and with *Fixed* a *single* or *dual* rate. *Dynamic* works as before. With *Fixed* there is no plan on price: HBC stays on Self-consumption (NOM); in the off-peak hours of a dual rate it goes to Charge, **only when that pays**.
- **Night charging pays only above HBC's threshold.** The rate difference (normal − off-peak) must be at least HBC's own *Dynamic threshold delta* (the same helper as for a Dynamic contract, no value of its own). Otherwise HBC stays on Self-consumption. In Flanders, charging in the off-peak hours may also fill the reserve for peaks, whatever the price difference, but only under the target limit.
- **Off-peak hours.** Night hours (default 23:00–07:00 in the Netherlands, 22:00–07:00 in Belgium) and a switch for weekend and public holidays off-peak all day (default on in the Netherlands, off in Belgium; Dutch and Belgian public holidays).
- **Prices.** Price, normal rate and off-peak rate per kWh with five decimals in the settings (two on the dashboard), and a **feed-in price** (HBC has no helper for it). *Earnings* under a Fixed contract values the battery at your prices.
- **Flanders (capacity tariff).** A switch, off by default and independent of the Home Assistant country. It turns on the quarter-hour calculation from the grid power sensor, the monthly peak, the target limit (highest of the monthly peak so far, 2.5 kW and your own limit), the HBC import limit per quarter (only while Live is on; your own HBC values are remembered and restored) and the display in kW. New settings: capacity tariff (EUR/kW/year) and an own limit in kW.
- **Cards *Peak this month* and *Running quarter*** in a window that is only visible with Flanders on. Monthly peaks of the last 12 months **with and without the battery**, the saving per month (difference in kW × tariff ÷ 12), the averages Fluvius counts and the saving per year. *Without battery* is grid import plus battery power.
- **Main screen under a Fixed contract.** Briefing with the contract, the price now, when charging from the grid starts or why it does not pay, and the weekend rule; the four plan rules greyed out; the rules block shows *Night charging*, *Weekend and public holidays off-peak* and *Flanders* (name and on/off only). The chart shows the **measured charge**, the **expected charge** for the next 30 hours (simulated per quarter), the sun forecast, the off-peak hours as a band and a **coloured action bar** per quarter (blue grid, green discharging for the house, yellow solar, grey nothing). A short **timeline** under *What the battery does*.
- **Report and window Today for every contract form.** Under a Fixed contract: contract, prices, off-peak hours, whether night charging pays, NOM behaviour and self-consumption via the battery. With Flanders on the report has a section *Capacity tariff*.
- **Settings.** New tabs *Contract* and *Flanders*; rows that do not apply are greyed out with a short reason.
- **New entities:** `select.batterijplan_contract_soort`, `select.batterijplan_tarief`, `number.batterijplan_prijs_vast`, `_prijs_dag`, `_prijs_nacht`, `_terugleverprijs`, `_nacht_van`, `_nacht_tot`, `_capaciteitstarief`, `_eigen_grens` (kW), `switch.batterijplan_dal_weekend`, `switch.batterijplan_vlaanderen`, `sensor.batterijplan_piek_maand`, `sensor.batterijplan_kwartier`.

**Changed**
- **The country comes from Home Assistant** (NL, BE or DE; anything else counts as the Netherlands). It decides the off-peak hours, the public holidays and the words (normal / off-peak rate, day / night price, HT / NT). **Germany: the Home Assistant country must be DE.**
- Amounts on the dashboard are shown with two decimals.
- **Solar reserved for house: whole kWh.** The advice is now rounded to whole kWh (half up) instead of 0.5 kWh, because HBC's field only takes whole kWh. The orange dot, the status line and *Auto-adjust HBC settings* now count a difference of at least 1 kWh (was 0.5 kWh), so there is no more dot for a value you cannot set.

**Removed**
- The country setting (`select.batterijplan_land`) and the trial mode switch of the earlier test builds. *Flanders on* in any country does what the trial mode did.

**Fixed**
- "+610 %": the deviation of the battery level is no longer shown when the expected level is unknown or zero.
- The mode showed *shadow* under a Fixed contract while Live was on.
- After a restart in the middle of a quarter the unmeasured part of that quarter counted as zero, so the HBC import limit could be set to 25 kW. It now counts at the target limit.
- The battery-level history is filled from the recorder after a restart.

**Updating.** Update in HACS (pre-release), then restart Home Assistant. A stored country **BE** turns the *Flanders* switch on, the country setting and trial mode disappear (with their entities), a contract *day/night* of an earlier test build becomes *Fixed* with a *dual rate*. Learned usage, the counter and all other settings stay.

**Tests**: `tests/test_peak.py` (quarter average, monthly peaks, target limit, off-peak hours and public holidays, night-charging decision, simulation, migration), `tests/test_piek_cards.mjs`, `tests/test_velden_grijs.mjs`, `tests/test_vast_cards.mjs` and `tests/test_vandaag_cards.mjs` (cards, report and window Today for Fixed, Flanders and Dynamic; Dutch, English and German).

**Docs**: new chapter *07 · Contracts, off-peak hours and Flanders* (EN/NL/DE); installation guide: installing a pre-release; dashboard guide: what is new.

## 1.1.0 — Midnight Sunshine

**Added**
- **Today window.** Saved so far (from 00:00 until now), still expected until 24:00 and the day total, with a chart over the calendar day (solid = saved, dashed = expected) and today plus the last 7 days with the average and the best day. Opens with the new *Today* button or by tapping the saving in the chart header. New card file `batterijplan-vandaag-cards.js`.
- **Capacity advice (experiment).** Every night one record per complete calendar day: what the expensive quarters needed, what the battery could deliver, and what the plan would have earned on top of HBC alone for every usable capacity from 3 to 20 kWh (same prices, use and sun; charge left at 24:00 valued at the day's cheapest purchase price). The window shows a chart of up to 28 days (needed in purple on top, available in light yellow, the rolling ideal as a green dashed line), the neutral counts and the table *How well does your battery fit?* per year (up to 5), quarter and month of the running year: your battery, earned, possible, used, missed and the optimum of that period. Only real days are added up. Day records are kept for 5 years and are part of the Home Assistant backup. New module `capacity.py`, card file `batterijplan-capaciteit-card.js` and sensor `sensor.batterijplan_capaciteitsadvies`.
- **Switch `switch.batterijplan_experiment_capaciteit`** (*Capacity experiment*, in *Settings → Expert*, on by default). Off: no new days are measured and the *Capacity* button disappears; everything already measured is kept. On again: missed days are filled in as long as the usage data is still there.
- **Capacity button** at the far right of the button row, with a blue border because it is an experiment.
- **Earnings per period.** *What does it earn* has the tabs Days, Weeks, Months, Quarters and Year, from new to old with a trend arrow and a bar, plus *Export to spreadsheet (CSV)* with one line per day since the start.
- **Report:** a capacity section (years, a quarter grid over 3 years and the months of the running year) when the experiment is on.
- **In the battery now** shows the expected charge below it, coloured by the difference.

**Changed**
- **Chart header:** *Still to save until end of &lt;today|weekday&gt; (24:00)* instead of *Expected saving*, also in the plan card and the report.
- **Earnings count only live.** The total is what Batterijplan earned while *Live* was on. A one-time migration sets the stored total to the live part.
- The sensor `sensor.batterijplan_voorspelling_kleur` is no longer listed in the report.

**Fixed**
- **Report:** the forecast verdict is translated (it showed *zeer goed* in English and German), numbers follow your language (27,2 ct and 1.127 W instead of 27.2 and 1127.0) and the contract start date is written as 26-10-2026.

**Docs**
- New chapter [06 · Capacity advice](docs/06-capacity.md) in English, Dutch and German. The dashboard chapter and the READMEs have new screenshots and an animation, made with demo data.

Nothing changes for HBC: Batterijplan still never touches HBC's flows or code.


## 1.0.1 — clearer end time of the plan

**Fixed**
- **End time of the plan.** The briefing showed the end of the plan one day too early ("Until Fri 00:00" while the plan ran to the end of Friday), and the chart header wrote the same moment in another way. Both now say "until end of Friday (24:00)", in Dutch, English and German.

Nothing changes for the plan, the sensors or HBC.

## 1.0.0 — first full release

**Added**
- **Country setting** for Germany (fixed feed-in tariff) and Belgium/Flanders (capacity tariff, uses the HBC import limit), next to the Netherlands.

**Changed**
- **Calmer plan at nearly equal prices.** A switching cost of 2 ct between holding and selling back, so the plan no longer flips for a fraction of a cent.
- **Readable in light mode.** Darker colours for the plan card and legend in Home Assistant's light theme. The dark theme is unchanged.
- **Time zone from Home Assistant.** Read without a blocking call (review feedback).

Everything from rc3 through rc7 is included.

## 1.0.0-rc7 — HACS review: security and escaping (release candidate)

Audit before the request for the HACS default list. Nothing changes for the plan, the sensors or HBC.

**Fixed**
- **Cards: escaping.** `batterijplan-plan-card`: the card option `titel` went unescaped into `innerHTML` (now escaped). The plan points of the configured `entity` (any entity can be configured) are reduced to numbers and the action letters L, O, H, V, Z before anything is drawn, so no attribute text can reach the HTML. `batterijplan-cards.js`: the quarters at *Bijladen van het net* (status/advice card) and the three quarter counters of the old earnings card came straight from state attributes into `innerHTML` (now escaped); the *Live* label too.
- **Text settings** (sensors for grid, solar, battery, EV, solar forecast) accept only a `sensor.` entity id or empty, anything else is refused with a message. The value is only ever read as a sensor state; the form already used a sensor picker.
- **Unload.** Timers and listeners are only stopped when the platforms really unloaded. The plan card disconnects its ResizeObserver, and an open explanation window of a card closes (with its keyboard listener) when the card is removed.

**Checked, nothing to change**
- Nothing is written to `/config/www` or anywhere public. Data lives only in `.storage` (two Store files); the static path `/batterijplan_frontend` serves `frontend/` (code and images only) and the integration never writes there. No reports, exports or logs are stored; the report and the CSV are built in the browser and downloaded.
- Service calls: only `input_select.select_option` and `input_number.set_value` on the fixed HBC entities, plus `logbook.log`. Domain, service and entity id never come from a setting, text, select or number entity.
- No own websocket commands, views or services. The built-in dashboard is read-only (YAML mode).
- No blocking I/O in the event loop (file reads and the planner run in the executor), no personal data in the log.

**Tests**: `tests/test_security.py` (no file writes, fixed service targets, no own views, sensor-id check, manifest/hacs.json) and `tests/test_escaping.mjs` (hostile config, states and attributes through every card and the report: nothing unescaped in `innerHTML`).

**Docs**: README and installation guide (EN/NL/DE): first search for HBC Batterijplan in HACS, custom repository as the fallback.

## 1.0.0-rc6 — solar forecast for HBC, advice and auto-adjust for the HBC settings, live charge (release candidate)

rc5 was never published, so this release contains everything since rc4.

**New**
- **Sensor `sensor.batterijplan_zon_voor_hbc` (solar forecast for HBC)** lets HBC stop its grid charge at the level the plan wants. Value = `reserved + max energy - target`: *target* is the planned charge (kWh above the discharge cut-off) at the end of the coming consecutive grid-charge block, *reserved* is `input_number.house_battery_solar_reserved_for_house`, *max energy* is `input_number.house_battery_total_max_available_energy` (the capacity setting while HBC has not filled it). A target at or above max energy gives a full charge.
- **Pass-through.** Whenever Live is off, HBC is not on Dynamic, the rule *charge* is off, there is no plan, or reserve/maximum are unknown, the sensor reports the real forecast source 1:1, so HBC behaves exactly as without Batterijplan. The source is the entity HBC pointed to before (remembered whenever `input_text.house_battery_strategy_solar_forecast_entity_id` is not this sensor, and stored), otherwise Solcast *remaining today*. The attributes `modus` (`laaddoel` or `doorgifte`), `reden` and `bron` show what it does.
- Updated at every plan run (30 s before each quarter) and on every change of Live, strategy, rules, reserve or maximum, so HBC's template (refresh at :00, :15, :30, :45) picks it up for the new quarter.
- **Only works with HBC charge goal *solar forecast*** and with the HBC pointer set to this sensor by hand. HBC has no hysteresis on this goal: it may toggle around the target. Batterijplan never changes HBC or its settings.
- **Solcast names (issue #6).** Two optional fields in Settings, *Solar forecast today* and *Solar forecast tomorrow*; a filled field always wins. Otherwise automatic: Solcast by platform (language-independent), then the known ids in the order English, Dutch, German. The chosen ids are attributes of `sensor.batterijplan` (`zon_vandaag`, `zon_morgen`, `zon_rest_vandaag`) and the cards use those. The report says *not found* only when automatic and fields both fail, with the tip to fill the fields.
- **Tooltip on the chart** (`batterijplan-plan-card`): hover with the mouse or tap on a phone. A vertical line follows the pointer and a box shows, for that quarter, the time, bare price (ct), expected solar in kW (normal and cautious estimate), charge HBC and Batterijplan (kWh) and the actions of both (Dutch, English, German). Only the line and the box move; the card is not redrawn. The plan points now carry the cautious solar estimate as a ninth value.
- **Advice for the HBC settings *cheapest hrs* and *expensive hrs*** (next to *Solar reserved for house*). From now on Batterijplan keeps, per quarter and for 7 days (persistent, compact, own storage file): the bare HBC price, the measured house use and the measured solar. Once a night (03:10, in the executor, and once after a restart if the day's calculation is missing) it replays those 7 days with its own planner (Live on, current rules) for a coarse grid of candidates (whole hours from 0 up to 12 or the helper maximum, plus the current value, always inside the helper's min / max / step) and picks the pair with the lowest total grid cost. Each replayed day starts with an empty battery, and the charge left at the end of a day is valued at that day's cheapest purchase price (the same convention as the earnings of the plan), so charge that is left over is not counted as a loss. Equal results (less than 1 cent over the 7 days) go to the value closest to the current one. The search is pruned (cheapest hours with expensive fixed, then expensive, at most two rounds; every distinct set of marks is planned once), so a calculation takes about 8 seconds of processor time on a normal system. Until 7 full days are stored the status is *measuring day x of 7* and nothing changes.
- **Exact replica of HBC's marking** (`hbcmarks.py`, port of the flow node *Determine dynamic strategy*, HBC v4.15.1): per local calendar day the quarters are sorted by price (stable), `lo` and `hi` walk inward while the spread is at least the threshold delta (whole cents), capped per day by `round(hours x quarters per hour)` (0 hours = no cap). A test reproduces the real marks of `sensor.hbc_energy_prices_data` (8 h / 8 h / 6 ct) quarter for quarter.
- **Switch `switch.batterijplan_hbc_auto`** (*Auto-adjust HBC settings* / *HBC-instellingen automatisch* / *HBC-Einstellungen automatisch anpassen*), default **off**, remembered over restarts. On: your own values of the three HBC settings are remembered first, then each setting is set to the advice, only when it differs by at least 1 hour (cheapest, expensive) or 0.5 kWh (solar reserved), snapped to the helper's step and limits. Off: your own values come back exactly. Every change (and every restore) is a logbook entry. If you change one of the three settings yourself while the switch is on, that value becomes your new own value (restored when the switch goes off); Batterijplan's own writes are recognised by their context and are never taken for yours, and your value is not overwritten straight away (the next nightly advice may adjust it again; logbook entry).
- **Sensor `sensor.batterijplan_advies_hbc`** (status `meten`, `berekend`, `niet_beschikbaar`, `geen_zon`; attributes with current value, advice and *differs* per setting, the 7 days replayed, saving in euro, runtime) and the card *Advice for HBC* now shows all three settings: current, advice, a one-line reason and an orange dot when they differ, also when the switch is off. The button *Advice HBC* gets the same dot.
- **Live charge level**: *In de batterij nu* is recomputed with the plan's formula (`plan.stored_energy`) whenever a battery SOC or discharge cut-off changes (debounced, at most once per 5 seconds, no plan run), instead of only at the plan recalculation before each quarter. It lives only in the small sensor `sensor.batterijplan_lading` (state = live charge in kWh, rounded to 0.1 kWh, so it only writes when it changes by that much, and shown with one decimal in the cards; attribute `lading_plan` = planned charge). The big plan sensor `sensor.batterijplan` is not touched by it (no extra database writes); its attribute `lading` and the chart keep the plan values. The cards read the live value from `sensor.batterijplan_lading` (`_2` first when a second Batterijplan exists) and fall back to the plan value.
- **Lighter recorder load**: the large or constantly changing attributes (`punten`, `uitleg`, `versie`, the Solcast names, `kosten_hbc`, `kosten_plan`, `lading`, `start`, `komend_kwartier`, `lading_plan`, `eur_live`, `eur_schaduw`, `kwartieren_*`) stay in the state machine for the cards but are no longer written to the recorder database (`_unrecorded_attributes`). The decisions (`actie`, `hbc_actie`, `modus`, `hbc_strategie`) stay recorded. Nothing reads the history of the excluded attributes (the cards' history calls use `no_attributes`, statistics use the state). On a typical system this takes the attribute data of `sensor.batterijplan` from about 690 kB to a few kB per day. A test guards the list.
- The plan accepts measured house use and solar per quarter, a horizon and a coarser level grid for the replay; without those options the plan is unchanged (test).

**Rules**
- Batterijplan may change HBC *settings* (the three helpers above), and only with the new switch on. It never touches HBC flows, code or packages.

**Fixed**
- The chart and briefing (`batterijplan-plan-card`) now also read `sensor.batterijplan_2` when it exists, like the status card.
- `sensor.batterijplan_zon_voor_hbc` had the device class *energy* together with the state class *measurement*, which Home Assistant does not allow (warning in the log). The sensor now has no device class and keeps its unit (kWh) and state class, so nothing changes for HBC or the statistics. All other sensors were checked: no other combination is invalid.

## 1.0.0-rc4 — entity names fix (release candidate)

**Fixed**
- **All entities showed the name *Batterijplan*.** Each entity now has its own translated name (Dutch, English, German). The entity ids are unchanged, so history, automations and cards keep working. Closes #4.

## 1.0.0-rc3 — now a Home Assistant integration, new rules, cards built in (release candidate)

**Also in rc3 (after the first live days)**
- **Grid charging in blocks of at least 30 minutes.** A single cheap quarter was too short for HBC to start charging; the plan now keeps a started grid-charge block going for at least two quarters (part of the optimisation, not added afterwards).
- **Advice for HBC is part of the integration.** New sensor `sensor.batterijplan_advies_zon_na_goedkoop_laden` (expected house use covered by solar after the first cheap quarter of the day) and the card *Advice for HBC* behind the button in the button row. The status card shows *Advice house consumption* only after 7 days of measuring (7-day average).
- **Button row order:** Earnings – Report – Advice HBC – Settings – Sensors.
- **Settings:** back-up, restore and defaults are real buttons with a confirmation; the four rules are on/off switches that the briefing shows right away.
- **Shadow value only while Live is off.** The shadow counter starts at zero for every new shadow period and keeps at most 30 days.
- **This contract year** counts everything since the counter started when that lies inside the contract year (after a take-over it missed the taken-over part).
- **Numbers follow the number format of the Home Assistant user profile** (comma or point).
- **Season picture:** tap the logo on the status card to see the season picture (spring, summer, autumn, winter).
- Shorter texts on the status card (no time behind *Coming quarter*, short HBC mode names).

**New**
- **Planning by dynamic programming.** The plan now looks at the whole price horizon at once (charge level in steps of 0.05 kWh) and only picks actions HBC can really execute: cheap quarters *Charge*, *Charge PV* or *Standby*; regular quarters *Charge PV*, *Self-consumption* or *Standby*; expensive quarters *Self-consumption*, *Standby* or *Sell*. No more grid charging in regular quarters. Wear (the HBC threshold delta) is counted per discharged kWh; the end charge is valued at the cheapest purchase price. The earlier rule set is kept as `plan_heuristiek`.
- **Entity ids stay plain.** While an older package owns the plain id, ids get a `_2` (never a doubled name); they are restored when the id is free.
- **A real integration, installed with HACS.** The YAML package, the `www` folder and the dashboard resource are gone. Add it under *Settings → Devices & services → Add integration → Batterijplan*. Category in HACS: *Integration*.
- **Config flow.** One form asks for the grid and battery power sensors, solar (optional) and EV charger (optional), the usable capacity, the safety margin, *Prices from HBC* (raw or all-in), the supplier mark-up per kWh excl. VAT and the contract start date.
- **Expert settings** in the options flow (*Configure*): VAT, feed-in add-on, daytime feed-in bonus and the hours of that bonus.
- **New rules** in plain words, each with its own on/off switch: *charge from the grid*, *discharge outside HBC hours*, *hold*, *feed in*. One threshold: the HBC setting *Dynamic threshold delta*. Costs are counted without net metering, with purchase and feed-in each at their own price.
- **Steers HBC's three Dynamic modes** (expensive, regular, cheap) for the coming quarter, only with *Live* on and HBC on *Dynamic*. Your own modes are remembered and put back.
- **Cards and dashboard built in.** The integration serves its own cards (no dashboard resource) and its own dashboard at `/batterijplan`, in the sidebar: buttons *Earnings*, *Settings* (*Basic · Rules · Expert*), *Report* and *Sensors*, a status card, a briefing in two columns with the rules on the right, and a chart with HBC alone and Batterijplan across the full width.
- **Card language option.** Every card accepts `taal: nl|en|de`, which goes before the language of your profile. The plan card now speaks Dutch, English and German.
- **Counter *added value*** (`sensor.batterijplan_meerwaarde`), per quarter, an estimate, only with *Live* on and HBC on Dynamic. A second counter per contract year (`sensor.batterijplan_meerwaarde_periode`).
- **Take over from the package.** If the old package is still there, the setup offers *Take over from the Batterijplan package*: it takes over the settings, the learned usage profile and the counter. See *Upgrading from the package* in the installation chapter.
- **Settings as entities** (`number`, `select`, `date`, `text`, `switch`) with the same ids as the old helpers, so history and your own cards keep working.
- **Documentation** rewritten for the integration, in three languages.

**Improved**
- Learning over 7 days and the forecast per block of 3 hours work as before, now inside the integration.
- The ids of the new entities are put back to the normal names at the first restart after the package is removed.

**Removed**
- The old rules (surplus discharging, charging when needed, the fixed limit of € 0.10), the *Advice for HBC* with `sensor.batterijplan_advies_*`, the setting *efficiency* (the threshold of HBC covers it), the buttons *Make back-up*, *Restore back-up* and *Defaults* (the configuration entry keeps everything).

**Note when updating**
- From the package (1.0.0-rc1/rc2): make a back-up, install the integration, choose *Take over from the Batterijplan package*, then remove the package, `www/batterijplan` and the dashboard resource, remove the old dashboard and restart Home Assistant.
- Recorder with an include list: replace `input_boolean.batterijplan_live` by `switch.batterijplan_live`.

## 1.0.0-rc1 — knoppenrij, vergelijking met HBC alleen, sneller leren (release candidate)

**Nieuw**
- **Knoppenrij met vensters.** Bovenaan één rij over de volle breedte: de schakelaar *Live* vooraan (groen als hij aan staat), daarna *Opbrengst*, *Advies HBC*, *Instellingen* en *Sensoren*. Die openen als venster over het scherm. Een oranje stip betekent: hier is iets te doen. De schakelaar *Instellingen tonen*, het logo bovenaan en de badges zijn weg; de hele pagina past op één scherm.
- **Statuskaart met logo** naast *Plan vandaag en morgen*.
- **Vergelijking met HBC alleen:** de grafiek toont als rode stippellijn hoe de lading was verlopen zonder Batterijplan, met een chip *Extra t.o.v. HBC alleen* in euro.
- **Datumkiezer in de kopregel van de grafiek**, rechts. De grafiek is lager, zodat alles op één scherm past.
- **Prijzen van HBC:** nieuwe instelling *kaal* of *all-in*. Bij all-in telt Batterijplan zelf geen belasting, opslag en btw meer op.
- **Jouw eigen HBC-standen** voor de dure en gewone periode worden onthouden (bij *Live* aan, of als je ze verandert terwijl *Live* uit staat) en teruggezet bij *Live* uit of als HBC Dynamic verlaat.
- **Batterijplan blijft van Sell af:** stuurt alleen bij in de dure periode als jouw stand daar *Self-consumption* is, en in de gewone periode als die *Charge PV* is.
- **Nieuwe sensor** `sensor.batterijplan_prijs`: de prijs van het huidige kwartier volgens HBC, voor de geschiedenis in de grafiek.
- **(i) opent een venster** *Hoe lees je dit?* met **‹ Terug**.
- **Alles in de huisstijl:**
  - eigen invoervelden in *Instellingen*: schuifbalk, keuzeknopjes en − waarde +;
  - **sensoren kiezen uit een lijst**: tik op een sensorveld en je krijgt de vermogenssensoren uit je eigen Home Assistant, de meest waarschijnlijke bovenaan, met wat ze nu melden; typen filtert, zelf typen kan ook;
  - *Instellingen* heeft twee tabbladen: **Basis** en **Expert**;
  - elk veld heeft een eigen (i);
  - de statuskaart is een eigen kaart, met een (i) bij elke regel;
  - een eigen *Live*-schakelaar;
  - de vensters hebben ‹ Terug en ✕.
- **De back-up bewaart nu ook** de ingangsdatum en *Prijzen van HBC* (10 instellingen).
- **Terugzetten en standaardwaarden vragen eerst** "Zeker? Tik nog een keer".

**Verbeterd**
- **Sneller leren:** klaar na 7 dagen in plaats van 14 (een proef op 89 dagen echte meetdata gaf met een kort geheugen een betere voorspelling).
- **Voorspelling per blok van 3 uur**, met alleen een oordeel: *wisselvallig*, *redelijk* (vanaf 55 %), *goed* (vanaf 65 %), *zeer goed* (vanaf 75 %) of *uitstekend* (vanaf 85 %), lichtgroen tot het donkerste groen.
- **Extra marge bij wisselvallig verbruik:** is de voorspelling wisselvallig, dan rekent het plan zelf met extra marge (de gemiddelde afwijking per blok van 3 uur, maximaal 1 kWh). De statuskaart laat zien hoeveel. Wordt de voorspelling beter, dan valt die vanzelf weg.
- **Bedragen overal hetzelfde:** meer dan 0 is *+ €* in groen, precies 0 is *€ 0,00* in grijs, minder dan 0 is *– €* in oranje.
- **Kleur voor overschot ontladen** is nu paars, duidelijk anders dan het groen van ontladen.
- Labels *ct* en *kWh* staan niet meer over de bovenste getallen van de grafiek.

**Opgelost**
- Een klik op een knopje bovenaan ging soms verloren, omdat de knoppenrij steeds opnieuw werd opgebouwd.
- Het plan bleef na een herstart soms hangen op een oud kwartier (het werd als tekst bewaard).
- *t is not a function* bij aanwijzen in de kaarten.
- *Huisverbruik nu* werd 's nachts *Niet beschikbaar* bij omvormers die dan niets melden. Zon zonder waarde telt nu als 0 W.
- De prijs in de grafiek komt niet meer van een vaste Nord Pool-sensor, maar van HBC zelf.
- Het icoon *schuifregelaars* was leeg in de zip van 1.0.0-dev1, en het icoon *info* ontbrak.

**Let op bij bijwerken**
- Vervang het pakket, de map `www/batterijplan/` en het hele dashboard, en verhoog het nummer achter de kaarten-bron. Herstart Home Assistant (nieuwe helpers).
- Recorder met include-lijst: zet `sensor.batterijplan_prijs` erop.
- Geeft HBC all-in prijzen? Zet *Prijzen van HBC* op *all-in*.

## 1.0.0-dev1 — nieuw dashboard, drie talen, overschot en advies voor HBC (testversie)

**Nieuw**
- **Nieuw dashboard** in de huisstijl van HESC, met logo en badges bovenaan en eigen kaarten:
  - *Plan vandaag en morgen*: lading nu, hoe lang ontladen en vasthouden, overschot; per dag een balk met tijdas en "Nu"-streep; alleen de momenten waarop Batterijplan iets anders doet dan HBC.
  - *Prijs en batterij*: kale prijs per kwartier, gekleurde vlakken waar Batterijplan bijstuurt, de lading (gemeten en verwacht, uitdovend na het plan). Volgt de datumkiezer: per dag de kwartieren, per week of maand de opbrengst per dag.
  - *Advies voor HBC*: of je HBC-instelling *Solar reserved for house* goed staat, op basis van de laatste 7 dagen. Alleen advies; HBC wordt niet aangepast.
  - *Wat levert het op*: de tellers, met uitleg achter de (i).
  - Elke kaart heeft een (i) met uitleg; cijfers met een stippellijn hebben een korte toelichting bij de muis.
- **Drie talen:** Nederlands, Engels en Duits voor de kaarten (volgt je profiel), het dashboard (één bestand per taal) en de documentatie (`docs/`).
- **Overschot ontladen:** zit er meer in de batterij dan nodig tot het volgende goedkope moment, dan levert Batterijplan dat in de duurste gewone kwartieren aan het huis (gewone stand tijdelijk *Self-consumption*).
- **Stilstand buiten Dynamic:** staat HBC op een andere strategie, dan stuurt Batterijplan niets, telt het niets op en zet het (met Live aan) de twee Dynamic-standen terug naar normaal. Terug op Dynamic: direct opnieuw rekenen en bijsturen. Het leren gaat altijd door.
- **Nieuwe sensoren:** `sensor.batterijplan_lading` (lading in kWh, voor de geschiedenis) en `sensor.batterijplan_advies_huisverbruik`.
- **Iconen in de kaarten zelf** (iconenset `batterijplan:`), dus ook zonder HESC.

**Verbeterd**
- **Eerlijkere teller:** elk kwartier wordt achteraf afgerekend; bij overschot ontladen telt alleen de lading die echt uit de batterij ging.
- **Verbruik leren** toont nu "dag 3 van 14 · alle uren van de dag al gezien" in plaats van een moeilijk getal.
- **Instellingen** in één rij over de volle breedte; *Live* en *Instellingen* zijn tegels zoals de knoppen.

**Opgelost**
- *can only concatenate str (not "int") to str* bij HBC-versies die de starttijd als tekst geven. Starttijden worden nu altijd goed gelezen (getal of tekst).
- Solcast met Nederlandse sensornamen werd niet gevonden. Batterijplan zoekt de Solcast-sensoren nu zelf, in elke taal.

**Let op bij bijwerken**
- Meld de kaarten aan als dashboard-bron en plak het nieuwe dashboard (zie `docs/04-maintenance.nl.md`).
- Recorder met include-lijst: zet `sensor.batterijplan_lading` en `sensor.batterijplan_advies_huisverbruik` erop.

## 0.1.5 — badges, plan in kleur en nieuwe instellingenkaart

- **Badges bovenaan:** *Bespaard totaal*, *Deze energieperiode* (vanaf de ingangsdatum van je contract, elk contractjaar opnieuw) en *Trefzekerheid*.
- **Trefzekerheid:** hoe goed het geleerde verbruik het echte verbruik voorspelt, in procenten, glijdend over 14 dagen. Grijs tijdens het leren (licht → donker), daarna groen (donker groen boven 90 %).
- **Plan komende uren:** nieuwe kaart met een balk per kwartier, begin- en eindtijd, de periode in blokken en een vaste legenda (ontladen, vasthouden, zon laden, rust, laden van het net). Vervangt de grafiek "Besluiten", waarvan de kleuren niet vast lagen.
- **Grafiek met datumkiezer:** de opbrengst per dag, week, maand of jaar, met ‹ › om te bladeren.
- **Instellingenkaart in de stijl van HESC:** knoppen *Back-up maken*, *Back-up terugzetten* en *Standaardwaarden* (zet marge en rendement terug, met eerst een back-up), schakelaars *Live* en *Instellingen*.
- Nieuwe instelling: **ingangsdatum energiecontract**.
- Versienummer in de kop van het dashboard (komt uit het pakket).
- Iconen in de koppen op dezelfde hoogte als de tekst.

## 0.1.1 — back-up en duidelijkere uitleg

- Knoppen **Back-up maken** en **Back-up terugzetten** voor alle instellingen (capaciteit, marge, rendement, opslag en de vier sensoren). De back-up blijft bewaard bij een herstart en bij een nieuwe versie.
- Schakelaar **Sensoren en uitleg tonen**: verbergt de sensorvelden en de uitleg als alles is ingesteld. Zolang er iets ontbreekt, blijven ze vanzelf zichtbaar.
- Kaart Sensoren met een controle: *Huisverbruik nu*.
- Duidelijkere uitleg: sensoren gaan steeds over het vermogen van dit moment in watt (zonnevermogen = wat alle panelen samen nu opwekken, niet de dagopbrengst); voorbeeld voor energiebelasting + inkoop; tip voor een som-helper bij meerdere omvormers; waar je de iconen vindt (in de release-zip); hoe je bijwerkt naar een nieuwe versie.

## 0.1.0 — eerste versie

- Verdeelt de lading over de duurste dure kwartieren tot het volgende goedkope kwartier (op basis van de HBC Dynamic-labels), met geleerd huisverbruik en de voorzichtige Solcast-zonverwachting.
- Restlading: blijft er lading over, dan mag een later duur kwartier die gebruiken.
- Vasthouden via de HBC-stand voor dure kwartieren (Standby / peak shave), ontladen via Self-consumption. Alleen in live-modus en alleen als HBC op Dynamic staat.
- Schaduwmodus: rekent en toont, stuurt niets.
- Huisverbruik leren per uur van de dag over 14 dagen (aan het leren / grof / prima).
- Lading bepaald uit het laadpercentage en de ondergrens per batterij in HBC.
- Advies over extra nachtladen (alleen getoond), inclusief rendementsverlies.
- Geschatte opbrengst bovenop HBC (teller, schaduw en live apart) en dashboard met eigen iconen.
- Veilig gedrag: "Niet ingesteld" of "Geen batterijdata" → het plan houdt niets vast.
