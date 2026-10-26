# Batterijplan — slimme laag bovenop Home Battery Control (HBC)

*Versie 0.1.5 · experimenteel · Nederlandstalig*

Batterijplan zorgt dat je thuisbatterij zijn lading bewaart voor de **duurste** momenten van de dag. Het werkt samen met [Home Battery Control (HBC)](https://github.com/gitcodebob/marstek-venus-rs485-node-red) en neemt HBC niet over. HBC blijft de batterij aansturen; Batterijplan geeft alleen per kwartier één aanwijzing.

Het is een gewoon Home Assistant-pakket (YAML), met een eigen dashboard. Node-RED heb je er niet voor nodig. Installeren gaat (nog) met de hand; installatie via HACS volgt in een latere versie.

---

## 1. Wat doet het, in gewone taal

HBC (strategie **Dynamic**) geeft elk kwartier een label:
- **goedkoop**: laden van het net;
- **duur**: ontladen voor het huis;
- **gewoon**: alleen laden met zon.

Dat werkt goed, maar HBC kijkt niet of de batterij genoeg lading heeft voor *alle* dure kwartieren. De makers van HBC noemen dat zelf als beperking. Gevolg: de batterij kan leeg raken bij een duur moment van 27 ct, terwijl er een uur later een moment van 50 ct komt.

Batterijplan rekent elk kwartier vooruit tot het volgende goedkope moment en kijkt daarbij naar:
- hoeveel lading er nu in de batterij zit;
- hoeveel je huis op dat uur van de dag gewoonlijk verbruikt (dat leert het zelf);
- hoeveel zon er verwacht wordt (voorzichtige schatting);
- welke dure kwartieren er nog komen en wat ze kosten.

Daarna geeft het de lading eerst aan de **duurste** kwartieren. In de dure kwartieren die niet aan de beurt zijn, houdt de batterij zijn lading vast.

Komt er tussen twee pieken zon of een goedkoop moment? Dan rekent Batterijplan dat mee als bijladen, en mag de eerste piek gewoon ontladen.

Daarnaast rekent het uit of extra laden 's nachts zou lonen, inclusief het verlies bij laden en ontladen. Dat **laat het alleen zien**; in deze versie doet het dat nog niet zelf.

---

## 2. Wat heb je nodig

| Nodig | Waarom |
|---|---|
| Home Assistant met packages | Batterijplan is één YAML-bestand in `/config/packages/`. |
| HBC versie 4.14 of nieuwer, strategie **Dynamic** | Batterijplan leest de labels die HBC per kwartier maakt (`sensor.hbc_energy_prices_data`) en het laadpercentage en de ondergrens per batterij die HBC kent. |
| Een dynamisch energiecontract met kwartier- of uurprijzen | Zonder prijsverschillen valt er niets te verdelen. |
| Solcast-zonvoorspelling (integratie "Solcast PV Forecast") | Voor de verwachte zon per half uur. Geen zonnepanelen? Dan rekent het plan met 0 zon. |
| Een sensor voor netvermogen, zonnevermogen en batterijvermogen, in watt (W) | Om het huisverbruik te meten en te leren. Het gaat steeds om het vermogen van dít moment, niet om een dagtotaal in kWh. |

Optioneel: een sensor voor het laadvermogen van je laadpaal. Die wordt van het huisverbruik afgetrokken, zodat het opladen van de auto het verbruiksprofiel niet vervuilt.

---

## 3. Installeren

**Stap 1 — HBC goed zetten**

Zet HBC op **Full control** en strategie **Dynamic**. Kies op het tabblad Timed/Dynamic:

| Periode | Stand |
|---|---|
| Goedkoop (low) | Charge |
| Gewoon (regular / baseline) | **Charge PV** |
| Duur (high) | Self-consumption |

> **Belangrijk:** de gewone periode moet op **Charge PV** staan. Batterijplan gaat ervan uit dat de batterij buiten de dure kwartieren niet ontlaadt. Staat de gewone periode op Self-consumption, dan klopt de berekening niet.

**Stap 2 — Bestanden plaatsen**

Download de zip van de nieuwste versie: rechts op deze pagina bij **Releases**, dan **Source code (zip)**. Pak hem uit. Daarin staan alle bestanden, ook de map met de iconen.

| Uit de zip | Naar Home Assistant |
|---|---|
| `packages/batterijplan.yaml` | `/config/packages/batterijplan.yaml` |
| `www/batterijplan/` (de iconen) | `/config/www/batterijplan/` |

Gebruik je nog geen packages? Voeg dan dit toe aan `configuration.yaml`:

```yaml
homeassistant:
  packages: !include_dir_named packages
```

**Stap 3 — Herstarten**

Ga naar *Ontwikkelhulpmiddelen → YAML*, kies **Configuratie controleren** en herstart Home Assistant. (Bij de eerste keer is herstarten nodig; de map `www` wordt alleen bij het opstarten gezien.)

**Stap 4 — Dashboard toevoegen**

1. *Instellingen → Dashboards → Dashboard toevoegen → Nieuw dashboard vanaf nul*, naam bijvoorbeeld "Batterijplan".
2. Open het dashboard, kies rechtsboven ✏️ (bewerken), dan ⋮ → **Raw-configuratie-editor**.
3. Plak de inhoud van `dashboards/batterijplan-dashboard.yaml` en sla op.

**Stap 5 — Instellingen invullen**

Na de herstart staan de instellingen op hun minimum. Vul ze in op het dashboard, kaart **Instellingen** (onder die kaart staat per instelling een korte uitleg):

| Instelling | Wat vul je in | Voorbeeld |
|---|---|---|
| Ingangsdatum energiecontract | de dag waarop je contractjaar begint (het jaartal maakt niet uit) | 9 december |
| Bruikbare capaciteit batterijen | wat je batterijen samen écht kunnen leveren, boven de ondergrens in HBC | 2 × 5,12 kWh met 12 % ondergrens ≈ 9,0 kWh |
| Veiligheidsmarge | lading die het plan nooit inrekent | 0,3 kWh |
| Rendement laden + ontladen | hoeveel % van de geladen stroom er weer uitkomt | 75 % |
| Energiebelasting + inkoop (excl. btw) | wat je per kWh bóvenop de kale beursprijs betaalt: energiebelasting (2026: € 0,09161) plus de inkoopvergoeding van je leverancier (staat op je contract) | 0,09161 + 0,0165 = 0,1081 |
| Sensor netvermogen | jouw sensor in W, afname = +, teruglevering = − | `sensor.p1_vermogen` |
| Sensor zonnevermogen | wat al je zonnepanelen samen **nu** opwekken, in W (dus niet de dagopbrengst) | `sensor.zon_totaal` |
| Sensor batterijvermogen | totaal van al je batterijen in W, ontladen = + | bij HBC meestal `sensor.house_total_battery_power` |
| Sensor laadpaal (optioneel) | laadvermogen van je auto-lader in W | mag leeg blijven |

Heb je meerdere omvormers en geen sensor met het totaal? Maak dan een helper: *Instellingen → Apparaten en diensten → Helpers → Helper aanmaken → Combineer de status van meerdere sensoren*, type **Som**.

De energiebelasting en inkoop worden alleen gebruikt voor het advies over 's nachts laden.

> Zolang de bruikbare capaciteit niet is ingevuld, zegt het plan "Niet ingesteld" en doet het niets.

Controle: op de kaart Sensoren staat **Huisverbruik nu**. Dat moet ongeveer kloppen met wat je huis echt gebruikt. Hij is nooit negatief.

**Back-up maken.** Alles ingevuld? Druk op **Back-up maken**. Na een herinstallatie of een vergissing zet **Back-up terugzetten** alles terug. De back-up blijft bewaard bij een herstart en bij een nieuwe versie.

**Standaardwaarden.** Deze knop zet de veiligheidsmarge en het rendement terug op 0,3 kWh en 75 %. Er wordt eerst een back-up gemaakt, dus je kunt het ongedaan maken.

**Inklappen.** Zet daarna de schakelaar **Instellingen** uit. De waarden, de sensoren en de uitleg verdwijnen dan. Zolang er iets ontbreekt, blijven ze vanzelf staan.

**Stap 6 — Recorder (alleen als je een include-lijst gebruikt)**

Gebruik je in de recorder een `include`-lijst, voeg dan deze vier toe, anders blijven de grafieken leeg:

```yaml
recorder:
  include:
    entities:
      - sensor.batterijplan
      - sensor.batterijplan_meerwaarde
      - input_select.house_battery_strategy_dynamic_expensive
      - input_boolean.batterijplan_live
```

---

## 4. De eerste 14 dagen: kijken en leren

Batterijplan begint in **schaduwmodus**: het rekent en laat zien wat het zou doen, maar het verandert niets aan HBC.

In die tijd leert het je huisverbruik per uur van de dag. Je ziet de voortgang op het dashboard bij "Verbruik leren":

| Status | Na | Betekenis |
|---|---|---|
| aan het leren | 0–6 dagen | Na de eerste dag doet het al mee, maar het is nog onrustig. |
| grof | 7–13 dagen | Bruikbaar, maar één rare dag weegt nog zwaar. |
| prima | 14+ dagen | Goed ingeregeld. Daarna leert het glijdend door: oude dagen doven langzaam uit, zodat het met de seizoenen meegaat. |

**Wat je in deze tijd doet:** kijk af en toe naar de kaart "Plan":
- Als het plan "Vasthouden" zegt: was er later op de dag inderdaad een duurder moment?
- Als het plan "Ontladen" zegt: was de batterij aan het eind van de dure periode bijna leeg, en niet al veel eerder?

Klopt dat? Dan kun je live gaan.

---

## 5. Live zetten

Zet op het dashboard **Live (stuurt HBC)** aan. Vanaf dat moment:

- Rekent het plan ± 45 seconden vóór elk kwartier (HBC leest zijn instellingen per kwartier).
- Moet de batterij in het komende dure kwartier **vasthouden**, dan zet het plan de HBC-stand voor dure kwartieren op *Standby / peak shave*. De batterij staat dan stil.
- Moet de batterij **ontladen**, dan zet het plan die stand terug op *Self-consumption*.
- Elke wijziging komt in het logboek van Home Assistant, onder de naam "Batterijplan".

Schakelaar weer **uit**? Dan zet Batterijplan de stand voor dure kwartieren direct terug op *Self-consumption*, en is HBC weer helemaal zoals voorheen.

> Batterijplan doet niets als HBC **niet** op Dynamic staat. Zet iets of iemand HBC tijdelijk op een andere strategie (bijvoorbeeld een andere automatisering bij een negatieve prijs, of jij handmatig), dan wacht Batterijplan tot HBC weer op Dynamic staat. Kan het de lading van de batterijen niet bepalen, dan zegt het "Geen batterijdata" en houdt het ook niets vast.

---

## 6. Het dashboard

| Kaart | Wat je ziet |
|---|---|
| **Badges bovenaan** | *Bespaard totaal* (sinds de start), *Deze energieperiode* (vanaf de ingangsdatum van je contract; elk contractjaar begint opnieuw) en *Trefzekerheid*: hoe goed het geleerde verbruik het echte verbruik voorspelt. |
| **Batterijplan** | Versie, modus (schaduw of live), hoe ver het leren is, of HBC op Dynamic staat, en het besluit voor het komende kwartier. |
| **Plan tot …** | Tot wanneer het plan vooruitkijkt, de beschikbare lading, welke dure kwartieren ontladen (groen = nu bezig) en welke vasthouden (oranje = nu bezig), het tekort, de verwachte meerwaarde en het advies over 's nachts laden. |
| **Wat levert het op** | De geschatte opbrengst bovenop HBC sinds de start, apart voor schaduw (zou opleveren) en live (echt gestuurd), en hoeveel lading er naar duurdere momenten is verschoven. |
| **Grafiek met datumkiezer** | De opbrengst als staafjes. Met ‹ › blader je terug en vooruit; via ⋮ kies je dag, week, maand of jaar. |
| **Plan komende uren** | Een balk met één streepje per kwartier tot het volgende goedkope moment, met begin- en eindtijd, en daaronder dezelfde periode in blokken. Vaste kleuren: groen = ontladen, oranje = vasthouden (hier stuurt Batterijplan bij), blauw = zon laden, leigrijs = rust (geen zon), grijs = laden van het net. |
| **Instellingen** | Knoppen *Back-up maken*, *Back-up terugzetten* en *Standaardwaarden*, met de datum van de laatste back-up. De schakelaars *Live* en *Instellingen*. Staat *Instellingen* aan, dan zie je de waarden, de sensoren (met een controle van het huisverbruik) en de uitleg. |

**Trefzekerheid:** elk kwartier legt Batterijplan de voorspelling uit het geleerde profiel naast het echte verbruik. Het cijfer is 100 % min de gemiddelde afwijking (als deel van het gemiddelde verbruik), glijdend over de laatste 14 dagen. Tijdens de eerste 14 dagen staat er ook hoeveel dagen al geleerd zijn, en is de badge grijs (licht → donker). Daarna wordt hij groen: hoe donkerder, hoe beter; donker groen boven 90 %.

**Hoe de opbrengst wordt geschat:** het plan rekent elke periode twee keer door. Eén keer zoals HBC het alleen zou doen (elk duur kwartier op volgorde ontladen tot de batterij leeg is), en één keer met het plan. Het verschil in prijs maal kWh, inclusief btw, is de meerwaarde. Het blijft een schatting, omdat de werkelijkheid afhangt van hoe goed verbruik en zon voorspeld zijn.

---

## 7. Onderhoud

| Wanneer | Wat doen |
|---|---|
| **Eens per maand** | Kijk of "Vasthouden" en "Ontladen" nog logisch zijn. Blijft de batterij vaak ruim vol na de dure periode? Verlaag dan de veiligheidsmarge. Raakt hij vaak te vroeg leeg? Verhoog de marge, of controleer de capaciteit. |
| **Nieuw energiecontract** | Pas *Energiebelasting + inkoop* en de *ingangsdatum* aan. |
| **Batterij erbij of eraf, of minder capaciteit door slijtage** | Pas de *bruikbare capaciteit* aan. |
| **Grote verandering in verbruik** (warmtepomp, nieuw apparaat) | Niets doen: het profiel past zich binnen ± 14 dagen vanzelf aan. |
| **HBC-update** | Controleer dat `sensor.hbc_energy_prices_data` nog bestaat en dat de gewone periode nog op Charge PV staat. |
| **Andere sensoren** (nieuwe P1-meter, omvormer) | Zet de schakelaar *Instellingen* aan en pas de sensornamen aan. Maak daarna een nieuwe back-up. |
| **Nieuwe versie van Batterijplan** | Maak eerst een back-up. Vervang `packages/batterijplan.yaml`, plak het nieuwe dashboard in de Raw-configuratie-editor en herstart. Je instellingen, het geleerde verbruik en de teller blijven bewaard; mist er toch iets, druk dan op *Back-up terugzetten*. |

**Tijdelijk uitzetten:** *Live* uit. Het plan blijft dan rekenen en leren.

**Helemaal verwijderen:**
1. Zet *Live* uit, zodat HBC terug op Self-consumption gaat.
2. Verwijder `packages/batterijplan.yaml`, de map `www/batterijplan/` en het dashboard.
3. Herstart Home Assistant.

---

## 8. Wat het (nog) niet doet

- **Zelf extra laden 's nachts:** dat wordt alleen uitgerekend en getoond.
- **Overdag ontladen als de zon de batterij later toch weer vult:** in de gewone periode houdt HBC (Charge PV) de lading vast.
- **Een goedkope middag die HBC niet als goedkoop markeert** (door de grens van uren per dag of het minimale prijsverschil in HBC) telt niet als bijladen.
- **Verschil tussen werkdag en weekend** in het verbruik.
- **Terugleveren aan het net** voor geld (Sell): Batterijplan is gericht op eigen verbruik.

---

## 9. Vragen

**Werkt het zonder zonnepanelen?**
Ja. Het plan rekent dan met 0 zon en verdeelt alleen de lading uit goedkope kwartieren.

**Werkt het met andere batterijen dan Marstek?**
Ja, als HBC ze aanstuurt. Batterijplan praat alleen met HBC, niet met de batterij zelf.

**Kan het mijn batterij beschadigen?**
Nee. Batterijplan kiest alleen tussen twee standen die HBC zelf aanbiedt (Self-consumption en Standby). Alle beveiligingen blijven bij HBC en de batterij.

**Waarom staat de batterij soms stil terwijl het duur is?**
Dan komt er later een nog duurder moment waar de lading meer oplevert. Op de kaart "Plan" zie je bij "Ontladen" welke kwartieren dat zijn.

**Hoeveel levert het op?**
Dat hangt af van je prijzen, je verbruik en de grootte van je batterij. Het verschil zit op dagen waarop de batterij niet genoeg heeft voor álle dure kwartieren. Op die dagen gaat de lading naar de duurste momenten in plaats van naar de eerste. De kaart "Wat levert het op" houdt het voor je bij.

---

## Licentie

- **Code** (pakket en dashboard): GPL-3.0-or-later, zie `LICENSE`.
- **Iconen** (`www/batterijplan/`): eigen huisstijl van SatScan, zie `www/batterijplan/LICENSE-ICONEN.md`.

Batterijplan is een losse aanvulling op [Home Battery Control](https://github.com/gitcodebob/marstek-venus-rs485-node-red) en wordt niet door de makers van HBC onderhouden.
