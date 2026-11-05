# 04 · Onderhoud en bijwerken

*English: [04-maintenance.md](04-maintenance.md) · Deutsch: [04-maintenance.de.md](04-maintenance.de.md)*

**In het kort**
- Eén keer per maand even kijken is genoeg.
- Updates komen via HACS. Je instellingen, het geleerde verbruik en de teller blijven bewaard.
- Even uitzetten = *Live* uit. Het plan blijft dan rekenen en leren.

## Wat je af en toe doet

| Wanneer | Wat te doen |
|---|---|
| **Eén keer per maand** | Kijk of "vasthouden" en "ontladen" nog logisch zijn. Zit de batterij na de dure periode vaak nog goed vol? Verlaag de veiligheidsmarge. Loopt hij vaak te vroeg leeg? Verhoog de marge, of controleer de capaciteit. |
| **Nieuw energiecontract** | Wijzig de *opslag*, de *toeslag terugleveren* en de *ingangsdatum*. |
| **Batterij erbij of eraf, of minder capaciteit door slijtage** | Wijzig de *bruikbare capaciteit*. |
| **Grote verandering in verbruik** (warmtepomp, nieuw apparaat) | Niets doen: het profiel past zich zelf aan binnen ongeveer 1 tot 2 weken. |
| **HBC-update** | Controleer of HBC nog op Dynamic staat en kijk naar het *drempelverschil*: dat bepaalt wat duidelijk duurder is. |
| **Andere sensoren** (nieuwe P1-meter, omvormer) | Open de knop *Sensoren* en wijzig de sensornamen (of druk bij de integratie op *Configureren*). |
| **Ander energiecontract met all-in prijzen in HBC** | Zet *Prijzen van HBC* op *all-in* (knop *Instellingen*). |

## Back-up

De integratie bewaart alles zelf, in de configuratie-invoer van Home Assistant: je instellingen (ook de Expert-instellingen), het geleerde verbruiksprofiel en de teller. Hij zit daarom in elke gewone Home Assistant-back-up (*Instellingen → Systeem → Back-ups*).

- De oude knoppen *Back-up maken*, *Back-up terugzetten* en *Standaardwaarden* zijn weg. Je hebt ze niet meer nodig: bij een update of herstart gaat er niets verloren.
- Batterijplan opnieuw installeren op dezelfde Home Assistant? Verwijder de integratie alleen als je opnieuw wilt beginnen; dan is alles ervan weg.
- Naar een nieuwe Home Assistant verhuizen? Zet daar een Home Assistant-back-up terug. Zonder back-up stel je de integratie opnieuw in, en het verbruiksprofiel begint opnieuw met leren (7 dagen).

## Een nieuwe versie installeren

1. Maak een Home Assistant-back-up (zie hierboven).
2. Open in HACS **HBC Batterijplan** en kies **Bijwerken** (of *Downloaden* van de nieuwe versie).
3. Herstart Home Assistant.
4. Ververs de browser (op een telefoon: app sluiten en opnieuw openen), zodat je de nieuwe kaarten krijgt.

Je instellingen, het geleerde verbruik en de teller blijven bewaard. Het dashboard en de kaarten zitten in de integratie, dus er valt niets te vervangen of te plakken.

**Release candidates.** Een versie met `rc` in de naam is een release candidate: bijna klaar, maar nog in test. In HACS zie je hem alleen als je voor deze repository *Bètaversies tonen* aanzet.

**Van het pakket (1.0.0-rc1/rc2) naar de integratie:** zie [01 · Installatie](01-installation.nl.md#overstappen-van-het-pakket-100-rc1rc2).

## Helemaal verwijderen

1. Zet **Live** uit, zodat HBC teruggaat naar je eigen standen.
2. *Instellingen → Apparaten & diensten → Batterijplan → ⋮ → Verwijderen*.
3. Verwijder **HBC Batterijplan** in HACS en herstart Home Assistant.

Het dashboard verdwijnt samen met de integratie.
