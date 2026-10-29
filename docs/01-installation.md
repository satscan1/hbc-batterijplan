# 01 · Installation

*Nederlands: [01-installation.nl.md](01-installation.nl.md) · Deutsch: [01-installation.de.md](01-installation.de.md)*

**In short**
- Batterijplan is a Home Assistant package (one YAML file), its own cards and a dashboard. You do not need Node-RED for it.
- You install it by hand, in six steps. Count on about a quarter of an hour.
- After the installation Batterijplan is in **shadow mode**: it calculates along, but does not steer anything yet.

## What you need

| Needed | Why |
|---|---|
| Home Assistant with packages | Batterijplan is one file in `/config/packages/`. |
| HBC version 4.14 or newer, in **Full control** and strategy **Dynamic** | Batterijplan reads the labels HBC makes for each quarter (cheap, expensive, regular) and the charge of each battery. |
| A dynamic energy contract with quarter-hour or hourly prices | Without price differences there is nothing to divide. HBC may give the prices bare or all-in; you set that under *Prices from HBC*. |
| Solcast solar forecast (integration *Solcast PV Forecast*) | For the expected sun per half hour. Both the Dutch and the English sensor names work. No solar panels? Then Batterijplan calculates with 0 sun. |
| Sensors for grid power, solar power and battery power, in watts (W) | To measure and learn the house usage. It is always the power of *this* moment, not a daily total in kWh. |

Optional: a sensor for the charging power of your EV charger. It is subtracted from the house usage, so charging the car does not spoil the usage profile.

## Step 1 — Set up HBC correctly

Set HBC to **Full control** and strategy **Dynamic**. On the Timed/Dynamic tab, choose:

| Period | Setting |
|---|---|
| Cheap (low) | Charge |
| Regular (regular / baseline) | **Charge PV** |
| Expensive (high) | Self-consumption |

> **Important:** the regular period must be set to **Charge PV**. Batterijplan assumes that outside the expensive quarters the battery only discharges when Batterijplan asks for it (surplus discharging).

