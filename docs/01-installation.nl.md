# 01 · Installatie

*English: [01-installation.md](01-installation.md) · Deutsch: [01-installation.de.md](01-installation.de.md)*

**In het kort**
- Batterijplan is een Home Assistant-pakket (één YAML-bestand), eigen kaarten en een dashboard. Node-RED heb je er niet voor nodig.
- Installeren gaat met de hand, in zes stappen. Reken op een kwartier.
- Na de installatie staat Batterijplan in **schaduwmodus**: het rekent mee, maar stuurt nog niets.

## Wat heb je nodig

| Nodig | Waarom |
|---|---|
| Home Assistant met packages | Batterijplan is één bestand in `/config/packages/`. |
| HBC versie 4.14 of nieuwer, in **Full control** en strategie **Dynamic** | Batterijplan leest de labels die HBC per kwartier maakt (goedkoop, duur, gewoon) en de lading per batterij. |
| Een dynamisch energiecontract met kwartier- of uurprijzen | Zonder prijsverschillen valt er niets te verdelen. HBC mag de prijzen kaal of all-in geven; dat stel je in bij *Prijzen van HBC*. |
| Solcast-zonvoorspelling (integratie *Solcast PV Forecast*) | Voor de verwachte zon per half uur. De Nederlandse en Engelse namen van de sensoren werken allebei. Geen zonnepanelen? Dan rekent Batterijplan met 0 zon. |
| Sensoren voor netvermogen, zonnevermogen en batterijvermogen, in watt (W) | Om het huisverbruik te meten en te leren. Het gaat steeds om het vermogen van dít moment, niet om een dagtotaal in kWh. |

Optioneel: een sensor voor het laadvermogen van je laadpaal. Die wordt van het huisverbruik afgetrokken, zodat het opladen van de auto het verbruiksprofiel niet vervuilt.

## Stap 1 — HBC goed zetten

Zet HBC op **Full control** en strategie **Dynamic**. Kies op het tabblad Timed/Dynamic:

| Periode | Stand |
|---|---|
| Goedkoop (low) | Charge |
| Gewoon (regular / baseline) | **Charge PV** |
| Duur (high) | Self-consumption |

> **Belangrijk:** de gewone periode moet op **Charge PV** staan. Batterijplan gaat ervan uit dat de batterij buiten de dure kwartieren alleen ontlaadt als Batterijplan dat vraagt (overschot ontladen).

