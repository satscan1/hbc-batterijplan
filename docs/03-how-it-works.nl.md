# 03 · Hoe het werkt

*English: [03-how-it-works.md](03-how-it-works.md) · Deutsch: [03-how-it-works.de.md](03-how-it-works.de.md)*

**In het kort**
- HBC zegt per kwartier: goedkoop, duur of gewoon. Batterijplan kijkt vooruit (maximaal 36 uur) en rekent uit waar hij het beter kan doen dan HBC alleen.
- Batterijplan kiest alleen tussen standen die HBC zelf aanbiedt. Alle beveiligingen blijven bij HBC en de batterij.
- Alles wat Batterijplan doet, komt in het logboek van Home Assistant onder de naam "Batterijplan".

## Het probleem dat Batterijplan oplost

HBC (strategie **Dynamic**) geeft elk kwartier een label:
- **goedkoop**: laden van het net;
- **duur**: ontladen voor het huis;
- **gewoon**: alleen laden van de zon.

Dat werkt goed, maar HBC kijkt niet verder dan het label van het kwartier waarin hij zit. Gevolg: de batterij is leeg op een duur moment van 27 ct, terwijl er een uur later een moment van 50 ct komt. Of hij is niet geladen voor een avondpiek die HBC niet als duur markeert.

## Het plan

Batterijplan rekent twee keer, over alle kwartieren waarvan hij de prijs kent:
1. **HBC alleen**: goedkoop → laden van het net, duur → ontladen, anders alleen de zon.
2. **Batterijplan**: hetzelfde, plus de vier regels hieronder.

Het verschil tussen die twee, in euro, is de **verwachte besparing** op het dashboard.