Do you use other settings, for example *Sell* in the expensive period to export for money? Then Batterijplan leaves that period alone. It remembers your settings and puts them back when you turn *Live* off. See [03 · How it works](03-how-it-works.md#your-own-hbc-settings).

## Step 2 — Place the files

Download the zip of this version: on the GitHub page, on the right under **Releases**, then **Source code (zip)**. Unzip it.

| From the zip | To Home Assistant |
|---|---|
| `packages/batterijplan.yaml` | `/config/packages/batterijplan.yaml` |
| `www/batterijplan/` (cards, icons, logo) | `/config/www/batterijplan/` |

Not using packages yet? Then add this to `configuration.yaml`:

```yaml
homeassistant:
  packages: !include_dir_named packages
```

## Step 3 — Recorder (only if you use an include list)

Does your recorder work with a fixed list (`include`)? Then add these entities to it. Otherwise the chart and the counter stay empty:

```yaml
recorder:
  include:
    entities:
      - sensor.batterijplan
      - sensor.batterijplan_meerwaarde
      - sensor.batterijplan_prijs
      - sensor.batterijplan_lading
      - sensor.batterijplan_advies_huisverbruik
      - input_select.house_battery_strategy_dynamic_expensive
      - input_boolean.batterijplan_live
```

If you do not use an include list (the default), you do not need to do anything.

## Step 4 — Restart

Go to *Developer tools → YAML*, choose **Check configuration** and restart Home Assistant. The first time a restart is needed: the `www` folder and the recorder are only read at startup.

## Step 5 — Cards and dashboard

**Register the cards (once):**
1. *Settings → Dashboards*, top right ⋮ → **Resources**. Don't see it? Then first turn on *Advanced mode* in your profile.
2. **Add resource**: URL `/local/batterijplan/batterijplan-cards.js?v=2`, type **JavaScript module**.
3. Refresh the browser (on a phone: close and reopen the app).

**Add the dashboard:**
1. *Settings → Dashboards → Add dashboard → New dashboard from scratch*, name for example "Batterijplan", with its own icon in the sidebar.
2. Open the dashboard, choose ✏️ (edit) at the top right, then ⋮ → **Raw configuration editor**.
3. Paste the contents of `dashboards/batterijplan-dashboard.yaml` (Dutch), `batterijplan-dashboard.en.yaml` (English) or `batterijplan-dashboard.de.yaml` (German) and save.

The cards follow the language of your Home Assistant profile. The dashboard file sets the language of the rest (status, buttons, settings).

## Step 6 — Fill in the settings

On the dashboard, click the **Settings** button. A window opens with two tabs: **Basic** (capacity, prices from HBC, contract start date, back-up) and **Expert** (margin, efficiency, energy tax + purchase fee). The sensors are behind the **Sensors** button. Every field has an **(i)** with an explanation.

The fields work like this:
- a **slider** for capacity, margin and efficiency;
- **choice buttons** for *kaal* (bare) or *all-in*;
- a **− value +** control for energy tax + purchase fee; tap the number to type it exactly;
- a **pick list** for the sensors: tap a sensor field and you get the power sensors in your Home Assistant, the most likely at the top, with what they report now on the right. Tap the right one. Typing filters the list; you can also type the full name yourself and press Enter or OK. Below each chosen sensor you see what it reports now.

| Setting | What to fill in | Example |
|---|---|---|
| Energy contract start date | the day your contract year starts (the year does not matter) | 9 December |
| Usable battery capacity | what your batteries together can *really* deliver, above the lower limit in HBC | 2 × 5.12 kWh with a 12 % lower limit ≈ 9.0 kWh |
| Safety margin | charge the plan never counts on | 0.3 kWh |
| Charge + discharge efficiency | what % of the charged power comes out again | 75 % |
| Energy tax + purchase fee (excl. VAT) | what you pay per kWh *on top of* the bare market price: energy tax plus your supplier's purchase fee | 0.09161 + 0.0165 = 0.1081 |
| Prices from HBC | *kaal* (bare) if HBC gives the bare market price (the default); *all-in* if HBC gives the price with tax, mark-up and VAT. With all-in, Batterijplan adds nothing itself. | kaal |
| Grid power sensor | your sensor in W, import = +, export = − | `sensor.p1_vermogen` |
| Solar power sensor | what all your solar panels together produce **now**, in W (not the daily yield) | `sensor.zon_totaal` |
| Battery power sensor | total of all your batteries in W, discharging = + | with HBC usually `sensor.house_total_battery_power` |
| EV charger sensor (optional) | charging power of your car charger in W | may stay empty |

Several inverters and no sensor with the total? Create a helper: *Settings → Devices & services → Helpers → Create helper → Combine the state of several sensors*, type **Sum**.

> As long as the usable capacity is not filled in, the plan says "Not set up" and does nothing.

**Check:** at the bottom of the Sensors window you see *House consumption now*. That should roughly match what your house really uses, and is never negative.

**Make a back-up.** Everything filled in? On the Basic tab, press **Make back-up**. After a reinstall or a mistake, **Restore back-up** puts everything back. That button first asks "Sure? Tap once more". The back-up saves all 10 settings and is kept across a restart and a new version.

Then close the window. If something is still missing, the button keeps an orange dot.

## The first 7 days: watch and learn

Batterijplan starts in **shadow mode**: it calculates and shows what it would do, but changes nothing in HBC. On the status card, *Learning usage* shows how far along it is ("day 3 of 7").

Now and then, look at *Plan today and tomorrow* and *Price and battery*:
- Does the plan say "holding for later"? Did a more expensive moment indeed come later in the day?
- Does it say "discharging in expensive quarters"? Was the battery nearly empty at the end of the expensive period, and not much earlier?

Does that add up? Then turn on **Live**. How that works is in [03 · How it works](03-how-it-works.md#turning-live-on).