Gebruik je andere standen, bijvoorbeeld *Sell* in de dure periode om terug te leveren voor geld? Dan blijft Batterijplan van die periode af. Het onthoudt jouw standen en zet ze terug als je *Live* uitzet. Zie [03 · Hoe het werkt](03-how-it-works.nl.md#jouw-eigen-hbc-standen).

## Stap 2 — Bestanden plaatsen

Download de zip van deze versie: op de GitHub-pagina rechts bij **Releases**, dan **Source code (zip)**. Pak hem uit.

| Uit de zip | Naar Home Assistant |
|---|---|
| `packages/batterijplan.yaml` | `/config/packages/batterijplan.yaml` |
| `www/batterijplan/` (kaarten, iconen, logo) | `/config/www/batterijplan/` |

Gebruik je nog geen packages? Voeg dan dit toe aan `configuration.yaml`:

```yaml
homeassistant:
  packages: !include_dir_named packages
```

## Stap 3 — Recorder (alleen als je een include-lijst gebruikt)

Werkt je recorder met een vaste lijst (`include`), zet dan deze entiteiten erop. Anders blijven de grafiek en de teller leeg:

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

Gebruik je geen include-lijst (de standaard), dan hoef je niets te doen.

## Stap 4 — Herstarten

Ga naar *Ontwikkelhulpmiddelen → YAML*, kies **Configuratie controleren** en herstart Home Assistant. De eerste keer is een herstart nodig: de map `www` en de recorder worden alleen bij het opstarten gelezen.

## Stap 5 — Kaarten en dashboard

**De kaarten aanmelden (één keer):**
1. *Instellingen → Dashboards*, rechtsboven ⋮ → **Bronnen** (Resources). Zie je dat niet, zet dan eerst in je profiel de *Geavanceerde modus* aan.
2. **Bron toevoegen**: adres `/local/batterijplan/batterijplan-cards.js?v=2`, type **JavaScript-module**.
3. Ververs de browser (op de telefoon: app sluiten en opnieuw openen).

**Het dashboard toevoegen:**
1. *Instellingen → Dashboards → Dashboard toevoegen → Nieuw dashboard vanaf nul*, naam bijvoorbeeld "Batterijplan", met een eigen icoon in de zijbalk.
2. Open het dashboard, kies rechtsboven ✏️ (bewerken), dan ⋮ → **Raw-configuratie-editor**.
3. Plak de inhoud van `dashboards/batterijplan-dashboard.yaml` (Nederlands), `batterijplan-dashboard.en.yaml` (Engels) of `batterijplan-dashboard.de.yaml` (Duits) en sla op.

De kaarten volgen de taal van je profiel in Home Assistant. Het dashboard-bestand bepaalt de taal van de rest (status, knopjes, instellingen).

## Stap 6 — Instellingen invullen

Klik op het dashboard op het knopje **Instellingen**. Er opent een venster met twee tabbladen: **Basis** (capaciteit, prijzen van HBC, ingangsdatum, back-up) en **Expert** (marge, rendement, energiebelasting + inkoop). De sensoren staan achter het knopje **Sensoren**. Elk veld heeft een **(i)** met uitleg.

De velden werken zo:
- een **schuifbalk** voor capaciteit, marge en rendement;
- **keuzeknopjes** voor *kaal* of *all-in*;
- een **− waarde +**-knop voor energiebelasting + inkoop; tik op het getal om het precies te typen;
- een **keuzelijst** voor de sensoren: tik op een sensorveld en je krijgt de vermogenssensoren uit jouw Home Assistant, de meest waarschijnlijke bovenaan, met rechts wat ze nu melden. Tik op de juiste. Typen filtert de lijst; je mag de naam ook helemaal zelf typen en op Enter of OK drukken. Onder elke gekozen sensor zie je wat die nu meldt.

| Instelling | Wat vul je in | Voorbeeld |
|---|---|---|
| Ingangsdatum energiecontract | de dag waarop je contractjaar begint (het jaartal maakt niet uit) | 9 december |
| Bruikbare capaciteit batterijen | wat je batterijen samen écht kunnen leveren, boven de ondergrens in HBC | 2 × 5,12 kWh met 12 % ondergrens ≈ 9,0 kWh |
| Veiligheidsmarge | lading die het plan nooit inrekent | 0,3 kWh |
| Rendement laden + ontladen | hoeveel % van de geladen stroom er weer uitkomt | 75 % |
| Energiebelasting + inkoop (excl. btw) | wat je per kWh bóvenop de kale beursprijs betaalt: energiebelasting plus de inkoopvergoeding van je leverancier | 0,09161 + 0,0165 = 0,1081 |
| Prijzen van HBC | *kaal* als HBC de kale beursprijs geeft (standaard); *all-in* als HBC de prijs met belasting, opslag en btw geeft. Bij all-in telt Batterijplan zelf niets meer op. | kaal |
| Sensor netvermogen | jouw sensor in W, afname = +, teruglevering = − | `sensor.p1_vermogen` |
| Sensor zonnevermogen | wat al je zonnepanelen samen **nu** opwekken, in W (niet de dagopbrengst) | `sensor.zon_totaal` |
| Sensor batterijvermogen | totaal van al je batterijen in W, ontladen = + | bij HBC meestal `sensor.house_total_battery_power` |
| Sensor laadpaal (optioneel) | laadvermogen van je auto-lader in W | mag leeg blijven |

Heb je meerdere omvormers en geen sensor met het totaal? Maak een helper: *Instellingen → Apparaten en diensten → Helpers → Helper aanmaken → Combineer de status van meerdere sensoren*, type **Som**.

> Zolang de bruikbare capaciteit niet is ingevuld, zegt het plan "Niet ingesteld" en doet het niets.

**Controle:** in het venster Sensoren staat onderaan *Huisverbruik nu*. Dat moet ongeveer kloppen met wat je huis echt gebruikt, en is nooit negatief.

**Back-up maken.** Alles ingevuld? Druk op tabblad Basis op **Back-up maken**. Na een herinstallatie of een vergissing zet **Back-up terugzetten** alles terug. Die knop vraagt eerst "Zeker? Tik nog een keer". De back-up bewaart alle 10 instellingen en blijft bewaard bij een herstart en bij een nieuwe versie.

Sluit daarna het venster. Ontbreekt er nog iets, dan houdt het knopje een oranje stip.

## De eerste 7 dagen: kijken en leren

Batterijplan begint in **schaduwmodus**: het rekent en laat zien wat het zou doen, maar verandert niets aan HBC. Op de statuskaart zie je bij *Verbruik leren* hoe ver het is ("dag 3 van 7").

Kijk af en toe naar *Plan vandaag en morgen* en *Prijs en batterij*:
- Zegt het plan "vasthouden voor later"? Kwam er later op de dag inderdaad een duurder moment?
- Zegt het "ontladen in dure kwartieren"? Was de batterij aan het eind van de dure periode bijna leeg, en niet al veel eerder?

Klopt dat? Zet dan **Live** aan. Hoe dat werkt staat in [03 · Hoe het werkt](03-how-it-works.nl.md#live-zetten).
