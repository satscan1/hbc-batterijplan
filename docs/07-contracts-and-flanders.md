# 07 · Contracts, off-peak hours and Flanders

*Nederlands: [07-contracts-and-flanders.nl.md](07-contracts-and-flanders.nl.md) · Deutsch: [07-contracts-and-flanders.de.md](07-contracts-and-flanders.de.md)*

> **Pre-release 2.0.0-dev1.** This chapter describes what is new in the pre-release for testers. The latest full release stays 1.1.0.

**In short**
- You choose your **kind of contract**: *Fixed* or *Dynamic*. With *Fixed* you also choose a **rate**: *single* or *dual*.
- *Dynamic* works as before. With *Fixed*, Batterijplan makes no plan on price: HBC stays on **Self-consumption**, and in the off-peak hours of a dual rate it charges from the grid, but **only when that pays**.
- The **country** now comes from Home Assistant. A separate switch **Flanders (capacity tariff)** turns on the quarter-hour calculation for the Flemish capacity tariff.

## Kind of contract and rate

Open *Settings*, tab **Contract**.

| Setting | What it does |
|---|---|
| **Kind of contract** | *Dynamic*: HBC on Dynamic and Batterijplan makes the plan, as before. *Fixed*: no plan on price. |
| **Rate** (only with *Fixed*) | *Single rate*: one price all day. *Dual rate*: a normal rate and an off-peak rate. |
| **Price per kWh** / **Normal rate** and **Off-peak rate** | Your prices including taxes and VAT. The fields keep five decimals, because suppliers quote five. The dashboard shows two decimals. |
| **Feed-in price per kWh** | What you get for fed-in electricity. HBC has no setting for this, so you enter it here. |

Rows that do not apply to your choice are greyed out with a short reason (for example *Only with a dynamic contract*). Nothing is hidden or removed.

Batterijplan only changes HBC while **Live** is on. It remembers your own HBC strategy and gives it back when Live goes off or you go back to *Dynamic*.

## What HBC does under a Fixed contract

- **Outside the off-peak hours: Self-consumption (NOM, "zero on the meter").** The battery covers the house use and charges with a solar surplus, within the charge and discharge power of your batteries.
- **In the off-peak hours of a dual rate: Charge**, from the grid up to the HBC charge target, **only when it pays** (see below). Otherwise HBC stays on Self-consumption all the time.

### Off-peak hours, weekend and public holidays

- **Night hours:** from *Night starts* until *Night ends*. Default: **23:00–07:00** in the Netherlands, **22:00–07:00** in Belgium. Some grid operators start earlier (Enexis: 21:00): set the hour yourself.
- **Weekend and public holidays off-peak:** a switch, default **on** in the Netherlands and **off** in Belgium. On = Saturday, Sunday and public holidays are off-peak all day.
  - Netherlands: 1 January, Easter Monday, King's Day (27 April, 26 April when the 27th is a Sunday), Ascension Day, Whit Monday, 25 and 26 December.
  - Belgium: 1 January, Easter Monday, 1 May, Ascension Day, Whit Monday, 21 July, 15 August, 1 November, 11 November, 25 December.
  - Other countries: weekend only.

### Does charging from the grid pay?

Charging from the grid in the off-peak hours only pays when the price difference is large enough to cover the losses in the battery. Batterijplan uses one threshold for this, **the same threshold HBC itself uses**: the HBC setting *Dynamic threshold delta* (in ct). It has no fixed value of its own.

- **Difference (normal rate − off-peak rate) at least the threshold:** HBC goes to Charge in the off-peak hours.
- **Difference below the threshold:** HBC stays on Self-consumption. The briefing says: *Charging from the grid does not pay: difference 2.7 ct, threshold 6.0 ct*, and the rule *Night charging* shows *off (not worth it)*.
- **Exception, Flanders on:** charging in the off-peak hours may fill the reserve for peaks, whatever the price difference, but only while there is room under the target limit.

## Country from Home Assistant

The country setting of Batterijplan is gone. Batterijplan reads the country from Home Assistant (*Settings → System → General*): **NL**, **BE** or **DE**; anything else counts as the Netherlands. The country decides the off-peak hours, the public holidays and the words (normal rate / off-peak rate in the Netherlands, day price / night price in Belgium, HT / NT in Germany).

