# 04 · Maintenance and updating

*Nederlands: [04-maintenance.nl.md](04-maintenance.nl.md) · Deutsch: [04-maintenance.de.md](04-maintenance.de.md)*

**In short**
- A quick look once a month is enough.
- Always make a back-up before you change or update anything.
- Switching it off for a while = *Live* off. The plan then keeps calculating and learning.

## What you do now and then

| When | What to do |
|---|---|
| **Once a month** | Check that "holding" and "discharging" still make sense. Is the battery often still well filled after the expensive period? Lower the safety margin. Does it often run empty too early? Raise the margin, or check the capacity. |
| **Advice for HBC turns orange** | Change *Solar reserved for house* in HBC to the number in the advice. This happens mostly when the seasons change. |
| **New energy contract** | Change *Energy tax + purchase fee* and the *start date*. |
| **Battery added or removed, or less capacity because of wear** | Change the *usable capacity*. |
| **Big change in usage** (heat pump, new appliance) | Do nothing: the profile adapts by itself within about 14 days. |
| **HBC update** | Check that HBC is still on Dynamic and the regular period on Charge PV. |
| **Other sensors** (new P1 meter, inverter) | Turn on the *Settings* switch and change the sensor names. Then make a new back-up. |

## Installing a new version

1. Press **Make back-up**.
2. Replace `packages/batterijplan.yaml` and the `www/batterijplan/` folder with the ones from the new zip.
3. Under *Settings → Dashboards → ⋮ → Resources*, raise the number after the cards, for example `?v=1` → `?v=2`. That makes your browser load the new cards.
4. Paste the new dashboard into the Raw configuration editor (see [01 · Installation](01-installation.md#step-5--cards-and-dashboard)).
5. *Check configuration* and restart.

Your settings, the learned usage and the counter are kept. Still missing something? Press **Restore back-up**.

**From 0.1.x to 1.0.0-dev1:** add the cards as a resource (step 5 of the installation) and replace the dashboard. If you use a recorder with an include list, also add `sensor.batterijplan_lading` and `sensor.batterijplan_advies_huisverbruik` to the list and restart.

## Removing it completely

1. Turn **Live** off, so HBC goes back to its normal settings.
2. Remove `packages/batterijplan.yaml`, the `www/batterijplan/` folder, the resource `/local/batterijplan/batterijplan-cards.js` and the dashboard.
3. Restart Home Assistant.
