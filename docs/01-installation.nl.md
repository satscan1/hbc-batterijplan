# 01 · Installatie

*English: [01-installation.md](01-installation.md) · Deutsch: [01-installation.de.md](01-installation.de.md)*

**In het kort**
- Batterijplan is een Home Assistant-integratie. Je installeert hem met HACS en stelt hem in met een formulier. Geen YAML-bestand, geen kaarten registreren, geen dashboard plakken.
- De kaarten en het dashboard zitten in de integratie. Het dashboard staat in de zijbalk op `/batterijplan`.
- Je hebt er geen Node-RED voor nodig. Reken op ongeveer tien minuten.
- Na de installatie staat Batterijplan in **schaduwmodus**: hij rekent mee, maar stuurt nog niets.

## Wat heb je nodig

| Nodig | Waarom |
|---|---|
| Home Assistant 2026.10.1 of nieuwer, met [HACS](https://hacs.xyz) | Je installeert Batterijplan via HACS. |
| HBC versie 4.14 of nieuwer, op **Full control** en strategie **Dynamic** | Batterijplan leest de labels die HBC per kwartier maakt (goedkoop, duur, gewoon), de lading van elke batterij en het *drempelverschil*. |
| Een dynamisch energiecontract met kwartier- of uurprijzen | Zonder prijsverschillen valt er niets te verdelen. HBC mag de prijzen kaal of all-in geven; dat stel je in het formulier in bij *Prijzen van HBC*. |
| Solcast zonneverwachting (integratie *Solcast PV Forecast*) | Voor de verwachte zon per half uur. Nederlandse en Engelse sensornamen werken allebei. Geen zonnepanelen? Dan rekent Batterijplan met 0 zon. |
| Sensoren voor netvermogen en batterijvermogen (en eventueel zonnevermogen), in watt (W) | Om het huisverbruik te meten en te leren. Het is altijd het vermogen van *dit* moment, geen dagtotaal in kWh. |

Optioneel: een sensor voor het laadvermogen van je laadpaal. Die gaat van het huisverbruik af, zodat het laden van de auto je verbruiksprofiel niet verpest.

## Stap 1 — HBC goed zetten

Zet HBC op **Full control** en strategie **Dynamic**. Het drempelverschil in HBC (*Dynamic threshold delta*, in ct) is wat Batterijplan gebruikt om te bepalen wat "duidelijk duurder" is. Kies het zo dat het je batterijverlies dekt: Batterijplan heeft zelf geen rendement-instelling meer.

Welke HBC-standen je nu hebt voor goedkoop, gewoon en duur maakt voor de installatie niet uit. Batterijplan onthoudt ze en zet ze terug als je *Live* uitzet. Zie [03 · Hoe het werkt](03-how-it-works.nl.md#wat-batterijplan-in-hbc-stuurt).

## Stap 2 — Installeren met HACS

1. Zoek in HACS naar **HBC Batterijplan** en kies **Downloaden** (zodra de integratie in de standaardlijst van HACS staat).
2. Staat hij er nog niet, of zie je hem niet? Voeg hem dan toe als aangepaste repository: open in HACS het menu (⋮) rechtsboven en kies **Aangepaste repositories**. Repository: `https://github.com/satscan1/hbc-batterijplan`, categorie **Integratie**. Voeg toe, zoek dan **HBC Batterijplan** en kies **Downloaden**.
3. Herstart Home Assistant.

## Stap 3 — Integratie toevoegen

1. *Instellingen → Apparaten & diensten → Integratie toevoegen → Batterijplan*.
2. Staat Batterijplan nog als pakket in je Home Assistant? Dan krijg je eerst een keuze. Zie [Overstappen van het pakket](#overstappen-van-het-pakket-100-rc1rc2). Begin je opnieuw? Kies **Opnieuw beginnen**, of je komt meteen bij het formulier.
3. Vul het formulier in (hieronder) en druk op **Verzenden**.

Het formulier:

| Veld | Wat invullen | Voorbeeld |
|---|---|---|
| Sensor netvermogen (+ = afname) | jouw sensor in W, afname = +, teruglevering = − | `sensor.p1_vermogen` |
| Sensor batterijvermogen (+ = ontladen) | totaal van al je batterijen in W, ontladen = + | `sensor.house_total_battery_power` |
| Sensor zonnevermogen (optioneel) | wat al je zonnepanelen samen **nu** opwekken, in W (niet de dagopbrengst) | `sensor.zon_totaal` |
| Sensor laadpaal (optioneel) | laadvermogen van je laadpaal in W | mag leeg blijven |
| Bruikbare capaciteit van de batterijen | wat je batterijen samen *echt* kunnen leveren, boven de ondergrens in HBC | 2 × 5,12 kWh met 12 % ondergrens ≈ 9,0 kWh |
| Veiligheidsmarge | lading waar het plan nooit op rekent | 0,3 kWh |
| Prijzen van HBC | *Kale beursprijs* als HBC de kale marktprijs geeft (standaard); *All-in prijs* als HBC de prijs met belasting, opslag en btw geeft. Bij all-in telt Batterijplan zelf niets op. | kaal |
| Opslag per kWh excl. btw | wat je leverancier per kWh boven de beursprijs rekent, zonder btw. Sommige leveranciers (bijvoorbeeld Zonneplan) noemen dit een *opslag* of *inkoopvergoeding*: kijk in je contract. Niet gebruikt bij all-in prijzen. | zie je contract |
| Ingangsdatum energiecontract (optioneel) | de dag waarop je contractjaar begint (het jaartal maakt niet uit). De teller *meerwaarde dit contractjaar* volgt deze datum. | 9 december |

Meerdere omvormers en geen sensor met het totaal? Maak een helper: *Instellingen → Apparaten & diensten → Helpers → Helper maken → De status van meerdere sensoren combineren*, type **Som**.

> Zolang de bruikbare capaciteit niet is ingevuld, is er geen plan en doet Batterijplan niets.

Je krijgt een foutmelding als de netsensor en de batterijsensor dezelfde sensor zijn.

### Expert-instellingen

De rest wijzig je later: druk bij de integratie op **Configureren**. Naast de velden hierboven zie je dan ook:

| Veld | Standaard | Betekenis |
|---|---|---|
| Btw | 21 % | Btw over wat je inkoopt. |
| Toeslag terugleveren (EUR/kWh) | 0,02 | Wat je bovenop de beursprijs krijgt als je teruglevert. Bij Zonneplan is dit bijvoorbeeld de *terugleververgoeding*. Kijk in je contract. |
| Dagbonus terugleveren | 10 % | Extra percentage op een positieve terugleverprijs overdag. 0 = geen. |
| Overdag vanaf / tot (uur) | 8 / 17 | De uren voor die bonus. Elk kwartier met zon telt ook als overdag. |

De sensoren, capaciteit, marge, prijzen, opslag en de ingangsdatum wijzig je ook in het dashboard onder **Instellingen**.

## Stap 4 — Dashboard openen

In de zijbalk staat een nieuw dashboard **Batterijplan** (adres `/batterijplan`). De kaarten zijn ingebouwd: je hoeft geen bron toe te voegen en geen bestand neer te zetten. Is het adres al bezet door een dashboard van jezelf? Zie [05 · Problemen oplossen](05-troubleshooting.nl.md#dashboard-en-kaarten).

Zie je het zijbalkitem niet meteen? Ververs de browser (op een telefoon: app sluiten en opnieuw openen).

**Controle:** onder de knop **Sensoren** zie je *Huisverbruik nu*. Dat moet ongeveer kloppen met wat je huis echt verbruikt, en is nooit negatief.

## Recorder (alleen als je een include-lijst gebruikt)

Werkt je recorder met een vaste lijst (`include`)? Zet dan deze entiteiten erop. Anders blijven de grafiek en de teller leeg:

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

Gebruik je geen include-lijst (standaard), dan hoef je niets te doen.

Batterijplan schrijft zijn grote plandetails (de punten, de uitleg en dergelijke) niet meer naar de database. De entiteiten in de lijst hierboven blijven hetzelfde.

## De eerste 7 dagen: kijken en leren

Batterijplan begint in **schaduwmodus**: hij rekent en toont wat hij zou doen, maar verandert niets in HBC. Op de statuskaart laat *Verbruik leren* zien hoe ver hij is ("dag 3 van 7").

Kijk af en toe naar de grafiek en de briefing:
- Zegt het plan "vasthouden"? Kwam er later op de dag inderdaad een duurder moment?
- Ontlaadt het buiten de HBC-uren? Was dat echt een veel duurder kwartier dan het kwartier ervoor?

Klopt dat? Zet dan **Live** aan. Hoe dat werkt staat in [03 · Hoe het werkt](03-how-it-works.nl.md#live-zetten).

## Overstappen van het pakket (1.0.0-rc1/rc2)

Gebruikte je Batterijplan als pakket (`packages/batterijplan.yaml`), met de kaarten in `www/batterijplan` en een dashboard dat je zelf hebt geplakt? Doe dan dit, in deze volgorde:

1. **Maak een reservekopie** van Home Assistant (*Instellingen → Systeem → Back-ups*). De oude knop *Back-up maken* is hiervoor niet nodig.
2. **Installeer de integratie** met HACS (stap 2 en 3 hierboven) en herstart.
3. Voeg de integratie toe. Omdat het pakket er nog staat, krijg je nu een keuze. Kies **Overnemen uit het Batterijplan-pakket**. Batterijplan neemt je instellingen over (sensoren, capaciteit, marge, prijzen, opslag, ingangsdatum), het **geleerde verbruiksprofiel** en de **teller**. Je ziet het formulier nog één keer, ingevuld. Controleer het en verzend.
4. **Haal het pakket weg.** Verwijder `packages/batterijplan.yaml` (en, als je dat hebt, `packages/batterijplan_proef.yaml`).
5. **Haal de oude kaarten weg.** Verwijder de map `www/batterijplan/`. Verwijder de bron `/local/batterijplan/batterijplan-cards.js` onder *Instellingen → Dashboards → ⋮ → Bronnen*.
6. **Haal het oude dashboard weg** (*Instellingen → Dashboards*).
7. **Herstart Home Assistant.** Zolang het pakket er nog stond, kregen de nieuwe entiteiten een id met `_2` erachter (bijvoorbeeld `sensor.batterijplan_2`). Bij de herstart zet Batterijplan ze terug naar de gewone namen, zodat je geschiedenis en je eigen kaarten blijven werken.
8. Open het nieuwe dashboard **Batterijplan** in de zijbalk.

Goed om te weten:
- De nieuwe regels vervangen de oude. Overschot ontladen, het *Advies voor HBC* en de rendement-instelling zijn weg; zie [03 · Hoe het werkt](03-how-it-works.nl.md#de-regels).
- De oude back-up- en terugzetknoppen zijn weg. De integratie bewaart alles zelf; zie [04 · Onderhoud](04-maintenance.nl.md#back-up).
- Recorder met include-lijst: de hoofdnamen in de lijst hierboven zijn niet veranderd. Haal `sensor.batterijplan_advies_huisverbruik` en `input_boolean.batterijplan_live` eraf; zet `switch.batterijplan_live` erop.
- Het totaal van de teller wordt overgenomen. De teller *meerwaarde dit contractjaar* begint opnieuw bij het overnemen.
- *Live* wordt nooit overgenomen: hij staat na de installatie altijd **uit**, dus de integratie wijzigt niets in HBC. Zet Live van het pakket zelf uit en zet daarna *Live* van de integratie aan als je zover bent.