> **Germany:** the country in Home Assistant must be **DE** for the German rules (fixed feed-in tariff).

## Flanders (capacity tariff)

The switch **Flanders (capacity tariff)** (default off, independent of the Home Assistant country) turns on:

- the **quarter-hour calculation** from your grid power sensor (the average per quarter of an hour, like the meter);
- the **monthly peak**: the highest quarter-hour average of your net grid import this month;
- the **target limit**: the highest of your monthly peak so far, **2.5 kW** and your own limit;
- the **HBC import limit** (only while Live is on): inside a quarter Batterijplan sets the allowed import power so that the quarter stays under the target limit (`(budget − already imported) / hours left`, at least 0.5 kW). It writes only when the value changes by more than 100 W and at most once a minute, and at every quarter change it goes back to the target limit. Your own HBC values (limit on/off and value) are remembered and given back when Live goes off or Flanders goes off.
- everything in **kW** with one decimal.

Settings on the tab **Flanders**: the capacity tariff in €/kW/year (default 55) and an optional **own limit** in kW (0 = none).

### The cards *Peak this month* and *Running quarter*

They sit in the window **Peak** and are only visible while Flanders is on.

- **Peak this month:** per day the highest quarter-hour peak (filled line) with the target limit (dotted line), and a grey line for the peak you would have had **without the battery**. Below it the monthly peaks of the last 12 months, newest first, with a trend arrow, the peak **with** and **without** battery and the saving of that month (difference in kW × tariff ÷ 12). Both peaks count at least 2.5 kW, as Fluvius counts. Underneath: the average of the last 12 monthly peaks with and without the battery, and the saving per year.
- **Running quarter:** the average so far, what is still allowed, and the HBC limit that is set now.

*Without battery* is your grid import plus the battery power (discharging +, charging −), with the same quarter-hour calculation.

## The main screen under a Fixed contract

- **Briefing:** contract and rate, the price now, when charging from the grid starts or stops (or that it does not pay), the weekend rule, the feed-in price and, with Flanders on, the monthly peak. The four rules of the plan are greyed out (*Only with a dynamic contract*). The block *Rules* shows *Night charging* and *Weekend and public holidays off-peak* with a dual rate, and *Flanders* when it is on: name and on/off only.
- **Status card:** the HBC strategy as *Self-consumption (normal rate)* or *Charge (off-peak rate)*, and the price now with two decimals.
- **Chart:** the **measured charge** of the last hours, the **expected charge** (dashed) for the next 30 hours, the sun forecast and the off-peak hours as a background band. Under the chart one coloured bar per quarter: **blue** charging from the grid (off-peak), **green** discharging for the house (NOM), **yellow** charging with solar, **grey** nothing (battery empty or full). The expected charge is a simulation per quarter: outside the off-peak hours Self-consumption with your learned house use and the solar forecast, in the off-peak hours Charge up to the HBC charge target when it pays. Losses are not modelled.
- **Timeline** under *What the battery does*: for example *Now: covers your house use (NOM) · expected empty around 21:30 · 23:00–07:00 charging from the grid up to 9.0 kWh · tomorrow daytime NOM, sun tops up*. 'Today', 'tomorrow' and a weekday name are counted from now.
- **Window Today and the Report:** no plan texts. They show the contract, the prices, the off-peak hours, whether night charging pays, the NOM behaviour and the self-consumption via the battery (kWh to the house, charged with solar, charged from the grid). With Flanders on the report also has a section *Capacity tariff (Flanders)*.

### What the battery earns under a Fixed contract

*Earnings* values every quarter at your prices: discharging for the house counts at the price, charging from the grid costs the price, charging with solar costs the feed-in price you no longer get, and discharging into the grid earns the feed-in price.

## Updating from 1.1.0 (or an earlier pre-release)

Nothing is lost. At the first start of 2.0.0-dev1:

- a stored country **BE** turns the **Flanders** switch on; the country itself now comes from Home Assistant;
- the country setting and the trial mode of the earlier test builds disappear, together with their entities;
- a contract *day/night* of an earlier test build becomes *Fixed* with a *dual rate*;
- your learned usage, the counter and all other settings stay as they are.
