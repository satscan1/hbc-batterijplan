# 01 · Installation

*Nederlands: [01-installation.nl.md](01-installation.nl.md) · Deutsch: [01-installation.de.md](01-installation.de.md)*

**In short**
- Batterijplan is a Home Assistant integration. You install it with HACS and set it up in a form. No YAML file, no cards to register, no dashboard to paste.
- The cards and the dashboard come with the integration. The dashboard appears in the sidebar at `/batterijplan`.
- You do not need Node-RED for it. Count on about ten minutes.
- After the installation Batterijplan is in **shadow mode**: it calculates along, but does not steer anything yet.

## What you need

| Needed | Why |
|---|---|
| Home Assistant 2026.10.1 or newer, with [HACS](https://hacs.xyz) | You install Batterijplan through HACS. |
| HBC version 4.14 or newer, in **Full control** and strategy **Dynamic** | Batterijplan reads the labels HBC makes for each quarter (cheap, expensive, regular), the charge of each battery and the *threshold delta*. |
| A dynamic energy contract with quarter-hour or hourly prices | Without price differences there is nothing to divide. HBC may give the prices bare or all-in; you set that in the form under *Prices from HBC*. |
| Solcast solar forecast (integration *Solcast PV Forecast*) | For the expected sun per half hour. Both the Dutch and the English sensor names work. No solar panels? Then Batterijplan calculates with 0 sun. |
| Sensors for grid power and battery power (and optionally solar power), in watts (W) | To measure and learn the house usage. It is always the power of *this* moment, not a daily total in kWh. |

Optional: a sensor for the charging power of your EV charger. It is subtracted from the house usage, so charging the car does not spoil the usage profile.

## Step 1 — Set up HBC correctly

Set HBC to **Full control** and strategy **Dynamic**. The threshold delta in HBC (*Dynamic threshold delta*, in ct) is the one Batterijplan uses to decide what counts as "clearly more expensive". Choose it so that it covers your battery losses: Batterijplan has no efficiency setting of its own any more.

Which HBC modes you have set for cheap, regular and expensive does not matter for the installation. Batterijplan remembers them and puts them back when you turn *Live* off. See [03 · How it works](03-how-it-works.md#what-batterijplan-steers-in-hbc).

## Step 2 — Install with HACS

1. In HACS, open the menu (⋮) at the top right and choose **Custom repositories**.
2. Repository: `https://github.com/satscan1/hbc-batterijplan`, category **Integration**. Add it.
3. Search for **HBC Batterijplan** in HACS and choose **Download**.
4. Restart Home Assistant.

## Step 3 — Add the integration

1. *Settings → Devices & services → Add integration → Batterijplan*.
2. Is Batterijplan still there as a package? Then you first get a choice. See [Upgrading from the package](#upgrading-from-the-package-100-rc1rc2). Starting fresh? Choose **Start fresh**, or you go straight to the form.
3. Fill in the form (below) and press **Submit**.

The form:

| Field | What to fill in | Example |
|---|---|---|
| Grid power sensor (+ = import) | your sensor in W, import = +, export = − | `sensor.p1_power` |
| Battery power sensor (+ = discharging) | total of all your batteries in W, discharging = + | `sensor.house_total_battery_power` |
| Solar power sensor (optional) | what all your solar panels together produce **now**, in W (not the daily yield) | `sensor.solar_total` |
| EV charger power sensor (optional) | charging power of your car charger in W | may stay empty |
| Usable capacity of the batteries | what your batteries together can *really* deliver, above the lower limit in HBC | 2 × 5.12 kWh with a 12 % lower limit ≈ 9.0 kWh |
| Safety margin | charge the plan never counts on | 0.3 kWh |
| Prices from HBC | *Raw exchange price* if HBC gives the bare market price (the default); *All-in price* if HBC gives the price with tax, mark-up and VAT. With all-in, Batterijplan adds nothing itself. | raw |
| Supplier mark-up per kWh excl. VAT | what your supplier adds per kWh on top of the exchange price, excluding VAT. Some suppliers (for example Zonneplan) call this a *storage* or *inkoopvergoeding*: look in your contract. Not used with all-in prices. | see your contract |
| Contract start date (optional) | the day your contract year starts (the year does not matter). The counter *added value this period* follows this date. | 9 December |

Several inverters and no sensor with the total? Create a helper: *Settings → Devices & services → Helpers → Create helper → Combine the state of several sensors*, type **Sum**.

> As long as the usable capacity is not filled in, there is no plan and Batterijplan does nothing.

You get an error if the grid sensor and the battery sensor are the same one.

### Expert settings

You change the rest later: on the integration, press **Configure**. Next to the fields above, you now also see:

| Field | Default | Meaning |
|---|---|---|
| VAT | 21 % | VAT on what you buy. |
| Feed-in add-on (EUR/kWh) | 0.02 | What you get on top of the exchange price when you feed in. With Zonneplan, for example, this is the *terugleververgoeding*. Check your contract. |
| Daytime feed-in bonus | 10 % | Extra percentage on a positive feed-in price in the daytime. 0 = none. |
| Daytime from / until (hour) | 8 / 17 | The hours for that bonus. Every quarter with sun counts as daytime too. |

The sensors, capacity, margin, prices, mark-up and the start date can also be changed in the dashboard under **Settings**.

## Step 4 — Open the dashboard

In the sidebar there is a new dashboard **Batterijplan** (address `/batterijplan`). The cards are built in, so there is no resource to add and no file to place. Is the address already taken by a dashboard of your own? See [05 · Troubleshooting](05-troubleshooting.md#dashboard-and-cards).

Does the sidebar item not show right away? Refresh the browser (on a phone: close and reopen the app).

**Check:** under the **Sensors** button you see *House consumption now*. That should roughly match what your house really uses, and is never negative.

## Recorder (only if you use an include list)

Does your recorder work with a fixed list (`include`)? Then add these entities to it. Otherwise the chart and the counter stay empty:

```yaml
recorder:
  include:
    entities:
      - sensor.batterijplan
      - sensor.batterijplan_meerwaarde
      - sensor.batterijplan_prijs
      - sensor.batterijplan_lading
      - input_select.house_battery_strategy_dynamic_expensive
      - switch.batterijplan_live
      - sensor.batterijplan_advies_hbc
```

If you do not use an include list (the default), you do not need to do anything.

Batterijplan no longer writes its large plan details (the points, the explanation and similar) to the database. The entities in the list above stay the same.

## The first 7 days: watch and learn

Batterijplan starts in **shadow mode**: it calculates and shows what it would do, but changes nothing in HBC. On the status card, *Learning usage* shows how far along it is ("day 3 of 7").

Now and then, look at the chart and the briefing:
- Does the plan say "hold"? Did a more expensive moment indeed come later in the day?
- Does it discharge outside the HBC hours? Was that really a much more expensive quarter than the one before?

Does that add up? Then turn on **Live**. How that works is in [03 · How it works](03-how-it-works.md#turning-live-on).

## Upgrading from the package (1.0.0-rc1/rc2)

Did you use Batterijplan as a package (`packages/batterijplan.yaml`), with the cards in `www/batterijplan` and a dashboard you pasted? Then do this, in this order:

1. **Make a back-up** of Home Assistant (*Settings → System → Backups*). The old *Make back-up* button is not needed for this.
2. **Install the integration** with HACS (steps 2 and 3 above) and restart.
3. Add the integration. Because the package is still there, you now get a choice. Choose **Take over from the Batterijplan package**. Batterijplan takes over your settings (sensors, capacity, margin, prices, mark-up, start date), the **learned usage profile** and the **counter**. You see the form once more, filled in. Check it and submit.
4. **Remove the package.** Delete `packages/batterijplan.yaml` (and, if you have it, `packages/batterijplan_proef.yaml`).
5. **Remove the old cards.** Delete the folder `www/batterijplan/`. Remove the resource `/local/batterijplan/batterijplan-cards.js` under *Settings → Dashboards → ⋮ → Resources*.
6. **Remove the old dashboard** (*Settings → Dashboards*).
7. **Restart Home Assistant.** While the package was still there, the new entities got ids with `_2` at the end (for example `sensor.batterijplan_2`). At the restart Batterijplan puts them back to the normal names, so your history and your own cards keep working.
8. Open the new dashboard **Batterijplan** in the sidebar.

Good to know:
- The new rules replace the old ones. Surplus discharging, the *Advice for HBC* and the efficiency setting are gone; see [03 · How it works](03-how-it-works.md#the-rules).
- The old back-up and restore buttons are gone. The integration keeps everything itself; see [04 · Maintenance](04-maintenance.md#back-up).
- Recorder with an include list: the list above has not changed in its main names. Remove `sensor.batterijplan_advies_huisverbruik` and `input_boolean.batterijplan_live`; add `switch.batterijplan_live`.
- The total of the counter is taken over. The counter *added value this period* starts again at the takeover.
- *Live* is never taken over: it always starts **off**, so the integration changes nothing in HBC. Turn the package's Live off yourself, then turn *Live* on in the integration when you are ready.