Hij houdt rekening met:
- hoeveel lading er nu in de batterijen zit (het laadpercentage boven de ondergrens van HBC, maal de bruikbare capaciteit, min je veiligheidsmarge);
- hoeveel je huis op dat uur van de dag meestal verbruikt (dat leert hij zelf);
- hoeveel zon er verwacht wordt (Solcast, de voorzichtige schatting voor de berekening; de grafiek toont de middenschatting, zoals HBC);
- de prijzen per kwartier, zoals HBC ze geeft, en jouw kosten (zie [de kosten](#de-kosten)).

Hij rekent elk kwartier, vlak voordat het begint (op :14:30, :29:30, :44:30 en :59:30), en ook als de prijzen veranderen of HBC van strategie wisselt.

### De drempel

Batterijplan gebruikt één drempel: de HBC-instelling **Dynamic threshold delta** (in ct). Dat is het prijsverschil vanaf waar HBC zelf zegt "dit loont". Hij moet ook het verlies in de batterij dekken, dus Batterijplan heeft geen eigen rendement-instelling en geen vaste grens.

Een kwartier telt als **duur** als HBC het duur markeert, **of** als de prijs minstens de drempel boven het goedkoopste kwartier ervoor ligt.

## De regels

Elke regel heeft een eigen schakelaar (op het dashboard onder *Instellingen*, tabblad **Regels**, en in de briefing). Alle vier staan standaard aan. Zet je een regel uit, dan doet het plan op die momenten wat HBC alleen doet.

| Regel | Wat hij doet, in gewone taal |
|---|---|
| **Laden van het net** | In een kwartier dat niet duur is, laadt Batterijplan extra van het net als de batterij anders te leeg zou zijn voor latere dure kwartieren die minstens de drempel duurder zijn dan nu. Hij stopt zodra er een goedkoper kwartier komt. |
| **Ontladen buiten HBC-uren** | Een kwartier dat HBC niet duur noemt, maar dat minstens de drempel boven het goedkoopste kwartier ervoor ligt, telt ook als duur. De batterij ontlaadt dan daar. |
| **Vasthouden** | In een duur kwartier ontlaadt de batterij niet als die lading nodig is voor latere kwartieren die minstens de drempel duurder zijn, voordat er een kwartier komt dat minstens de drempel goedkoper is. De lading blijft bewaard voor later. |
| **Terugleveren** | Zit er zeker een overschot in de batterij (nadat is aangehouden wat je zelf later nodig hebt), dan levert Batterijplan het terug aan het net in een kwartier waarin de terugleverprijs minstens de drempel boven de goedkoopste inkoopprijs ligt. |

Zit er zon of een goedkoop moment tussen twee pieken? Dan telt Batterijplan dat als bijladen en mag de eerste piek gewoon ontladen.

De vijf letters in het plan: **L** laden van het net, **O** ontladen, **H** vasthouden, **Z** alleen de zon, **V** terugleveren.

> De oude regels (overschot ontladen, bijladen als nodig, de vaste grens van € 0,10) en de instelling *rendement* zijn uit deze versie. De drempel van HBC vervangt ze.

## De kosten

Batterijplan rekent zonder salderen, dus inkoop en teruglevering hebben elk hun eigen prijs:
- **Inkoop**: (beursprijs + opslag) × (1 + btw). Bij *all-in* prijzen: de prijs zoals HBC hem geeft.
- **Teruglevering**: beursprijs + toeslag. Overdag (als er zon is, of tussen de uren die je instelt) krijgt een positieve prijs het bonuspercentage erbovenop.
- Lading die aan het eind van het plan nog in de batterij zit, telt tegen de laagste inkoopprijs in het plan.

De opslag, de btw, de toeslag en de bonus zijn instellingen, geen vaste getallen. Een leverancier als Zonneplan heeft bijvoorbeeld een *opslag* in de inkoopprijs en een *terugleververgoeding* voor teruglevering; vul in wat jouw eigen contract zegt. Zie [01 · Installatie](01-installation.nl.md#expert-instellingen).

## Wat Batterijplan in HBC stuurt

Batterijplan verandert niets in HBC zolang **Live** uit staat. Met **Live** aan, en alleen als HBC op **Dynamic** staat, zet hij na elke berekening één van de drie Dynamic-standen van HBC: die bij de prijsklasse van het komende kwartier, zoals HBC het zelf labelt. HBC leest die per kwartier.

| Prijsklasse (volgens HBC) | Plan: vasthouden | Plan: terugleveren | Plan: laden van het net | Anders |
|---|---|---|---|---|
| **Duur** (*dynamic expensive*) | Standby / peak shave | Sell | — | Self-consumption |
| **Goedkoop** (*dynamic cheapest*) | Standby / peak shave | — | Charge | Charge PV |
| **Gewoon** (*dynamic default*) | Standby / peak shave | Self-consumption | — | Charge PV (ontladen: Self-consumption) |

HBC kent geen *Charge* in de gewone klasse, dus in een gewoon kwartier kan Batterijplan in die stand niet zelf van het net laden. Hij verandert een stand alleen als die anders is. Elke wijziging komt in het logboek.

### Jouw eigen HBC-standen

Batterijplan onthoudt je drie standen (duur, gewoon, goedkoop):
- op het moment dat je *Live* aanzet;
- en elke keer dat je ze verandert terwijl *Live* uit staat.

Hij zet ze terug als *Live* uitgaat of als HBC Dynamic verlaat. Nog niets onthouden? Dan zet hij *Self-consumption*, *Charge PV* en *Charge* terug.

### Als HBC niet op Dynamic staat

Kies jij (of een automatisering, bijvoorbeeld bij een negatieve prijs) een andere strategie in HBC, dan:
- stuurt Batterijplan niets en telt de teller niets op;
- zet Batterijplan, als *Live* aan stond, de drie standen terug naar je eigen standen;
- gaat het leren gewoon door.

Zodra HBC weer op Dynamic staat, rekent het plan direct opnieuw en stuurt het weer bij.

## Live zetten

Zet op het dashboard **Live** aan (de schakelaar `switch.batterijplan_live`). Vanaf dat moment past Batterijplan elk kwartier de Dynamic-standen van HBC aan zoals in de tabel hierboven.

**Live weer uit?** Dan zet Batterijplan de standen direct terug naar je eigen standen. HBC staat dan helemaal zoals voorheen.

**Live en schaduw.** Met *Live* uit rekent Batterijplan nog steeds, leert hij en telt hij wat hij zou hebben opgeleverd, maar apart als *schaduw*. De sensor `sensor.batterijplan` toont `modus`: *live* of *schaduw*.

## Leren

Batterijplan meet het huisverbruik per kwartier (net + zon + batterij, min de laadpaal) en bouwt een profiel voor elk uur van de dag. Hij leert over **7 dagen**:

| Status | Na | Betekenis |
|---|---|---|
| aan het leren | 0–3 dagen | Na de eerste dag doet hij al mee, maar hij is nog onrustig. |
| grof | 4–6 dagen | Bruikbaar, maar één vreemde dag weegt nog zwaar. |
| prima | 7+ dagen | Goed afgesteld. Daarna blijft hij meeleren: oude dagen vervagen langzaam, dus hij beweegt mee met de seizoenen. |

Waarom 7 dagen? Een proef met 89 dagen echte meetdata liet zien dat een kort geheugen het verbruik iets beter voorspelt dan een lang geheugen.

De **voorspelling** vergelijkt het verwachte verbruik met het echte verbruik, per blok van 3 uur (00–03, 03–06 enzovoort). Eén kwartier is te grillig om te voorspellen; een blok van 3 uur is wat echt telt voor het plan. Je ziet een oordeel: *wisselvallig* (onder 55 %), *redelijk* (vanaf 55 %), *goed* (vanaf 65 %), *zeer goed* (vanaf 75 %) of *uitstekend* (vanaf 85 %). Het percentage zelf staat in de sensor `sensor.batterijplan_voorspelling` (attribuut *betrouwbaarheid*), voortschrijdend over de laatste 7 dagen.

Het leren gaat altijd door, ook in schaduwmodus en ook als HBC niet op Dynamic staat.

## De teller: meerwaarde

De sensor `sensor.batterijplan_meerwaarde` telt wat Batterijplan bovenop HBC alleen oplevert. Elk kwartier wordt achteraf afgerekend:

(de kosten van HBC alleen in dat kwartier − de kosten van het plan in dat kwartier) + (lading plan − lading HBC alleen aan het eind van dat kwartier) × de laagste inkoopprijs in het plan.

Hij telt alleen als **Live** aan staat en HBC op **Dynamic** staat. Anders gaat het kwartier naar het totaal *schaduw*. De tweede sensor, `sensor.batterijplan_meerwaarde_periode`, telt per **contractjaar**: hij begint opnieuw op de dag en maand van je ingangsdatum.

**Het is een schatting** ("geschat"). Hij rust op de prijzen en het verbruik die Batterijplan op dat moment verwachtte. Je energierekening is het echte bewijs.

## Wat het (nog) niet doet

- **Een goedkope middag die HBC niet als goedkoop markeert** (door de grens op uren per dag of het minimale prijsverschil in HBC) telt niet als bijladen.
- **Verschil tussen weekdagen en weekend** in verbruik.
- **De batterij van het net laden in een gewoon kwartier in HBC-stand *Charge PV*:** daar biedt HBC geen stand voor (zie [de tabel](#wat-batterijplan-in-hbc-stuurt)).
