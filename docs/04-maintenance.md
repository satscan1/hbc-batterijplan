# 04 · Maintenance and updating

*Nederlands: [04-maintenance.nl.md](04-maintenance.nl.md) · Deutsch: [04-maintenance.de.md](04-maintenance.de.md)*

**In short**
- A quick look once a month is enough.
- Updates come through HACS. Your settings, the learned usage and the counter are kept.
- Switching it off for a while = *Live* off. The plan then keeps calculating and learning.

## What you do now and then

| When | What to do |
|---|---|
| **Once a month** | Check that "hold" and "discharge" still make sense. Is the battery often still well filled after the expensive period? Lower the safety margin. Does it often run empty too early? Raise the margin, or check the capacity. |
| **New energy contract** | Change the *mark-up*, the *feed-in add-on* and the *start date*. |
| **Battery added or removed, or less capacity because of wear** | Change the *usable capacity*. |
| **Big change in usage** (heat pump, new appliance) | Do nothing: the profile adapts by itself within about 1 to 2 weeks. |
| **HBC update** | Check that HBC is still on Dynamic, and look at the *threshold delta*: it decides what counts as clearly more expensive. |
| **Other sensors** (new P1 meter, inverter) | Open the *Sensors* button and change the sensor names (or press *Configure* on the integration). |
| **Other energy contract with all-in prices in HBC** | Set *Prices from HBC* to *all-in* (*Settings* button). |

## Back-up

The integration keeps everything itself, in the Home Assistant configuration entry: your settings (also the Expert ones), the learned usage profile and the counter. It is therefore part of every normal Home Assistant back-up (*Settings → System → Backups*).

- The old buttons *Make back-up*, *Restore back-up* and *Defaults* are gone. You do not need them any more: an update or a restart does not lose anything.
- Reinstalling Batterijplan on the same Home Assistant? Remove the integration only if you want to start fresh; then everything of it is gone.
- Moving to a new Home Assistant? Restore a Home Assistant back-up there. Without a back-up you set the integration up again, and the usage profile starts learning again (7 days).

## Installing a new version

1. Make a Home Assistant back-up (see above).
2. In HACS, open **HBC Batterijplan** and choose **Update** (or *Download* of the new version).
3. Restart Home Assistant.
4. Refresh the browser (on a phone: close and reopen the app), so you get the new cards.

Your settings, the learned usage and the counter are kept. The dashboard and the cards come with the integration, so there is nothing to replace or paste.

**Release candidates.** A version with `rc` in its name is a release candidate: nearly final, but still being tested. In HACS you only see it if you turn on *Show beta versions* for this repository.

**From the package (1.0.0-rc1/rc2) to the integration:** see [01 · Installation](01-installation.md#upgrading-from-the-package-100-rc1rc2).

## Removing it completely

1. Turn **Live** off, so HBC goes back to your own settings.
2. *Settings → Devices & services → Batterijplan → ⋮ → Delete*.
3. In HACS, remove **HBC Batterijplan** and restart Home Assistant.

The dashboard disappears with the integration.
